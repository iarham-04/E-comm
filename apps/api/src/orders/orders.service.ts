import { Prisma, UserRole, OrderStatus, PaymentStatus, Coupon } from '@prisma/client';
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateOrderApiDto } from '../common/dto/api-contract.dto';
import { isStaff } from '../auth/roles.guard';

export type OrderInput = CreateOrderApiDto & { userId?: string };
export type OrderQuote = Awaited<ReturnType<OrdersService['quote']>>;
type Tx = Prisma.TransactionClient;
type StockLine = { productId: string; variantId?: string | null; quantity: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

const PUBLIC_ORDER_INCLUDE = {
  items: { include: { product: { select: { id: true, name: true, slug: true, images: true, price: true } } } },
  user: { select: { id: true, email: true, name: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ─── Pricing ───────────────────────────────────────────────────────────────

  /** Computes authoritative prices, shipping and discount from the database. Never trusts client prices. */
  async quote(dto: OrderInput, db: Tx = this.prisma) {
    const settings = await db.storeSettings.findUnique({ where: { id: 'singleton' } });
    if (dto.paymentMethod === 'COD' && settings && !settings.codEnabled) {
      throw new BadRequestException('Cash on Delivery is currently disabled.');
    }
    if (dto.paymentMethod === 'RAZORPAY' && settings && !settings.razorpayEnabled) {
      throw new BadRequestException('Razorpay online payments are currently disabled.');
    }

    const products = await db.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) }, isActive: true, status: 'PUBLISHED' },
      include: { collections: { select: { id: true } }, variants: true },
    });

    const lines = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product #${item.productId} not found.`);

      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
      if (item.variantId && !variant) {
        throw new BadRequestException(`Variant #${item.variantId} does not belong to ${product.name}.`);
      }
      const available = variant ? Math.min(variant.stock, product.stock) : product.stock;
      if (available < item.quantity) {
        throw new BadRequestException(`Insufficient inventory for ${product.name}. Only ${available} left.`);
      }

      const unitPrice = round2(Number(product.price) + Number(variant?.priceDelta ?? 0));
      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        collectionIds: product.collections.map((c) => c.id),
      };
    });

    const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    const freeThreshold = settings?.freeShippingThreshold != null ? Number(settings.freeShippingThreshold) : 1999;
    const flatFee = Number(settings?.flatShippingFee ?? 0) || 99;
    const shippingFee = dto.deliverySpeed === 'EXPRESS' ? 250 : subtotal >= freeThreshold ? 0 : flatFee;

    // Best single discount: the entered code vs. automatic (code-less) collection sales
    const now = new Date();
    const isLive = (c: Coupon) =>
      c.isActive &&
      (!c.startsAt || c.startsAt <= now) &&
      (!c.expiresAt || c.expiresAt >= now) &&
      (c.maxUses == null || c.usedCount < c.maxUses);
    const eligibleBase = (c: Coupon) =>
      c.appliesToCollectionId
        ? lines.filter((l) => l.collectionIds.includes(c.appliesToCollectionId!)).reduce((s, l) => s + l.lineTotal, 0)
        : subtotal;
    const amountOff = (c: Coupon) => {
      const base = eligibleBase(c);
      if (base <= 0 || (c.minOrderValue && subtotal < Number(c.minOrderValue))) return 0;
      const off = c.discountType === 'PERCENTAGE' ? (base * Number(c.discountValue)) / 100 : Number(c.discountValue);
      return Math.min(off, base);
    };

    const [codeCoupon, autoCoupons] = await Promise.all([
      dto.couponCode ? db.coupon.findUnique({ where: { code: dto.couponCode.trim().toUpperCase() } }) : null,
      db.coupon.findMany({ where: { code: null, appliesToCollectionId: { not: null }, isActive: true } }),
    ]);
    if (dto.couponCode && !(codeCoupon && isLive(codeCoupon))) {
      throw new BadRequestException('This coupon code is invalid or has expired.');
    }

    let best: { coupon: Coupon; off: number } | null = null;
    for (const coupon of [codeCoupon, ...autoCoupons]) {
      if (!coupon || !isLive(coupon)) continue;
      const off = amountOff(coupon);
      if (off > (best?.off ?? 0)) best = { coupon, off };
    }

    const discountAmount = round2(Math.min(best?.off ?? 0, subtotal));
    const a = dto.shippingAddress;
    return {
      lines,
      subtotal,
      shippingFee,
      discountAmount,
      coupon: best?.coupon ?? null,
      couponCode: best ? best.coupon.code ?? `[Collection Sale: ${best.coupon.appliesToCollectionId}]` : null,
      total: round2(Math.max(0, subtotal - discountAmount + shippingFee)),
      addressSnapshot: {
        fullName: a.fullName.trim(),
        street: a.street.trim(),
        city: a.city.trim(),
        state: a.state.trim(),
        postalCode: a.postalCode.trim(),
        country: a.country?.trim() || 'India',
        phone: a.phone.trim(),
      },
    };
  }

  private orderData(
    dto: OrderInput,
    q: OrderQuote,
    status: OrderStatus,
    paymentStatus: PaymentStatus,
    razorpayOrderId?: string,
  ): Prisma.OrderUncheckedCreateInput {
    return {
      userId: dto.userId ?? null,
      guestEmail: dto.guestEmail?.trim().toLowerCase() || null,
      guestPhone: dto.guestPhone?.trim() || q.addressSnapshot.phone || null,
      addressSnapshot: q.addressSnapshot,
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      status,
      deliverySpeed: dto.deliverySpeed ?? 'STANDARD',
      subtotal: q.subtotal,
      shippingFee: q.shippingFee,
      discountAmount: q.discountAmount,
      couponCode: q.couponCode,
      total: q.total,
      razorpayOrderId: razorpayOrderId ?? null,
      items: {
        create: q.lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
          priceAtPurchase: l.unitPrice,
        })),
      },
    };
  }

  // ─── Stock & coupon bookkeeping ────────────────────────────────────────────

  /** Atomically reserves stock; fails instead of overselling when two checkouts race. */
  private async reserveStock(tx: Tx, lines: StockLine[]) {
    for (const l of lines) {
      const where = { stock: { gte: l.quantity } };
      const data = { stock: { decrement: l.quantity } };
      const product = await tx.product.updateMany({ where: { id: l.productId, ...where }, data });
      const variant = l.variantId
        ? await tx.productVariant.updateMany({ where: { id: l.variantId, ...where }, data })
        : { count: 1 };
      if (!product.count || !variant.count) {
        throw new BadRequestException('An item in your cart just sold out. Please review your cart.');
      }
    }
  }

  /** Unconditional decrement — used once a payment is already captured and the sale must be recorded. */
  private async deductStock(tx: Tx, lines: StockLine[]) {
    for (const l of lines) {
      await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.quantity } } });
      if (l.variantId) {
        await tx.productVariant.update({ where: { id: l.variantId }, data: { stock: { decrement: l.quantity } } });
      }
    }
  }

  private async countCouponUse(tx: Tx, couponCode: string | null) {
    if (couponCode && !couponCode.startsWith('[')) {
      await tx.coupon.updateMany({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
    }
  }

  private sendConfirmation(orderId: string) {
    this.mailService.sendOrderConfirmation(orderId).catch((err) =>
      this.logger.error(`Failed to dispatch order confirmation email for #${orderId}: ${err?.message}`),
    );
  }

  // ─── Checkout flows ────────────────────────────────────────────────────────

  /** Cash on Delivery: stock is reserved immediately, payment stays PENDING until delivery. */
  async createCodOrder(dto: OrderInput) {
    if (dto.paymentMethod !== 'COD') {
      throw new BadRequestException('Online payments must go through the payment gateway.');
    }
    const order = await this.prisma.$transaction(async (tx) => {
      const q = await this.quote(dto, tx);
      await this.reserveStock(tx, q.lines);
      await this.countCouponUse(tx, q.couponCode);
      return tx.order.create({
        data: this.orderData(dto, q, OrderStatus.PLACED, PaymentStatus.PENDING),
        include: PUBLIC_ORDER_INCLUDE,
      });
    });
    this.sendConfirmation(order.id);
    return order;
  }

  /**
   * Razorpay step 1: persists a PENDING order bound to the gateway order created for `q.total`.
   * Stock is deducted only once payment is confirmed (verify endpoint or webhook).
   */
  async createPendingRazorpayOrder(dto: OrderInput, q: OrderQuote, razorpayOrderId: string) {
    return this.prisma.order.create({
      data: this.orderData(dto, q, OrderStatus.PLACED, PaymentStatus.PENDING, razorpayOrderId),
      select: { id: true, total: true },
    });
  }

  /**
   * Razorpay step 2 (browser verify or `payment.captured` webhook).
   * Idempotent: stock and coupon usage are recorded exactly once.
   */
  async confirmRazorpayPayment(razorpayOrderId: string, razorpayPaymentId?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { razorpayOrderId }, include: { items: true } });
      if (!order) return null;

      if (order.paymentStatus === PaymentStatus.PAID) {
        if (razorpayPaymentId && !order.razorpayPaymentId) {
          await tx.order.update({ where: { id: order.id }, data: { razorpayPaymentId } });
        }
        return { ...order, idempotent: true };
      }

      await this.deductStock(tx, order.items);
      await this.countCouponUse(tx, order.couponCode);
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        },
        include: { items: true },
      });
    });

    if (result && !('idempotent' in result)) this.sendConfirmation(result.id);
    return result;
  }

  /** `payment.failed` webhook: marks the order FAILED without touching stock. */
  async failRazorpayPayment(razorpayOrderId: string, razorpayPaymentId?: string) {
    const order = await this.prisma.order.findUnique({ where: { razorpayOrderId } });
    if (!order) return { received: true, message: `Order #${razorpayOrderId} not found.` };
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { received: true, ignored: true, reason: 'Order already completed and paid.' };
    }
    return this.prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.FAILED, ...(razorpayPaymentId ? { razorpayPaymentId } : {}) },
    });
  }

  async handleRazorpayWebhook(payload: any) {
    const event = payload?.event;
    const payment = payload?.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    if (!razorpayOrderId) return { received: true, ignored: true, reason: 'Missing order_id' };

    if (event === 'payment.captured') {
      const order = await this.confirmRazorpayPayment(razorpayOrderId, payment?.id);
      return order
        ? { received: true, orderId: order.id, status: order.status }
        : { received: true, message: `Order #${razorpayOrderId} not found.` };
    }
    if (event === 'payment.failed') return this.failRazorpayPayment(razorpayOrderId, payment?.id);
    return { received: true, event };
  }

  // ─── Lookups ───────────────────────────────────────────────────────────────

  /**
   * GET /orders/:id — returned only to staff, the logged-in owner, or a caller supplying the order's email.
   * Anyone else gets 404 so order IDs cannot be probed.
   */
  async findOneSecure(
    id: string,
    authUser: { id: string; role: UserRole; email: string } | null,
    suppliedEmail?: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: PUBLIC_ORDER_INCLUDE });
    const email = suppliedEmail?.trim().toLowerCase();
    const allowed =
      order &&
      (isStaff(authUser?.role) ||
        (authUser && order.userId === authUser.id) ||
        (email && [order.guestEmail, order.user?.email].some((e) => e?.trim().toLowerCase() === email)));
    if (!allowed) throw new NotFoundException(`Order #${id} not found.`);
    return order;
  }

  async trackOrder(id: string, email: string) {
    const normEmail = email.trim().toLowerCase();
    const order = await this.prisma.order.findFirst({
      where: {
        id: id.trim(),
        OR: [
          { guestEmail: { equals: normEmail, mode: 'insensitive' } },
          { user: { email: { equals: normEmail, mode: 'insensitive' } } },
        ],
      },
      include: { items: { include: { product: { select: PUBLIC_ORDER_INCLUDE.items.include.product.select } } } },
    });
    if (!order) throw new NotFoundException(`Order #${id} with matching email was not found.`);
    return order;
  }

  findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: PUBLIC_ORDER_INCLUDE.items.include.product.select } } } },
    });
  }
}
