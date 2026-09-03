import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export default function FeaturedStory() {
  return (
    <section className="py-16 bg-slate-900 text-white my-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs text-amber-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Our Heritage & Artisan Story</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Forged by Hand, Built for <span className="text-amber-400">Eternity</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded by historical preservationists and master blacksmiths, our workshop bridges ancient metalworking traditions with modern museum-grade curation. Every piece of Templar armor, Viking battle axe, and Roman helmet is meticulously crafted from authentic high-carbon steel, genuine brass, and hand-finished hardwood.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span className="block text-2xl font-black text-amber-400">100%</span>
                <span className="text-slate-400 font-medium mt-1 block">Hand-Finished Metals</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">15+</span>
                <span className="text-slate-400 font-medium mt-1 block">Years of Craftsmanship</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/pages/about"
                className="inline-flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition-colors uppercase tracking-wider shadow-lg"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Story Image Grid */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000"
                alt="Master blacksmith forging historical armor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-xl hidden sm:block">
              <p className="text-xs font-bold text-amber-400">Authentic Historical Replicas</p>
              <p className="text-[11px] text-slate-400">Crafted in limited workshop batches</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
