'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, Feather } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';
import { useNewsletter } from '@/lib/useNewsletter';

const [FEATURED_ARTICLE, ...RECENT] = ARTICLES;

const CATEGORY_COLORS: Record<string, string> = {
  'Buying Guide': 'bg-amber-50 text-amber-800',
  Nutrition: 'bg-emerald-50 text-emerald-700',
  Storage: 'bg-slate-100 text-slate-700',
  Gifting: 'bg-rose-50 text-rose-700',
};

export default function BlogPage() {
  const newsletter = useNewsletter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2 text-amber-700">
          <Feather className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">The Corazonetouch Journal</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Nutrition, Storage<br />&amp; Buying Guides
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Practical guides to choosing, storing and enjoying dry fruits and nuts —
          written for everyday Indian kitchens.
        </p>
      </div>

      {/* Featured Article — Hero */}
      <Link href={`/blog/${FEATURED_ARTICLE.slug}`} className="group block">
        <div className="relative rounded-3xl overflow-hidden aspect-[16/7] bg-slate-900">
          <img
            src={FEATURED_ARTICLE.image}
            alt={FEATURED_ARTICLE.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
            <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 ${CATEGORY_COLORS[FEATURED_ARTICLE.category]}`}>
              {FEATURED_ARTICLE.category}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-black text-white max-w-3xl leading-tight group-hover:text-amber-200 transition-colors">
              {FEATURED_ARTICLE.title}
            </h2>
            <p className="text-slate-300 text-sm mt-3 max-w-2xl leading-relaxed line-clamp-2 hidden sm:block">
              {FEATURED_ARTICLE.excerpt}
            </p>
            <div className="flex items-center space-x-4 mt-4 text-slate-400 text-xs">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{FEATURED_ARTICLE.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{FEATURED_ARTICLE.readTime}</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400 font-bold group-hover:underline">
                <span>Read Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Article Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Recent Articles</h2>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
            <BookOpen className="w-4 h-4" />
            <span>{RECENT.length} Articles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECENT.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className={`inline-block self-start text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-600'}`}>
                  {article.category}
                </span>
                <h3 className="font-display font-bold text-slate-900 text-sm leading-snug line-clamp-3 group-hover:text-amber-700 transition-colors flex-1">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400">
                  <span>{article.date}</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-slate-900 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d4a853 0%, transparent 70%)' }}
        />
        <div className="relative space-y-4 max-w-xl mx-auto">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Newsletter</span>
          <h2 className="font-display text-3xl font-black text-white">
            Get New Guides &amp; Festive Offers
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            New articles, fresh-harvest arrivals and subscriber-only discounts. No spam.
          </p>
          {newsletter.status === 'done' ? (
            <p className="text-emerald-300 text-sm font-semibold mt-6">✓ You&apos;re subscribed — thank you!</p>
          ) : (
          <form
            className="flex flex-col sm:flex-row items-center gap-3 mt-6 max-w-sm mx-auto"
            onSubmit={newsletter.submit}
          >
            <input
              type="email"
              required
              value={newsletter.email}
              onChange={(e) => newsletter.setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 w-full px-4 py-3 rounded-xl text-xs bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 transition-colors text-slate-900 font-bold text-xs px-6 py-3 rounded-xl whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          )}
          {newsletter.status === 'error' && (
            <p className="text-rose-300 text-xs">Could not subscribe right now. Please try again.</p>
          )}
          <p className="text-[11px] text-slate-600">Unsubscribe at any time. We respect your inbox.</p>
        </div>
      </div>

    </div>
  );
}
