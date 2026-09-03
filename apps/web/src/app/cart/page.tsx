'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCartStore();

  const cartSubtotal = subtotal();
  const shippingFee = cartSubtotal > 1999 ? 0 : 99;
  const total = cartSubtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 max-w-md mx-auto shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 mt-2 mb-6">Explore our curated collections of authentic medieval armor and collectibles.</p>
          <Link
            href="/products"
            className="inline-block bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 flex space-x-4 items-center justify-between">
              <div className="flex space-x-4 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-slate-100" />
                <div>
                  <Link href={`/products/${item.slug}`} className="font-bold text-slate-900 text-sm hover:text-amber-600">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <span className="block text-xs text-slate-500 mt-0.5">Variant: {item.variantName}</span>
                  )}
                  <span className="block text-sm font-black text-slate-900 mt-1">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => clearCart()}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Remove all items
            </button>
            <Link href="/products" className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors">
              ← Back to Catalog
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 h-fit shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          <div className="space-y-2 text-xs text-slate-600 border-b border-slate-200 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black text-slate-900">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-slate-900 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors shadow-md block text-center"
          >
            <span>Proceed to Checkout · ₹{total.toLocaleString('en-IN')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
