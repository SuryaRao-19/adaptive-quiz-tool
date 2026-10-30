# AdaptIQ — Web3Forms Email Integration Guide

## 1. Overview
This document outlines the architectural implementation, configuration, and security directives for the **Web3Forms** integration across the AdaptIQ adaptive learning platform.

Web3Forms delivers contact enquiries, pedagogical feedback, bug reports, and user registration event alerts directly into the designated AdaptIQ support mailbox using a serverless HTTP submission endpoint. It eliminates the overhead, maintenance risks, and SMTP credential exposure of traditional email backends.

* **Official Web3Forms Website**: [https://web3forms.com/](https://web3forms.com/)
* **Official API Documentation**: [https://docs.web3forms.com/](https://docs.web3forms.com/)
* **Submission API Endpoint**: `https://api.web3forms.com/submit` (HTTP POST, JSON)

---

## 2. Integrated Workflows

AdaptIQ incorporates three primary user-facing communication workflows alongside an administrative registration logger:

### A. Contact Us (`/contact` & Help Modal)
* **Target Audience**: School administrators, educators, cluster officials, and public visitors.
* **Fields**:
  * `name`: Full Name (*Required*, 2–80 characters)
  * `email`: Email Address (*Required*, validated via RFC 5322 regex)
  * `subject`: Subject (*Required*, 4–120 characters)
  * `message`: Enquiry Details (*Required*, 10–2000 characters)
* **Email Subject Line**: `[AdaptIQ] New Contact Enquiry: <Subject>`
* **Spam Safeguards**: Invisible honeypot (`botcheck`), client-side cooldown rate limiter.

### B. User Feedback (`/feedback`, `/support?tab=feedback` & Modal)
* **Target Audience**: Students, teachers, and instructional designers.
* **Fields**:
  * `category`: Feedback Type (*Required*)
    * `General feedback`
    * `Feature request`
    * `User experience`
    * `Performance`
    * `Accessibility`
  * `message`: Feedback Content (*Required*, 10–2000 characters)
  * `pageReference`: Optional Module/Screen reference (e.g., `Practice Mode`, `AI Tutor`, `Analytics Hub`)
  * `name`: Optional reporter name
  * `email`: Optional contact email for follow-up notes
* **Email Subject Line**: `[AdaptIQ] User Feedback [<Category>]`

### C. Bug Report (`/support?tab=bug`, ErrorBoundary & Question Flags)
* **Target Audience**: Active users encountering client crashes, KaTeX equation formatting anomalies, or network reconciliation issues.
* **Fields**:
  * `bugTitle`: Title (*Required*, 5–120 characters)
  * `description`: Overview (*Required*, 10–1500 characters)
  * `stepsToReproduce`: Step-by-step reproduction sequence (*Required*, 10–1500 characters)
  * `expectedBehaviour`: Intended system behavior (*Required*, max 800 characters)
  * `actualBehaviour`: Observed malfunction (*Required*, max 800 characters)
  * `includeDeviceInfo`: User-consented diagnostic metadata toggle (default: enabled)
  * `name` & `email`: Optional identifiers
* **Email Subject Line**: `[AdaptIQ] Bug Report: <BugTitle>`

---

## 3. How to Obtain and Configure Your Web3Forms Access Key

### Step 1: Obtain your Free Access Key
1. Visit [https://web3forms.com](https://web3forms.com).
2. Enter your support or team email address (e.g. `support@yourdomain.edu` or your personal testing inbox).
3. Check your email inbox. Web3Forms immediately sends an access key (UUID format, e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Activate the access key by clicking the confirmation link in the verification email if prompted.

### Step 2: Configure the Recipient Mailbox
* In Web3Forms, the recipient mailbox is bound to the email address registered during key creation.
* To change the destination mailbox, create a key with the desired email or manage custom routing rules via the Web3Forms dashboard.
* Incoming emails automatically configure the `Reply-To` header to match the user's submitted email address, enabling one-click replies from your email client.

### Step 3: Configure Environment Variables

#### Frontend Configuration (`client/.env`)
Create or edit `client/.env`:
```bash
# Web3Forms Public Access Key
VITE_WEB3FORMS_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### Backend Proxy Configuration (Optional, `server/.env`)
If routing submissions through the server-side proxy (`/api/support/submit`):
```bash
WEB3FORMS_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> **Security Note**: Never commit actual `.env` files to source control. Ensure both root `.gitignore` and `client/.gitignore` list `.env` and `.env.local`.

---

## 4. Privacy, Security & Data Protection Compliance

In alignment with **UN SDG 4** principles and school student data protection requirements:

1. **Zero Educational PII Exposure**: The forms strictly prevent transmission of student PINs, passwords, session JWT tokens, confidential classroom rosters, or assessment test solutions.
2. **Sanitization Guardrails**: The service layer (`client/src/services/web3forms.js`) explicitly purges any forbidden keys (`password`, `pin`, `token`, `jwt`, `studentPin`, etc.) before dispatch.
3. **Disclosed Diagnostic Metadata**:
   * What is collected (only when enabled by user toggle): Browser name, OS/platform, screen resolution, viewport dimensions, language, online status, current URL path.
   * What is NEVER collected: Local cookies, browser storage, auth headers, private student files.
4. **Spam Prevention**:
   * **Honeypot**: Hidden input `botcheck`. Web3Forms drops submissions with filled honeypots.
   * **Client Throttling**: A minimum 6-second cooldown window prevents automated double-clicking.
   * **Backend Proxy Rate Limiting**: The server enforces a maximum of 10 submissions per 15 minutes per IP via `express-rate-limit`.

---

## 5. Local Testing & Verification Workflow

### 1. Automated Test Suite
Run the test suite from the `server` directory:
```bash
npm test
```
Or execute the Web3Forms-specific test suite:
```bash
node --test tests/web3formsIntegration.test.js
```
The suite verifies:
* Empty submissions rejection
* RFC 5322 email format enforcement
* Character limit boundaries
* Valid submissions approval across Contact, Feedback, and Bug Report forms
* Spam honeypot rejection
* Privacy credential stripping
* Subject line formatting standards

### 2. Manual Testing in the Browser
1. Start the client application:
   ```bash
   cd client
   npm run dev
   ```
2. Navigate to `http://localhost:5173/contact`.
3. Test empty submission: verify that inline error messages appear under all required fields.
4. Test invalid email (e.g. `student@domain`): verify email validation error.
5. Add your valid `VITE_WEB3FORMS_ACCESS_KEY` to `client/.env`.
6. Submit a test Contact, Feedback, or Bug Report form.
7. Verify that the form transitions to the spinner loading state, followed by a confirmed success banner.
8. Check the registered destination email inbox to verify receipt of the formatted email.

---

## 6. Production Deployment

### Vercel / Netlify Deployment
1. Go to your Project Settings > **Environment Variables**.
2. Add:
   * **Key**: `VITE_WEB3FORMS_ACCESS_KEY`
   * **Value**: Your Web3Forms access key UUID
3. Re-deploy the application.

### Docker / Self-Hosted Gateway Deployment
Pass the environment variable during build or run:
```bash
docker run -e VITE_WEB3FORMS_ACCESS_KEY=your_key_here -p 80:80 adaptiq-frontend
```

---

## 7. Troubleshooting Guide

| Issue / Error Message | Root Cause | Remediation |
|---|---|---|
| `"Email service is currently unconfigured"` | `VITE_WEB3FORMS_ACCESS_KEY` is empty or set to placeholder. | Add your active Web3Forms key to `client/.env` and restart the Vite dev server (`npm run dev`). |
| `"Invalid Access Key"` | Key is mistyped or deactivated by Web3Forms. | Verify key from your Web3Forms setup email or request a new key at [web3forms.com](https://web3forms.com). |
| `"Please wait Xs before submitting"` | Client rate-limiting cooldown active. | Wait for the countdown to elapse before clicking submit again. |
| `"Submission rejected by spam protection"` | Hidden honeypot field was populated. | Clear browser auto-fill extensions that populate hidden inputs. |
| `"Network error communicating with email service"` | Device is offline or Web3Forms API is blocked by firewall. | Verify internet connectivity. In offline classroom deployments, submissions are queued or logged locally. |
| Test email not showing in mailbox | Filtered into Spam/Junk folder. | Check Spam/Junk folder and mark `delivery@web3forms.com` as "Not Spam". |
