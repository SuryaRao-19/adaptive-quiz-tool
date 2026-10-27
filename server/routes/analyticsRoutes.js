const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const analyticsService = require('../services/analyticsService');

router.use(verifyToken);

// @desc Get empirical difficulty and Rasch 1PL telemetry across all questions
// @route GET /api/analytics/questions
router.get('/questions', async (req, res, next) => {
  try {
    const { subject, topic, difficulty, anomalyOnly } = req.query;
    const result = await analyticsService.getAllQuestionAnalytics({
      subject,
      topic,
      difficulty,
      anomalyOnly: anomalyOnly === 'true'
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @desc Compute empirical difficulty & Rasch parameters for a single question
// @route GET /api/analytics/questions/:id
router.get('/questions/:id', async (req, res, next) => {
  try {
    const { version = 1 } = req.query;
    const result = await analyticsService.computeQuestionStatistics(
      req.params.id, 
      Number(version) || 1
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
