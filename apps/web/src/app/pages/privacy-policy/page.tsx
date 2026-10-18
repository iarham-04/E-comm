import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Privacy Policy — Corazonetouch' };

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="This page explains what personal information we collect when you shop with us and how we use it."
      sections={[
        {
          heading: 'What we collect',
          body: <p>Your name, email address, phone number and delivery address, the items you order, and — if you create an account — your login details. We do not store your card, UPI or bank details.</p>,
        },
        {
          heading: 'How we use it',
          body: <p>To process and deliver your orders, send order and shipping updates, respond to your questions, and — only if you subscribe — send newsletters and offers. You can unsubscribe at any time.</p>,
        },
        {
          heading: 'Who we share it with',
          body: (
            <p>
              Only the service providers needed to run the store: our payment gateway (Razorpay) for online payments, our sign-in provider (Clerk)
              for accounts, our email provider for order emails, our hosting providers, and courier partners for delivery. We never sell your data.
            </p>
          ),
        },
        {
          heading: 'Your choices',
          body: <p>You can ask us to update or delete your personal information by contacting us. Some order records may need to be kept for tax and legal reasons.</p>,
        },
      ]}
    />
  );
}
