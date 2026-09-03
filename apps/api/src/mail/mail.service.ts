import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly sender = 'Corazonetouch <onboarding@resend.dev>';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.resend = new Resend(apiKey.trim());
      this.logger.log('Resend client initialized successfully.');
    } else {
      this.logger.warn('RESEND_API_KEY is missing — email sending will be logged to console only.');
    }
  }

  /**
   * Helper: Replace template placeholders like {{customerName}}
   */
  private interpolate(template: string, vars: Record<string, any>): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '';
    });
  }

  /**
   * Trigger Order Confirmation Email
   */
  async sendOrderConfirmation(orderId: string): Promise<{ success: boolean; id?: string }> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } }, user: true },
      });

      if (!order) {
        this.logger.error(`Cannot send order confirmation: Order #${orderId} not found.`);
        return { success: false };
      }

      const recipient = order.user?.email || order.guestEmail;
      if (!recipient) {
        this.logger.warn(`No recipient email address found for Order #${orderId}.`);
        return { success: false };
      }

      // Fetch EmailTemplate from DB
      let template = await this.prisma.emailTemplate.findUnique({
        where: { key: 'order_confirmation' },
      });

      // Default fallback if not found in DB
      if (!template) {
        template = {
          id: 'default-conf',
          key: 'order_confirmation',
          subject: 'Corazonetouch — Order Confirmation #{{orderNumber}}',
          bodyHtml: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0f172a;">
              <h1 style="color: #0f172a;">Order Confirmation</h1>
              <p>Dear <strong>{{customerName}}</strong>,</p>
              <p>Thank you for your order <strong>#{{orderNumber}}</strong>.</p>
              <p>Total Amount: <strong>₹{{total}}</strong></p>
              <p>Payment Method: {{paymentMethod}}</p>
              <hr />
              <p style="font-size: 12px; color: #64748b;">Dispatched in archival velvet wrapping. For support, reply to this email.</p>
            </div>
          `,
          updatedAt: new Date(),
        };
      }

      const customerName = order.user?.name || (order.addressSnapshot as any)?.fullName || 'Valued Collector';
      const orderNumber = order.id.slice(-6).toUpperCase();
      const vars = {
        customerName,
        orderNumber,
        total: Number(order.total).toLocaleString('en-IN'),
        subtotal: Number(order.subtotal).toLocaleString('en-IN'),
        shippingFee: Number(order.shippingFee).toLocaleString('en-IN'),
        discountAmount: Number(order.discountAmount).toLocaleString('en-IN'),
        paymentMethod: order.paymentMethod,
      };

      const subject = this.interpolate(template.subject, vars);
      const html = this.interpolate(template.bodyHtml, vars);

      if (!this.resend) {
        this.logger.log(`[CONSOLE SIMULATION EMAIL] To: ${recipient} | Subject: "${subject}"`);
        return { success: true, id: 'simulated-id' };
      }

      const result = await this.resend.emails.send({
        from: this.sender,
        to: recipient,
        subject,
        html,
      });

      this.logger.log(`Resend order confirmation email sent to ${recipient}. Resend ID: ${result.data?.id}`);
      return { success: true, id: result.data?.id };
    } catch (err) {
      this.logger.error(`Failed to send order confirmation email for order #${orderId}: ${(err as Error).message}`);
      return { success: false };
    }
  }

  /**
   * Trigger Order Shipped Email
   */
  async sendOrderShipped(orderId: string): Promise<{ success: boolean; id?: string }> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        this.logger.error(`Cannot send order shipped email: Order #${orderId} not found.`);
        return { success: false };
      }

      const recipient = order.user?.email || order.guestEmail;
      if (!recipient) {
        this.logger.warn(`No recipient email address found for Order #${orderId}.`);
        return { success: false };
      }

      // Fetch EmailTemplate from DB
      let template = await this.prisma.emailTemplate.findUnique({
        where: { key: 'order_shipped' },
      });

      if (!template) {
        template = {
          id: 'default-shipped',
          key: 'order_shipped',
          subject: 'Corazonetouch — Order Shipped #{{orderNumber}}',
          bodyHtml: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0f172a;">
              <h1 style="color: #0f172a;">Your Order Has Shipped</h1>
              <p>Dear <strong>{{customerName}}</strong>,</p>
              <p>Great news! Your order <strong>#{{orderNumber}}</strong> has been handed over for express dispatch.</p>
              <p>Carrier: <strong>{{carrier}}</strong></p>
              <p>Tracking Number: <strong>{{trackingNumber}}</strong></p>
              <hr />
              <p style="font-size: 12px; color: #64748b;">Dispatched in archival wood & velvet presentation packaging.</p>
            </div>
          `,
          updatedAt: new Date(),
        };
      }

      const customerName = order.user?.name || (order.addressSnapshot as any)?.fullName || 'Valued Collector';
      const orderNumber = order.id.slice(-6).toUpperCase();
      const vars = {
        customerName,
        orderNumber,
        carrier: order.carrier || 'Shiprocket Express',
        trackingNumber: order.trackingNumber || 'AWB-PENDING',
        total: Number(order.total).toLocaleString('en-IN'),
      };

      const subject = this.interpolate(template.subject, vars);
      const html = this.interpolate(template.bodyHtml, vars);

      if (!this.resend) {
        this.logger.log(`[CONSOLE SIMULATION EMAIL] To: ${recipient} | Subject: "${subject}"`);
        return { success: true, id: 'simulated-id' };
      }

      const result = await this.resend.emails.send({
        from: this.sender,
        to: recipient,
        subject,
        html,
      });

      this.logger.log(`Resend order shipped email sent to ${recipient}. Resend ID: ${result.data?.id}`);
      return { success: true, id: result.data?.id };
    } catch (err) {
      this.logger.error(`Failed to send order shipped email for order #${orderId}: ${(err as Error).message}`);
      return { success: false };
    }
  }
}
