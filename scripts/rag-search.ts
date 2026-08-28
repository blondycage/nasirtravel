import { formatKnowledgeContext } from '@/lib/chatbot/context';
import { evaluateEvidence } from '@/lib/chatbot/evidence';
import { prepareQuery, retrieveContext } from '@/lib/chatbot/retrieval';

const query = process.argv.slice(2).join(' ').trim();
const topKArg = process.env.RAG_TOP_K ? Number(process.env.RAG_TOP_K) : 5;
const topK = Number.isFinite(topKArg) && topKArg > 0 ? topKArg : 5;

if (!query) {
  console.error('Usage: npm run rag:search -- "What documents do I need?"');
  process.exit(1);
}

const prepared = prepareQuery(query);
const results = retrieveContext(query, topK);
const evidence = evaluateEvidence(results);

console.log('\nQUERY');
console.log(`"${query}"`);

console.log('\nPREPARED QUERY');
console.log(JSON.stringify({
  normalized: prepared.normalized,
  tokens: prepared.tokens,
  phrases: prepared.phrases,
}, null, 2));

console.log('\nLEXICAL RESULTS');
if (results.length === 0) {
  console.log('No lexical matches.');
} else {
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.entry.id}`);
    console.log(`   category: ${result.entry.category}`);
    console.log(`   lexicalScore: ${result.lexicalScore}`);
    console.log(`   combinedScore: ${result.combinedScore}`);
    console.log(`   reasons: ${result.reasons.join('; ') || 'none'}`);
    console.log(`   question: ${result.entry.question}`);
  });
}

console.log('\nFINAL CONTEXT PREVIEW');
console.log(evidence);
console.log(evidence.sufficient ? formatKnowledgeContext(results) : 'No context would be injected.');
