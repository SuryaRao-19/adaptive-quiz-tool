# AdaptIQ AI Tutor 3.0 — System Architecture

## Overview
AdaptIQ AI Tutor 3.0 is a production-grade, multi-model educational intelligence gateway. It replaces legacy single-model blocking HTTP requests with real-time token streaming, multi-provider resiliency, local heuristic intent routing, persistent conversation memory, and Socratic pedagogical modes.

```
React (Vite) Frontend
    │  (Server-Sent Events streaming with AbortController)
    ▼
AdaptIQ AI Gateway (/api/ai/chat/stream, /api/ai/generate-*)
    │
    ├─► Academic Integrity Guard (TestMode lock)
    ├─► Zero-Overhead Heuristic Intent Classifier (SIMPLE, REASONING, CODING, TUTORING, etc.)
    ├─► Intelligent Model Router (AUTO vs MANUAL)
    ├─► Circuit Breaker & Fallback Manager (Trips on 3 failures, 30s reset cooldown)
    ├─► Socratic Pedagogical Instruction Engine (6 Modes)
    └─► Hybrid Conversation Memory (Prisma PostgreSQL -> Mongoose MongoDB -> In-Memory)
         │
         ├── Google Gemini Provider (@google/genai SDK) [Primary]
         ├── OpenAI Provider (fetch SSE) [Secondary]
         ├── Anthropic Provider (fetch SSE) [Secondary]
         └── Ollama Provider (fetch NDJSON) [Local On-Prem]
```

## Key Architectural Principles

### 1. Dedicated AI Gateway
- Direct client-to-LLM requests are strictly forbidden; all interactions flow through the authenticated AdaptIQ server.
- API keys reside solely in server environment variables.
- Models and endpoints are governed by sliding-window rate limiting and daily usage quotas.

### 2. Granular Non-Blocking Lifecycle
The prior rigid 15-second request deadline was replaced with granular lifecycle limits:
- **Connection Timeout**: 10,000ms
- **First-Token Timeout**: 20,000ms
- **Idle-Stream Timeout**: 20,000ms
- **Max Generation Duration**: 120,000ms
- **Heartbeat Pings**: `: ping\n\n` emitted every 15s to maintain edge reverse proxy connections.

### 3. Bidirectional Cancellation Propagation
When a student clicks "Stop Generating" or navigates away from the page, the frontend AbortController terminates the HTTP stream. The backend listens on `req.on('close')`, immediately triggers its internal `AbortController.abort()`, halts the provider stream, and prevents wasted token generation.

