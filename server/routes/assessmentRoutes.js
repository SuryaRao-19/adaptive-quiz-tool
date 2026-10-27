const express = require('express');
const router = express.Router();
const {
  listAssessments,
  createAssessment,
  startAssessmentAttempt,
  submitAnswerEvent,
  finalizeAttempt,
  getAttemptDetails
} = require('../controllers/assessmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', listAssessments);
router.post('/', requireRole('teacher', 'admin'), createAssessment);
router.post('/:id/start', startAssessmentAttempt);
router.post('/attempts/:id/answer', submitAnswerEvent);
router.post('/attempts/:id/submit', finalizeAttempt);
router.get('/attempts/:id', getAttemptDetails);

module.exports = router;
