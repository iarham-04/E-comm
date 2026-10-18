'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Package, Heart, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { authFetch } from '@/lib/adminApi';
import { useWishlistStore } from '@/store/useWishlistStore';
import { FALLBACK_IMAGE } from '@/lib/catalog';

interface Order {
  id: string;
  createdAt: string;
  total: string | number;
  status: string;
  addressSnapshot?: { fullName?: string; street?: string; city?: string; state?: string; postalCode?: string; phone?: string };
  items: { quantity: number; priceAtPurchase: string | number; product?: { name: string; slug: string; images?: string[] } }[];
}

const STATUS_STYLES: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

const TABS = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
] as const;

const inr = (n: string | number) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AccountPage() {
  const { user } = useUser();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    authFetch(`${API_URL}/orders/my-orders`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setOrders)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + Number(o.total), 0);

  // Unique delivery addresses from past orders (no separate address book on the server)
  const addresses = Array.from(
    new Map(
      orders
        .map((o) => o.addressSnapshot)
        .filter((a): a is NonNullable<Order['addressSnapshot']> => !!a?.street)
        .map((a) => [`${a.street}|${a.postalCode}`, a]),
    ).values(),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Account Hero Card */}
      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #d4a853, transparent 60%)' }} />
        <div className="relative space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">My Account</span>
          <h1 className="font-display text-3xl font-black text-white">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          {user?.createdAt && <p className="text-slate-400 text-xs">Member since {formatDate(user.createdAt)}</p>}
        </div>
        <div className="relative flex gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-white">{orders.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Orders</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-black text-white">{inr(totalSpent)}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Spent</p>
          </div>
          <div className="w-px bg-white/10" />
          <Link href="/wishlist">
            <p className="text-2xl font-black text-white flex items-center justify-center space-x-1">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>{wishlistCount}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wishlist</p>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-1.5 text-sm font-bold pb-3 px-2 border-b-2 transition-all ${
              activeTab === id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          We couldn&apos;t load your orders right now. Please refresh the page or try again later.
        </p>
      ) : activeTab === 'orders' ? (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-900">No orders yet</p>
              <p className="text-xs text-slate-500 mt-1">Your first pack of fresh dry fruits is a click away.</p>
              <Link href="/products" className="inline-block mt-4 bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl">
                Shop Now
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{order.id.slice(-6).toUpperCase()}</span>
                    <p className="text-xs text-slate-500">Placed {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">{inr(order.total)}</span>
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

                {expandedOrder === order.id && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50/50">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <img src={item.product?.images?.[0] || FALLBACK_IMAGE} alt={item.product?.name || 'Product'} className="w-14 h-14 object-cover rounded-xl bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {item.product ? (
                            <Link href={`/products/${item.product.slug}`} className="text-xs font-bold text-slate-900 hover:text-amber-700 line-clamp-1">
                              {item.product.name}
                            </Link>
                          ) : (
                            <span className="text-xs font-bold text-slate-900">Item</span>
                          )}
                          <span className="text-[11px] text-slate-500 block">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{inr(Number(item.priceAtPurchase) * item.quantity)}</span>
                      </div>
                    ))}
                    <Link
                      href={`/order-confirmation/${order.id}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold border border-slate-300 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>View Order Details</span>
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-6">
              Addresses you use at checkout will appear here.
            </p>
          ) : (
            addresses.map((addr, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start space-x-3 text-xs">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <MapPin className="w-4 h-4 text-slate-700" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">{addr.fullName}</p>
                  <p className="text-slate-500">{addr.street}, {addr.city}</p>
                  <p className="text-slate-500">{addr.state} — {addr.postalCode}</p>
                  {addr.phone && <p className="text-slate-500">{addr.phone}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
