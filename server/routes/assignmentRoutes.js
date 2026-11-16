const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/student', assignmentController.getStudentAssignmentsHandler);
router.get('/teacher', assignmentController.getTeacherAssignmentsHandler);
router.post('/', assignmentController.createAssignmentHandler);

module.exports = router;

