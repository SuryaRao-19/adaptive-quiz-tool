/**
 * AdaptIQ 3.0 — Spaced Repetition & Revision Engine
 * server/services/adaptive/spacedRepetitionEngine.js
 * 
 * Implements a deterministic Leitner 5-box spaced repetition algorithm:
 * - Box 1: 1 day interval
 * - Box 2: 3 days interval
 * - Box 3: 7 days interval
 * - Box 4: 14 days interval
 * - Box 5: 30 days interval (Mastered)
 * 
 * Rules:
 * - Correct answer advances card to Box min(box + 1, 5).
 * - Incorrect answer demotes card back to Box 1.
 * - Computes due items (nextReviewDate <= now).
 * - Categorizes items into: dueToday, upcoming, overdue, and weakTopics.
 */

const LEITNER_INTERVALS = {
  1: 1,   // 1 day
  2: 3,   // 3 days
  3: 7,   // 7 days
  4: 14,  // 14 days
  5: 30   // 30 days
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculates next review timestamp based on box index.
 * @param {number} box - Box index (1-5)
 * @param {Date|string|number} [baseDate=new Date()]
 * @returns {Date}
 */
function calculateNextReviewDate(box, baseDate = new Date()) {
  const current = new Date(baseDate);
  const clampedBox = Math.max(1, Math.min(5, Math.floor(box || 1)));
  const intervalDays = LEITNER_INTERVALS[clampedBox] || 1;
  return new Date(current.getTime() + (intervalDays * MS_PER_DAY));
}

/**
 * Updates a spaced repetition card state following a study attempt.
 * @param {Object} card
 * @param {number} card.box - Current box (1-5)
 * @param {boolean} isCorrect - Whether student answered correctly
 * @param {Date|string|number} [attemptDate=new Date()]
 * @returns {Object} Updated card attributes
 */
function processCardReview(card, isCorrect, attemptDate = new Date()) {
  const now = new Date(attemptDate);
  const currentBox = Math.max(1, Math.min(5, card.box || 1));
  const reviewCount = (card.reviewCount || 0) + 1;
  const streak = isCorrect ? ((card.streak || 0) + 1) : 0;

  let newBox;
  let movement;

  if (isCorrect) {
    newBox = Math.min(5, currentBox + 1);
    movement = newBox === currentBox ? 'STABLE_MASTERED' : 'PROMOTED';
  } else {
    newBox = 1; // Strict Leitner demotion to Box 1
    movement = 'DEMOTED_TO_BOX_1';
  }

  const nextReviewDate = calculateNextReviewDate(newBox, now);

  return {
    ...card,
    box: newBox,
    movement,
    streak,
    reviewCount,
    lastReviewedAt: now.toISOString(),
    nextReviewDate: nextReviewDate.toISOString(),
    isMastered: newBox === 5
  };
}

/**
 * Generates comprehensive revision schedule and categorization for a student.
 * @param {Array<Object>} cards - List of student revision card objects
 * @param {Date|string|number} [referenceDate=new Date()]
 * @returns {Object} Schedule containing dueToday, upcoming, overdue, and weakTopics
 */
function generateRevisionSchedule(cards = [], referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const threeDaysOut = new Date(now.getTime() + (3 * MS_PER_DAY));

  const dueToday = [];
  const upcoming = [];
  const overdue = [];
  const boxDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const topicStats = {};

  cards.forEach(card => {
    const box = Math.max(1, Math.min(5, card.box || 1));
    boxDistribution[box] = (boxDistribution[box] || 0) + 1;

    // Track topic performance
    const topic = card.topic || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, incorrect: 0, cards: [] };
    }
    topicStats[topic].total += 1;
    if (card.box === 1 || card.lastScore === 0) {
      topicStats[topic].incorrect += 1;
    }
    topicStats[topic].cards.push(card);

    // Schedule evaluation
    const reviewDate = card.nextReviewDate ? new Date(card.nextReviewDate) : new Date(now.getTime() - 1000);
    const isPastDue = reviewDate < now;
    const isDueToday = reviewDate <= todayEnd;

    if (isPastDue && (now.getTime() - reviewDate.getTime() > MS_PER_DAY)) {
      overdue.push({
        ...card,
        daysOverdue: Math.floor((now.getTime() - reviewDate.getTime()) / MS_PER_DAY),
        urgency: 'HIGH'
      });
    }

    if (isDueToday) {
      dueToday.push(card);
    } else if (reviewDate <= threeDaysOut) {
      upcoming.push({
        ...card,
        dueInDays: Math.ceil((reviewDate.getTime() - now.getTime()) / MS_PER_DAY)
      });
    }
  });

  // Calculate weak topics (>40% error rate or high concentration in Box 1)
  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => stats.total >= 2 && (stats.incorrect / stats.total) >= 0.4)
    .map(([topic, stats]) => ({
      topic,
      totalCards: stats.total,
      strugglingCards: stats.incorrect,
      errorRate: Math.round((stats.incorrect / stats.total) * 100),
      recommendedAction: 'Schedule 15-minute targeted revision drill on this topic.'
    }))
    .sort((a, b) => b.errorRate - a.errorRate);

  return {
    summary: {
      totalCards: cards.length,
      dueTodayCount: dueToday.length,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length,
      masteredCount: boxDistribution[5] || 0,
      retentionRate: cards.length > 0 
        ? Math.round(((cards.length - (boxDistribution[1] || 0)) / cards.length) * 100) 
        : 100
    },
    boxDistribution,
    dueToday,
    upcoming,
    overdue,
    weakTopics
  };
}

module.exports = {
  LEITNER_INTERVALS,
  calculateNextReviewDate,
  processCardReview,
  generateRevisionSchedule
};
