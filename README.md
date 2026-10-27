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
