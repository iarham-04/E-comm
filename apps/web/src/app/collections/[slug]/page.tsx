'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductGridCard from '@/components/ProductGridCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Hammer, Sparkles, ShieldAlert, Compass, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_EDITORIAL: Record<string, {
  title: string;
  subtitle: string;
  historicalBackground: string;
  craftsmanship: string;
  stylingInspiration: string[];
  careInstructions: string[];
  buyingGuide: { tip: string; detail: string }[];
}> = {
  medieval: {
    title: 'Medieval Arms & Armor',
    subtitle: '11th to 15th Century Feudal European Heritage',
    historicalBackground:
      'The High Middle Ages saw armorsmithing evolve from simple riveted chainmail into full, articulated plate armor forged to withstand war-bows and lances. Knights relied on Toledo steel and German armories in Augsburg and Nuremberg, where armorsmiths stamped maker’s marks guaranteeing combat readiness.',
    craftsmanship:
      'Every piece in our Medieval collection is individually hammer-worked from 2mm high-carbon forged steel. Plates are oil-quenched at 58 HRC hardness to achieve the iconic blackened patina that historical knights used for corrosion resistance against field moisture.',
    stylingInspiration: [
      'Mount gauntlets or a full suit in a wood-paneled study or library corner on an oak pedestal.',
      'Pair steel broadswords or daggers above stone fireplace mantels alongside warm amber lighting.',
      'Use candelabras with hand-poured beeswax candles to cast dramatic cast-iron shadows across exposed brick walls.',
    ],
    careInstructions: [
      'Apply a thin coat of mineral oil or Renaissance Wax twice a year to prevent humidity oxidization.',
      'Avoid handling polished steel plates with bare hands — natural skin oils attract moisture.',
      'Store in low-humidity environments (under 50% relative humidity).',
    ],
    buyingGuide: [
      { tip: 'Weight & Gauge', detail: 'Museum-grade plate armor uses 16 to 18-gauge steel (1.5mm–2mm). Beware of thin decorative replicas under 20-gauge.' },
      { tip: 'Articulated Joints', detail: 'Authentic suits feature fully sliding rivets allowing natural range of motion for gauntlets and pauldrons.' },
      { tip: 'Finish Authenticity', detail: 'Oil-blackened or satin steel finishes reflect genuine period techniques; chrome-plated surfaces are non-historical.' },
    ],
  },
  viking: {
    title: 'Nordic Viking Heritage',
    subtitle: '8th to 11th Century Scandinavian Craftsmanship',
    historicalBackground:
      'Viking craftsmen were master metallurgists who forged pattern-welded iron and steel using Nordic timber charcoal. Axes were both vital survival tools for timber building and feared weapons in shield-wall tactics, featuring intricate knotwork carvings representing Yggdrasil and Ouroboros.',
    craftsmanship:
      'Our Viking axes and accessories are hand-carved from solid teak and ash wood. Axe heads are forged from high-carbon tool steel with hand-etched Runic inscriptions and leather-wrapped handles treated with natural beeswax.',
    stylingInspiration: [
      'Display hand-bearded battle axes on dark timber wall mounts above a leather sofa.',
      'Incorporate rune-engraved drinking horns and wooden bowls into rustic dining room sideboards.',
      'Combine sheepskin throws and cast-iron braziers with Nordic collectibles for an authentic hygge aesthetic.',
    ],
    careInstructions: [
      'Oil the steel axe edge periodically with camellia oil or mineral spirits.',
      'Condition leather haft wrappings with natural mink oil to prevent drying and cracking.',
      'Keep wooden handles away from direct radiators or dry heat sources to avoid wood shrinkage.',
    ],
    buyingGuide: [
      { tip: 'Steel Selection', detail: 'High-carbon 1095 steel retains a razor edge and offers superior impact resistance compared to stainless steel.' },
      { tip: 'Grain Alignment', detail: 'Haft wood grain should run parallel to the blade head for maximum structural integrity.' },
    ],
  },
  roman: {
    title: 'Imperial Roman Collectibles',
    subtitle: 'Legionary Helmets, Shields & Centurion Relics',
    historicalBackground:
      'The Roman legionary was equipped with standardized, mass-produced armaments manufactured in imperial fabricae. From the Gallic-type iron helmets with brass brow bands to the curved wood scutum shield, Roman armaments balanced soldier protection with tactical mobility across the Empire.',
    craftsmanship:
      'Forged using hand-spun brass and high-gauge polished iron, our Roman helmets feature real horsehair crests, cheek guards with leather ties, and embossed imperial eagles.',
    stylingInspiration: [
      'Place a red-crested Centurion helmet on a white marble pedestal for classical contrast.',
      'Hang a curved legionary scutum shield in a hallway entry as an impressive statement art piece.',
    ],
    careInstructions: [
      'Polish brass fittings using specialized non-abrasive brass cleaner.',
      'Keep horsehair crests dry and gently comb with a wide-tooth comb to maintain volume.',
    ],
    buyingGuide: [
      { tip: 'Crest Type', detail: 'Centurion crests run transverse (side-to-side), while Optio crests run sagittal (front-to-back).' },
      { tip: 'Cheek Guard Hinging', detail: 'Ensure cheek plates swing freely on leather or brass hinges.' },
    ],
  },
};

const DEFAULT_EDITORIAL = {
  title: 'Curated Heritage Artifacts',
  subtitle: 'Handcrafted Collectibles & Historic Home Decor',
  historicalBackground:
    'Every artifact in this collection is built to bridge the gap between historical authenticity and modern living. Inspired by museum archives and forged by master artisans.',
  craftsmanship:
    'Forged using traditional blacksmithing techniques, natural hardwoods, high-carbon steel, and solid brass fittings.',
  stylingInspiration: [
    'Feature as central focal points on dark wood credenzas or mantelpieces.',
    'Highlight with warm 2700K directional spotlighting to accentuate metal textures.',
  ],
  careInstructions: [
    'Dust regularly with a dry microfiber cloth.',
    'Apply mineral oil to metal surfaces once or twice annually.',
  ],
  buyingGuide: [
    { tip: 'Authenticity Guarantee', detail: 'Check for maker marks and accompanying certificates of craftsmanship.' },
  ],
};

const COLLECTION_PRODUCTS: Record<string, any[]> = {
  medieval: [
    { id: 'bs-1', name: 'Full Suit of Templar Knight Armor', slug: 'templar-knight-armor', category: 'Medieval', price: 34999.00, rating: 4.9, reviewsCount: 84, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', stock: 5 },
    { id: 'na-2', name: 'Medieval Leather & Steel Gauntlets', slug: 'steel-gauntlets', category: 'Medieval', price: 4999.00, rating: 4.6, reviewsCount: 18, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800', stock: 9 },
  ],
  viking: [
    { id: 'bs-2', name: 'Hand-Carved Nordic Viking Battle Axe', slug: 'viking-battle-axe', category: 'Viking', price: 8499.00, rating: 4.8, reviewsCount: 112, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', stock: 12 },
  ],
  roman: [
    { id: 'bs-3', name: 'Roman Centurion Brass Officer Helmet', slug: 'roman-officer-helmet', category: 'Roman', price: 6299.00, rating: 4.7, reviewsCount: 46, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', stock: 8 },
    { id: 'na-4', name: 'Ancient Roman Legionary Shield Replica', slug: 'roman-legionary-shield', category: 'Roman', price: 9499.00, rating: 4.8, reviewsCount: 22, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', stock: 4 },
  ],
};

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const slug = params.slug.toLowerCase();
  const collectionName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const editorial = CATEGORY_EDITORIAL[slug] || DEFAULT_EDITORIAL;
  const products = COLLECTION_PRODUCTS[slug] || [];

  const [activeTab, setActiveTab] = useState<'products' | 'history' | 'craft' | 'styling' | 'care' | 'guide'>('products');
  const [buyingGuideOpen, setBuyingGuideOpen] = useState<number | null>(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Collections', href: '/products' }, { label: `${collectionName} Collection` }]} />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/30 via-slate-900 to-slate-900" />
        <div className="relative z-10 space-y-3">
          <Badge variant="gold" size="sm">{editorial.subtitle}</Badge>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight">
            {editorial.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {editorial.historicalBackground}
          </p>
        </div>
      </div>

      {/* Editorial Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
        {[
          { id: 'products', label: `Collection (${products.length})` },
          { id: 'history', label: 'Historical Lore' },
          { id: 'craft', label: 'Craftsmanship' },
          { id: 'styling', label: 'Styling Guide' },
          { id: 'care', label: 'Care & Preservation' },
          { id: 'guide', label: 'Buying Guide' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Products Grid */}
      {activeTab === 'products' && (
        <section className="space-y-6">
          {products.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
              title={`No ${collectionName} items currently in stock`}
              description="Our master smiths are forging a new batch. Explore our historical lore guides while you wait."
              actionLabel="Explore All Products"
              actionHref="/products"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductGridCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Historical Background */}
      {activeTab === 'history' && (
        <section className="max-w-3xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            <span>Historical Context &amp; Archives</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">The History of {collectionName}</h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {editorial.historicalBackground}
          </p>
        </section>
      )}

      {/* Tab 3: Craftsmanship */}
      {activeTab === 'craft' && (
        <section className="max-w-3xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <Hammer className="w-4 h-4" />
            <span>Artisan Techniques &amp; Metallurgy</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">How It Is Forged</h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {editorial.craftsmanship}
          </p>
        </section>
      )}

      {/* Tab 4: Styling Inspiration */}
      {activeTab === 'styling' && (
        <section className="max-w-3xl space-y-6">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Interior Design &amp; Placement</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Styling Inspiration</h2>
          <div className="grid grid-cols-1 gap-4">
            {editorial.stylingInspiration.map((idea, i) => (
              <div key={i} className="flex items-start space-x-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{idea}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 5: Care Instructions */}
      {activeTab === 'care' && (
        <section className="max-w-3xl space-y-6">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>Preservation &amp; Maintenance</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Care Instructions</h2>
          <ul className="space-y-3">
            {editorial.careInstructions.map((care, i) => (
              <li key={i} className="flex items-start space-x-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                <span>{care}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tab 6: Buying Guide */}
      {activeTab === 'guide' && (
        <section className="max-w-3xl space-y-6">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Collector Checklist</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Buying Guide for {collectionName}</h2>
          <div className="space-y-3">
            {editorial.buyingGuide.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setBuyingGuideOpen(buyingGuideOpen === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.tip}</span>
                  {buyingGuideOpen === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {buyingGuideOpen === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
