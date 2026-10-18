import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal — Corazonetouch | Dry Fruit Guides, Nutrition & Storage Tips',
  description:
    'Practical guides to choosing, storing and enjoying almonds, cashews, walnuts, dates and other dry fruits — plus festive gifting tips.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
