/**
 * Base AI Provider Abstract Interface
 * Every model provider adapter (Gemini, OpenAI, Anthropic, Ollama) must conform to this contract.
 */

class BaseAIProvider {
  constructor(name) {
    if (this.constructor === BaseAIProvider) {
      throw new Error('BaseAIProvider is an abstract class and cannot be instantiated directly.');
    }
    this.name = name;
  }

  /**
   * Validates server-side configuration and returns status
   * @returns {{ configured: boolean, error?: string, defaultModel?: string }}
   */
  validateConfiguration() {
    throw new Error('validateConfiguration() must be implemented by subclass');
  }

  /**
   * Returns list of configured models supported by this provider
   * @returns {Array<Object>}
   */
  listConfiguredModels() {
    throw new Error('listConfiguredModels() must be implemented by subclass');
  }

  /**
   * Returns capability descriptors for a model
   * @param {string} modelId
   * @returns {Object}
   */
  getCapabilities(modelId) {
    throw new Error('getCapabilities() must be implemented by subclass');
  }

  /**
   * Performs live health check against provider API
   * @returns {Promise<{ healthy: boolean, latencyMs: number, error?: string }>}
   */
  async healthCheck() {
    throw new Error('healthCheck() must be implemented by subclass');
  }

  /**
   * Unary content generation
   * @param {Object} options
   * @returns {Promise<{ text: string, data?: any, usage: Object, model: string, provider: string }>}
   */
  async generate(options) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Streaming content generation
   * @param {Object} options
   * @param {Function} options.onChunk - Callback receiving (textChunk)
   * @param {Function} [options.onMetadata] - Callback receiving (metadataObject)
   * @param {AbortSignal} [options.signal] - Cancellation signal
   * @returns {Promise<{ text: string, usage: Object, model: string, provider: string }>}
   */
  async generateStream(options) {
    throw new Error('generateStream() must be implemented by subclass');
  }
}

module.exports = BaseAIProvider;

