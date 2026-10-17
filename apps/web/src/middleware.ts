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
  '/journal(.*)',
  '/pages(.*)',
  '/contact-us(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/track-order(.*)',
  '/wishlist(.*)',
  '/admin/login(.*)', // admin role is verified by the API, the login page itself is public
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
