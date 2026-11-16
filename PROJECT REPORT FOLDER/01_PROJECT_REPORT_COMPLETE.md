# AdaptIQ — Academic Project Report
## Multi-Model Intelligent Adaptive Assessment & Socratic Tutoring System

**Project Title**: AdaptIQ: Adaptive Learning & Assessment Platform for STEM Education  
**Academic Year**: 2026  
**Curriculum Alignment**: UN Sustainable Development Goal 4 (Quality Education)  
**Primary Tech Stack**: React 18, Vite, Node.js, Express.js, PostgreSQL (Prisma), MongoDB Atlas, Google Gemini AI (`@google/genai`)  
**Automated Verification**: 117 / 117 Automated Tests Passing (100% Green)

---

## Abstract
Traditional standardized testing in resource-constrained schools operates under an antiquated "one-size-fits-all" methodology. Every student receives identical questions at fixed cadences, neglecting individual variance in prior knowledge and learning velocity. This project presents **AdaptIQ**, an equitable, psychometrically grounded educational web application combining **Bayesian Knowledge Tracing (BKT)**, **1PL Rasch Item Difficulty Calibration**, and a **Multi-Model Generative AI Gateway** with real-time **Server-Sent Events (SSE)** token streaming. 

AdaptIQ evaluates student cognitive mastery across Math and Science topics (Grade 7), micro-adapts question difficulty dynamically based on streak telemetry, reinforces long-term memory via a **Leitner 5-Box Spaced Repetition schedule**, and provides contextual Socratic explanations. The backend architecture features an authoritative dual-database structure (PostgreSQL for ACID gradebook records and MongoDB Atlas for flexible Socratic chat history) with automated circuit breakers and model fallback cascades. The platform has been verified against 117 automated unit, integration, and security assertion tests with a 100% pass rate.

---

## 1. Introduction & Problem Statement

### 1.1 Background & Motivation
In primary and secondary STEM education (particularly Grades 6–8), foundational concepts in fractions, ratios, algebraic equations, cellular structures, and kinematics form the bedrock of subsequent scientific reasoning. However, when students develop early misconceptions, standard curriculum pacing leaves them behind, generating a widening achievement gap.

### 1.2 Core Limitations in Existing EdTech Platforms
1. **Static Test Delivery**: Uniform assessments fail to diagnose the root cause of incorrect answers, diagnosing symptoms rather than cognitive misconceptions.
2. **AI Provider Latency & Fixed Timeouts**: Synchronous blocking HTTP requests to LLMs frequently exceed 15-second browser thresholds, throwing `AxiosError: timeout of 15000ms exceeded` during peak regional traffic.
3. **Academic Integrity Vulnerabilities**: Direct AI integrations often act as cheating engines, blurting out answers during live graded summative tests.
4. **Lack of Psychometric Calibration**: Teacher-assigned difficulty tags (`easy`, `medium`, `hard`) are notoriously subjective. A question tagged "easy" may fail 70% of a cohort without the system recognizing the anomaly.
5. **Digital Inequity**: Rural schools with intermittent internet access cannot run cloud-only learning systems.

### 1.3 Project Objectives
- Implement real-time cognitive state estimation via **Bayesian Knowledge Tracing (BKT)**.
- Implement empirical difficulty calibration using the **1PL Rasch Model** in Logits ($b_i$).
- Eliminate AI timeouts using an **SSE Streaming Gateway** with granular lifecycle limits.
- Build a multi-model routing engine (`AUTO` vs `MANUAL`) with an automatic fallback cascade.
- Provide 6 distinct pedagogical tutoring modes (`Explain`, `Socratic`, `Step-by-Step`, `Exam Prep`, `Debug`, `Conceptual`).
- Ensure academic integrity through an automated **TestMode Guard** locking out AI assistance during active exams.
- Support both **Cloud SaaS** and **Offline Classroom Gateway** deployments.

---

## 2. Technology Stack & Specifications

### 2.1 Frontend Architecture
- **Framework**: React 18 (`v18.3.1`) Single Page Application (SPA).
- **Build Tool**: Vite (`v5.4.21`) with Rollup minification and code splitting.
- **Styling**: Tailwind CSS (`v3.4.10`) with custom design tokens, dark/light themes, and glassmorphism.
- **Micro-interactions**: Framer Motion (`v11.3.28`) for animated chat streaming, modals, and tabs.
- **Mathematical Rendering**: KaTeX (`v0.16.11`) for LaTeX formulas (`$...$` inline, `$$...$$` display).
- **Charts & Graphs**: Recharts (`v2.12.7`) for comparative diagnostic radar charts and learning gain bars.
- **Streaming Client**: Native `fetch` with `ReadableStream` reader and `AbortController` cancellation.

### 2.2 Backend Architecture
- **Runtime**: Node.js (`v18+` / `v24` LTS) with asynchronous non-blocking I/O.
- **Framework**: Express.js (`v4.19.2`) providing RESTful endpoints and Server-Sent Events (SSE).
- **Relational ORM**: Prisma ORM (`v6.4.1`) with parameterized PostgreSQL queries and schema migrations.
- **Document Store**: Mongoose (`v8.5.1`) connecting to MongoDB Atlas for flexible conversation persistence.
- **Security Middleware**: Helmet (`v7.1.0`), `express-rate-limit` (`v7.3.1`), bcryptjs (`v2.4.3`), and JSON Web Tokens (`jsonwebtoken v9.0.2`).
- **Interoperability**: IMS QTI v2.1 XML package generator for LMS standard interoperability.
- **File Processing**: SheetJS (`xlsx v0.18.5`) for student roster ingestion and DDE-safe gradebook exports.

### 2.3 Generative AI Integration
- **SDK**: Official `@google/genai` (`v2.32.0`).
- **Primary Model**: `gemini-3.8-flash` (1M+ context window, ultra-fast latency, structured JSON schemas).
- **Fallback Models**: `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-pro`.
- **Secondary Adapters**: OpenAI (`gpt-4o-mini`, `gpt-4o`), Anthropic (`claude-3-5-haiku`), Ollama (`llama3.2`).

---

## 3. Mathematical Models & Algorithms

### 3.1 Bayesian Knowledge Tracing (BKT) Engine
**File**: `server/engine/bktEngine.js`

BKT models student skill acquisition as a two-state hidden Markov model where the skill is either learned or unlearned.
1. **Observation Update (Posterior Probability)**:
   - When the student answers **Correctly** ($obs = 1$):
     $$P(L_t \mid \text{obs}=1) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
   - When the student answers **Incorrectly** ($obs = 0$):
     $$P(L_t \mid \text{obs}=0) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$
2. **Learning Transition Update**:
   $$P(L_{t+1}) = P(L_t \mid \text{obs}) + (1 - P(L_t \mid \text{obs})) \cdot P(T)$$
   Where:
   - $P(L_0) = 0.15$ (Prior probability of initial knowledge)
   - $P(T) = 0.20$ (Transition probability / learning rate per opportunity)
   - $P(G) = 0.25$ (Guess rate for 4-option MCQs)
   - $P(S) = 0.10$ (Slip rate / careless mistake on known concepts)

### 3.2 1PL Rasch Item Difficulty Calibration Model (IRT)
**File**: `server/engine/raschEngine.js`

Under the Rasch model, the probability of a correct response depends on the difference between student ability ($\theta$) and item difficulty ($b_i$):
$$P(X_{ni} = 1 \mid \theta_n, b_i) = \frac{e^{\theta_n - b_i}}{1 + e^{\theta_n - b_i}}$$
The empirical item difficulty $b_i$ in Logits is calculated from empirical telemetry:
$$b_i = \ln\left(\frac{f_i}{p_i}\right) = \ln\left(\frac{1 - p_i}{p_i}\right)$$
- $p_i = \frac{R_i}{N_i}$ is the empirical pass rate.
- $f_i = 1 - p_i$ is the empirical failure rate.
- **Safety Threshold**: Calibration only activates when sample size $N_i \ge 30$, preventing false alarms caused by small-sample statistical noise.

### 3.3 Leitner 5-Box Spaced Repetition Schedule
**File**: `server/engine/spacedRepetition.js`

Counters the exponential decay of memory described by the Ebbinghaus forgetting curve $R = e^{-t/S}$:
- **Box 1**: 1-day interval (Daily review for newly failed or nascent skills).
- **Box 2**: 3-day interval.
- **Box 3**: 7-day interval (Weekly reinforcement).
- **Box 4**: 14-day interval (Bi-weekly mastery check).
- **Box 5**: 30-day interval (Permanent consolidated memory).
- Correct response promotes $+1$ box (capped at Box 5). Incorrect response instantly demotes to Box 1.

### 3.4 Multi-Factor Unified Adaptive Difficulty Engine
**File**: `server/engine/adaptiveEngine.js`

- Tracks answer streaks dynamically during practice:
  - **3 Consecutive Correct** $\rightarrow$ Escalates difficulty (`EASY` $\rightarrow$ `MEDIUM` $\rightarrow$ `HARD`).
  - **2 Consecutive Incorrect** $\rightarrow$ De-escalates difficulty (`HARD` $\rightarrow$ `MEDIUM` $\rightarrow$ `EASY`) to prevent cognitive overload.

### 3.5 Normalized Learning Gain (Hake's Average Gain $g$)
**File**: `server/utils/gradebookExporter.js`

$$g = \frac{\text{Post-Test} - \text{Pre-Test}}{100 - \text{Pre-Test}}$$
Evaluates the proportion of possible conceptual gain realized by the student, mitigating ceiling effects for high baseline achievers.

### 3.6 Jaccard Text Similarity Question Deduplication
**File**: `server/services/gemini/responseValidator.js`

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
Tokens are extracted, lowercased, and punctuation-stripped. Generated questions with $J(A, B) \ge 0.68$ against existing questions in the bank are rejected automatically.

---

## 4. Key Implementation Modules & Architecture

### 4.1 Master AI Gateway (`server/services/ai/gateway/`)
- **`modelRegistry.js`**: Dynamic catalog of configured models, capabilities, context limits, and live availability.
- **`intentClassifier.js`**: Deterministic zero-overhead local heuristic classifier mapping student questions to 6 categories without extra LLM latency:
  1. `SIMPLE`: Greetings, short definitions (<35 chars).
  2. `EDUCATIONAL_REASONING`: Multi-step algebra, physics derivations, stoichiometry.
  3. `PROGRAMMING`: Code fences, syntax errors, algorithm analysis.
  4. `TUTORING`: Socratic probing hints, step-by-step guidance.
  5. `CONTENT_GENERATION`: Quiz generators, practice test generators, worksheets.
  6. `LONG_CONTEXT`: Conversations $> 12$ turns or uploaded texts $> 3000$ chars.
- **`modelRouter.js`**: Resolves optimal model under `AUTO` (recommended) or `MANUAL` modes.
- **`fallbackManager.js`**: Bounded exponential retries with jitter and automated pre-stream fallback cascades.
- **`providerHealth.js`**: 3-failure circuit breaker with 30s reset cooldown and rolling latency tracking.

### 4.2 Server-Sent Events (SSE) Streaming (`server/services/ai/streaming/sseHandler.js`)
- Standardized streaming protocol (`event: chunk`, `event: metadata`, `event: done`, `event: error`).
- 15-second heartbeat pings (`: ping\n\n`) to maintain edge proxy and browser connections.
- Granular timeouts: 10s connection, 20s first-token, 20s idle-stream, 120s max duration.
- Client cancellation handling via `req.on('close')` triggering `AbortController.abort()`.

### 4.3 Socratic Tutoring Service (`server/services/ai/services/tutoringService.js`)
Offers 6 pedagogical instruction modes:
1. **Explain Mode**: Clear, structured conceptual breakdown with comprehension checks.
2. **Socratic Mode**: Never reveals final answer; guides students through probing questions.
3. **Step-by-Step Mode**: Scaffolded mathematical transformations with intermediate checks.
4. **Exam Prep Mode**: High-yield scoring criteria, common exam traps, and memory tricks.
5. **Debug Mode**: Code & logic error location without rewriting the student's solution.
6. **Conceptual Mode**: Demystifies formulas using everyday real-world analogies.

### 4.4 Conversation Memory Service (`server/services/ai/services/conversationService.js`)
- Persists conversations, messages, and summaries across PostgreSQL (Prisma), MongoDB (Mongoose), and in-memory test stores.
- Slices context into a sliding window (last 8 turns, 3,500 token budget).
- Strict user isolation preventing cross-account conversation data leakage.

---

## 5. Implementation Challenges Faced & Engineering Solutions

### Challenge 1: The 15-Second Request Timeout Failure
- **Diagnosis**: The frontend Axios client had a global `timeout: 15000` in `client/src/services/api.js`. Concurrently, the backend `geminiClient.js` had a hardcoded `timeoutMs = 15000` inside a `Promise.race()`. When complex generations or regional Google server load took 16–22 seconds, requests were terminated prematurely.
- **Solution**: Increased client Axios timeout to 60,000ms. Refactored conversational AI to real-time Server-Sent Events (SSE) streaming. Replaced the rigid 15s deadline with granular timers (10s connection, 20s first-token, 20s stream-idle, 120s max duration) and 15s heartbeats. First token now renders in **< 1000ms**.

### Challenge 2: Model Deprecation (404) & High-Demand Spikes (503)
- **Diagnosis**: `gemini-2.5-flash` returned `404 NOT_FOUND` for newly registered developer keys. High demand periods produced transient `503 UNAVAILABLE` errors.
- **Solution**: Updated default model to production flagship `gemini-3.8-flash`. Built an automated **Pre-Stream Fallback Cascade** that tries `gemini-3.8-flash` $\rightarrow$ `gemini-2.0-flash` $\rightarrow$ `gemini-1.5-flash` $\rightarrow$ secondary providers before streaming begins, ensuring zero student downtime.

### Challenge 3: Academic Dishonesty During Live Summative Exams
- **Diagnosis**: Students could open the AI Tutor in another tab and paste active Post-Test questions to receive answers.
- **Solution**: Built an **Academic Integrity Lock** in `aiGateway.js`. The server queries PostgreSQL for active `post_test` attempts created in the last 60 minutes. If an active test is detected, AI endpoints return `403 Forbidden` with a policy notice.

### Challenge 4: Student PIN Security vs Usability in Rural Schools
- **Diagnosis**: Students in grades 6–8 cannot remember 16-character complex passwords, requiring 4-digit PINs. However, 4-digit PINs have only 10,000 combinations, making them susceptible to brute-force attacks.
- **Solution**: Multi-layered defense: (1) 4-digit PINs are scoped strictly within a teacher's classroom `joinCode` / `rollNumber`; (2) 10-round salted `bcrypt` hashing; (3) 5-request/min sliding-window rate limiting with a 15-minute account lockout after 5 consecutive failed attempts.

### Challenge 5: Spreadsheet Formula Injection (CSV DDE Attacks)
- **Diagnosis**: Malicious student names or answer inputs starting with `=`, `+`, `-`, `@` could execute arbitrary shell commands when teachers opened exported gradebook CSVs in Excel.
- **Solution**: Strict sanitization in `gradebookExporter.js`: Every cell beginning with formula triggers is escaped with a prepended single quote (`'`), and roll numbers are wrapped in `="007"` formulas to preserve leading zeros.

### Challenge 6: Dual-Database Resilience
- **Diagnosis**: Local PostgreSQL containers are not always active during developer testing or CI/CD runs, causing server startup crashes.
- **Solution**: Implemented a safe Prisma proxy with a 2,000ms connection ping: If PostgreSQL is unreachable, the system automatically falls back to MongoDB Atlas or an in-memory store without dropping user requests.

---

## 6. Live Implementation Screenshots & UI Walkthrough

All 11 actual screenshots captured directly from the running application are cataloged below:

| Figure | Screen Name | Route | File Path | Key Features |
| :---: | :--- | :--- | :--- | :--- |
| **Fig 6.1** | Landing Hero | `/` | `docs/screenshots/01_landing_hero.png` | UN SDG-4 badge, dual student/teacher portals, dark mode toggle |
| **Fig 6.2** | Auth Portal | `/login` | `docs/screenshots/02_auth_portal.png` | Split-screen login, Roll Number & PIN input, role selector |
| **Fig 6.3** | Subject Select | `/select` | `docs/screenshots/03_subject_selection.png` | Math & Science subject cards, Grade 7 curriculum tags |
| **Fig 6.4** | Student Dashboard | `/dashboard` | `docs/screenshots/04_student_dashboard.png` | BKT mastery percentage, Leitner review badges, weak topic alert |
| **Fig 6.5** | Adaptive Practice | `/practice` | `docs/screenshots/05_adaptive_practice.png` | Dynamic difficulty indicators, KaTeX math equation rendering |
| **Fig 6.6** | AI Tutor Chat | `/ai-tutor` | `docs/screenshots/06_ai_tutor_chat.png` | Model selector (AUTO/Manual), 6 pedagogy modes, SSE stream |
| **Fig 6.7** | AI Learning Hub | `/ai-hub` | `docs/screenshots/07_ai_learning_hub.png` | 6 AI features (Quiz generator, Study plan, Token analytics) |
| **Fig 6.8** | Performance Analytics | `/analytics` | `docs/screenshots/08_performance_analytics.png` | Pre vs Post radar chart, Hake's Normalized Learning Gain ($g$) |
| **Fig 6.9** | Classroom Hub | `/classroom` | `docs/screenshots/09_teacher_classroom_hub.png` | Classroom roster preview, join codes, gradebook downloads |
| **Fig 6.10** | Question Bank | `/questions` | `docs/screenshots/10_question_bank_manager.png` | Filterable topics, approval workflow, Rasch difficulty calibration |
| **Fig 6.11** | Reference Library | `/library` | `docs/screenshots/11_reference_library.png` | Digital STEM formula sheets and concept diagrams |

---

## 7. Deployment & Operational Environments

### 7.1 Cloud Production Deployment (SaaS)
- **Frontend SPA**: Deployed on **Vercel** / **Netlify** with global Edge CDN caching.
- **Backend API**: Deployed on **Render** / **Railway** / **Google Cloud Run** running Node.js 18+ behind NGINX with SSE proxy buffering disabled (`X-Accel-Buffering: no`).
- **PostgreSQL Database**: Managed **Neon** / **Supabase** with automated backups and connection pooling.
- **MongoDB Database**: Managed **MongoDB Atlas** cluster with automated sharding.

### 7.2 Rural Offline Classroom Gateway (Resource-Constrained Schools)
- Low-power single-board computer (Raspberry Pi 4/5 or local classroom mini-PC) running Docker Compose.
- Runs local PostgreSQL + Node.js backend bound to the classroom Wi-Fi LAN (`LOCAL_LAN_BIND=0.0.0.0`).
- Local offline heuristic engine (`bktEngine.js`, `raschEngine.js`, `spacedRepetition.js`) evaluates scores and adapts difficulty 100% offline with zero cloud dependency.

---

## 8. Automated Testing & Quality Verification

All 117 automated test suites execute via the Node.js native test runner (`node --test`):

```bash
> adaptive-quiz-server@1.0.0 test
> node --test tests/**/*.test.js

ℹ tests 117
ℹ suites 29
ℹ pass 117
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 4312.63
```

- **Test Coverage**: Bayesian Knowledge Tracing parameters, Rasch item difficulty logits, Leitner spaced repetition intervals, Adaptive engine difficulty promotion/demotion, Model registry discovery, Heuristic intent classification, SSE streaming protocol events, Client cancellation propagation, Fallback cascade switching, Circuit breaker state transitions, User isolation guards, and Gradebook DDE formula sanitization.
- **Production Build Integrity**: Vite client build completed with exit code 0 (`vite build` succeeded in 22.2s).

---

## 9. Conclusion & Future Roadmap

AdaptIQ demonstrates that psychometrically grounded adaptive learning and Generative AI can be combined to build an equitable, resilient educational platform. By incorporating Server-Sent Events, intelligent model routing, Socratic pedagogical modes, and offline classroom fallback capabilities, the system provides individualized tutoring while preserving academic integrity.

### Future Enhancements:
1. **2PL & 3PL IRT Calibration**: Expanding the Rasch model with item discrimination ($a_i$) and pseudo-guessing ($c_i$) once response samples exceed $N \ge 1,000$.
2. **IMS QTI 3.0 Compliance**: Modernizing assessment item packaging to QTI 3.0 JSON-LD standards.
3. **Multimodal Voice Tutoring**: Real-time bidirectional voice interactions using the Gemini Live API for visually impaired students.

