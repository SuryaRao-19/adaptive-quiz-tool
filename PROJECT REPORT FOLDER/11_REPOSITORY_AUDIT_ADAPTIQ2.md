# 🔍 AdaptIQ 2.0 — Repository Audit & Architectural Gap Analysis
## Institutional Demonstration Edition: Asian Public School

**Date:** November 16, 2026  
**Auditor:** Senior Full-Stack Architect & Educational Technology Specialist  
**Target:** Asian Public School Live Demonstration  

---

## 1. Executive Baseline & Verification Status

| Dimension | Baseline State | Target State (Asian Public School Demo) |
| :--- | :--- | :--- |
| **Backend Test Suite** | 117 tests passing across 29 test suites (100% green) | Preserve 100% test pass rate + add multi-grade tests |
| **Frontend Production Build** | Vite v5.4.21 bundle passes with exit code 0 | Updated UI bundle passes with exit code 0 |
| **Database Architecture** | Flat single-grade (Grade 7) classroom model | Hierarchical School -> AcademicYear -> Grade (1-12) -> Section -> Subject -> Chapter -> Topic -> LearningOutcome |
| **Multi-Tenancy** | Single school implicit context | Multi-tenant school data isolation with School context |
| **Question Bank** | Math & Science (Grade 7 only, MCQ format) | Grades 1-12 (deep in 5, 7, 8, 9, 10), Math, Science, English, across MCQ, Multi-Select, Numerical, Short-Answer, Descriptive |
| **AI Tutor 3.0** | Fixed Grade 7 middle-school prompt heuristics | Grade-aware language complexity adaptation (Grades 1-12) |
| **Administration** | Teacher dashboard + basic analytics | Comprehensive School Admin Portal (Enrollment, Teachers, Subject/Section KPIs, Learning Gaps) |
| **Demo Readiness** | Ad-hoc mock student persona | Seeded Asian Public School demo dataset (150 students, 10 teachers, 10 classrooms, 3 instant personas) |

---

## 2. Component-by-Component Audit Findings

### 2.1 Backend API & Database Layer
1. **Prisma PostgreSQL Schema**:
   - Currently models `User`, `Classroom`, `Student`, `Enrollment`, `Question`, `Assessment`, `Attempt`, `AnswerEvent`, `GradebookEntry`.
   - **Gaps**: Lacks explicit `School`, `AcademicYear`, `Grade`, `Section`, `CurriculumProfile`, `Subject`, `Chapter`, `Topic`, `LearningOutcome`, `Assignment`, `StudentMastery`, and `SchoolAdministrator` tables.
   - **Remediation**: Extend schema with optional foreign keys to preserve full backward compatibility with existing tests and records while introducing the complete institutional hierarchy.
2. **Authentication & Authorization**:
   - Currently supports `STUDENT`, `TEACHER`, `PARENT`, `ADMIN` in `Role` enum.
   - PIN authentication for students (`StudentCredential`) works with bcrypt/salt and rate limiting.
   - **Gaps**: School administrators lack a specialized role view and school-level authorization scoping.
   - **Remediation**: Add `SCHOOL_ADMIN` role handling and tie access checks to `schoolId`.
3. **AI Gateway 3.0**:
   - Provider abstraction (`aiGateway.js`) with Model Router, Circuit Breaker, SSE Streaming, Fallback Manager.
   - **Gaps**: Prompts in `tutoringService.js` assume Grade 7.
   - **Remediation**: Make `tutoringService.js` grade-aware (Grade 1-4: simple words + emojis; Grade 5-8: structured conceptual explanations; Grade 9-12: rigorous proofs, formulas, and analytical inquiry).

### 2.2 Frontend Client Architecture
1. **Student Dashboard & Subject Selection**:
   - Currently hardcoded to Grade 7 Math & Science.
   - **Remediation**: Allow dynamic grade-switching and curriculum browsing for demonstration, displaying subjects appropriate to student's enrolled grade.
2. **Teacher Command Centre (`ClassroomHub.jsx`)**:
   - Currently manages individual classrooms without section or academic year context.
   - **Remediation**: Add Grade/Section management, assignment creation, and multi-grade question selection.
3. **School Administrator Dashboard**:
   - **Gaps**: Currently no institutional-level principal dashboard existed.
   - **Remediation**: Create a dedicated `SchoolAdminDashboard.jsx` featuring real aggregated statistics (enrollment by grade, teacher coverage, subject mastery, learning gap analysis, and schoolwide pre/post gains).

---

## 3. Prioritized Implementation Plan

1. **Step 1: Database Schema Extension (Prisma)**
   - Add `School`, `AcademicYear`, `Grade`, `Section`, `CurriculumProfile`, `Subject`, `Chapter`, `Topic`, `LearningOutcome`, `Assignment`, `StudentMastery`, `LearningRecommendation`, `SchoolAdministrator`.
   - Regenerate Prisma client (`npx prisma generate`). Verify all 117 existing tests pass.
2. **Step 2: Multi-Grade Curriculum & Structured Question Bank**
   - Define multi-grade curriculum schema and populate comprehensive question bank (Math, Science, English across Grades 1-12 with deep question sets in Grades 5, 7, 8, 9, 10).
3. **Step 3: Backend Services & API Controllers**
   - Create `schoolController.js`, `curriculumController.js`, `assignmentController.js`, and school-level analytics.
   - Update `tutoringService.js` for grade-aware context injection.
4. **Step 4: Frontend Dashboards & Workflows**
   - Build `SchoolAdminDashboard.jsx`.
   - Upgrade `StudentDashboard.jsx` and `ClassroomHub.jsx`.
   - Add demo switcher bar for Asian Public School (Instant 1-click switch between Admin, Teacher, and Student).
5. **Step 5: Asian Public School Demonstration Seed Script**
   - Script `seedAsianPublicSchool.js` with 150 students, 10 teachers, 10 classrooms, pre/post attempts, and mastery profiles.
6. **Step 6: End-to-End Verification & Demonstration Guide**
   - Run tests, build frontend, and produce `ASIAN_PUBLIC_SCHOOL_DEMO_GUIDE.md`.
