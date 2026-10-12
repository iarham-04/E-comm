import { Prisma } from "@prisma/client";
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  deliverySpeed?: 'STANDARD' | 'EXPRESS';
  couponCode?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }[];
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateOrderDto) {
    if (!dto.userId && !dto.guestEmail) {
      throw new BadRequestException('Order requires either a user ID or guest email.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order items cannot be empty.');
    }

    // Validate item quantities
    for (const item of dto.items) {
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new BadRequestException('Item quantities must be positive integers.');
      }
      if (item.quantity > 100) {
        throw new BadRequestException('Maximum quantity per item is 100.');
      }
    }

    // 1. Fetch Store Settings singleton
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

    // Check payment method status
    if (dto.paymentMethod === 'COD' && !settings.codEnabled) {
      throw new BadRequestException('Cash on Delivery is currently disabled.');
    }
    if (dto.paymentMethod === 'RAZORPAY' && !settings.razorpayEnabled) {
      throw new BadRequestException('Razorpay online payments are currently disabled.');
    }

    // 2. Check stock availability & fetch full product collection relations for discount evaluation
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

    // 3. SECURITY FIX: Compute subtotal using SERVER-SIDE prices from the database,
    //    never trust client-supplied prices.
    const subtotal = dto.items.reduce((acc, item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) return acc;

      let unitPrice = Number(product.price);

      // If a variant is specified, add its priceDelta to the base price
      if (item.variantId && product.variants) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (variant && variant.priceDelta) {
          unitPrice += Number(variant.priceDelta);
        }
      }

      return acc + unitPrice * item.quantity;
    }, 0);

    // 4. Shipping computation using StoreSettings
    const freeThreshold = settings.freeShippingThreshold ? Number(settings.freeShippingThreshold) : 1999;
    const flatFee = Number(settings.flatShippingFee);
    const shippingFee = dto.deliverySpeed === 'EXPRESS' ? 250 : subtotal >= freeThreshold ? 0 : (flatFee || 99);

    // 5. Discount Evaluation (Non-stacking rule: Code Coupon vs Automatic Collection Sale)
    let bestDiscount = 0;
    let appliedCouponCode: string | null = null;

    const now = new Date();

    // Check Coupon Code if provided
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

    // Check Automatic Collection-wide Sales
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
      // Find items belonging to this collection
      const collectionItemSubtotal = dto.items.reduce((acc, item) => {
        const product = dbProducts.find((p) => p.id === item.productId);
        const belongsToCollection = product?.collections.some((c) => c.id === autoCoupon.appliesToCollectionId);
        if (!belongsToCollection) return acc;

        // Use server-side price for discount calculation too
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

    // Address Snapshot as JSON
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

    // Transactional Order Creation & Stock Deduction
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const product = dbProducts.find((p) => p.id === item.productId);
        if (!product) continue;

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

      return tx.order.create({
        data: {
          userId: dto.userId || null,
          guestEmail: dto.guestEmail || null,
          guestPhone: dto.guestPhone || null,
          addressSnapshot,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          status: 'PLACED',
          deliverySpeed: dto.deliverySpeed || 'STANDARD',
          subtotal,
          shippingFee,
          discountAmount,
          couponCode: appliedCouponCode,
          total,
          items: {
            create: dto.items.map((item) => {
              // Use server-side price for priceAtPurchase
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
          items: {
            include: { product: true },
          },
        },
      });
    });

    // Trigger order confirmation email asynchronously
    this.mailService.sendOrderConfirmation(order.id).catch((err) => {
      console.error('Failed to dispatch order confirmation email:', err);
    });

    return order;
  }

  async trackOrder(id: string, email: string) {
    if (!id || !email) {
      throw new BadRequestException('Order ID and email are required for tracking.');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id,
        OR: [{ guestEmail: email }, { user: { email } }],
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

  /**
   * Find order by ID — only accessible to the order's owner.
   * Prevents unauthorized access to other users' order data (PII protection).
   */
  async findOneForUser(id: string, userId: string) {
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

    // Verify the requesting user owns this order
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order.');
    }

    return order;
  }

  /**
   * Find order by ID — admin use only (no ownership check).
   */
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
