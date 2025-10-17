import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: 'Naasir Travel - Your Full-Service Travel Agency',
  description: 'Explore current packages, or plan your dream vacation with Naasir Travel. Specialists in Hajj, Umrah, and worldwide tours.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lexend.className}>{children}</body>
    </html>
  );
}
