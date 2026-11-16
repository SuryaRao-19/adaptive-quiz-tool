/**
 * AdaptIQ 3.0 — Integration Routes
 * server/routes/integrationRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  getStatus,
  searchYouTube,
  searchBooks,
  scheduleCalendarEvent,
  listClassroomCourses,
  sendNotificationEmail,
  parseDocumentCurriculum
} = require('../controllers/integrationController');

router.get('/status', getStatus);
router.get('/youtube', searchYouTube);
router.get('/books', searchBooks);
router.post('/calendar', scheduleCalendarEvent);
router.get('/classroom/courses', listClassroomCourses);
router.post('/email/send', sendNotificationEmail);
router.post('/document/parse', parseDocumentCurriculum);

module.exports = router;
