# Classroom Operations — One-Click Roster Import & Desk Cards

## 1. Overview
The AdaptIQ Roster Import module allows teachers to onboard 40–60+ students in a single controlled operation directly from `ClassroomHub.jsx`.

## 2. File Format Specifications
Accepted formats: **CSV** (Comma-Separated Values).

### Expected Headers
```csv
student_name,roll_number
Aarav Patel,001
Diya Sharma,002
Vivaan Rao,003
```
*Aliases supported: `name`, `studentName`, `rollNumber`.*

### Normalization & Leading Zero Preservation
- Roll numbers are strictly preserved as strings (e.g. `'001'`).
- The parser prevents numeric coercions that would strip leading zeros.
- Pre-submission client-side validation detects internal duplicates, malformed rows, and empty fields before data hits the server.

---

## 3. Cryptographic Credential Generation
For each new student record:
- PINs are generated using `crypto.randomInt(0, 10000).toString().padStart(4, '0')`.
- PINs are strictly 4-digit numeric strings (e.g. `'0429'`).
- Plaintext PINs are Bcrypt-hashed (`saltRounds = 10`) before database persistence.
- Plaintext PINs are returned **only once** in the initial import response payload to enable desk card rendering and are never stored or exposed via standard student list APIs.

---

## 4. Printable Desk Cards
Teachers can immediately preview and print desk cards formatted in a high-contrast, black-and-white print-optimized layout (`@media print`):
- Student Name & Grade
- Roll Number
- 4-Digit Initial Login PIN
- Security Warning: *"Cards must be cut individually and stored securely. Plaintext credentials are not retained in application memory."*
