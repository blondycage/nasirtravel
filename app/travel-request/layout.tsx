import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Trip | Naasir Travel',
  description: 'Request flights, hotels, an existing package, or a custom travel package without creating an account.',
};

export default function TravelRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
