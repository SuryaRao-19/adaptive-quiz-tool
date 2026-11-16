# 🛠️ AdaptIQ — Implementation Challenges & Engineering Resolutions

This document provides a detailed case-study analysis of the 6 core technical challenges encountered while engineering AdaptIQ, the diagnostic methodologies used to isolate root causes, and the concrete code changes deployed.

---

## Challenge 1: The 15-Second Request Timeout Trap

### Problem Description
During early testing of the AI Tutor Chat and AI Quiz Generator, requests frequently crashed on the browser side with:
`AxiosError: timeout of 15000ms exceeded`
This occurred most severely when generating multi-question quizzes or detailed Socratic explanations over slower networks.

### Root-Cause Diagnosis
An exhaustive audit of the codebase revealed a **double-timeout trap**:
1. **Frontend**: In `client/src/services/api.js`, the Axios instance had a rigid hardcoded timeout:
   ```javascript
   // BEFORE: client/src/services/api.js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
     timeout: 15000 // ❌ Hardcoded 15-second browser abort
   });
   ```
2. **Backend**: In `server/services/gemini/geminiClient.js`, the backend enforced an identical 15s race:
   ```javascript
   // BEFORE: server/services/gemini/geminiClient.js
   const timeoutPromise = new Promise((_, reject) => {
     setTimeout(() => reject(new Error(`Timed out after 15000ms`)), 15000); // ❌
   });
   const response = await Promise.race([apiCallPromise, timeoutPromise]);
   ```
3. **Unary Blocking Protocol**: The chat controller used a synchronous blocking `fetch()` call. The user had to wait for the entire 800-word response to be generated before a single character was displayed.

### Engineering Resolution
1. **Raised Frontend Axios Timeout**: Increased default timeout to `60000ms` (1 minute).
2. **Server-Sent Events (SSE) Streaming**: Created `SSEStreamSession` (`server/services/ai/streaming/sseHandler.js`) returning chunks token-by-token.
3. **Granular Timeout Lifecycle**: Separated connection (10s), first-token (20s), idle-stream (20s), and max generation duration (120s).
4. **Heartbeat Pings**: Configured 15-second `: ping\n\n` comments to keep NGINX and browser reverse proxies alive.

#### After Code Diff:
```javascript
// AFTER: client/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000 // 60s default timeout to prevent premature aborts on complex AI generation
});

// AFTER: server/services/ai/streaming/sseHandler.js
this.heartbeatTimer = setInterval(() => {
  if (!this.isClosed) {
    this.res.write(': ping\n\n'); // Keeps reverse proxy connection alive
    if (typeof this.res.flush === 'function') this.res.flush();
  }
}, 15000);
```

---

## Challenge 2: Google Gemini Model Deprecation (404) & Regional 503 Spikes

### Problem Description
1. Early test runs using `gemini-2.5-flash` failed with `404 NOT_FOUND` because Google deprecated early preview checkpoints for newly issued API keys.
2. During high-traffic periods, the Google Gemini API returned `HTTP 503 UNAVAILABLE` with the message *"The model is overloaded. Please try again later."*

### Engineering Resolution
1. **Production Flagship Pinning**: Updated default model to `gemini-3.8-flash` in `server/.env` and `modelRegistry.js`.
2. **Pre-Stream Fallback Cascade**: Built an automated fallback engine in `fallbackManager.js` that catches 503/404 errors *before* token streaming commences and silently cascades to the next eligible model:
   - Primary: `gemini-3.8-flash`
   - Fallback 1: `gemini-2.0-flash`
   - Fallback 2: `gemini-1.5-flash`
   - Secondary Providers: OpenAI (`gpt-4o-mini`) or local Ollama.

#### Implementation Snippet:
```javascript
// server/services/ai/gateway/fallbackManager.js
for (let i = 0; i < modelChain.length; i++) {
  const currentModelId = modelChain[i];
  try {
    const result = await executor({ model: currentModelId, provider });
    return { ...result, actualModel: currentModelId, fallbackActivated: i > 0 };
  } catch (err) {
    const errorClass = this.classifyError(err);
    if (errorClass === ERROR_CLASSES.AUTH_ERROR || errorClass === ERROR_CLASSES.SAFETY_BLOCK) {
      throw err; // Never retry auth or safety violations
    }
    // Retry or continue cascade on 503 / 429
  }
}
```

---

## Challenge 3: Academic Dishonesty During Live Summative Exams

### Problem Description
During live testing, students could open the AI Tutor Chat in another browser tab and paste exam questions to receive direct solutions during their official summative Post-Test.

### Engineering Resolution
Implemented a server-authoritative **Academic Integrity Lock** in `server/services/ai/gateway/aiGateway.js`. The server queries the authoritative database for any `post_test` attempt created in the past 60 minutes:

```javascript
// server/services/ai/gateway/aiGateway.js
async isStudentInTestMode(userId) {
  try {
    if (!userId) return false;
    const recentTest = await QuizAttempt.findOne({
      studentId: userId,
      quizType: 'post_test',
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });
    return Boolean(recentTest);
  } catch (e) {
    return false;
  }
}
```
If active, the AI stream immediately returns:
> *"AI Tutor is disabled during Test Mode to uphold academic integrity. Complete your test first, then review concepts together!"*

---

## Challenge 4: Low-Entropy Student PIN Security in Rural Classrooms

### Problem Description
Primary/middle school students (Grades 6–8) in resource-constrained schools cannot memorize 16-character alphanumeric passwords. However, 4-digit numeric PINs only have 10,000 possibilities ($0000$ to $9999$), making them vulnerable to automated brute-force attacks.

### Engineering Resolution
Implemented a three-tier defense model:
1. **Classroom Join-Code Scoping**: PINs are never global; they are validated only within a specific teacher's enrolled classroom.
2. **Cryptographic Salting**: PINs are hashed using 10-round salted `bcryptjs` before storage.
3. **Throttling & Account Lockout**:
   - `express-rate-limit` caps login attempts to 5 requests per IP per minute.
   - 5 consecutive failed attempts locks the student account for 15 minutes (`lockedUntil = Date.now() + 15 * 60 * 1000`).

---

## Challenge 5: Spreadsheet Formula Injection (CSV DDE Attacks)

### Problem Description
When teachers export classroom rosters and gradebooks to CSV files, a student could set their name or answer to `=cmd|' /C calc'!A0` or `-2+3+cmd|...`. Opening this CSV in Microsoft Excel executes arbitrary shell commands on the teacher's computer (Dynamic Data Exchange attack).

### Engineering Resolution
Engineered strict formula sanitization in `server/utils/gradebookExporter.js`:
```javascript
// server/utils/gradebookExporter.js
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // If cell starts with formula trigger characters (=, +, -, @, \t, \r), escape with leading quote
  if (/^[=\+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  // Wrap student roll numbers in ="007" formula to preserve leading zeros in Excel
  if (/^0\d+$/.test(str)) {
    return `="${str}"`;
  }
  return str.replace(/"/g, '""');
}
```

---

## Challenge 6: Dual-Database Resilience (PostgreSQL + MongoDB Fallback)

### Problem Description
In local development, automated CI/CD pipelines, or lightweight school server setups, the Docker daemon running PostgreSQL may be stopped, causing immediate database connection errors that crashed the Express server at startup.

### Engineering Resolution
Engineered a **Safe Proxy Pattern** in `server/config/prisma.js` with an automated fallback to MongoDB Atlas or an in-memory store:
1. The server performs a 2,000ms healthcheck ping on PostgreSQL (`SELECT 1 as ping`).
2. If PostgreSQL is reachable, queries execute via Prisma with ACID transactions.
3. If PostgreSQL is unreachable, the proxy transparently routes queries to MongoDB Atlas (Mongoose) or the in-memory mock store without throwing unhandled promise rejections or crashing the server.

