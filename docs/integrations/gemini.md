# AdaptIQ — Google Gemini AI Integration Guide

## 1. Overview & Architecture

AdaptIQ integrates Google's official Gemini Generative AI SDK (`@google/genai`) on the backend server to introduce intelligent, curriculum-aligned learning and teaching capabilities for Grade 6–10 Mathematics and Science (aligned with UN Sustainable Development Goal 4: Quality Education).

### Secure Tiered Architecture

```
React Frontend (SPA)
        ↓  (HTTPS JSON / JWT Bearer)
AdaptIQ Backend API (Express.js / Node.js)
        ↓  (Rate Limiting & Safety Validation)
Gemini AI Service Module (server/services/gemini/)
        ↓  (Google GenAI SDK / Gemini 3.8 Flash)
Google Generative AI API (ai.google.dev)
```

### Architectural Principles

1. **Confidential Server-Authoritative Execution**: The Gemini API key is stored and managed exclusively in `server/.env`. It is NEVER exposed to client-side bundles, Vite/React environments, API responses, or browser logs.
2. **Schema-Enforced Structured Outputs**: All generative requests request and validate strict JSON schemas. Responses are inspected server-side by `responseValidator.js` before returning or persisting.
3. **Teacher Review Gate**: Generated questions remain in `pending_review` status. They are never published to official question banks or summative exams without explicit teacher review and approval.
4. **Academic Integrity Protection**: Socratic answer explanations and tutor assistance are strictly disabled during active summative `TestMode` attempts.
5. **Zero-Downtime Offline Resilience**: If internet connectivity is interrupted or Gemini is experiencing temporary demand spikes (HTTP 503), AdaptIQ activates its pedagogical fallback heuristics, ensuring learners are never blocked.
6. **Data Minimization & Privacy**: No confidential student identifiers, emails, names, or roll numbers are transmitted to Gemini. Only aggregated, anonymized topic accuracies and distractor patterns are analyzed.

---

## 2. Google AI Studio Setup & API Key Generation

1. Navigate to **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/).
2. Sign in with your Google Workspace or individual Google Account.
3. Click on **"Get API key"** in the top navigation panel.
4. Select **"Create API key"** (either in an existing Google Cloud project or a newly provisioned one).
5. Copy the generated API key string (e.g. `AQ.Ab8RN6...`).
6. Treat this key as a confidential server credential. Never check it into source control.

---

## 3. Environment Configuration

### Backend (`server/.env`)

Add the following environment variables to `server/.env`:

```env
# Google Gemini Generative AI Key (Server-side confidential)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Configurable Supported Model (Defaults to gemini-3.8-flash)
GEMINI_MODEL=gemini-3.8-flash

# Legacy Fallback Aliases (Supported for backwards compatibility)
AI_PROVIDER=gemini
AI_API_KEY=your_actual_gemini_api_key_here
AI_MODEL=gemini-3.8-flash
```

### Environment Placeholder (`server/.env.example`)

A clean placeholder is committed in `server/.env.example`.

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

### Startup Validation

At server boot (`server/server.js`), `validateGeminiConfig()` checks whether `GEMINI_API_KEY` is defined:
- If present, logs: `[AI Service] Google Gemini AI configured successfully (Model: gemini-3.8-flash)`.
- If missing, logs: `[AI Service Notice] Google Gemini AI key not found. Offline pedagogical fallbacks active.`.
- In `/api/health`, returns:
  ```json
  "ai": {
    "configured": true,
    "model": "gemini-3.8-flash",
    "provider": "google-gemini"
  }
  ```

---

## 4. Supported Models & Pricing

| Model | Default Role | Input Price / 1M Tokens | Output Price / 1M Tokens |
|---|---|---|---|
| `gemini-3.8-flash` | **Default Production Model** | \$0.075 | \$0.30 |
| `gemini-2.0-flash` | Automatic Fallback Candidate | \$0.10 | \$0.40 |
| `gemini-1.5-flash` | Lightweight Fast Backup | \$0.075 | \$0.30 |
| `gemini-2.5-pro` | Deep Analytical Inference | \$1.25 | \$5.00 |

*Cost calculation is computed dynamically in `server/services/gemini/geminiClient.js` using `calculateEstimatedCost()`.*

---

## 5. API Endpoints Reference

All endpoints are mounted under `/api/ai` and require `Authorization: Bearer <JWT>` and pass through `aiRateLimiter`.

### 1. `POST /api/ai/generate-quiz`
*Access: Teachers & Administrators*

**Request Payload:**
```json
{
  "subject": "Math",
  "topic": "Fractions",
  "subtopic": "Adding unlike denominators",
  "difficulty": "medium",
  "count": 5,
  "format": "MCQ",
  "gradeLevel": 7,
  "learningObjective": "Calculate least common denominator for proper fractions"
}
```

**Response Payload:**
```json
{
  "success": true,
  "source": "gemini_api",
  "requestId": "uuid",
  "count": 5,
  "questions": [
    {
      "question": "What is 1/3 + 1/6 expressed in simplest form?",
      "type": "MCQ",
      "options": ["1/2", "2/9", "2/6", "3/9"],
      "correctAnswer": "1/2",
      "correctAnswerIndex": 0,
      "explanation": "Convert 1/3 to 2/6. Then 2/6 + 1/6 = 3/6 = 1/2.",
      "steps": [
        { "step": "Step 1: Find LCD", "desc": "LCD of 3 and 6 is 6.", "math": "1/3 = 2/6" },
        { "step": "Step 2: Add numerators", "desc": "2/6 + 1/6 = 3/6", "math": "3/6 = 1/2" }
      ],
      "topic": "Fractions",
      "difficulty": "medium",
      "marks": 1,
      "conceptSummary": "Convert fractions to equivalent denominators before adding.",
      "misconception": "Adding denominators across (e.g. 1/3 + 1/6 = 2/9).",
      "status": "pending_review"
    }
  ]
}
```

---

### 2. `POST /api/ai/explain-answer`
*Access: Authenticated Students & Teachers*

**Request Payload:**
```json
{
  "questionText": "Calculate 1/3 + 1/6 and reduce to lowest terms.",
  "options": ["1/2", "2/9", "2/6", "3/9"],
  "studentAnswer": "2/9",
  "correctAnswer": "1/2",
  "subject": "Math",
  "topic": "Fractions",
  "gradeLevel": 7,
  "isTestMode": false
}
```

**Response Payload:**
```json
{
  "success": true,
  "source": "gemini_api",
  "explanation": {
    "correctAnswer": "1/2",
    "explanation": "To add fractions with different denominators, first convert them to equivalent fractions with a common denominator.",
    "whyIncorrect": "You added the numerators (1+1=2) and denominators (3+6=9) directly. Denominators represent partition sizes and cannot be summed directly.",
    "stepByStepSolution": [
      "Step 1: Determine the Least Common Denominator (LCD). For 3 and 6, the LCD is 6.",
      "Step 2: Multiply 1/3 by 2/2 to get 2/6.",
      "Step 3: Compute 2/6 + 1/6 = 3/6.",
      "Step 4: Reduce 3/6 by dividing numerator and denominator by 3 to reach 1/2."
    ],
    "simpleExample": "If you have 1 slice of a 3-slice pizza and 1 slice of a 6-slice pizza, express the 1/3 slice as 2 smaller sixths.",
    "relatedPracticeQuestion": {
      "question": "What is 1/4 + 3/8?",
      "hint": "Convert 1/4 to eighths first."
    }
  }
}
```

---

### 3. `POST /api/ai/study-plan`
*Access: Authenticated Students (own ID) or Teachers (enrolled students)*

**Request Payload:**
```json
{
  "studentId": "optional-student-uuid",
  "subject": "Mathematics",
  "gradeLevel": 7
}
```

**Response Payload:**
```json
{
  "success": true,
  "source": "gemini_api",
  "studyPlan": {
    "studentSummary": "Performance diagnostic reveals high accuracy in basic decimals (85%), with procedural gaps in fraction division (38%).",
    "weakTopics": ["Fractions Division", "Least Common Multiples"],
    "strongTopics": ["Decimals & Percentages"],
    "repeatedMistakes": ["Multiplying denominators directly during addition"],
    "learningGaps": ["Reciprocal transformation in division"],
    "suggestedRevisionTopics": ["Keep-Change-Flip Rule", "Equivalent Fractions"],
    "recommendedPracticeQuestions": [
      "Solve: 4 ÷ (1/2)",
      "Calculate: 3/5 + 1/10"
    ],
    "studyPlan": [
      { "day": "Day 1", "focus": "Review fraction division with visual bar models", "durationMinutes": 20 },
      { "day": "Day 2", "focus": "Solve 10 targeted practice questions in Practice Mode", "durationMinutes": 25 },
      { "day": "Day 3", "focus": "Complete 15-minute diagnostic mastery quiz", "durationMinutes": 15 }
    ]
  }
}
```

---

### 4. `POST /api/ai/generate-practice-test`
*Access: Authenticated Students & Teachers*

**Request Payload:**
```json
{
  "subject": "Science",
  "topic": "Forces & Motion",
  "difficulty": "medium",
  "timeLimitMinutes": 15,
  "questionCount": 5,
  "gradeLevel": 7
}
```

---

### 5. `POST /api/ai/teacher-assistant`
*Access: Teachers & Administrators (Verifies Classroom Ownership)*

**Request Payload:**
```json
{
  "actionType": "lesson_activity",
  "subject": "Math",
  "topic": "Fractions",
  "gradeLevel": 7,
  "promptDetails": "Include hands-on manipulative activity with paper strips"
}
```

---

### 6. `POST /api/ai/performance-insights`
*Access: Authenticated Teachers & Students*

**Request Payload:**
```json
{
  "subject": "All",
  "gradeLevel": 7
}
```

---

### 7. `POST /api/ai/approve-content`
*Access: Teachers & Administrators*

**Request Payload:**
```json
{
  "contentId": "content_uuid_here",
  "questionsToPublish": [ ... ]
}
```

---

### 8. `GET /api/ai/usage`
*Access: Authenticated Users*

Returns real-time token tracking, model metadata, and estimated expenditure in USD.

---

## 6. Safety, Rate Limiting & Security Controls

1. **Prompt Injection Protection**:
   Incoming prompts pass through regex filters in `aiRateLimiter.js` neutralizing DAN jailbreaks, "ignore prior instructions", script tags, and command injection strings.
2. **Per-User Sliding Rate Limit**:
   - Students: 25 requests per 15 minutes.
   - Teachers: 60 requests per 15 minutes.
   - Admins: 120 requests per 15 minutes.
3. **Daily Quotas**:
   - Students: 100 requests / day.
   - Teachers: 300 requests / day.
4. **Input Size Bounds**:
   User message content is limited to 2,500 characters.
5. **Request Timeouts & Cascade**:
   Requests time out after 15,000ms. If `gemini-3.8-flash` experiences transient 503 high demand spikes, the client cascades to `gemini-2.0-flash` or `gemini-1.5-flash` before serving offline pedagogical heuristics.

---

## 7. Troubleshooting & Common Scenarios

| Issue | Cause | Resolution |
|---|---|---|
| `GEMINI_API_KEY is not configured` | Missing or blank variable in `server/.env` | Open `server/.env` and paste your key from Google AI Studio. Restart server. |
| `HTTP 404 Model Not Found` | Deprecated model ID (e.g. `gemini-2.5-flash` retired) | Set `GEMINI_MODEL=gemini-3.8-flash` in `server/.env`. |
| `HTTP 429 Rate Limit Exceeded` | Quota exhausted or burst rate exceeded | Wait for cooldown window (Retry-After header) or request quota upgrade in Google AI Studio. |
| `HTTP 403 Disabled during Test Mode` | Student attempting to query tutor during summative test | Academic integrity policy. Student must complete test before reviewing solutions. |
| `PostgreSQL disconnected notice` | Local Postgres container inactive | Run `docker compose up -d` or use fallback database mode. Storage service handles in-memory and Mongo fallbacks automatically. |

---

## 8. Deployment Checklist

1. [x] Set `GEMINI_API_KEY` on production server environment (Vercel, Render, Railway, or VPS).
2. [x] Ensure `server/.env` is NOT committed to Git repository (verified in `.gitignore`).
3. [x] Execute backend test suite (`npm test --prefix server` -> 106 tests green).
4. [x] Build frontend client bundle (`npm run build --prefix client` -> exit code 0).
5. [x] Verify `/api/health` reports `"ai": { "configured": true }`.

