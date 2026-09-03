import { Injectable, BadRequestException } from '@nestjs/common';

export type PaymentMethod = 'COD' | 'RAZORPAY' | 'STRIPE';

@Injectable()
export class PaymentService {
  async processPayment(method: PaymentMethod, amount: number, orderId: string) {
    if (method === 'COD') {
      return { status: 'PENDING', transactionId: `cod_${orderId}` };
    }

    if (method === 'RAZORPAY') {
      return { status: 'PAID', transactionId: `rzp_${orderId}_${Date.now()}` };
    }

    if (method === 'STRIPE') {
      return { status: 'PAID', transactionId: `ch_${orderId}_${Date.now()}` };
    }

    throw new BadRequestException(`Unsupported payment method: ${method}`);
  }
}
