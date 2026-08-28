import { RetrievalResult } from './retrieval';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function formatKnowledgeContext(results: RetrievalResult[]) {
  if (results.length === 0) return '';

  return results
    .map(
      result => `Entry ID: ${result.entry.id}
Category: ${result.entry.category}
Question: ${result.entry.question}
Answer:
${result.entry.answer}`
    )
    .join('\n\n---\n\n');
}

export function buildModelMessages({
  systemPrompt,
  history,
  currentQuestion,
}: {
  systemPrompt: string;
  history: ChatMessage[];
  currentQuestion: string;
}): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: currentQuestion },
  ];
}

export function buildRetrievalQuery(currentQuestion: string, history: ChatMessage[]) {
  const normalized = currentQuestion.toLowerCase().trim();
  const isFollowUp =
    /^(what about|how about|and|also|what if|can they|can i|how much|what documents|do they)\b/.test(normalized) ||
    normalized.split(/\s+/).length <= 4;

  if (!isFollowUp || history.length === 0) return currentQuestion;

  const lastUserMessage = [...history].reverse().find(message => message.role === 'user');
  if (!lastUserMessage) return currentQuestion;

  return `${lastUserMessage.content}\n${currentQuestion}`;
}
