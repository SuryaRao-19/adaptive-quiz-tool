/**
 * Teacher Assessment & Command Centre Controller
 */

const teacherAssessmentService = require('../services/teacherAssessmentService');
const initialDiagnosticService = require('../services/initialDiagnosticService');

async function getDashboardStatsHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const stats = await teacherAssessmentService.getTeacherDashboardStats(userId);
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

async function getTeacherClassroomsHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const classrooms = await teacherAssessmentService.getTeacherClassrooms(userId);
    return res.status(200).json({
      success: true,
      classrooms
    });
  } catch (error) {
    next(error);
  }
}

async function createAssessmentHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const assessment = await teacherAssessmentService.createTeacherAssessment(userId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      assessment
    });
  } catch (error) {
    next(error);
  }
}

async function duplicateAssessmentHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const copied = await teacherAssessmentService.duplicateAssessment(req.params.id, userId);
    return res.status(201).json({
      success: true,
      message: 'Assessment duplicated successfully.',
      assessment: copied
    });
  } catch (error) {
    next(error);
  }
}

async function getLiveTestStatusHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const status = await teacherAssessmentService.getLiveTestStatus(req.params.id, userId);
    return res.status(200).json({
      success: true,
      ...status
    });
  } catch (error) {
    next(error);
  }
}

async function controlLiveTestHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { action, payload } = req.body;
    const result = await teacherAssessmentService.controlLiveTest(req.params.id, userId, action, payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getSubmissionsHandler(req, res, next) {
  try {
    const { assessmentId, classroomId, status } = req.query;
    const submissions = await teacherAssessmentService.getSubmissionsForGrading(assessmentId, classroomId, status);
    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
}

async function gradeSubmissionHandler(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { attemptId } = req.params;
    const { grades } = req.body;

    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({
        success: false,
        message: 'grades array is required.'
      });
    }

    const result = await teacherAssessmentService.gradeSubmission(attemptId, teacherId, grades);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function publishResultsHandler(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { id } = req.params;
    const result = await teacherAssessmentService.publishAssessmentResults(id, teacherId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getClassResultsHandler(req, res, next) {
  try {
    const { classroomId, assessmentId } = req.query;
    const results = await teacherAssessmentService.getClassResultsAnalytics(classroomId, assessmentId);
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    next(error);
  }
}

async function getDiagnosticBlueprintHandler(req, res, next) {
  try {
    const gradeLevel = parseInt(req.query.grade || 7, 10);
    const testType = req.query.type === 'POST_TEST' ? 'POST_TEST' : 'PRE_TEST';
    const blueprint = initialDiagnosticService.getDiagnosticBlueprint(gradeLevel, testType);
    return res.status(200).json({
      success: true,
      data: blueprint
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};

