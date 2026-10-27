const express = require('express');
const router = express.Router();
const { 
  recordAttempt, 
  syncOfflineAttempts,
  getStudentAnalytics, 
  getClassAnalytics 
} = require('../controllers/attemptController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, recordAttempt);
router.post('/sync', verifyToken, syncOfflineAttempts);
router.get('/analytics', verifyToken, getStudentAnalytics);
router.get('/class-analytics/:classId', verifyToken, requireRole('teacher', 'admin'), getClassAnalytics);

module.exports = router;
