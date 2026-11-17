/**
 * Curriculum Controller
 * Provides endpoints for multi-grade syllabus, subjects, chapters, topics,
 * official NCERT sources, textbook citations, and versioning controls.
 */

const curriculumService = require('../services/curriculumService');
const ingestionService = require('../services/curriculumIngestionService');

function getGradesHandler(req, res) {
  try {
    const grades = curriculumService.getSupportedGrades();
    return res.status(200).json({
      success: true,
      data: grades
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getSubjectsByGradeHandler(req, res) {
  try {
    const gradeLevel = parseInt(req.params.grade || req.query.grade || 7, 10);
    const subjects = curriculumService.getSubjectsForGrade(gradeLevel);
    return res.status(200).json({
      success: true,
      gradeLevel,
      data: subjects
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getCurriculumByGradeAndSubjectHandler(req, res) {
  try {
    const gradeLevel = parseInt(req.query.grade || req.params.grade || 7, 10);
    const subject = req.query.subject || req.params.subject || 'Mathematics';
    const curriculum = curriculumService.getCurriculumByGradeAndSubject(gradeLevel, subject);
    return res.status(200).json({
      success: true,
      data: curriculum
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getQuestionsHandler(req, res) {
  try {
    const { grade, subject, difficulty, format, limit } = req.query;
    const questions = curriculumService.getQuestionsByFilter({
      gradeLevel: grade,
      subject,
      difficulty,
      format,
      limit: limit ? parseInt(limit, 10) : 50
    });
    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getOfficialSourcesHandler(req, res) {
  try {
    const sources = curriculumService.getOfficialSources();
    return res.status(200).json({ success: true, data: sources });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getTextbookCitationsHandler(req, res) {
  try {
    const { grade, subject } = req.query;
    const citations = curriculumService.getTextbookCitations(grade, subject);
    return res.status(200).json({ success: true, count: citations.length, data: citations });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getCurriculumVersionsHandler(req, res) {
  try {
    const versions = curriculumService.getCurriculumVersions();
    return res.status(200).json({ success: true, data: versions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function updateCurriculumProfileHandler(req, res) {
  try {
    const updated = curriculumService.updateCurriculumProfile(req.body);
    return res.status(200).json({ success: true, message: 'Curriculum profile updated successfully.', data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

function ingestDocumentHandler(req, res) {
  try {
    const { title, sourceUrl, gradeLevel, subject, rawText } = req.body;
    const uploadedBy = req.user?.name || req.body.uploadedBy || 'Curriculum Coordinator';
    const batch = ingestionService.ingestCurriculumDocument({
      title,
      sourceUrl,
      gradeLevel,
      subject,
      rawText,
      uploadedBy
    });
    return res.status(201).json({ success: true, data: batch });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

function getIngestionBatchesHandler(req, res) {
  try {
    const batches = ingestionService.getIngestionBatches(req.query);
    return res.status(200).json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function reviewIngestionBatchHandler(req, res) {
  try {
    const { id } = req.params;
    const { status, modifications } = req.body;
    const reviewerId = req.user?.name || req.body.reviewerId || 'Principal Dr. S. K. Sharma';
    const updated = ingestionService.reviewCurriculumBatch(id, { reviewerId, status, modifications });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

function publishIngestionBatchHandler(req, res) {
  try {
    const { id } = req.params;
    const publisherId = req.user?.name || req.body.publisherId || 'Curriculum Lead';
    const result = ingestionService.publishCurriculumBatch(id, { publisherId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

function getCoursesHandler(req, res) {
  try {
    const gradeLevel = parseInt(req.query.grade || req.user?.gradeLevel || 7, 10);
    const courses = curriculumService.getCourses(gradeLevel);
    return res.status(200).json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getLessonsHandler(req, res) {
  try {
    const gradeLevel = parseInt(req.query.grade || req.user?.gradeLevel || 7, 10);
    const lessons = curriculumService.getLessons(gradeLevel);
    return res.status(200).json({ success: true, data: lessons });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getGradesHandler,
  getSubjectsByGradeHandler,
  getCurriculumByGradeAndSubjectHandler,
  getQuestionsHandler,
  getOfficialSourcesHandler,
  getTextbookCitationsHandler,
  getCurriculumVersionsHandler,
  updateCurriculumProfileHandler,
  getCoursesHandler,
  getLessonsHandler,
  ingestDocumentHandler,
  getIngestionBatchesHandler,
  reviewIngestionBatchHandler,
  publishIngestionBatchHandler
};
