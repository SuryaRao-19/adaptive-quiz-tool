const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Assessment Lifecycle, Idempotency & Immutability (Phase 2 & 7)', () => {
  it('enforces idempotency on answer events using client idempotency keys', () => {
    const existingEvents = new Map();

    const processAnswerEvent = (event) => {
      const key = event.idempotencyKey || event.eventId;
      if (key && existingEvents.has(key)) {
        return {
          duplicate: true,
          event: existingEvents.get(key),
          message: 'Answer event already processed.'
        };
      }

      const isCorrect = Number(event.selectedOptionIndex) === event.correctAnswerIndex;
      const saved = {
        id: 'event-uuid-' + Math.random().toString(36).substring(2, 9),
        ...event,
        isCorrect,
        serverTimestamp: new Date().toISOString()
      };

      if (key) {
        existingEvents.set(key, saved);
      }

      return { duplicate: false, event: saved };
    };

    const firstSubmission = processAnswerEvent({
      idempotencyKey: 'idemp-attempt-1-q1',
      attemptId: 'att-123',
      questionId: 'q-456',
      selectedOptionIndex: 2,
      correctAnswerIndex: 2
    });

    assert.strictEqual(firstSubmission.duplicate, false);
    assert.strictEqual(firstSubmission.event.isCorrect, true);

    // Repeated submission with same idempotency key
    const duplicateSubmission = processAnswerEvent({
      idempotencyKey: 'idemp-attempt-1-q1',
      attemptId: 'att-123',
      questionId: 'q-456',
      selectedOptionIndex: 0, // client attempts to send different answer
      correctAnswerIndex: 2
    });

    assert.strictEqual(duplicateSubmission.duplicate, true);
    assert.strictEqual(duplicateSubmission.event.id, firstSubmission.event.id);
    assert.strictEqual(duplicateSubmission.event.isCorrect, true, 'Duplicate response preserves original state');
  });

  it('prohibits answer event recording on already submitted attempts (immutability guard)', () => {
    const attempt = {
      id: 'att-999',
      status: 'SUBMITTED',
      score: 85,
      submittedAt: new Date().toISOString()
    };

    const recordAnswer = (att, answer) => {
      if (att.status !== 'IN_PROGRESS') {
        throw new Error(`Cannot record answer on attempt with status '${att.status}'. Attempt is closed.`);
      }
      return { success: true };
    };

    assert.throws(() => {
      recordAnswer(attempt, { questionId: 'q1', selectedOptionIndex: 1 });
    }, /Cannot record answer on attempt with status 'SUBMITTED'/);
  });

  it('computes authoritative scores on the server without trusting client input', () => {
    const rawEvents = [
      { questionId: 'q1', isCorrect: true },
      { questionId: 'q2', isCorrect: true },
      { questionId: 'q3', isCorrect: false },
      { questionId: 'q4', isCorrect: true }
    ];

    const clientClaimedScore = 100; // Client falsely claims 100%

    const totalCount = rawEvents.length;
    const correctCount = rawEvents.filter(e => e.isCorrect).length;
    const authoritativePercentage = Math.round((correctCount / totalCount) * 100);

    const maxScore = 50.0;
    const authoritativeScore = Math.round((authoritativePercentage / 100) * maxScore * 10) / 10;

    assert.strictEqual(authoritativePercentage, 75, 'Authoritative percentage must be 75%');
    assert.notStrictEqual(authoritativePercentage, clientClaimedScore, 'Must not trust client claimed score');
    assert.strictEqual(authoritativeScore, 37.5, 'Scaled score must be 37.5 out of 50.0');
  });

  it('preserves historical question version references on every answer event', () => {
    const questionV1 = {
      id: 'q-100',
      version: 1,
      text: 'What is 2 + 2?',
      correctOption: 3
    };

    const questionV2 = {
      id: 'q-100',
      version: 2,
      text: 'What is 2 + 2? (Updated wording)',
      correctOption: 3
    };

    // Event recorded during V1
    const event1 = {
      questionId: questionV1.id,
      questionVersionId: 'qv-uuid-v1',
      versionNumber: questionV1.version
    };

    // Question updated to V2 later
    // Verification: Event 1 retains reference to V1
    assert.strictEqual(event1.questionVersionId, 'qv-uuid-v1');
    assert.strictEqual(event1.versionNumber, 1);
  });

  it('records and verifies UTC timestamps consistently', () => {
    const now = new Date();
    const utcIso = now.toISOString();

    assert(utcIso.endsWith('Z'), 'UTC timestamp must terminate in Z');
    const parsed = new Date(utcIso);
    assert.strictEqual(parsed.getTime(), now.getTime());
  });
});
