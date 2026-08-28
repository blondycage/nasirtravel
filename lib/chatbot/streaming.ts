import { EvidenceDecision } from './evidence';
import { HandoffAction } from './handoff';
import { RetrievalResult } from './retrieval';

export type ChatStreamEvent =
  | { type: 'text'; text: string }
  | {
      type: 'metadata';
      sources: ChatSource[];
      evidence: EvidenceDecision;
      handoff?: HandoffAction | null;
      ticketAvailable?: boolean;
      responseMode?: 'ai' | 'knowledge';
    }
  | { type: 'error'; message: string }
  | { type: 'done' };

export interface ChatSource {
  id: string;
  category: string;
  question: string;
}

const encoder = new TextEncoder();

function encodeEvent(event: ChatStreamEvent) {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

export function sourcesFromResults(results: RetrievalResult[]): ChatSource[] {
  return results.map(result => ({
    id: result.entry.id,
    category: result.entry.category,
    question: result.entry.question,
  }));
}

function splitForStreaming(text: string) {
  return text.match(/\S+\s*/g) || [text];
}

export function createStaticChatStream(
  text: string,
  metadata?: Omit<Extract<ChatStreamEvent, { type: 'metadata' }>, 'type'>,
  options: { chunkDelayMs?: number } = {}
) {
  return new ReadableStream({
    async start(controller) {
      const chunkDelayMs = options.chunkDelayMs ?? 18;

      for (const chunk of splitForStreaming(text)) {
        controller.enqueue(encodeEvent({ type: 'text', text: chunk }));
        if (chunkDelayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, chunkDelayMs));
        }
      }

      if (metadata) {
        controller.enqueue(encodeEvent({ type: 'metadata', ...metadata }));
      }
      controller.enqueue(encodeEvent({ type: 'done' }));
      controller.close();
    },
  });
}

export function createGroqChatStream({
  groqStream,
  sources,
  evidence,
  handoff,
  ticketAvailable,
}: {
  groqStream: AsyncIterable<{ choices: { delta?: { content?: string | null } }[] }>;
  sources: ChatSource[];
  evidence: EvidenceDecision;
  handoff?: HandoffAction | null;
  ticketAvailable?: boolean;
}) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encodeEvent({ type: 'text', text }));
        }

        controller.enqueue(encodeEvent({
          type: 'metadata',
          sources,
          evidence,
          handoff,
          ticketAvailable,
          responseMode: 'ai',
        }));
        controller.enqueue(encodeEvent({ type: 'done' }));
        controller.close();
      } catch (error) {
        console.error('[Chat Stream Error]', error);
        controller.enqueue(encodeEvent({
          type: 'error',
          message: 'The response was interrupted. Please try again.',
        }));
        controller.close();
      }
    },
  });
}

export const CHAT_STREAM_HEADERS = {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Cache-Control': 'no-cache',
  'X-Accel-Buffering': 'no',
};
