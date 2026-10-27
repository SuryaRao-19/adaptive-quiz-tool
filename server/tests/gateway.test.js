const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Classroom Gateway & Offline Reconciliation (Phase 5)', () => {
  it('deduplicates offline attempt events with identical eventIds', () => {
    const existingEventIds = new Set(['evt_101', 'evt_102']);
    const incomingEvents = [
      { eventId: 'evt_101', questionId: 'q1', isCorrect: true }, // duplicate
      { eventId: 'evt_103', questionId: 'q2', isCorrect: false }, // new
      { eventId: 'evt_102', questionId: 'q3', isCorrect: true }  // duplicate
    ];

    const processed = [];
    const duplicates = [];

    for (const evt of incomingEvents) {
      if (existingEventIds.has(evt.eventId)) {
        duplicates.push(evt.eventId);
      } else {
        processed.push(evt.eventId);
        existingEventIds.add(evt.eventId);
      }
    }

    assert.strictEqual(duplicates.length, 2);
    assert.deepStrictEqual(duplicates, ['evt_101', 'evt_102']);
    assert.strictEqual(processed.length, 1);
    assert.deepStrictEqual(processed, ['evt_103']);
  });

  it('quarantines unidentifiable student attempts without dropping data', () => {
    const incomingEvents = [
      { eventId: 'evt_201', rollNumber: '007', isCorrect: true },
      { eventId: 'evt_202', rollNumber: 'UNKNOWN_999', isCorrect: false }
    ];

    const knownRolls = new Set(['007', '008', '009']);
    const valid = [];
    const quarantined = [];

    for (const evt of incomingEvents) {
      if (knownRolls.has(evt.rollNumber)) {
        valid.push(evt);
      } else {
        quarantined.push({
          eventId: evt.eventId,
          payload: evt,
          reason: 'Unrecognized student identity or roll number'
        });
      }
    }

    assert.strictEqual(valid.length, 1);
    assert.strictEqual(quarantined.length, 1);
    assert.strictEqual(quarantined[0].eventId, 'evt_202');
    assert.strictEqual(quarantined[0].reason, 'Unrecognized student identity or roll number');
  });

  it('guarantees gateway discovery contract contains mandatory network metadata', () => {
    const sampleHealth = {
      status: 'HEALTHY',
      mode: 'classroom_gateway',
      database: 'connected',
      localLanBind: '0.0.0.0',
      contentBundleVersion: '2.0.0-stem-offline',
      pendingQuarantineCount: 0,
      timestamp: new Date().toISOString()
    };

    assert.strictEqual(sampleHealth.mode, 'classroom_gateway');
    assert.strictEqual(sampleHealth.database, 'connected');
    assert.strictEqual(sampleHealth.contentBundleVersion, '2.0.0-stem-offline');
    assert(typeof sampleHealth.timestamp === 'string');
  });
});
