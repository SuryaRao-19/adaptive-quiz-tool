const { prisma } = require('../config/prisma');
const {
  calculateEmpiricalPassRate,
  detectDifficultyAnomaly,
  estimateRaschItemDifficulty
} = require('../engine/raschEngine');

/**
 * Analytics Service (Phase 8)
 * Computes authoritative empirical difficulty (p-value = C_i / N_i) from eligible response events,
 * detects anomalous question behavior, applies Rasch 1PL item calibration with standard errors,
 * and persists versioned records into QuestionStatistic.
 */

/**
 * Definition of Response Event Eligibility:
 * 1. Must belong to an existing, non-quarantined Attempt.
 * 2. Attempt must NOT be ABANDONED (SUBMITTED or IN_PROGRESS practice with answered question).
 * 3. Event must have a valid selectedOptionIndex (not skipped or null).
 * 4. Deduplicated: duplicate eventId or idempotencyKey are excluded by unique constraints.
 * 5. Tracked against the exact questionVersion active at the time of the event.
 */
async function computeQuestionStatistics(questionId, version = 1) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      versions: {
        where: { version },
        take: 1
      }
    }
  });

  if (!question) {
    throw new Error('Question not found.');
  }

  // Fetch only eligible answer events
  const eligibleEvents = await prisma.answerEvent.findMany({
    where: {
      questionId: question.id,
      selectedOptionIndex: { not: null },
      attempt: {
        status: { in: ['SUBMITTED', 'IN_PROGRESS'] }
      }
    }
  });

  const eligibleCount = eligibleEvents.length;
  const correctCount = eligibleEvents.filter(e => e.isCorrect).length;

  const passRateObj = calculateEmpiricalPassRate(correctCount, eligibleCount);
  const anomalyObj = detectDifficultyAnomaly(question.difficulty, passRateObj);
  const raschObj = estimateRaschItemDifficulty(correctCount, eligibleCount);

  let sampleSizeStatus = 'insufficient';
  if (eligibleCount >= 250) {
    sampleSizeStatus = 'robust';
  } else if (eligibleCount >= 30) {
    sampleSizeStatus = 'moderate';
  } else if (eligibleCount >= 10) {
    sampleSizeStatus = 'preliminary';
  }

  const now = new Date();

  // Upsert into QuestionStatistic table
  const statRecord = await prisma.questionStatistic.upsert({
    where: {
      questionId_questionVersion: {
        questionId: question.id,
        questionVersion: version
      }
    },
    update: {
      totalResponses: eligibleCount,
      correctResponses: correctCount,
      pValue: passRateObj.passRate,
      raschLogitDifficulty: raschObj.calibratedDifficultyLogits,
      raschStandardError: raschObj.standardError,
      anomalyStatus: anomalyObj.flag,
      calculationMethod: 'empirical_1pl_v1',
      sampleSizeStatus,
      calculatedAt: now
    },
    create: {
      questionId: question.id,
      questionVersion: version,
      totalResponses: eligibleCount,
      correctResponses: correctCount,
      pValue: passRateObj.passRate,
      raschLogitDifficulty: raschObj.calibratedDifficultyLogits,
      raschStandardError: raschObj.standardError,
      anomalyStatus: anomalyObj.flag,
      calculationMethod: 'empirical_1pl_v1',
      sampleSizeStatus,
      calculatedAt: now
    }
  });

  return {
    questionId: question.id,
    questionVersion: version,
    subject: question.subject,
    topic: question.topic,
    editorialDifficulty: question.difficulty,
    eligibleResponseCount: eligibleCount,
    correctResponseCount: correctCount,
    pValue: passRateObj.passRate,
    passRatePercent: passRateObj.passRatePercent,
    failureRatePercent: passRateObj.failureRatePercent,
    sampleSizeStatus,
    anomaly: anomalyObj,
    rasch1PL: {
      logitDifficulty: raschObj.calibratedDifficultyLogits,
      standardError: raschObj.standardError,
      status: raschObj.calibrationStatus,
      uncertaintyWarning: eligibleCount < 30 ? 'Sample size below N=30 threshold; logit parameter not estimated.' : null,
      interpretation: raschObj.calibratedDifficultyLogits !== null
        ? (raschObj.calibratedDifficultyLogits > 0 ? 'Harder than average cohort ability' : 'Easier than average cohort ability')
        : 'Pending adequate sample'
    },
    calculationTimestamp: now.toISOString(),
    calculationMethod: 'empirical_1pl_v1'
  };
}

/**
 * Returns comprehensive analytics across all questions in the bank.
 */
async function getAllQuestionAnalytics(filters = {}) {
  const { subject, topic, difficulty, anomalyOnly } = filters;

  const where = { isActive: true };
  if (subject && subject !== 'All') where.subject = subject;
  if (topic && topic !== 'All') where.topic = topic;
  if (difficulty && difficulty !== 'All') where.difficulty = difficulty.toUpperCase();

  const questions = await prisma.question.findMany({
    where,
    include: {
      statistics: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const results = [];

  for (const q of questions) {
    const existingStat = q.statistics[0];
    const eligibleCount = existingStat?.totalResponses || 0;
    const correctCount = existingStat?.correctResponses || 0;

    const passRateObj = calculateEmpiricalPassRate(correctCount, eligibleCount);
    const anomalyObj = detectDifficultyAnomaly(q.difficulty, passRateObj);
    const raschObj = estimateRaschItemDifficulty(correctCount, eligibleCount);

    if (anomalyOnly && anomalyObj.flag !== 'anomaly_detected') {
      continue;
    }

    results.push({
      id: q.id,
      questionText: q.questionText,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty.toLowerCase(),
      status: q.status.toLowerCase(),
      eligibleResponses: eligibleCount,
      correctResponses: correctCount,
      pValue: passRateObj.passRate,
      passRatePercent: passRateObj.passRatePercent,
      failureRatePercent: passRateObj.failureRatePercent,
      anomaly: anomalyObj,
      rasch: raschObj
    });
  }

  return {
    success: true,
    count: results.length,
    questions: results
  };
}

module.exports = {
  computeQuestionStatistics,
  getAllQuestionAnalytics
};
