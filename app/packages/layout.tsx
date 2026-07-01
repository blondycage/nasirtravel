import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Packages',
  description:
    'Browse Naasir Travel packages for Hajj, Umrah, Asia, Africa, Europe, and custom trips.',
  alternates: {
    canonical: '/packages',
  },
  openGraph: {
    title: 'Travel Packages | Naasir Travel',
    description:
      'Browse Hajj, Umrah, and worldwide travel packages from Naasir Travel.',
    url: '/packages',
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
