const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('../middleware/aiRateLimiter');
const {
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
} = require('../controllers/aiController');

// All AI endpoints require valid authentication and pass through the AI rate limiter
router.use(verifyToken);
router.use(aiRateLimiter);

// AI Tutor 3.0: Streaming & Conversational AI Gateway Endpoints
router.post('/chat/stream', handleStreamChat);
router.post('/chat', handleChat);
router.get('/models', handleListModels);
router.get('/providers/health', handleGetProvidersHealth);

// Persistent Conversation Memory Management
router.get('/conversations', handleListConversations);
router.post('/conversations', handleCreateConversation);
router.get('/conversations/:id', handleGetConversation);
router.delete('/conversations/:id/messages', handleClearConversationMessages);
router.delete('/conversations/:id', handleDeleteConversation);

// Feature A: AI Quiz Generator (Teacher/Admin only)
router.post('/generate-quiz', requireRole('teacher', 'admin'), handleGenerateQuiz);

// Feature B: AI Answer Explanation (Students & Teachers)
router.post('/explain-answer', handleExplainAnswer);

// Feature C: Personalized Learning Assistant / Study Plan (Students & Teachers)
router.post('/study-plan', handleStudyPlan);

// Feature D: AI Practice Test Generator (Students & Teachers)
router.post('/generate-practice-test', handleGeneratePracticeTest);

// Feature E: Teacher AI Assistant (Teacher/Admin only)
router.post('/teacher-assistant', requireRole('teacher', 'admin'), handleTeacherAssistant);

// Feature F: AI Performance Insights (Teachers & Students)
router.post('/performance-insights', handlePerformanceInsights);

// Teacher Approval Workflow: Approve & Save to Question Bank
router.post('/approve-content', requireRole('teacher', 'admin'), handleApproveContent);

// AI Usage and Cost Tracking Dashboard
router.get('/usage', handleGetUsage);

module.exports = router;

