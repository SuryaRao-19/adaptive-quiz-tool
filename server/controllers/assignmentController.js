/**
 * Assignment Controller
 * Handles student homework retrieval and teacher assignment creation.
 */

const assignmentService = require('../services/assignmentService');

function getStudentAssignmentsHandler(req, res) {
  try {
    const grade = parseInt(req.query.grade || req.user?.gradeLevel || 7, 10);
    const section = req.query.section || '7-A';
    const assignments = assignmentService.getAssignmentsForStudent(grade, section);
    return res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getTeacherAssignmentsHandler(req, res) {
  try {
    const assignments = assignmentService.getAssignmentsForTeacher();
    return res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function createAssignmentHandler(req, res) {
  try {
    const payload = req.body || {};
    const created = assignmentService.createAssignment(payload);
    return res.status(201).json({
      success: true,
      message: 'Assignment published successfully.',
      data: created
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getStudentAssignmentsHandler,
  getTeacherAssignmentsHandler,
  createAssignmentHandler
};

