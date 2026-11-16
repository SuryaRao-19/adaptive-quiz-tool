# AI Troubleshooting Guide

## 1. `timeout of 15000ms exceeded`
- **Cause in Legacy System**:
  - `client/src/services/api.js` was configured with a global Axios `timeout: 15000`.
  - `server/services/gemini/geminiClient.js` had a hardcoded `timeoutMs = 15000` in `Promise.race`.
  - When complex generations or high provider demand took 16+ seconds, requests aborted.
- **Resolution in AdaptIQ 3.0**:
  - Global Axios timeout increased to `60000ms`.
  - Conversational AI uses SSE streaming via `streamAITutorChat` (`ReadableStream`), returning the first chunk in under 1 second.
  - Backend enforces granular timeouts: 10s connection, 20s first-token, 20s idle-stream, 120s max duration.

## 2. Model 404 (`models/gemini-2.5-flash is not found`)
- **Cause**: Google deprecated certain preview checkpoints for new API keys.
- **Resolution**: Use the stable flagship `gemini-3.8-flash` (or `gemini-2.0-flash`). Configured via `GEMINI_MODEL=gemini-3.8-flash` in `server/.env`.

## 3. High Demand / HTTP 503 (`UNAVAILABLE`)
- **Cause**: Google AI servers experiencing temporary regional load.
- **Resolution**:
  - The fallback cascade automatically switches to `gemini-2.0-flash`, `gemini-1.5-flash`, or secondary configured providers (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
  - Offline pedagogical heuristics engage if all providers are unavailable.

## 4. Academic Integrity 403 (`AI Tutor is disabled during Test Mode`)
- **Cause**: The student has an active summative `post_test` attempt in progress.
- **Resolution**: Expected behavior. The student must complete and submit their official test before the tutor unlocks.

