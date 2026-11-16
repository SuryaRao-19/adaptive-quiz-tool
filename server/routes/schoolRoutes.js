const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Institutional routes
router.post('/demo-reset', schoolController.resetDemoEnvironmentHandler);
router.get('/profile', schoolController.getSchoolProfileHandler);
router.get('/metrics', schoolController.getSchoolAdminMetricsHandler);
router.get('/kpis', schoolController.getSchoolAdminMetricsHandler);
router.get('/misconceptions/student/:studentId', schoolController.getStudentMisconceptionsHandler);
router.get('/misconceptions/classroom/:classroomId', schoolController.getClassroomMisconceptionsHandler);
router.get('/:code', schoolController.getSchoolProfileHandler);

module.exports = router;

