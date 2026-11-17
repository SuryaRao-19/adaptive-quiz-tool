const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/student', assignmentController.getStudentAssignmentsHandler);
router.get('/teacher', assignmentController.getTeacherAssignmentsHandler);
router.post('/', assignmentController.createAssignmentHandler);
router.post('/:id/submit', assignmentController.submitAssignmentHandler);
router.post('/:id/submissions/:subId/grade', assignmentController.gradeAssignmentHandler);
router.get('/:id/submissions', assignmentController.getSubmissionsHandler);

module.exports = router;

