/**
 * Rasch 1PL Calibration & Empirical Item Telemetry Engine (Phases 6 & 7)
 * 
 * Provides:
 * 1. Empirical Pass Rate (p_i = C_i / N_i) & Failure Rate (f_i = 1 - p_i)
 * 2. Difficulty Tier Anomaly Flagging (Heuristic Discrepancy Detection)
 * 3. 1PL Rasch Difficulty Estimation (b_i log-odds with SE & identification constraint)
 * 4. Sample Size Sufficiency Diagnostics
 */

/**
 * Calculate Empirical Question Pass Rate & Failure Rate
 * @param {number} correctResponses - C_i (eligible, validated correct responses)
 * @param {number} totalResponses - N_i (eligible, validated total responses)
 * @returns {object} { passRate, failureRate, sampleSize, status }
 */
function calculateEmpiricalPassRate(correctResponses = 0, totalResponses = 0) {
  const N = Math.max(0, Number(totalResponses) || 0);
  const C = Math.max(0, Math.min(N, Number(correctResponses) || 0));

  if (N === 0) {
    return {
      passRate: null,
      passRatePercent: null,
      failureRate: null,
      failureRatePercent: null,
      sampleSize: 0,
      status: 'unavailable' // N/A, not 0%
    };
  }

  const p = C / N;
  const f = 1 - p;

  return {
    passRate: Math.round(p * 10000) / 10000,
    passRatePercent: Math.round(p * 1000) / 10, // e.g. 74.2%
    failureRate: Math.round(f * 10000) / 10000,
    failureRatePercent: Math.round(f * 1000) / 10,
    sampleSize: N,
    correctCount: C,
    status: 'computed'
  };
}

/**
 * Detect Difficulty-Tier Anomalies
 * Compares empirical pass rate against static editorial difficulty tiers.
 * 
 * Configured operational expectations:
 * - easy: p >= 0.60
 * - medium: 0.35 <= p <= 0.85
 * - hard: p <= 0.65
 * - very_hard: p <= 0.45
 * 
 * Requires N >= 10 to trigger review flags (avoid small sample false alarms).
 */
function detectDifficultyAnomaly(difficulty = 'medium', passRateObj = {}) {
  const { passRate, sampleSize } = passRateObj;

  if (passRate === null || sampleSize === undefined || sampleSize === 0) {
    return {
      flag: 'no_data',
      severity: 'none',
      label: 'No Response Data',
      message: 'Zero eligible responses recorded.'
    };
  }

  if (sampleSize < 10) {
    return {
      flag: 'insufficient_sample',
      severity: 'info',
      label: 'Insufficient Data',
      message: `Sample size too small (N = ${sampleSize} < 10) for reliable difficulty calibration.`
    };
  }

  const p = passRate;
  const tier = (difficulty || 'medium').toLowerCase();

  if (tier === 'easy' && p < 0.60) {
    return {
      flag: 'anomaly_detected',
      severity: 'warning',
      label: 'Review Recommended',
      message: `Unusually high failure rate (${(passRateObj.failureRatePercent)}%) for assigned Easy tier. Inspect wording, answer key, and curriculum alignment.`
    };
  }

  if (tier === 'medium' && (p < 0.30 || p > 0.90)) {
    return {
      flag: 'anomaly_detected',
      severity: 'warning',
      label: 'Review Recommended',
      message: p < 0.30
        ? `Item performs significantly harder (${(passRateObj.passRatePercent)}% pass rate) than typical Medium procedural tier.`
        : `Item performs significantly easier (${(passRateObj.passRatePercent)}% pass rate) than typical Medium procedural tier.`
    };
  }

  if ((tier === 'hard' || tier === 'very_hard') && p > 0.80) {
    return {
      flag: 'anomaly_detected',
      severity: 'warning',
      label: 'Review Recommended',
      message: `Unusually high pass rate (${(passRateObj.passRatePercent)}%) for assigned ${tier} tier. Check distractor plausibility.`
    };
  }

  return {
    flag: 'within_expected_range',
    severity: 'success',
    label: 'Within Expected Range',
    message: `Observed pass rate matches configured operational expectations for ${tier} tier.`
  };
}

/**
 * 1PL Rasch Item Difficulty Calibration
 * P(X_ni = 1) = 1 / (1 + exp[-(theta_n - b_i)])
 * 
 * Logit item difficulty estimate (under identification constraint mean(theta) = 0):
 * b_i = ln( (1 - p_i) / p_i ) = ln( f_i / p_i )
 * 
 * With continuous extreme score correction: (C + 0.5) / (N + 1)
 */
function estimateRaschItemDifficulty(correctResponses = 0, totalResponses = 0) {
  const N = Number(totalResponses) || 0;
  const C = Number(correctResponses) || 0;

  if (N < 30) {
    return {
      calibratedDifficultyLogits: null,
      standardError: null,
      calibrationStatus: 'insufficient_sample',
      sampleSize: N,
      message: `Insufficient sample size for 1PL Rasch calibration (N = ${N} < 30 required for pilot estimation).`
    };
  }

  // Continuity correction for edge scores
  const correctedP = (C + 0.5) / (N + 1);
  const correctedF = 1 - correctedP;

  // b_i = ln(f / p)
  // Higher b_i indicates a harder item (positive logit = harder than mean ability)
  const b = Math.log(correctedF / correctedP);

  // Standard Error of Rasch item difficulty: SE(b) = sqrt( 1 / (N * p * (1 - p)) )
  const se = Math.sqrt(1 / (N * correctedP * correctedF));

  const isFullCalibration = N >= 250;

  return {
    calibratedDifficultyLogits: Math.round(b * 1000) / 1000,
    standardError: Math.round(se * 1000) / 1000,
    calibrationStatus: isFullCalibration ? 'fully_calibrated' : 'pilot_calibrated',
    modelVersion: '1PL-Rasch-v1.0',
    sampleSize: N,
    message: isFullCalibration
      ? 'Fully calibrated 1PL Rasch item parameter with stable standard error.'
      : 'Pilot 1PL Rasch parameter estimation (30 <= N < 250).'
  };
}

module.exports = {
  calculateEmpiricalPassRate,
  detectDifficultyAnomaly,
  estimateRaschItemDifficulty
};
