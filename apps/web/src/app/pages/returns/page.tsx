import InfoPage from '@/components/InfoPage';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Returns & Replacements — Corazonetouch' };

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns & Replacements"
      intro="Dry fruits are food products, so for hygiene reasons we cannot accept returns of opened packs. If something is wrong with your order, we will make it right."
      sections={[
        {
          heading: 'Damaged, wrong or stale items',
          body: (
            <p>
              If your order arrives damaged, you receive the wrong item, or the product is not fresh, email{' '}
              <strong className="text-slate-900">{SITE.supportEmail}</strong> within 48 hours of delivery with your Order ID and clear photos
              of the product and packaging. We will send a free replacement or issue a refund.
            </p>
          ),
        },
        {
          heading: 'Refunds',
          body: <p>Approved refunds for online payments go back to the original payment method, usually within 5–7 business days. Refunds for existing Cash on Delivery orders go to your bank account or UPI ID.</p>,
        },
        {
          heading: 'Cancellations',
          body: <p>You can cancel an order free of charge before it is dispatched. Contact us as soon as possible with your Order ID.</p>,
        },
      ]}
    />
  );
}
