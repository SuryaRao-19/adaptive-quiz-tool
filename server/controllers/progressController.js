const ProgressTracking = require('../models/ProgressTracking');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { THRESHOLDS } = require('../config/constants');

// @desc Get student topic mastery & diagnostic status
// @route GET /api/progress/me
const getMyProgress = async (req, res, next) => {
  try {
    const { subject = 'Math' } = req.query;

    const [preTestAttempt, postTestAttempt, topicsProgress] = await Promise.all([
      QuizAttempt.findOne({ studentId: req.user._id, subject, quizType: 'pre_test' }),
      QuizAttempt.findOne({ studentId: req.user._id, subject, quizType: 'post_test' }),
      ProgressTracking.find({ studentId: req.user._id, subject }).sort({ masteryPercentage: 1 })
    ]);

    const totalPracticeQuestionsAnswered = topicsProgress.reduce((sum, item) => sum + item.questionsAttempted, 0);
    const canTakePostTest = totalPracticeQuestionsAnswered >= THRESHOLDS.POST_TEST_UNLOCK_REQUIREMENT && !postTestAttempt;

    res.status(200).json({
      success: true,
      subject,
      hasCompletedPreTest: !!preTestAttempt,
      preTestScore: preTestAttempt ? preTestAttempt.scorePercentage : null,
      hasCompletedPostTest: !!postTestAttempt,
      postTestScore: postTestAttempt ? postTestAttempt.scorePercentage : null,
      totalPracticeQuestionsAnswered,
      requiredQuestionsForPostTest: THRESHOLDS.POST_TEST_UNLOCK_REQUIREMENT,
      canTakePostTest,
      topics: topicsProgress.map(t => ({
        topic: t.topic,
        questionsAttempted: t.questionsAttempted,
        questionsCorrect: t.questionsCorrect,
        masteryPercentage: t.masteryPercentage,
        status: t.status,
        currentLevel: t.currentLevel,
        lastPracticed: t.lastPracticed
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Pre-test vs Post-test comparison delta report
// @route GET /api/progress/comparison-report
const getComparisonReport = async (req, res, next) => {
  try {
    const { subject = 'Math' } = req.query;

    const [preTestAttempt, postTestAttempt] = await Promise.all([
      QuizAttempt.findOne({ studentId: req.user._id, subject, quizType: 'pre_test' }),
      QuizAttempt.findOne({ studentId: req.user._id, subject, quizType: 'post_test' })
    ]);

    if (!preTestAttempt) {
      return res.status(404).json({ success: false, message: 'Pre-Test has not been taken yet.' });
    }

    if (!postTestAttempt) {
      return res.status(404).json({ success: false, message: 'Post-Test has not been taken yet.' });
    }

    const preScore = preTestAttempt.scorePercentage;
    const postScore = postTestAttempt.scorePercentage;
    const overallGain = Math.round((postScore - preScore) * 10) / 10;

    // Calculate accuracy by topic in pre vs post
    const extractTopicAccuracy = (attempt) => {
      const map = {};
      for (const ans of attempt.answers) {
        if (!map[ans.topic]) map[ans.topic] = { total: 0, correct: 0 };
        map[ans.topic].total++;
        if (ans.isCorrect) map[ans.topic].correct++;
      }
      const result = {};
      for (const [t, s] of Object.entries(map)) {
        result[t] = Math.round((s.correct / s.total) * 100);
      }
      return result;
    };

    const preTopicMap = extractTopicAccuracy(preTestAttempt);
    const postTopicMap = extractTopicAccuracy(postTestAttempt);

    const allTopics = Array.from(new Set([...Object.keys(preTopicMap), ...Object.keys(postTopicMap)]));
    const topicBreakdown = allTopics.map(topic => {
      const preAcc = preTopicMap[topic] !== undefined ? preTopicMap[topic] : 0;
      const postAcc = postTopicMap[topic] !== undefined ? postTopicMap[topic] : 0;
      return {
        topic,
        preTestAccuracy: preAcc,
        postTestAccuracy: postAcc,
        gain: postAcc - preAcc
      };
    });

    res.status(200).json({
      success: true,
      studentName: req.user.fullName,
      rollNumber: req.user.rollNumber,
      subject,
      preTestScore: preScore,
      postTestScore: postScore,
      overallGainPercentage: overallGain,
      preTestDate: preTestAttempt.createdAt,
      postTestDate: postTestAttempt.createdAt,
      topicBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc Teacher class overview
// @route GET /api/progress/teacher-overview
const getTeacherOverview = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('fullName rollNumber grade');
    const studentIds = students.map(s => s._id);

    const [attempts, progress] = await Promise.all([
      QuizAttempt.find({ studentId: { $in: studentIds } }),
      ProgressTracking.find({ studentId: { $in: studentIds } })
    ]);

    const roster = students.map(student => {
      const sAttempts = attempts.filter(a => a.studentId.toString() === student._id.toString());
      const sProgress = progress.filter(p => p.studentId.toString() === student._id.toString());

      const preMath = sAttempts.find(a => a.subject === 'Math' && a.quizType === 'pre_test');
      const postMath = sAttempts.find(a => a.subject === 'Math' && a.quizType === 'post_test');
      const totalPracticed = sProgress.reduce((acc, p) => acc + p.questionsAttempted, 0);
      const weakTopics = sProgress.filter(p => p.status === 'needs_focus').map(p => p.topic);

      return {
        id: student._id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        grade: student.grade,
        preTestScore: preMath ? `${preMath.scorePercentage}%` : 'Not Taken',
        postTestScore: postMath ? `${postMath.scorePercentage}%` : 'Not Taken',
        questionsPracticed: totalPracticed,
        weakTopicsCount: weakTopics.length,
        weakTopics
      };
    });

    res.status(200).json({
      success: true,
      totalStudents: students.length,
      roster
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export standardized class gradebook with formula injection safety & normalized gain
// @route GET /api/progress/export-gradebook
const exportGradebook = async (req, res, next) => {
  try {
    const { subject = 'Math', format = 'csv' } = req.query;
    const students = await User.find({ role: 'student' }).select('fullName rollNumber grade');
    const studentIds = students.map(s => s._id);

    const [attempts, progress] = await Promise.all([
      QuizAttempt.find({ studentId: { $in: studentIds }, subject }),
      ProgressTracking.find({ studentId: { $in: studentIds }, subject })
    ]);

    const records = students.map(student => {
      const sAttempts = attempts.filter(a => a.studentId.toString() === student._id.toString());
      const sProgress = progress.filter(p => p.studentId.toString() === student._id.toString());

      const pre = sAttempts.find(a => a.quizType === 'pre_test');
      const post = sAttempts.find(a => a.quizType === 'post_test');
      const totalPracticed = sProgress.reduce((acc, p) => acc + p.questionsAttempted, 0);

      const preScore = pre ? pre.scorePercentage : null;
      const postScore = post ? post.scorePercentage : null;

      return {
        id: student._id,
        rollNumber: student.rollNumber,
        studentName: student.fullName,
        preScore,
        postScore,
        questionsPracticed: totalPracticed
      };
    });

    if (format === 'json') {
      return res.status(200).json({ success: true, subject, records });
    }

    const { generateGradebookCsv, generateGradebookXlsx } = require('../utils/gradebookExporter');

    if (format === 'xlsx') {
      const xlsxBuffer = generateGradebookXlsx(records);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="adaptiq_gradebook_${subject.toLowerCase()}_${Date.now()}.xlsx"`);
      return res.status(200).send(xlsxBuffer);
    }

    const csvContent = generateGradebookCsv(records);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="adaptiq_gradebook_${subject.toLowerCase()}_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc Export questions in IMS QTI v2.1 XML specification
// @route GET /api/progress/export-qti
const exportQti = async (req, res, next) => {
  try {
    const { subject = 'Math', topic } = req.query;
    const Question = require('../models/Question');
    const { generateQtiXml } = require('../utils/qtiExporter');

    const filter = { subject };
    if (topic) filter.topic = topic;

    const questions = await Question.find(filter).limit(100);
    const xmlContent = generateQtiXml(questions, `${subject} ${topic || 'Assessment'}`);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="adaptiq_qti_${subject.toLowerCase()}_${Date.now()}.xml"`);
    return res.status(200).send(xmlContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProgress,
  getComparisonReport,
  getTeacherOverview,
  exportGradebook,
  exportQti
};

