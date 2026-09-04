'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Lock, CreditCard, Banknote, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const cartSubtotal = subtotal();
  const shippingFee = cartSubtotal > 1999 ? 0 : 99;
  const total = cartSubtotal + shippingFee;

  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build the common order payload
  const buildOrderPayload = (extras?: Record<string, any>) => ({
    guestEmail,
    guestPhone: shippingAddress.phone || guestPhone,
    shippingAddress,
    paymentMethod,
    items: items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      price: i.price,
    })),
    ...extras,
  });

  // ─── COD Flow ──────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildOrderPayload()),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Failed to place order. Please try again.');
    }

    const data = await res.json();
    clearCart();
    router.push(`/order-confirmation/${data.id || 'order-success'}`);
  };

  // ─── Razorpay Flow ─────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    // Step 1: Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load payment gateway. Please check your connection and try again.');
    }

    // Step 2: Create Razorpay order on backend
    const rzpOrderRes = await fetch(`${API_URL}/orders/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountInRupees: total }),
    });

    if (!rzpOrderRes.ok) {
      const err = await rzpOrderRes.json().catch(() => ({}));
      throw new Error(err?.message || 'Could not initiate payment. Please try again.');
    }

    const rzpOrder = await rzpOrderRes.json();

    // Step 3: Open Razorpay popup
    const payment = await openRazorpayCheckout({
      key: RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,        // in paise from backend
      currency: rzpOrder.currency,
      name: 'Corazonetouch',
      description: `Order of ${items.length} item(s)`,
      order_id: rzpOrder.id,
      prefill: {
        name: shippingAddress.fullName,
        email: guestEmail,
        contact: shippingAddress.phone || guestPhone,
      },
      theme: { color: '#171717' },
    });

    // Step 4: Verify signature on backend & create order
    const verifyRes = await fetch(`${API_URL}/orders/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
        order: buildOrderPayload({ paymentMethod: 'RAZORPAY' }),
      }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => ({}));
      throw new Error(err?.message || 'Payment verification failed. Please contact support.');
    }

    const dbOrder = await verifyRes.json();
    clearCart();
    router.push(`/order-confirmation/${dbOrder.id || 'order-success'}`);
  };

  // ─── Main Submit Handler ───────────────────────────────────────────────────
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === 'COD') {
        await handleCOD();
      } else {
        await handleRazorpay();
      }
    } catch (err: any) {
      // User dismissed Razorpay popup — don't show an error
      if (err?.message?.includes('cancelled by user')) {
        setError(null);
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-lg font-bold text-neutral-900">Your cart is empty.</p>
        <a href="/products" className="inline-block text-xs font-bold bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">
        <Lock className="w-4 h-4 text-emerald-600" />
        <span>256-Bit Encrypted Secure Checkout</span>
        <span className="text-neutral-300">·</span>
        <span className="text-neutral-400 font-normal normal-case">Takes under 2 minutes</span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Left: Form Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Contact */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-neutral-200 pb-3">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="text-sm font-bold text-neutral-900">Contact Details</h2>
              <span className="text-[10px] text-neutral-400 font-semibold ml-auto">Step 1 of 3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-neutral-200 pb-3">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
              <h2 className="text-sm font-bold text-neutral-900">Delivery Address</h2>
              <span className="text-[10px] text-neutral-400 font-semibold ml-auto">Step 2 of 3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Full Name</label>
                <input type="text" required placeholder="Alexander Vance"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Street Address</label>
                <input type="text" required placeholder="House / Flat No., Street, Landmark"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">City</label>
                <input type="text" required placeholder="Mumbai"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">State</label>
                <input type="text" required placeholder="Maharashtra"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Postal Pincode</label>
                <input type="text" required placeholder="400001"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Recipient Phone</label>
                <input type="tel" required placeholder="+91 9876543210"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-neutral-200 pb-3">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
              <h2 className="text-sm font-bold text-neutral-900">Payment Method</h2>
              <span className="text-[10px] text-neutral-400 font-semibold ml-auto">Step 3 of 3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Razorpay — default & recommended */}
              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    Razorpay · UPI / Cards / Netbanking
                  </span>
                  <span className="text-[11px] opacity-75 mt-0.5 block">
                    Pay securely via India&apos;s #1 payment gateway
                  </span>
                  {paymentMethod === 'RAZORPAY' && (
                    <span className="inline-block mt-1.5 text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                      ✓ Recommended
                    </span>
                  )}
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Banknote className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-xs block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] opacity-75 mt-0.5 block">
                    Pay cash when the parcel arrives
                  </span>
                </div>
              </button>
            </div>

            {/* Razorpay accepted badges */}
            {paymentMethod === 'RAZORPAY' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets', 'EMI'].map((m) => (
                  <span key={m} className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 h-fit shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">Order Summary</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto border-b border-neutral-200 pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-neutral-900">{item.name}</span>
                  <span className="block text-neutral-500">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-neutral-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-neutral-600 border-b border-neutral-200 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-sm font-bold text-neutral-900">Total Due</span>
            <span className="text-2xl font-black text-neutral-900">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-neutral-900 text-white font-bold text-xs py-4 px-4 rounded-xl hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {paymentMethod === 'RAZORPAY' ? 'Opening Payment Gateway...' : 'Placing Order...'}
                </span>
              </>
            ) : (
              <span>
                {paymentMethod === 'RAZORPAY'
                  ? `Pay ₹${total.toLocaleString('en-IN')} via Razorpay`
                  : `Place Order · ₹${total.toLocaleString('en-IN')} COD`}
              </span>
            )}
          </button>

          <div className="pt-1 flex items-center justify-center space-x-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {paymentMethod === 'RAZORPAY'
                ? 'Payments secured by Razorpay · PCI DSS compliant'
                : 'Pay safely on delivery — no upfront risk'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
