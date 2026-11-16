# AI Safety, Privacy, and Security Architecture

## 1. Confidential Server-Side Credentials
- API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) are stored solely in `server/.env`.
- Frontend code strictly accesses AI features through `/api/ai/*` using standard JWT bearer authorization.
- Secrets are never embedded into Vite client bundles, build artifacts, or HTML templates.

## 2. Academic Integrity Locks
- Any student with an ongoing summative post-test created within 60 minutes is locked out of AI Tutor endpoints (`isTestMode` check).
- Direct answers, letter choices (e.g. "Choose B"), or full exam answer keys are forbidden by the Socratic prompt directives.

## 3. Data Minimization
- Student names and personally identifiable records are stripped before sending prompts to external model providers.
- Conversations store messages against a randomized user ID without exposing full student profiles to external APIs.

## 4. Rate Limiting and Quotas
- Sliding-window rate limiter prevents automated abuse.
- Daily token quotas ensure budget predictability.
- Request payloads are capped at 1,500 characters to prevent prompt injection and payload flooding.

## 5. Non-Executable AI Output
- AI output is treated as untrusted text/markdown.
- Models never execute database queries, shell commands, or modify student grades directly. All score calculations remain deterministic on the server.

