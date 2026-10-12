import Razorpay from "razorpay";
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export type PaymentMethod = 'COD' | 'RAZORPAY' | 'STRIPE';

@Injectable()
export class PaymentService {
  private razorpay: any;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';

    if (!this.keyId || !this.keySecret) {
      console.warn('⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured. Razorpay payments will fail.');
    }

        this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  /**
   * Creates a Razorpay Order.
   * Must be called before showing the Razorpay popup on the frontend.
   * Returns the Razorpay order ID that the frontend uses to open the payment popup.
   */
  async createRazorpayOrder(amountInRupees: number, receiptId: string) {
    if (!this.keyId || !this.keySecret) {
      throw new InternalServerErrorException('Payment gateway not configured.');
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
        keyId: this.keyId,
      };
    } catch (err: any) {
      console.error('Razorpay createOrder failed:', err);
      throw new BadRequestException(err?.error?.description || 'Failed to create Razorpay order.');
    }
  }

  /**
   * Verifies the HMAC SHA256 signature sent by Razorpay after payment.
   * Uses timing-safe comparison to prevent side-channel attacks.
   * Must be verified server-side before marking any order as PAID.
   */
  verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    if (!this.keySecret) {
      throw new InternalServerErrorException('Payment gateway secret not configured.');
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', this.keySecret).update(body).digest('hex');

    // Timing-safe comparison to prevent side-channel attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpaySignature, 'hex'),
      );
    } catch {
      // If buffers are different lengths, signatures don't match
      return false;
    }
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
