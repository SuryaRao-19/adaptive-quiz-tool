/**
 * AdaptIQ 3.0 — Adaptive Learning Routes
 * server/routes/adaptiveRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  evaluateAdaptiveStep,
  getNextQuestion,
  getRevisionSchedule,
  reviewCard,
  diagnoseMisconceptions,
  getSimilarQuestion,
  getLearnerProfileEndpoint,
  updateLearnerProfileEndpoint
} = require('../controllers/adaptiveController');

// All endpoints are deterministic and require zero AI keys
router.post('/evaluate', evaluateAdaptiveStep);
router.post('/next-question', getNextQuestion);
router.get('/revision-schedule', getRevisionSchedule);
router.post('/review-card', reviewCard);
router.post('/diagnose', diagnoseMisconceptions);
router.post('/similar-question', getSimilarQuestion);
router.get('/learner-profile', getLearnerProfileEndpoint);
router.post('/learner-profile', updateLearnerProfileEndpoint);

module.exports = router;
