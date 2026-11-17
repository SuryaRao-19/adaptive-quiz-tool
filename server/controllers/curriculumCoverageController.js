const coverageService = require('../services/curriculumCoverageService');

exports.getOverview = (req, res) => {
  try {
    const data = coverageService.getOverviewMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getGradeWiseCoverage = (req, res) => {
  try {
    const { status, academicYear } = req.query;
    const data = coverageService.getGradeWiseCoverage({
      statusFilter: status,
      academicYear
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSubjectWiseCoverage = (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.grade, 10);
    const data = coverageService.getSubjectWiseCoverage(gradeLevel);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getChapterLevelCoverage = (req, res) => {
  try {
    const gradeLevel = parseInt(req.query.grade, 10);
    const subjectName = req.query.subject;
    const data = coverageService.getChapterLevelCoverage(gradeLevel, subjectName);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getContentGaps = (req, res) => {
  try {
    const { grade, severity } = req.query;
    const gradeLevel = grade ? parseInt(grade, 10) : null;
    const data = coverageService.detectContentGaps({ gradeLevel, severityFilter: severity });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTeacherAccountability = (req, res) => {
  try {
    const data = coverageService.getTeacherAccountabilityMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.assignResponsibility = (req, res) => {
  try {
    const { teacherName, teacherEmail, gradeLevel, subject, chapter, task, deadline, assignedBy } = req.body;
    if (!teacherName || !gradeLevel || !subject || !task || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Missing required assignment fields (teacherName, gradeLevel, subject, task, deadline).'
      });
    }
    const assignment = coverageService.assignContentResponsibility({
      teacherName,
      teacherEmail,
      gradeLevel: parseInt(gradeLevel, 10),
      subject,
      chapter: chapter || 'General',
      task,
      deadline,
      assignedBy: assignedBy || req.user?.name || 'Dr. K. S. Raman (Principal)'
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
