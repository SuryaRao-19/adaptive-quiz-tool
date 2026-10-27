const mongoose = require('mongoose');

const QuarantinedAttemptSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  gatewayId: {
    type: String,
    default: 'classroom_gateway_local'
  },
  status: {
    type: String,
    enum: ['pending_review', 'resolved', 'discarded'],
    default: 'pending_review'
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuarantinedAttempt', QuarantinedAttemptSchema);
