import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Naasir Travel for Hajj, Umrah, and travel package enquiries.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Naasir Travel',
    description: 'Contact Naasir Travel for Hajj, Umrah, and travel package enquiries.',
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
