import { BadRequestException } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import * as crypto from 'crypto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let ordersService: any;
  let configService: any;
  const webhookSecret = 'test_webhook_secret_key_12345';

  beforeEach(() => {
    ordersService = {
      handleRazorpayWebhook: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'RAZORPAY_WEBHOOK_SECRET') return webhookSecret;
        return null;
      }),
    };
    controller = new WebhooksController(ordersService, configService);
    jest.clearAllMocks();
  });

  it('rejects an invalid webhook signature with 400 BadRequestException', async () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const req = {
      rawBody: Buffer.from(rawBody, 'utf8'),
      body: JSON.parse(rawBody),
    };
    const invalidSignature = 'invalid_tampered_signature_hex';

    await expect(
      controller.handleRazorpayWebhook(req, invalidSignature),
    ).rejects.toThrow(BadRequestException);

    expect(ordersService.handleRazorpayWebhook).not.toHaveBeenCalled();
  });

  it('accepts a valid webhook signature and forwards the payload', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            order_id: 'order_rzp_abc',
          },
        },
      },
    };
    const rawBody = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const req = {
      rawBody: Buffer.from(rawBody, 'utf8'),
      body: payload,
    };

    ordersService.handleRazorpayWebhook.mockResolvedValue({ status: 'CONFIRMED' });

    const result = await controller.handleRazorpayWebhook(req, validSignature);
    expect(result).toEqual({ status: 'CONFIRMED' });
    expect(ordersService.handleRazorpayWebhook).toHaveBeenCalledWith(payload);
  });
});
