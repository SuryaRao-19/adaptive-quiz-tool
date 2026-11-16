# Adaptive Quiz and Practice Tool (Math & Science)

A lightweight, community-oriented web application designed for students in resource-constrained schools to identify foundational gaps, receive adaptive practice at their exact learning level, get instant pedagogical feedback on mistakes, and measure learning gains through pre-test vs. post-test comparisons.

---

## 📁 Repository Structure

```
adaptive-quiz-tool/
├── docs/                                   # Full Project Specification Documents
│   ├── 01_PRODUCT_REQUIREMENTS_DOCUMENT.md
│   ├── 02_TECHNICAL_ARCHITECTURE_DOCUMENT.md
│   ├── 03_SECURITY_AND_ACCESS_DOCUMENT.md
│   ├── 04_FRONTEND_SPECIFICATION_DOCUMENT.md
│   └── 05_FEATURE_TICKET_LIST.md
│
├── server/                                 # Backend (Node.js, Express, MongoDB)
│   ├── config/                             # DB connection & system constants
│   ├── controllers/                        # Auth, Quiz & Progress business logic
│   ├── engine/                             # Core adaptive difficulty engine
│   ├── middleware/                         # JWT verification & rate-limiting
│   ├── models/                             # Mongoose schemas (User, Question, etc.)
│   ├── routes/                             # REST API endpoints
│   ├── scripts/                            # Database seeder & question banks
│   ├── server.js                           # Express server entry point
│   ├── .env.example                        # Template environment variables
│   └── package.json
│
├── client/                                 # Frontend (React 18, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/                     # QuizCard, ProgressBar, FeedbackModal, etc.
│   │   ├── context/                        # AuthContext (JWT & login state)
│   │   ├── pages/                          # PreTest, Practice, PostTest, Dashboard, etc.
│   │   ├── services/                       # Axios API integrations
│   │   ├── utils/                          # Enums and helper functions
│   │   ├── App.jsx                         # Main router
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                            # Root orchestration scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance running on `mongodb://localhost:27017` or a free MongoDB Atlas URI)

### 1. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```
Ensure `.env` has your MongoDB connection string:
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive_quiz_db
JWT_SECRET=super_secret_school_jwt_key_change_in_production_987654321
CLIENT_URL=http://localhost:5173
```

### 2. Seed Question Bank & Demo Users
```bash
npm run seed
```
This populates 25+ curated questions in Math and Science (Easy, Medium, Hard) and creates two demo accounts:
- **Demo Student:** Roll Number `STUDENT01`, PIN `1234`
- **Demo Teacher:** ID `TEACHER01`, Password `admin123`

### 3. Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Setup & Start Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 🎯 Key Application Flow
1. **Login:** Student signs in with Roll Number & PIN (no email needed).
2. **Subject Selection:** Choose Math or Science.
3. **Diagnostic Pre-Test:** Complete a 15-question baseline quiz. The system tags topics $<60\%$ as `Needs Focus`.
4. **Adaptive Practice:** Practice weak topics in 10-question batches. Difficulty adjusts in real time:
   - 3 correct in a row $\rightarrow$ Escalates difficulty.
   - 2 wrong in a row $\rightarrow$ De-escalates difficulty to reinforce basics.
   - Instant mistake feedback shows plain-language step-by-step explanations.
5. **Post-Test & Report:** After completing 50 practice questions, the student unlocks the Post-Test and receives a side-by-side **Learning Growth Report** with verified percentage gains.

---

## 🤖 AdaptIQ AI Tutor 3.0 — Multi-Model Intelligent Learning System

AdaptIQ integrates an enterprise-grade AI Gateway offering:

- **Server-Sent Events (SSE) Streaming**: Token-by-token streaming with live cursor animation and instant generation stop.
- **Granular Timeout Life-cycle**: Eliminates legacy 15s timeouts with 10s connection, 20s first-token, 20s idle-stream, and 120s max generation limits.
- **Multi-Model Provider Adapters**:
  - **Google Gemini**: `@google/genai` SDK (`gemini-3.8-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-pro`).
  - **OpenAI**: Native fetch streaming (`gpt-4o-mini`, `gpt-4o`).
  - **Anthropic**: Native fetch streaming (`claude-3-5-haiku`, `claude-3-5-sonnet`).
  - **Ollama**: Local on-premise inference (`llama3.2`, `deepseek-r1:7b`).
- **Zero-Overhead Intent Classifier**: Heuristically maps student questions to 6 categories (`SIMPLE`, `EDUCATIONAL_REASONING`, `PROGRAMMING`, `TUTORING`, `CONTENT_GENERATION`, `LONG_CONTEXT`).
- **Circuit Breaker & Fallback**: 3-failure threshold with 30s cooldown and automatic pre-stream fallback cascade.
- **6 Pedagogical Tutoring Modes**: `Explain`, `Socratic`, `Step-by-Step`, `Exam Prep`, `Debug Code`, `Intuition/Analogies`.
- **Persistent Conversation Memory**: Per-user isolated conversations with sliding token windows (`Conversation`, `ConversationMessage`, `ConversationSummary`).
- **Academic Integrity Guard**: Automatically disables AI Tutor during active test mode.

### AI Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/chat/stream` | Real-time SSE streaming Socratic chat |
| `POST` | `/api/ai/chat` | Unary conversational chat |
| `GET` | `/api/ai/models` | List configured models & capabilities |
| `GET` | `/api/ai/providers/health` | Provider health & circuit breaker metrics |
| `GET` | `/api/ai/conversations` | List user conversations |
| `POST` | `/api/ai/conversations` | Create new conversation |
| `GET` | `/api/ai/conversations/:id` | Fetch conversation messages |
| `DELETE` | `/api/ai/conversations/:id` | Delete conversation |
| `DELETE` | `/api/ai/conversations/:id/messages` | Clear conversation messages |

