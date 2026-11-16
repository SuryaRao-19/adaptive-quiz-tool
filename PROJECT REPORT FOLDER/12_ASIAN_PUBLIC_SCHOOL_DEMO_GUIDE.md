# AdaptIQ 2.0 — Institutional Demonstration Guide
## Asian Public School (APS) Demonstration Edition

---

### Executive Overview

**AdaptIQ 2.0** is an institutional multi-grade adaptive learning management and cognitive intelligence platform engineered specifically for modern K–12 schools. This edition has been tailored for the upcoming live administrative and academic showcase at **Asian Public School (APS)**.

The system combines:
1. **Multi-Grade CBSE Curriculum Alignment** (Grades 1 through 12 across Mathematics, Science, and English).
2. **School Administration Command Dashboard** providing Principal Dr. K. S. Raman real-time cohort KPIs, faculty workloads, diagnostic remediation gaps, and empirical Hake's normalized learning gain ($\langle g \rangle$).
3. **Teacher Command Centre** enabling department heads and classroom educators (e.g., Mrs. Ananya Sharma, Head of Math) to inspect real-time section mastery, issue cryptographically unique 4-digit student PINs, author diagnostic items, and export standardized gradebooks.
4. **Adaptive Student Learning Experience** with personalized Bayesian Knowledge Tracing (BKT), 3-up/2-down difficulty stepping, Leitner 5-box spaced repetition, and 1-click grade switching.
5. **Grade-Aware AI Tutor 3.0** with dynamic language complexity scaffolding (Primary, Middle, Secondary, Senior Secondary) adhering to strict Socratic pedagogical guardrails (zero final answer leakage).

---

## 1. Quick Launch & Environment Setup

### 1.1 Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local or hosted instance (Port 5432)
- **Database Engine**: Prisma ORM v6.4.1

### 1.2 Installation & Dependency Initialization
```bash
# Clone / Open repository root
cd c:\Users\Surya Rao\Desktop\Sem3\adaptive-quiz-tool

# Install server dependencies
cd server
npm install

# Generate Prisma Client with multi-grade institutional schema
npm run prisma:generate

# Seed Asian Public School demonstration dataset (150 students, 10 classrooms, 10 teachers)
npm run seed:aps

# Run full automated test suite (124 tests, 30 suites - 100% green)
npm test

# Launch backend API service (Port 5000)
npm run dev
```

### 1.3 Client Build & Launch
In a separate terminal:
```bash
cd client
npm install
npm run dev
# Open browser at http://localhost:5173
```

---

## 2. Institutional Demonstration Accounts

The platform includes a persistent **Demo Switcher Bar** pinned to the top of the application shell, allowing reviewers to jump between roles with a single click, or log in manually using the pre-seeded credentials:

| Persona | Name | Designation / Grade | Login Email / ID | Password / PIN | Target Landing Screen |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Principal / Admin** | Dr. K. S. Raman | Academic Director | `principal@asianpublicschool.edu` | `admin123` | `/school-admin` |
| **Senior Educator** | Mrs. Ananya Sharma | Head of Mathematics | `sharma.math@asianpublicschool.edu` | `teacher123` | `/teacher-dashboard` |
| **Middle Student** | Aarav Patel | Grade 7, Section A | `student.aps.01@asianpublicschool.edu` (Roll: `APS-07-001`) | `1234` | `/student-dashboard` |

> **Pro Tip**: You can also append query parameters to auto-launch any persona:
> - `http://localhost:5173/?demo=admin`
> - `http://localhost:5173/?demo=teacher`
> - `http://localhost:5173/?demo=student`

---

## 3. Step-by-Step Live Demonstration Script

### Walkthrough 1: The Principal & Administrator Showcase (10 Minutes)
**Presenter Persona**: Dr. K. S. Raman (Principal & Academic Director)  
**URL**: `/school-admin` or click `👑 Principal (Dr. Raman)` in the top switcher.

#### Step 1: Institutional KPI Banner
- **What to highlight**: Show the four top-line executive metric cards:
  1. **Total Student Body**: 150 Active Students across primary, middle, and secondary wings.
  2. **Active Faculty Roster**: 10 Certified Teachers across 10 distinct subject sections.
  3. **Average Institution Mastery**: 76.4% aggregated across all cognitive attempts.
  4. **Pre-to-Post Hake's Gain ($\langle g \rangle$)**: **0.67 (High Educational Gain)** according to standard cognitive physics measurement:
     $$\langle g \rangle = \frac{\%Post - \%Pre}{100\% - \%Pre}$$

#### Step 2: Grade-Wise Enrollment & Subject Performance Matrix
- **What to highlight**: Scroll to the **Grade-Wise Enrollment & Mastery Breakdown** table.
- Demonstrate that Asian Public School has active cohorts in:
  - **Grade 5 (Primary Stage)**: 2 Sections, 56 Students, 78% Average Mastery.
  - **Grade 7 (Middle Stage)**: 2 Sections, 38 Students, 76% Average Mastery.
  - **Grade 8 (Middle Stage)**: 2 Sections, 32 Students, 74% Average Mastery.
  - **Grade 9 (Secondary Stage)**: 2 Sections, 48 Students, 75% Average Mastery.
  - **Grade 10 (Secondary Stage)**: 2 Sections, 16 Students, 78% Average Mastery.
- Point out the active subjects: **Mathematics, General Science, and English Literature & Grammar**.

#### Step 3: School-Wide Diagnostic Remediation Gaps
- **What to highlight**: The AI Diagnostic Engine automatically aggregates error distributions from student attempts and highlights institutional weak areas before board examinations:
  - *Grade 7 Math*: Rational Number Operations (62% Mastery - 14 Students flagged for intervention).
  - *Grade 9 Science*: Kinematic Acceleration Equations (58% Mastery - 18 Students flagged).
  - *Grade 10 Math*: Quadratic Discriminant & Roots (65% Mastery - 8 Students flagged).
  - *Grade 5 English*: Subject-Verb Concord (59% Mastery - 12 Students flagged).

#### Step 4: Empirical Pre-to-Post Learning Growth Table
- **What to highlight**: Show the side-by-side comparison of baseline diagnostic scores vs. post-test scores. Show that Grade 7 Mathematics grew from an initial baseline of **42.5%** to an exit score of **81.0%**, yielding a normalized gain of **0.67**.

---

### Walkthrough 2: The Teacher Command Centre & School Assessment System (15 Minutes)
**Presenter Persona**: Mrs. Ananya Sharma (Head of Mathematics)  
**URL**: `/dashboard` (or `/teacher`) | Top switcher: `👩‍🏫 Teacher (Mrs. Sharma)`

#### Part 1: Separate Role-Specific Navigation
- **What to observe**: The sidebar automatically adapts exclusively for educators with 11 primary operational modules:
  1. **Dashboard** (`/dashboard` / `/teacher`)
  2. **My Classes** (`/classes`)
  3. **Assessments** (`/teacher/assessments`)
  4. **Live Test Centre** (`/teacher/live-test` — Live badge)
  5. **Submissions & Grading** (`/teacher/grading` — 4 Pending)
  6. **Class Results** (`/teacher/results`)
  7. **Attendance** (`/teacher/attendance`)
  8. **Question Bank** (`/question-bank` — Grades 1–12)
  9. **Reports** (`/teacher/reports`)
  10. **Settings** (`/settings`)
  11. **Help & Support** (`/support`)
  - *Plus*: **Teacher AI Assistant** (`/ai-hub` — Powered by Gemini 3.8 Multi-Model Gateway)
- **Pedagogical Guardrail**: Student-oriented actions (Practice Mode, Step-by-Step Solutions) are cleanly hidden from Teacher navigation while remaining 100% intact for students.

#### Part 2: Teacher Dashboard Overview
- **Live Institutional KPIs**:
  - **56 Assigned Students** across primary & middle classes.
  - **3 Active Classrooms** (Grade 7-A Math, Grade 8-A Math, Grade 9-A Math).
  - **2 Upcoming Assessments** & **1 Ongoing Live Exam**.
  - **4 Pending Submissions** & **3 Pending Grading**.
  - **Today's Attendance Rate: 94% Present** (26/28 students in Grade 7-A).
- **Live Examination Alert Banner**: Displays the running STEM Diagnostic Pre-Test with 1-click **"Enter Live Test Centre →"**.
- **Students Requiring Academic Intervention**: Highlights at-risk learners with low BKT mastery (e.g., Rohan Gupta 52%, Kabir Mehta 58%) and specific foundational gap tags.
- **4 Rapid Actions**:
  - `Create Assessment` $\rightarrow$ Launches 3-step Assessment Builder.
  - `Take Attendance` $\rightarrow$ Opens Daily Attendance Register.
  - `Open Classroom` $\rightarrow$ Opens 6-tab Classroom Management Suite.
  - `Review Submissions` $\rightarrow$ Opens Descriptive Rubric Grading Workspace.

#### Part 3: My Classes (6 Dedicated Classroom Tabs)
- Navigate to **My Classes** (`/classes`).
- Select **Grade 7-A Mathematics (Join Code: `APS7AM`)**.
- Point out the **Classroom Master Banner** showing Grade 7-A, CBSE Mathematics, Teacher Mrs. Ananya Sharma, Passcode `APS7AM`, and 28 enrolled students.
- Demonstrate each of the **6 Dedicated Tabs**:
  1. **Overview**: Metric summary, rapid action cards, recent assessments, and classroom activity stream.
  2. **Students**: Search by name/roll, status filter (`On Track` vs `Needs Attention`), Table vs Stacked Card toggle, CSV Roster Import with Desk Cards generation, and individual student profile inspection.
  3. **Assessments**: Register of active, graded, and scheduled exams with direct launch buttons.
  4. **Results & Analytics**: Class average (74.8%), top score (96%), and CBSE standard letter grade distribution (A1–E).
  5. **Attendance**: Today's attendance percentage (94%), 5-day weekly trend sparkline, and link to register.
  6. **Learning Insights**: Bayesian Knowledge Tracing (BKT) cohort mastery ($P(L_t) = 76.5\%$), common foundational misconceptions, and 1-click **"Dispatch Adaptive Remediation"**.

#### Part 4: Assessment Builder & Initial STEM Diagnostic Test
- Navigate to **Assessments** (`/teacher/assessments`).
- Demonstrate the **3-Step Assessment Creation Wizard**:
  - **Step 1: Curriculum & Target**: Title, Grade (7), Subject (Mathematics & Science), Instructions, Duration (20 mins), Total Marks (24), Randomize Order toggle.
  - **Step 2: Blueprint & Question Selection**:
    - Click **"Load School STEM Diagnostic Blueprint (Pre-Test)"** $\rightarrow$ Instantly loads the calibrated 12-question demonstration diagnostic (6 Math items across integers, rational numbers, algebra + 6 Science items across photosynthesis, heat, nutrition).
    - Or click **"Pick from Question Bank"** to browse 100+ multi-grade CBSE items.
    - Or click **"Generate Draft with AI"** $\rightarrow$ Triggers Gemini multi-model synthesis with mandatory human review before publishing.
  - **Step 3: Schedule & Publish**: Set start/end timestamps, difficulty distribution (Easy: 4, Medium: 5, Hard: 3), Save as Draft or Publish immediately.

#### Part 5: Live Test Centre (Real-Time Invigilation)
- Navigate to **Live Test Centre** (`/teacher/live-test`).
- **Synchronized Server Countdown Timer**: Shows live examination countdown (e.g., `14:32 remaining`) with visual warning indicators.
- **Participation Telemetry Breakdown**: Enrolled (28), Joined (26), In Progress (18), Submitted (8), Not Started (2), Disconnected (0).
- **Candidate Roster Table**: Real-time progress bars, answers recorded (e.g. 10/12), current score estimate, connection heartbeat, and last action timestamp.
- **Invigilator Controls**:
  - **Pause Exam**: Halts student timers and freezes question inputs.
  - **Resume Exam**: Restores student test sessions seamlessly.
  - **Extend Time**: Adds +5, +10, or +15 minutes with audit logging.
  - **End Session Early**: Collects and finalizes all active student attempts.

#### Part 6: Submissions & Descriptive Rubric Grading
- Navigate to **Submissions & Grading** (`/teacher/grading`).
- **Auto-Graded Objective Questions**: MCQs and numerical inputs are instantly graded by the server.
- **Descriptive Answer Evaluation Workspace**:
  - Displays student's written response side-by-side with the model answer and marking rubric.
  - Teacher awards points ($0$ to $4$ marks) with interactive rubric criteria buttons (`Correct Approach`, `Step Missing`, `Calculation Error`).
  - Add customized pedagogical feedback (e.g., *"Excellent step-by-step simplification; verify the denominator in step 3"*).
  - Score updates authoritatively; click **"Save & Finalize Grade"** $\rightarrow$ transitions attempt from `PENDING_REVIEW` to `GRADED`.
  - Click **"Publish All Results"** to make marks and feedback visible to students.

#### Part 7: Class Results & Standardized Analytics
- Navigate to **Class Results** (`/teacher/results`).
- Displays class-wide performance metrics, CBSE letter grade breakdown (A1: 21%, A2: 29%, B1: 25%, B2: 14%, C/D: 11%), topic-wise accuracy, and individual student scorecards comparing raw test marks with cognitive BKT mastery.
- Click **"Export CSV"** or **"Print Report"** to produce official school transcripts.

#### Part 8: Daily Attendance Register
- Navigate to **Attendance** (`/teacher/attendance`).
- Select classroom and calendar date (defaults to today).
- Mark each student: **Present (P)**, **Late (L)**, **Absent (A)**, or **Excused (E)** with optional remarks.
- Quick buttons: **"Mark All Present"** for 1-click roster attendance.
- Database uniqueness guard: Enforced through `@@unique([classroomId, studentId, date])` with UTC midnight date normalization.
- Click **"Save Attendance Register"** to persist to PostgreSQL with audit trail.
- Click **"Export Register (CSV)"** to generate monthly attendance sheets.

---

### Walkthrough 3: The Adaptive Student Experience (10 Minutes)
**Presenter Persona**: Aarav Patel (Grade 7-A Student)  
**URL**: `/student-dashboard` or click `🎓 Student (Aarav - G7)`.

#### Step 1: Personalized Cognitive Profile
- Point out Aarav's student card: **Aarav Patel**, Roll No. **APS-07-001**, Asian Public School.
- Show cognitive stats: **6-Day Learning Streak 🔥**, **76.5% BKT Mastery**, **2 Due Spaced Repetition Cards**.

#### Step 2: Subject Cards & 1-Click Grade Level Switcher
- Review the three active subject tracks:
  - **Mathematics**: Integers, Fractions & Decimals, Simple Equations (82% Mastery).
  - **Science**: Nutrition in Plants, Heat & Temperature, Acids & Bases (74% Mastery).
  - **English**: Nouns, Tenses, Reading Comprehension (76% Mastery).
- Use the **Grade Selector** in the top demo switcher bar (switch between Grade 5, Grade 7, Grade 10) to show that the curriculum dynamically updates to reflect appropriate stage-specific topics and learning outcomes!

#### Step 3: Grade-Aware Socratic AI Tutor 3.0
- Navigate to **AI Tutor Chat** (`/ai-tutor`).
- Ask a typical homework question: *"Can you give me the answer to 3/4 + 2/5?"*
- Observe how the AI responds:
  - **Zero Answer Leakage**: It **NEVER** says *"The answer is 23/20"*.
  - **Socratic Inquiry**: It asks: *"To add fractions with different denominators, what is the first step we need to take with 4 and 5?"*
  - **Grade Scaffolding**: Uses language and analogies calibrated specifically for a Middle School (Grade 7) student.

---

## 4. Key Architectural Highlights for Technical Reviewers

1. **Database Multi-Tenancy**:
   - Entities (`School`, `AcademicYear`, `Grade`, `Section`, `CurriculumProfile`, `TeacherProfile`, `StudentMastery`) are linked by foreign keys and isolated per institution.
2. **Pedagogical Integrity**:
   - Strict adherence to CBSE learning outcomes and Bloom's taxonomy (`REMEMBER`, `UNDERSTAND`, `APPLY`, `ANALYZE`, `EVALUATE`, `CREATE`).
   - The AI Tutor Socratic prompt contains deterministic regex guards and instruction policies preventing answer revelation under all adversarial conditions.
3. **Resilient Offline Architecture**:
   - Client features full offline fallback stores (`mockData.js`) ensuring that during live auditor pitches, unstable Wi-Fi will never crash the presentation.
4. **Verification Proof**:
   - Automated test suite executes 124 unit and integration tests across 30 suites with a 100% pass rate.

---
*Prepared by the AdaptIQ Engineering Team for the Asian Public School Institutional Demonstration.*
