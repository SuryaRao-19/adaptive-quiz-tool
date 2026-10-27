# AdaptIQ Target Architecture

## 1. System Overview
AdaptIQ is a production-grade, accessible, offline-capable adaptive learning and assessment platform for STEM education (Grades 5–10). It is engineered to satisfy UN Sustainable Development Goal 4 (Quality & Inclusive Education), functioning reliably in both resource-abundant and low-connectivity classroom environments.

```
+-------------------------------------------------------------------------+
|                              CLIENT (PWA)                               |
|  React 18 + Vite + Tailwind CSS + KaTeX Math Renderer + IndexedDB       |
|                                                                         |
|  [6-Theme Token System]  [QuizRibbon]  [STEMDiagrams]  [Service Worker]   |
|         |                      |             |               |          |
|  (IndexedDB Cache & Sync Queue) <------------+---------------+          |
+-------------------------------------------------------------------------+
                                    |
                HTTP REST / JWT Auth / Idempotent Sync
                                    |
+-------------------------------------------------------------------------+
|                           SERVER (Node / Express)                       |
|                                                                         |
|  +--------------------+   +-----------------------+   +---------------+ |
|  |   Auth & Security  |   |  Unified Adapt Engine |   | Socratic Tutor| |
|  | Roll No + 4-Dig PIN|   | - BKT (HMM Model)     |   | Gemini Flash  | |
|  | Strict Rate Limit  |   | - Leitner 5-Box Spaced|   | Active Test   | |
|  | Production Guard   |   | - Streak Calibration  |   | Lockdown      | |
|  +--------------------+   +-----------------------+   +---------------+ |
|                                   |                                     |
|  +--------------------------------------------------------------------+ |
|  |                Server-Authoritative Lifecycle & Storage            | |
|  | Mongoose Models: User, Question, QuizAttempt, Attempt, Progress    | |
|  +--------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
                                    |
                           MongoDB Database
              (Isolated Per-Cohort Tenancy & Audit Log)
```

## 2. Core Pillars

### 2.1 Server-Authoritative Integrity
- Scores, mastery calculations, and answer validations occur exclusively on the server.
- The client cannot unilaterally declare test scores or modify progress state.
- Summative assessments lock out Socratic AI assistance at both the client and server levels.

### 2.2 Explainable Adaptive Engine
- Dynamic difficulty adjustment: 3 consecutive correct answers promote difficulty, 2 consecutive incorrect answers demote difficulty.
- Bayesian Knowledge Tracing (BKT) tracks mastery probability per learner per skill using a 2-state Hidden Markov Model.
- Spaced Repetition (Leitner 5-box scheduler) tracks memory retention with intervals of 1, 3, 7, 14, and 30 days.
- Confidence-based marking distinguishes between confident mastery, lucky guesses, and dangerous misconceptions.

### 2.3 Offline-First Architecture (PWA + IndexedDB)
- Native Web App Manifest and Service Worker cache app shell and static assets.
- IndexedDB repository stores question sets, attempts, and pending submissions with UUID `eventId`s.
- Automatic background resynchronization with exponential backoff on network reconnection.
- Server-side deduplication prevents duplicate event replay.

### 2.4 Inclusive & Accessible Design (WCAG 2.2 AA)
- 6 curated high-contrast themes (Student Indigo, Student Neon, Teacher Navy, Teacher Emerald, Sunset, Cyber Midnight).
- Responsive mathematical equation rendering via KaTeX with zero-crash fallbacks.
- Fully accessible keyboard navigation, 48px touch targets, visible focus rings, and `prefers-reduced-motion` compliance.
