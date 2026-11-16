/**
 * AdaptIQ 3.0 — Adaptive Learner Model Service
 * server/services/adaptive/learnerModel.js
 * 
 * Tracks longitudinal student ability using:
 * - Bayesian Knowledge Tracing (BKT) per topic
 * - Rasch 1PL Item Response Theory (Theta ability estimation)
 * - Streak counters & stability metrics
 * - Evidence-grounded remedial recommendations linked to Prerequisite Graph
 */

const { updateMasteryBKT, estimateAbilityRasch, evaluateDifficultyTransition } = require('./adaptiveEngine');
const { identifyRootPrerequisiteGap, getRemedialTrajectory } = require('./prerequisiteGraph');

/**
 * Creates a clean initial learner model for a new student or session
 */
function createInitialLearnerProfile({ studentId, name, grade = 7, initialTheta = 0.0 }) {
  return {
    studentId,
    name: name || 'Demo Student',
    grade: Number(grade),
    abilityTheta: initialTheta, // Rasch logit scale [-3.0, +3.0]
    totalAttempts: 0,
    totalCorrect: 0,
    overallAccuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    recentResponses: [], // boolean array of last 10 attempts
    topicMastery: {}, // topicName -> { mastery: number, attempts: number, correct: number, lastAttempted: Date }
    weakTopics: [],
    masteredTopics: [],
    remedialRecommendations: []
  };
}

/**
 * Updates learner state after a question attempt
 */
function recordLearnerAttempt(profile, {
  topic = 'General',
  isCorrect = false,
  itemDifficulty = 'medium',
  itemDifficultyLogit = 0.0
}) {
  const current = profile || createInitialLearnerProfile({});

  // 1. Update basic counters
  const totalAttempts = (current.totalAttempts || 0) + 1;
  const totalCorrect = (current.totalCorrect || 0) + (isCorrect ? 1 : 0);
  const overallAccuracy = Math.round((totalCorrect / totalAttempts) * 100);

  // 2. Update streak
  let currentStreak = isCorrect ? (current.currentStreak || 0) + 1 : 0;
  let bestStreak = Math.max(current.bestStreak || 0, currentStreak);

  // 3. Update recent responses (window of 15)
  const recentResponses = [...(current.recentResponses || []), Boolean(isCorrect)].slice(-15);

  // 4. Update Topic-specific BKT Mastery
  const topicStats = current.topicMastery?.[topic] || {
    mastery: 0.50,
    attempts: 0,
    correct: 0,
    streak: 0
  };

  const updatedTopicAttempts = topicStats.attempts + 1;
  const updatedTopicCorrect = topicStats.correct + (isCorrect ? 1 : 0);
  const updatedBKT = updateMasteryBKT(topicStats.mastery, isCorrect);

  const updatedTopicMastery = {
    ...current.topicMastery,
    [topic]: {
      mastery: updatedBKT.newMastery,
      status: updatedBKT.status,
      attempts: updatedTopicAttempts,
      correct: updatedTopicCorrect,
      accuracy: Math.round((updatedTopicCorrect / updatedTopicAttempts) * 100),
      lastAttempted: new Date().toISOString()
    }
  };

  // 5. Update Rasch ability theta estimate
  const updatedTheta = estimateAbilityRasch(totalCorrect, totalAttempts);

  // 6. Partition Weak vs Mastered Topics
  const weakTopics = [];
  const masteredTopics = [];

  for (const [top, stats] of Object.entries(updatedTopicMastery)) {
    if (stats.mastery >= 0.85 && stats.attempts >= 3) {
      masteredTopics.push(top);
    } else if (stats.mastery < 0.65 || (stats.attempts >= 2 && stats.correct === 0)) {
      weakTopics.push(top);
    }
  }

  // 7. Generate evidence-grounded recommendation
  let remedialRecommendations = [];
  if (weakTopics.length > 0) {
    const masteryLookup = {};
    for (const [k, v] of Object.entries(updatedTopicMastery)) {
      masteryLookup[k] = v.mastery;
    }
    const gap = identifyRootPrerequisiteGap(weakTopics, masteryLookup);
    if (gap) {
      remedialRecommendations.push({
        type: 'PREREQUISITE_REMEDIATION',
        targetTopic: gap.strugglingTargetTopic,
        recommendedPrerequisite: gap.rootPrerequisite,
        reason: `Student mastery on "${gap.strugglingTargetTopic}" is ${(updatedTopicMastery[gap.strugglingTargetTopic]?.mastery * 100).toFixed(0)}%. Foundational prerequisite "${gap.rootPrerequisite}" requires reinforcement.`,
        actionUrl: `/practice?topic=${encodeURIComponent(gap.rootPrerequisite)}`
      });
    }
  }

  // Difficulty transition
  const transition = evaluateDifficultyTransition(recentResponses, itemDifficulty);

  return {
    ...current,
    totalAttempts,
    totalCorrect,
    overallAccuracy,
    currentStreak,
    bestStreak,
    recentResponses,
    abilityTheta: updatedTheta.theta,
    recommendedDifficulty: transition.recommendedDifficulty,
    difficultyAction: transition.action,
    topicMastery: updatedTopicMastery,
    weakTopics,
    masteredTopics,
    remedialRecommendations
  };
}

module.exports = {
  createInitialLearnerProfile,
  recordLearnerAttempt
};
