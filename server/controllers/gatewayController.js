const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Question = require('../models/Question');
const QuarantinedAttempt = require('../models/QuarantinedAttempt');

/**
 * Classroom Gateway Controller
 * Manages local offline classroom server status, health discovery, and idempotent batch event reconciliation.
 */

// @desc Get Gateway health, deployment mode, and synchronization status
// @route GET /api/gateway/health
const getGatewayHealth = async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isGatewayMode = process.env.GATEWAY_MODE === 'true';

  let pendingQuarantined = 0;
  try {
    if (isDbConnected) {
      pendingQuarantined = await QuarantinedAttempt.countDocuments({ status: 'pending_review' });
    }
  } catch (e) {
    // Graceful fallback
  }

  res.status(200).json({
    status: isDbConnected ? 'HEALTHY' : 'DEGRADED',
    mode: isGatewayMode ? 'classroom_gateway' : 'cloud',
    database: isDbConnected ? 'connected' : 'disconnected',
    localLanBind: process.env.LOCAL_LAN_BIND || '0.0.0.0',
    contentBundleVersion: process.env.CONTENT_BUNDLE_VERSION || '2.0.0-stem-offline',
    pendingQuarantineCount: pendingQuarantined,
    timestamp: new Date().toISOString()
  });
};

// @desc Reconcile batch events from offline classroom student devices
// @route POST /api/gateway/reconcile
const reconcileGatewayEvents = async (req, res, next) => {
  try {
    const { gatewayId = 'local_classroom_gateway', events = [] } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Must provide an array of events to reconcile'
      });
    }

    const processed = [];
    const duplicates = [];
    const quarantined = [];

    for (const evt of events) {
      const eventId = evt.eventId || evt.id;

      if (!eventId) {
        quarantined.push({ payload: evt, reason: 'Missing mandatory eventId' });
        await QuarantinedAttempt.create({
          eventId: `unknown_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          payload: evt,
          reason: 'Missing mandatory eventId',
          gatewayId
        });
        continue;
      }

      // 1. Idempotency Check: skip already processed events
      const existing = await Attempt.findOne({ eventId });
      if (existing) {
        duplicates.push(eventId);
        continue;
      }

      // 2. Validate Student Existence
      let student = null;
      if (evt.userId && mongoose.Types.ObjectId.isValid(evt.userId)) {
        student = await User.findById(evt.userId);
      } else if (evt.rollNumber) {
        student = await User.findOne({ rollNumber: String(evt.rollNumber).trim() });
      } else if (req.user) {
        student = req.user;
      }

      if (!student) {
        quarantined.push({ eventId, reason: 'Unrecognized student identity or roll number' });
        await QuarantinedAttempt.create({
          eventId,
          payload: evt,
          reason: 'Unrecognized student identity or roll number',
          gatewayId
        });
        continue;
      }

      // 3. Persist Validated Attempt Record
      try {
        const newAttempt = await Attempt.create({
          userId: student._id,
          eventId,
          questionId: evt.questionId || 'unknown',
          questionVersion: evt.questionVersion || 1,
          mode: evt.mode || 'practice',
          isCorrect: Boolean(evt.isCorrect),
          timeTaken: Number(evt.timeTaken) || 0,
          difficultyAtTime: evt.difficulty || 'medium',
          subject: evt.subject || 'Math',
          topic: evt.topic || 'General',
          selectedAnswerIndex: evt.selectedAnswerIndex !== undefined ? Number(evt.selectedAnswerIndex) : null,
          confidence: evt.confidence || 'unspecified'
        });

        processed.push(eventId);
      } catch (insertError) {
        if (insertError.code === 11000) {
          // Duplicate event race condition
          duplicates.push(eventId);
        } else {
          quarantined.push({ eventId, reason: insertError.message });
          await QuarantinedAttempt.create({
            eventId,
            payload: evt,
            reason: `Database insertion error: ${insertError.message}`,
            gatewayId
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      gatewayId,
      totalReceived: events.length,
      processedCount: processed.length,
      duplicateCount: duplicates.length,
      quarantinedCount: quarantined.length,
      results: {
        processed,
        duplicates,
        quarantined
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get quarantined unverified attempts for teacher audit
// @route GET /api/gateway/quarantine
const getQuarantinedAttempts = async (req, res, next) => {
  try {
    const list = await QuarantinedAttempt.find({ status: 'pending_review' }).sort({ receivedAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      count: list.length,
      quarantined: list
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGatewayHealth,
  reconcileGatewayEvents,
  getQuarantinedAttempts
};
