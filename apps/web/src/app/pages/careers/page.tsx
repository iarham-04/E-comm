import InfoPage from '@/components/InfoPage';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Careers — Corazonetouch' };

export default function CareersPage() {
  return (
    <InfoPage
      title="Careers at Corazonetouch"
      intro="We are a growing dry fruits brand and are always happy to hear from people who care about quality food and great customer service."
      sections={[
        {
          heading: 'How to apply',
          body: <p>There are no open roles listed right now. To be considered for future openings in packing, operations, customer support or marketing, email your CV to <strong className="text-slate-900">{SITE.supportEmail}</strong>.</p>,
        },
      ]}
    />
  );
}
