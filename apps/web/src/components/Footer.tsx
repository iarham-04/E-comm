'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#fafafa] text-neutral-500 pt-16 pb-12 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Brand & Newsletter Hero Header inside Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 border-b border-neutral-200 items-center">
          <div className="space-y-3 lg:col-span-2">
            <Link href="/" className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <span>🛡️</span>
              <span className="font-display tracking-wider">CORAZONETOUCH</span>
            </Link>
            <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
              Where ancient craftsmanship meets the modern collector&apos;s heart. Hand-forged artifacts, museum-grade reproductions, and timeless interior decor built to last generations.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-medium">
                ✓ Thank you for subscribing to the Collector&apos;s Journal.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email for journal updates"
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
          </div>
        </div>

        {/* Directory Grid — 6 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products" className="hover:text-neutral-900 transition-colors">All Products</Link></li>
              <li><Link href="/products?tag=new-arrivals" className="hover:text-neutral-900 transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?tag=best-sellers" className="hover:text-neutral-900 transition-colors">Best Sellers</Link></li>
              <li><Link href="/products?tag=limited-edition" className="hover:text-neutral-900 transition-colors">Limited Edition</Link></li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Collections</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/collections/medieval" className="hover:text-neutral-900 transition-colors">Medieval</Link></li>
              <li><Link href="/collections/viking" className="hover:text-neutral-900 transition-colors">Viking</Link></li>
              <li><Link href="/collections/roman" className="hover:text-neutral-900 transition-colors">Roman</Link></li>
              <li><Link href="/collections/home-decor" className="hover:text-neutral-900 transition-colors">Home Décor</Link></li>
              <li><Link href="/collections/collectibles" className="hover:text-neutral-900 transition-colors">Collectibles</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contact-us" className="hover:text-neutral-900 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-neutral-900 transition-colors">FAQs</Link></li>
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
          <p className="text-[11px]">Museum-Grade · Hand-Forged · 256-Bit Encrypted Checkout</p>
        </div>

      </div>
    </footer>
  );
}
