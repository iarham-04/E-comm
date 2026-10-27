/** Store-wide facts shown on info pages. Keep in sync with checkout pricing in apps/api orders.service. */
export const SITE = {
  name: 'Corazonetouch',
  supportEmail: 'support@corazontouch.com',
  courier: 'DHL',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  expressShippingFee: 250,
  standardDelivery: '3–5 business days',
  expressDelivery: '1–2 business days',
};

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
