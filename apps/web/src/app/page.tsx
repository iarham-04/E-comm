'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Leaf, BookOpen } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import ProductGridCard from '@/components/ProductGridCard';
import TrustBadges from '@/components/TrustBadges';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CATEGORIES, IMAGES, fetchProductCards } from '@/lib/catalog';
import { ARTICLES } from '@/lib/articles';
import { useNewsletter } from '@/lib/useNewsletter';

const JOURNAL_ARTICLES = ARTICLES.slice(0, 3);

export default function Home() {
  const newsletter = useNewsletter();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProductCards({ limit: 12 }).then(setProducts).catch(() => setProducts([]));
  }, []);

  const bestSellers = products.slice(0, 4);
  const giftProducts = products.filter((p: any) => /hamper|gift|box/i.test(`${p.name} ${p.category}`)).slice(0, 4);

  return (
    <div className="space-y-16">
      
      {/* ── 1. HERO: EDITORIAL MAGAZINE COVER ISSUE #01 ─────────────────── */}
      <section className="relative bg-white text-neutral-900 overflow-hidden py-24 sm:py-36 border-b border-neutral-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-100 via-white to-white" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Magazine Cover Issue Pill */}
            <div className="inline-flex items-center space-x-2 bg-[#fafafa] border border-neutral-200 px-3.5 py-1.5 rounded-full text-[11px] text-neutral-600 font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>FRESH FROM THIS SEASON&apos;S HARVEST</span>
            </div>

            {/* Editorial Heading */}
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-tight text-neutral-900">
              Premium Dry Fruits &amp; Nuts,{' '}
              <span className="text-neutral-500">
                Packed Fresh for Your Family
              </span>
            </h1>

            {/* Intro copy */}
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
              Kashmiri Mamra almonds, whole cashews, light-amber walnuts and soft Medjool dates — hand-sorted, hygienically packed and delivered across India. No added preservatives, ever.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2.5 text-sm font-bold px-7 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-md transition-all transform active:scale-95"
              >
                <span>Shop Dry Fruits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/collections/gift-hampers"
                className="inline-flex items-center justify-center space-x-2 text-sm font-bold px-7 py-4 rounded-xl bg-[#fafafa] hover:bg-neutral-100 text-neutral-900 border border-neutral-200 transition-all active:scale-95"
              >
                <span>Explore Gift Hampers</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY GRID ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-2">
          <div>
            <Badge variant="gold" size="sm">SHOP BY CATEGORY</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Our Dry Fruit Range
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.slice(0, 4).map((cat) => (
            <CategoryCard key={cat.slug} name={cat.name} slug={cat.slug} image={cat.image} />
          ))}
        </div>
      </section>

      {/* ── 3. SOURCING STORY SPLIT PANEL ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fafafa] text-neutral-900 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-neutral-200 shadow-sm">
          <div className="p-8 sm:p-14 space-y-6 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-neutral-600 text-xs font-bold uppercase tracking-widest">
              <Leaf className="w-4 h-4" />
              <span>From Orchard to Your Kitchen</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-neutral-900">
              Sourced from the Valleys That Grow Them Best
            </h2>

            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-body">
              We buy almonds and walnuts from growers in Kashmir, cashews from Goa and Kerala, and dates from trusted importers. Every batch is hand-sorted to remove broken and discoloured pieces, then sealed in food-grade, nitrogen-flushed packs so it reaches you as fresh as the day it was packed.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 text-center">
              <div>
                <p className="text-lg font-black text-neutral-900">100%</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Natural</p>
              </div>
              <div>
                <p className="text-lg font-black text-neutral-900">0</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Preservatives</p>
              </div>
              <div>
                <p className="text-lg font-black text-neutral-900">Hand</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Sorted</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full bg-neutral-100">
            <img
              src={IMAGES.walnutsWhole}
              alt="Freshly harvested whole walnuts"
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
            <Badge variant="gold" size="sm">CUSTOMER FAVOURITES</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Best Sellers
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product: any) => (
            <ProductGridCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ── 5. GIFT HAMPERS ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" aria-labelledby="gifts-heading">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <Badge variant="gold" size="sm">FESTIVE GIFTING</Badge>
            <h2 id="gifts-heading" className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dry Fruit Gift Hampers
            </h2>
          </div>
          <Link href="/collections/gift-hampers" className="text-xs font-bold text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors hidden sm:block">
            View All Hampers →
          </Link>
        </div>

        {giftProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftProducts.map((product: any) => (
              <ProductGridCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Custom hampers for Diwali, Eid, weddings and corporate gifting —{' '}
            <Link href="/contact-us" className="font-bold text-slate-900 underline">tell us what you need</Link>.
          </p>
        )}
      </section>

      {/* ── 6. CONTINUOUS TRUST GUARANTEE RIBBON ───────────────────────── */}
      <TrustBadges />

      {/* ── 7. JOURNAL PREVIEW ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Badge variant="gold" size="sm">FROM OUR JOURNAL</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Nutrition &amp; Storage Tips
            </h2>
          </div>
          <Link href="/blog" className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1">
            <span>Visit the Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {JOURNAL_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
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
                <span>Read Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 8. NEWSLETTER SUBSCRIPTION ───────────────────────────────────── */}
      <section className="py-8 max-w-4xl mx-auto px-4">
        <div className="bg-[#fafafa] text-neutral-900 rounded-3xl p-8 sm:p-12 text-center border border-neutral-200 shadow-sm space-y-4">
          <Badge variant="gold" size="sm">JOIN OUR NEWSLETTER</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
            Festive Offers &amp; Fresh Harvest Alerts
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Be the first to know when new-season almonds and walnuts arrive, plus subscriber-only festive discounts and healthy recipes.
          </p>

          {newsletter.status === 'done' ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl font-medium inline-block">
              ✓ You&apos;re subscribed — thank you!
            </div>
          ) : (
            <form onSubmit={newsletter.submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={newsletter.email}
                onChange={(e) => newsletter.setEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
              <Button type="submit" variant="primary" size="md">
                Subscribe
              </Button>
            </form>
          )}
          {newsletter.status === 'error' && (
            <p className="text-xs text-rose-600">Could not subscribe right now. Please try again.</p>
          )}
        </div>
      </section>

    </div>
  );
}
