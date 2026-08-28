import Groq from 'groq-sdk';
import { ChatMessage } from './context';

const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_TIMEOUT_MS = 25_000;
const PROVIDER_UNAVAILABLE_STATUSES = new Set([401, 403, 408, 429, 500, 502, 503, 504]);

export interface ChatProviderErrorInfo {
  status?: number;
  message: string;
}

export function getChatModel() {
  return process.env.GROQ_MODEL || DEFAULT_MODEL;
}

export function getGroqBaseUrl() {
  return process.env.GROQ_BASE_URL || 'https://api.groq.com';
}

export function requireGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return apiKey;
}

export async function createChatCompletionStream(messages: ChatMessage[]) {
  const groq = new Groq({
    apiKey: requireGroqApiKey(),
    baseURL: getGroqBaseUrl(),
  });
  const timeoutMs = Number(process.env.CHAT_MODEL_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await groq.chat.completions.create({
      model: getChatModel(),
      messages,
      stream: true,
      max_tokens: 512,
      temperature: 0.4,
    }, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function getChatProviderErrorInfo(error: unknown): ChatProviderErrorInfo {
  if (error instanceof Error) {
    const errorWithStatus = error as Error & { status?: unknown };
    const status = typeof errorWithStatus.status === 'number'
      ? errorWithStatus.status
      : undefined;

    return {
      status,
      message: error.message,
    };
  }

  return {
    message: 'Unknown chat provider error',
  };
}

export function isChatProviderUnavailable(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  const { status } = getChatProviderErrorInfo(error);
  return typeof status === 'number' && PROVIDER_UNAVAILABLE_STATUSES.has(status);
}
