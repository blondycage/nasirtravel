import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/booking-confirmation',
          '/dashboard/',
          '/forgot-password',
          '/login',
          '/payment/',
          '/register',
          '/reset-password',
          '/uauthorised',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
