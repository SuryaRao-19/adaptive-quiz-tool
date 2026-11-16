# 🖼️ AdaptIQ — Live Application Screenshot Catalog & Walkthrough

This document catalogs all 11 high-resolution application screenshots captured directly from the running project on localhost (ports 5000 and 5173).

All image files are stored in [`docs/screenshots/`](../docs/screenshots/).

---

### Screenshot 1: Public Landing Page Hero
- **File**: [`docs/screenshots/01_landing_hero.png`](../docs/screenshots/01_landing_hero.png)
- **Route**: `http://localhost:5173/`
- **Purpose**: Welcomes visitors, explains the mission of equitable STEM practice, and provides immediate access for both Students and Teachers.
- **Key UI Elements**:
  - Top navigation bar with Theme Switcher (Dark / Light mode).
  - UN Sustainable Development Goal 4 (Quality Education) pill badge.
  - Call-to-action buttons: *"Start Free Practice"* and *"Teacher Classroom Portal"*.
  - Feature highlight cards explaining Adaptive Engine, Socratic AI Tutor, and Growth Reports.

---

### Screenshot 2: Unified Authentication Portal
- **File**: [`docs/screenshots/02_auth_portal.png`](../docs/screenshots/02_auth_portal.png)
- **Route**: `http://localhost:5173/login`
- **Purpose**: Provides a low-friction, secure login interface designed for young middle school learners.
- **Key UI Elements**:
  - Split-screen design with illustrated branding on the left and form on the right.
  - Student Roll Number & 4-Digit PIN input fields.
  - Interactive password visibility toggle.
  - Demo Quick-Switch buttons (Demo Student / Demo Teacher) for instant reviewer access.

---

### Screenshot 3: Subject & Diagnostic Selection
- **File**: [`docs/screenshots/03_subject_selection.png`](../docs/screenshots/03_subject_selection.png)
- **Route**: `http://localhost:5173/select?demo=student`
- **Purpose**: Allows enrolled students to select their focus subject and initiate diagnostic baseline tests.
- **Key UI Elements**:
  - Interactive cards for **Grade 7 Mathematics** and **General Science**.
  - Curriculum topic badges (Fractions, Algebra, Photosynthesis, Kinematics).
  - *"Start Diagnostic Pre-Test"* trigger with estimated completion time (15 mins).

---

### Screenshot 4: Student Learning Dashboard
- **File**: [`docs/screenshots/04_student_dashboard.png`](../docs/screenshots/04_student_dashboard.png)
- **Route**: `http://localhost:5173/dashboard?demo=student`
- **Purpose**: Central hub for students to inspect their mastery scores, streaks, and practice recommendations.
- **Key UI Elements**:
  - Overall Subject Mastery Progress Bar (BKT-calibrated percentage).
  - Leitner Spaced Repetition Due Card (identifying overdue reviews).
  - "Weak Topics Alert" dynamically tagging skills scoring $<60\%$.
  - Quick action buttons to launch immediate adaptive practice batches.

---

### Screenshot 5: Adaptive Practice Interface
- **File**: [`docs/screenshots/05_adaptive_practice.png`](../docs/screenshots/05_adaptive_practice.png)
- **Route**: `http://localhost:5173/practice?demo=student`
- **Purpose**: Core adaptive questioning environment where difficulty dynamically promotes or demotes based on performance.
- **Key UI Elements**:
  - KaTeX LaTeX mathematical equation rendering for complex formulas.
  - Real-time difficulty badge (`EASY`, `MEDIUM`, `HARD`).
  - Answer streak counter tracking progress toward difficulty escalation.
  - Immediate pedagogical feedback modal on errors showing step-by-step solutions.

---

### Screenshot 6: AI Tutor 3.0 Socratic Chat
- **File**: [`docs/screenshots/06_ai_tutor_chat.png`](../docs/screenshots/06_ai_tutor_chat.png)
- **Route**: `http://localhost:5173/ai-tutor?demo=student`
- **Purpose**: Real-time multi-model Socratic assistant delivering token-by-token guided explanations without revealing answers.
- **Key UI Elements**:
  - **Model Selector Dropdown**: Toggles between `AUTO (Recommended)` and configured manual models.
  - **6 Pedagogy Mode Tabs**: `Explain`, `Socratic`, `Step-by-Step`, `Exam Prep`, `Debug Code`, and `Intuition/Conceptual`.
  - Real-time streaming response with blinking cursor animation.
  - Action buttons: *"Stop Generating"*, *"Copy Message"*, *"New Chat"*, and *"Clear"*.
  - Response metadata pill displaying actual model (`gemini-3.8-flash`), provider, and latency in milliseconds.

---

### Screenshot 7: AI Learning Hub
- **File**: [`docs/screenshots/07_ai_learning_hub.png`](../docs/screenshots/07_ai_learning_hub.png)
- **Route**: `http://localhost:5173/ai-hub?demo=teacher`
- **Purpose**: Teacher and student command center for Generative AI capabilities.
- **Key UI Elements**:
  - 6 dedicated AI feature cards:
    1. AI Quiz Generator (creates MCQs with schema validation).
    2. AI Answer Explainer (breaks down student mistakes).
    3. Personalized Study Plan Generator.
    4. AI Practice Test Generator.
    5. Teacher Assistant (lesson plans and worksheets).
    6. Performance Insights (authoritative diagnostic analytics).
  - Live Token Usage & Estimated Cost Telemetry Card.

---

### Screenshot 8: Diagnostic Performance Analytics Hub
- **File**: [`docs/screenshots/08_performance_analytics.png`](../docs/screenshots/08_performance_analytics.png)
- **Route**: `http://localhost:5173/analytics?demo=student`
- **Purpose**: Psychometric assessment report displaying learning gains between Pre-Test and Post-Test.
- **Key UI Elements**:
  - Pre vs Post comparative radar chart across foundational STEM skills.
  - **Hake's Normalized Learning Gain ($g$)** KPI badge.
  - Time-per-question analysis identifying cognitive bottlenecks.

---

### Screenshot 9: Teacher Classroom Hub
- **File**: [`docs/screenshots/09_teacher_classroom_hub.png`](../docs/screenshots/09_teacher_classroom_hub.png)
- **Route**: `http://localhost:5173/classroom?demo=teacher`
- **Purpose**: Enables educators to manage student rosters, assign assessments, and export gradebooks.
- **Key UI Elements**:
  - Classroom cards with enrolled student counts and unique join codes.
  - Student roster preview table with PIN status indicators.
  - Export buttons for DDE-safe **Excel (XLSX)** and **CSV** gradebook downloads.

---

### Screenshot 10: Question Bank Manager
- **File**: [`docs/screenshots/10_question_bank_manager.png`](../docs/screenshots/10_question_bank_manager.png)
- **Route**: `http://localhost:5173/questions?demo=teacher`
- **Purpose**: Curates and calibrates the school's central repository of assessment items.
- **Key UI Elements**:
  - Filter by Subject (Math/Science), Topic, Difficulty, and Approval Status.
  - Empirical 1PL Rasch difficulty calibration indicator (Logits $b_i$).
  - Teacher review workflow: Preview, edit, and approve AI-generated questions before publishing.

---

### Screenshot 11: Reference STEM Library
- **File**: [`docs/screenshots/11_reference_library.png`](../docs/screenshots/11_reference_library.png)
- **Route**: `http://localhost:5173/library?demo=student`
- **Purpose**: Digital STEM study materials and formula sheets accessible to students during practice.
- **Key UI Elements**:
  - High-yield formula cards for fractions, algebra, geometry, and photosynthesis.
  - Searchable glossary with KaTeX mathematical formatting.
  - Printable revision summary sheets.

