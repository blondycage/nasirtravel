import type { Metadata } from 'next';
import sanitizeHtml from 'sanitize-html';
import { Types } from 'mongoose';
import PackageDetailClient from '@/components/PackageDetailClient';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';

type Props = {
  params: {
    id: string;
  };
};

type PublishedTour = {
  title: string;
  description?: string;
  image?: string;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com';

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function plainText(html?: string) {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, length = 155) {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1).trim()}...`;
}

async function getPublishedTour(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;

  await connectDB();

  const tour = await Tour.findOne({ _id: id, status: 'published' })
    .select('title description image category dates accommodation departure startingPrice priceLabel updatedAt')
    .lean<PublishedTour>()
    .exec();

  return tour;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tour = await getPublishedTour(params.id);

  if (!tour) {
    return {
      title: 'Package Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = tour.title;
  const description =
    truncate(plainText(tour.description)) ||
    `View dates, accommodation, itinerary, and booking request details for ${tour.title} with Naasir Travel.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/packages/${params.id}`,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/packages/${params.id}`,
      images: tour.image ? [tour.image] : ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tour.image ? [tour.image] : ['/logo.png'],
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const tour = await getPublishedTour(params.id);
  const packageJsonLd = tour
    ? {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: tour.title,
        description:
          plainText(tour.description) ||
          `Travel package details for ${tour.title} with Naasir Travel.`,
        image: tour.image ? absoluteUrl(tour.image) : absoluteUrl('/logo.png'),
        url: absoluteUrl(`/packages/${params.id}`),
        provider: {
          '@type': 'TravelAgency',
          name: 'Naasir Travel',
          url: siteUrl,
        },
      }
    : null;

  return (
    <>
      {packageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(packageJsonLd) }}
        />
      )}
      <PackageDetailClient packageId={params.id} />
    </>
  );
}
