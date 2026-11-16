# 📂 AdaptIQ — Project Report & Submission Folder (Master Guide)

Welcome to the **AdaptIQ Project Report Folder**. This folder contains all the documentation, technical specifications, algorithms, mathematical formulations, code snippets, PPT presentation slides, architecture diagrams, screenshot walkthroughs, **visual code snippet cards**, and the **compiled PDF report** required for your project submission, report file, and viva/presentation.

---

## 📑 Contents of This Folder

| File / Folder Name | Purpose / Description | Best Used For |
| :--- | :--- | :--- |
| 🌟 [**`AdaptIQ_Complete_Project_Report.pdf`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/AdaptIQ_Complete_Project_Report.pdf) | **Ready-to-Submit Compiled PDF Report (3.17 MB)**<br>Fully rendered academic project report with cover page, Table of Contents, LaTeX mathematical equations, syntax-highlighted code cards, architectural diagrams, and all 11 live embedded high-res screenshots. | **Direct PDF Submission**, Evaluation, Printout |
| 📁 [**`screenshots/`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/screenshots/) | **Complete Visual Artifacts Directory**<br>Contains two sub-folders:<br>&bull; **`code/`**: 10 high-resolution dark-mode code snippet cards (PNG).<br>&bull; **`ui/`**: 11 live running application screenshots (PNG). | Visual assets, PPT slides, report figures |
| 🏫 [**`12_ASIAN_PUBLIC_SCHOOL_DEMO_GUIDE.md`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/12_ASIAN_PUBLIC_SCHOOL_DEMO_GUIDE.md) | **Asian Public School (APS) Institutional Demonstration Guide**<br>Step-by-step 30-minute institutional demonstration script, Principal Dr. Raman KPI walkthrough, Teacher command center, student grade-switching, and Socratic AI Tutor verification. | **Live School Pitch**, Executive Demo, Institutional Onboarding |
| 🔍 [**`11_REPOSITORY_AUDIT_ADAPTIQ2.md`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/11_REPOSITORY_AUDIT_ADAPTIQ2.md) | **AdaptIQ 2.0 Repository Audit & Institutional Roadmap**<br>Comprehensive technical audit of all subsystems, multi-grade database restructuring, CBSE curriculum hierarchy, AI Tutor scaffolding, and 12-phase execution plan. | Technical Architecture Review, System Audit |
| 📋 [**`10_PROJECT_SUMMARY_PROMPT.md`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/10_PROJECT_SUMMARY_PROMPT.md) | **Master Project Summary for AI Prompts & LLM Context**<br>Pre-formatted copy-paste prompt blocks: Full Context Injection Prompt, 60-Second Viva Pitch, and Code Continuation System Prompt. | **Prompting AI**, LLM bootstrapping, Viva pitch |
| 🧠 [**`09_KEY_MODULES_ALGORITHMS_AND_CHALLENGES.md`**](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/PROJECR%20REPORT%20FOLDER/09_KEY_MODULES_ALGORITHMS_AND_CHALLENGES.md) | **Architecture, Key Modules & Challenges Deep Dive**<br>Comprehensive technical explanation of how the solution was built, breakdown of all modules (AI Gateway, Psychometrics, Streaming, Security), 8 algorithms with formulas and code, Mermaid diagrams, and in-depth resolution of the 6 major engineering hurdles. | **Viva Defense Prep**, In-depth Faculty Technical Review |
| **`01_PROJECT_REPORT_COMPLETE.md`** | **Master Academic Project Report**<br>Comprehensive 10-chapter report covering Abstract, Introduction, Tech Stack, Architecture, 6 Core Algorithms with Formulas, Implementation, Challenges & Resolutions, Testing, and Future Work. | Academic Report submission, Word doc conversion |
| **`02_PRINTABLE_REPORT_AND_PDF.html`** | **Self-Contained HTML Report with Base64 Images**<br>Pre-styled HTML document with academic formatting, clean typography, tables, KaTeX math cards, syntax-highlighted code, and Base64-embedded screenshots. Includes one-click Print button. | Re-printing / customized PDF export via Chrome/Edge |
| **`03_PRESENTATION_SLIDES_FOR_PPT.md`** | **Complete 14-Slide PPT Presentation Deck**<br>Slide-by-slide titles, structured bullet points, speaker notes, visual suggestions, and anticipated faculty Q&A answers. | PowerPoint presentation, Canva slides, Viva defense |
| **`04_ALGORITHMS_AND_MATHEMATICAL_MODELS.md`** | **Algorithms & Mathematical Formulations**<br>Deep dive into BKT, Rasch 1PL IRT, Leitner Spaced Repetition, Adaptive Difficulty, Hake's Normalized Gain, and Jaccard Deduplication with full formulas and code snippets. | Technical evaluation, algorithm section in report |
| **`05_SYSTEM_ARCHITECTURE_AND_DIAGRAMS.md`** | **System Architecture & Design Diagrams**<br>Mermaid flowcharts, sequence diagrams, assessment lifecycles, and data-flow diagrams. | Architecture slides, report diagrams |
| **`06_CHALLENGES_FACED_AND_RESOLUTIONS.md`** | **Implementation Challenges & Solutions**<br>Deep dive into the 6 major engineering hurdles (15s timeout fix, Gemini 503 fallback, student PIN security, exam integrity locks, CSV injection defense, dual DB). | Viva Q&A, Project challenges section |
| **`07_DEPLOYMENT_AND_EXECUTION_GUIDE.md`** | **Deployment & Setup Guide**<br>Local development, Docker Compose setup, Cloud SaaS deployment (Vercel + Railway/Render + Neon + MongoDB), and Rural Offline Classroom Gateway. | Deployment slide, examiner walkthrough |
| **`08_SCREENSHOT_CATALOG_AND_WALKTHROUGH.md`** | **Live Screenshots & UI Catalog**<br>Detailed breakdown of all 11 captured high-resolution project screenshots covering both Student and Teacher workflows. | Report figures, PPT UI slides |

---

## 📸 Screenshots Directory Structure

```text
screenshots/
├── code/                              <-- 10 High-Resolution Code Snippet Cards (PNG)
│   ├── 01_bkt_mastery_engine.png
│   ├── 02_rasch_1pl_calibration.png
│   ├── 03_unified_adaptive_stepping.png
│   ├── 04_leitner_spaced_repetition.png
│   ├── 05_sse_streaming_gateway.png
│   ├── 06_circuit_breaker_health.png
│   ├── 07_deterministic_intent_router.png
│   ├── 08_socratic_pedagogy_guardrails.png
│   ├── 09_dde_csv_injection_sanitizer.png
│   └── 10_hake_normalized_gain.png
│
└── ui/                                <-- 11 Live Running Application Screenshots (PNG)
    ├── 01_landing_hero.png
    ├── 02_auth_portal.png
    ├── 03_subject_selection.png
    ├── 04_student_dashboard.png
    ├── 05_adaptive_practice.png
    ├── 06_ai_tutor_chat.png
    ├── 07_ai_learning_hub.png
    ├── 08_performance_analytics.png
    ├── 09_teacher_classroom_hub.png
    ├── 10_question_bank_manager.png
    └── 11_reference_library.png
```

---

## 🖨️ PDF Generation & Access
- The pre-compiled PDF is available right now: **`AdaptIQ_Complete_Project_Report.pdf`** (3.17 MB).
- To re-generate or print on demand:
  1. Open **`02_PRINTABLE_REPORT_AND_PDF.html`** in **Google Chrome** or **Microsoft Edge**.
  2. Press **`Ctrl + P`** (or click the blue **"Print Report / Save as PDF"** button at the top).
  3. In Destination, select **"Save as PDF"**, check **"Background graphics"**, and click **Save**.
