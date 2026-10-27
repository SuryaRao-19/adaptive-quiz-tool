/**
 * Bayesian Knowledge Tracing (BKT) Engine (Phase 5.2)
 * 
 * Standard 2-state Hidden Markov Model for estimating student skill mastery:
 * - pInit (L0): Prior probability learner knows the skill initially.
 * - pLearn (T): Probability learner transitions from unmastered to mastered after practice.
 * - pGuess (G): Probability learner answers correctly despite not knowing the skill (e.g. 0.25 for 4-option MCQ).
 * - pSlip (S): Probability learner answers incorrectly despite knowing the skill (e.g. careless error 0.10).
 */

const DEFAULT_BKT_PARAMS = {
  pInit: 0.20,
  pLearn: 0.15,
  pGuess: 0.25,
  pSlip: 0.10
};

/**
 * Computes posterior mastery probability after observing a response.
 * 
 * @param {number} prior - Current mastery estimate P(L_t) between 0 and 1
 * @param {boolean} isCorrect - Binary response outcome
 * @param {object} [customParams] - Optional skill-specific calibrated parameters
 * @returns {number} Updated posterior mastery probability P(L_{t+1})
 */
function updateBKT(prior, isCorrect, customParams = {}) {
  const params = { ...DEFAULT_BKT_PARAMS, ...customParams };
  const p = Math.max(0.01, Math.min(0.99, Number(prior) || params.pInit));
  const { pLearn, pGuess, pSlip } = params;

  let pObs;
  if (isCorrect) {
    const numerator = p * (1 - pSlip);
    const denominator = numerator + (1 - p) * pGuess;
    pObs = denominator > 0 ? numerator / denominator : p;
  } else {
    const numerator = p * pSlip;
    const denominator = numerator + (1 - p) * (1 - pGuess);
    pObs = denominator > 0 ? numerator / denominator : p;
  }

  // Apply learning transition: P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
  const pNext = pObs + (1 - pObs) * pLearn;

  // Numerical stability clamp between 0.02 and 0.98
  return Math.round(Math.max(0.02, Math.min(0.98, pNext)) * 1000) / 1000;
}

/**
 * Categorizes BKT mastery into human-readable instructional tiers.
 * 
 * @param {number} mastery - Probability between 0 and 1
 * @returns {'needs_focus' | 'in_progress' | 'mastered'}
 */
function categorizeBKTStatus(mastery) {
  if (mastery < 0.60) return 'needs_focus';
  if (mastery >= 0.85) return 'mastered';
  return 'in_progress';
}

module.exports = {
  DEFAULT_BKT_PARAMS,
  updateBKT,
  categorizeBKTStatus
};
