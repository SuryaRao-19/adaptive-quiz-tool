/**
 * AdaptIQ 3.0 — Adaptive Learning Controller
 * server/controllers/adaptiveController.js
 * 
 * Provides deterministic REST APIs for:
 * 1. Adaptive step evaluation (BKT + Rasch + 3-up/2-down + Leitner)
 * 2. Next question selection with exposure control and formal blueprint locking
 * 3. Spaced repetition schedule generation and card reviews
 * 4. Misconception diagnostic analysis
 */

const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const {
  updateMasteryBKT,
  evaluateDifficultyTransition,
  calculateRaschProbability,
  estimateAbilityRasch,
  calculateHakeGain,
  selectNextQuestion,
  processCardReview,
  generateRevisionSchedule,
  evaluateLearningGaps,
  diagnoseResponse,
  generateSimilarQuestion,
  recordLearnerAttempt,
  createInitialLearnerProfile
} = require('../services/adaptive');

/**
 * @desc Evaluate student response and compute deterministic adaptive state update
 * @route POST /api/adaptive/evaluate
 */
const evaluateAdaptiveStep = async (req, res) => {
  try {
    const {
      currentMastery = 0.5,
      recentAnswers = [],
      currentDifficulty = 'medium',
      responseIsCorrect,
      itemDifficultyValue = 0,
      studentAbilityTheta = 0,
      topic = 'General',
      currentBox = 1
    } = req.body;

    if (responseIsCorrect === undefined) {
      return res.status(400).json({ success: false, message: 'responseIsCorrect (boolean) is required.' });
    }

    const isCorrect = Boolean(responseIsCorrect);
    const updatedHistory = [...recentAnswers, isCorrect];

    // 1. Bayesian Knowledge Tracing update
    const bktResult = updateMasteryBKT(currentMastery, isCorrect);

    // 2. Difficulty Transition (3-up / 2-down rule)
    const transitionResult = evaluateDifficultyTransition(updatedHistory, currentDifficulty);

    // 3. Rasch Item Response Theory probability
    const expectedProbability = calculateRaschProbability(studentAbilityTheta, itemDifficultyValue);

    // 4. Leitner Spaced Repetition update
    const cardReview = processCardReview({ box: currentBox, topic }, isCorrect);

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        mastery: {
          previousMastery: currentMastery,
          currentMastery: bktResult.newMastery,
          status: bktResult.status
        },
        difficulty: {
          previousDifficulty: currentDifficulty,
          recommendedDifficulty: transitionResult.recommendedDifficulty,
          streakLength: transitionResult.streakLength,
          streakType: transitionResult.streakType,
          action: transitionResult.action,
          decisionReason: transitionResult.decisionReason
        },
        raschModel: {
          studentAbilityTheta,
          itemDifficultyValue,
          expectedCorrectProbability: expectedProbability,
          surpriseFactor: isCorrect ? +(1 - expectedProbability).toFixed(3) : +expectedProbability.toFixed(3)
        },
        spacedRepetition: {
          previousBox: currentBox,
          newBox: cardReview.box,
          movement: cardReview.movement,
          nextReviewDate: cardReview.nextReviewDate
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Deterministically select next best question
 * @route POST /api/adaptive/next-question
 */
const getNextQuestion = async (req, res) => {
  try {
    const {
      grade,
      subject,
      topic,
      currentDifficulty = 'medium',
      answeredQuestionIds = [],
      isSummativeBlueprint = false,
      blueprintTarget = null
    } = req.body;

    // Fetch candidate questions from database with deterministic JSON fallback
    const query = {};
    if (grade) query.grade = grade;
    if (subject) query.subject = new RegExp(`^${subject}$`, 'i');
    if (topic && topic !== 'All') query.topic = new RegExp(topic, 'i');

    let availableCandidates = [];
    try {
      availableCandidates = await Question.find(query).lean();
    } catch (err) {
      availableCandidates = [];
    }

    if (!availableCandidates || availableCandidates.length === 0) {
      const multiGradeQuestions = require('../data/multiGradeQuestions.json');
      availableCandidates = multiGradeQuestions.filter(q => {
        const qGrade = q.gradeLevel || q.grade;
        if (grade && String(qGrade) !== String(grade)) return false;
        if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
        if (topic && topic !== 'All' && q.topic && !q.topic.toLowerCase().includes(topic.toLowerCase())) return false;
        return true;
      });

      // If topic was overly specific, fallback to grade and subject
      if (availableCandidates.length === 0 && subject) {
        availableCandidates = multiGradeQuestions.filter(q => {
          const qGrade = q.gradeLevel || q.grade;
          if (grade && String(qGrade) !== String(grade)) return false;
          if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
          return true;
        });
      }
    }

    // Use Question Selector
    const selection = selectNextQuestion({
      availableQuestions: availableCandidates,
      studentHistory: answeredQuestionIds,
      currentDifficulty,
      targetGrade: grade,
      targetSubject: subject,
      targetTopic: topic,
      isSummativeBlueprint,
      blueprintTarget
    });

    if (!selection.selectedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'No eligible questions found matching criteria.',
        selectionReason: selection.selectionReason
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        question: selection.selectedQuestion,
        selectionReason: selection.selectionReason,
        isFormalLocked: selection.isFormalLocked,
        fallbackApplied: selection.fallbackApplied
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get student's Leitner 5-box revision schedule
 * @route GET /api/adaptive/revision-schedule
 */
const getRevisionSchedule = async (req, res) => {
  try {
    const studentId = req.user ? req.user.id || req.user._id : req.query.studentId;

    // Retrieve recent attempts for this student to build revision cards
    let attempts = [];
    if (studentId) {
      attempts = await Attempt.find({ student: studentId })
        .populate('question')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }

    // Convert attempts into card representation
    const cardMap = new Map();
    attempts.forEach(att => {
      const q = att.question;
      if (!q) return;
      const key = q._id.toString();
      if (!cardMap.has(key)) {
        // Calculate initial box based on attempt success
        const box = att.isCorrect ? 2 : 1;
        cardMap.set(key, {
          id: key,
          questionId: key,
          questionText: q.questionText || q.text || 'Practice Question',
          topic: q.topic || 'General Topic',
          subject: q.subject || 'General',
          difficulty: q.difficulty || 'medium',
          box,
          lastScore: att.isCorrect ? 1 : 0,
          streak: att.isCorrect ? 1 : 0,
          lastReviewedAt: att.createdAt,
          nextReviewDate: new Date(Date.now() + (box === 2 ? 3 : 1) * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    // Provide default fallback cards if none exist
    let cards = Array.from(cardMap.values());
    if (cards.length === 0) {
      const now = Date.now();
      cards = [
        {
          id: 'card_demo_1',
          questionText: 'Simplify the linear expression: 3(x - 4) - 2(2x + 1)',
          topic: 'Algebraic Expressions',
          subject: 'Mathematics',
          difficulty: 'medium',
          box: 1,
          streak: 0,
          lastScore: 0,
          nextReviewDate: new Date(now - 10000).toISOString() // Due today
        },
        {
          id: 'card_demo_2',
          questionText: 'What is the function of xylem vessels in flowering plants?',
          topic: 'Life Processes',
          subject: 'Science',
          difficulty: 'easy',
          box: 2,
          streak: 1,
          lastScore: 1,
          nextReviewDate: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString() // Upcoming
        },
        {
          id: 'card_demo_3',
          questionText: 'State Newton’s Third Law of Motion and specify the interacting bodies.',
          topic: 'Laws of Motion',
          subject: 'Science',
          difficulty: 'hard',
          box: 3,
          streak: 2,
          lastScore: 1,
          nextReviewDate: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString() // Upcoming
        }
      ];
    }

    const schedule = generateRevisionSchedule(cards);

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Review spaced repetition card
 * @route POST /api/adaptive/review-card
 */
const reviewCard = async (req, res) => {
  try {
    const { card, isCorrect } = req.body;
    if (!card || isCorrect === undefined) {
      return res.status(400).json({ success: false, message: 'Card and isCorrect are required.' });
    }

    const updatedCard = processCardReview(card, Boolean(isCorrect));

    return res.status(200).json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Diagnose student misconceptions from attempt history
 * @route POST /api/adaptive/diagnose
 */
const diagnoseMisconceptions = async (req, res) => {
  try {
    const { attempts = [] } = req.body;
    const diagnosis = evaluateLearningGaps(attempts);

    return res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Generate a similar question deterministically using parameter templates
 * @route POST /api/adaptive/similar-question
 */
const getSimilarQuestion = async (req, res) => {
  try {
    const { baseQuestion } = req.body;
    const generated = generateSimilarQuestion(baseQuestion);
    return res.status(200).json({
      success: true,
      data: generated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get learner longitudinal profile
 * @route GET /api/adaptive/learner-profile
 */
const getLearnerProfileEndpoint = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user?.id || 'demo_student';
    const profile = createInitialLearnerProfile(studentId);
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Record attempt and return updated learner profile
 * @route POST /api/adaptive/learner-profile
 */
const updateLearnerProfileEndpoint = async (req, res) => {
  try {
    const { profile, attempt } = req.body;
    const updated = recordLearnerAttempt(profile, attempt || {});
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  evaluateAdaptiveStep,
  getNextQuestion,
  getRevisionSchedule,
  reviewCard,
  diagnoseMisconceptions,
  getSimilarQuestion,
  getLearnerProfileEndpoint,
  updateLearnerProfileEndpoint
};
