/**
 * Attendance Controller
 * Endpoints for classroom daily attendance, batch marking,
 * monthly analytics, and student records.
 */

const attendanceService = require('../services/attendanceService');

async function markAttendanceHandler(req, res, next) {
  try {
    const { classroomId, date, records } = req.body;
    const teacherId = req.user.id;

    if (!classroomId || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'classroomId and records array are required.'
      });
    }

    const result = await attendanceService.markClassroomAttendance({
      classroomId,
      date,
      records,
      teacherId
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getClassroomAttendanceHandler(req, res, next) {
  try {
    const { classroomId, date } = req.query;

    if (!classroomId) {
      return res.status(400).json({
        success: false,
        message: 'classroomId query parameter is required.'
      });
    }

    const result = await attendanceService.getClassroomAttendance({
      classroomId,
      date
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceSummaryHandler(req, res, next) {
  try {
    const { classroomId, month, year } = req.query;

    if (!classroomId) {
      return res.status(400).json({
        success: false,
        message: 'classroomId query parameter is required.'
      });
    }

    const result = await attendanceService.getClassroomAttendanceSummary({
      classroomId,
      month,
      year
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  markAttendanceHandler,
  getClassroomAttendanceHandler,
  getAttendanceSummaryHandler
};

