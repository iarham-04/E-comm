import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

export type PaymentMethod = 'COD' | 'RAZORPAY' | 'STRIPE';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor() {
    const Razorpay = require('razorpay');
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Creates a Razorpay Order.
   * Must be called before showing the Razorpay popup on the frontend.
   * Returns the Razorpay order ID that the frontend uses to open the payment popup.
   */
  async createRazorpayOrder(amountInRupees: number, receiptId: string) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new InternalServerErrorException('Razorpay is not configured on the server.');
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        payment_capture: 1, // auto-capture payment immediately
      });

      return {
        id: order.id,          // rzp_order_id — sent to frontend
        amount: order.amount,  // in paise
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (err: any) {
      console.error('Razorpay createOrder failed:', err);
      throw new BadRequestException(err?.error?.description || 'Failed to create Razorpay order.');
    }
  }

  /**
   * Verifies the HMAC SHA256 signature sent by Razorpay after payment.
   * Must be verified server-side before marking any order as PAID.
   */
  verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expectedSignature === razorpaySignature;
  }

  /**
   * Legacy: simple payment processing for COD / future gateways.
   */
  async processPayment(method: PaymentMethod, amount: number, orderId: string) {
    if (method === 'COD') {
      return { status: 'PENDING', transactionId: `cod_${orderId}` };
    }
    if (method === 'RAZORPAY') {
      return { status: 'PAID', transactionId: `rzp_${orderId}_${Date.now()}` };
    }
    throw new BadRequestException(`Unsupported payment method: ${method}`);
  }
}
