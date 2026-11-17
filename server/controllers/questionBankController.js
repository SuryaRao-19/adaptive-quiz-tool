/**
 * Question Bank Controller
 * Exposes API endpoints for searching, filtering, creating, reviewing,
 * importing, and analyzing question bank coverage for Greenwood Public School.
 */

const questionBankService = require('../services/questionBankService');

function getQuestionsHandler(req, res) {
  try {
    const { grade, subject, chapter, difficulty, format, status, keyword, excludeIds, limit, offset } = req.query;
    const result = questionBankService.searchQuestions({
      grade,
      subject,
      chapter,
      difficulty,
      format,
      status,
      keyword,
      excludeIds,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function createQuestionHandler(req, res) {
  try {
    const author = req.user?.name || req.body.author || 'Teacher';
    const created = questionBankService.createQuestion(req.body, author);
    return res.status(201).json({ success: true, message: 'Question created successfully.', data: created });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, error: err.message, details: err.details });
  }
}

function reviewQuestionHandler(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const reviewerId = req.user?.name || req.body.reviewerId || 'Academic Director';
    const updated = questionBankService.reviewQuestion(id, { reviewerId, status, remarks });
    return res.status(200).json({ success: true, message: `Question marked as ${status}.`, data: updated });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, error: err.message });
  }
}

function getCoverageReportHandler(req, res) {
  try {
    const report = questionBankService.getCoverageReport();
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function importQuestionsHandler(req, res) {
  try {
    const { questions } = req.body;
    const author = req.user?.name || req.body.author || 'Curriculum Coordinator';
    const result = questionBankService.importQuestions(questions, author);
    return res.status(200).json({
      success: true,
      message: `Import complete: ${result.importedCount} questions imported, ${result.failedCount} rejected.`,
      data: result
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getQuestionsHandler,
  createQuestionHandler,
  reviewQuestionHandler,
  getCoverageReportHandler,
  importQuestionsHandler
};
