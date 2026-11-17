/**
 * School Controller
 * Provides endpoints for institutional profiles, administrative KPIs,
 * grade breakdown, teacher load, and learning gap reports.
 */

const schoolService = require('../services/schoolService');
const misconceptionService = require('../services/misconceptionService');
const syntheticStore = require('../services/syntheticStore');

async function getSchoolProfileHandler(req, res) {
  try {
    const schoolCode = req.query.code || req.params.code || 'GPS-2026';
    const profile = await schoolService.getSchoolProfile(schoolCode);
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve school profile.',
      error: err.message
    });
  }
}

async function getSchoolAdminMetricsHandler(req, res) {
  try {
    const schoolCode = req.query.code || req.params.code || 'GPS-2026';
    const metrics = await schoolService.getSchoolAdminMetrics(schoolCode);
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve school administrative metrics.',
      error: err.message
    });
  }
}

async function getStudentMisconceptionsHandler(req, res) {
  try {
    const studentId = req.params.studentId || req.query.studentId || 'std-07-003';
    const store = syntheticStore.getStore();
    const history = store.answerEvents.filter(a => a.studentId === studentId);
    const diagnosis = misconceptionService.analyzeStudentMisconceptions(studentId, { history });
    return res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to diagnose student misconceptions.',
      error: err.message
    });
  }
}

async function getClassroomMisconceptionsHandler(req, res) {
  try {
    const classroomId = req.params.classroomId || req.query.classroomId || 'cls-07-a';
    const store = syntheticStore.getStore();
    const students = store.students.filter(s => s.classroomId === classroomId);
    const cohortResponses = store.answerEvents.filter(a => a.classroomId === classroomId);
    const classAnalysis = misconceptionService.analyzeClassroomMisconceptions(classroomId, {
      cohortResponses,
      studentRoster: students
    });
    return res.status(200).json({
      success: true,
      data: classAnalysis
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze classroom misconceptions.',
      error: err.message
    });
  }
}

async function resetDemoEnvironmentHandler(req, res) {
  try {
    if (typeof syntheticStore.resetToBaseline === 'function') {
      syntheticStore.resetToBaseline();
    }
    return res.status(200).json({
      success: true,
      message: 'Greenwood Public School demonstration environment reset to pristine baseline.',
      tenant: {
        name: 'Greenwood Public School — AdaptIQ Demonstration Environment',
        affiliation: '530649',
        schoolCode: '40643',
        session: '2026-2027'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset demonstration environment.',
      error: err.message
    });
  }
}

module.exports = {
  getSchoolProfileHandler,
  getSchoolAdminMetricsHandler,
  getStudentMisconceptionsHandler,
  getClassroomMisconceptionsHandler,
  resetDemoEnvironmentHandler
};

