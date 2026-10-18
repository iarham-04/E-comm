import Link from 'next/link';
import { Leaf, Truck, Banknote, Lock } from 'lucide-react';

const TRUST_ELEMENTS = [
  {
    icon: Leaf,
    title: 'Hand-Sorted & Fresh',
    description: 'Every batch is sorted by hand and sealed in food-grade packs. No added preservatives.',
  },
  {
    icon: Truck,
    title: 'Free Shipping over ₹1,999',
    description: 'Standard delivery in 3–5 business days across India, or choose express at checkout.',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    description: 'Pay when your order arrives, or online with UPI, cards and net banking.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Online payments are processed by Razorpay over an encrypted connection.',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Why Shop With Us</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Quality You Can Taste, Service You Can Trust
          </h2>
          <p className="text-xs text-slate-500">
            From sourcing to your doorstep, every step is handled with care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ELEMENTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start space-x-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-150">
              <div className="p-3 bg-slate-900 text-amber-400 rounded-xl flex-shrink-0 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs">{title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>Buying for an event, office or festival? We pack custom dry fruit hampers in bulk.</p>
          <Link
            href="/contact-us"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap underline"
          >
            Ask about bulk &amp; corporate orders →
          </Link>
        </div>
      </div>
    </section>
  );
}
