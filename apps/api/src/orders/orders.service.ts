import { Prisma, UserRole, OrderStatus, PaymentStatus } from "@prisma/client";
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

export interface CreateOrderDto {
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  addressSnapshot?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'COD' | 'RAZORPAY' | 'STRIPE';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status?: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  deliverySpeed?: 'STANDARD' | 'EXPRESS';
  couponCode?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price?: number;
  }[];
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async calculateOrderTotals(dto: CreateOrderDto) {
    let settings = await this.prisma.storeSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = {
        id: 'singleton',
        flatShippingFee: new Prisma.Decimal(0),
        freeShippingThreshold: new Prisma.Decimal(1999),
        taxPercent: new Prisma.Decimal(18),
        razorpayEnabled: true,
        codEnabled: true,
        updatedAt: new Date(),
      };
    }

    if (dto.paymentMethod === 'COD' && !settings.codEnabled) {
      throw new BadRequestException('Cash on Delivery is currently disabled.');
    }
    if (dto.paymentMethod === 'RAZORPAY' && !settings.razorpayEnabled) {
      throw new BadRequestException('Razorpay online payments are currently disabled.');
    }

    const productIds = dto.items.map((i) => i.productId);
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { collections: true, variants: true },
    });

    for (const item of dto.items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Product #${item.productId} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient inventory for ${product.name}. Only ${product.stock} left.`);
      }
    }

    const subtotal = dto.items.reduce((acc, item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) return acc;
      let unitPrice = Number(product.price);
      if (item.variantId && product.variants) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (variant && variant.priceDelta) {
          unitPrice += Number(variant.priceDelta);
        }
      }
      return acc + unitPrice * item.quantity;
    }, 0);

    const freeThreshold = settings.freeShippingThreshold ? Number(settings.freeShippingThreshold) : 1999;
    const flatFee = Number(settings.flatShippingFee);
    const shippingFee = dto.deliverySpeed === 'EXPRESS' ? 250 : subtotal >= freeThreshold ? 0 : (flatFee || 99);

    let bestDiscount = 0;
    let appliedCouponCode: string | null = null;
    const now = new Date();

    if (dto.couponCode) {
      const codeCoupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.trim().toUpperCase() },
      });
      if (
        codeCoupon &&
        codeCoupon.isActive &&
        (!codeCoupon.startsAt || codeCoupon.startsAt <= now) &&
        (!codeCoupon.expiresAt || codeCoupon.expiresAt >= now) &&
        (!codeCoupon.minOrderValue || subtotal >= Number(codeCoupon.minOrderValue))
      ) {
        const codeDiscount =
          codeCoupon.discountType === 'PERCENTAGE'
            ? (subtotal * Number(codeCoupon.discountValue)) / 100
            : Number(codeCoupon.discountValue);
        if (codeDiscount > bestDiscount) {
          bestDiscount = codeDiscount;
          appliedCouponCode = codeCoupon.code;
        }
      }
    }

    const activeCollectionCoupons = await this.prisma.coupon.findMany({
      where: {
        appliesToCollectionId: { not: null },
        isActive: true,
        OR: [
          { startsAt: null, expiresAt: null },
          { startsAt: { lte: now }, expiresAt: { gte: now } },
          { startsAt: { lte: now }, expiresAt: null },
        ],
      },
    });

    for (const autoCoupon of activeCollectionCoupons) {
      const collectionItemSubtotal = dto.items.reduce((acc, item) => {
        const product = dbProducts.find((p) => p.id === item.productId);
        const belongsToCollection = product?.collections.some((c) => c.id === autoCoupon.appliesToCollectionId);
        if (!belongsToCollection) return acc;
        const unitPrice = Number(product!.price);
        return acc + unitPrice * item.quantity;
      }, 0);

      if (collectionItemSubtotal > 0) {
        const autoDiscount =
          autoCoupon.discountType === 'PERCENTAGE'
            ? (collectionItemSubtotal * Number(autoCoupon.discountValue)) / 100
            : Number(autoCoupon.discountValue);
        if (autoDiscount > bestDiscount) {
          bestDiscount = autoDiscount;
          appliedCouponCode = autoCoupon.code || `[Collection Sale: ${autoCoupon.appliesToCollectionId}]`;
        }
      }
    }

    const discountAmount = Math.min(bestDiscount, subtotal);
    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    const addr: any = dto.shippingAddress || dto.addressSnapshot || {};
    const addressSnapshot = {
      fullName: addr.fullName || addr.name || 'Valued Collector',
      street: addr.street || addr.addressLine1 || 'Main St',
      city: addr.city || 'Mumbai',
      state: addr.state || 'Maharashtra',
      postalCode: addr.postalCode || '400001',
      country: addr.country || 'India',
      phone: addr.phone || '',
    };

    return {
      dbProducts,
      subtotal,
      shippingFee,
      discountAmount,
      appliedCouponCode,
      total,
      addressSnapshot,
    };
  }

  async createOrderInsideTx(
    tx: any,
    dto: CreateOrderDto,
    status: OrderStatus = OrderStatus.PLACED,
    paymentStatus: PaymentStatus = PaymentStatus.PENDING,
  ) {
    const {
      dbProducts,
      subtotal,
      shippingFee,
      discountAmount,
      appliedCouponCode,
      total,
      addressSnapshot,
    } = await this.calculateOrderTotals(dto);

    // Decrement stock inside transaction
    for (const item of dto.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    const order = await tx.order.create({
      data: {
        userId: dto.userId || null,
        guestEmail: dto.guestEmail || null,
        guestPhone: dto.guestPhone || null,
        addressSnapshot,
        paymentMethod: dto.paymentMethod,
        paymentStatus,
        status,
        deliverySpeed: dto.deliverySpeed || 'STANDARD',
        subtotal,
        shippingFee,
        discountAmount,
        couponCode: appliedCouponCode,
        total,
        razorpayOrderId: dto.razorpayOrderId || null,
        razorpayPaymentId: dto.razorpayPaymentId || null,
        items: {
          create: dto.items.map((item) => {
            const product = dbProducts.find((p) => p.id === item.productId);
            let unitPrice = product ? Number(product.price) : 0;
            if (item.variantId && product?.variants) {
              const variant = (product.variants as any[]).find((v) => v.id === item.variantId);
              if (variant?.priceDelta) unitPrice += Number(variant.priceDelta);
            }
            return {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              priceAtPurchase: unitPrice,
            };
          }),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return order;
  }

  async create(dto: CreateOrderDto) {
    if (!dto.userId && !dto.guestEmail) {
      throw new BadRequestException('Order requires either a user ID or guest email.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order items cannot be empty.');
    }

    for (const item of dto.items) {
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new BadRequestException('Item quantities must be positive integers.');
      }
      if (item.quantity > 100) {
        throw new BadRequestException('Maximum quantity per item is 100.');
      }
    }

    const initialPaymentStatus = dto.paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PAID;
    const initialOrderStatus = dto.paymentMethod === 'COD' ? OrderStatus.PLACED : OrderStatus.CONFIRMED;

    const order = await this.prisma.$transaction(async (tx) => {
      return this.createOrderInsideTx(tx, dto, initialOrderStatus, initialPaymentStatus);
    });

    this.mailService.sendOrderConfirmation(order.id).catch((err) => {
      console.error('Failed to dispatch order confirmation email:', err);
    });

    return order;
  }

  /**
   * Fast-path verification called by browser after Razorpay payment popup succeeds.
   * Ensures idempotency: if webhook arrived first and already marked order PAID and decremented stock,
   * stock will NOT be decremented again.
   */
  async verifyAndConfirmOrder(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    orderDto: CreateOrderDto,
  ) {
    const order = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { razorpayOrderId },
        include: { items: true },
      });

      if (existing) {
        if (existing.paymentStatus === PaymentStatus.PAID) {
          // Already confirmed by webhook; do not decrement stock again!
          return existing;
        }

        // Exists in pending state; decrement stock now and mark PAID
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        return tx.order.update({
          where: { id: existing.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
            razorpayPaymentId,
          },
          include: { items: { include: { product: true } } },
        });
      }

      // Order does not exist in DB yet; create, confirm, and decrement stock inside transaction
      return this.createOrderInsideTx(
        tx,
        {
          ...orderDto,
          razorpayOrderId,
          razorpayPaymentId,
        },
        OrderStatus.CONFIRMED,
        PaymentStatus.PAID,
      );
    });

    this.mailService.sendOrderConfirmation(order.id).catch((err) => {
      console.error('Failed to dispatch order confirmation email:', err);
    });

    return order;
  }

  /**
   * Handles payment.captured webhook event.
   * Idempotent: decrements stock only if the order was not already marked PAID.
   */
  async confirmRazorpayPayment(razorpayOrderId: string, razorpayPaymentId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { razorpayOrderId },
        include: { items: true },
      });

      if (!order) {
        return { received: true, message: `Order #${razorpayOrderId} not found.` };
      }

      // Idempotency: if already paid, do NOT decrement stock again!
      if (order.paymentStatus === PaymentStatus.PAID) {
        if (razorpayPaymentId && !order.razorpayPaymentId) {
          await tx.order.update({
            where: { id: order.id },
            data: { razorpayPaymentId },
          });
        }
        return { received: true, idempotent: true, orderId: order.id, status: 'ALREADY_PAID' };
      }

      // Decrement inventory stock exactly once
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        },
        include: { items: true },
      });

      this.mailService.sendOrderConfirmation(order.id).catch((err) => {
        console.error('Failed to dispatch order confirmation email:', err);
      });

      return updated;
    });
  }

  /**
   * Handles payment.failed webhook event.
   * Sets paymentStatus to FAILED; does NOT touch inventory stock.
   */
  async failRazorpayPayment(razorpayOrderId: string, razorpayPaymentId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { razorpayOrderId },
    });

    if (!order) {
      return { received: true, message: `Order #${razorpayOrderId} not found.` };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return { received: true, ignored: true, reason: 'Order already completed and paid.' };
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      },
    });
  }

  /**
   * Entry point for incoming Razorpay Webhooks.
   */
  async handleRazorpayWebhook(payload: any) {
    const event = payload?.event;
    const payment = payload?.payload?.payment?.entity;
    const razorpayPaymentId = payment?.id;
    const razorpayOrderId = payment?.order_id;

    if (!razorpayOrderId) {
      return { received: true, ignored: true, reason: 'Missing order_id' };
    }

    if (event === 'payment.captured') {
      return this.confirmRazorpayPayment(razorpayOrderId, razorpayPaymentId);
    }

    if (event === 'payment.failed') {
      return this.failRazorpayPayment(razorpayOrderId, razorpayPaymentId);
    }

    return { received: true, event };
  }

  /**
   * Secure Order Lookup for GET /orders/:id
   * Returns order ONLY to:
   * 1. The logged-in owner
   * 2. Staff (SUPPORT, MANAGER, OWNER)
   * 3. A caller providing the matching guest email (or customer email)
   * Otherwise throws 404 NotFoundException to prevent order ID enumeration.
   */
  async findOneSecure(
    id: string,
    authUser: { id: string; role: UserRole; email: string } | null,
    suppliedEmail?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found.`);
    }

    // 1. Staff access check (SUPPORT, MANAGER, OWNER)
    if (
      authUser &&
      (authUser.role === UserRole.SUPPORT ||
        authUser.role === UserRole.MANAGER ||
        authUser.role === UserRole.OWNER)
    ) {
      return order;
    }

    // 2. Logged-in owner check
    if (authUser && order.userId && order.userId === authUser.id) {
      return order;
    }

    // 3. Matching guest email check
    if (suppliedEmail) {
      const normSupplied = suppliedEmail.toLowerCase().trim();
      const guestMatch = order.guestEmail && order.guestEmail.toLowerCase().trim() === normSupplied;
      const userMatch = order.user?.email && order.user.email.toLowerCase().trim() === normSupplied;
      if (guestMatch || userMatch) {
        return order;
      }
    }

    // Fallback: 404 (do not leak existence to unauthorized callers)
    throw new NotFoundException(`Order #${id} not found.`);
  }

  async trackOrder(id: string, email: string) {
    if (!id || !email) {
      throw new BadRequestException('Both order ID and email are required for tracking.');
    }

    const normEmail = email.toLowerCase().trim();
    const order = await this.prisma.order.findFirst({
      where: {
        id: id.trim(),
        OR: [
          { guestEmail: { equals: normEmail, mode: 'insensitive' } },
          { user: { email: { equals: normEmail, mode: 'insensitive' } } },
        ],
      },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} with matching email was not found.`);
    }

    return order;
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found.`);
    }

    return order;
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
      },
    });
  }
}
