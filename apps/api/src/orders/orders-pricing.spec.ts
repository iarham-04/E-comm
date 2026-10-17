import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersService, OrderInput } from './orders.service';

describe('OrdersService - pricing & checkout integrity', () => {
  let service: OrdersService;
  let prisma: any;

  const product = {
    id: 'p1',
    name: 'Helmet',
    price: new Prisma.Decimal(1000),
    stock: 5,
    collections: [{ id: 'col1' }],
    variants: [{ id: 'v1', stock: 2, priceDelta: new Prisma.Decimal(200) }],
  };

  const baseDto = (over: Partial<OrderInput> = {}): OrderInput => ({
    guestEmail: 'buyer@example.com',
    paymentMethod: 'COD',
    shippingAddress: {
      fullName: 'A B', street: '1 St', city: 'Pune', state: 'MH', postalCode: '411001', phone: '999',
    },
    items: [{ productId: 'p1', quantity: 2, price: 1 }],
    ...over,
  });

  beforeEach(() => {
    prisma = {
      storeSettings: { findUnique: jest.fn().mockResolvedValue(null) },
      product: { findMany: jest.fn().mockResolvedValue([product]), updateMany: jest.fn() },
      productVariant: { updateMany: jest.fn() },
      coupon: { findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn() },
      order: { create: jest.fn(async ({ data }: any) => ({ id: 'o1', ...data })) },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
    };
    service = new OrdersService(prisma, { sendOrderConfirmation: jest.fn().mockResolvedValue({}) } as any);
  });

  it('ignores client-supplied prices and uses database prices', async () => {
    const q = await service.quote(baseDto());
    expect(q.subtotal).toBe(2000);
    expect(q.shippingFee).toBe(0); // >= 1999 free-shipping threshold
    expect(q.total).toBe(2000);
  });

  it('adds the variant price delta and caps quantity by variant stock', async () => {
    const q = await service.quote(baseDto({ items: [{ productId: 'p1', variantId: 'v1', quantity: 1 }] }));
    expect(q.lines[0].unitPrice).toBe(1200);
    await expect(
      service.quote(baseDto({ items: [{ productId: 'p1', variantId: 'v1', quantity: 3 }] })),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a variant that belongs to a different product', async () => {
    await expect(
      service.quote(baseDto({ items: [{ productId: 'p1', variantId: 'other', quantity: 1 }] })),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects unpublished / unknown products', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    await expect(service.quote(baseDto())).rejects.toThrow(NotFoundException);
  });

  it('rejects an invalid or exhausted coupon code', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE', isActive: true, maxUses: 1, usedCount: 1, discountType: 'FLAT', discountValue: 100,
    });
    await expect(service.quote(baseDto({ couponCode: 'save' }))).rejects.toThrow(BadRequestException);
  });

  it('applies a valid percentage coupon', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, maxUses: null, usedCount: 0, discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal(10), appliesToCollectionId: null,
    });
    const q = await service.quote(baseDto({ couponCode: 'save10' }));
    expect(q.discountAmount).toBe(200);
    expect(q.couponCode).toBe('SAVE10');
    expect(q.total).toBe(1800);
  });

  it('refuses to create a paid order through the COD endpoint', async () => {
    await expect(service.createCodOrder(baseDto({ paymentMethod: 'RAZORPAY' }))).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('creates COD orders as PLACED / PENDING', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 1 });
    const order: any = await service.createCodOrder(baseDto());
    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('PENDING');
    expect(order.total).toBe(2000);
  });

  it('fails instead of overselling when stock is taken concurrently', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.createCodOrder(baseDto())).rejects.toThrow(BadRequestException);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});
