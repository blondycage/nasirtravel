'use client';

import Image from 'next/image';
export default function BlogArticle({ post }: { post: any }) {
  return <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
    <div className="mb-8 text-center">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-orange">{post.category}</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{post.title}</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">{post.excerpt}</p>
      <p className="mt-5 text-sm text-slate-500">By {post.author} · {new Date(post.publishedAt || post.createdAt).toLocaleDateString()} · {post.readingTime} min read</p>
    </div>
    {post.coverImage && <figure className="mb-10 overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
      <Image src={post.coverImage} alt={post.coverImageAlt || post.title} width={1400} height={760} className="h-auto w-full object-cover" priority />
      {post.coverImageCaption && <figcaption className="px-5 py-3 text-sm text-slate-500">{post.coverImageCaption}</figcaption>}
    </figure>}
    <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    {post.tags?.length > 0 && <div className="mt-10 flex flex-wrap gap-2">{post.tags.map((tag: string) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">#{tag}</span>)}</div>}
  </article>;
}
