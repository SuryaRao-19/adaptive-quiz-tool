# Document 3: Security, Access & Edge Cases Document

## 1. Authentication Method: School Roll Number + PIN
For government and low-resource secondary school students, conventional email-based authentication fails because young students rarely possess personal email accounts, and creating them poses digital identity and safety issues.

### Architecture
- **Login Identifier:** School Roll Number (e.g. `G7-01`, `2026-MATH-12`).
- **Secret:** 4-digit numeric PIN (e.g. `4812`).
- **Security:** PINs are hashed using **Bcrypt (cost factor 10)** with salt prior to saving in MongoDB. Plaintext PINs are never persisted or logged.
- **Session:** Stateless JSON Web Token (JWT) stored securely in client browser `localStorage`.

---

## 2. User Roles & Permission Matrix

| Capability / Action | Student | Teacher / Admin |
| :--- | :---: | :---: |
| Register / Login with Roll Number + PIN | ✅ Yes | ✅ Yes |
| Take Pre-Test & Post-Test | ✅ Yes | ❌ No |
| Practice Adaptive Questions | ✅ Yes | ❌ No |
| View Own Dashboard, Scores & Improvement Report | ✅ Yes | ✅ Yes |
| View Other Students' Scores or Progress | ❌ **No** | ✅ Yes |
| View Class Roster & Cohort Weak Topics | ❌ **No** | ✅ Yes |
| Create, Edit, or Seed Questions | ❌ **No** | ✅ Yes |
| Access Raw Question Answers Prior to Submission | ❌ **No** | ❌ No (API-enforced) |

---

## 3. Row-Level Data Isolation (Privacy by Design)
To prevent unauthorized access between students sharing computers:
- **No Client-Supplied IDs:** API endpoints do not accept client-controlled query parameters like `?studentId=xyz`.
- **JWT Identity Extraction:** The server extracts student identity strictly from the verified JWT payload (`req.user.id`).
- **Strict Query Scoping:** Every database query for `QuizAttempt` and `ProgressTracking` enforces `{ studentId: req.user.id }`.

---

## 4. Error Handling Protocols

1. **Failed Login:**
   - Server returns `401 Unauthorized` with a generic message: `"Invalid Roll Number or PIN."` to prevent user account enumeration.
2. **Empty / Incomplete Submissions:**
   - Server validates answer array schema. If empty, returns `400 Bad Request` with `"Answers are required."`
3. **Mid-Quiz Network Disconnections:**
   - Client persists current question index and completed answers to browser `localStorage`.
   - On reconnect, student can resume exactly where they left off without losing answered items.
4. **Malformed Question Data:**
   - Backend verifies that all served questions contain exactly 4 options and valid fields. Frontend implements graceful error fallback with a "Skip Question" button that doesn't penalize the student.

---

## 5. Critical Edge Cases & Failsafes

- **Browser Closed Mid-Quiz:**
  - Local state cached in `localStorage` allows automatic restoration within 24 hours.
- **Duplicate Submissions:**
  - Buttons are disabled immediately upon click (`isSubmitting = true`), and the backend deduplicates submissions with identical timestamps.
- **Retaking Diagnostic Pre-Test:**
  - Once a Pre-Test is submitted for a subject, the backend flags `hasCompletedPreTest: true`. Subsequent requests to `/api/quiz/pre-test` return `403 Forbidden`.
- **Question Pool Depletion:**
  - If a student exhausts all questions in a specific difficulty level, the adaptive engine automatically selects from adjacent levels (`medium` $\rightarrow$ `easy` $\rightarrow$ `hard`) to prevent errors.
