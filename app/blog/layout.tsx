import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Travel Journal', description: 'Travel inspiration, Hajj and Umrah guidance, destination ideas, and practical advice from Naasir Travel.', alternates: { canonical: '/blog' }, openGraph: { title: 'Travel Journal | Naasir Travel', description: 'Travel inspiration and practical guidance from Naasir Travel.', url: '/blog' } };
export default function BlogLayout({ children }: { children: React.ReactNode }) { return children; }
