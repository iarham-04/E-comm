import Link from 'next/link';
import { SITE } from '@/lib/site';

/** Shared layout for policy and information pages. */
export default function InfoPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: { heading: string; body: React.ReactNode }[];
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900">{title}</h1>
        {intro && <p className="text-slate-600">{intro}</p>}
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 text-sm text-slate-600 leading-relaxed">
        {sections.map((s) => (
          <section key={s.heading} className="space-y-2">
            <h2 className="font-bold text-slate-900">{s.heading}</h2>
            <div className="space-y-2">{s.body}</div>
          </section>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Questions? Email <a href={`mailto:${SITE.supportEmail}`} className="font-semibold text-slate-800 underline">{SITE.supportEmail}</a> or use our{' '}
        <Link href="/contact-us" className="font-semibold text-slate-800 underline">contact form</Link>.
      </p>
    </div>
  );
}
