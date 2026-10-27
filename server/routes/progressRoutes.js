const express = require('express');
const router = express.Router();
const {
  getMyProgress,
  getComparisonReport,
  getTeacherOverview,
  exportGradebook,
  exportQti
} = require('../controllers/progressController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/me', getMyProgress);
router.get('/comparison-report', getComparisonReport);
router.get('/teacher-overview', requireRole('teacher', 'admin'), getTeacherOverview);
router.get('/export-gradebook', requireRole('teacher', 'admin'), exportGradebook);
router.get('/export-qti', requireRole('teacher', 'admin'), exportQti);

module.exports = router;
