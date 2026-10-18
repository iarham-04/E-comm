import { ClerkProvider } from '@clerk/nextjs';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import AppShell from '@/components/AppShell';
import Script from 'next/script';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = 'https://corazontouch.com';
const DESCRIPTION =
  'Shop premium dry fruits and nuts online — Kashmiri Mamra almonds, whole cashews, walnuts, Medjool dates, raisins and festive gift hampers. Hand-sorted, packed fresh, free shipping over ₹1,999.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Corazonetouch — Premium Dry Fruits, Nuts & Gift Hampers Online',
  description: DESCRIPTION,
  openGraph: {
    title: 'Corazonetouch — Premium Dry Fruits & Nuts, Packed Fresh',
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Corazonetouch',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corazonetouch — Premium Dry Fruits & Nuts',
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Corazonetouch',
    url: SITE_URL,
    description: DESCRIPTION,
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking',
  };

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
          />
        </head>
        <body className="min-h-screen flex flex-col antialiased bg-parchment text-slate-900 font-sans">
          <AppShell>
            {children}
          </AppShell>

          {/* Microsoft Clarity */}
          {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
            <Script
              id="microsoft-clarity"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(c,l,a,r,i,t,y){
                      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
                `,
              }}
            />
          )}

          {/* Google Analytics 4 */}
          {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}

          {/* Meta Pixel */}
          {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
