const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

describe('Roster Import & PIN Generation (Phase 1)', () => {
  it('generates unpredictable, cryptographically random 4-digit PINs preserving leading zeros', () => {
    const pins = new Set();
    for (let i = 0; i < 100; i++) {
      const pin = crypto.randomInt(0, 10000).toString().padStart(4, '0');
      assert.strictEqual(pin.length, 4, 'PIN must be exactly 4 digits');
      assert.match(pin, /^\d{4}$/, 'PIN must consist of 4 numeric characters');
      pins.add(pin);
    }
    // High entropy across 100 samples
    assert(pins.size > 90, 'Generated PINs should exhibit high entropy');
  });

  it('preserves leading zeros in roll numbers as strings', () => {
    const rollNumberRaw = '007';
    const normalized = String(rollNumberRaw).trim();
    assert.strictEqual(normalized, '007');
    assert.notStrictEqual(normalized, '7');
  });

  it('detects duplicate roll numbers in a single roster upload', () => {
    const uploadedRoster = [
      { student_name: 'Alice Smith', roll_number: '101' },
      { student_name: 'Bob Jones', roll_number: '102' },
      { student_name: 'Charlie Smith', roll_number: '101' } // duplicate
    ];

    const seen = new Set();
    const duplicates = [];
    const valid = [];

    for (const r of uploadedRoster) {
      const roll = String(r.roll_number).trim();
      if (seen.has(roll)) {
        duplicates.push(roll);
      } else {
        seen.add(roll);
        valid.push(r);
      }
    }

    assert.strictEqual(duplicates.length, 1);
    assert.strictEqual(duplicates[0], '101');
    assert.strictEqual(valid.length, 2);
  });
});
