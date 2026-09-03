import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ShippingService {
  calculateShippingFee(subtotal: number, deliverySpeed: 'STANDARD' | 'EXPRESS' = 'STANDARD'): number {
    if (deliverySpeed === 'EXPRESS') {
      return 250;
    }
    return subtotal > 1999 ? 0 : 99;
  }

  getDeliveryEstimate(deliverySpeed: 'STANDARD' | 'EXPRESS' = 'STANDARD'): string {
    return deliverySpeed === 'EXPRESS' ? '1-2 Business Days' : '3-5 Business Days';
  }

  getTrackingTimeline(status: OrderStatus, createdAt: Date) {
    const timeline = [
      { step: 'Order Placed', completed: true, timestamp: createdAt },
      { step: 'Payment Confirmed', completed: status !== 'CANCELLED', timestamp: new Date(createdAt.getTime() + 1000 * 60 * 30) },
      { step: 'Forged & Packed', completed: ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(status), timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24) },
      { step: 'Out for Express Delivery', completed: ['SHIPPED', 'DELIVERED'].includes(status), timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60 * 48) },
      { step: 'Delivered to Doorstep', completed: status === 'DELIVERED', timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60 * 72) },
    ];

    return timeline;
  }
}
