import knowledgeBase, { KBEntry } from './knowledge-base';

const DEFAULT_TOP_K = 5;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'for',
  'of', 'and', 'or', 'but', 'with', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'do', 'does', 'can', 'how', 'what', 'when', 'where',
  'who', 'which', 'this', 'that', 'be', 'are', 'was', 'were', 'will',
  'would', 'could', 'should', 'have', 'has', 'had', 'not', 'no',
  'there', 'here', 'so', 'if', 'about', 'from', 'get', 'got',
  'please', 'tell', 'need', 'want', 'like', 'know',
]);

const FIELD_WEIGHTS = {
  keyword: 5,
  question: 3.5,
  category: 2.5,
  answer: 1,
};

const PHRASE_WEIGHTS = {
  keyword: 8,
  question: 6,
  category: 4,
  answer: 2,
};

export interface PreparedQuery {
  original: string;
  normalized: string;
  tokens: string[];
  phrases: string[];
}

export interface RetrievalResult {
  entry: KBEntry;
  lexicalScore: number;
  combinedScore: number;
  score: number;
  reasons: string[];
}

export interface RetrievalOptions {
  topK?: number;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeToken(token: string): string {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('s') && token.length > 4) return token.slice(0, -1);
  return token;
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .map(normalizeToken)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function getPhrases(tokens: string[]): string[] {
  const phrases: string[] = [];

  for (let size = 2; size <= Math.min(4, tokens.length); size += 1) {
    for (let i = 0; i <= tokens.length - size; i += 1) {
      phrases.push(tokens.slice(i, i + size).join(' '));
    }
  }

  return phrases;
}

export function prepareQuery(query: string): PreparedQuery {
  const tokens = tokenize(query);

  return {
    original: query,
    normalized: normalizeText(query),
    tokens,
    phrases: getPhrases(tokens),
  };
}

function countTokenMatches(queryTokens: string[], fieldTokens: string[]): number {
  if (queryTokens.length === 0 || fieldTokens.length === 0) return 0;

  const frequencies = new Map<string, number>();
  for (const token of fieldTokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  return queryTokens.reduce((score, token) => {
    const exactCount = frequencies.get(token) ?? 0;
    if (exactCount > 0) return score + Math.min(exactCount, 3);

    const fuzzyMatch = fieldTokens.some(fieldToken => isNearMatch(token, fieldToken));
    return fuzzyMatch ? score + 0.5 : score;
  }, 0);
}

function isNearMatch(a: string, b: string) {
  if (a.length < 5 || b.length < 5) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return editDistanceWithinOne(a, b);
}

function editDistanceWithinOne(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;

  let edits = 0;
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }

  return true;
}

function scorePhraseMatches(phrases: string[], normalizedField: string, weight: number) {
  return phrases.reduce((score, phrase) => (
    normalizedField.includes(phrase) ? score + weight : score
  ), 0);
}

function scoreEntry(query: PreparedQuery, entry: KBEntry): RetrievalResult {
  const keywordText = entry.keywords.join(' ');
  const fields = [
    { name: 'keyword', text: keywordText, weight: FIELD_WEIGHTS.keyword, phraseWeight: PHRASE_WEIGHTS.keyword },
    { name: 'question', text: entry.question, weight: FIELD_WEIGHTS.question, phraseWeight: PHRASE_WEIGHTS.question },
    { name: 'category', text: entry.category, weight: FIELD_WEIGHTS.category, phraseWeight: PHRASE_WEIGHTS.category },
    { name: 'answer', text: entry.answer, weight: FIELD_WEIGHTS.answer, phraseWeight: PHRASE_WEIGHTS.answer },
  ];

  let rawScore = 0;
  const reasons: string[] = [];

  for (const field of fields) {
    const fieldTokens = tokenize(field.text);
    const tokenMatches = countTokenMatches(query.tokens, fieldTokens);
    const phraseScore = scorePhraseMatches(query.phrases, normalizeText(field.text), field.phraseWeight);

    if (tokenMatches > 0) {
      rawScore += tokenMatches * field.weight;
      reasons.push(`${field.name} token match x${tokenMatches}`);
    }

    if (phraseScore > 0) {
      rawScore += phraseScore;
      reasons.push(`${field.name} phrase match`);
    }
  }

  const queryLengthNormalizer = Math.sqrt(Math.max(query.tokens.length, 1));
  const lexicalScore = Number((rawScore / queryLengthNormalizer).toFixed(4));

  return {
    entry,
    lexicalScore,
    combinedScore: lexicalScore,
    score: lexicalScore,
    reasons,
  };
}

export function lexicalSearch(query: PreparedQuery, topK = DEFAULT_TOP_K): RetrievalResult[] {
  if (query.tokens.length === 0) {
    return [];
  }

  return knowledgeBase
    .map(entry => scoreEntry(query, entry))
    .filter(result => result.lexicalScore > 0)
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, topK);
}

export function retrieveContext(query: string, topKOrOptions: number | RetrievalOptions = DEFAULT_TOP_K): RetrievalResult[] {
  const options = typeof topKOrOptions === 'number' ? { topK: topKOrOptions } : topKOrOptions;
  const preparedQuery = prepareQuery(query);

  return lexicalSearch(preparedQuery, options.topK ?? DEFAULT_TOP_K);
}

export function formatContext(results: RetrievalResult[]): string {
  if (results.length === 0) return '';

  return results
    .map(
      result => `[${result.entry.category}] ${result.entry.question}\n${result.entry.answer}`
    )
    .join('\n\n---\n\n');
}
