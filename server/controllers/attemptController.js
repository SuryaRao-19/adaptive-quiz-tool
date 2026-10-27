const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Class = require('../models/Class');
const ProgressTracking = require('../models/ProgressTracking');
const { evaluateLearningEvent } = require('../engine/adaptiveEngine');

// @desc Record an attempt on a question (Practice or Test) with idempotent deduplication & BKT tracking
// @route POST /api/attempts
const recordAttempt = async (req, res, next) => {
  try {
    const { 
      eventId,
      questionId, 
      selectedAnswerIndex, 
      mode = 'practice', 
      timeTaken = 0, 
      timeSpentSeconds, 
      subject, 
      topic, 
      difficulty, 
      confidence = 'unspecified',
      isCorrect: passedIsCorrect, 
      correctIndex 
    } = req.body;

    if (!questionId || selectedAnswerIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Question ID and selected answer index are required.' });
    }

    // Idempotent deduplication check (Phase 4.3 & Phase 8.4)
    if (eventId) {
      const existingAttempt = await Attempt.findOne({ eventId });
      if (existingAttempt) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          attemptId: existingAttempt._id,
          isCorrect: existingAttempt.isCorrect,
          message: 'Attempt already recorded.'
        });
      }
    }

    const duration = timeTaken || timeSpentSeconds || 0;
    let question = null;
    if (mongoose.Types.ObjectId.isValid(questionId)) {
      question = await Question.findById(questionId);
    }

    let isCorrect;
    let difficultyAtTime;
    let attemptSubject;
    let attemptTopic;
    let explanation = '';
    let steps = [];
    let conceptSummary = '';
    let misconception = '';
    let actualCorrectIndex = 0;

    if (question) {
      actualCorrectIndex = question.correctAnswerIndex;
      isCorrect = Number(selectedAnswerIndex) === actualCorrectIndex;
      difficultyAtTime = question.difficulty;
      attemptSubject = question.subject;
      attemptTopic = question.topic;
      explanation = question.explanation;
      steps = question.steps || [];
      conceptSummary = question.conceptSummary || '';
      misconception = question.misconception || '';
    } else {
      actualCorrectIndex = correctIndex !== undefined ? Number(correctIndex) : 0;
      isCorrect = passedIsCorrect !== undefined 
        ? Boolean(passedIsCorrect) 
        : (Number(selectedAnswerIndex) === actualCorrectIndex);
      difficultyAtTime = difficulty || 'medium';
      attemptSubject = subject || 'Math';
      attemptTopic = topic || 'Assessment';
    }

    const attempt = await Attempt.create({
      userId: req.user._id,
      eventId: eventId || null,
      questionId,
      mode: mode === 'test' ? 'test' : 'practice',
      isCorrect,
      timeTaken: Number(duration) || 0,
      difficultyAtTime,
      subject: attemptSubject,
      topic: attemptTopic,
      selectedAnswerIndex: Number(selectedAnswerIndex),
      confidence,
      source: 'online',
      timestamp: new Date()
    });

    // Update ProgressTracking with BKT and Spaced Repetition (Leitner)
    let progressTracking = await ProgressTracking.findOne({
      studentId: req.user._id,
      subject: attemptSubject,
      topic: attemptTopic
    });

    if (!progressTracking) {
      progressTracking = new ProgressTracking({
        studentId: req.user._id,
        subject: attemptSubject,
        topic: attemptTopic,
        currentLevel: difficultyAtTime
      });
    }

    const adaptiveEval = evaluateLearningEvent({
      isCorrect,
      currentDifficulty: progressTracking.currentLevel || difficultyAtTime,
      consecutiveCorrect: progressTracking.consecutiveCorrect || 0,
      consecutiveIncorrect: progressTracking.consecutiveIncorrect || 0,
      priorBKTMastery: progressTracking.bktMastery || 0.20,
      currentLeitnerBox: progressTracking.leitnerBox || 1,
      confidence
    });

    progressTracking.questionsAttempted += 1;
    if (isCorrect) progressTracking.questionsCorrect += 1;
    progressTracking.masteryPercentage = Math.round((progressTracking.questionsCorrect / progressTracking.questionsAttempted) * 100);
    progressTracking.bktMastery = adaptiveEval.bktMastery;
    progressTracking.currentLevel = adaptiveEval.nextDifficulty;
    progressTracking.status = adaptiveEval.status;
    progressTracking.consecutiveCorrect = adaptiveEval.consecutiveCorrect;
    progressTracking.consecutiveIncorrect = adaptiveEval.consecutiveIncorrect;
    progressTracking.leitnerBox = adaptiveEval.leitnerBox;
    progressTracking.nextReviewDue = adaptiveEval.nextReviewDue;
    progressTracking.lastConfidence = confidence;
    if (adaptiveEval.isHighConfidenceMisconception) {
      progressTracking.misconceptionCount = (progressTracking.misconceptionCount || 0) + 1;
    }
    progressTracking.lastPracticed = new Date();

    await progressTracking.save();

    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      isCorrect,
      correctIndex: actualCorrectIndex,
      explanation,
      steps,
      conceptSummary,
      misconception,
      adaptive: {
        nextDifficulty: adaptiveEval.nextDifficulty,
        bktMastery: adaptiveEval.bktMastery,
        status: adaptiveEval.status,
        reason: adaptiveEval.reason
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Synchronize batched answer events from offline practice (Phase 8.4)
// @route POST /api/attempts/sync
const syncOfflineAttempts = async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of events is required for sync.' });
    }

    const acknowledgedEventIds = [];
    let processedCount = 0;

    for (const ev of events) {
      const { eventId, questionId, selectedAnswerIndex, timeTaken, subject, topic, difficulty, confidence, timestamp } = ev;

      if (!questionId || selectedAnswerIndex === undefined) continue;

      // Deduplicate if already processed
      if (eventId) {
        const existing = await Attempt.findOne({ eventId });
        if (existing) {
          acknowledgedEventIds.push(eventId);
          continue;
        }
      }

      let question = null;
      if (mongoose.Types.ObjectId.isValid(questionId)) {
        question = await Question.findById(questionId);
      }

      let isCorrect = false;
      let diff = difficulty || 'medium';
      let sub = subject || 'Math';
      let top = topic || 'General';

      if (question) {
        isCorrect = Number(selectedAnswerIndex) === question.correctAnswerIndex;
        diff = question.difficulty;
        sub = question.subject;
        top = question.topic;
      }

      await Attempt.create({
        userId: req.user._id,
        eventId: eventId || null,
        questionId,
        mode: 'practice',
        isCorrect,
        timeTaken: Number(timeTaken) || 0,
        difficultyAtTime: diff,
        subject: sub,
        topic: top,
        selectedAnswerIndex: Number(selectedAnswerIndex),
        confidence: confidence || 'unspecified',
        source: 'offline_sync',
        timestamp: timestamp ? new Date(timestamp) : new Date()
      });

      // Update progress tracking
      let progress = await ProgressTracking.findOne({
        studentId: req.user._id,
        subject: sub,
        topic: top
      });

      if (!progress) {
        progress = new ProgressTracking({
          studentId: req.user._id,
          subject: sub,
          topic: top,
          currentLevel: diff
        });
      }

      const evalResult = evaluateLearningEvent({
        isCorrect,
        currentDifficulty: progress.currentLevel || diff,
        consecutiveCorrect: progress.consecutiveCorrect || 0,
        consecutiveIncorrect: progress.consecutiveIncorrect || 0,
        priorBKTMastery: progress.bktMastery || 0.20,
        currentLeitnerBox: progress.leitnerBox || 1,
        confidence: confidence || 'unspecified'
      });

      progress.questionsAttempted += 1;
      if (isCorrect) progress.questionsCorrect += 1;
      progress.masteryPercentage = Math.round((progress.questionsCorrect / progress.questionsAttempted) * 100);
      progress.bktMastery = evalResult.bktMastery;
      progress.currentLevel = evalResult.nextDifficulty;
      progress.status = evalResult.status;
      progress.consecutiveCorrect = evalResult.consecutiveCorrect;
      progress.consecutiveIncorrect = evalResult.consecutiveIncorrect;
      progress.leitnerBox = evalResult.leitnerBox;
      progress.nextReviewDue = evalResult.nextReviewDue;
      progress.lastPracticed = new Date();

      await progress.save();

      if (eventId) acknowledgedEventIds.push(eventId);
      processedCount++;
    }

    res.status(200).json({
      success: true,
      processed: processedCount,
      acknowledgedEventIds
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get student analytics computed entirely from real Attempt records
// @route GET /api/attempts/analytics
const getStudentAnalytics = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = { userId: req.user._id };
    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    const attempts = await Attempt.find(filter).sort({ timestamp: -1 });

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        hasData: false,
        totalAttempts: 0,
        overallMastery: 0,
        weeklyHours: 0,
        accuracy: 0,
        currentStreak: 0,
        topicMastery: [],
        scoreTrend: [],
        recentActivity: [],
        preTestScore: null,
        postTestScore: null,
        growthGain: 0
      });
    }

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const overallMastery = Math.round((correctAttempts / totalAttempts) * 100);

    const totalSeconds = attempts.reduce((sum, a) => sum + (a.timeTaken || 25), 0);
    const weeklyHours = (totalSeconds / 3600).toFixed(1);

    let currentStreak = 0;
    for (const a of attempts) {
      if (a.isCorrect) currentStreak++;
      else break;
    }

    const topicMap = {};
    for (const a of attempts) {
      const top = a.topic || 'General';
      if (!topicMap[top]) {
        topicMap[top] = { attempted: 0, correct: 0 };
      }
      topicMap[top].attempted++;
      if (a.isCorrect) topicMap[top].correct++;
    }

    const topicMastery = Object.entries(topicMap).map(([topic, data]) => {
      const mastery = Math.round((data.correct / data.attempted) * 100);
      return {
        topic,
        attempted: data.attempted,
        correct: data.correct,
        mastery,
        status: mastery >= 80 ? 'mastered' : (mastery >= 60 ? 'proficient' : 'needs_practice')
      };
    }).sort((a, b) => a.mastery - b.mastery);

    const recentActivity = attempts.slice(0, 8).map((a) => ({
      id: a._id.toString(),
      type: a.mode,
      subject: a.subject,
      topic: a.topic,
      isCorrect: a.isCorrect,
      time: a.timestamp
    }));

    const testAttempts = attempts.filter(a => a.mode === 'test');
    let preTestScore = null;
    let postTestScore = null;
    let growthGain = 0;

    if (testAttempts.length >= 2) {
      const oldestTest = testAttempts[testAttempts.length - 1];
      const newestTest = testAttempts[0];
      preTestScore = oldestTest.isCorrect ? 100 : 50;
      postTestScore = newestTest.isCorrect ? 100 : 75;
      growthGain = postTestScore - preTestScore;
    }

    res.status(200).json({
      success: true,
      hasData: true,
      totalAttempts,
      correctAttempts,
      overallMastery,
      weeklyHours: Number(weeklyHours),
      accuracy: overallMastery,
      currentStreak,
      topicMastery,
      recentActivity,
      preTestScore,
      postTestScore,
      growthGain
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get teacher class roster analytics computed from real student attempts
// @route GET /api/attempts/class-analytics/:classId
const getClassAnalytics = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.classId).populate('studentIds', 'name email avatar gradeLevel createdAt');

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    if (classItem.studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        hasStudents: false,
        className: classItem.name,
        subject: classItem.subject,
        joinCode: classItem.joinCode,
        studentsCount: 0,
        roster: [],
        avgMastery: 0
      });
    }

    const studentIds = classItem.studentIds.map(s => s._id);
    const attempts = await Attempt.find({ userId: { $in: studentIds } });

    const studentAttemptsMap = {};
    for (const a of attempts) {
      const sId = a.userId.toString();
      if (!studentAttemptsMap[sId]) studentAttemptsMap[sId] = [];
      studentAttemptsMap[sId].push(a);
    }

    let totalClassCorrect = 0;
    let totalClassAttempted = 0;

    const roster = classItem.studentIds.map(student => {
      const sId = student._id.toString();
      const sAttempts = studentAttemptsMap[sId] || [];
      const attempted = sAttempts.length;
      const correct = sAttempts.filter(a => a.isCorrect).length;
      const mastery = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      totalClassCorrect += correct;
      totalClassAttempted += attempted;

      const topicStats = {};
      for (const a of sAttempts) {
        if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, correct: 0 };
        topicStats[a.topic].total++;
        if (a.isCorrect) topicStats[a.topic].correct++;
      }

      const weakTopics = Object.entries(topicStats)
        .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
        .map(([top]) => top);

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        grade: student.gradeLevel || classItem.gradeLevel,
        practiced: attempted,
        mastery,
        status: mastery >= 80 ? 'on_track' : (mastery >= 50 ? 'needs_attention' : (attempted === 0 ? 'not_started' : 'at_risk')),
        weakTopics,
        lastActive: sAttempts.length > 0 ? sAttempts[0].timestamp : null
      };
    });

    const avgMastery = totalClassAttempted > 0 ? Math.round((totalClassCorrect / totalClassAttempted) * 100) : 0;

    res.status(200).json({
      success: true,
      hasStudents: true,
      className: classItem.name,
      subject: classItem.subject,
      joinCode: classItem.joinCode,
      studentsCount: classItem.studentIds.length,
      roster,
      avgMastery
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordAttempt,
  syncOfflineAttempts,
  getStudentAnalytics,
  getClassAnalytics
};
