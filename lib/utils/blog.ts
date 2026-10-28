import { sanitizeHtml, htmlToPlainText } from '@/lib/utils/sanitizeHtml';

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadingTime(content: string) {
  const words = htmlToPlainText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function sanitizeBlogContent(content: string) {
  return sanitizeHtml(content || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      '*': ['class', 'title'],
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title'],
    },
  });
}

export function normalizeTags(tags: unknown) {
  const values = Array.isArray(tags) ? tags : String(tags || '').split(',');
  return [...new Set(values.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}
