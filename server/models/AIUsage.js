const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },
  requestId: {
    type: String
  },
  modelName: {
    type: String,
    required: true
  },
  inputTokens: {
    type: Number,
    default: 0
  },
  outputTokens: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0.0
  }
}, { timestamps: true });

AIUsageSchema.index({ userId: 1, createdAt: -1 });
AIUsageSchema.index({ modelName: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsage', AIUsageSchema);
