const DEFAULT_ALLOWED_TAGS = [
  'address',
  'article',
  'aside',
  'footer',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'main',
  'nav',
  'section',
  'blockquote',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'hr',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'ul',
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  'rb',
  'rp',
  'rt',
  'rtc',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
  'caption',
  'col',
  'colgroup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
];

type AllowedAttributes = Record<string, string[]>;

type SanitizeOptions = {
  allowedTags?: string[];
  allowedAttributes?: AllowedAttributes;
};

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeAttributes(rawAttributes: string, tagName: string, allowedAttributes: AllowedAttributes) {
  const allowed = new Set([...(allowedAttributes['*'] ?? []), ...(allowedAttributes[tagName] ?? [])]);
  if (allowed.size === 0) return '';

  const attrs: string[] = [];
  const attrPattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(rawAttributes)) !== null) {
    const name = match[1].toLowerCase();
    if (!allowed.has(name) || name.startsWith('on')) continue;

    const value = match[2] ?? match[3] ?? match[4] ?? '';
    if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) continue;

    attrs.push(` ${name}="${escapeAttribute(value)}"`);
  }

  return attrs.join('');
}

export function sanitizeHtml(html: string, options: SanitizeOptions = {}) {
  const allowedTags = new Set((options.allowedTags ?? DEFAULT_ALLOWED_TAGS).map(tag => tag.toLowerCase()));
  const allowedAttributes = options.allowedAttributes ?? {};

  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g, (match, tagName: string, rawAttributes: string) => {
      const normalizedTag = tagName.toLowerCase();
      if (!allowedTags.has(normalizedTag)) return '';
      if (match.startsWith('</')) return `</${normalizedTag}>`;

      const attributes = sanitizeAttributes(rawAttributes, normalizedTag, allowedAttributes);
      const selfClosing = /\/\s*$/.test(rawAttributes) ? ' /' : '';
      return `<${normalizedTag}${attributes}${selfClosing}>`;
    });
}

export function htmlToPlainText(html?: string) {
  if (!html) return '';

  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

sanitizeHtml.defaults = {
  allowedTags: DEFAULT_ALLOWED_TAGS,
};
