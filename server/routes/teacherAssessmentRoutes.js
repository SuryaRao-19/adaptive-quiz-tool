const express = require('express');
const router = express.Router();
const {
  getDashboardStatsHandler,
  getTeacherClassroomsHandler,
  createAssessmentHandler,
  duplicateAssessmentHandler,
  getLiveTestStatusHandler,
  controlLiveTestHandler,
  getSubmissionsHandler,
  gradeSubmissionHandler,
  publishResultsHandler,
  getClassResultsHandler,
  getDiagnosticBlueprintHandler
} = require('../controllers/teacherAssessmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole('teacher', 'admin', 'school_admin'));

router.get('/dashboard', getDashboardStatsHandler);
router.get('/classes', getTeacherClassroomsHandler);
router.post('/assessments', createAssessmentHandler);
router.post('/assessments/:id/duplicate', duplicateAssessmentHandler);
router.post('/assessments/:id/publish-results', publishResultsHandler);
router.get('/live/:id', getLiveTestStatusHandler);
router.post('/live/:id/control', controlLiveTestHandler);
router.get('/grading/submissions', getSubmissionsHandler);
router.post('/grading/:attemptId', gradeSubmissionHandler);
router.get('/results', getClassResultsHandler);
router.get('/diagnostic-blueprint', getDiagnosticBlueprintHandler);

module.exports = router;

