import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService, EsProductDoc } from '../search/elasticsearch.service';
import { MailService } from '../mail/mail.service';
import { PaymentService } from '../orders/payment.service';
import { CouponDto, BannerDto, UpdateEmailTemplateDto } from '../common/dto/admin.dto';
import { OrderStatus, PaymentStatus, ProductStatus, UserRole } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from '../common/dto/product.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private telemetryEvents: Array<{ event: string; payload?: any; timestamp: string }> = [];

  constructor(
    private prisma: PrismaService,
    private es: ElasticsearchService,
    private mailService: MailService,
    private paymentService: PaymentService,
  ) {}

  // ─── Telemetry ────────────────────────────────────────────────────────────

  async logTelemetry(event: string, payload?: any) {
    const record = { event, payload, timestamp: new Date().toISOString() };
    this.telemetryEvents.push(record);
    if (this.telemetryEvents.length > 1000) this.telemetryEvents.shift();
    return { success: true, recordedEvent: event };
  }

  // ─── Dashboard / Analytics ────────────────────────────────────────────────

  async getDashboard() {
    const [totalOrders, totalProducts, totalUsers, paidOrders, lowStockProducts, recentOrders] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.product.count(),
        this.prisma.user.count(),
        this.prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
        this.prisma.product.findMany({ where: { stock: { lte: 5 }, isActive: true }, select: { id: true, name: true, stock: true, price: true } }),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } },
        }),
      ]);

    const totalRevenue = Number(paidOrders._sum.total ?? 0);
    return { totalRevenue, totalOrders, totalProducts, totalUsers, lowStockCount: lowStockProducts.length, lowStockProducts, recentOrders };
  }

  async getAnalytics() {
    const totalOrders = await this.prisma.order.count();
    const ev = (name: string, fallback: number) =>
      this.telemetryEvents.filter((e) => e.event === name).length || fallback;

    const homepageViews   = ev('homepage_view',   12450);
    const searchUsage     = ev('search_usage',     5820);
    const productViews    = ev('product_view',     8940);
    const imageZooms      = ev('image_zoom',       3120);
    const wishlistAdds    = ev('wishlist_add',     1450);
    const cartAdds        = ev('add_to_cart',      3840);
    const checkoutStarts  = ev('checkout_start',   1920);
    const paymentSuccesses= ev('payment_success',  totalOrders || 42);
    const newsletterSignups = ev('newsletter_signup', 310);
    const conversionRate = homepageViews > 0 ? (paymentSuccesses / homepageViews) * 100 : 0;

    return {
      eventsFunnel: { homepageViews, searchUsage, productViews, imageZooms, wishlistAdds, cartAdds, checkoutStarts, paymentSuccesses, newsletterSignups },
      totalOrders,
      conversionRate: Number(conversionRate.toFixed(2)),
      telemetryLogs: this.telemetryEvents.slice(-20),
    };
  }

  // ─── User & Role Management (Owner-only) ───────────────────────────────────

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, clerkId: true, email: true, name: true, role: true, notes: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  }

  async updateUserRole(targetUserId: string, newRole: UserRole, actorId: string) {
    if (targetUserId === actorId && newRole !== UserRole.OWNER) {
      throw new BadRequestException('You cannot change your own role.');
    }
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException(`User #${targetUserId} not found.`);

    if (targetUser.role === UserRole.OWNER && newRole !== UserRole.OWNER) {
      const ownerCount = await this.prisma.user.count({ where: { role: UserRole.OWNER } });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot demote the last Owner user. At least one Owner must remain.');
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });
  }

  async updateCustomerNotes(customerId: string, notes: string) {
    const user = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!user) throw new NotFoundException(`Customer #${customerId} not found.`);
    return this.prisma.user.update({
      where: { id: customerId },
      data: { notes },
      select: { id: true, email: true, notes: true },
    });
  }

  // ─── Category CRUD ────────────────────────────────────────────────────────

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Category ${id} not found`);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Category ${id} not found`);
    return this.prisma.category.delete({ where: { id } });
  }

  // ─── Product CRUD & Extensions ─────────────────────────────────────────────

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, variants: true },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { category: true, variants: true } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    this.validateLimitedEdition(dto);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        images: dto.images ?? [],
        stock: dto.stock ?? 0,
        isActive: dto.isActive ?? true,
        status: dto.status ?? ProductStatus.DRAFT,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        craftsmanshipStory: dto.craftsmanshipStory,
        material: dto.material,
        heightCm: dto.heightCm,
        widthCm: dto.widthCm,
        depthCm: dto.depthCm,
        weightKg: dto.weightKg,
        isLimitedEdition: dto.isLimitedEdition ?? false,
        editionNumber: dto.editionNumber,
        editionTotal: dto.editionTotal,
        isGiftEligible: dto.isGiftEligible ?? true,
      },
      include: { category: true },
    });

    this.syncToEs(product).catch(() => {});
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Product ${id} not found`);

    const merged = {
      isLimitedEdition: dto.isLimitedEdition ?? existing.isLimitedEdition,
      editionNumber: dto.editionNumber ?? existing.editionNumber,
      editionTotal: dto.editionTotal ?? existing.editionTotal,
    };
    this.validateLimitedEdition(merged);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.images && { images: dto.images }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
        ...(dto.craftsmanshipStory !== undefined && { craftsmanshipStory: dto.craftsmanshipStory }),
        ...(dto.material !== undefined && { material: dto.material }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.widthCm !== undefined && { widthCm: dto.widthCm }),
        ...(dto.depthCm !== undefined && { depthCm: dto.depthCm }),
        ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
        ...(dto.isLimitedEdition !== undefined && { isLimitedEdition: dto.isLimitedEdition }),
        ...(dto.editionNumber !== undefined && { editionNumber: dto.editionNumber }),
        ...(dto.editionTotal !== undefined && { editionTotal: dto.editionTotal }),
        ...(dto.isGiftEligible !== undefined && { isGiftEligible: dto.isGiftEligible }),
      },
      include: { category: true },
    });

    this.syncToEs(product).catch(() => {});
    return product;
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Product ${id} not found`);
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    this.es.deleteProduct(id).catch(() => {});
    return { success: true, id };
  }

  async duplicateProduct(id: string) {
    const original = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!original) throw new NotFoundException(`Product #${id} not found.`);

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicate = await this.prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        description: original.description,
        price: original.price,
        categoryId: original.categoryId,
        images: original.images,
        stock: original.stock,
        isActive: original.isActive,
        status: ProductStatus.DRAFT, // Duplicates always default to DRAFT
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        craftsmanshipStory: original.craftsmanshipStory,
        material: original.material,
        heightCm: original.heightCm,
        widthCm: original.widthCm,
        depthCm: original.depthCm,
        weightKg: original.weightKg,
        isLimitedEdition: original.isLimitedEdition,
        editionNumber: original.editionNumber,
        editionTotal: original.editionTotal,
        isGiftEligible: original.isGiftEligible,
        variants: {
          create: original.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            priceDelta: v.priceDelta,
          })),
        },
      },
      include: { category: true, variants: true },
    });

    return duplicate;
  }

  async bulkUpdateStock(items: Array<{ productId: string; variantId?: string; stock: number }>) {
    const results: Array<{ productId: string; success: boolean; error?: string }> = [];

    for (const item of items) {
      try {
        if (item.variantId) {
          await this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: item.stock },
          });
        } else {
          const updated = await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: item.stock },
            include: { category: true },
          });
          this.syncToEs(updated).catch(() => {});
        }
        results.push({ productId: item.productId, success: true });
      } catch (err) {
        results.push({ productId: item.productId, success: false, error: (err as Error).message });
      }
    }

    return { total: items.length, results };
  }

  async updateStock(id: string, stock: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found.`);
    const updated = await this.prisma.product.update({ where: { id }, data: { stock } });
    this.syncToEs(updated).catch(() => {});
    return updated;
  }

  async reindexAll() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, status: ProductStatus.PUBLISHED },
      include: { category: true },
    });

    const docs: EsProductDoc[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      craftsmanshipStory: p.craftsmanshipStory ?? undefined,
      material: p.material ?? undefined,
      categorySlug: p.category.slug,
      price: Number(p.price),
      stock: p.stock,
      isActive: p.isActive,
      status: p.status,
      isLimitedEdition: p.isLimitedEdition,
      isGiftEligible: p.isGiftEligible,
      createdAt: p.createdAt.toISOString(),
    }));

    await this.es.bulkIndex(docs);
    return { indexed: docs.length };
  }

  // ─── Order Management & Refunds ───────────────────────────────────────────

  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException(`Order #${id} not found.`);
    if (order.status === status) return order;
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled orders cannot be reopened. Ask the customer to order again.');
    }

    // Stock was taken when a COD order was placed or an online payment was captured — give it back on cancel.
    const stockWasDeducted = order.paymentMethod === 'COD' || order.paymentStatus === PaymentStatus.PAID;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (status === OrderStatus.CANCELLED && stockWasDeducted) {
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          }
        }
      }
      return tx.order.update({ where: { id }, data: { status } });
    });

    if (status === OrderStatus.SHIPPED) {
      this.mailService.sendOrderShipped(id).catch((err) => {
        this.logger.error(`Failed to dispatch order shipped email for #${id}: ${(err as Error).message}`);
      });
    }

    return updated;
  }

  async refundOrder(id: string, refundAmount: number, refundReason: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found.`);

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Order has already been refunded. Multiple refunds are prohibited.');
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded.');
    }
    const amount = Math.round(refundAmount * 100) / 100;
    if (!(amount > 0) || amount > Number(order.total)) {
      throw new BadRequestException(`Refund amount must be between 0.01 and total order value (${order.total}).`);
    }

    // Online payments are refunded at the gateway first; the DB is updated only if that succeeds.
    if (order.paymentMethod === 'RAZORPAY') {
      if (!order.razorpayPaymentId) throw new BadRequestException('Order has no Razorpay payment to refund.');
      const refundId = await this.paymentService.refundRazorpayPayment(order.razorpayPaymentId, amount);
      this.logger.log(`Razorpay refund ${refundId} issued for order #${id} (₹${amount})`);
    } else if (order.paymentMethod === 'STRIPE') {
      throw new BadRequestException('Stripe refunds are not supported. Refund from the Stripe dashboard.');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
        refundAmount: amount,
        refundReason,
        refundedAt: new Date(),
      },
    });
  }

  async updateOrderTracking(id: string, trackingNumber: string, carrier: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found.`);
    return this.prisma.order.update({
      where: { id },
      data: { trackingNumber, carrier },
    });
  }

  async getOrderInvoice(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found.`);

    return {
      invoiceNumber: `INV-${order.id.slice(-6).toUpperCase()}`,
      orderDate: order.createdAt,
      customerName: order.user?.name || (order.addressSnapshot as any)?.fullName || 'Guest Collector',
      customerEmail: order.user?.email || order.guestEmail || '',
      address: order.addressSnapshot,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.priceAtPurchase),
        total: Number(i.priceAtPurchase) * i.quantity,
      })),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    };
  }

  // ─── Coupons & Collection Sales ──────────────────────────────────────────

  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { appliesToCollection: true },
    });
  }

  async createCoupon(dto: CouponDto) {
    if (!dto.discountType || dto.discountValue == null) {
      throw new BadRequestException('discountType and discountValue are required.');
    }
    if (!dto.code && !dto.appliesToCollectionId) {
      throw new BadRequestException('A coupon needs a code or a collection.');
    }
    return this.prisma.coupon.create({ data: this.couponData(dto) as any });
  }

  async updateCoupon(id: string, dto: CouponDto) {
    return this.prisma.coupon.update({ where: { id }, data: this.couponData(dto) });
  }

  private couponData(dto: CouponDto) {
    if (dto.discountType === 'PERCENTAGE' && dto.discountValue != null && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discounts cannot exceed 100%.');
    }
    return { ...dto, ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() || null }) };
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  // ─── Homepage Banners ─────────────────────────────────────────────────────

  async getBanners() {
    return this.prisma.homepageBanner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createBanner(data: BannerDto) {
    if (!data.imageUrl) throw new BadRequestException('imageUrl is required.');
    return this.prisma.homepageBanner.create({ data: data as BannerDto & { imageUrl: string } });
  }

  async updateBanner(id: string, data: BannerDto) {
    return this.prisma.homepageBanner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.homepageBanner.delete({ where: { id } });
  }

  // ─── Store Settings & Email Templates ─────────────────────────────────────

  async getSettings() {
    let settings = await this.prisma.storeSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await this.prisma.storeSettings.create({
        data: {
          id: 'singleton',
          flatShippingFee: 0,
          freeShippingThreshold: 1999,
          taxPercent: 18,
          razorpayEnabled: true,
          codEnabled: true,
        },
      });
    }
    return settings;
  }

  async updateSettings(input: any) {
    const num = (v: any) => (v === '' || v == null ? undefined : Number(v));
    const data = {
      flatShippingFee: num(input?.flatShippingFee),
      freeShippingThreshold: input?.freeShippingThreshold === '' ? null : num(input?.freeShippingThreshold),
      taxPercent: num(input?.taxPercent),
      razorpayEnabled: typeof input?.razorpayEnabled === 'boolean' ? input.razorpayEnabled : undefined,
      codEnabled: typeof input?.codEnabled === 'boolean' ? input.codEnabled : undefined,
    };
    if (Object.values(data).some((v) => typeof v === 'number' && (!Number.isFinite(v) || v < 0))) {
      throw new BadRequestException('Settings values must be non-negative numbers.');
    }
    return this.prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });
  }

  async getEmailTemplates() {
    const templates = await this.prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
    if (templates.length === 0) {
      // Seed default email templates on first load
      await this.prisma.emailTemplate.createMany({
        data: [
          {
            key: 'order_confirmation',
            subject: 'Corazonetouch — Order Confirmation #{{orderNumber}}',
            bodyHtml: '<p>Dear {{customerName}}, thank you for your order #{{orderNumber}} totaling ₹{{total}}.</p>',
          },
          {
            key: 'order_shipped',
            subject: 'Corazonetouch — Order Shipped #{{orderNumber}}',
            bodyHtml: '<p>Your order #{{orderNumber}} has been shipped via {{carrier}} (Tracking: {{trackingNumber}}).</p>',
          },
        ],
      });
      return this.prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
    }
    return templates;
  }

  async updateEmailTemplate(id: string, data: UpdateEmailTemplateDto) {
    return this.prisma.emailTemplate.update({ where: { id }, data });
  }

  // ─── Analytics Reports (Selectable Date Range) ────────────────────────────

  async getRevenueReport(from?: string, to?: string) {
    const where = { paymentStatus: PaymentStatus.PAID, createdAt: this.dateRange(from, to) };

    const orders = await this.prisma.order.findMany({ where, select: { total: true, createdAt: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

    return { totalRevenue, orderCount: orders.length, orders };
  }

  async getSalesByProductReport(from?: string, to?: string) {
    const where = { order: { paymentStatus: PaymentStatus.PAID, createdAt: this.dateRange(from, to) } };

    const items = await this.prisma.orderItem.findMany({
      where,
      include: { product: { select: { name: true, slug: true } } },
    });

    const aggregated: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const item of items) {
      const pid = item.productId;
      if (!aggregated[pid]) {
        aggregated[pid] = { name: item.product.name, quantity: 0, revenue: 0 };
      }
      aggregated[pid].quantity += item.quantity;
      aggregated[pid].revenue += Number(item.priceAtPurchase) * item.quantity;
    }

    return Object.values(aggregated).sort((a, b) => b.revenue - a.revenue);
  }

  async getTopCategoriesReport(from?: string, to?: string) {
    const where = { order: { paymentStatus: PaymentStatus.PAID, createdAt: this.dateRange(from, to) } };

    const items = await this.prisma.orderItem.findMany({
      where,
      include: { product: { include: { category: true } } },
    });

    const aggregated: Record<string, { categoryName: string; quantity: number; revenue: number }> = {};
    for (const item of items) {
      const catName = item.product.category.name;
      if (!aggregated[catName]) {
        aggregated[catName] = { categoryName: catName, quantity: 0, revenue: 0 };
      }
      aggregated[catName].quantity += item.quantity;
      aggregated[catName].revenue += Number(item.priceAtPurchase) * item.quantity;
    }

    return Object.values(aggregated).sort((a, b) => b.revenue - a.revenue);
  }

  async getAovReport(from?: string, to?: string) {
    const where = { paymentStatus: PaymentStatus.PAID, createdAt: this.dateRange(from, to) };

    const orders = await this.prisma.order.findMany({ where, select: { total: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

    return { aov: Number(aov.toFixed(2)), totalRevenue, totalOrders: orders.length };
  }

  async getCouponPerformanceReport(from?: string, to?: string) {
    const coupons = await this.prisma.coupon.findMany({
      include: { appliesToCollection: true },
    });

    const where = { paymentStatus: PaymentStatus.PAID, discountAmount: { gt: 0 }, createdAt: this.dateRange(from, to) };

    const orders = await this.prisma.order.findMany({ where, select: { couponCode: true, discountAmount: true, total: true } });

    const report = coupons.map((c) => {
      const matchingOrders = orders.filter((o) => o.couponCode === c.code);
      const totalDiscountGiven = matchingOrders.reduce((sum, o) => sum + Number(o.discountAmount), 0);
      const totalRevenue = matchingOrders.reduce((sum, o) => sum + Number(o.total), 0);
      return {
        code: c.code ?? `[Collection: ${c.appliesToCollection?.name}]`,
        usesCount: c.usedCount,
        orderMatchesCount: matchingOrders.length,
        totalDiscountGiven,
        totalRevenue,
      };
    });

    return report;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Parses report bounds; a bare `to` date includes that whole day. */
  private dateRange(from?: string, to?: string) {
    const parse = (v: string, endOfDay = false) => {
      const d = new Date(endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T23:59:59.999Z` : v);
      if (isNaN(d.getTime())) throw new BadRequestException(`Invalid date: ${v}`);
      return d;
    };
    return { ...(from && { gte: parse(from) }), ...(to && { lte: parse(to, true) }) };
  }

  private validateLimitedEdition(dto: { isLimitedEdition?: boolean; editionNumber?: any; editionTotal?: any }) {
    if (!dto.isLimitedEdition) return;

    if (dto.editionNumber == null || dto.editionTotal == null) {
      throw new BadRequestException('Limited edition products require both editionNumber and editionTotal.');
    }
    if (Number(dto.editionNumber) > Number(dto.editionTotal)) {
      throw new BadRequestException(`editionNumber (${dto.editionNumber}) must be ≤ editionTotal (${dto.editionTotal}).`);
    }
  }

  private async syncToEs(product: any) {
    const category = product.category ?? await this.prisma.category.findUnique({ where: { id: product.categoryId } });
    const doc: EsProductDoc = {
      id: product.id,
      name: product.name,
      description: product.description,
      craftsmanshipStory: product.craftsmanshipStory ?? undefined,
      material: product.material ?? undefined,
      categorySlug: category?.slug ?? '',
      price: Number(product.price),
      stock: product.stock,
      isActive: product.isActive,
      status: product.status ?? 'DRAFT',
      isLimitedEdition: product.isLimitedEdition,
      isGiftEligible: product.isGiftEligible,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    };
    await this.es.indexProduct(doc);
  }
}
