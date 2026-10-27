# AdaptIQ API Contracts & Schemas

## 1. Authentication Endpoints
- `POST /api/auth/register`
  - Body: `{ name, email|username|rollNumber, password, role, gradeLevel, avatar, themePreference }`
  - Returns: `{ success: true, token, user }`
- `POST /api/auth/login`
  - Body: `{ email|username|rollNumber, password|pinCode }`
  - Returns: `{ success: true, token, user }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true, user }`

## 2. Quiz & Adaptive Assessment Endpoints
- `GET /api/quiz/topics`
  - Returns: `{ success: true, topics: [{ subject, name, ... }] }`
- `GET /api/quiz/pre-test?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true, subject, totalQuestions: 15, questions: [...] }`
- `GET /api/quiz/practice-question?subject=Math&topic=Fractions`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true, question, servedDifficulty }`
- `POST /api/quiz/submit`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ quizType: 'pre_test'|'practice'|'post_test', subject, topic, answers: [{ questionId, selectedOptionIndex, confidence? }] }`
  - Returns: `{ success: true, attemptId, totalQuestions, correctAnswers, scorePercentage, results: [...] }`
- `GET /api/quiz/post-test?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: 15 summative questions if eligible (50+ practice questions completed).

## 3. Question Attempts & Event Streams
- `POST /api/attempts`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ questionId, selectedAnswerIndex, mode, timeTaken, subject, topic, difficulty, confidence? }`
  - Returns: `{ success: true, attemptId, isCorrect, correctIndex, explanation, steps, conceptSummary, misconception }`
- `POST /api/attempts/sync` *(Phase 8 Offline Protocol)*
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ events: [ { eventId, questionId, selectedAnswerIndex, timestamp, ... } ] }`
  - Returns: `{ success: true, processed: count, acknowledgedEventIds: [...] }`

## 4. Progress & Analytics Endpoints
- `GET /api/progress/me?subject=Math`
  - Returns topic mastery, diagnostic status, and post-test unlock status.
- `GET /api/progress/comparison-report?subject=Math`
  - Returns pre-test vs. post-test score comparisons, topic accuracy deltas, and learning gains.
- `GET /api/attempts/analytics`
  - Returns user-level aggregated study streaks, accuracy by difficulty, and topic breakdown.
- `GET /api/attempts/class-analytics/:classId`
  - Requires `teacher` or `admin` role. Returns class cohort mastery heatmap and intervention flags.

## 5. Socratic AI Tutor
- `POST /api/chat`
  - Body: `{ message, topic, subject }`
  - Enforces server-side block if user has an active, in-progress summative assessment attempt.
- `GET /api/chat/history`
- `DELETE /api/chat/history`
