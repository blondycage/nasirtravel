import { NextRequest } from 'next/server';
import { retrieveContext } from '@/lib/chatbot/retrieval';
import { logChatQuestion } from '@/lib/chatbot/analytics';
import { buildModelMessages, buildRetrievalQuery, formatKnowledgeContext } from '@/lib/chatbot/context';
import { evaluateEvidence } from '@/lib/chatbot/evidence';
import { buildLocalFallbackResponse } from '@/lib/chatbot/fallback';
import { evaluateChatGuardrails } from '@/lib/chatbot/guardrails';
import { getWhatsAppHandoffAction, shouldOfferHumanHandoff } from '@/lib/chatbot/handoff';
import { buildSystemPrompt } from '@/lib/chatbot/prompt';
import {
  createChatCompletionStream,
  getChatModel,
  getChatProviderErrorInfo,
  isChatProviderUnavailable,
} from '@/lib/chatbot/provider';
import { checkChatRateLimit, getClientIdentifier } from '@/lib/chatbot/rate-limit';
import { validateChatRequest } from '@/lib/chatbot/request';
import {
  CHAT_STREAM_HEADERS,
  createGroqChatStream,
  createStaticChatStream,
  sourcesFromResults,
} from '@/lib/chatbot/streaming';

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const rateLimit = checkChatRateLimit(getClientIdentifier(req));
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: `Too many chat requests. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      });
    }

    let requestData;
    try {
      requestData = await validateChatRequest(req);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message, history } = requestData;
    const guardrail = evaluateChatGuardrails(
      message,
      history.length
    );

    if (!guardrail.allowed) {
      void logChatQuestion({
        message,
        results: [],
        guardrail,
        handoffOffered: true,
        model: getChatModel(),
        startedAt,
      });

      return new Response(createStaticChatStream(guardrail.response || ''), {
        headers: CHAT_STREAM_HEADERS,
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'Chat is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const retrievalQuery = buildRetrievalQuery(message, history);
    const results = retrieveContext(retrievalQuery, 5);
    const evidence = evaluateEvidence(results);
    const groundedResults = evidence.sufficient ? results : [];
    const handoff = shouldOfferHumanHandoff(message, evidence.sufficient)
      ? getWhatsAppHandoffAction(message)
      : null;
    void logChatQuestion({
      message,
      results,
      evidence,
      guardrail,
      handoffOffered: Boolean(handoff),
      model: getChatModel(),
      startedAt,
    });
    const knowledgeContext = formatKnowledgeContext(groundedResults);
    const systemPrompt = buildSystemPrompt(knowledgeContext);

    const messages = buildModelMessages({
      systemPrompt,
      history,
      currentQuestion: message,
    });

    let stream: Awaited<ReturnType<typeof createChatCompletionStream>>;
    try {
      stream = await createChatCompletionStream(messages);
    } catch (error) {
      if (!isChatProviderUnavailable(error)) {
        throw error;
      }

      const providerError = getChatProviderErrorInfo(error);
      console.warn('[Chat Provider Unavailable]', {
        status: providerError.status,
        message: providerError.message,
      });

      return new Response(createStaticChatStream(
        buildLocalFallbackResponse({
          results: groundedResults,
          evidence,
          handoff,
        }),
        {
          sources: sourcesFromResults(groundedResults),
          evidence,
          handoff,
          ticketAvailable: shouldOfferHumanHandoff(message, evidence.sufficient),
          responseMode: 'knowledge',
        },
        {
          chunkDelayMs: 16,
        }
      ), {
        headers: CHAT_STREAM_HEADERS,
      });
    }

    return new Response(createGroqChatStream({
      groqStream: stream,
      sources: sourcesFromResults(groundedResults),
      evidence,
      handoff,
      ticketAvailable: shouldOfferHumanHandoff(message, evidence.sufficient),
    }), {
      headers: CHAT_STREAM_HEADERS,
    });
  } catch (err) {
    console.error('[Chat API Error]', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
