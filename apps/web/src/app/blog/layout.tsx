import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal — Corazonetouch | Stories of Craft, History & Legacy',
  description:
    'Explore editorial stories about medieval armor, historical weaponry, Viking culture, and the art of collecting authentic historical artifacts.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
