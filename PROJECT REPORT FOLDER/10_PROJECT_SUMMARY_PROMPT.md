# 📋 AdaptIQ — Master Project Summary (For AI Prompts & LLM Context)

> **Use Case**: Copy and paste the prompt blocks below into any AI agent, ChatGPT, Claude, Gemini, or developer LLM to immediately provide complete, high-fidelity context about the AdaptIQ platform.

---

## ⚡ 1. The Master Prompt (Full Context Injection)
*Copy and paste the entire block below into an AI model when starting a new session or asking for extensions, viva defense prep, or code generation.*

```markdown
You are an expert AI engineering assistant working on **AdaptIQ** (Adaptive Learning & AI Tutoring Platform).

### 1. PROJECT OVERVIEW
- **Name**: AdaptIQ — Intelligent Adaptive Learning & Multi-Model Socratic AI Tutoring System
- **Mission**: Aligned with UN SDG-4 (Quality & Equitable Education), delivering psychometrically calibrated STEM education (Grade 7 Mathematics & Science) for both online classrooms and offline rural schools.
- **Core Paradigm**: Bridges cognitive psychometrics (Bayesian Knowledge Tracing, 1PL Rasch IRT, Leitner Spaced Repetition) with generative AI (Google Gemini 2.0 Flash, Gemini 3.8 Flash, OpenAI GPT-4o, Anthropic Claude 3.5, local Ollama).

### 2. ARCHITECTURE & TECH STACK
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, KaTeX (math rendering), Axios + native EventSource (SSE).
- **Backend API**: Node.js, Express, Server-Sent Events (SSE) streaming with granular timeouts & keepalive heartbeats.
- **Databases (Dual-Engine)**:
  - **PostgreSQL (via Prisma ORM)**: Relational integrity for Users, Classrooms, Question Bank, Attempts, and Audit Logs.
  - **MongoDB Atlas**: High-volume diagnostic events, chat history, and telemetry.
- **AI Gateway 3.0**: Provider-agnostic gateway (`aiGateway.js`) with Model Router, Heuristic Intent Classifier, 3-state Circuit Breaker (`CLOSED`, `OPEN`, `HALF_OPEN`), and automatic fallback cascades.
- **Testing**: Node.js native test runner (`node --test`), 117 tests across 29 suites (100% Green).

### 3. CORE ALGORITHMS & MATHEMATICAL MODELS
1. **Bayesian Knowledge Tracing (BKT)**:
   - 2-state Hidden Markov Model tracking mastery probability $P(L_t)$.
   - Observation: $P(L_t \mid obs=1) = \frac{P(L_t)(1-S)}{P(L_t)(1-S) + (1-P(L_t))G}$
   - Transition: $P(L_{t+1}) = P(L_t \mid obs) + (1 - P(L_t \mid obs)) \cdot T$
   - Calibrated Params: $P(L_0)=0.20, P(T)=0.15, P(G)=0.25, P(S)=0.10$.
2. **1PL Rasch Item Difficulty Calibration (IRT)**:
   - Logit difficulty: $b_i = \ln(f_i^* / p_i^*)$ with extreme score continuity smoothing $p_i^* = (C_i + 0.5) / (N_i + 1)$.
   - Anomaly detection flags items misaligned with editorial difficulty tiers.
3. **Multi-Factor Adaptive Stepping**:
   - Dynamic promotion after 3 consecutive correct answers ($d_{i+1} = \min(4, d_i + 1)$).
   - Demotion after 2 consecutive incorrect answers ($d_{i+1} = \max(1, d_i - 1)$).
4. **Leitner 5-Box Spaced Repetition**:
   - Memory consolidation over Fibonacci intervals ($1, 3, 7, 14, 30$ days).
   - Correct answers promote to next box; errors reset immediately to Box 1.
5. **Hake's Normalized Learning Gain ($g$)**:
   - $g = (\text{Post} - \text{Pre}) / (100 - \text{Pre})$ measuring conceptual breakthrough independent of pre-test baselines.
6. **Heuristic Zero-Overhead Intent Classifier**:
   - Deterministic regex classification in $< 0.05\text{ms}$ (zero LLM latency/cost).

### 4. KEY FEATURES IMPLEMENTED
- **Student Portal**: Roll number & 4-digit PIN authentication, interactive BKT dashboard, adaptive practice with KaTeX formulas, Leitner flashcard review, and comparative radar analytics.
- **Socratic AI Tutor 3.0**: Real-time SSE streaming, model selector (AUTO/Manual), and 6 pedagogical modes:
  1. `socratic`: Never reveals answers; scaffolds understanding with guided questions.
  2. `explain`: Step-by-step conceptual breakdowns with real-world analogies.
  3. `hint`: Progressive hints without spoiling solutions.
  4. `analogy`: Intuitive physical models for abstract concepts.
  5. `practice`: Generates follow-up targeted drills.
  6. `challenge`: Pushes advanced learners with higher-order problems.
- **AI Learning Hub**: 6 generative tools: Quiz Generator, Answer Explainer, Practice Test Generator, Study Planner, Misconception Diagnosis, and live Token Telemetry.
- **Teacher Classroom Hub**: Classroom creation, 6-character join codes, student roster imports (CSV/XLSX), printable desk cards, and DDE-safe gradebook downloads.
- **Question Bank Manager**: Filterable question repository with status workflows and empirical Rasch logit telemetry.
- **Rural Offline Gateway**: Dockerized deployment on local Wi-Fi LAN with offline event idempotency reconciliation.

### 5. PRODUCTION HARDENING & CHALLENGES SOLVED
- **15-Second Timeout Resolution**: Replaced synchronous monolithic HTTP calls with SSE chunked streaming, granular sub-timeouts (connection: 10s, first-token: 20s, idle: 20s, max: 120s), and 15s keepalive pings (`: ping\n\n`).
- **Gemini 503 Server Overload**: Built a 3-failure circuit breaker with a 30s cooldown that cascades from `gemini-2.0-flash` to `gemini-3.8-flash`.
- **Student PIN Brute Force**: Dual-tier rate limiting (global IP + roll number lockouts) and salt-hashed constant-time comparisons.
- **Exam Integrity**: State machine automatically disables Socratic AI during active summative exams.
- **CSV DDE Injection**: Sanitized all fields starting with `=`, `+`, `-`, `@` with a single-quote prefix.
```

---

## 🎯 2. Short Prompt (For Quick Viva / Interview / Pitching)
*Use this concise version when you need a 60-second summary for viva presentations or project descriptions.*

```markdown
AdaptIQ is a full-stack, AI-powered adaptive learning and intelligent tutoring platform built for middle-school STEM education (aligned with UN SDG-4: Quality Education). 

Unlike conventional quiz tools that deliver one-size-fits-all testing, AdaptIQ combines psychometric evaluation engines—specifically Bayesian Knowledge Tracing (BKT) to track skill mastery, 1PL Rasch Item Response Theory (IRT) to calibrate question difficulty, and a Leitner 5-Box Spaced Repetition engine for long-term memory retention—with a production-grade generative AI Gateway.

The system features:
1. Real-time Socratic AI Tutoring with Server-Sent Events (SSE) streaming (<650ms first-token latency), eliminating traditional 15-second HTTP timeout bottlenecks.
2. A Multi-Model AI Gateway supporting Google Gemini 2.0/3.8 Flash, OpenAI GPT-4o, and local offline Ollama with automatic 3-state circuit breaker failovers.
3. Dual-database persistence (PostgreSQL via Prisma ORM for transactional consistency, MongoDB for high-volume telemetry).
4. Teacher Classroom Management with student PIN authentication, CSV/XLSX roster imports, printable desk cards, and formula-injection-safe gradebook exports.
5. Strict automated testing with 117 tests passing (100% green).
```

---

## 💻 3. System Prompt for Continuing Code Development
*Use this prompt when instructing an AI agent to write new features or bug fixes for the AdaptIQ codebase.*

```markdown
You are a senior full-stack engineer extending the AdaptIQ codebase (`adaptive-quiz-tool`).

When writing code:
1. Preserve existing conventions: CommonJS on the backend (`server/`), ES Modules on the frontend (`client/src/`).
2. Adhere to the multi-model AI Gateway located in `server/services/ai/`. All generative AI calls must route through `aiGateway.js`. Never call Gemini or OpenAI directly from frontend React code.
3. For streaming responses, always use `SSEStreamSession` (`server/services/ai/streaming/sseHandler.js`) with proper client abortion detection (`req.on('close')`).
4. Ensure pedagogical integrity: the Socratic tutor must NEVER reveal final answers.
5. Sanitize all CSV exports with `sanitizeCsvValue` (`server/utils/gradebookExporter.js`) against spreadsheet DDE formula injection.
6. Verify changes by running `npm test --prefix server` and ensuring all 117 tests remain 100% green.
```
