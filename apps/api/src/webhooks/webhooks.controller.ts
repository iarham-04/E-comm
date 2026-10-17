import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('razorpay')
  @HttpCode(200)
  async handleRazorpayWebhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new BadRequestException('Missing signature or webhook secret.');
    }

    // Extract raw request body string
    let rawBody = '';
    if (Buffer.isBuffer(req.rawBody)) {
      rawBody = req.rawBody.toString('utf8');
    } else if (typeof req.rawBody === 'string') {
      rawBody = req.rawBody;
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (req.body && typeof req.body === 'object') {
      rawBody = JSON.stringify(req.body);
    }

    if (!rawBody) {
      throw new BadRequestException('Empty webhook request body.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signature, 'utf8'),
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      throw new BadRequestException('Invalid Razorpay webhook signature.');
    }

    let payload: any;
    try {
      payload = typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)
        ? req.body
        : JSON.parse(rawBody);
    } catch {
      throw new BadRequestException('Malformed webhook JSON payload.');
    }

    return this.ordersService.handleRazorpayWebhook(payload);
  }
}
