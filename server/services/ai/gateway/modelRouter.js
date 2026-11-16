/**
 * Intelligent Model Router
 * Resolves optimal model based on AUTO/MANUAL mode, intent classification,
 * provider circuit breaker health, and latency optimization.
 */

const { modelRegistry } = require('./modelRegistry');
const { classifyIntent, CATEGORIES } = require('./intentClassifier');
const { providerHealth } = require('./providerHealth');
const keys = require('../../../config/keys');

// Preferred model hierarchy per category
const CATEGORY_MODEL_PREFERENCES = {
  [CATEGORIES.SIMPLE]: [
    'gemini-1.5-flash',
    'gemini-3.8-flash',
    'gpt-4o-mini',
    'claude-3-5-haiku-20241022',
    'llama3.2'
  ],
  [CATEGORIES.EDUCATIONAL_REASONING]: [
    'gemini-3.8-flash',
    'gemini-2.5-pro',
    'gpt-4o',
    'claude-3-5-sonnet-20241022',
    'gpt-4o-mini'
  ],
  [CATEGORIES.PROGRAMMING]: [
    'gemini-3.8-flash',
    'claude-3-5-sonnet-20241022',
    'gpt-4o',
    'gpt-4o-mini',
    'gemini-2.0-flash'
  ],
  [CATEGORIES.TUTORING]: [
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gpt-4o-mini',
    'claude-3-5-haiku-20241022',
    'llama3.2'
  ],
  [CATEGORIES.CONTENT_GENERATION]: [
    'gemini-3.8-flash',
    'gpt-4o-mini',
    'gemini-2.0-flash',
    'claude-3-5-haiku-20241022'
  ],
  [CATEGORIES.LONG_CONTEXT]: [
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gpt-4o',
    'claude-3-5-sonnet-20241022'
  ]
};

class ModelRouter {
  /**
   * Routes an AI request to the optimal model and provider
   * @param {Object} params
   * @param {string} [params.mode='auto'] - 'auto' or 'manual'
   * @param {string} [params.requestedModel] - User-selected model ID (used if mode is 'manual')
   * @param {string} params.message - Prompt text
   * @param {string} [params.topic] - Academic topic
   * @param {string} [params.subject] - Academic subject
   * @param {string} [params.tutorMode='explain'] - Tutor mode
   * @param {number} [params.historyLength=0] - Message count
   * @param {boolean} [params.requiresStructuredOutput=false] - Structured output required
   */
  route({
    mode = keys.AI_ROUTING_MODE || 'auto',
    requestedModel = null,
    message = '',
    topic = '',
    subject = '',
    tutorMode = 'explain',
    historyLength = 0,
    requiresStructuredOutput = false
  }) {
    const isManual = String(mode).toLowerCase() === 'manual' && Boolean(requestedModel);

    // 1. If MANUAL mode, check if requested model is valid and configured
    if (isManual) {
      const modelDef = modelRegistry.findModel(requestedModel);
      if (modelDef && modelDef.available) {
        const providerAvailable = providerHealth.isAvailable(modelDef.provider);
        if (providerAvailable) {
          const fallbackCandidates = this._getFallbackCandidates(modelDef.id);
          return {
            selectedModel: modelDef.id,
            provider: modelDef.provider,
            mode: 'manual',
            intentCategory: CATEGORIES.TUTORING,
            reason: `User explicitly selected model ${modelDef.name}.`,
            fallbackCandidates
          };
        }
      }
      // If manual model unavailable or provider tripped, continue to AUTO fallback
    }

    // 2. AUTO mode: Classify request intent
    const classification = classifyIntent({
      message,
      topic,
      subject,
      tutorMode,
      historyLength,
      requiresStructuredOutput
    });

    const preferences = CATEGORY_MODEL_PREFERENCES[classification.category] || CATEGORY_MODEL_PREFERENCES[CATEGORIES.TUTORING];

    // Find the first available and healthy model in the preference list
    let selectedModelDef = null;
    for (const modelId of preferences) {
      const modelDef = modelRegistry.findModel(modelId);
      if (modelDef && modelDef.available) {
        if (providerHealth.isAvailable(modelDef.provider)) {
          selectedModelDef = modelDef;
          break;
        }
      }
    }

    // Fallback: any available and healthy model in the registry
    if (!selectedModelDef) {
      const availableModels = modelRegistry.listModels(true);
      selectedModelDef = availableModels.find(m => providerHealth.isAvailable(m.provider)) || availableModels[0];
    }

    if (!selectedModelDef) {
      throw new Error('PROVIDER_NOT_CONFIGURED: No AI model provider is currently configured or available.');
    }

    const fallbackCandidates = this._getFallbackCandidates(selectedModelDef.id);

    return {
      selectedModel: selectedModelDef.id,
      provider: selectedModelDef.provider,
      mode: isManual ? 'manual_fallback' : 'auto',
      intentCategory: classification.category,
      reason: classification.reason,
      fallbackCandidates
    };
  }

  _getFallbackCandidates(currentModelId) {
    const allAvailable = modelRegistry.listModels(true);
    return allAvailable
      .filter(m => m.id !== currentModelId && providerHealth.isAvailable(m.provider))
      .map(m => m.id);
  }
}

const modelRouter = new ModelRouter();

module.exports = {
  modelRouter,
  ModelRouter,
  CATEGORY_MODEL_PREFERENCES
};

