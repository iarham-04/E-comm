'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Shield, Hammer, Compass, BookOpen } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import ProductGridCard from '@/components/ProductGridCard';
import TrustBadges from '@/components/TrustBadges';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CATEGORIES = [
  { name: 'Medieval', slug: 'medieval', image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', count: 42 },
  { name: 'Viking', slug: 'viking', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', count: 36 },
  { name: 'Roman', slug: 'roman', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', count: 28 },
  { name: 'Home Décor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800', count: 64 },
];

const BEST_SELLERS = [
  { id: 'bs-1', name: 'Full Suit of Templar Knight Armor', slug: 'templar-knight-armor', category: 'Medieval', price: 34999.00, rating: 4.9, reviewsCount: 84, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', stock: 5 },
  { id: 'bs-2', name: 'Hand-Carved Nordic Viking Battle Axe', slug: 'viking-battle-axe', category: 'Viking', price: 8499.00, rating: 4.8, reviewsCount: 112, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', stock: 12 },
  { id: 'bs-3', name: 'Roman Centurion Brass Officer Helmet', slug: 'roman-officer-helmet', category: 'Roman', price: 6299.00, rating: 4.7, reviewsCount: 46, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', stock: 8 },
  { id: 'bs-4', name: 'Gothic Iron Candelabra Set', slug: 'gothic-iron-candelabra', category: 'Home Décor', price: 3499.00, rating: 4.9, reviewsCount: 63, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800', stock: 15 },
];

const GIFT_PRODUCTS = [
  { id: 'g-1', name: 'Gothic Iron Candelabra Set', slug: 'gothic-iron-candelabra', category: 'Home Décor', price: 3499.00, rating: 4.9, reviewsCount: 63, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800', stock: 15 },
  { id: 'g-2', name: 'Medieval Leather & Steel Gauntlets', slug: 'steel-gauntlets', category: 'Medieval', price: 4999.00, rating: 4.6, reviewsCount: 18, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800', stock: 9 },
  { id: 'g-3', name: 'Hand-Forged Damascene Steel Dagger', slug: 'damascene-steel-dagger', category: 'Collectibles', price: 7299.00, rating: 4.9, reviewsCount: 31, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', stock: 6 },
  { id: 'g-4', name: 'Roman Centurion Brass Officer Helmet', slug: 'roman-officer-helmet', category: 'Roman', price: 6299.00, rating: 4.7, reviewsCount: 46, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', stock: 8 },
];

const JOURNAL_ARTICLES = [
  { title: 'History of Spartan Warriors & Shield Metallurgy', slug: 'history-of-spartan-warriors', date: 'OCTOBER 14, 2026', readTime: '5 MIN READ' },
  { title: 'The Forging of Toledo Steel in the High Middle Ages', slug: 'forging-toledo-steel', date: 'SEPTEMBER 28, 2026', readTime: '7 MIN READ' },
  { title: 'Armour Preservation & Care in Modern Interiors', slug: 'armour-preservation-care', date: 'SEPTEMBER 12, 2026', readTime: '4 MIN READ' },
];

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16">
      
      {/* ── 1. HERO: EDITORIAL MAGAZINE COVER ISSUE #01 ─────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 sm:py-36 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/30 via-slate-950 to-slate-950" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Magazine Cover Issue Pill */}
            <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-amber-400 font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ISSUE #01 · THE COLLECTOR&apos;S EDITION</span>
            </div>

            {/* Editorial Cormorant Garamond Heading */}
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              Where Ancient Craftsmanship Meets the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                Modern Collector&apos;s Heart
              </span>
            </h1>

            {/* Left-Aligned Monograph Copy (60-75 chars line length) */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
              Museum-grade medieval armor, hand-carved Viking battle axes, and bespoke artisanal home decor. Forged by master blacksmiths, historically researched, and built to outlast the century it was inspired by.
            </p>

            {/* Action Buttons: Single Primary CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2.5 text-sm font-black px-7 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-95"
              >
                <span>Explore Issue #01</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/journal/forging-toledo-steel"
                className="inline-flex items-center justify-center space-x-2 text-sm font-bold px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-amber-400/50 backdrop-blur-md transition-all active:scale-95"
              >
                <span>Read Toledo Monograph</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. CURATED EDITORIAL COLLECTIONS GRID ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-2">
          <div>
            <Badge variant="gold" size="sm">ARCHIVAL CATEGORIES</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Curated Editorial Collections
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>Explore All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} name={cat.name} slug={cat.slug} image={cat.image} itemCount={cat.count} />
          ))}
        </div>
      </section>

      {/* ── 3. ARTISAN BLACKSMITH MONOGRAPH SPLIT PANEL ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-800 shadow-2xl">
          <div className="p-8 sm:p-14 space-y-6 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Hammer className="w-4 h-4" />
              <span>Toledo &amp; Nuremberg Metallurgy</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Hand-Forged 1095 Carbon Steel Metallurgy
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-body">
              Every piece in our armor collection is individually hammer-worked from 2mm high-carbon forged steel. Plates are oil-quenched at 58 HRC hardness to achieve the iconic blackened patina that historical knights relied upon for corrosion resistance against field moisture.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
              <div>
                <p className="text-lg font-black text-amber-400">1095</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Carbon Steel</p>
              </div>
              <div>
                <p className="text-lg font-black text-amber-400">58 HRC</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Quenched</p>
              </div>
              <div>
                <p className="text-lg font-black text-amber-400">100%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Hand-Forged</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=1200"
              alt="Artisan Blacksmith Forging Steel"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── 4. BEST SELLERS ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Badge variant="gold" size="sm">COLLECTOR FAVORITES</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Best Sellers &amp; Rare Artifacts
            </h2>
          </div>
          <Link href="/products?tag=best-sellers" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BEST_SELLERS.map((product) => (
            <ProductGridCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ── 5. GIFTS FOR THE COLLECTOR ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" aria-labelledby="gifts-heading">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <Badge variant="gold" size="sm">CURATED GIFT GUIDE</Badge>
            <h2 id="gifts-heading" className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gifts for the Collector
            </h2>
          </div>
          <Link href="/collections/gifts" className="text-xs font-bold text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors hidden sm:block">
            View Full Gift Guide →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GIFT_PRODUCTS.map((product) => (
            <ProductGridCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ── 6. CONTINUOUS TRUST GUARANTEE RIBBON ───────────────────────── */}
      <TrustBadges />

      {/* ── 7. HISTORICAL LORE DIGEST & JOURNAL PREVIEW ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Badge variant="gold" size="sm">ARCHIVAL MONOGRAPHS</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Historical Lore Digest
            </h2>
          </div>
          <Link href="/blog" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>Visit the Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {JOURNAL_ARTICLES.map((article, idx) => (
            <Link
              key={idx}
              href={`/journal/${article.slug}`}
              className="group bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{article.date} · {article.readTime}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                  {article.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:underline inline-flex items-center space-x-1 mt-6">
                <span>Read Monograph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 8. NEWSLETTER SUBSCRIPTION ───────────────────────────────────── */}
      <section className="py-8 max-w-4xl mx-auto px-4">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-800 shadow-2xl space-y-4">
          <Badge variant="gold" size="sm">JOIN THE COLLECTOR&apos;S CIRCLE</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Priority Workshop Access &amp; Lore Digests
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Subscribe to receive priority notifications for rare workshop releases, historical monographs, and artisan stories.
          </p>

          {newsletterSubscribed ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs p-4 rounded-xl font-medium inline-block">
              ✓ Welcome to the Collector&apos;s Circle.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <Button type="submit" variant="primary" size="md">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
