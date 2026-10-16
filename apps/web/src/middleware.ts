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

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAdminPublicRoute = createRouteMatcher(['/admin/login(.*)', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(
  async (auth, req) => {
    if (isAdminRoute(req) && !isAdminPublicRoute(req)) {
      if (typeof auth === 'function') {
        const authObj = await (auth as any)();
        if (authObj && typeof authObj.protect === 'function') {
          await authObj.protect();
        }
      } else if (auth && typeof (auth as any).protect === 'function') {
        await (auth as any).protect();
      }
      return;
    }

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
