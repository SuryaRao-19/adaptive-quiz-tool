# Student Credentials & Authorization Architecture

## 1. Authentication Model
AdaptIQ employs a low-friction, high-security authentication model tailored for primary and secondary school environments:
- **Identifier**: Student Roll Number (unique within school/district scope).
- **Secret**: 4-Digit Numeric PIN (e.g., `0429`).

## 2. Credential Security Directives
1. **Cryptographic Randomness**:
   - `crypto.randomInt` from Node.js standard library is utilized.
   - `Math.random()` is strictly prohibited for any authentication credential.
2. **Persistent Storage**:
   - PINs are hashed using Bcrypt with an established cost factor of 10.
   - The User collection never stores plaintext PINs.
3. **API Information Leakage Prevention**:
   - Standard queries (`User.find`, `Class.find`) exclude the `pin` field (`select: false`).
   - The transient plaintext PIN is returned **only once** in the response of the teacher-authorized `importRoster` action.
4. **Transport & Scope Enforcements**:
   - Teachers can only import or reset credentials for classrooms they explicitly own (`teacherId === req.user._id`).
   - Cross-class credential access is rejected at the route middleware layer.
