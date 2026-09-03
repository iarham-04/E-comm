'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductGridCard from '@/components/ProductGridCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';

const DEMO_SUB_PRODUCTS = [
  { id: 'sub-1', name: 'Spartan Shield Bronze 24"', slug: 'spartan-shield-bronze-24', category: 'Medieval', price: 14999.00, rating: 4.9, reviewsCount: 42, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', stock: 6 },
  { id: 'sub-2', name: 'Viking Round Battle Shield', slug: 'viking-round-shield', category: 'Medieval', price: 12499.00, rating: 4.8, reviewsCount: 38, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', stock: 4 },
];

export default function SubcategoryCollectionPage() {
  const { slug, sub } = useParams<{ slug: string; sub: string }>();

  const categoryTitle = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Collection';
  const subTitle = sub ? sub.charAt(0).toUpperCase() + sub.slice(1) : 'Subcategory';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[
        { label: 'Collections', href: '/products' },
        { label: categoryTitle, href: `/collections/${slug}` },
        { label: subTitle },
      ]} />

      <div className="border-b border-slate-100 pb-6 space-y-2">
        <Badge variant="gold" size="sm">{categoryTitle} · {subTitle}</Badge>
        <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">
          {categoryTitle} {subTitle}
        </h1>
        <p className="text-xs text-slate-500">Hand-forged and historically accurate {subTitle.toLowerCase()} from our {categoryTitle} workshop.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DEMO_SUB_PRODUCTS.map((p) => (
          <ProductGridCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}
