# Document 2: Technical Architecture Document

## 1. Technology Stack & Architectural Decisions

```
+-----------------------------------------------------------------------+
|                             CLIENT TIER                               |
|   React.js 18 (SPA) + Vite + Tailwind CSS (Utility-First Responsive)   |
|   - Zero heavy UI component libraries; vanilla HTML5/CSS primitives   |
|   - State Management: React Context API + LocalStorage                |
|   - HTTP: Axios with global JWT and network error interceptors        |
+-----------------------------------+-----------------------------------+
                                    | HTTPS / REST JSON
+-----------------------------------v-----------------------------------+
|                             SERVER TIER                               |
|   Node.js LTS + Express.js Framework                                  |
|   - Stateless REST Architecture with JSON Web Tokens (JWT)            |
|   - Security: Helmet, Express-Rate-Limit, CORS, Input Sanitization   |
|   - Compression: Gzip response compression for slow 3G connections    |
+-----------------------------------+-----------------------------------+
                                    | Mongoose ODM / TLS Connection
+-----------------------------------v-----------------------------------+
|                            DATABASE TIER                              |
|   MongoDB Atlas (Shared M0 Free Tier / Self-Hosted MongoDB Community) |
|   - Flexible document model for hierarchical quiz question storage   |
|   - Native JSON support matching API payloads without ORM translation |
|   - Indexed on (studentId, topic, difficulty, subject)                |
+-----------------------------------------------------------------------+
```

### Stack Selection Rationale for Resource-Constrained EdTech
1. **React.js:** Client-side rendering delivers instantaneous page changes once loaded, eliminating full-page reloads across high-latency mobile networks.
2. **Node.js & Express.js:** Ultra-lightweight memory footprint ($<100\text{ MB}$ at idle), capable of serving thousands of simultaneous requests on inexpensive cloud tiers ($0 to $5/month) or local school server boxes.
3. **MongoDB:** Document database matches the nested structure of questions, options, and quiz attempt histories natively, avoiding heavy relational multi-table JOIN operations.

---

## 2. File & Directory Structure

```
adaptive-quiz-tool/
├── client/                                 # Frontend React Application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                        # React root entry point
│       ├── App.jsx                         # Application router & routes
│       ├── index.css                       # Global styles & Tailwind
│       ├── context/
│       │   └── AuthContext.jsx             # Auth state provider
│       ├── services/
│       │   ├── api.js                      # Axios base instance
│       │   ├── authService.js              # Auth API calls
│       │   ├── quizService.js              # Quiz & question APIs
│       │   └── progressService.js          # Progress tracking APIs
│       ├── components/
│       │   ├── Navbar.jsx                  # Top navigation bar
│       │   ├── Button.jsx                  # Touch-friendly button
│       │   ├── ProgressBar.jsx             # Progress bar
│       │   ├── QuizCard.jsx                # Question container
│       │   ├── FeedbackModal.jsx           # Immediate answer feedback
│       │   ├── TopicBadge.jsx              # Status badge (Needs Focus/Mastered)
│       │   └── LoadingSpinner.jsx          # Low-bandwidth spinner
│       ├── pages/
│       │   ├── Login.jsx                   # Student & Teacher Login
│       │   ├── Register.jsx                # Student Signup
│       │   ├── SubjectSelect.jsx           # Math vs Science choice
│       │   ├── PreTest.jsx                 # Baseline diagnostic test
│       │   ├── Dashboard.jsx               # Student mastery portal
│       │   ├── PracticeQuiz.jsx            # Adaptive practice engine
│       │   ├── PostTest.jsx                # Summative post-test
│       │   ├── Report.jsx                  # Pre vs Post comparison report
│       │   └── TeacherDashboard.jsx        # Class roster & analytics
│       └── utils/
│           ├── constants.js                # App constants & enums
│           └── formatters.js               # Percentage & date helpers
│
├── server/                                 # Backend Node/Express Application
│   ├── package.json
│   ├── server.js                           # Express entry point
│   ├── config/
│   │   ├── db.js                           # MongoDB connection
│   │   └── constants.js                    # Global backend constants
│   ├── models/
│   │   ├── User.js                         # Student & teacher schema
│   │   ├── Question.js                     # Question bank schema
│   │   ├── QuizAttempt.js                  # Attempt logs schema
│   │   └── ProgressTracking.js             # Topic mastery schema
│   ├── engine/
│   │   └── adaptiveEngine.js               # Core difficulty adjustment logic
│   ├── controllers/
│   │   ├── authController.js               # Registration & JWT issuance
│   │   ├── quizController.js               # Diagnostic & practice logic
│   │   └── progressController.js           # Mastery & comparison logic
│   ├── routes/
│   │   ├── authRoutes.js                   # /api/auth
│   │   ├── quizRoutes.js                   # /api/quiz
│   │   └── progressRoutes.js               # /api/progress
│   ├── middleware/
│   │   ├── authMiddleware.js               # JWT verification & role checks
│   │   ├── rateLimiter.js                  # Rate limiting protection
│   │   └── errorHandler.js                 # Central error handler
│   └── scripts/
│       ├── seedQuestions.js                # Database seeder script
│       └── seedData/
│           ├── mathQuestions.json          # Curated Math question bank
│           └── scienceQuestions.json       # Curated Science question bank
│
├── docs/                                   # Architectural & PRD docs
├── package.json                            # Root package to launch both tiers
└── README.md                               # Complete setup instructions
```

---

## 3. Database Schema & Data Models

### 1. Users Collection (`server/models/User.js`)
Stores student and educator credentials.
- `rollNumber`: String (Required, Unique, Indexed) — Used as unique student ID.
- `fullName`: String (Required)
- `grade`: Number (Required, 5–10)
- `passwordHash`: String (Required, Bcrypt salted hash)
- `role`: String (Enum: `['student', 'teacher', 'admin']`, default: `student`)
- `createdAt`, `updatedAt`: Timestamps

### 2. Questions Collection (`server/models/Question.js`)
Authoritative repository of curriculum questions.
- `subject`: String (Enum: `['Math', 'Science']`, Indexed)
- `topic`: String (Required, Indexed; e.g. `Fractions`, `Photosynthesis`)
- `difficulty`: String (Enum: `['easy', 'medium', 'hard']`, Indexed)
- `questionText`: String (Required)
- `options`: Array of 4 Strings (Required)
- `correctAnswerIndex`: Number (Required, 0–3)
- `explanation`: String (Required, plain-language solution)
- `isActive`: Boolean (Default: true)
- *Compound Index:* `{ subject: 1, topic: 1, difficulty: 1, isActive: 1 }`

### 3. QuizAttempts Collection (`server/models/QuizAttempt.js`)
Audit trail of completed diagnostic tests and 10-question practice batches.
- `studentId`: ObjectId (Ref: `User`, Indexed)
- `quizType`: String (Enum: `['pre_test', 'practice', 'post_test']`, Indexed)
- `subject`: String (Enum: `['Math', 'Science']`)
- `topic`: String (Topic name or `'Diagnostic'`)
- `answers`: Array of Objects:
  - `questionId`: ObjectId (Ref: `Question`)
  - `topic`: String
  - `difficulty`: String
  - `selectedOptionIndex`: Number
  - `isCorrect`: Boolean
- `totalQuestions`: Number
- `correctAnswers`: Number
- `scorePercentage`: Number
- `completedAt`: Date

### 4. ProgressTracking Collection (`server/models/ProgressTracking.js`)
Aggregated per-student, per-topic mastery states.
- `studentId`: ObjectId (Ref: `User`, Indexed)
- `subject`: String (Enum: `['Math', 'Science']`)
- `topic`: String
- `questionsAttempted`: Number (Default: 0)
- `questionsCorrect`: Number (Default: 0)
- `masteryPercentage`: Number (Default: 0)
- `currentLevel`: String (Enum: `['easy', 'medium', 'hard']`, Default: `'medium'`)
- `status`: String (Enum: `['needs_focus', 'in_progress', 'mastered']`, Default: `'in_progress'`)
- `lastPracticed`: Date
- *Compound Unique Index:* `{ studentId: 1, subject: 1, topic: 1 }`

---

## 4. Adaptive Difficulty Adjustment Algorithm

### Rule-Based Calibration Logic
The algorithm dynamically calibrates the difficulty during self-paced practice:
1. **Initial Assessment Tier:**
   - Starts at `medium` by default. If the student scored $<40\%$ on this topic in the Pre-Test, practice starts at `easy`.
2. **Promotion (Increase Difficulty):**
   - If the student answers **3 consecutive questions correctly** at the current difficulty:
     - `easy` $\rightarrow$ `medium`
     - `medium` $\rightarrow$ `hard`
     - `hard` $\rightarrow$ remains at `hard`
3. **Demotion (Decrease Difficulty):**
   - If the student answers **2 consecutive questions incorrectly** at the current difficulty:
     - `hard` $\rightarrow$ `medium`
     - `medium` $\rightarrow$ `easy`
     - `easy` $\rightarrow$ remains at `easy`
4. **Maintenance:**
   - Any mixed pattern (e.g. correct, wrong, correct) keeps difficulty steady.
5. **Fallback:**
   - If the database runs out of unseen questions at the target difficulty, it automatically falls back to the nearest level (`medium` $\rightarrow$ `easy` $\rightarrow$ `hard`).

---

## 5. Environment Variables & Configuration
The server requires the following configuration in `/server/.env`:
- `PORT`: Port number (e.g. `5000`)
- `NODE_ENV`: `development` or `production`
- `MONGODB_URI`: MongoDB connection string (local or MongoDB Atlas)
- `JWT_SECRET`: 256-bit cryptographic secret for token signing
- `JWT_EXPIRES_IN`: Token validity window (e.g. `7d`)
- `CLIENT_URL`: Permitted frontend origin (e.g. `http://localhost:5173`)

*Security Rule:* Sensitive keys are never committed to version control. If `JWT_SECRET` or `MONGODB_URI` are absent, the application terminates immediately on boot.
