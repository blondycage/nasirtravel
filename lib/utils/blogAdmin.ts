import { calculateReadingTime, normalizeTags, sanitizeBlogContent, slugify } from '@/lib/utils/blog';

export function prepareBlogPost(body: Record<string, any>) {
  const content = sanitizeBlogContent(body.content || '');
  const status = ['draft', 'published', 'archived'].includes(body.status) ? body.status : 'draft';
  return {
    title: String(body.title || '').trim(), slug: slugify(body.slug || body.title || ''), excerpt: String(body.excerpt || '').trim(), content,
    coverImage: String(body.coverImage || '').trim(), coverImageAlt: String(body.coverImageAlt || '').trim(), coverImageCaption: String(body.coverImageCaption || '').trim(),
    category: String(body.category || 'Travel').trim(), tags: normalizeTags(body.tags), author: String(body.author || 'Naasir Travel').trim(), readingTime: calculateReadingTime(content),
    seoTitle: String(body.seoTitle || '').trim(), seoDescription: String(body.seoDescription || '').trim(), canonicalUrl: String(body.canonicalUrl || '').trim(), status,
    ...(status === 'published' ? { publishedAt: body.publishedAt || new Date() } : {}),
  };
}

export function validateBlogPost(input: ReturnType<typeof prepareBlogPost>) {
  if (!input.title || !input.slug || !input.excerpt || !input.content || !input.category || !input.author) return 'Title, slug, excerpt, content, category, and author are required.';
  if (input.status === 'published' && input.coverImage && !input.coverImageAlt) return 'Cover image alt text is required when publishing.';
  return null;
}
