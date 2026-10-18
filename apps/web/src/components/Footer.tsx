'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/catalog';
import { useNewsletter } from '@/lib/useNewsletter';

export default function Footer() {
  const { email, setEmail, status, submit } = useNewsletter();

  return (
    <footer className="bg-[#fafafa] text-neutral-500 pt-16 pb-12 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Brand & Newsletter Hero Header inside Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 border-b border-neutral-200 items-center">
          <div className="space-y-3 lg:col-span-2">
            <Link href="/" className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <span>🌰</span>
              <span className="font-display tracking-wider">CORAZONETOUCH</span>
            </Link>
            <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
              Premium dry fruits and nuts — Kashmiri almonds, whole cashews, walnuts, dates and festive gift hampers — hand-sorted and packed fresh for families across India.
            </p>
          </div>

          <div>
            {status === 'done' ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-medium">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={submit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email for offers & new arrivals"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
                <button
                  type="submit"
                  className="bg-neutral-900 text-white font-bold px-4 py-2.5 text-xs rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
            {status === 'error' && <p className="text-[11px] text-rose-600 mt-2">Could not subscribe right now. Please try again.</p>}
          </div>
        </div>

        {/* Directory Grid — 6 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products" className="hover:text-neutral-900 transition-colors">All Products</Link></li>
              <li><Link href="/collections/gift-hampers" className="hover:text-neutral-900 transition-colors">Gift Hampers</Link></li>
              <li><Link href="/cart" className="hover:text-neutral-900 transition-colors">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-neutral-900 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}><Link href={`/collections/${c.slug}`} className="hover:text-neutral-900 transition-colors">{c.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contact-us" className="hover:text-neutral-900 transition-colors">Contact</Link></li>
              <li><Link href="/pages/help-center" className="hover:text-neutral-900 transition-colors">FAQs</Link></li>
              <li><Link href="/pages/shipping" className="hover:text-neutral-900 transition-colors">Shipping</Link></li>
              <li><Link href="/pages/returns" className="hover:text-neutral-900 transition-colors">Returns</Link></li>
              <li><Link href="/track-order" className="hover:text-neutral-900 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/pages/about" className="hover:text-neutral-900 transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-neutral-900 transition-colors">Journal</Link></li>
              <li><Link href="/pages/careers" className="hover:text-neutral-900 transition-colors">Careers</Link></li>
              <li><Link href="/pages/sustainability" className="hover:text-neutral-900 transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/pages/privacy-policy" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/pages/terms" className="hover:text-neutral-900 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/pages/cookie-policy" className="hover:text-neutral-900 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 6: Social */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Social</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Instagram</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Pinterest</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Facebook</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">YouTube</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Corazonetouch. All rights reserved.</p>
          <p className="text-[11px]">Hand-Sorted · Packed Fresh · Secure Checkout</p>
        </div>

      </div>
    </footer>
  );
}
