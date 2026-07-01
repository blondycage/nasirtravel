import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UauthorisedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
