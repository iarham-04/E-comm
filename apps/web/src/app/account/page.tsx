'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Heart, MapPin, Star, ChevronDown, ChevronUp, RotateCcw, ShoppingBag } from 'lucide-react';

const DEMO_ORDERS = [
  {
    id: 'CT-9821',
    date: '2026-07-20',
    total: 34999.00,
    status: 'SHIPPED',
    estimatedDelivery: 'July 28, 2026',
    items: [
      { name: 'Full Suit of Templar Knight Armor', qty: 1, price: 34999.00, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=200', slug: 'templar-knight-armor' },
    ],
  },
  {
    id: 'CT-8412',
    date: '2026-06-14',
    total: 8499.00,
    status: 'DELIVERED',
    estimatedDelivery: 'June 20, 2026',
    items: [
      { name: 'Hand-Carved Nordic Viking Battle Axe', qty: 1, price: 8499.00, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200', slug: 'viking-battle-axe' },
    ],
  },
];

const STATUS_STYLES: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

const DEMO_ADDRESSES = [
  { id: 'addr-1', label: 'Home', name: 'Alexander Vance', street: '42, Marine Drive', city: 'Mumbai', state: 'Maharashtra', pin: '400001', isDefault: true },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const TABS = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

      {/* Account Hero Card */}
      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #d4a853, transparent 60%)' }} />
        <div className="relative space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Collector Account</span>
          <h1 className="font-display text-3xl font-black text-white">Welcome Back, Collector</h1>
          <p className="text-slate-400 text-xs">Member since June 2026 · Corazonetouch Verified Collector</p>
        </div>
        <div className="relative flex gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-white">{DEMO_ORDERS.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Orders</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-black text-white">₹{DEMO_ORDERS.reduce((a, o) => a + o.total, 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Spent</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-black text-white flex items-center justify-center space-x-1">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>3</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wishlist</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 text-sm font-bold pb-3 px-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Order History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {DEMO_ORDERS.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-900">No orders yet</p>
              <p className="text-xs text-slate-500 mt-1">Your curated collection awaits.</p>
              <Link href="/products" className="inline-block mt-4 bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl">
                Explore Catalog
              </Link>
            </div>
          ) : (
            DEMO_ORDERS.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{order.id}</span>
                    <p className="text-xs text-slate-500">Placed {order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label="Toggle order details"
                    >
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Items */}
                {expandedOrder === order.id && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50/50">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.slug}`} className="text-xs font-bold text-slate-900 hover:text-amber-700 line-clamp-1">
                            {item.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 block">Qty: {item.qty}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Link
                        href={`/track-order`}
                        className="flex items-center justify-center space-x-1.5 text-xs font-bold border border-slate-300 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Track Shipment</span>
                      </Link>
                      {order.status === 'DELIVERED' && (
                        <>
                          <button className="flex items-center justify-center space-x-1.5 text-xs font-bold border border-slate-300 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <Star className="w-3.5 h-3.5" />
                            <span>Write a Review</span>
                          </button>
                          <button className="flex items-center justify-center space-x-1.5 text-xs font-bold border border-slate-300 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Address Book */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          {DEMO_ADDRESSES.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <MapPin className="w-4 h-4 text-slate-700" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800">{addr.name}</p>
                  <p className="text-slate-500">{addr.street}, {addr.city}</p>
                  <p className="text-slate-500">{addr.state} — {addr.pin}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Edit</button>
                <button className="text-xs font-semibold text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Remove</button>
              </div>
            </div>
          ))}

          <button className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-4 text-xs font-bold text-slate-500 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center justify-center space-x-2">
            <span>+ Add New Address</span>
          </button>
        </div>
      )}
    </div>
  );
}
