# Current State Architecture Audit (Phase 0)

## 1. System Overview
AdaptIQ is a full-stack educational web application designed for resource-constrained schools (aligned with UN SDG 4). It comprises:
- **Client (Frontend):** React 18 SPA built with Vite 5.3, Tailwind CSS 3.4, Framer Motion 13.4, Recharts 3.10, Lucide icons, Canvas-Confetti, and Axios.
- **Server (Backend):** Node.js v24 + Express 4.19, Mongoose 8.5, Helmet, CORS, Express-Rate-Limit, JWT, Bcryptjs.
- **Database:** MongoDB (Atlas/Local) with an automatic fallback to `mongodb-memory-server` in development.

## 2. Component and Route Mapping
| Route | Frontend Component | Primary Endpoints Invoked | Controller / Engine |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Static / Public Showcase | N/A |
| `/login`, `/register` | `AuthScreen.jsx` | `POST /api/auth/login`, `POST /api/auth/register` | `authController.js` |
| `/dashboard` | `StudentDashboard.jsx` / `TeacherDashboard.jsx` | `GET /api/progress/me`, `GET /api/attempts/analytics` | `progressController.js`, `attemptController.js` |
| `/select` | `SubjectSelection.jsx` | `GET /api/quiz/topics` | `quizController.js` |
| `/pre-test` | `QuizInterface.jsx` | `GET /api/quiz/pre-test`, `POST /api/quiz/submit` | `quizController.js` |
| `/results` | `DiagnosticResults.jsx` | `GET /api/progress/me` | `progressController.js` |
| `/practice` | `PracticeMode.jsx` / `PracticeQuiz.jsx` | `GET /api/quiz/practice-question`, `POST /api/attempts` | `quizController.js`, `attemptController.js` |
| `/test` | `TestMode.jsx` | `GET /api/quiz/post-test`, `POST /api/quiz/submit` | `quizController.js` |
| `/report`, `/metrics` | `AnalyticsHub.jsx` / `PostTestReport.jsx` | `GET /api/progress/comparison-report` | `progressController.js` |
| `/tutor` | `AITutorChat.jsx` / Floating Drawer | `POST /api/chat`, `GET /api/chat/history` | `chatController.js` |
| `/classes` | `ClassroomHub.jsx` | `GET /api/classes`, `POST /api/classes` | `classController.js` |
| `/question-bank` | `QuestionBankManager.jsx` | `GET /api/questions`, `POST /api/questions/generate` | `questionController.js` |
| `/solutions` | `SolutionsHub.jsx` | `GET /api/questions` | `questionController.js` |
| `/library` | `ReferenceLibrary.jsx` | `GET /api/library` | `libraryController.js` |
| `/settings` | `Settings.jsx` | User preferences & local storage | `authController.js` |
| `/styleguide` | `StyleGuide.jsx` | Component showcase | N/A |

## 3. Key Findings & Baseline Deficiencies
1. **Silent In-Memory DB Fallback in Production:** In `server/config/db.js`, if external MongoDB fails to connect, it falls back to `MongoMemoryServer` unconditionally. In a production environment (`NODE_ENV === 'production'`), this leads to silent data loss on server restart.
2. **Client-Controlled Difficulty Streak:** In `quizController.js:getPracticeQuestion`, `recentHistory` was passed as a query string parameter by the client instead of being server-authoritative from `Attempt` logs.
3. **Assessment Integrity (AI Tutor Leak):** In `chatController.js`, `isTestMode` was checked from the client body (`req.body.isTestMode`). An adversarial student could omit `isTestMode: true` and query the AI tutor during summative tests. The server must check active test attempts directly.
4. **Offline Capability & PWA:** No service worker or IndexedDB caching was implemented. Offline attempts could not be saved or synchronized.
5. **STEM Rendering:** Mathematical expressions were rendered as plain text strings without KaTeX LaTeX typesetting.
6. **Adaptive Intelligence:** Only simple streak-based counters existed; no Bayesian Knowledge Tracing (BKT) or Spaced Repetition (Leitner) was present.
7. **Automated Testing:** No test script was configured in `server/package.json`.
