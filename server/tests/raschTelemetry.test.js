const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  calculateEmpiricalPassRate,
  detectDifficultyAnomaly,
  estimateRaschItemDifficulty
} = require('../engine/raschEngine');

describe('Empirical Question Telemetry & Anomaly Detection (Phase 6)', () => {
  it('returns status unavailable and null pass rate when response count is 0', () => {
    const res = calculateEmpiricalPassRate(0, 0);
    assert.strictEqual(res.passRate, null);
    assert.strictEqual(res.passRatePercent, null);
    assert.strictEqual(res.sampleSize, 0);
    assert.strictEqual(res.status, 'unavailable');
  });

  it('calculates empirical pass rate p_i and failure rate f_i accurately', () => {
    // 15 correct out of 20 total -> p = 0.75, f = 0.25
    const res = calculateEmpiricalPassRate(15, 20);
    assert.strictEqual(res.passRate, 0.75);
    assert.strictEqual(res.passRatePercent, 75);
    assert.strictEqual(res.failureRate, 0.25);
    assert.strictEqual(res.failureRatePercent, 25);
    assert.strictEqual(res.sampleSize, 20);
    assert.strictEqual(res.status, 'computed');
  });

  it('flags easy items with high failure rates as Review Recommended', () => {
    // Easy item with 20 attempts and only 8 correct (p = 0.40, fail = 0.60)
    const passObj = calculateEmpiricalPassRate(8, 20);
    const anomaly = detectDifficultyAnomaly('easy', passObj);
    assert.strictEqual(anomaly.flag, 'anomaly_detected');
    assert.strictEqual(anomaly.severity, 'warning');
    assert.strictEqual(anomaly.label, 'Review Recommended');
    assert.match(anomaly.message, /Unusually high failure rate/);
  });

  it('marks small sample sizes (N < 10) as Insufficient Data to avoid false alarms', () => {
    // Only 3 attempts recorded
    const passObj = calculateEmpiricalPassRate(1, 3);
    const anomaly = detectDifficultyAnomaly('easy', passObj);
    assert.strictEqual(anomaly.flag, 'insufficient_sample');
    assert.strictEqual(anomaly.label, 'Insufficient Data');
  });

  it('identifies questions within normal operational bounds', () => {
    // Medium item with 50 attempts and 30 correct (p = 0.60)
    const passObj = calculateEmpiricalPassRate(30, 50);
    const anomaly = detectDifficultyAnomaly('medium', passObj);
    assert.strictEqual(anomaly.flag, 'within_expected_range');
    assert.strictEqual(anomaly.label, 'Within Expected Range');
  });
});

describe('1PL Rasch Item Difficulty Calibration Readiness (Phase 7)', () => {
  it('rejects estimation and does not fabricate logits when sample N < 30', () => {
    const res = estimateRaschItemDifficulty(15, 25);
    assert.strictEqual(res.calibratedDifficultyLogits, null);
    assert.strictEqual(res.standardError, null);
    assert.strictEqual(res.calibrationStatus, 'insufficient_sample');
    assert.match(res.message, /N = 25 < 30 required/);
  });

  it('estimates positive logit difficulty for harder items when N >= 30', () => {
    // 50 attempts, 10 correct -> hard question -> b > 0
    const res = estimateRaschItemDifficulty(10, 50);
    assert.strictEqual(res.calibrationStatus, 'pilot_calibrated');
    assert(res.calibratedDifficultyLogits > 0, 'Hard items should have positive difficulty logits');
    assert(res.standardError > 0, 'Standard error should be positive');
  });

  it('estimates negative logit difficulty for easier items when N >= 30', () => {
    // 50 attempts, 40 correct -> easy question -> b < 0
    const res = estimateRaschItemDifficulty(40, 50);
    assert(res.calibratedDifficultyLogits < 0, 'Easy items should have negative difficulty logits');
  });

  it('promotes to fully_calibrated status when sample size N >= 250', () => {
    const res = estimateRaschItemDifficulty(150, 300);
    assert.strictEqual(res.calibrationStatus, 'fully_calibrated');
    assert.strictEqual(res.modelVersion, '1PL-Rasch-v1.0');
    assert(res.standardError < 0.2, 'Large sample should produce low standard error');
  });
});
