import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Lock, Star, Award, PhoneCall } from 'lucide-react';

const TRUST_ELEMENTS = [
  {
    icon: ShieldCheck,
    title: 'Authenticity Guaranteed',
    description: 'Museum-grade historical accuracy forged by master blacksmiths.',
  },
  {
    icon: Truck,
    title: '3–5 Day Express Delivery',
    description: 'Tracked dispatch in archival velvet & wooden presentation boxes.',
  },
  {
    icon: RotateCcw,
    title: '30-Day Easy Returns',
    description: 'Hassle-free 30-day return & exchange guarantee.',
  },
  {
    icon: Lock,
    title: '256-Bit Encrypted Payments',
    description: 'Bank-grade secure checkout via Razorpay, Credit Cards & UPI.',
  },
  {
    icon: Star,
    title: '4.9 / 5 Collector Rating',
    description: 'Over 10,000+ verified 5-star collector reviews nationwide.',
  },
  {
    icon: Award,
    title: 'Genuine Material Specs',
    description: '1095 high-carbon steel, solid teak wood & natural leather.',
  },
  {
    icon: PhoneCall,
    title: '24/7 Concierge Support',
    description: 'Direct support from our historical artifact specialists.',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Built On Proven Trust</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Continuous Confidence at Every Interaction
          </h2>
          <p className="text-xs text-slate-500">
            From archival packaging to bank-grade encryption, trust is built into every step of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ELEMENTS.slice(0, 4).map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-start space-x-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-150">
                <div className="p-3 bg-slate-900 text-amber-400 rounded-xl flex-shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{b.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Trust Ribbon */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-6 flex-wrap justify-center">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">4.9 / 5 Collector Score</span>
            </div>
            <div className="hidden sm:block text-slate-600">•</div>
            <div>Verified 1095 High-Carbon Steel &amp; Teak</div>
            <div className="hidden sm:block text-slate-600">•</div>
            <div>256-Bit SSL Encrypted</div>
          </div>
          <Link
            href="/contact-us"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap underline"
          >
            Speak to a Concierge Specialist →
          </Link>
        </div>
      </div>
    </section>
  );
}
