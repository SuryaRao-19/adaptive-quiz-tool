# Gateway Synchronization & Event Idempotency Protocol

## 1. Overview
The AdaptIQ Gateway Synchronization protocol synchronizes assessment attempts recorded in offline classrooms to the central database without data duplication or loss.

## 2. Event Model
Each offline attempt produces a cryptographically randomized or timestamp-seeded `eventId`:
```json
{
  "eventId": "evt_172900000_abc123",
  "userId": "660c1f2e8b4e72001a1e2f34",
  "questionId": "660c1f2e8b4e72001a1e2f35",
  "mode": "practice",
  "isCorrect": true,
  "difficulty": "medium",
  "subject": "Math",
  "topic": "Fractions",
  "timeTaken": 18
}
```

## 3. Reconciliation Algorithm (`POST /api/gateway/reconcile`)
1. **Idempotency Verification**:
   - Queries `Attempt.findOne({ eventId })`.
   - If present, event is acknowledged as duplicate (`duplicateCount++`) with no state mutation.
2. **Student & Question Validation**:
   - Verifies the student identity.
   - If unrecognized or unapproved, event is placed into `QuarantinedAttempt` for teacher review.
3. **Database Insertion**:
   - Atomic insert into `Attempt` collection with unique index guard on `eventId`.
4. **Response Contract**:
   ```json
   {
     "success": true,
     "gatewayId": "classroom_gateway_local",
     "totalReceived": 25,
     "processedCount": 23,
     "duplicateCount": 2,
     "quarantinedCount": 0
   }
   ```
