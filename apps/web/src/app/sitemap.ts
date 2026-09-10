import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://corazontouch.com';
  return [
    '',
    '/products',
    '/cart',
    '/contact-us',
    '/pages/about',
    '/pages/terms',
    '/pages/privacy-policy',
    '/pages/shipping',
    '/pages/returns',
    '/pages/help-center',
  ].map((route) => ({
    url: baseUrl + route,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
