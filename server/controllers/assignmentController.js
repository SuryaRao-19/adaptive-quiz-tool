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

function submitAssignmentHandler(req, res) {
  try {
    const { id } = req.params;
    const studentData = req.user || { id: 'student_demo_01', name: 'Aarav Patel', rollNumber: 'GPS-07-001' };
    const submission = assignmentService.submitAssignment(id, studentData, req.body);
    return res.status(200).json({
      success: true,
      message: 'Work turned in successfully.',
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function gradeAssignmentHandler(req, res) {
  try {
    const { id, subId } = req.params;
    const graded = assignmentService.gradeAssignment(id, subId, {
      marksAwarded: req.body.marksAwarded,
      feedback: req.body.feedback,
      gradedBy: req.user?.name || req.body.gradedBy || 'Mrs. Ananya Sharma'
    });
    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully.',
      data: graded
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getSubmissionsHandler(req, res) {
  try {
    const { id } = req.params;
    const submissions = assignmentService.getSubmissions(id);
    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getStudentAssignmentsHandler,
  getTeacherAssignmentsHandler,
  createAssignmentHandler,
  submitAssignmentHandler,
  gradeAssignmentHandler,
  getSubmissionsHandler
};

