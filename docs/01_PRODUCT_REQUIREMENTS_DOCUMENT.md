# Document 1: Product Requirements Document (PRD)

## 1. Problem Statement
In government and under-resourced schools, students frequently carry foundational gaps in Mathematics and Science that go undetected and unaddressed. In typical classrooms of 40–60+ students per teacher:
- **The Compounding Deficit:** If a 7th-grade student fails to understand basic fractional division or atomic structure, the curriculum advances regardless. Future concepts (like algebraic equations or chemical bonding) build directly upon these fragile foundations, resulting in chronic academic underperformance, disengagement, and high dropout rates.
- **Lack of Differentiation:** Worksheets, homework sets, and paper tests are identical for every child. High-performing students face boredom and stagnation, while struggling students face chronic confusion, anxiety, and public embarrassment.
- **Teacher Bottleneck:** Instructors lack digital diagnostic tools. Grading 50 manual diagnostic papers takes hours of non-instructional administrative time, making real-time topic-level diagnosis impossible.

There is a clear need for a simple, low-cost, accessible digital tool that can assess a student's current knowledge, pinpoint exactly where they are weak, and serve them practice questions matched to their actual learning level — without requiring expensive infrastructure, high-end devices, or specialized training to use.

---

## 2. Target Users & Operating Constraints

### Primary Persona: The Student
- **Demographics:** Approximately ages 10–16, grades 5–10, studying Math and/or Science in government or low-resource schools.
- **Tech Comfort:** Low to moderate. Many students use shared computers, low-spec devices, or have intermittent internet access.
- **Motivations:** Pass exams, understand confusing topics, avoid falling further behind their peers.
- **Frustrations:** Generic worksheets that don't match their level, no one available to explain mistakes, embarrassment about asking for help repeatedly.

### Secondary Persona: Teachers / School Admins (v1.1)
- **Context:** Managing large classes with limited one-on-one time; need a quick way to see which students and topics need attention.
- **Requirements:** Low tolerance for complex tools — any dashboard must be usable with minimal training.

---

## 3. Product Vision
> *"A simple web-based tool that meets every student exactly where they are — automatically finding their weak spots in Math and Science, and giving them the right practice at the right difficulty, so learning gaps get smaller instead of bigger."*

---

## 4. Core Features & Prioritization Matrix

| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-01** | **Student Registration/Login** | Simple signup (name, grade, subject) and login using Roll Number + 4-digit PIN so progress can be saved per student without requiring email addresses. | **Must-Have** |
| **FEAT-02** | **Pre-Test / Diagnostic Assessment** | A baseline quiz per subject that establishes the student's current level across topics before any practice begins. | **Must-Have** |
| **FEAT-03** | **Topic-wise Question Bank** | Questions tagged by subject (Math/Science), topic (e.g., Fractions, Photosynthesis), and difficulty level (Easy/Medium/Hard). | **Must-Have** |
| **FEAT-04** | **Adaptive Question Engine** | Adjusts difficulty in real time based on student answers — gets harder after streaks of correct answers, easier after repeated mistakes. | **Must-Have** |
| **FEAT-05** | **Instant Feedback & Explanations** | Immediately shows correct/incorrect after each answer, with a plain-language explanation of the right answer. | **Must-Have** |
| **FEAT-06** | **Weak Topic Identification** | After a quiz, the system flags which topics the student is weakest in (<60% accuracy). | **Must-Have** |
| **FEAT-07** | **Personalized Practice Recommendations** | Suggests specific topics/question sets to practice next, based on weak areas. | **Must-Have** |
| **FEAT-08** | **Progress Tracking Dashboard (Student)** | Shows the student their scores over time, topics mastered, and topics still weak. | **Must-Have** |
| **FEAT-09** | **Post-Test & Improvement Report** | A follow-up test after a practice period, compared against the pre-test to show measurable improvement. | **Must-Have** |
| **FEAT-10** | **Teacher/Admin Dashboard** | View of all students' progress and weak topics in one place. | **Nice-to-Have (v1.1)** |
| **FEAT-11** | **Gamification** | Badges, streaks, and leaderboards as motivational elements to encourage continued use. | **Nice-to-Have (Deferred)** |
| **FEAT-12** | **Multi-language Support** | Interface and questions available in local languages. | **Nice-to-Have (Deferred)** |
| **FEAT-13** | **Offline Mode** | Ability to use the tool without a consistent internet connection. | **Nice-to-Have (Deferred)** |

---

## 5. App Flow
Step-by-step journey a student takes from first login through measured improvement:
1. **Landing / Login:** Student opens the app, signs up or logs in with name, grade, roll number, and 4-digit PIN.
2. **Subject Selection:** Student picks Math or Science.
3. **Pre-Test:** If it's the student's first time on that subject, they take a diagnostic pre-test covering multiple topics at mixed difficulty (15 questions).
4. **Result Summary:** System shows the student's baseline score and flags weak topics (`Needs Focus`).
5. **Practice Mode:** Student enters practice mode; the adaptive engine serves questions from weak topics first, adjusting difficulty as they answer.
6. **Instant Feedback Loop:** After every question: correct/incorrect shown immediately, with explanation if wrong.
7. **Progress Dashboard:** Student can check their dashboard anytime to see scores, streaks, and topics improved vs. still weak.
8. **Post-Test:** After completing at least 50 practice questions, the student takes a post-test on the same topics.
9. **Improvement Report:** System compares pre-test vs. post-test scores and shows the student (and optionally the teacher) measurable improvement per topic.

---

## 6. Success Metrics
- **Score Improvement:** Average percentage increase from pre-test to post-test, per topic and overall ($\ge 20\%$ target).
- **Weak-Topic Reduction Rate:** Percentage of originally flagged weak topics that move to "mastered" status ($\ge 65\%$ target).
- **Engagement:** Number of practice questions attempted per student per week ($\ge 30$ target).
- **Retention:** Percentage of students who return to practice more than once.
- **Feedback Effectiveness:** Percentage of students who answer a previously missed question type correctly after seeing the explanation ($\ge 70\%$).

---

## 7. Out of Scope for v1
Explicitly not being built in this version, to keep the team focused on the core diagnostic-and-practice loop:
- ✕ **No gamification (badges, points, leaderboards):** v1 stays focused on the core diagnostic/practice loop.
- ✕ **No multi-language support:** English only for v1.
- ✕ **No offline mode:** requires an internet connection (lightweight data usage).
- ✕ **No mobile app (iOS/Android):** web-only, mobile-responsive design instead.
- ✕ **No parent-facing dashboard:** student and simple teacher views only.
- ✕ **No AI-generated questions:** question bank is pre-authored and curated, not dynamically generated at runtime.
- ✕ **No payment or subscription system:** this is a free community tool.
- ✕ **No integration with school management systems (SIS) or third-party LMS platforms.**
