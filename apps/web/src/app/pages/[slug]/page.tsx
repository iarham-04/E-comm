'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Scroll, ShieldCheck, Hammer, Heart, HelpCircle, FileText, ArrowRight } from 'lucide-react';

export default function CmsPage({ params }: { params: { slug: string } }) {
  const pageTitle = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (params.slug === 'about') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <Breadcrumb items={[{ label: 'About Corazonetouch' }]} />

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" size="md">Our Origin & Heritage</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Where Ancient Craftsmanship Meets the Modern Collector&apos;s Heart
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Corazonetouch was born from a simple conviction: that history shouldn&apos;t live behind glass.
          </p>
        </div>

        {/* Brand Story Card */}
        <Card variant="dark" padding="lg" className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <Scroll className="w-6 h-6 text-forge-gold" />
            <h2 className="font-display text-2xl font-bold text-white">The Corazonetouch Narrative</h2>
          </div>
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-display italic">
            <p>
              &ldquo;The name itself tells you everything — <strong className="text-forge-gold not-italic">corazón</strong>, the Spanish word for heart, fused with <strong className="text-forge-gold not-italic">touch</strong>. A heartfelt touch. Because that&apos;s what we believe in: the moment a collector first holds a hand-forged Templar breastplate and feels the hammer marks left by the blacksmith who shaped it — that moment is electric.&rdquo;
            </p>
            <p className="not-italic text-slate-400 font-body">
              We started as a partnership between a medieval historian and a third-generation master blacksmith in Rajasthan — with one goal: to recreate the armor, weapons, and decorative arts of history&apos;s most fascinating civilizations at a level of fidelity that museums respect and collectors treasure.
            </p>
          </div>
        </Card>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" padding="md" className="space-y-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Hand-Forged Steel</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every breastplate, axe, and dagger is forged from high-carbon steel, oil-quenched, and hand-finished by master armorers.
            </p>
          </Card>

          <Card variant="elevated" padding="md" className="space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Museum Provenance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every artifact page documents the historical era, museum references, metallurgical composition, and care instructions.
            </p>
          </Card>

          <Card variant="elevated" padding="md" className="space-y-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Collector Promise</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every piece in our collection is historically researched and built to outlast the century it was inspired by.
            </p>
          </Card>
        </div>

        {/* Action Banner */}
        <div className="bg-slate-100 rounded-3xl p-8 text-center space-y-4">
          <h3 className="font-display text-2xl font-bold text-slate-900">Ready to Start Your Collection?</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse our curated medieval armor, Viking weaponry, Roman artifacts, and heritage furniture.
          </p>
          <Button href="/products" variant="secondary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Explore All Products
          </Button>
        </div>
      </div>
    );
  }

  if (params.slug === 'help-center') {
    const FAQS = [
      { q: 'How long does worldwide shipping take?', a: 'Express worldwide shipping takes 3-5 business days via DHL Express / FedEx with tracking.' },
      { q: 'Are these armor suits wearable?', a: 'Yes! Our full armor suits and helmets feature articulated joints and leather straps designed to fit adults (5ft 9in to 6ft 1in).' },
      { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy on all unworn, undamaged items in original archival packaging.' },
      { q: 'How do I care for high-carbon steel artifacts?', a: 'Wipe down with a dry microfiber cloth after handling and apply a thin layer of mineral oil or museum wax bi-annually.' },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <Breadcrumb items={[{ label: 'Help Center & FAQ' }]} />

        <div className="border-b border-slate-200 pb-5">
          <Badge variant="gold" size="md">Customer Support</Badge>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-slate-500 mt-1">Find quick answers to common questions about shipping, care, and returns.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <Card key={i} variant="elevated" padding="md" className="space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-forge-gold flex-shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: pageTitle }]} />

      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
        <p className="text-xs text-slate-500 mt-1">Official Corazonetouch policy & information document.</p>
      </div>

      <Card variant="outlined" padding="lg" className="prose max-w-none text-xs leading-relaxed text-slate-600 space-y-4">
        <p>
          Welcome to the official <strong>{pageTitle}</strong> page for Corazonetouch. We are committed to maintaining full transparency, authenticity, and legal compliance across all customer interactions.
        </p>
        <p>
          For specific inquiries regarding this document, please contact our support team at <strong className="text-slate-900">support@corazonetouch.com</strong> or visit our <Link href="/contact-us" className="text-amber-600 underline font-bold">Contact Page</Link>.
        </p>
      </Card>
    </div>
  );
}
