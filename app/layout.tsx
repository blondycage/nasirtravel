import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-lexend',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Naasir Travel | Hajj, Umrah & Travel Packages',
    template: '%s | Naasir Travel',
  },
  description:
    'Naasir Travel helps clients book Hajj, Umrah, and worldwide travel packages with guided support.',
  applicationName: 'Naasir Travel',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Naasir Travel',
    url: '/',
    title: 'Naasir Travel | Hajj, Umrah & Travel Packages',
    description: 'Explore Hajj, Umrah, and worldwide travel packages with Naasir Travel.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Naasir Travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naasir Travel | Hajj, Umrah & Travel Packages',
    description: 'Explore Hajj, Umrah, and worldwide travel packages with Naasir Travel.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Naasir Travel',
    url: siteUrl,
    logo: new URL('/logo.png', siteUrl).toString(),
    description:
      'Naasir Travel helps clients book Hajj, Umrah, and worldwide travel packages with guided support.',
  };

  return (
    <html lang="en">
      <body className={lexend.className}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  );
}
