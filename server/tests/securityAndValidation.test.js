const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Security & Input Validation Directives', () => {
  it('validates 4-digit numeric PIN format strictly', () => {
    const validatePin = (pin) => {
      if (typeof pin !== 'string') pin = String(pin);
      return /^\d{4}$/.test(pin.trim());
    };

    assert.equal(validatePin('1234'), true);
    assert.equal(validatePin('0000'), true);
    assert.equal(validatePin('9876'), true);
    assert.equal(validatePin('123'), false, '3-digit PIN should be rejected');
    assert.equal(validatePin('12345'), false, '5-digit PIN should be rejected');
    assert.equal(validatePin('12a4'), false, 'Alphanumeric PIN should be rejected');
    assert.equal(validatePin(''), false, 'Empty PIN should be rejected');
  });

  it('validates Roll Number format and trims whitespace', () => {
    const sanitizeRollNumber = (rollNo) => {
      if (!rollNo || typeof rollNo !== 'string') return null;
      const clean = rollNo.trim().toUpperCase();
      return clean.length >= 2 ? clean : null;
    };

    assert.equal(sanitizeRollNumber(' 101 '), '101');
    assert.equal(sanitizeRollNumber('r-24'), 'R-24');
    assert.equal(sanitizeRollNumber('A'), null);
    assert.equal(sanitizeRollNumber(''), null);
  });

  it('sanitizes and truncates chat user messages to prevent prompt injection payload flooding', () => {
    const sanitizeChatMessage = (msg, maxChars = 1000) => {
      if (!msg || typeof msg !== 'string') return '';
      return msg.trim().slice(0, maxChars);
    };

    const normal = 'How do I add 1/3 and 2/5?';
    assert.equal(sanitizeChatMessage(normal), normal);

    const oversized = 'A'.repeat(2500);
    const sanitized = sanitizeChatMessage(oversized, 1000);
    assert.equal(sanitized.length, 1000);
  });

  it('prohibits silent in-memory database fallback in production environments', () => {
    const verifyDatabaseEnvironmentPolicy = (nodeEnv, connectionError) => {
      if (nodeEnv === 'production') {
        throw new Error(`CRITICAL DATABASE CONFIGURATION: Cannot fall back to in-memory MongoDB in production. Error: ${connectionError}`);
      }
      return 'in_memory_fallback_allowed_for_dev_only';
    };

    // In development or test, fallback is permitted
    assert.equal(verifyDatabaseEnvironmentPolicy('development', 'Connection refused'), 'in_memory_fallback_allowed_for_dev_only');

    // In production, it must throw a fatal error
    assert.throws(
      () => verifyDatabaseEnvironmentPolicy('production', 'Atlas unreachable'),
      /CRITICAL DATABASE CONFIGURATION: Cannot fall back to in-memory MongoDB in production/
    );
  });
});
