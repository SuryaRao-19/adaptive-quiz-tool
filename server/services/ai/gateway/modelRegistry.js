/**
 * Model Registry & Provider Catalog
 * Aggregates all available and configured models across Gemini, OpenAI, Anthropic, and Ollama.
 * Dynamically resolves availability, capabilities, context limits, and estimated pricing.
 */

const { GeminiProvider, GEMINI_MODELS } = require('../providers/geminiProvider');
const { OpenAIProvider, OPENAI_MODELS } = require('../providers/openaiProvider');
const { AnthropicProvider, ANTHROPIC_MODELS } = require('../providers/anthropicProvider');
const { OllamaProvider, OLLAMA_MODELS } = require('../providers/ollamaProvider');
const { OmniRouteProvider, OMNIROUTE_PRECONFIGURED_MODELS } = require('../providers/omniRouteProvider');
const keys = require('../../../config/keys');

class ModelRegistry {
  constructor() {
    const omniProvider = new OmniRouteProvider();
    this.providers = {
      gemini: new GeminiProvider(),
      openai: new OpenAIProvider(),
      anthropic: new AnthropicProvider(),
      ollama: new OllamaProvider(),
      omni: omniProvider,
      omniroute: omniProvider
    };
  }

  /**
   * Retrieves provider instance by name
   * @param {string} providerName 
   */
  getProvider(providerName) {
    const provider = this.providers[providerName?.toLowerCase()];
    if (!provider) {
      throw new Error(`UNKNOWN_PROVIDER: Provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  /**
   * Returns all registered provider instances
   */
  getAllProviders() {
    return this.providers;
  }

  /**
   * Returns complete catalog of models across all providers with live availability status
   * @param {boolean} [configuredOnly=false]
   */
  listModels(configuredOnly = false) {
    const models = [];

    // 1. Gemini Models
    const geminiConf = this.providers.gemini.validateConfiguration();
    GEMINI_MODELS.forEach(m => {
      models.push({
        ...m,
        available: geminiConf.configured,
        configured: geminiConf.configured,
        isDefault: m.id === (keys.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash')
      });
    });

    // 2. OpenAI Models
    const openaiConf = this.providers.openai.validateConfiguration();
    OPENAI_MODELS.forEach(m => {
      models.push({
        ...m,
        available: openaiConf.configured,
        configured: openaiConf.configured,
        isDefault: m.id === (keys.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini')
      });
    });

    // 3. Anthropic Models
    const anthropicConf = this.providers.anthropic.validateConfiguration();
    ANTHROPIC_MODELS.forEach(m => {
      models.push({
        ...m,
        available: anthropicConf.configured,
        configured: anthropicConf.configured,
        isDefault: m.id === (keys.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-haiku-20241022')
      });
    });

    // 4. Ollama Models
    const ollamaConf = this.providers.ollama.validateConfiguration();
    OLLAMA_MODELS.forEach(m => {
      models.push({
        ...m,
        available: this.providers.ollama.isReachable,
        configured: ollamaConf.configured,
        isDefault: m.id === (keys.OLLAMA_DEFAULT_MODEL || 'llama3.2')
      });
    });

    // 5. OmniRoute Upstream Models
    const omniConf = this.providers.omniroute.validateConfiguration();
    this.providers.omniroute.listConfiguredModels().forEach(m => {
      models.push({
        ...m,
        available: omniConf.configured,
        configured: omniConf.configured,
        isDefault: m.id === (keys.OMNIROUTE_DEFAULT_MODEL || 'omni-auto')
      });
    });

    if (configuredOnly) {
      return models.filter(m => m.available);
    }
    return models;
  }

  /**
   * Finds a model by ID across all providers
   * @param {string} modelId 
   */
  findModel(modelId) {
    const all = this.listModels(false);
    return all.find(m => m.id.toLowerCase() === modelId.toLowerCase()) || null;
  }

  /**
   * Resolves the appropriate provider and model definition for a requested model ID
   * @param {string} modelId 
   */
  resolveModel(modelId) {
    const modelDef = this.findModel(modelId);
    if (!modelDef) {
      throw new Error(`MODEL_NOT_FOUND: Model '${modelId}' is not found in the registry.`);
    }
    const provider = this.getProvider(modelDef.provider);
    return {
      modelDef,
      provider
    };
  }
}

// Singleton model registry instance
const modelRegistry = new ModelRegistry();

module.exports = {
  modelRegistry,
  ModelRegistry
};

