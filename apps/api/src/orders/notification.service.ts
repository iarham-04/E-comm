import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendOrderConfirmationEmail(email: string, orderId: string, total: number) {
    this.logger.log(`[NotificationService] Order confirmation email dispatched to ${email} for Order #${orderId} (Total: ₹${total})`);
    return { success: true, email };
  }

  async sendOrderStatusUpdateEmail(email: string, orderId: string, status: string) {
    this.logger.log(`[NotificationService] Order status update notification dispatched to ${email} for Order #${orderId} -> Status: ${status}`);
    return { success: true, email, status };
  }
}
