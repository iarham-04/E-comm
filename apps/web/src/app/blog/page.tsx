'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, Feather } from 'lucide-react';

const FEATURED_ARTICLE = {
  slug: 'the-art-of-medieval-metallurgy',
  title: 'The Art of Medieval Metallurgy: How Armorsmiths Forged History',
  excerpt:
    'From the glowing furnace of a 12th-century forge to the pristine display cases of the Royal Armouries Museum, discover the painstaking craft behind every authentic piece in the Corazonetouch collection.',
  category: 'Craftsmanship',
  readTime: '9 min read',
  date: 'July 18, 2026',
  image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=1400',
};

const ARTICLES = [
  {
    slug: 'history-of-the-templar-knights',
    title: 'The Knights Templar: Myth, Legend & the Armour They Left Behind',
    excerpt:
      'Founded in 1119 AD, the Knights Templar became the most feared warriors of the Crusades. Explore the symbolism encoded in every detail of their ceremonial armour.',
    category: 'Medieval',
    readTime: '7 min read',
    date: 'July 12, 2026',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800',
  },
  {
    slug: 'viking-weapons-and-daily-life',
    title: 'More Than Warriors: Viking Weapons as Cultural Artifacts',
    excerpt:
      'Norse battle axes were not merely weapons — they were status symbols, gifts to the gods, and markers of identity. A deep look into Scandinavian material culture.',
    category: 'Viking',
    readTime: '6 min read',
    date: 'July 5, 2026',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800',
  },
  {
    slug: 'roman-legionary-equipment',
    title: 'Lorica Segmentata to Galea: Decoding Roman Legionary Equipment',
    excerpt:
      'At its peak, the Roman Legion equipped over 300,000 soldiers. Each component of their armour was engineered with staggering precision for both protection and psychological impact.',
    category: 'Roman',
    readTime: '8 min read',
    date: 'June 28, 2026',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800',
  },
  {
    slug: 'caring-for-antique-collectibles',
    title: 'A Collector\'s Guide: Preserving Historical Artefacts at Home',
    excerpt:
      'Whether you\'ve acquired a damascene dagger or a bronze centurion helmet, proper care ensures these treasures outlast generations. Our conservation experts share their best practices.',
    category: 'Restoration',
    readTime: '5 min read',
    date: 'June 20, 2026',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Craftsmanship: 'bg-stone-100 text-stone-700',
  Medieval: 'bg-slate-100 text-slate-700',
  Viking: 'bg-blue-50 text-blue-700',
  Roman: 'bg-amber-50 text-amber-800',
  Restoration: 'bg-emerald-50 text-emerald-700',
};

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2 text-amber-700">
          <Feather className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">The Corazonetouch Journal</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Stories of Craft,<br />History & Legacy
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Editorial pieces about the objects we collect, the civilisations that forged them,
          and the enduring human need to preserve beauty across centuries.
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
            <span>{ARTICLES.length} Articles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTICLES.map((article) => (
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
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">For Collectors & Connoisseurs</span>
          <h2 className="font-display text-3xl font-black text-white">
            Receive the Curator's Letter
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monthly editorial essays, new arrivals, historical deep-dives, and exclusive previews delivered to your inbox. No noise. Only craft.
          </p>
          <form
            className="flex flex-col sm:flex-row items-center gap-3 mt-6 max-w-sm mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
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
          <p className="text-[11px] text-slate-600">Unsubscribe at any time. We respect your inbox.</p>
        </div>
      </div>

    </div>
  );
}
