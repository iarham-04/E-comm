import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, Clock, Mail, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Corazonetouch',
  description: 'Read the Terms and Conditions governing purchases, shipping, returns, and website usage on Corazonetouch.',
};

export default function TermsPage() {
  const lastUpdated = 'September 11, 2026';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900">
      {/* Header Banner */}
      <section className="border-b border-neutral-200/80 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#B38728] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
            Terms and Conditions
          </h1>
          <div className="flex items-center space-x-4 mt-3 text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-neutral-400" />
              <span>Corazonetouch D2C</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-10 shadow-sm space-y-10 text-neutral-700 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>Corazonetouch</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;), accessible at{' '}
              <Link href="https://corazontouch.com" className="text-[#B38728] hover:underline font-medium">
                corazontouch.com
              </Link>
              . These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of our website, digital platforms, and any purchase made through them. By accessing or using our website, creating an account, or placing an order, you agree to be bound by these Terms in full. If you do not agree, please discontinue using this website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              2. Eligibility
            </h2>
            <p>
              You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to place an order or enter into binding transactions on this website. By placing an order, you confirm that you meet this requirement and that all information provided during checkout or registration is accurate, current, and complete.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              3. Account Registration &amp; Security
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You may browse the catalog and purchase as a guest, or register an authenticated account for expedited checkout, saved addresses, and order history tracking.</li>
              <li>You are exclusively responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms or are reasonably suspected of fraudulent or unauthorized activity.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              4. Products, Descriptions &amp; Pricing
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We make every effort to display product imagery, specifications, dimensions, and materials with exacting precision. However, dry fruits and nuts are natural agricultural products, so minor variations in size, colour and texture between batches are normal and do not constitute a defect.</li>
              <li>All prices are stated in <strong>Indian Rupees (INR &#8377;)</strong> and include or exclude applicable goods and services taxes as indicated at checkout.</li>
              <li>We reserve the right to rectify any inadvertent typographical or pricing errors, even after an order has been submitted. In such cases, we will notify you before fulfilling your order.</li>
              <li>Seasonal and limited batches are available while stocks last and are allocated on a first-come, first-served basis.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              5. Order Acceptance &amp; Confirmation
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Submitting an order constitutes a formal offer to purchase. We reserve the right to accept or decline any order for operational reasons, including stock unavailability, pricing discrepancies, or fraud prevention.</li>
              <li>An order is confirmed only once an automated order confirmation notification and email with a unique tracking identifier are dispatched to you.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              6. Payments &amp; Security
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We accept payments via <strong>Razorpay</strong> (all major Credit &amp; Debit Cards, UPI, Net Banking, and digital wallets).</li>
              <li>Online transactions are handled through 256-bit encrypted, PCI-DSS compliant third-party payment gateways. We do not store sensitive card data on our internal servers.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              7. Shipping &amp; Delivery
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Estimated delivery timelines provided at checkout (Standard or Express Courier) represent operational estimates and are not rigid guarantees.</li>
              <li>We partner with top-tier courier networks (including Shiprocket) to ensure safe handling; however, we are not liable for transit delays caused by extreme weather, regional checkpoints, or unforeseen carrier disruptions.</li>
              <li>Title and risk of loss transfer to you upon verified delivery to the shipping address specified in your order.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              8. Cancellations, Returns &amp; Refunds
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cancellation:</strong> Orders may be cancelled free of charge prior to warehouse dispatch and courier pickup. Once an order is in transit, it cannot be recalled.</li>
              <li><strong>Returns:</strong> As dry fruits are food products, opened packs cannot be returned for hygiene reasons. Custom gift hampers are final sale unless damaged in transit.</li>
              <li><strong>Refunds:</strong> Approved refunds for online payments are credited to the original payment source within <strong>5 to 7 business days</strong> following our warehouse quality inspection. Refunds for existing Cash on Delivery orders are paid via verified UPI or direct bank transfer (NEFT).</li>
              <li><strong>Damaged, Wrong or Stale Items:</strong> If an item arrives damaged, incorrect or not fresh, notify our team within <strong>48 hours of delivery</strong> with photographs for a free replacement or full refund.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              9. Coupons &amp; Promotional Codes
            </h2>
            <p>
              Discount coupons and seasonal promotions are subject to published eligibility criteria (minimum cart value, category exclusions, and expiry deadlines). Coupons cannot be stacked or combined with other promotional codes unless explicitly authorized.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              10. User-Generated Content &amp; Customer Reviews
            </h2>
            <p>
              By posting a product review or feedback, you grant Corazonetouch a royalty-free, perpetual license to display and publish that review across our website and marketing channels. Reviews must represent genuine firsthand customer experiences and must remain free from offensive, defamatory, or promotional solicitations.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              11. Intellectual Property
            </h2>
            <p>
              All materials hosted on Corazonetouch &mdash; including brand marks, typography, photography, 3D renderings, product descriptions, craftsmanship narratives, and underlying software code &mdash; are the exclusive intellectual property of Corazonetouch. No content may be copied, scraped, reproduced, or exploited for commercial use without prior written authorization.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              12. Prohibited Activities
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You agree not to engage in unlawful conduct, vulnerability probing, or unauthorized credential testing.</li>
              <li>You may not deploy automated bots, scrapers, or scripts that disrupt website performance or extract catalog data.</li>
              <li>You agree not to submit fraudulent payment instruments or fictitious checkout information.</li>
            </ul>
          </section>

          {/* Section 13 & 14 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              13. Limitation of Liability &amp; Indemnity
            </h2>
            <p>
              To the full extent permitted by law, Corazonetouch shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use of our products or website. In any circumstance, our aggregate liability shall not exceed the exact monetary amount paid by the customer for the purchase in dispute.
            </p>
            <p className="mt-2">
              You agree to indemnify and hold harmless Corazonetouch, its officers, craftsmen, and affiliates against any third-party claims or expenses resulting from your breach of these Terms.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              14. Privacy &amp; Data Protection
            </h2>
            <p>
              Your personal information is handled in accordance with our comprehensive{' '}
              <Link href="/pages/privacy-policy" className="text-[#B38728] hover:underline font-semibold">
                Privacy Policy
              </Link>
              , which details our encryption standards, data storage practices, and compliance with data protection laws.
            </p>
          </section>

          {/* Section 16 & 17 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              15. Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms and any non-contractual obligations arising out of them shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>. Any claims, legal actions, or proceedings shall be submitted to the exclusive jurisdiction of the competent courts in <strong>Uttar Pradesh, India</strong>.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              16. Amendments &amp; Policy Revisions
            </h2>
            <p>
              We reserve the right to revise or update these Terms as operational needs or regulatory guidelines require. Material updates will be reflected by the revised &ldquo;Last updated&rdquo; timestamp at the top of this page. Continued interaction with our store represents acceptance of the latest Terms.
            </p>
          </section>

          {/* Section 19 */}
          <section className="space-y-3 border-t border-neutral-100 pt-6">
            <h2 className="text-lg font-display font-bold text-neutral-900">
              17. Contact Information &amp; Grievance Redressal
            </h2>
            <p className="text-xs text-neutral-600">
              In compliance with the Consumer Protection (E-Commerce) Rules, 2020, customer inquiries and grievance escalations may be directed to:
            </p>
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/70 space-y-2 text-xs">
              <p><strong>Brand:</strong> Corazonetouch</p>
              <p><strong>Platform:</strong> <Link href="https://corazontouch.com" className="text-[#B38728] hover:underline">corazontouch.com</Link></p>
              <p><strong>Customer Support:</strong> <a href="mailto:support@corazontouch.com" className="text-[#B38728] hover:underline">support@corazontouch.com</a></p>
              <p><strong>Grievance Officer:</strong> Grievance Redressal Desk, Corazonetouch</p>
              <p><strong>Support Portal:</strong> <Link href="/contact-us" className="text-[#B38728] hover:underline">corazontouch.com/contact-us</Link></p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
