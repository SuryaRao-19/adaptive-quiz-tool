/**
 * AdaptIQ 3.0 Centralized Deterministic Adaptive Engine
 * Phase 2 — Rule-Based Adaptive Learning & Psychometric Calibration Engine
 * 
 * Fully deterministic, reproducible from stored performance data without LLMs.
 * Integrates:
 * - Bayesian Knowledge Tracing (BKT)
 * - Rasch Item Response Theory (IRT)
 * - Leitner 5-Box Spaced Repetition
 * - Hake's Normalized Learning Gain
 * - 3-Up / 2-Down Streak Calibration
 * - Human-Readable Educational Decision Explainability
 */

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'very_hard'];

// Default BKT Parameters (CBSE STEM Calibration)
const DEFAULT_BKT = {
  pL0: 0.20, // Initial prior mastery
  pT: 0.15,  // Transition probability (learning step)
  pG: 0.25,  // Guess probability (standard 4-option MCQ)
  pS: 0.10   // Slip probability (careless mistake)
};

/**
 * Computes updated Bayesian Knowledge Tracing posterior mastery
 * Formula:
 * P(L_t | obs) = P(L_{t-1}) * (1 - S) / [ P(L_{t-1})*(1 - S) + (1 - P(L_{t-1}))*G ] (if correct)
 * P(L_t | obs) = P(L_{t-1}) * S / [ P(L_{t-1})*S + (1 - P(L_{t-1}))*(1 - G) ] (if incorrect)
 * P(L_t) = P(L_t | obs) + (1 - P(L_t | obs)) * T
 */
function updateBKT(priorMastery, isCorrect, params = {}) {
  const pL = Math.max(0.001, Math.min(0.999, priorMastery ?? DEFAULT_BKT.pL0));
  const pG = params.pG ?? DEFAULT_BKT.pG;
  const pS = params.pS ?? DEFAULT_BKT.pS;
  const pT = params.pT ?? DEFAULT_BKT.pT;

  let posteriorGivenObs;
  if (isCorrect) {
    const numerator = pL * (1 - pS);
    const denominator = numerator + (1 - pL) * pG;
    posteriorGivenObs = numerator / denominator;
  } else {
    const numerator = pL * pS;
    const denominator = numerator + (1 - pL) * (1 - pG);
    posteriorGivenObs = numerator / denominator;
  }

  // Learning transition update
  const updatedMastery = posteriorGivenObs + (1 - posteriorGivenObs) * pT;
  return Math.round(Math.max(0.01, Math.min(0.99, updatedMastery)) * 1000) / 1000;
}

/**
 * Convenience wrapper returning mastery value and status
 */
function updateMasteryBKT(priorMastery, isCorrect, params = {}) {
  const newMastery = updateBKT(priorMastery, isCorrect, params);
  let status = 'PROGRESSING';
  if (newMastery >= 0.80) status = 'MASTERED';
  else if (newMastery < 0.40) status = 'NEEDS_PRACTICE';

  return {
    previousMastery: priorMastery,
    newMastery,
    isCorrect,
    status
  };
}

/**
 * Rasch IRT Probability of Correct Response
 * Formula: P(theta, b) = 1 / (1 + exp(-(theta - b)))
 * theta: Student latent ability parameter
 * b: Item difficulty calibration parameter
 */
function calculateRaschProbability(studentAbilityTheta, itemDifficultyB) {
  const theta = parseFloat(studentAbilityTheta) || 0;
  const b = parseFloat(itemDifficultyB) || 0;
  const exponent = -(theta - b);
  const probability = 1 / (1 + Math.exp(exponent));
  return Math.round(probability * 1000) / 1000;
}

/**
 * Estimate student ability parameter theta via proportion correct
 */
function estimateAbilityRasch(correctCount, totalCount) {
  const total = Math.max(1, totalCount);
  const correct = Math.max(0.5, Math.min(total - 0.5, correctCount));
  const p = correct / total;
  // Standard logit transform: ln(p / (1 - p))
  return Math.round(Math.log(p / (1 - p)) * 100) / 100;
}

/**
 * Estimate item difficulty parameter b from empirical pass rate
 */
function estimateRaschItemDifficulty(passRate) {
  const rate = Math.max(0.05, Math.min(0.95, parseFloat(passRate) || 0.5));
  const b = -Math.log(rate / (1 - rate));
  return Math.round(b * 100) / 100;
}

/**
 * Calculates Hake's normalized learning gain: <g> = (Post - Pre) / (100 - Pre)
 */
function calculateHakeGain(preTestPercent, postTestPercent, maxScore = 100) {
  const pre = (parseFloat(preTestPercent) / maxScore) * 100;
  const post = (parseFloat(postTestPercent) / maxScore) * 100;

  if (isNaN(pre) || isNaN(post) || pre >= 100) {
    return { g: 0, gain: 0, category: 'INVALID_INPUT', valid: false };
  }

  const gain = (post - pre) / (100 - pre);
  const rounded = Math.round(gain * 100) / 100;

  let category = 'LOW_GAIN';
  if (rounded >= 0.70) category = 'HIGH_GAIN';
  else if (rounded >= 0.30) category = 'MEDIUM_GAIN';
  else if (rounded < 0) category = 'NEGATIVE';

  return {
    g: rounded,
    gain: rounded,
    rawImprovement: Math.round((post - pre) * 10) / 10,
    category,
    valid: true,
    interpretation: `${category} Normalized Gain (<g> = ${rounded}) based on Hake's Cognitive Benchmark.`
  };
}

/**
 * Streak and difficulty transition rule (3-up / 2-down rule)
 */
function evaluateDifficultyTransition(history = [], currentDifficulty = 'medium') {
  let currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty.toLowerCase());
  if (currentIndex === -1) currentIndex = 1;

  const len = history.length;
  if (len === 0) {
    return {
      recommendedDifficulty: currentDifficulty,
      streakLength: 0,
      streakType: 'NONE',
      action: 'MAINTAIN',
      decisionReason: 'Initial question; maintaining baseline medium difficulty.'
    };
  }

  // Count current streak at the tail
  const lastVal = history[len - 1];
  let streak = 0;
  for (let i = len - 1; i >= 0; i--) {
    if (history[i] === lastVal) streak++;
    else break;
  }

  // 3 consecutive correct -> Promote
  if (lastVal === true && streak >= 3) {
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      const nextDiff = DIFFICULTY_LEVELS[currentIndex + 1];
      return {
        recommendedDifficulty: nextDiff,
        streakLength: streak,
        streakType: 'CORRECT',
        action: 'PROMOTE',
        decisionReason: `Promoted to ${nextDiff} after ${streak} consecutive correct answers demonstrating mastery.`
      };
    } else {
      return {
        recommendedDifficulty: DIFFICULTY_LEVELS[currentIndex],
        streakLength: streak,
        streakType: 'CORRECT',
        action: 'MAINTAIN',
        decisionReason: `Maintained at maximum ceiling ${DIFFICULTY_LEVELS[currentIndex]} with ${streak} correct streak.`
      };
    }
  }

  // 2 consecutive wrong -> Demote
  if (lastVal === false && streak >= 2) {
    if (currentIndex > 0) {
      const prevDiff = DIFFICULTY_LEVELS[currentIndex - 1];
      return {
        recommendedDifficulty: prevDiff,
        streakLength: streak,
        streakType: 'INCORRECT',
        action: 'DEMOTE',
        decisionReason: `Demoted to ${prevDiff} after ${streak} consecutive incorrect answers to reinforce core prerequisites.`
      };
    } else {
      return {
        recommendedDifficulty: DIFFICULTY_LEVELS[0],
        streakLength: streak,
        streakType: 'INCORRECT',
        action: 'MAINTAIN',
        decisionReason: `Maintained at foundational ${DIFFICULTY_LEVELS[0]} difficulty to build confidence.`
      };
    }
  }

  return {
    recommendedDifficulty: DIFFICULTY_LEVELS[currentIndex],
    streakLength: streak,
    streakType: lastVal ? 'CORRECT' : 'INCORRECT',
    action: 'MAINTAIN',
    decisionReason: `Maintained at ${DIFFICULTY_LEVELS[currentIndex]} (Current streak: ${streak} ${lastVal ? 'correct' : 'incorrect'}).`
  };
}

/**
 * Full adaptive step evaluation
 */
function evaluateAdaptiveStep({
  studentId,
  grade = 7,
  subject = 'Mathematics',
  topic = '',
  currentMastery = 0.50,
  currentDifficulty = 'medium',
  recentAnswers = [],
  isLastAnswerCorrect = null,
  currentLeitnerBox = 1
}) {
  const answers = [...recentAnswers];
  if (isLastAnswerCorrect !== null) {
    answers.push(isLastAnswerCorrect);
  }

  const transition = evaluateDifficultyTransition(answers, currentDifficulty);
  const updatedMastery = isLastAnswerCorrect !== null 
    ? updateBKT(currentMastery, isLastAnswerCorrect) 
    : currentMastery;

  let nextLeitnerBox = currentLeitnerBox;
  if (isLastAnswerCorrect === true) {
    nextLeitnerBox = Math.min(5, currentLeitnerBox + 1);
  } else if (isLastAnswerCorrect === false) {
    nextLeitnerBox = 1;
  }

  return {
    studentId,
    grade,
    subject,
    topic,
    recommendedDifficulty: transition.recommendedDifficulty,
    priorDifficulty: currentDifficulty,
    currentMasteryEstimate: updatedMastery,
    masteryPercentage: Math.round(updatedMastery * 100),
    masteryStatus: updatedMastery >= 0.80 ? 'MASTERED' : (updatedMastery >= 0.50 ? 'DEVELOPING' : 'NEEDS_REVISION'),
    reasonForSelection: transition.decisionReason,
    updatedLeitnerBox: nextLeitnerBox,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  DIFFICULTY_LEVELS,
  DEFAULT_BKT,
  updateBKT,
  updateMasteryBKT,
  calculateRaschProbability,
  estimateAbilityRasch,
  estimateRaschItemDifficulty,
  calculateHakeGain,
  evaluateDifficultyTransition,
  evaluateAdaptiveStep
};
