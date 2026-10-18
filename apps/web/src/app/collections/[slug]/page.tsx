'use client';

import { useEffect, useState } from 'react';
import ProductGridCard from '@/components/ProductGridCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Heart, Sparkles, Archive, Leaf, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { categoryBySlug, fetchProductCards } from '@/lib/catalog';

interface Editorial {
  title: string;
  subtitle: string;
  about: string;
  benefits: string[];
  enjoy: string[];
  storage: string[];
  guide: { tip: string; detail: string }[];
}

const STANDARD_STORAGE = [
  'Store in an airtight container in a cool, dry place away from direct sunlight.',
  'Once opened, use within 4–6 weeks, or refrigerate to keep them fresh for longer.',
  'Always use a dry spoon — moisture is the main cause of spoilage.',
];

const CATEGORY_EDITORIAL: Record<string, Editorial> = {
  almonds: {
    title: 'Almonds',
    subtitle: 'Kashmiri Mamra · Californian · Afghan',
    about:
      'Almonds are the most loved dry fruit in Indian homes. Kashmiri Mamra almonds are smaller, more concave and naturally richer in oil, with a sweeter taste. Californian almonds are larger and uniform — great for everyday snacking and cooking.',
    benefits: [
      'A good source of vitamin E, magnesium and plant protein.',
      'Contain healthy monounsaturated fats and dietary fibre.',
      'A filling snack — a small handful (about 20–23 almonds) is a typical daily serving.',
    ],
    enjoy: [
      'Soak 6–8 almonds overnight, peel and eat first thing in the morning.',
      'Blend into badam milk with saffron and cardamom.',
      'Slice over kheer, halwa, oats or salads for crunch.',
    ],
    storage: STANDARD_STORAGE,
    guide: [
      { tip: 'Mamra vs. Californian', detail: 'Mamra almonds cost more because they are rarer, hand-cracked and higher in natural oil. Californian almonds are better value for daily use and baking.' },
      { tip: 'Check for freshness', detail: 'Good almonds snap cleanly, smell nutty and have an even brown skin. A bitter or paint-like smell means the oils have turned rancid.' },
    ],
  },
  cashews: {
    title: 'Cashews',
    subtitle: 'Whole W180 · W240 · W320',
    about:
      'Creamy, mildly sweet cashews from Goa and Kerala. The “W” grade tells you how many whole kernels make up a pound — the lower the number, the bigger and more premium the cashew.',
    benefits: [
      'Rich in copper, magnesium and zinc.',
      'Provide plant protein and healthy fats.',
      'Their creamy texture makes them a natural dairy-free base for gravies and desserts.',
    ],
    enjoy: [
      'Roast lightly with a pinch of salt and pepper for a quick snack.',
      'Soak and blend into a smooth paste for shahi paneer and korma gravies.',
      'Add to pulao, biryani and upma, or garnish sweets.',
    ],
    storage: STANDARD_STORAGE,
    guide: [
      { tip: 'Understanding grades', detail: 'W180 is the largest “king” cashew, W240 is the popular premium size and W320 is the best value for everyday cooking. Splits (JH/SW) are ideal for gravies.' },
      { tip: 'Colour and texture', detail: 'Look for ivory-white, uniform kernels without dark spots or a shrivelled surface.' },
    ],
  },
  walnuts: {
    title: 'Walnuts',
    subtitle: 'Kashmiri Kernels & In-Shell',
    about:
      'Kashmiri walnuts are prized for their light-amber kernels and mild, buttery taste. Choose kernels for convenience, or in-shell walnuts that stay fresh longer.',
    benefits: [
      'One of the best plant sources of omega-3 fatty acids (ALA).',
      'Contain antioxidants and polyphenols.',
      'A small serving of about 4–7 halves a day fits easily into a balanced diet.',
    ],
    enjoy: [
      'Eat 2–3 soaked walnut halves in the morning.',
      'Chop into brownies, banana bread and cookies.',
      'Toss onto salads, yoghurt bowls and oatmeal.',
    ],
    storage: [
      'Walnuts have more delicate oils than other nuts — refrigerate kernels after opening.',
      'In-shell walnuts keep for several months in a cool, dry place.',
      'Freeze in an airtight bag for up to a year.',
    ],
    guide: [
      { tip: 'Light vs. dark kernels', detail: 'Light, golden kernels (“extra light”) are milder and sweeter; darker kernels are more bitter but still good for baking.' },
      { tip: 'Freshness test', detail: 'Fresh walnuts taste sweet and buttery. A sharp, bitter aftertaste means they have gone stale.' },
    ],
  },
  dates: {
    title: 'Dates',
    subtitle: 'Medjool · Ajwa · Kimia',
    about:
      'Soft, caramel-sweet dates are nature’s own sweets. Medjool dates are large and fudgy, Ajwa dates from Madinah are dark and delicately sweet, and Kimia dates are soft and juicy.',
    benefits: [
      'A natural source of quick energy from fruit sugars.',
      'Provide dietary fibre, potassium and iron.',
      'A wholesome swap for refined sugar in desserts and smoothies.',
    ],
    enjoy: [
      'Break your fast during Ramadan with dates and water, as is tradition.',
      'Stuff with almonds or walnuts for an easy festive treat.',
      'Blend into smoothies, laddoos and energy bars instead of sugar.',
    ],
    storage: [
      'Keep in an airtight container; refrigerate to keep them soft for months.',
      'Bring to room temperature before serving for the best texture.',
      'A white powdery coating can be natural sugar crystals — this is normal.',
    ],
    guide: [
      { tip: 'Which date to choose?', detail: 'Medjool for gifting and a rich dessert-like bite, Ajwa for tradition, Kimia for everyday soft snacking.' },
      { tip: 'Seeded vs. seedless', detail: 'Seeded dates keep their shape and moisture better; seedless dates are more convenient for cooking.' },
    ],
  },
  'raisins-berries': {
    title: 'Raisins & Berries',
    subtitle: 'Black Raisins · Golden Kishmish · Cranberries · Blueberries',
    about:
      'Sun-dried grapes and berries with concentrated natural sweetness. Afghan black raisins are seedless and rich, golden kishmish is plump and tangy, and dried cranberries and blueberries add a bright, fruity bite.',
    benefits: [
      'Natural sweetness with dietary fibre.',
      'Black raisins contain iron and antioxidants.',
      'Cranberries and blueberries are rich in polyphenols.',
    ],
    enjoy: [
      'Soak black raisins overnight and eat in the morning.',
      'Add kishmish to pulao, sheer khurma, kheer and halwa.',
      'Mix berries into trail mix, granola and baked goods.',
    ],
    storage: STANDARD_STORAGE,
    guide: [
      { tip: 'Sweetened berries', detail: 'Dried cranberries are usually lightly sweetened because they are very tart on their own — check the label if you prefer unsweetened.' },
      { tip: 'Quality check', detail: 'Good raisins are plump, glossy and evenly coloured, without stems, grit or a fermented smell.' },
    ],
  },
  'mixed-nuts': {
    title: 'Mixed Nuts',
    subtitle: 'Balanced Everyday Mixes',
    about:
      'Ready-to-eat mixes of almonds, cashews, walnuts, pistachios and raisins — so you get the benefits of several dry fruits in one handful.',
    benefits: [
      'A mix of nutrients from different nuts and dried fruits in one serving.',
      'Protein, healthy fats and fibre keep you full between meals.',
      'A smart replacement for fried and packaged snacks.',
    ],
    enjoy: [
      'Carry a small box for office and travel snacking.',
      'Pre-portion a handful a day to keep servings in check.',
      'Sprinkle over breakfast cereal or yoghurt.',
    ],
    storage: STANDARD_STORAGE,
    guide: [
      { tip: 'Roasted or raw?', detail: 'Raw mixes are best for daily health snacking; lightly roasted and salted mixes are great for parties.' },
      { tip: 'Read the ratio', detail: 'Check how much of the pack is premium nuts versus filler like peanuts or raisins.' },
    ],
  },
  'gift-hampers': {
    title: 'Dry Fruit Gift Hampers',
    subtitle: 'Diwali · Eid · Weddings · Corporate',
    about:
      'Thoughtfully packed boxes of our best almonds, cashews, walnuts, dates and raisins — a healthy, timeless gift for festivals, weddings, housewarmings and clients.',
    benefits: [
      'A gift everyone can enjoy, with a long shelf life.',
      'Healthier than sweets and mithai boxes.',
      'Available in multiple sizes and budgets.',
    ],
    enjoy: [
      'Order early for Diwali and Eid — festive weeks book up fast.',
      'Add a personal message card to your order notes.',
      'Contact us for bulk and corporate orders with custom branding.',
    ],
    storage: STANDARD_STORAGE,
    guide: [
      { tip: 'Bulk & corporate orders', detail: 'For 20+ hampers we can customise contents, packaging and delivery to multiple addresses — reach us through the Contact page.' },
      { tip: 'Delivery timelines', detail: 'Allow 3–5 business days for standard delivery; choose express at checkout for urgent gifts.' },
    ],
  },
};

const DEFAULT_EDITORIAL: Editorial = {
  title: 'Dry Fruits & Nuts',
  subtitle: 'Hand-Sorted · Packed Fresh',
  about: 'Premium dry fruits and nuts, hand-sorted and packed fresh for your family.',
  benefits: ['A wholesome, natural snack with protein, healthy fats and fibre.'],
  enjoy: ['Enjoy a small handful a day as a snack, or add to your favourite recipes.'],
  storage: STANDARD_STORAGE,
  guide: [{ tip: 'Freshness first', detail: 'Buy in quantities you can finish within a few weeks of opening.' }],
};

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'about', label: 'About' },
  { id: 'benefits', label: 'Health Benefits' },
  { id: 'enjoy', label: 'Ways to Enjoy' },
  { id: 'storage', label: 'Storage' },
  { id: 'guide', label: 'Buying Guide' },
] as const;

function NumberedList({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((text, i) => (
        <div key={i} className="flex items-start space-x-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{text}</p>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ icon: Icon, kicker, title }: { icon: typeof Leaf; kicker: string; title: string }) {
  return (
    <>
      <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
        <Icon className="w-4 h-4" />
        <span>{kicker}</span>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
    </>
  );
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const slug = params.slug.toLowerCase();
  const name = categoryBySlug(slug)?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const editorial = CATEGORY_EDITORIAL[slug] ?? { ...DEFAULT_EDITORIAL, title: name };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('products');
  const [guideOpen, setGuideOpen] = useState<number | null>(0);

  useEffect(() => {
    fetchProductCards({ category: slug, limit: 100 })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumb items={[{ label: 'Shop', href: '/products' }, { label: name }]} />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/30 via-slate-900 to-slate-900" />
        <div className="relative z-10 space-y-3">
          <Badge variant="gold" size="sm">{editorial.subtitle}</Badge>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight">{editorial.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{editorial.about}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.id === 'products' && !loading ? `${tab.label} (${products.length})` : tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <section className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
              title={`No ${name} in stock right now`}
              description="A fresh batch is on its way. Browse our other dry fruits in the meantime."
              actionLabel="Shop All Products"
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

      {activeTab === 'about' && (
        <section className="max-w-3xl space-y-4">
          <SectionHeading icon={Leaf} kicker="Origin & Varieties" title={`About ${name}`} />
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {editorial.about}
          </p>
        </section>
      )}

      {activeTab === 'benefits' && (
        <section className="max-w-3xl space-y-6">
          <SectionHeading icon={Heart} kicker="Nutrition" title="Health Benefits" />
          <NumberedList items={editorial.benefits} />
          <p className="text-[11px] text-slate-400">General nutrition information only — not medical advice.</p>
        </section>
      )}

      {activeTab === 'enjoy' && (
        <section className="max-w-3xl space-y-6">
          <SectionHeading icon={Sparkles} kicker="Recipes & Ideas" title="Ways to Enjoy" />
          <NumberedList items={editorial.enjoy} />
        </section>
      )}

      {activeTab === 'storage' && (
        <section className="max-w-3xl space-y-6">
          <SectionHeading icon={Archive} kicker="Keep Them Fresh" title="Storage Tips" />
          <NumberedList items={editorial.storage} />
        </section>
      )}

      {activeTab === 'guide' && (
        <section className="max-w-3xl space-y-6">
          <SectionHeading icon={BookOpen} kicker="Choose the Right Pack" title={`Buying Guide: ${name}`} />
          <div className="space-y-3">
            {editorial.guide.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setGuideOpen(guideOpen === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.tip}</span>
                  {guideOpen === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {guideOpen === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{item.detail}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
