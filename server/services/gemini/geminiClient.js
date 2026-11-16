const { GoogleGenAI } = require('@google/genai');
const keys = require('../../config/keys');

// Official Pricing per million tokens for Gemini 3.8 Flash (standard tier)
// Input: $0.075 / 1M tokens (<128k), Output: $0.30 / 1M tokens
const PRICING_PER_MILLION = {
  'gemini-3.8-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00 },
  default: { input: 0.10, output: 0.40 }
};

let genAIInstance = null;

/**
 * Validates Gemini configuration at startup or runtime without exposing the secret key
 * @param {string} [overrideKey] Optional key override (for testing or runtime reconfiguration)
 * @returns {{ configured: boolean, model: string, error?: string }}
 */
function validateGeminiConfig(overrideKey = null) {
  const apiKey = overrideKey !== null ? overrideKey : (keys.GEMINI_API_KEY || keys.AI_API_KEY);
  const model = keys.GEMINI_MODEL || keys.AI_MODEL || 'gemini-3.8-flash';

  if (!apiKey || !String(apiKey).trim()) {
    return {
      configured: false,
      model,
      error: 'GEMINI_API_KEY is not configured in backend environment. Please set GEMINI_API_KEY in server/.env.'
    };
  }

  return {
    configured: true,
    model
  };
}

/**
 * Returns singleton GoogleGenAI client instance
 */
function getGenAI() {
  const config = validateGeminiConfig();
  if (!config.configured) {
    throw new Error(config.error);
  }
  if (!genAIInstance) {
    const apiKey = keys.GEMINI_API_KEY || keys.AI_API_KEY;
    genAIInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return genAIInstance;
}

/**
 * Calculates estimated cost for token usage
 */
function calculateEstimatedCost(modelName, inputTokens = 0, outputTokens = 0) {
  const rates = PRICING_PER_MILLION[modelName] || PRICING_PER_MILLION.default;
  const cost = ((inputTokens / 1_000_000) * rates.input) + ((outputTokens / 1_000_000) * rates.output);
  return Math.round(cost * 1_000_000) / 1_000_000; // Round to 6 decimal places
}

/**
 * Executes a Gemini request with controlled exponential backoff retry and timeout handling
 * @param {Object} options
 * @param {string} [options.model]
 * @param {string} options.prompt
 * @param {string} [options.systemInstruction]
 * @param {Object} [options.schema]
 * @param {number} [options.temperature=0.4]
 * @param {number} [options.maxTokens=4096]
 * @param {number} [options.timeoutMs=60000]
 * @param {number} [options.maxRetries=2]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ text: string, data: any, usage: Object, rawResponse: any }>}
 */
async function generateStructuredContent({
  model = keys.GEMINI_MODEL || 'gemini-3.8-flash',
  prompt,
  systemInstruction,
  schema,
  temperature = 0.4,
  maxTokens = 4096,
  timeoutMs = keys.AI_MAX_GENERATION_MS || 60000,
  maxRetries = 1,
  signal = null
}) {
  const ai = getGenAI();
  const candidateModels = [
    model,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash-lite'
  ].filter((m, i, a) => a.indexOf(m) === i);

  let modelIndex = 0;
  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries && modelIndex < candidateModels.length) {
    attempt++;
    const currentModel = candidateModels[modelIndex];
    const startTime = Date.now();

    try {
      const config = {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json'
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (schema) {
        config.responseSchema = schema;
      }

      // Enforce timeout and signal cancellation using Promise.race with timer cleanup
      const apiCallPromise = ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config
      });

      let timerId;
      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const abortPromise = signal ? new Promise((_, reject) => {
        if (signal.aborted) return reject(new Error('REQUEST_CANCELLED'));
        signal.addEventListener('abort', () => reject(new Error('REQUEST_CANCELLED')), { once: true });
      }) : null;

      const racePromises = [apiCallPromise, timeoutPromise];
      if (abortPromise) racePromises.push(abortPromise);

      let response;
      try {
        response = await Promise.race(racePromises);
      } finally {
        clearTimeout(timerId);
      }
      const rawText = response.text || '';
      const usageMetadata = response.usageMetadata || {};

      const inputTokens = usageMetadata.promptTokenCount || 0;
      const outputTokens = usageMetadata.candidatesTokenCount || 0;
      const thoughtsTokens = usageMetadata.thoughtsTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || (inputTokens + outputTokens);
      const estimatedCost = calculateEstimatedCost(currentModel, inputTokens, outputTokens + thoughtsTokens);

      let parsedData = null;
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        // Fallback for markdown-wrapped JSON
        const stripped = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(stripped);
      }

      return {
        text: rawText,
        data: parsedData,
        usage: {
          model: currentModel,
          inputTokens,
          outputTokens,
          thoughtsTokens,
          totalTokens,
          estimatedCost,
          durationMs: Date.now() - startTime
        },
        rawResponse: response
      };
    } catch (err) {
      lastError = err;
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      const is503OrNotFound = err.status === 503 || err.status === 404 || (err.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('404') || err.message.includes('NOT_FOUND')));
      const isTransient = err.status >= 500 || (err.message && (err.message.includes('timed out') || err.message.includes('fetch failed') || err.message.includes('ECONNRESET')));

      // If high demand 503 or model not found, try next candidate model
      if (is503OrNotFound && modelIndex + 1 < candidateModels.length) {
        modelIndex++;
        console.warn(`[Gemini Client] Model ${currentModel} returned ${err.status || '503/404'}. Cascading to fallback model ${candidateModels[modelIndex]}...`);
        continue;
      }

      if ((isRateLimit || isTransient) && attempt <= maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[Gemini Client] Attempt ${attempt} failed (${err.message}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      break;
    }
  }

  // Never expose raw API key in error message
  const sanitizedMessage = (lastError.message || 'Gemini API call failed')
    .replace(/key=[a-zA-Z0-9_\-\.]+/gi, 'key=REDACTED');
  
  const enhancedError = new Error(sanitizedMessage);
  enhancedError.originalStatus = lastError.status || 500;
  enhancedError.model = model;
  throw enhancedError;
}

module.exports = {
  validateGeminiConfig,
  getGenAI,
  calculateEstimatedCost,
  generateStructuredContent
};
