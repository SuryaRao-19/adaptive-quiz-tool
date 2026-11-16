const express = require('express');
const router = express.Router();
const {
  markAttendanceHandler,
  getClassroomAttendanceHandler,
  getAttendanceSummaryHandler
} = require('../controllers/attendanceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', requireRole('teacher', 'admin', 'school_admin'), markAttendanceHandler);
router.get('/', getClassroomAttendanceHandler);
router.get('/summary', getAttendanceSummaryHandler);

module.exports = router;

