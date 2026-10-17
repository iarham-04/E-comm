import { Controller, Post, Req, Headers, BadRequestException, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { hmacMatches } from '../orders/payment.service';

@Controller('webhooks')
@SkipThrottle()
export class WebhooksController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('razorpay')
  @HttpCode(200)
  async handleRazorpayWebhook(@Req() req: any, @Headers('x-razorpay-signature') signature: string) {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!signature || !webhookSecret) {
      throw new BadRequestException('Missing signature or webhook secret.');
    }

    // The signature covers the exact bytes Razorpay sent, so only the raw body is acceptable.
    const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : '';
    if (!rawBody) throw new BadRequestException('Empty webhook request body.');

    if (!hmacMatches(webhookSecret, rawBody, signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature.');
    }

    try {
      return await this.ordersService.handleRazorpayWebhook(JSON.parse(rawBody));
    } catch (err) {
      if (err instanceof SyntaxError) throw new BadRequestException('Malformed webhook JSON payload.');
      throw err;
    }
  }
}
