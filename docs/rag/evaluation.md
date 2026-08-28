# Evaluation

Use:

```bash
npm run rag:eval
```

The eval measures:

- retrieval top-1
- retrieval top-3
- retrieval top-5
- guardrail allow/refuse behavior

It does not call Groq. It tests retrieval and guardrails deterministically.

