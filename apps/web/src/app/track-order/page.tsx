'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Circle, MapPin, Package, Truck, Star, Phone } from 'lucide-react';
import Link from 'next/link';

const ORDER_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: Package, description: 'We received your order and it entered our verification queue.' },
  { id: 'confirmed', label: 'Workshop Confirmed', icon: CheckCircle2, description: 'Our curatorial team has verified authenticity and prepared the item.' },
  { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your piece has been handed to our specialist courier partner.' },
  { id: 'delivered', label: 'Delivered', icon: Star, description: 'Your artifact has arrived. We hope it exceeds every expectation.' },
];

function getStepIndex(status: string) {
  const map: Record<string, number> = {
    PLACED: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };
  return map[status] ?? 0;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSearched(true);
      setLoading(false);
      setTrackedOrder({
        id: orderId || 'CT-12345',
        status: 'SHIPPED',
        estimatedDelivery: 'July 28, 2026',
        item: 'Full Suit of Templar Knight Armor',
        courier: 'Delhivery Express',
        trackingNumber: 'DL-789023456IN',
        shippedTo: 'Mumbai, Maharashtra 400001',
      });
    }, 900);
  };

  const activeStep = trackedOrder ? getStepIndex(trackedOrder.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-10">

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Order Tracking</span>
        <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Where Is My Order?</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Every piece travels with care. Enter your reference ID and email to see real-time shipping progress.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleTrack}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Order Reference ID</label>
            <input
              type="text"
              required
              placeholder="e.g. CT-12345"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-60"
        >
          {loading ? (
            <span className="animate-pulse">Searching...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track My Order</span>
            </>
          )}
        </button>
      </form>

      {/* Tracking Results */}
      {searched && trackedOrder && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Order Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Reference</span>
                <p className="font-mono font-black text-white text-lg mt-0.5">#{trackedOrder.id}</p>
              </div>
              <span className="self-start sm:self-auto inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5" />
                <span>{trackedOrder.status}</span>
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Item</span>
                <p className="font-bold text-slate-900 leading-snug">{trackedOrder.item}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Courier</span>
                <p className="font-bold text-slate-900">{trackedOrder.courier}</p>
                <p className="text-slate-500 font-mono">{trackedOrder.trackingNumber}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Delivering To</span>
                <p className="font-bold text-slate-900 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{trackedOrder.shippedTo}</span>
                </p>
              </div>
            </div>

            <div className="px-6 pb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700 font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Estimated Delivery: <span className="font-black">{trackedOrder.estimatedDelivery}</span></span>
              </div>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-8">Shipment Progress</h2>

            <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-emerald-500 transition-all duration-700"
                style={{ width: `${(activeStep / (ORDER_STEPS.length - 1)) * (100 - (10 / ORDER_STEPS.length))}%` }}
              />

              <div className="relative grid grid-cols-4 gap-2">
                {ORDER_STEPS.map((step, idx) => {
                  const done = idx <= activeStep;
                  const active = idx === activeStep;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        done
                          ? active
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110'
                            : 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-300'
                      }`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-[10px] font-bold leading-tight ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-[9px] text-amber-600 font-semibold animate-pulse">In Progress</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Step Description */}
            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">{ORDER_STEPS[activeStep]?.label}</span>
              <span className="text-amber-800">{ORDER_STEPS[activeStep]?.description}</span>
            </div>
          </div>

          {/* Support CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 gap-4">
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">Need help with your shipment?</p>
              <p>Our concierge team is available Mon–Sat, 10 AM – 6 PM IST.</p>
            </div>
            <Link
              href="/contact-us"
              className="flex items-center space-x-2 bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Concierge</span>
            </Link>
          </div>
        </div>
      )}

      {/* Not Found State */}
      {searched && !trackedOrder && (
        <div className="bg-white rounded-3xl border border-rose-200 p-10 text-center space-y-3">
          <p className="text-2xl">🔍</p>
          <h2 className="font-bold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500">Please double-check your Order ID and email address, or contact our concierge team for assistance.</p>
          <Link href="/contact-us" className="inline-block mt-2 text-xs font-bold text-amber-700 hover:underline">
            Contact Support →
          </Link>
        </div>
      )}
    </div>
  );
}
