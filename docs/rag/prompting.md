# Prompting

Stable business rules live in `lib/chatbot/prompt.ts`.

Retrieved knowledge is added underneath the policy prompt as application-controlled context.
Retrieved context is allowed to answer Naasir Travel-specific questions, but it cannot override business rules.

The prompt is built from:

- chatbot business policy
- retrieved local knowledge, when evidence is sufficient
- bounded recent history
- current user question

