'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Lock, CreditCard, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { authFetch, errorMessage } from '@/lib/adminApi';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { COUNTRY_OPTIONS, PHONE_COUNTRY_OPTIONS, getAddressRules, getAddressErrors, normalizePhone } from '@corazon/checkout-data';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const cartSubtotal = subtotal();
  // Display estimate only — the server recalculates prices, shipping and discounts.
  const shippingFee = cartSubtotal >= 1999 ? 0 : 99;
  const total = cartSubtotal + shippingFee;

  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [contactPhoneCountry, setContactPhoneCountry] = useState('IN');
  const [recipientPhoneCountry, setRecipientPhoneCountry] = useState('IN');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    street: '',
    street2: '',
    district: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addressRules = getAddressRules(shippingAddress.country);
  const setAddressField = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const changeDeliveryCountry = (country: string) => {
    setShippingAddress((previous) => ({ ...previous, country, city: '', state: '', district: '', postalCode: '' }));
    if (!shippingAddress.phone.trim() && PHONE_COUNTRY_OPTIONS.some((option) => option.value === country)) setRecipientPhoneCountry(country);
    setFieldErrors({});
  };

  const orderPayload = () => ({
    guestEmail: guestEmail.trim(),
    guestPhone: normalizePhone(guestPhone, contactPhoneCountry) || '',
    shippingAddress: { ...shippingAddress, phone: normalizePhone(shippingAddress.phone, recipientPhoneCountry) || '' },
    paymentMethod: 'RAZORPAY',
    items: items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
  });

  const postJson = (path: string, body: unknown) =>
    authFetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const goToConfirmation = (orderId: string) => {
    clearCart();
    const email = guestEmail.trim();
    router.push(`/order-confirmation/${orderId}${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  };

  // NOTE: Full multi-currency payment settlement (USD/EUR/GBP) is a planned future enhancement
  // requiring live FX gateway configurations and multi-currency merchant settlement accounts.
  // Currently, all orders are strictly billed, captured, and settled in Indian Rupees (INR ₹) to prevent customer price mismatch.

  // ─── Razorpay Flow ─────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    if (!(await loadRazorpayScript())) {
      throw new Error('Failed to load payment gateway. Please check your connection and try again.');
    }

    // Step 1: the server prices the cart and opens a gateway order for that exact amount
    const payload = orderPayload();
    const rzpOrderRes = await postJson('/orders/razorpay/create-order', payload);
    if (!rzpOrderRes.ok) {
      throw new Error(await errorMessage(rzpOrderRes, 'Could not initiate payment. Please try again.'));
    }
    const rzpOrder = await rzpOrderRes.json();

    // Step 2: Razorpay popup
    const payment = await openRazorpayCheckout({
      key: rzpOrder.keyId,
      amount: rzpOrder.amount, // paise, server-calculated
      currency: rzpOrder.currency,
      name: 'Corazonetouch',
      description: `Order of ${items.length} item(s)`,
      order_id: rzpOrder.id,
      prefill: {
        name: shippingAddress.fullName,
        email: guestEmail,
        contact: payload.guestPhone,
      },
      theme: { color: '#171717' },
    });

    // Step 3: server verifies the signature and confirms the pending order
    const verifyRes = await postJson('/orders/razorpay/verify', {
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
    });
    if (!verifyRes.ok) {
      throw new Error(await errorMessage(verifyRes, 'Payment verification failed. Please contact support.'));
    }
    goToConfirmation((await verifyRes.json()).id);
  };

  // ─── Main Submit Handler ───────────────────────────────────────────────────
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const payload = orderPayload();
    const validation = getAddressErrors(payload.shippingAddress);
    if (!payload.guestPhone) validation.guestPhone = 'Enter a valid phone number for the selected country calling code.';
    setFieldErrors(validation);
    if (Object.keys(validation).length) {
      setError('Please check the highlighted contact and delivery details.');
      const first = Object.keys(validation)[0];
      document.getElementById(first === 'guestPhone' ? 'contact-phone' : first === 'phone' ? 'recipient-phone' : `shipping-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await handleRazorpay();
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
      <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
        <Lock className="w-4 h-4 text-emerald-600" />
        <span>256-Bit Encrypted Secure Checkout</span>
        <span className="text-neutral-300">·</span>
        <span className="text-neutral-400 font-normal normal-case">Takes under 2 minutes</span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Secure Checkout</h1>
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
              <Input
                id="contact-email"
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="alex@example.com"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                className="min-h-11"
              />
              <PhoneInput
                id="contact-phone"
                label="Phone Number"
                country={contactPhoneCountry}
                onCountryChange={(country) => { setContactPhoneCountry(country); setFieldErrors((previous) => ({ ...previous, guestPhone: undefined })); }}
                value={guestPhone}
                onChange={(value) => { setGuestPhone(value); setFieldErrors((previous) => ({ ...previous, guestPhone: undefined })); }}
                autoComplete="section-contact tel-national"
                error={fieldErrors.guestPhone}
              />
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
                <Select
                  id="shipping-country"
                  label="Delivery Country / Region"
                  required
                  autoComplete="shipping country"
                  value={shippingAddress.country}
                  onChange={(event) => changeDeliveryCountry(event.target.value)}
                  options={[{ value: '', label: 'Select your country / region' }, ...COUNTRY_OPTIONS]}
                  error={fieldErrors.country}
                  className="min-h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  id="shipping-fullName"
                  label="Full Name"
                  required
                  autoComplete="shipping name"
                  maxLength={120}
                  value={shippingAddress.fullName}
                  onChange={(event) => setAddressField('fullName', event.target.value)}
                  error={fieldErrors.fullName}
                  className="min-h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  id="shipping-street"
                  label="Street Address"
                  required
                  autoComplete="shipping address-line1"
                  maxLength={300}
                  placeholder="House or building number and street"
                  value={shippingAddress.street}
                  onChange={(event) => setAddressField('street', event.target.value)}
                  error={fieldErrors.street}
                  className="min-h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  id="shipping-street2"
                  label="Apartment, Suite, Building or Landmark (optional)"
                  autoComplete="shipping address-line2"
                  maxLength={200}
                  value={shippingAddress.street2}
                  onChange={(event) => setAddressField('street2', event.target.value)}
                  className="min-h-11"
                />
              </div>
              {(['district', 'city', 'state', 'postalCode'] as const).map((field) => {
                const rule = addressRules[field];
                if (!rule.visible) return null;
                return (
                  <Input
                    key={field}
                    id={`shipping-${field}`}
                    label={`${rule.label}${rule.required ? '' : ' (optional)'}`}
                    required={rule.required}
                    autoComplete={`shipping ${field === 'postalCode' ? 'postal-code' : field === 'state' ? 'address-level1' : field === 'city' ? 'address-level2' : 'address-level3'}`}
                    maxLength={field === 'postalCode' ? 20 : 100}
                    placeholder={field === 'postalCode' ? addressRules.postalCode.example : undefined}
                    value={shippingAddress[field]}
                    onChange={(event) => setAddressField(field, event.target.value)}
                    error={fieldErrors[field]}
                    className="min-h-11"
                  />
                );
              })}
              <PhoneInput
                id="recipient-phone"
                label="Recipient Phone"
                country={recipientPhoneCountry}
                onCountryChange={(country) => { setRecipientPhoneCountry(country); setFieldErrors((previous) => ({ ...previous, phone: undefined })); }}
                value={shippingAddress.phone}
                onChange={(value) => setAddressField('phone', value)}
                autoComplete="shipping tel-national"
                error={fieldErrors.phone}
              />
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-neutral-200 pb-3">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
              <h2 className="text-sm font-bold text-neutral-900">Payment Method</h2>
              <span className="text-[10px] text-neutral-400 font-semibold ml-auto">Step 3 of 3</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-900 text-white flex items-start space-x-3">
              <CreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-xs block">Razorpay · UPI / Cards / Netbanking</span>
                <span className="text-[11px] opacity-75 mt-0.5 block">Pay securely online with Razorpay</span>
              </div>
            </div>

            {/* Razorpay accepted badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets', 'EMI'].map((m) => (
                <span key={m} className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full">
                  {m}
                </span>
              ))}
            </div>
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
                  Opening Payment Gateway...
                </span>
              </>
            ) : (
              <span>
                {`Pay ₹${total.toLocaleString('en-IN')} via Razorpay`}
              </span>
            )}
          </button>

          <div className="pt-1 flex items-center justify-center space-x-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Payments secured by Razorpay · PCI DSS compliant
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
