# 📊 AdaptIQ — Presentation Slide Deck (PPT Ready)
## 14-Slide Master Deck with Visuals, Speaker Notes & Viva Q&A

Use this document to prepare your PowerPoint (`.pptx`) or Google Slides presentation. Each slide includes the slide title, structured bullet points, recommended visuals/screenshots, and exact talking points for the speaker.

---

### Slide 1: Title Slide
- **Title**: **AdaptIQ: Multi-Model Intelligent Adaptive Assessment & Socratic Tutoring System**
- **Subtitle**: Psychometrically Grounded Adaptive Learning Aligned with UN SDG 4
- **Presented by**: [Your Name / Team Members]
- **Academic Program**: Semester III / 2026
- **Recommended Visual**: AdaptIQ Logo + UN SDG-4 (Quality Education) Badge.
- **Speaker Notes**:
  > *"Good morning respected faculty and evaluation committee. Today we present AdaptIQ, an intelligent adaptive assessment and Socratic tutoring system designed to bring individualized, psychometrically calibrated learning to students across Math and Science."*

---

### Slide 2: Motivation & Problem Statement
- **Title**: The Problem: Fixed Testing & EdTech Bottlenecks
- **Bullet Points**:
  - **One-Size-Fits-All Testing**: Traditional standardized exams give identical questions to all students, failing to diagnose underlying cognitive misconceptions.
  - **The "Wall of Text" AI Problem**: Generic AI tutors dump long, direct answers instead of fostering critical thinking and problem-solving.
  - **The 15-Second Timeout Trap**: Unary blocking HTTP requests to LLMs regularly fail with `timeout of 15000ms exceeded` during high network traffic.
  - **Academic Integrity Risks**: Unguarded AI tools act as cheating engines during live examinations.
  - **Digital Exclusivity**: High-bandwidth cloud platforms completely fail in rural schools without continuous internet.
- **Recommended Visual**: Split graphic: Static uniform exam paper vs. student confusion.
- **Speaker Notes**:
  > *"Traditional classrooms face a major dilemma. If a test is too easy, advanced students get bored; if it's too hard, struggling students experience test anxiety. Furthermore, when schools attempt to integrate AI, they face constant 15-second timeout crashes and students using AI to cheat during exams."*

---

### Slide 3: Project Objectives & Core Innovations
- **Title**: AdaptIQ Solution Architecture
- **Bullet Points**:
  - **Real-Time Cognitive Tracking**: Bayesian Knowledge Tracing (BKT) updates topic mastery after every single response.
  - **Psychometric Calibration**: 1PL Rasch Model calibrates question difficulty in Logits ($b_i$) using empirical cohort telemetry.
  - **AI Tutor 3.0 Gateway**: Server-Sent Events (SSE) streaming delivers token-by-token responses with first tokens in **< 1000ms**.
  - **Intelligent Multi-Model Routing**: Local zero-overhead intent classifier automatically routes questions to the best model (`AUTO` vs `MANUAL`).
  - **6 Socratic Pedagogy Modes**: `Explain`, `Socratic`, `Step-by-Step`, `Exam Prep`, `Debug Code`, and `Conceptual/Intuition`.
  - **Dual-Database Resilience**: Authoritative PostgreSQL for ACID gradebooks + MongoDB Atlas for chat history + Rural Offline Gateway support.
- **Recommended Visual**: Architecture block diagram showing Client &rarr; AI Gateway &rarr; Multi-Model Providers &rarr; Dual Database.

---

### Slide 4: Technology Stack
- **Title**: Comprehensive Full-Stack Technology Stack
- **Bullet Points**:
  - **Frontend SPA**: React 18, Vite 5, Tailwind CSS, Framer Motion.
  - **Mathematical Typesetting**: KaTeX (resilient LaTeX formula rendering for algebra & physics).
  - **Backend API**: Node.js, Express.js (REST + Server-Sent Events SSE).
  - **Authoritative Database**: PostgreSQL 16 managed via Prisma ORM 6.4.1.
  - **Document & Fallback Store**: MongoDB Atlas via Mongoose 8.5.1.
  - **Generative AI Core**: Google GenAI SDK (`@google/genai` v2.32.0) with Gemini 3.8 Flash & Gemini 2.0 Flash.
  - **Multi-Model Adapters**: OpenAI (`gpt-4o-mini`), Anthropic (`claude-3-5-haiku`), Ollama (`llama3.2`).
  - **Security**: JWT authentication, 10-round bcrypt PIN hashing, Helmet headers, sliding-window rate limiters.
- **Recommended Visual**: Clean grid with official technology logos.

---

### Slide 5: Psychometric Algorithms — Bayesian Knowledge Tracing (BKT)
- **Title**: Cognitive Mastery Modeling (BKT Engine)
- **Bullet Points**:
  - Tracks hidden cognitive mastery state $L_t \in \{0, 1\}$ over sequence of practice questions.
  - **Correct Response Formula**:
    $$P(L_t \mid \text{obs}=1) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
  - **Skill Transition**: $P(L_{t+1}) = P(L_t \mid \text{obs}) + (1 - P(L_t \mid \text{obs})) \cdot P(T)$
  - Parameters: $P(L_0) = 0.15$ (Prior), $P(T) = 0.20$ (Learning rate), $P(G) = 0.25$ (Guess rate), $P(S) = 0.10$ (Slip rate).
  - Guarantees cognitive mastery estimation without trusting raw scores alone.
- **Recommended Visual**: BKT mastery probability curve over 10 practice trials.

---

### Slide 6: Psychometric Algorithms — Rasch 1PL & Spaced Repetition
- **Title**: Item Difficulty Calibration & Long-Term Memory
- **Bullet Points**:
  - **1PL Rasch Model**: Calibrates empirical question difficulty in Logits ($b_i$):
    $$b_i = \ln\left(\frac{1 - p_i}{p_i}\right)$$
    Where $p_i = R_i / N_i$ (empirical pass rate). Activates only when sample size $N \ge 30$.
  - **Leitner 5-Box Spaced Repetition**: Combats the Ebbinghaus forgetting curve.
    - Box 1: 1 Day &bull; Box 2: 3 Days &bull; Box 3: 7 Days &bull; Box 4: 14 Days &bull; Box 5: 30 Days.
    - Correct answer promotes $+1$ Box; mistake demotes directly to Box 1.
  - **Hake's Normalized Learning Gain**:
    $$g = \frac{\text{Post-Test} - \text{Pre-Test}}{100 - \text{Pre-Test}}$$
- **Recommended Visual**: Leitner 5-box workflow graphic.

---

### Slide 7: AI Tutor 3.0 & Multi-Model Gateway
- **Title**: Real-Time Socratic AI Tutoring Engine
- **Bullet Points**:
  - **Eliminating the 15-Second Timeout**: Replaced monolithic request deadlines with SSE streaming + 15s heartbeats. First token streams in under 1 second.
  - **Deterministic Intent Classifier**: Zero-overhead local heuristic routes requests into 6 categories (`SIMPLE`, `REASONING`, `PROGRAMMING`, `TUTORING`, `CONTENT_GEN`, `LONG_CONTEXT`).
  - **Provider Circuit Breaker**: Trips to `OPEN` after 3 consecutive failures; transitions to `HALF_OPEN` after 30s cooldown.
  - **Pre-Stream Fallback Cascade**: If the primary model encounters a 503 error, the gateway automatically cascades to fallback models before streaming begins.
  - **Academic Integrity Guard**: Automatically locks AI assistance during active summative exams.
- **Recommended Visual**: Multi-model routing flowchart.

---

### Slide 8: Student Experience Walkthrough
- **Title**: Student Workflow & Adaptive Practice
- **Bullet Points**:
  - **Frictionless Sign-In**: 4-Digit PIN & Roll Number login designed for middle school students.
  - **Diagnostic Pre-Test**: 15-question baseline quiz automatically identifies weak topics ($<60\%$).
  - **Dynamic Practice Interface**:
    - Real-time difficulty indicators (`EASY`, `MEDIUM`, `HARD`).
    - KaTeX mathematical formula rendering.
    - Instant step-by-step feedback on errors with confidence-based marking.
- **Recommended Visual**: Screenshots `04_student_dashboard.png` and `05_adaptive_practice.png`.

---

### Slide 9: AI Tutor 3.0 Interface & Socratic Pedagogy
- **Title**: AI Tutor 3.0 Socratic Chat Experience
- **Bullet Points**:
  - **Model Selector**: Allows toggling between `AUTO (Recommended)` and manual models (`gemini-3.8-flash`, `gpt-4o-mini`, `claude-3-5-haiku`).
  - **Pedagogy Selector Tabs**: Students can switch between `Explain`, `Socratic`, `Step-by-Step`, `Exam Prep`, `Debug`, and `Conceptual`.
  - **Interactive Controls**: Real-time token streaming, stop generation button, copy response, and KaTeX math rendering.
  - **Response Metadata Badge**: Displays actual provider, model used, and response generation time in milliseconds.
- **Recommended Visual**: Screenshot `06_ai_tutor_chat.png`.

---

### Slide 10: Teacher Experience & AI Learning Hub
- **Title**: Teacher Hub & Automated Content Generation
- **Bullet Points**:
  - **Classroom Management**: Roster uploads with intra-batch duplicate detection and student credential desk cards.
  - **AI Learning Hub**:
    - AI Quiz Generator with strict schema validation.
    - Teacher approval gate: Questions cannot enter official examinations without teacher sign-off.
    - Live AI token and cost analytics.
  - **Secure Gradebook Export**: DDE-safe XLSX and CSV downloads with Hake's normalized gains.
- **Recommended Visual**: Screenshots `07_ai_learning_hub.png` and `09_teacher_classroom_hub.png`.

---

### Slide 11: Implementation Challenges & Engineering Solutions
- **Title**: Key Engineering Challenges Resolved
- **Bullet Points**:
  - **Challenge 1: Fixed 15s Timeout** &rarr; Solved via SSE streaming, 15s heartbeat pings, and granular timers.
  - **Challenge 2: Gemini 404 & 503 Spikes** &rarr; Solved via multi-model fallback cascade (`gemini-3.8-flash` &rarr; `2.0-flash` &rarr; secondary providers).
  - **Challenge 3: AI Cheating During Exams** &rarr; Solved via server-authoritative TestMode lock.
  - **Challenge 4: Low-Entropy PIN Brute-Force** &rarr; Solved via classroom-scoped PINs, bcrypt, and 5-attempt lockout.
  - **Challenge 5: CSV DDE Formula Injection** &rarr; Solved via prepending `'` and wrapping roll numbers in `="007"`.
- **Recommended Visual**: Before & After comparison table.

---

### Slide 12: Deployment Models: Cloud vs Rural Offline Gateway
- **Title**: Inclusive Deployment Architecture
- **Bullet Points**:
  - **Cloud Production (SaaS)**:
    - Vercel/Netlify Edge CDN for static frontend.
    - Express API on Cloud Run / Render behind NGINX with SSE proxy buffering disabled.
    - Managed PostgreSQL (Neon/Supabase) and MongoDB Atlas.
  - **Rural Offline Classroom Gateway**:
    - Low-cost single-board computer (Raspberry Pi 4/5 or local school mini-PC).
    - Local Docker Compose stack running PostgreSQL + Node API on the classroom Wi-Fi LAN (`0.0.0.0`).
    - Works 100% offline with zero cloud dependency using local heuristic engines.
- **Recommended Visual**: Dual deployment diagram (Cloud SaaS vs Offline Raspberry Pi appliance).

---

### Slide 13: Testing, Verification & Quality Telemetry
- **Title**: Automated Verification & Performance Metrics
- **Bullet Points**:
  - **117 / 117 Automated Tests Passing (100% Green)** across 29 test suites.
  - **Execution Time**: Entire test suite executes in **4.31 seconds**.
  - **Tested Modules**: BKT engine, Rasch calibration, Leitner schedule, Adaptive streak transitions, SSE streaming protocol, Client cancellation, Fallback cascade, Circuit breaker, and CSV sanitization.
  - **Production Build Integrity**: Vite production build succeeded with exit code 0 (`vite build` completed in 22.2s).
- **Recommended Visual**: Terminal execution log showing 117 pass / 0 fail.

---

### Slide 14: Conclusion & Future Scope
- **Title**: Conclusion & Future Roadmap
- **Bullet Points**:
  - **Conclusion**: AdaptIQ proves that psychometric rigor and modern Generative AI can be unified into an equitable, high-velocity learning tool.
  - **Future Roadmap**:
    1. **2PL & 3PL IRT Calibration**: Incorporating item discrimination ($a_i$) and guessing ($c_i$) as sample sizes reach $N \ge 1,000$.
    2. **IMS QTI 3.0 Specification**: Modernizing assessment packaging to QTI 3.0 JSON-LD standards.
    3. **Multimodal Voice Tutoring**: Integrating Gemini Live API bidirectional WebSocket streaming for voice-based tutoring.
- **Recommended Visual**: Concluding thank you slide with repository links and Q&A invite.

---

## 🎯 Viva Defense / Frequently Asked Faculty Questions & Answers

#### Q1: "Why not just use ChatGPT or Gemini directly instead of building this?"
> **Answer**: *"Direct LLM chats have no concept of curriculum context, no student mastery tracking, no academic integrity guards, and no offline capabilities. AdaptIQ combines Bayesian Knowledge Tracing to track what students actually know, empirical Rasch item difficulty calibration, and a multi-model gateway with streaming that prevents cheating during tests."*

#### Q2: "How does the system ensure the student isn't using AI to cheat during exams?"
> **Answer**: *"We implemented a server-authoritative Academic Integrity Lock in `aiGateway.js`. Whenever a request hits the AI endpoints, the server checks PostgreSQL for an active summative `post_test` attempt in the last 60 minutes. If active, the AI Tutor is locked with an HTTP 403 response until the exam is submitted."*

#### Q3: "What happens if Google's Gemini API goes down or hits rate limits?"
> **Answer**: *"Our Fallback Manager implements a 3-failure circuit breaker and pre-stream fallback cascade. If Gemini returns 503 or 429 before streaming begins, it automatically cascades to secondary models (like `gemini-2.0-flash`, `gpt-4o-mini`, or local Ollama) without student interruption."*

#### Q4: "Why use both PostgreSQL and MongoDB?"
> **Answer**: *"PostgreSQL (via Prisma) handles authoritative, structured student gradebooks, classroom rosters, and assessment attempts with ACID guarantees. MongoDB Atlas provides flexible document storage for unstructured Socratic chat messages. Furthermore, if PostgreSQL is offline in a local test setup, our hybrid proxy falls back safely without crashing."*

