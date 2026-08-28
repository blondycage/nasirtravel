import connectDB from '@/lib/mongodb';
import ChatQuestion from '@/lib/models/ChatQuestion';
import { EvidenceDecision } from './evidence';
import { GuardrailDecision } from './guardrails';
import { RetrievalResult } from './retrieval';

interface ChatAnalyticsInput {
  message: string;
  results: RetrievalResult[];
  evidence?: EvidenceDecision;
  guardrail?: GuardrailDecision;
  handoffOffered?: boolean;
  model?: string;
  startedAt?: number;
}

function normalizeQuery(message: string) {
  return message
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
}

function shouldStoreRawMessage() {
  return process.env.CHAT_ANALYTICS_STORE_RAW_MESSAGE === 'true';
}

export async function logChatQuestion(input: ChatAnalyticsInput) {
  try {
    await connectDB();
    await ChatQuestion.create({
      message: shouldStoreRawMessage() ? input.message.slice(0, 1000) : undefined,
      normalizedQuery: normalizeQuery(input.message),
      matchedEntries: input.results.map(result => ({
        id: result.entry.id,
        category: result.entry.category,
        lexicalScore: result.lexicalScore,
        combinedScore: result.combinedScore,
        score: result.score,
      })),
      evidenceSufficient: input.evidence?.sufficient,
      evidenceReason: input.evidence?.reason,
      guardrailAllowed: input.guardrail?.allowed,
      guardrailReason: input.guardrail?.reason,
      handoffOffered: input.handoffOffered,
      model: input.model,
      latencyMs: input.startedAt ? Date.now() - input.startedAt : undefined,
    });
  } catch (error) {
    console.error('[Chat Analytics Error]', error);
  }
}
