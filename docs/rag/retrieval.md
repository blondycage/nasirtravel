# Retrieval

Retrieval is implemented in `lib/chatbot/retrieval.ts`.

The current production mode is local lexical retrieval:

1. Normalize the query.
2. Remove stop words.
3. Create tokens and short phrases.
4. Score each KB entry across keywords, question, category, and answer.
5. Rank by combined score.
6. Return top-k results.

`npm run rag:search -- "What documents do I need for Umrah?"` shows the retrieval process without Groq.

Local semantic embeddings were evaluated and deferred because the KB is small and deployment constraints are unknown.

