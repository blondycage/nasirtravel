# Naasir Travel Chatbot Architecture

```text
ChatWidget
  -> POST /api/chat
  -> validateChatRequest()
  -> checkChatRateLimit()
  -> evaluateChatGuardrails()
  -> buildRetrievalQuery()
  -> retrieveContext()
  -> evaluateEvidence()
  -> formatKnowledgeContext()
  -> buildSystemPrompt()
  -> createChatCompletionStream()
  -> NDJSON stream
  -> ChatWidget text + sources + handoff actions
```

The knowledge base remains local in `lib/chatbot/knowledge-base.ts`.
MongoDB is used for analytics and support tickets, not for the knowledge base.
Normal chat conversations are not persisted.

