import type { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com';

export const revalidate = 3600;

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/packages'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/hajj-2027'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    await connectDB();

    const tours = await Tour.find({ status: 'published' })
      .select('_id updatedAt')
      .lean();

    const packagePages: MetadataRoute.Sitemap = tours.map((tour: any) => ({
      url: absoluteUrl(`/packages/${tour._id.toString()}`),
      lastModified: tour.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...packagePages];
  } catch (error) {
    console.error('Failed to generate package sitemap entries:', error);
    return staticPages;
  }
}
