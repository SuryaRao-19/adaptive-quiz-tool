# AdaptIQ Application Security & Data Governance Review

## 1. Authentication & Session Management
- **Roll Number + 4-Digit PIN**: Specifically designed for students without email addresses.
- **PIN Hashing**: PINs are hashed using bcrypt with salt rounds (\(\ge 10\)) before storage. Plaintext PINs are never persisted or logged.
- **Rate Limiting**: `express-rate-limit` enforces strict throttling on `/api/auth/login` to prevent brute-force attacks on 4-digit PIN permutations.
- **Generic Error Responses**: Authentication failures return standardized messages to prevent account enumeration.

## 2. Server-Authoritative Integrity
- Assessment scoring and progress mutations are calculated strictly server-side.
- The Socratic AI tutor endpoint (`POST /api/chat`) verifies against the database whether the requesting user has an active summative assessment attempt (`quizType: 'post_test'`) created within the last 60 minutes. If active, AI access is rejected with HTTP 403 Forbidden.
- Question submissions are protected by unique `eventId` indexing to prevent replay attacks and score inflation.

## 3. Database Environment Isolation
- `server/config/db.js` enforces a strict environment guard: if `NODE_ENV === 'production'` and the primary MongoDB connection fails, the process throws a fatal operational error.
- Silent fallback to `MongoMemoryServer` is strictly prohibited in production to eliminate ephemeral data loss risks.

## 4. API & Input Sanitization
- All AI chat user messages are sanitized and truncated to 1,000 characters to prevent prompt injection payload flooding.
- MongoDB queries use strongly typed parameters to prevent NoSQL query operator injection (`$gt`, `$where`).
- Content Security Policy (CSP) and HTTP security headers are enforced via `helmet`.

## 5. Child Privacy & Data Governance (UN SDG 4 Compliance)
- Personal identifiable information (PII) is minimized. Student accounts require no email, phone number, or external social identity.
- Analytics records store educational telemetry (competency mastery, timestamps, attempt counts) without tracking sensitive behavioral tracking data.
