import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmation',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
