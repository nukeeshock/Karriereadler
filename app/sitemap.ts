import type { MetadataRoute } from 'next';

const baseUrl = process.env.BASE_URL ?? 'https://karriereadler.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const marketingPages = [
    '/',
    '/leistungen',
    '/pricing',
    '/contact',
    '/lebenslauf-schreiben-lassen',
    '/anschreiben-schreiben-lassen',
    '/impressum',
    '/datenschutz',
    '/agb',
    '/widerrufsbelehrung'
  ];

  return marketingPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7
  }));
}
