# AdaptIQ Test Strategy & Verification Architecture

## 1. Automated Testing Architecture
Testing is organized around autonomous TDD and zero-regression verification (Ralph Loop & GSD Core directives).

### 1.1 Node.js Native Test Runner
The backend leverages the Node.js native test runner (`node --test`), eliminating heavyweight testing dependencies while delivering ultra-fast execution (~110ms execution time).

### 1.2 Test Suites Executed:
1. **`server/tests/adaptiveEngine.test.js`**:
   - BKT parameter bounds verification.
   - Posterior mastery probability updates (correct response increases probability, incorrect response decreases probability).
   - Boundary condition stability (handles 0, 1, and negative values without `NaN` or `Infinity`).
   - Leitner 5-box spaced repetition promotion and demotion.
   - Overdue review scheduling detection.
   - Adaptive difficulty promotion (3 consecutive correct) and demotion (2 consecutive incorrect).
   - Legacy `calculateNextDifficulty` backward compatibility.

2. **`server/tests/assessmentIntegrity.test.js`**:
   - `eventId` deduplication preventing duplicate event processing.
   - Server-authoritative Socratic AI tutor lockdown during active summative assessments.
   - Confidence-based marking matrix evaluation.
   - 50-practice question threshold validation before unlocking post-test.

3. **`server/tests/securityAndValidation.test.js`**:
   - 4-digit numeric PIN format strictness.
   - Roll number sanitization and trimming.
   - AI chat prompt truncation and payload flooding protection.
   - Fatal rejection of silent in-memory database fallback in production environments.

## 2. Frontend Production Verification
The Vite production bundle is verified via `npm run build` in `client/`:
- Transpiles 2994 modules.
- Generates split chunks for vendor icons, Framer Motion, React, Recharts, and KaTeX webfonts.
- Compiles with **exit code 0** and zero CSS or syntax warnings.
