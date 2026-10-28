import type { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import BlogPost from '@/lib/models/BlogPost';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com';

export const revalidate = 3600;

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/packages'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/hajj-2027'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/contact'),
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

    const posts = await BlogPost.find({ status: 'published' }).select('slug updatedAt').lean();
    const blogPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, { url: absoluteUrl('/blog'), changeFrequency: 'daily', priority: 0.8 }, ...packagePages, ...blogPages];
  } catch (error) {
    console.error('Failed to generate package sitemap entries:', error);
    return staticPages;
  }
}
