const { generateQuiz } = require('../services/gemini/quizGenerator');
const { explainAnswer } = require('../services/gemini/answerExplainer');
const { generatePersonalizedStudyPlan } = require('../services/gemini/learningAssistant');
const { generatePracticeTest } = require('../services/gemini/practiceGenerator');
const { runTeacherAssistant } = require('../services/gemini/teacherAssistant');
const { generatePerformanceInsights } = require('../services/gemini/performanceInsights');
const { approveContent, getUsageStats } = require('../services/gemini/aiStorageService');
const { validateGeminiConfig } = require('../services/gemini/geminiClient');
const { aiGateway } = require('../services/ai/gateway/aiGateway');
const { conversationService } = require('../services/ai/services/conversationService');

/**
 * Controller for AdaptIQ AI Tutor 3.0 & Multi-Model Gateway
 */

// @desc Stream Chat Response via SSE (AI Tutor 3.0)
// @route POST /api/ai/chat/stream
const handleStreamChat = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString() || 'anonymous';
    const {
      conversationId,
      message,
      subject = 'Science & Mathematics',
      topic = 'General',
      tutorMode = 'explain',
      mode = 'auto',
      requestedModel = null,
      studentContext = null,
      isTestMode = false
    } = req.body;

    await aiGateway.streamChat({
      req,
      res,
      userId,
      conversationId,
      message,
      subject,
      topic,
      tutorMode,
      mode,
      requestedModel,
      studentContext,
      isTestMode
    });
  } catch (error) {
    next(error);
  }
};

// @desc Unary Chat Response (AI Tutor 3.0)
// @route POST /api/ai/chat
const handleChat = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString() || 'anonymous';
    const {
      conversationId,
      message,
      subject = 'Science & Mathematics',
      topic = 'General',
      tutorMode = 'explain',
      mode = 'auto',
      requestedModel = null,
      studentContext = null,
      isTestMode = false
    } = req.body;

    const result = await aiGateway.chat({
      userId,
      conversationId,
      message,
      subject,
      topic,
      tutorMode,
      mode,
      requestedModel,
      studentContext,
      isTestMode
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc List Available and Configured Models
// @route GET /api/ai/models
const handleListModels = async (req, res, next) => {
  try {
    const models = aiGateway.listModels();
    res.status(200).json({
      success: true,
      count: models.length,
      models
    });
  } catch (error) {
    next(error);
  }
};

// @desc Provider Health Metrics & Circuit Breaker State
// @route GET /api/ai/providers/health
const handleGetProvidersHealth = async (req, res, next) => {
  try {
    const health = aiGateway.getHealth();
    res.status(200).json({
      success: true,
      providers: health
    });
  } catch (error) {
    next(error);
  }
};

// @desc List User Conversations
// @route GET /api/ai/conversations
const handleListConversations = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const conversations = await conversationService.listConversations(userId);
    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create New Conversation
// @route POST /api/ai/conversations
const handleCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const { title, subject, topic, tutorMode } = req.body;
    const conversation = await conversationService.createConversation({
      userId,
      title,
      subject,
      topic,
      tutorMode
    });
    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Conversation and Its Messages
// @route GET /api/ai/conversations/:id
const handleGetConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const { id } = req.params;
    const conversation = await conversationService.getConversation(id, userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    const messages = await conversationService.getMessages(id, userId);
    res.status(200).json({
      success: true,
      conversation,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc Clear Messages in a Conversation
// @route DELETE /api/ai/conversations/:id/messages
const handleClearConversationMessages = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const { id } = req.params;
    await conversationService.clearMessages(id, userId);
    res.status(200).json({
      success: true,
      message: 'Conversation messages cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete Conversation
// @route DELETE /api/ai/conversations/:id
const handleDeleteConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const { id } = req.params;
    await conversationService.deleteConversation(id, userId);
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for AdaptIQ Google Gemini AI Production Service
 */

// @desc Generate Quiz Questions (Teacher/Admin)
// @route POST /api/ai/generate-quiz
const handleGenerateQuiz = async (req, res, next) => {
  try {
    const {
      subject = 'Math',
      topic = 'Fractions',
      subtopic = '',
      difficulty = 'medium',
      count = 5,
      format = 'MCQ',
      learningObjective = '',
      gradeLevel = 7
    } = req.body;

    const userId = req.user?.id || req.user?._id?.toString();

    const result = await generateQuiz({
      subject,
      topic,
      subtopic,
      difficulty,
      count,
      format,
      learningObjective,
      gradeLevel,
      userId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc AI Answer Explanation
// @route POST /api/ai/explain-answer
const handleExplainAnswer = async (req, res, next) => {
  try {
    const {
      questionText,
      options = [],
      studentAnswer,
      correctAnswer,
      subject = 'Math',
      topic = 'General',
      gradeLevel = 7,
      isTestMode = false
    } = req.body;

    const userId = req.user?.id || req.user?._id?.toString();

    const result = await explainAnswer({
      questionText,
      options,
      studentAnswer,
      correctAnswer,
      subject,
      topic,
      gradeLevel,
      isTestMode,
      userId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc Personalized Learning Assistant / Study Plan
// @route POST /api/ai/study-plan
const handleStudyPlan = async (req, res, next) => {
  try {
    const { studentId, subject = 'Mathematics & Science', gradeLevel = 7 } = req.body;
    const requestingUserId = req.user?.id || req.user?._id?.toString();
    const role = req.user?.role?.toLowerCase() || 'student';

    // Target student ID defaults to requesting user if not explicitly specified
    const targetStudentId = (role === 'teacher' || role === 'admin') && studentId
      ? studentId
      : requestingUserId;

    const result = await generatePersonalizedStudyPlan({
      studentId: targetStudentId,
      subject,
      gradeLevel,
      requestingUserId,
      isAuthorized: true
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc AI Practice Test Generator
// @route POST /api/ai/generate-practice-test
const handleGeneratePracticeTest = async (req, res, next) => {
  try {
    const {
      subject = 'Math',
      topic = '',
      difficulty = 'medium',
      timeLimitMinutes = 15,
      questionCount = 5,
      format = 'MCQ',
      gradeLevel = 7
    } = req.body;

    const userId = req.user?.id || req.user?._id?.toString();

    const result = await generatePracticeTest({
      studentId: userId,
      subject,
      topic,
      difficulty,
      timeLimitMinutes,
      questionCount,
      format,
      gradeLevel,
      userId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Teacher AI Assistant (Curriculum, Remediation, Worksheets)
// @route POST /api/ai/teacher-assistant
const handleTeacherAssistant = async (req, res, next) => {
  try {
    const {
      actionType = 'lesson_activity',
      subject = 'Math',
      topic = 'Fractions',
      gradeLevel = 7,
      promptDetails = '',
      classroomId = null
    } = req.body;

    const teacherId = req.user?.id || req.user?._id?.toString();

    const result = await runTeacherAssistant({
      actionType,
      subject,
      topic,
      gradeLevel,
      promptDetails,
      classroomId,
      teacherId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.status === 403 || error.status === 404) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc AI Performance Insights
// @route POST /api/ai/performance-insights
const handlePerformanceInsights = async (req, res, next) => {
  try {
    const { classroomId = null, subject = 'All', gradeLevel = 7 } = req.body;
    const userId = req.user?.id || req.user?._id?.toString();

    const result = await generatePerformanceInsights({
      classroomId,
      subject,
      gradeLevel,
      userId
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Teacher Approval Workflow: Approve & Publish Content to Bank
// @route POST /api/ai/approve-content
const handleApproveContent = async (req, res, next) => {
  try {
    const { contentId, questionsToPublish } = req.body;
    const teacherId = req.user?.id || req.user?._id?.toString();

    if (!contentId) {
      return res.status(400).json({ success: false, message: 'contentId is required.' });
    }

    const result = await approveContent({
      contentId,
      teacherId,
      questionsToPublish
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc AI Token & Cost Usage Dashboard
// @route GET /api/ai/usage
const handleGetUsage = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const role = req.user?.role?.toLowerCase() || 'student';

    let usage = null;
    try {
      usage = await getUsageStats({ userId, role });
    } catch (_) {}

    const config = validateGeminiConfig();
    const tokenDashboard = aiGateway.getTokenUsageDashboard();

    res.status(200).json({
      success: true,
      configured: config.configured,
      model: config.model,
      usage,
      tokenDashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleStreamChat,
  handleChat,
  handleListModels,
  handleGetProvidersHealth,
  handleListConversations,
  handleCreateConversation,
  handleGetConversation,
  handleClearConversationMessages,
  handleDeleteConversation,
  handleGenerateQuiz,
  handleExplainAnswer,
  handleStudyPlan,
  handleGeneratePracticeTest,
  handleTeacherAssistant,
  handlePerformanceInsights,
  handleApproveContent,
  handleGetUsage
};

