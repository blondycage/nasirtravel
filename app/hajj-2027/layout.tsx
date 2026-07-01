import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hajj 2027 Guidance',
  description:
    'Register interest for Hajj 2027 guidance, group coordination, Nusuk support, and preparation with Naasir Travel.',
  alternates: {
    canonical: '/hajj-2027',
  },
  openGraph: {
    title: 'Hajj 2027 Guidance | Naasir Travel',
    description:
      'Register interest for Hajj 2027 guidance and group coordination with Naasir Travel.',
    url: '/hajj-2027',
  },
};

export default function Hajj2027Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
