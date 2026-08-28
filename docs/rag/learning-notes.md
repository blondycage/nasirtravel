# Learning Notes

RAG means retrieval-augmented generation.

In this app:

- Retrieval searches the local Naasir Travel knowledge base.
- Augmentation injects retrieved entries into the prompt.
- Generation uses Groq to write the answer.

This is RAG even without a vector database. The current retrieval is lexical: it matches words, phrases, and weighted fields.

Top-k is the number of retrieved entries kept. Bigger is not always better because irrelevant context can confuse the model.

Evidence gating decides whether retrieved entries are strong enough to use.

