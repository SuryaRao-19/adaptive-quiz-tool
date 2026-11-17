const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const ProgressTracking = require('../models/ProgressTracking');
const { calculateNextDifficulty } = require('../engine/adaptiveEngine');
const { THRESHOLDS } = require('../config/constants');

// @desc Get diagnostic pre-test questions
// @route GET /api/quiz/pre-test
const getPreTest = async (req, res, next) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }

    // Check if student has already completed pre-test for this subject
    const existingAttempt = await QuizAttempt.findOne({
      studentId: req.user._id,
      subject,
      quizType: 'pre_test'
    });

    if (existingAttempt) {
      return res.status(403).json({
        success: false,
        message: `Diagnostic Pre-Test for ${subject} has already been completed. Continue with adaptive practice!`
      });
    }

    // Fetch balanced sample: up to 5 easy, 5 medium, 5 hard (Approved questions only)
    const easyQuestions = await Question.aggregate([
      { $match: { subject, difficulty: 'easy', isActive: true, status: 'approved' } },
      { $sample: { size: 5 } },
      { $project: { correctAnswerIndex: 0, explanation: 0 } }
    ]);

    const mediumQuestions = await Question.aggregate([
      { $match: { subject, difficulty: 'medium', isActive: true, status: 'approved' } },
      { $sample: { size: 5 } },
      { $project: { correctAnswerIndex: 0, explanation: 0 } }
    ]);

    const hardQuestions = await Question.aggregate([
      { $match: { subject, difficulty: 'hard', isActive: true, status: 'approved' } },
      { $sample: { size: 5 } },
      { $project: { correctAnswerIndex: 0, explanation: 0 } }
    ]);

    let combined = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    
    // If not enough distributed questions, fetch any active approved questions up to 15
    if (combined.length < 15) {
      const remainingCount = 15 - combined.length;
      const existingIds = combined.map(q => q._id);
      const additional = await Question.aggregate([
        { $match: { subject, isActive: true, status: 'approved', _id: { $nin: existingIds } } },
        { $sample: { size: remainingCount } },
        { $project: { correctAnswerIndex: 0, explanation: 0 } }
      ]);
      combined = [...combined, ...additional];
    }

    // Deduplicate to guarantee zero repeated questions in diagnostic test
    const seenMap = new Map();
    combined.forEach(q => {
      const key = String(q._id || q.id || q.questionText);
      if (!seenMap.has(key)) seenMap.set(key, q);
    });
    const uniqueCombined = Array.from(seenMap.values());

    res.status(200).json({
      success: true,
      subject,
      totalQuestions: uniqueCombined.length,
      questions: uniqueCombined
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single next question for adaptive practice
// @route GET /api/quiz/practice-question
const getPracticeQuestion = async (req, res, next) => {
  try {
    const { subject, topic, currentDifficulty = 'medium', recentHistory, excludeIds } = req.query;

    if (!subject || !topic) {
      return res.status(400).json({ success: false, message: 'Subject and topic are required.' });
    }

    let parsedHistory = [];
    if (recentHistory) {
      parsedHistory = recentHistory.split(',').map(item => item === 'true');
    }

    const calculatedDifficulty = calculateNextDifficulty(parsedHistory, currentDifficulty);

    let excludedObjectIds = [];
    const excludedSet = new Set();
    if (excludeIds) {
      const parts = String(excludeIds).split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => excludedSet.add(p));
      excludedObjectIds = parts.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    }

    // Try finding at target difficulty in database (Approved only)
    let question = await Question.findOne({
      subject,
      topic,
      difficulty: calculatedDifficulty,
      isActive: true,
      status: 'approved',
      _id: { $nin: excludedObjectIds }
    }).select('-correctAnswerIndex -explanation');

    let servedDifficulty = calculatedDifficulty;

    // Fallback 1: Try adjacent difficulty if bucket exhausted in DB
    if (!question) {
      const fallbackDifficulty = calculatedDifficulty === 'hard' ? 'medium' : 'easy';
      question = await Question.findOne({
        subject,
        topic,
        difficulty: fallbackDifficulty,
        isActive: true,
        status: 'approved',
        _id: { $nin: excludedObjectIds }
      }).select('-correctAnswerIndex -explanation');
      if (question) servedDifficulty = fallbackDifficulty;
    }

    // Fallback 2: Any unseen question in this topic in DB
    if (!question) {
      question = await Question.findOne({
        subject,
        topic,
        isActive: true,
        status: 'approved',
        _id: { $nin: excludedObjectIds }
      }).select('-correctAnswerIndex -explanation');
      if (question) servedDifficulty = question.difficulty;
    }

    // Fallback 3: Pull from comprehensive questionBankStore.json and multiGradeQuestions.json (NCERT Classes 1-12)
    if (!question) {
      try {
        let allBankQuestions = [];
        try {
          const qBank = require('../data/questionBankStore.json');
          if (Array.isArray(qBank)) allBankQuestions.push(...qBank);
        } catch (_) {}
        try {
          const multiGrade = require('../data/multiGradeQuestions.json');
          if (Array.isArray(multiGrade)) allBankQuestions.push(...multiGrade);
        } catch (_) {}

        const userGrade = req.query.grade || req.user?.gradeLevel || req.user?.grade || 7;
        
        // Filter out already served questions to guarantee no repetition
        const candidatePool = allBankQuestions.filter(q => {
          const qId = String(q.id || q._id || '');
          if (qId && excludedSet.has(qId)) return false;
          const qGrade = q.gradeLevel || q.grade;
          if (userGrade && String(qGrade) !== String(userGrade)) return false;
          if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
          return true;
        });

        // 3a: Exact topic & exact calculated difficulty
        const topicMatches = candidatePool.filter(q => {
          const t = (q.topic || q.chapter || '').toLowerCase();
          return t.includes(topic.toLowerCase()) || topic.toLowerCase().includes(t);
        });

        const exactDiffTopic = topicMatches.filter(q => (q.difficulty || 'medium').toLowerCase() === calculatedDifficulty);
        const adjacentDiffTopic = topicMatches.filter(q => (q.difficulty || 'medium').toLowerCase() === (calculatedDifficulty === 'hard' ? 'medium' : 'easy'));

        const chosen = exactDiffTopic[0] || adjacentDiffTopic[0] || topicMatches[0] || candidatePool[0];

        if (chosen) {
          question = {
            ...chosen,
            _id: chosen.id || chosen._id
          };
          servedDifficulty = (chosen.difficulty || 'medium').toLowerCase();
        }
      } catch (err) {
        // Continue
      }
    }

    // Fallback 4: If literally ALL questions in bank have been answered, recycle least recently answered
    if (!question) {
      question = await Question.findOne({
        subject,
        topic,
        isActive: true,
        status: 'approved'
      }).select('-correctAnswerIndex -explanation');
      if (question) servedDifficulty = question.difficulty;
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'No questions currently available for this topic.' });
    }

    res.status(200).json({
      success: true,
      question,
      servedDifficulty
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit answers for grading and progress update
// @route POST /api/quiz/submit
const submitQuiz = async (req, res, next) => {
  try {
    const { quizType, subject, topic = 'Diagnostic', answers } = req.body;

    if (!quizType || !subject || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid submission data.' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    let correctCount = 0;
    const detailedResults = [];
    const attemptAnswers = [];
    const topicStats = {};

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId.toString());
      if (!q) continue;

      const isCorrect = q.correctAnswerIndex === Number(ans.selectedOptionIndex);
      if (isCorrect) correctCount++;

      detailedResults.push({
        questionId: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        levelName: q.levelName,
        selectedOptionIndex: ans.selectedOptionIndex,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation,
        steps: q.steps,
        conceptSummary: q.conceptSummary,
        misconception: q.misconception
      });

      attemptAnswers.push({
        questionId: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect
      });

      // Accumulate topic stats for updating ProgressTracking
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { attempted: 0, correct: 0, lastDifficulty: q.difficulty };
      }
      topicStats[q.topic].attempted++;
      if (isCorrect) topicStats[q.topic].correct++;
      topicStats[q.topic].lastDifficulty = q.difficulty;
    }

    const totalQuestions = answers.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Record Attempt
    const quizAttempt = await QuizAttempt.create({
      studentId: req.user._id,
      quizType,
      subject,
      topic,
      answers: attemptAnswers,
      totalQuestions,
      correctAnswers: correctCount,
      scorePercentage
    });

    // Update ProgressTracking for each affected topic
    for (const [tName, stats] of Object.entries(topicStats)) {
      let progress = await ProgressTracking.findOne({
        studentId: req.user._id,
        subject,
        topic: tName
      });

      if (!progress) {
        progress = new ProgressTracking({
          studentId: req.user._id,
          subject,
          topic: tName,
          questionsAttempted: 0,
          questionsCorrect: 0,
          currentLevel: stats.lastDifficulty || 'medium'
        });
      }

      progress.questionsAttempted += stats.attempted;
      progress.questionsCorrect += stats.correct;
      progress.masteryPercentage = progress.questionsAttempted > 0
        ? Math.round((progress.questionsCorrect / progress.questionsAttempted) * 100)
        : 0;

      if (progress.masteryPercentage < THRESHOLDS.WEAK_TOPIC_ACCURACY) {
        progress.status = 'needs_focus';
      } else if (progress.masteryPercentage >= THRESHOLDS.MASTERED_TOPIC_ACCURACY) {
        progress.status = 'mastered';
      } else {
        progress.status = 'in_progress';
      }

      progress.currentLevel = stats.lastDifficulty;
      progress.lastPracticed = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      attemptId: quizAttempt._id,
      totalQuestions,
      correctAnswers: correctCount,
      scorePercentage,
      results: detailedResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get post-test questions
// @route GET /api/quiz/post-test
const getPostTest = async (req, res, next) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }

    // Check practice question count requirement
    const progressList = await ProgressTracking.find({
      studentId: req.user._id,
      subject
    });

    const totalPracticeQuestions = progressList.reduce((sum, p) => sum + p.questionsAttempted, 0);

    if (totalPracticeQuestions < THRESHOLDS.POST_TEST_UNLOCK_REQUIREMENT) {
      return res.status(403).json({
        success: false,
        message: `You must complete at least ${THRESHOLDS.POST_TEST_UNLOCK_REQUIREMENT} practice questions before taking the Post-Test. (Current: ${totalPracticeQuestions})`
      });
    }

    // Check if post-test already completed
    const existingPostTest = await QuizAttempt.findOne({
      studentId: req.user._id,
      subject,
      quizType: 'post_test'
    });

    if (existingPostTest) {
      return res.status(400).json({
        success: false,
        message: `Post-test for ${subject} has already been completed. View your Improvement Report on the dashboard!`
      });
    }

    // Fetch 15 balanced questions for post-test (Approved only)
    const questions = await Question.aggregate([
      { $match: { subject, isActive: true, status: 'approved' } },
      { $sample: { size: 15 } },
      { $project: { correctAnswerIndex: 0, explanation: 0 } }
    ]);

    res.status(200).json({
      success: true,
      subject,
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get available syllabus topics for a subject
// @route GET /api/quiz/topics
const getTopics = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = subject ? { subject, isActive: true, status: 'approved' } : { isActive: true, status: 'approved' };
    const topics = await Question.distinct('topic', filter);
    res.status(200).json({
      success: true,
      subject: subject || 'All',
      topics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreTest,
  getPracticeQuestion,
  submitQuiz,
  getPostTest,
  getTopics
};
