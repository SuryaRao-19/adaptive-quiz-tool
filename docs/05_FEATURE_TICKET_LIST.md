# Document 5: Feature Ticket List (AI Implementation Prompts)

This document breaks down the platform into 8 actionable, self-contained development tickets. Each ticket can be copied directly into an AI coding agent or assigned to a software engineer.

---

### Ticket TKT-001: Project Scaffolding & MERN Environment Setup
- **Feature Name:** Monorepo Initialization & Base Config
- **Task Description:** Create full directory structure for `client/` (React + Vite + Tailwind) and `server/` (Node.js + Express + Mongoose).
- **Acceptance Criteria:**
  1. Express server boots on `PORT=5000` and connects cleanly to MongoDB.
  2. Vite React client boots on `http://localhost:5173`.
  3. Healthcheck endpoint `GET /api/health` returns `{ status: 'OK' }`.
- **Dependencies:** None
- **Priority:** Must-Have

---

### Ticket TKT-002: Student Authentication & Role-Based Access Control
- **Feature Name:** Roll Number & PIN Authentication
- **Task Description:** Build User model, registration, login, and JWT middleware using Bcrypt hashed 4-digit PINs.
- **Acceptance Criteria:**
  1. Registration succeeds with `rollNumber`, `fullName`, `grade`, and `password`.
  2. PIN is hashed with bcrypt (cost factor 10) in MongoDB.
  3. Login returns signed JWT. Protected endpoints reject missing/invalid tokens with 401.
- **Dependencies:** TKT-001
- **Priority:** Must-Have

---

### Ticket TKT-003: Question Bank Schema & Database Seeder
- **Feature Name:** Curriculum Question Repository
- **Task Description:** Create Question model with compound indexes, and write a seeder script with 30+ Math and Science questions covering Easy, Medium, and Hard tiers.
- **Acceptance Criteria:**
  1. `Question` schema validates 4 options, correctAnswerIndex (0-3), and plain-text explanation.
  2. Seeder script (`node server/scripts/seedQuestions.js`) cleanly populates MongoDB with Math and Science questions.
- **Dependencies:** TKT-001
- **Priority:** Must-Have

---

### Ticket TKT-004: Diagnostic Pre-Test Engine & Baseline Calculation
- **Feature Name:** Diagnostic Assessment
- **Task Description:** Build endpoints and client UI to serve 15 baseline questions across topics and calculate initial accuracy and weak-area flags (<60% marked `needs_focus`).
- **Acceptance Criteria:**
  1. `GET /api/quiz/pre-test?subject=Math` returns 15 questions without leaking correct answers.
  2. Submitting answers grades them on the backend, logs `QuizAttempt`, and updates `ProgressTracking`.
  3. Prevents retaking the pre-test once completed.
- **Dependencies:** TKT-002, TKT-003
- **Priority:** Must-Have

---

### Ticket TKT-005: Core Adaptive Engine & Practice Mode Interface
- **Feature Name:** Real-Time Adaptive Practice Loop
- **Task Description:** Implement the difficulty adjustment engine (3 correct in a row = escalate, 2 wrong in a row = de-escalate) with immediate feedback modals showing step-by-step explanations.
- **Acceptance Criteria:**
  1. Engine dynamically selects the next question based on answer history.
  2. Submitting an answer instantly displays the feedback card with explanation.
  3. Sessions run in 10-question batches and save updated mastery on completion.
- **Dependencies:** TKT-003, TKT-004
- **Priority:** Must-Have

---

### Ticket TKT-006: Student Mastery Dashboard
- **Feature Name:** Topic Mastery Dashboard
- **Task Description:** Build the student-facing dashboard showing topic accuracy, status badges (`Needs Focus`, `In Progress`, `Mastered`), and quick-start practice buttons.
- **Acceptance Criteria:**
  1. Visual display of all curriculum topics with accuracy progress bars.
  2. Prominent "Recommended Practice" section for topics flagged `needs_focus`.
  3. Post-Test button unlocked once $\ge 50$ practice questions are logged.
- **Dependencies:** TKT-004, TKT-005
- **Priority:** Must-Have

---

### Ticket TKT-007: Post-Test Assessment & Pre/Post Comparison Delta Report
- **Feature Name:** Summative Evaluation & Learning Gain Report
- **Task Description:** Build the Post-Test quiz and the side-by-side comparison report calculating overall score improvement and topic-level percentage gains.
- **Acceptance Criteria:**
  1. Post-test verifies $\ge 50$ completed practice questions before launching.
  2. Comparison report calculates `postTestScore - preTestScore` and topic deltas.
  3. Report includes a clean, print-friendly layout for parent/teacher reviews.
- **Dependencies:** TKT-005, TKT-006
- **Priority:** Must-Have

---

### Ticket TKT-008: Low-Bandwidth Optimizations, Failsafes & Polish
- **Feature Name:** Robustness & Edge-Case Protection
- **Task Description:** Implement local caching of quiz progress, rate limiting, and defensive fallback if question difficulty buckets run out of items.
- **Acceptance Criteria:**
  1. Browser refresh during a quiz restores student's progress from `localStorage`.
  2. Submit button disables instantly to prevent duplicate submissions.
  3. Question queries gracefully fall back to adjacent difficulties if exact matches are exhausted.
- **Dependencies:** TKT-001 through TKT-007
- **Priority:** Should-Have
