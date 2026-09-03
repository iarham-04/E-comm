'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DealBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-8 sm:p-12 shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              🔥 Limited-Time Special Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Handcrafted Viking Steel Helmet & Stand
            </h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Forged from 18-gauge carbon steel with real brass trimmings and hand-stitched leather lining.
            </p>

            {/* Countdown Timer */}
            <div className="mt-6 flex items-center space-x-3 text-white">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center min-w-[64px]">
                <span className="block text-2xl font-black text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Hours</span>
              </div>
              <span className="text-xl font-bold text-amber-500">:</span>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center min-w-[64px]">
                <span className="block text-2xl font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Mins</span>
              </div>
              <span className="text-xl font-bold text-amber-500">:</span>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center min-w-[64px]">
                <span className="block text-2xl font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Secs</span>
              </div>
            </div>

            <div className="mt-8 flex items-center space-x-4">
              <Link
                href="/products?tag=sale"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition-colors uppercase tracking-wider shadow-lg"
              >
                Claim Deal — ₹4,999 <span className="line-through text-slate-700 ml-1">₹7,499</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
