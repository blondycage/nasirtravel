import { ChatMessage } from './context';

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_CHARS = 1000;
const MAX_TOTAL_HISTORY_CHARS = 4000;

export interface ValidatedChatRequest {
  message: string;
  history: ChatMessage[];
}

export async function validateChatRequest(req: Request): Promise<ValidatedChatRequest> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new Error('Malformed JSON request');
  }

  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  const record = body as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message.trim() : '';

  if (!message) {
    throw new Error('Message is required');
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    throw new Error(`Message must be ${MAX_MESSAGE_CHARS} characters or fewer`);
  }

  return {
    message,
    history: validateHistory(record.history),
  };
}

function validateHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  const safeMessages: ChatMessage[] = [];
  let totalChars = 0;

  for (const item of history.slice(-MAX_HISTORY_MESSAGES).reverse()) {
    if (!item || typeof item !== 'object') continue;

    const record = item as Record<string, unknown>;
    if (record.role !== 'user' && record.role !== 'assistant') continue;
    if (typeof record.content !== 'string') continue;

    const content = record.content.trim().slice(0, MAX_HISTORY_MESSAGE_CHARS);
    if (!content) continue;

    if (totalChars + content.length > MAX_TOTAL_HISTORY_CHARS) continue;

    totalChars += content.length;
    safeMessages.unshift({
      role: record.role,
      content,
    });
  }

  return safeMessages;
}
