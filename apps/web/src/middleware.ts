import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
  '/admin/login(.*)',
  '/track-order(.*)',
  '/wishlist(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;

    // Dedicated separation for admin portal:
    // If accessing any /admin route (except /admin/login) unauthenticated,
    // redirect to dedicated /admin/login portal rather than the customer sign-in.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      try {
        const authObj = typeof auth === 'function' ? await (auth as any)() : auth;
        if (!authObj?.userId) {
          const loginUrl = new URL('/admin/login', req.url);
          loginUrl.searchParams.set('redirect_url', pathname);
          return NextResponse.redirect(loginUrl);
        }
      } catch {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('redirect_url', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return;
    }

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
