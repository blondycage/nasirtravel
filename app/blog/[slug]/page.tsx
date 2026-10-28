import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogArticle from '@/components/BlogArticle';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';

async function getPost(slug: string) { await connectDB(); return BlogPost.findOne({ slug, status: 'published' }).lean(); }
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> { const post: any = await getPost(params.slug); if (!post) return { title: 'Article not found', robots: { index: false, follow: false } }; const description = post.seoDescription || post.excerpt; return { title: post.seoTitle || post.title, description, alternates: { canonical: post.canonicalUrl || `/blog/${post.slug}` }, openGraph: { type: 'article', title: post.seoTitle || post.title, description, url: `/blog/${post.slug}`, publishedTime: post.publishedAt?.toISOString(), authors: [post.author], images: post.coverImage ? [post.coverImage] : ['/logo.png'] }, twitter: { card: 'summary_large_image', title: post.seoTitle || post.title, description, images: post.coverImage ? [post.coverImage] : ['/logo.png'] } }; }
export default async function BlogPostPage({ params }: { params: { slug: string } }) { const post: any = await getPost(params.slug); if (!post) notFound(); const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naasirtravel.com'; const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.excerpt, datePublished: post.publishedAt, dateModified: post.updatedAt, author: { '@type': 'Person', name: post.author }, publisher: { '@type': 'Organization', name: 'Naasir Travel', logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } }, image: post.coverImage || `${siteUrl}/logo.png`, mainEntityOfPage: `${siteUrl}/blog/${post.slug}` }; return <><Header /><main className="min-h-screen bg-white pt-20"><BlogArticle post={JSON.parse(JSON.stringify(post))} /></main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Footer /></>; }
