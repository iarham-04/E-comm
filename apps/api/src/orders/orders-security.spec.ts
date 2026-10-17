import { NotFoundException } from '@nestjs/common';
import { UserRole, OrderStatus, PaymentStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService - Security & Webhook Handling', () => {
  let service: OrdersService;
  let prisma: any;
  let mailService: any;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
      productVariant: {
        update: jest.fn(),
      },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
    };
    mailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    };

    service = new OrdersService(prisma, mailService);
    jest.clearAllMocks();
  });

  describe('Secure Order Lookup (findOneSecure)', () => {
    const mockOrder = {
      id: 'order_123',
      userId: 'user_owner_id',
      guestEmail: 'collector@example.com',
      user: {
        id: 'user_owner_id',
        email: 'registered@example.com',
        name: 'Collector',
      },
      items: [],
    };

    it('returns 404 when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.findOneSecure('nonexistent_id', null, 'collector@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns 404 when caller provides the wrong email and is not owner or staff', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.findOneSecure('order_123', null, 'intruder@attacker.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns 404 when caller provides no email and is unauthenticated', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.findOneSecure('order_123', null, ''),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the order when caller supplies the matching guest email', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOneSecure('order_123', null, 'collector@example.com');
      expect(result).toEqual(mockOrder);
    });

    it('returns the order when caller supplies the matching customer email (case-insensitive)', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOneSecure('order_123', null, 'REGISTERED@example.com');
      expect(result).toEqual(mockOrder);
    });

    it('returns the order to its logged-in owner', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const authUser = {
        id: 'user_owner_id',
        role: UserRole.CUSTOMER,
        email: 'registered@example.com',
      };

      const result = await service.findOneSecure('order_123', authUser);
      expect(result).toEqual(mockOrder);
    });

    it('returns the order to staff members (SUPPORT, MANAGER, OWNER)', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      for (const role of [UserRole.SUPPORT, UserRole.MANAGER, UserRole.OWNER]) {
        const staffUser = {
          id: 'staff_id_999',
          role,
          email: 'staff@corazontouch.com',
        };

        const result = await service.findOneSecure('order_123', staffUser);
        expect(result).toEqual(mockOrder);
      }
    });
  });

  describe('Webhook Payment Processing & Stock Idempotency', () => {
    const razorpayOrderId = 'order_rzp_999';
    const razorpayPaymentId = 'pay_rzp_777';

    it('confirms the order and decrements stock once on payment.captured', async () => {
      const pendingOrder = {
        id: 'ord_db_1',
        razorpayOrderId,
        status: OrderStatus.PLACED,
        paymentStatus: PaymentStatus.PENDING,
        items: [
          { productId: 'prod_1', variantId: null, quantity: 2 },
          { productId: 'prod_2', variantId: 'var_2', quantity: 1 },
        ],
      };

      prisma.order.findUnique.mockResolvedValue(pendingOrder);
      prisma.order.update.mockResolvedValue({
        ...pendingOrder,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        razorpayPaymentId,
      });

      const result: any = await service.confirmRazorpayPayment(razorpayOrderId, razorpayPaymentId);

      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.status).toBe(OrderStatus.CONFIRMED);

      // Verify stock was decremented for each item
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: { stock: { decrement: 2 } },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_2' },
        data: { stock: { decrement: 1 } },
      });
      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var_2' },
        data: { stock: { decrement: 1 } },
      });
    });

    it('does not decrement stock twice when replaying payment.captured', async () => {
      const alreadyPaidOrder = {
        id: 'ord_db_1',
        razorpayOrderId,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        razorpayPaymentId,
        items: [
          { productId: 'prod_1', variantId: null, quantity: 2 },
        ],
      };

      prisma.order.findUnique.mockResolvedValue(alreadyPaidOrder);

      const result: any = await service.confirmRazorpayPayment(razorpayOrderId, razorpayPaymentId);

      // Idempotency flag returned
      expect(result.idempotent).toBe(true);

      // Stock decrement must NOT have been called
      expect(prisma.product.update).not.toHaveBeenCalled();
      expect(prisma.productVariant.update).not.toHaveBeenCalled();
    });

    it('sets paymentStatus to FAILED on payment.failed and does not touch stock', async () => {
      const pendingOrder = {
        id: 'ord_db_1',
        razorpayOrderId,
        status: OrderStatus.PLACED,
        paymentStatus: PaymentStatus.PENDING,
      };

      prisma.order.findUnique.mockResolvedValue(pendingOrder);
      prisma.order.update.mockResolvedValue({
        ...pendingOrder,
        paymentStatus: PaymentStatus.FAILED,
      });

      await service.failRazorpayPayment(razorpayOrderId, razorpayPaymentId);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord_db_1' },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          razorpayPaymentId,
        },
      });

      // Stock must not be changed on failed payments
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });
});
