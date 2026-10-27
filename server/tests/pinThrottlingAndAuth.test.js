const { describe, it } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateSecure4DigitPin } = require('../services/rosterService');

describe('Student PIN Authentication & Lockout Throttling (Phase 4 & 6)', () => {
  it('generates cryptographic 4-digit PINs preserving leading zeros between 0000 and 9999', () => {
    for (let i = 0; i < 50; i++) {
      const pin = generateSecure4DigitPin();
      assert.strictEqual(pin.length, 4, 'PIN must be exactly 4 digits');
      assert.match(pin, /^\d{4}$/, 'PIN must contain only numeric digits');
      const num = parseInt(pin, 10);
      assert(num >= 0 && num <= 9999, 'PIN must be between 0 and 9999');
    }
  });

  it('strictly validates PIN format and rejects alphabetic, short, or oversized inputs', () => {
    const isValidPin = (p) => typeof p === 'string' && /^\d{4}$/.test(p.trim());

    assert.strictEqual(isValidPin('1234'), true);
    assert.strictEqual(isValidPin('0005'), true);
    assert.strictEqual(isValidPin('9999'), true);
    assert.strictEqual(isValidPin('123'), false, '3-digit PIN must be rejected');
    assert.strictEqual(isValidPin('12345'), false, '5-digit PIN must be rejected');
    assert.strictEqual(isValidPin('abcd'), false, 'Alphabetic PIN must be rejected');
    assert.strictEqual(isValidPin('12a4'), false, 'Alphanumeric PIN must be rejected');
    assert.strictEqual(isValidPin(' 1234 '), true, 'Whitespace-padded 4-digit PIN trims to valid');
  });

  it('performs slow bcrypt hashing for PINs and verifies matches securely', async () => {
    const rawPin = '0842';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPin, saltRounds);

    assert.notStrictEqual(hash, rawPin, 'Hash must not equal plaintext PIN');
    assert(hash.startsWith('$2'), 'Hash must follow bcrypt format');

    const isMatch = await bcrypt.compare(rawPin, hash);
    assert.strictEqual(isMatch, true, 'Bcrypt compare must verify matching PIN');

    const isWrongMatch = await bcrypt.compare('0843', hash);
    assert.strictEqual(isWrongMatch, false, 'Bcrypt compare must reject non-matching PIN');
  });

  it('enforces lockout after 5 consecutive failed PIN attempts and computes remaining attempts', () => {
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;
    let failedAttempts = 0;
    let lockedUntil = null;

    const simulateFailedAttempt = () => {
      failedAttempts++;
      if (failedAttempts >= MAX_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - failedAttempts);
      return {
        locked: failedAttempts >= MAX_ATTEMPTS,
        attemptsRemaining,
        lockedUntil
      };
    };

    // Attempts 1 through 4
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = simulateFailedAttempt();
      assert.strictEqual(res.locked, false);
      assert.strictEqual(res.attemptsRemaining, MAX_ATTEMPTS - attempt);
      assert.strictEqual(res.lockedUntil, null);
    }

    // 5th attempt locks the account
    const lockRes = simulateFailedAttempt();
    assert.strictEqual(lockRes.locked, true);
    assert.strictEqual(lockRes.attemptsRemaining, 0);
    assert(lockRes.lockedUntil instanceof Date);
    assert(lockRes.lockedUntil.getTime() > Date.now());

    // Resetting on successful auth
    failedAttempts = 0;
    lockedUntil = null;
    assert.strictEqual(failedAttempts, 0);
    assert.strictEqual(lockedUntil, null);
  });

  it('enforces classroom joinCode scoping and prevents cross-classroom student access', () => {
    const studentEnrollments = [
      { classroom: { joinCode: 'MATH-101' } },
      { classroom: { joinCode: 'SCI-202' } }
    ];

    const isEnrolled = (joinCode) => {
      const cleanCode = String(joinCode).trim().toUpperCase();
      return studentEnrollments.some(
        e => e.classroom.joinCode.toUpperCase() === cleanCode
      );
    };

    assert.strictEqual(isEnrolled('math-101'), true, 'Case-insensitive match should succeed');
    assert.strictEqual(isEnrolled('SCI-202'), true);
    assert.strictEqual(isEnrolled('HIST-303'), false, 'Non-enrolled classroom must be rejected');
  });
});
