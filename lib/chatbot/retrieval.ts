import knowledgeBase, { KBEntry } from './knowledge-base';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'for',
  'of', 'and', 'or', 'but', 'with', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'do', 'does', 'can', 'how', 'what', 'when', 'where',
  'who', 'which', 'this', 'that', 'be', 'are', 'was', 'were', 'will',
  'would', 'could', 'should', 'have', 'has', 'had', 'not', 'no',
  'there', 'here', 'so', 'if', 'about', 'from', 'get', 'got',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[''`]/g, '')
    .split(/[\s\W]+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function scoreEntry(queryTokens: string[], entry: KBEntry): number {
  const targetText = `${entry.question} ${entry.answer} ${entry.keywords.join(' ')} ${entry.category}`;
  const targetTokens = tokenize(targetText);
  const targetSet = new Set(targetTokens);

  let score = 0;

  for (const qt of queryTokens) {
    // Exact match in keywords (highest weight)
    if (entry.keywords.some(k => k.toLowerCase().includes(qt))) {
      score += 3;
    }
    // Exact token match in full text
    if (targetSet.has(qt)) {
      score += 2;
    }
    // Partial/substring match
    for (const tt of targetTokens) {
      if (tt.includes(qt) || qt.includes(tt)) {
        score += 0.5;
        break;
      }
    }
  }

  // Boost score relative to query length (precision)
  return queryTokens.length > 0 ? score / queryTokens.length : 0;
}

export interface RetrievalResult {
  entry: KBEntry;
  score: number;
}

export function retrieveContext(query: string, topK = 3): RetrievalResult[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return knowledgeBase.slice(0, topK).map(entry => ({ entry, score: 0 }));
  }

  const scored = knowledgeBase
    .map(entry => ({ entry, score: scoreEntry(queryTokens, entry) }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).filter(r => r.score > 0);
}

export function formatContext(results: RetrievalResult[]): string {
  if (results.length === 0) return '';

  return results
    .map(
      r => `[${r.entry.category}] ${r.entry.question}\n${r.entry.answer}`
    )
    .join('\n\n---\n\n');
}
