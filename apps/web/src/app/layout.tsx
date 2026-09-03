import { ClerkProvider } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Corazonetouch — Hand-Forged Medieval Armor, Viking Artifacts & Historical Collectibles',
  description: 'Discover museum-grade handcrafted medieval armor, viking battle axes, Roman helmets, and bespoke artisanal furniture. Every artifact is historically researched and hand-forged. Free worldwide shipping over ₹1,999.',
  openGraph: {
    title: 'Corazonetouch — Where Ancient Craftsmanship Meets the Modern Collector',
    description: 'Hand-forged historical armor, decor, and collectibles by master blacksmiths. Museum-grade. No exceptions.',
    url: 'https://corazonetouch.com',
    siteName: 'Corazonetouch',
    images: [
      {
        url: 'https://d1234.cloudfront.net/meta/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Corazonetouch — Authentic Historical Collectibles',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corazonetouch — Hand-Forged Historical Artifacts & Collectibles',
    description: 'Museum-grade historical armor, viking weaponry, and artisanal decor. Forged by hand, built for eternity.',
    images: ['https://d1234.cloudfront.net/meta/og-homepage.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_bW9kZXN0LXRhaHItNjguY2xlcmsuYWNjb3VudHMuZGV2JA';

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Corazonetouch',
    url: 'https://corazonetouch.com',
    description: 'Museum-grade handcrafted medieval armor, viking battle axes, Roman artifacts, and bespoke artisanal furniture. Every artifact is hand-forged, historically researched, and built to outlast the century it was inspired by.',
    currenciesAccepted: 'INR, USD, EUR, GBP',
    paymentAccepted: 'Cash, Credit Card, Razorpay, Stripe',
    priceRange: '₹3,499 - ₹49,999',
    slogan: 'Where ancient craftsmanship meets the modern collector\'s heart.',
  };

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
          />
        </head>
        <body className="min-h-screen flex flex-col antialiased bg-parchment text-slate-900 font-body">
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
