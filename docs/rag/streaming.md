# Streaming

The chatbot uses newline-delimited JSON streaming.

Server events:

- `text`: incremental assistant text
- `metadata`: sources, evidence, and handoff actions
- `error`: stream failure
- `done`: stream finished

This lets the UI stream text while still receiving final citations and handoff metadata.

