import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Leaf, PackageCheck, Heart, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/site';

const PILLARS = [
  {
    icon: Leaf,
    tone: 'bg-emerald-50 text-emerald-600',
    title: 'Carefully Sourced',
    text: 'Almonds and walnuts from Kashmir, cashews from Goa and Kerala, and dates from trusted importers — bought for taste and freshness, not just price.',
  },
  {
    icon: PackageCheck,
    tone: 'bg-amber-50 text-amber-600',
    title: 'Hand-Sorted & Sealed',
    text: 'Each batch is hand-sorted to remove broken and discoloured pieces, then sealed in food-grade packs with no added preservatives.',
  },
  {
    icon: Heart,
    tone: 'bg-rose-50 text-rose-600',
    title: 'Made for Sharing',
    text: 'From a daily handful to festive gift hampers, our dry fruits are packed for families, celebrations and thoughtful gifting.',
  },
];

function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <Breadcrumb items={[{ label: 'About Corazonetouch' }]} />

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="gold" size="md">Our Story</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Premium Dry Fruits, Packed with Heart
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Our name joins <strong>corazón</strong> — Spanish for heart — with <strong>touch</strong>. That&apos;s how we approach every pack: with a
          caring, personal touch from sourcing to your doorstep.
        </p>
      </div>

      <Card variant="dark" padding="lg" className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">What We Do</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Corazonetouch brings premium almonds, cashews, walnuts, dates, raisins and festive gift hampers to homes across India. We believe
          healthy snacking should taste wonderful, so we focus on fresh stock, honest grades and careful packing — never filler or
          stale inventory.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PILLARS.map(({ icon: Icon, tone, title, text }) => (
          <Card key={title} variant="elevated" padding="md" className="space-y-3">
            <div className={`p-3 rounded-xl w-fit ${tone}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
          </Card>
        ))}
      </div>

      <div className="bg-slate-100 rounded-3xl p-8 text-center space-y-4">
        <h3 className="font-display text-2xl font-bold text-slate-900">Taste the Difference</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Browse almonds, cashews, walnuts, dates and gift hampers — hand-sorted and packed fresh.
        </p>
        <Button href="/products" variant="secondary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
          Shop All Products
        </Button>
      </div>
    </div>
  );
}

export default function CmsPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'about') return <AboutPage />;

  const pageTitle = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: pageTitle }]} />
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
      </div>
      <Card variant="outlined" padding="lg" className="text-sm leading-relaxed text-slate-600 space-y-4">
        <p>This page is being updated. For any questions, email <strong className="text-slate-900">{SITE.supportEmail}</strong> or visit our{' '}
          <Link href="/contact-us" className="text-amber-600 underline font-bold">contact page</Link>.
        </p>
      </Card>
    </div>
  );
}
