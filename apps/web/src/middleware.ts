import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/admin(.*)',
  '/products(.*)',
  '/collections(.*)',
  '/cart(.*)',
  '/checkout(.*)',
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
    publishableKey:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      'pk_test_bW9kZXN0LXRhaHItNjguY2xlcmsuYWNjb3VudHMuZGV2JA',
    secretKey:
      process.env.CLERK_SECRET_KEY ||
      'sk_test_HUqsjmyXmx1IYjR4ZMV3eGr3BFtNuin6AYUxkPi0Jh',
  },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
