# Guardrails

Guardrails live in `lib/chatbot/guardrails.ts`.

They prevent the chatbot from becoming a general AI assistant. Off-topic coding, politics, math, sports, malware, and prompt-injection requests are refused before Groq is called.

Prompt injection is user-controlled text trying to override instructions.
Context injection is application-controlled knowledge provided to the model.

