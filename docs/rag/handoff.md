# Handoff

Handoff is used when a user asks for a person, evidence is weak, or the topic requires staff.

Current handoff options:

- WhatsApp link from `SUPPORT_WHATSAPP_NUMBER`
- Mongo-backed support request via `/api/support-tickets`

The model does not create tickets. The user submits a form, and the server controls status, priority, and source.

