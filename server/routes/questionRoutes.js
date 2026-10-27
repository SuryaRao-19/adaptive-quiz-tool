const express = require('express');
const router = express.Router();
const { 
  generateQuestions,
  addQuestion, 
  getQuestions, 
  updateQuestionStatus,
  updateQuestion,
  getTopics, 
  deleteQuestion 
} = require('../controllers/questionController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/topics', getTopics);
router.get('/', getQuestions);

router.use(verifyToken);
router.post('/generate', requireRole('teacher', 'admin'), generateQuestions);
router.post('/', requireRole('teacher', 'admin'), addQuestion);
router.patch('/:id/status', requireRole('teacher', 'admin'), updateQuestionStatus);
router.put('/:id', requireRole('teacher', 'admin'), updateQuestion);
router.delete('/:id', requireRole('teacher', 'admin'), deleteQuestion);

module.exports = router;
