import InfoPage from '@/components/InfoPage';
import { SITE, inr } from '@/lib/site';

export const metadata = { title: 'Shipping & Delivery — Corazonetouch' };

export default function ShippingPage() {
  return (
    <InfoPage
      title="Shipping & Delivery"
      intro={`We deliver across India with ${SITE.courier}. Every order is packed in sealed, food-grade packaging to keep your dry fruits fresh in transit.`}
      sections={[
        {
          heading: 'Delivery options',
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Standard:</strong> {SITE.standardDelivery}. Free on orders of {inr(SITE.freeShippingThreshold)} or more; otherwise {inr(SITE.standardShippingFee)}.</li>
              <li><strong>Express:</strong> {SITE.expressDelivery}, {inr(SITE.expressShippingFee)} flat.</li>
            </ul>
          ),
        },
        {
          heading: 'Order processing',
          body: <p>Orders are usually packed and dispatched within 1 business day. You will get an email when your order ships, with the courier name and tracking number.</p>,
        },
        {
          heading: 'Tracking your order',
          body: <p>Visit the Track Order page and enter your Order ID and the email used at checkout.</p>,
        },
        {
          heading: 'Festive season',
          body: <p>During Diwali, Eid and other festivals, couriers are busier than usual. Please order early, especially for gift hampers.</p>,
        },
      ]}
    />
  );
}
