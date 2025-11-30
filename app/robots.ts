import type { MetadataRoute } from 'next';

const baseUrl = process.env.BASE_URL ?? 'https://karriereadler.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/dashboard',
          '/admin',
          '/kaufen',
          '/cv',
          '/cover-letter',
          '/sign-in',
          '/sign-up',
          '/verify-email',
          '/order',
          '/api'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
