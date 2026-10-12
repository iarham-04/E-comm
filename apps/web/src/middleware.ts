import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/collections(.*)',
  '/cart(.*)',
  '/checkout(.*)',
  '/order-confirmation(.*)',
  '/search(.*)',
  '/blog(.*)',
  '/pages(.*)',
  '/contact-us(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/track-order(.*)',
  '/wishlist(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    try {
      if (!isPublicRoute(req)) {
        if (typeof auth === 'function') {
          const authObj = await (auth as any)();
          if (authObj && typeof authObj.protect === 'function') {
            await authObj.protect();
          }
        } else if (auth && typeof (auth as any).protect === 'function') {
          await (auth as any).protect();
        }
      }
    } catch {
      // Gracefully continue on public or fallback routes
    }
  },
  {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
