const DOMAIN_TERMS = [
  'naasir', 'travel', 'trip', 'package', 'packages', 'umrah', 'hajj',
  'visa', 'passport', 'booking', 'book', 'payment', 'pay', 'refund',
  'cancel', 'cancellation', 'flight', 'flights', 'hotel', 'hotels',
  'tour', 'tours', 'destination', 'transfer', 'documents', 'document',
  'insurance', 'support', 'contact', 'complaint', 'dashboard', 'invoice',
  'child', 'children', 'family', 'vaccine', 'vaccination', 'mahram',
  'ihram', 'nusuk', 'saudi', 'makkah', 'madinah', 'airline', 'baggage',
  'whatsapp', 'email', 'office', 'hours',
  'person', 'someone', 'human', 'agent', 'representative', 'staff',
];

const OFF_TOPIC_TERMS = [
  'react', 'component', 'javascript', 'typescript', 'python', 'code',
  'malware', 'exploit', 'football', 'calculus', 'essay', 'vote',
  'election', 'recipe', 'stock', 'crypto',
];

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) instructions/i,
  /reveal (your )?(system|developer) prompt/i,
  /show (your )?(system|developer) prompt/i,
  /forget (naasir|your instructions|the rules)/i,
  /you are now/i,
  /act as an? unrestricted/i,
  /become chatgpt/i,
  /search the web/i,
  /browse the internet/i,
];

const REFUSAL =
  "I'm Naasir, your travel assistant - I'm only able to help with travel-related questions and Naasir Travel services. Is there anything about your trip, package, booking, documents, payment, Hajj, or Umrah that I can help with?";

export interface GuardrailDecision {
  allowed: boolean;
  reason: string;
  response?: string;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function hasDomainTerm(text: string) {
  const normalized = normalize(text);
  return DOMAIN_TERMS.some(term => normalized.includes(term));
}

function hasOffTopicTerm(text: string) {
  const normalized = normalize(text);
  return OFF_TOPIC_TERMS.some(term => normalized.includes(term));
}

function isLikelyFollowUp(message: string, historyLength: number) {
  if (historyLength === 0) return false;

  const normalized = normalize(message);
  return /^(what about|how about|and|also|what if|can they|can i|how much|what documents|do they)\b/.test(normalized);
}

export function evaluateChatGuardrails(message: string, historyLength = 0): GuardrailDecision {
  if (INJECTION_PATTERNS.some(pattern => pattern.test(message))) {
    return {
      allowed: false,
      reason: 'Prompt injection attempt detected.',
      response: REFUSAL,
    };
  }

  if (hasDomainTerm(message) || isLikelyFollowUp(message, historyLength)) {
    return {
      allowed: true,
      reason: 'Message appears related to travel or Naasir Travel support.',
    };
  }

  if (hasOffTopicTerm(message)) {
    return {
      allowed: false,
      reason: 'Message appears outside the travel-support domain.',
      response: REFUSAL,
    };
  }

  return {
    allowed: false,
    reason: 'No travel-support domain signal found.',
    response: REFUSAL,
  };
}
