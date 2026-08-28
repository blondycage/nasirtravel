import { EvidenceDecision } from './evidence';
import { HandoffAction } from './handoff';
import { RetrievalResult } from './retrieval';

const CONTACT_FALLBACK = `I want to be careful with that one. I do not have enough Naasir Travel information to answer confidently right now.

The best next step is to contact the Naasir Travel team directly:
- Office line: 604-330-0307
- WhatsApp: 236-979-8030
- Email: Info@naasirtravel.com`;

function trimAnswer(answer: string) {
  return answer.trim();
}

export function buildLocalFallbackResponse({
  results,
  evidence,
  handoff,
}: {
  results: RetrievalResult[];
  evidence: EvidenceDecision;
  handoff?: HandoffAction | null;
}) {
  if (!evidence.sufficient || results.length === 0) {
    return CONTACT_FALLBACK;
  }

  const relevantAnswers = results.slice(0, 2).map(result => trimAnswer(result.entry.answer));
  const intro = "I'm using Naasir Travel's saved travel knowledge while the live AI provider is unavailable. Here's what I found:\n\n";
  const handoffText = handoff
    ? '\n\nFor anything specific to your booking, you can use the WhatsApp support link below.'
    : '';

  return `${intro}${relevantAnswers.join('\n\n')}${handoffText}`;
}
