import * as crypto from 'crypto';
import { PaymentService, hmacMatches } from './payment.service';

describe('PaymentService', () => {
  const config = (vals: Record<string, string>) => ({ get: (k: string) => vals[k] }) as any;

  it('constructs the Razorpay client (guards against broken default-import interop)', () => {
    expect(() => new PaymentService(config({ RAZORPAY_KEY_ID: 'rzp_test_x', RAZORPAY_KEY_SECRET: 's' }))).not.toThrow();
  });

  it('starts without keys and only fails when a payment is attempted', async () => {
    const svc = new PaymentService(config({}));
    await expect(svc.createRazorpayOrder(100, 'r')).rejects.toThrow('Payment gateway not configured.');
  });

  it('verifies checkout signatures and rejects tampered ones', () => {
    const svc = new PaymentService(config({ RAZORPAY_KEY_ID: 'rzp_test_x', RAZORPAY_KEY_SECRET: 'secret' }));
    const sig = crypto.createHmac('sha256', 'secret').update('order_1|pay_1').digest('hex');
    expect(svc.verifyPaymentSignature('order_1', 'pay_1', sig)).toBe(true);
    expect(svc.verifyPaymentSignature('order_1', 'pay_2', sig)).toBe(false);
    expect(hmacMatches('secret', 'x', 'short')).toBe(false);
  });
});
