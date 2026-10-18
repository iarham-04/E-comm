import InfoPage from '@/components/InfoPage';
import { SITE, inr } from '@/lib/site';

export const metadata = { title: 'Help Center & FAQ — Corazonetouch' };

const FAQS = [
  { q: 'How long does delivery take?', a: `Standard delivery takes ${SITE.standardDelivery}; express takes ${SITE.expressDelivery}.` },
  { q: 'Is shipping free?', a: `Yes, standard shipping is free on orders of ${inr(SITE.freeShippingThreshold)} or more. Below that, it costs ${inr(SITE.standardShippingFee)}.` },
  { q: 'What payment methods do you accept?', a: 'Pay online through Razorpay using UPI, cards, wallets or net banking.' },
  { q: 'Can I track my order as a guest?', a: 'Yes — visit the Track Order page and enter your Order ID and the email used at checkout.' },
  { q: 'How should I store dry fruits?', a: 'Keep them in an airtight container in a cool, dry place. Refrigerate walnuts and opened packs to keep them fresh longer.' },
  { q: 'What if my order arrives damaged?', a: `Email ${SITE.supportEmail} within 48 hours with photos and your Order ID, and we will replace it or refund you.` },
  { q: 'Do you take bulk or corporate orders?', a: 'Yes — we pack custom gift hampers for festivals, weddings and companies. Contact us with your requirements.' },
];

export default function HelpCenterPage() {
  return (
    <InfoPage
      title="Help Center & FAQ"
      intro="Quick answers to common questions about orders, delivery, payments and storage."
      sections={FAQS.map((f) => ({ heading: f.q, body: <p>{f.a}</p> }))}
    />
  );
}
