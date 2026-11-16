/**
 * Fallback & Reliability Engine
 * Classifies AI provider failures, executes bounded exponential retries with jitter
 * for transient network/rate limit hiccups, and safely cascades to secondary providers
 * BEFORE token streaming commences.
 */

const { providerHealth } = require('./providerHealth');
const { modelRegistry } = require('./modelRegistry');

const ERROR_CLASSES = {
  AUTH_ERROR: 'AUTH_ERROR',               // 401, 403, invalid key -> Never retry
  RATE_LIMIT: 'RATE_LIMIT',               // 429 -> Bounded retry with jitter
  TRANSIENT_SERVER: 'TRANSIENT_SERVER',   // 500, 502, 503, 504 -> Retry or fallback
  TIMEOUT: 'TIMEOUT',                     // Provider timeout before generation -> Fallback
  SAFETY_BLOCK: 'SAFETY_BLOCK',           // Safety refusal -> Never retry/bypass
  CANCELLED: 'CANCELLED',                 // Client aborted -> Never retry
  BAD_REQUEST: 'BAD_REQUEST',             // 400, schema mismatch -> Never retry
  UNKNOWN: 'UNKNOWN'
};

class FallbackManager {
  /**
   * Classifies an error into operational retry categories
   * @param {Error|any} error 
   */
  classifyError(error) {
    if (!error) return ERROR_CLASSES.UNKNOWN;
    const msg = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode || error.originalStatus;

    if (msg.includes('cancelled') || msg.includes('abort')) {
      return ERROR_CLASSES.CANCELLED;
    }
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harmful')) {
      return ERROR_CLASSES.SAFETY_BLOCK;
    }
    if (
      status === 401 ||
      status === 403 ||
      msg.includes('unauthorized') ||
      msg.includes('invalid api key') ||
      (msg.includes('api key') && (msg.includes('invalid') || msg.includes('not valid') || msg.includes('missing')))
    ) {
      return ERROR_CLASSES.AUTH_ERROR;
    }
    if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
      return ERROR_CLASSES.RATE_LIMIT;
    }
    if (status === 400 || msg.includes('bad request') || msg.includes('invalid argument')) {
      return ERROR_CLASSES.BAD_REQUEST;
    }
    if (status === 503 || status === 502 || status === 504 || msg.includes('unavailable') || msg.includes('overloaded')) {
      return ERROR_CLASSES.TRANSIENT_SERVER;
    }
    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('econnreset') || msg.includes('fetch failed')) {
      return ERROR_CLASSES.TIMEOUT;
    }

    return ERROR_CLASSES.UNKNOWN;
  }

  /**
   * Executes a streaming request with automatic bounded retries and provider fallback
   * @param {Object} params
   * @param {string} params.initialModel - Model ID to attempt first
   * @param {Array<string>} [params.fallbackCandidates] - Fallback model IDs in preference order
   * @param {Function} params.executor - Async function ({ model, provider }) => Promise
   * @param {AbortSignal} [params.signal] - Client abort signal
   */
  async executeWithFallback({
    initialModel,
    fallbackCandidates = [],
    executor,
    signal = null
  }) {
    const modelChain = [initialModel, ...fallbackCandidates].filter((m, i, a) => a.indexOf(m) === i);

    let lastError = null;
    let fallbackActivated = false;

    for (let i = 0; i < modelChain.length; i++) {
      const currentModelId = modelChain[i];
      let resolved;
      try {
        resolved = modelRegistry.resolveModel(currentModelId);
      } catch (err) {
        continue;
      }

      const { modelDef, provider } = resolved;

      // Check if provider circuit breaker is tripped
      if (!providerHealth.isAvailable(provider.name)) {
        console.warn(`[Fallback Manager] Provider ${provider.name} circuit breaker is OPEN. Skipping model ${currentModelId}...`);
        continue;
      }

      const isFallback = i > 0;
      if (isFallback) {
        fallbackActivated = true;
        console.warn(`[Fallback Manager] Activating fallback model ${currentModelId} (${provider.name})...`);
      }

      // Max 1 retry attempt for transient hiccups on this model
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        if (signal?.aborted) {
          throw new Error('REQUEST_CANCELLED');
        }

        const startTimestamp = Date.now();
        try {
          const result = await executor({
            model: currentModelId,
            provider,
            isFallback,
            fallbackFrom: isFallback ? initialModel : null
          });

          // Record success in circuit breaker
          providerHealth.recordSuccess(provider.name, Date.now() - startTimestamp);

          return {
            ...result,
            actualModel: currentModelId,
            actualProvider: provider.name,
            fallbackActivated: isFallback,
            originalRequestedModel: initialModel
          };
        } catch (err) {
          lastError = err;
          const errorClass = this.classifyError(err);
          console.warn(`[Fallback Manager] Model ${currentModelId} attempt ${attempts} failed (${errorClass}): ${err.message}`);

          // Record failure in circuit breaker
          providerHealth.recordFailure(provider.name, err);

          // Non-retryable conditions: never retry auth, safety refusals, or client aborts
          if (
            errorClass === ERROR_CLASSES.AUTH_ERROR ||
            errorClass === ERROR_CLASSES.SAFETY_BLOCK ||
            errorClass === ERROR_CLASSES.CANCELLED ||
            errorClass === ERROR_CLASSES.BAD_REQUEST
          ) {
            throw err;
          }

          // If retryable rate limit or transient 503 and we have attempts left on same model
          if ((errorClass === ERROR_CLASSES.RATE_LIMIT || errorClass === ERROR_CLASSES.TRANSIENT_SERVER) && attempts < maxAttempts) {
            const jitterMs = Math.random() * 400 + 400; // 400-800ms
            await new Promise(r => setTimeout(r, jitterMs));
            continue;
          }

          // Move to next candidate in model chain
          break;
        }
      }
    }

    // If all models in the chain failed
    const finalSanitizedMessage = (lastError?.message || 'All configured AI providers failed to fulfill request')
      .replace(/key=[^&\s]+/gi, 'key=REDACTED');
    const finalError = new Error(finalSanitizedMessage);
    finalError.code = this.classifyError(lastError);
    throw finalError;
  }
}

const fallbackManager = new FallbackManager();

module.exports = {
  ERROR_CLASSES,
  FallbackManager,
  fallbackManager
};
