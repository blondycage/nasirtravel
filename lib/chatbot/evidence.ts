import { RetrievalResult } from './retrieval';

export const EVIDENCE_THRESHOLDS = {
  minimumTopScore: 6,
  minimumResultCount: 1,
};

export interface EvidenceDecision {
  sufficient: boolean;
  reason: string;
  topScore: number;
  resultCount: number;
}

export function evaluateEvidence(results: RetrievalResult[]): EvidenceDecision {
  const topScore = results[0]?.combinedScore ?? 0;

  if (results.length < EVIDENCE_THRESHOLDS.minimumResultCount) {
    return {
      sufficient: false,
      reason: 'No local knowledge base entries matched the query.',
      topScore,
      resultCount: results.length,
    };
  }

  if (topScore < EVIDENCE_THRESHOLDS.minimumTopScore) {
    return {
      sufficient: false,
      reason: `Top retrieval score ${topScore} is below threshold ${EVIDENCE_THRESHOLDS.minimumTopScore}.`,
      topScore,
      resultCount: results.length,
    };
  }

  return {
    sufficient: true,
    reason: 'Local knowledge evidence is sufficient for context injection.',
    topScore,
    resultCount: results.length,
  };
}
