'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, ArrowRight, Package, Truck, CreditCard, 
  Banknote, MapPin, ShieldCheck, Clock, ExternalLink, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { API_URL } from '@/lib/api';
import { authFetch } from '@/lib/adminApi';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number | string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
    price?: number | string;
  };
  variant?: {
    size?: string;
    color?: string;
  };
}

interface OrderData {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number | string;
  shippingFee: number | string;
  discountAmount: number | string;
  total: number | string;
  deliverySpeed: string;
  createdAt: string;
  addressSnapshot?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  items: OrderItem[];
}

/** Order confirmation page: fetches the placed order and displays its payment method (Razorpay, or legacy COD) and status. */
export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    /** Loads the order by ID, optionally scoped by the guest email query param. */
    async function fetchOrder() {
      try {
        setLoading(true);
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const email = urlParams?.get('email') || '';

        const url = `${API_URL}/orders/${encodeURIComponent(params.id)}${email ? `?email=${encodeURIComponent(email)}` : ''}`;
        const res = await authFetch(url);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const subtotalNum = order ? Number(order.subtotal || 0) : 0;
  const shippingNum = order ? Number(order.shippingFee || 0) : 0;
  const discountNum = order ? Number(order.discountAmount || 0) : 0;
  const totalNum = order ? Number(order.total || 0) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Order Confirmed &amp; Authenticated
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3">
              Thank You for Your Order
            </h1>
            <p className="text-xs text-neutral-500 mt-2">
              A formal confirmation receipt has been dispatched to your email. Your unique order reference is:
            </p>
            <div className="inline-block mt-2 bg-neutral-100 border border-neutral-200 px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-900">
              #{params.id}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 border-t border-neutral-100">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>Est. Delivery: <strong>3–5 Business Days</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sealed Fresh Packaging</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto" />
            <p className="text-xs text-neutral-500">Retrieving your itemized order receipt...</p>
          </div>
        )}

        {/* Itemized Order Content */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Items Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <Package className="w-5 h-5 text-neutral-700" />
                  <h2 className="font-display text-lg font-bold text-neutral-900">Itemized Order Receipt</h2>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-neutral-100">
                {order.items?.map((item) => {
                  const unitPrice = Number(item.priceAtPurchase || 0);
                  const lineTotal = unitPrice * item.quantity;
                  const imgUrl = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=300';

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 min-w-0">
                        <img 
                          src={imgUrl} 
                          alt={item.product?.name || 'Product'} 
                          className="w-16 h-16 rounded-xl object-cover bg-neutral-100 border border-neutral-200/60 shrink-0" 
                        />
                        <div className="min-w-0">
                          <Link 
                            href={item.product?.slug ? `/products/${item.product.slug}` : '#'} 
                            className="font-bold text-neutral-900 text-sm hover:text-[#B38728] transition-colors truncate block"
                          >
                            {item.product?.name || 'Item'}
                          </Link>
                          {(item.variant?.size || item.variant?.color) && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {[item.variant.size, item.variant.color].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            Qty: <strong className="text-neutral-800">{item.quantity}</strong> × ₹{unitPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-display">
                        <span className="text-sm font-black text-neutral-900">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-sans uppercase font-bold tracking-wider">INR</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border-t border-neutral-100 pt-5 space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-neutral-900 font-display text-sm">₹{subtotalNum.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier &amp; Protective Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {shippingNum === 0 ? 'FREE (Express Insured)' : `₹${shippingNum.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promotional Discount Applied</span>
                    <span>-₹{discountNum.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200/80 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-neutral-900 block">Total Amount</span>
                    <span className="text-[10px] text-neutral-400">Inclusive of all applicable taxes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-neutral-900 font-display">
                      ₹{totalNum.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">INR (₹)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Payment Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-neutral-900 font-bold text-xs uppercase tracking-wider border-b border-neutral-100 pb-2.5">
                  <MapPin className="w-4 h-4 text-[#B38728]" />
                  <span>Delivery Address</span>
                </div>
                {order.addressSnapshot ? (
                  <div className="text-xs text-neutral-600 space-y-1 leading-relaxed">
                    <p className="font-bold text-neutral-900 text-sm">{order.addressSnapshot.fullName || 'Customer'}</p>
                    <p>{order.addressSnapshot.street}</p>
                    <p>{[order.addressSnapshot.city, order.addressSnapshot.state, order.addressSnapshot.postalCode].filter(Boolean).join(', ')}</p>
                    <p className="text-neutral-500">{order.addressSnapshot.country || 'India'}</p>
                    {order.addressSnapshot.phone && (
                      <p className="text-neutral-500 pt-1 font-mono text-[11px]">Phone: {order.addressSnapshot.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">Standard customer address on file.</p>
                )}
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-neutral-900 font-bold text-xs uppercase tracking-wider border-b border-neutral-100 pb-2.5">
                  {order.paymentMethod === 'COD' ? (
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Payment Information</span>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Method</span>
                    <span className="font-bold text-neutral-900">
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Razorpay Online Payment'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Payment Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      order.paymentStatus === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.paymentStatus === 'PAID' ? '✓ Paid Securely' : 'Payment Due on Delivery'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Currency</span>
                    <span className="font-bold text-neutral-900">Indian Rupees (INR ₹)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if order failed to load from API */}
        {!loading && (error || !order) && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 text-center space-y-3 shadow-xs">
            <p className="text-xs text-neutral-600">
              Your order reference has been confirmed. You can track full logistics updates directly with your order ID.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/track-order" variant="secondary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Track Order Logistics
          </Button>
          <Button href="/products" variant="outline">
            Continue Exploring Collections
          </Button>
        </div>

      </div>
    </div>
  );
}
