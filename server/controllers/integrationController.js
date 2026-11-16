/**
 * AdaptIQ 3.0 — Integration Controller
 * server/controllers/integrationController.js
 */

const {
  googleClassroomService,
  youtubeService,
  googleBooksService,
  googleCalendarService,
  brevoEmailService,
  sentryService,
  documentProcessingService,
  getIntegrationsStatus
} = require('../services/integrations');

const getStatus = async (req, res) => {
  try {
    const statuses = getIntegrationsStatus();
    return res.status(200).json({ success: true, integrations: statuses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchYouTube = async (req, res) => {
  try {
    const { query, grade = '10', subject = 'Science', maxResults = 5 } = req.query;
    const results = await youtubeService.searchEducationalVideos({
      query,
      grade,
      subject,
      maxResults: parseInt(maxResults, 10) || 5
    });
    return res.status(200).json({ success: true, videos: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { query, grade = '10', subject = 'Mathematics', maxResults = 5 } = req.query;
    const results = await googleBooksService.searchBooks({
      query,
      grade,
      subject,
      maxResults: parseInt(maxResults, 10) || 5
    });
    return res.status(200).json({ success: true, books: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const scheduleCalendarEvent = async (req, res) => {
  try {
    const { title, description, startTime, durationMinutes } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    const result = await googleCalendarService.scheduleAssessmentEvent({
      title,
      description,
      startTime,
      durationMinutes
    });
    return res.status(200).json({ success: true, event: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listClassroomCourses = async (req, res) => {
  try {
    const courses = await googleClassroomService.listCourses();
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendNotificationEmail = async (req, res) => {
  try {
    const { toEmail, toName, subject, htmlContent } = req.body;
    if (!toEmail || !subject || !htmlContent) {
      return res.status(400).json({ success: false, message: 'toEmail, subject, and htmlContent are required.' });
    }
    const result = await brevoEmailService.sendEmail({ toEmail, toName, subject, htmlContent });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const parseDocumentCurriculum = async (req, res) => {
  try {
    const { text, grade, subject, title } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text content is required for parsing.' });
    }
    const result = documentProcessingService.extractCurriculumStructure(text, { grade, subject, title });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStatus,
  searchYouTube,
  searchBooks,
  scheduleCalendarEvent,
  listClassroomCourses,
  sendNotificationEmail,
  parseDocumentCurriculum
};
