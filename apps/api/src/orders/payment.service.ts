import Razorpay = require('razorpay');
import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/** Constant-time comparison of two hex HMAC digests. */
export function hmacMatches(secret: string, payload: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return (
    typeof signature === 'string' &&
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly razorpay: any;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(configService: ConfigService) {
    this.keyId = configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.keySecret = configService.get<string>('RAZORPAY_KEY_SECRET') || '';
    if (!this.keyId || !this.keySecret) {
      this.logger.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured. Razorpay payments will fail.');
    }
    this.razorpay = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
  }

  private assertConfigured() {
    if (!this.keyId || !this.keySecret) {
      throw new InternalServerErrorException('Payment gateway not configured.');
    }
  }

  /** Creates the gateway order the checkout popup pays against. The amount is fixed server-side. */
  async createRazorpayOrder(amountInRupees: number, receipt: string) {
    this.assertConfigured();
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amountInRupees * 100),
        currency: 'INR',
        receipt: receipt.slice(0, 40), // Razorpay limit
        payment_capture: 1,
      });
      return { id: order.id as string, amount: order.amount as number, currency: order.currency as string, keyId: this.keyId };
    } catch (err: any) {
      this.logger.error(`Razorpay createOrder failed: ${err?.error?.description || err?.message}`);
      throw new BadRequestException(err?.error?.description || 'Failed to create Razorpay order.');
    }
  }

  /** Verifies the checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret). */
  verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    this.assertConfigured();
    return hmacMatches(this.keySecret, `${razorpayOrderId}|${razorpayPaymentId}`, signature);
  }

  /** Issues a real refund at the gateway. Amount is in rupees. */
  async refundRazorpayPayment(paymentId: string, amountInRupees: number): Promise<string> {
    this.assertConfigured();
    try {
      const refund = await this.razorpay.payments.refund(paymentId, { amount: Math.round(amountInRupees * 100) });
      return refund.id;
    } catch (err: any) {
      this.logger.error(`Razorpay refund failed for ${paymentId}: ${err?.error?.description || err?.message}`);
      throw new BadRequestException(err?.error?.description || 'Gateway refund failed.');
    }
  }
}
