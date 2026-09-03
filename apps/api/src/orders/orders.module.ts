import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InventoryService } from './inventory.service';
import { ShippingService } from './shipping.service';
import { PaymentService } from './payment.service';
import { NotificationService } from './notification.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    InventoryService,
    ShippingService,
    PaymentService,
    NotificationService,
  ],
  exports: [
    OrdersService,
    InventoryService,
    ShippingService,
    PaymentService,
    NotificationService,
  ],
})
export class OrdersModule {}
