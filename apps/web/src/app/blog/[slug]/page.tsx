import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { ARTICLES, articleBySlug } from '@/lib/articles';

export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articleBySlug(params.slug);
  return article ? { title: `${article.title} — Corazonetouch Journal`, description: article.excerpt } : {};
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articleBySlug(params.slug);
  if (!article) notFound();

  const more = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <Link href="/blog" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All articles</span>
      </Link>

      <header className="space-y-4">
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{article.category}</span>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">{article.title}</h1>
        <p className="text-slate-500 leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{article.date}</span></span>
          <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{article.readTime}</span></span>
        </div>
      </header>

      <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-slate-100">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-6">
        {article.sections.map((section, i) => (
          <section key={i} className="space-y-2">
            {section.heading && <h2 className="font-display text-xl font-bold text-slate-900">{section.heading}</h2>}
            <p className="text-slate-700 leading-relaxed">{section.text}</p>
          </section>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-800">Ready to stock up? Shop hand-sorted, freshly packed dry fruits.</p>
        <Link href="/products" className="text-xs font-bold bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 whitespace-nowrap">
          Shop Now
        </Link>
      </div>

      <aside className="space-y-4 border-t border-slate-200 pt-8">
        <h2 className="font-display text-lg font-bold text-slate-900">More from the journal</h2>
        <ul className="space-y-3">
          {more.map((a) => (
            <li key={a.slug}>
              <Link href={`/blog/${a.slug}`} className="text-sm font-semibold text-slate-700 hover:text-amber-700">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
