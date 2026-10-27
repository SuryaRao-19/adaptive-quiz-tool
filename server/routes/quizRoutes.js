const express = require('express');
const router = express.Router();
const {
  getPreTest,
  getPracticeQuestion,
  submitQuiz,
  getPostTest,
  getTopics
} = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/topics', getTopics);

router.use(verifyToken); // Subsequent operations require authentication

router.get('/pre-test', getPreTest);
router.get('/practice-question', getPracticeQuestion);
router.post('/submit', submitQuiz);
router.get('/post-test', getPostTest);

module.exports = router;
