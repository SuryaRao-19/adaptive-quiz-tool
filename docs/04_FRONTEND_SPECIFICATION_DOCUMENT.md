# Document 4: Frontend Specification Document

## 1. High-Contrast Accessible Color System
Specifically calibrated for readability on low-cost, low-brightness LCD panels:

| Token Name | Hex Code | Purpose & Accessibility |
| :--- | :--- | :--- |
| **Primary Navy** | `#1E3A8A` | Navigation bar, primary action buttons, main headers |
| **Primary Hover** | `#172554` | Interactive state hover & focus ring |
| **Secondary Teal** | `#0D9488` | Accents, progress bars, active selections |
| **Background Light** | `#F8FAFC` | Main screen background; eliminates harsh glare |
| **Card White** | `#FFFFFF` | Container backgrounds; maximum contrast |
| **Text Dark** | `#0F172A` | Primary text; exceeds 12:1 WCAG contrast ratio |
| **Text Muted** | `#475569` | Secondary captions and guidance |
| **Success Green** | `#16A34A` | Correct answer indicators & "Mastered" tags |
| **Success Background**| `#DCFCE7` | Highlight tint for correct answer option |
| **Error Red** | `#DC2626` | Mistake alerts & incorrect answer indicators |
| **Error Background** | `#FEE2E2` | Highlight tint for incorrect answer option |
| **Warning Amber** | `#D97706` | "Needs Focus" badge indicator (<60% accuracy) |

---

## 2. Typography Scale
Uses native system sans-serif fonts (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `sans-serif`) to eliminate external Google Font downloads on slow school internet.
- **Page Title (`h1`):** `28px` (`1.75rem`), Bold (`font-weight: 700`), Line height: 1.2
- **Section Heading (`h2`):** `22px` (`1.375rem`), Semi-Bold (`font-weight: 600`), Line height: 1.3
- **Quiz Question Text:** `20px` (`1.25rem`), Medium (`font-weight: 500`), Line height: 1.4
- **Quiz Option Text:** `16px` (`1.0rem`), Regular (`font-weight: 400`), Line height: 1.5
- **Body & Explanation Text:** `15px` (`0.9375rem`), Regular, Line height: 1.5
- **Button Labels:** `16px` (`1.0rem`), Semi-Bold (`font-weight: 600`)

---

## 3. Component Design & States

### 1. Buttons
- Minimum height: `48px` for touch accessibility.
- Primary: Navy `#1E3A8A` with white text, rounded corners (`8px`), full-width on mobile.
- Disabled state: Grey `#CBD5E1` with muted text.

### 2. Quiz Option Cards
- Unselected: White background, border `2px solid #CBD5E1`, padding `16px`.
- Selected: Light blue `#EFF6FF`, border `2px solid #1E3A8A`.
- Correct (Post-Submit): Pastel green `#DCFCE7`, border `2px solid #16A34A`.
- Incorrect (Post-Submit): Pastel red `#FEE2E2`, border `2px solid #DC2626`.

### 3. Immediate Feedback Modal / Banner
- Renders directly below the question card upon answer submission.
- **Correct State:** Green border with text: *"Correct! Great job!"*
- **Incorrect State:** Red border with text: *"Not quite right. Let's see why:"* followed by a white card with the step-by-step plain-English solution.
- Action button: Large "Continue $\rightarrow$" button to proceed.

### 4. Progress Bars & Topic Badges
- Progress Bar: Height `10px`, track `#E2E8F0`, fill `#0D9488` (Teal), rounded pill.
- Badges:
  - `Needs Focus`: Amber background `#FEF3C7`, text `#B45309`.
  - `In Progress`: Blue background `#DBEAFE`, text `#1D4ED8`.
  - `Mastered`: Green background `#DCFCE7`, text `#15803D`.

---

## 4. Mobile-First Layout Rules
- Target base viewport: `360px` mobile width.
- Content max-width: `768px` (`max-w-3xl`) for quiz questions to maintain focus and prevent eye fatigue.
- Viewport padding: `16px` on mobile, `32px` on desktop (`md:`).

---

## 5. Complete Internal REST API Specification

### Authentication
- `POST /api/auth/register`
  - Body: `{ fullName, rollNumber, grade, password }`
  - Returns: `{ token, user: { id, fullName, rollNumber, grade, role } }`
- `POST /api/auth/login`
  - Body: `{ rollNumber, password }`
  - Returns: `{ token, user: { id, fullName, rollNumber, grade, role } }`

### Quiz & Practice
- `GET /api/quiz/pre-test?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ subject, totalQuestions: 15, questions: [{ _id, topic, difficulty, questionText, options }] }`
- `GET /api/quiz/practice-question?subject=Math&topic=Fractions&currentDifficulty=medium&recentHistory=true,false`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ question: { _id, subject, topic, difficulty, questionText, options }, servedDifficulty }`
- `POST /api/quiz/submit`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ quizType: 'pre_test'|'practice'|'post_test', subject, topic, answers: [{ questionId, selectedOptionIndex }] }`
  - Returns: `{ attemptId, totalQuestions, correctAnswers, scorePercentage, results: [{ questionId, isCorrect, correctAnswerIndex, explanation }] }`
- `GET /api/quiz/post-test?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: 15 post-test questions if eligible ($\ge 50$ practice questions completed).

### Progress & Mastery
- `GET /api/progress/me?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ hasCompletedPreTest, hasCompletedPostTest, totalPracticeQuestionsAnswered, canTakePostTest, topics: [{ topic, questionsAttempted, questionsCorrect, masteryPercentage, status, currentLevel }] }`
- `GET /api/progress/comparison-report?subject=Math`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ subject, preTestScore, postTestScore, overallGainPercentage, topicBreakdown: [{ topic, preTestAccuracy, postTestAccuracy, gain }] }`
- `GET /api/progress/teacher-overview`
  - Headers: `Authorization: Bearer <token>` (Teacher only)
  - Returns: Class roster summary, student completion counts, and cohort weak topics.
