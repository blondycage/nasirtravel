# Production Readiness

Implemented:

- local version-controlled KB
- lexical retrieval
- retrieval debug command
- eval command
- evidence gate
- prompt/domain guardrails
- bounded history validation
- structured streaming
- citations
- WhatsApp handoff
- support ticket persistence
- analytics privacy toggle
- in-memory rate limiting
- Groq timeout

Known limitations:

- In-memory rate limiting only protects one running server instance.
- Local neural embeddings are not implemented yet.
- TypeScript validation is skipped by Next build config.
- Some existing API routes log dynamic rendering warnings during build.
- Contact page hours conflict with the chatbot KB and need business review.

