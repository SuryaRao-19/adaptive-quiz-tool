/**
 * Google Gemini Provider Adapter
 * Implements BaseAIProvider using the official @google/genai SDK with streaming,
 * token accounting, structured outputs, and AbortSignal cancellation.
 */

const { GoogleGenAI } = require('@google/genai');
const BaseAIProvider = require('./baseProvider');
const keys = require('../../../config/keys');

const GEMINI_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    speed: 'fast',
    reasoning: 'high',
    contextLimit: 1048576,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.075, output: 0.30 }, // per 1M tokens
    description: 'Ultra-fast, high-capability general & educational reasoning model.'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    speed: 'fast',
    reasoning: 'medium',
    contextLimit: 1048576,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.075, output: 0.30 },
    description: 'Balanced low-latency model for interactive tutoring.'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    speed: 'ultra_fast',
    reasoning: 'medium',
    contextLimit: 1048576,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.075, output: 0.30 },
    description: 'Fast lightweight fallback for high-throughput responses.'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    speed: 'moderate',
    reasoning: 'expert',
    contextLimit: 2097152,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 1.25, output: 5.00 },
    description: 'Deep STEM reasoning, multi-step math and algorithm proofs.'
  }
];

class GeminiProvider extends BaseAIProvider {
  constructor(apiKey = null) {
    super('gemini');
    this.apiKey = apiKey || keys.GEMINI_API_KEY || keys.AI_API_KEY || '';
    this.client = null;
  }

  getClient() {
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment.');
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey.trim() });
    }
    return this.client;
  }

  validateConfiguration() {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim());
    return {
      configured: hasKey,
      defaultModel: keys.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash',
      error: hasKey ? undefined : 'GEMINI_API_KEY is missing from environment.'
    };
  }

  listConfiguredModels() {
    const isConfigured = this.validateConfiguration().configured;
    return GEMINI_MODELS.map(m => ({
      ...m,
      available: isConfigured
    }));
  }

  getCapabilities(modelId) {
    const found = GEMINI_MODELS.find(m => m.id === modelId);
    return found || {
      streaming: true,
      structuredOutput: true,
      reasoning: 'medium',
      speed: 'fast'
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      if (!this.validateConfiguration().configured) {
        return { healthy: false, latencyMs: 0, error: 'GEMINI_API_KEY not configured' };
      }
      const ai = this.getClient();
      const testModel = keys.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash';
      const response = await ai.models.generateContent({
        model: testModel,
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      return {
        healthy: Boolean(response?.text),
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: err.message?.replace(/key=[^&\s]+/g, 'key=REDACTED')
      };
    }
  }

  _formatContents(messages, prompt) {
    if (Array.isArray(messages) && messages.length > 0) {
      return messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role),
        parts: [{ text: m.content || '' }]
      }));
    }
    return prompt || '';
  }

  calculateCost(modelId, inputTokens, outputTokens) {
    const model = GEMINI_MODELS.find(m => m.id === modelId) || GEMINI_MODELS[0];
    const cost = ((inputTokens / 1_000_000) * model.pricing.input) +
                 ((outputTokens / 1_000_000) * model.pricing.output);
    return Math.round(cost * 1_000_000) / 1_000_000;
  }

  /**
   * Unary generation
   */
  async generate({
    model = keys.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash',
    messages,
    prompt,
    systemInstruction,
    schema,
    temperature = 0.4,
    maxTokens = 4096,
    signal = null
  }) {
    const startTime = Date.now();
    const ai = this.getClient();

    const config = {
      temperature,
      maxOutputTokens: maxTokens
    };
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (schema) {
      config.responseSchema = schema;
      config.responseMimeType = 'application/json';
    }

    const contents = this._formatContents(messages, prompt);

    if (signal?.aborted) {
      throw new Error('REQUEST_CANCELLED');
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    const rawText = response.text || '';
    const usageMetadata = response.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || (inputTokens + outputTokens);
    const estimatedCost = this.calculateCost(model, inputTokens, outputTokens);

    let parsedData = null;
    if (schema) {
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        const stripped = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(stripped);
      }
    }

    return {
      text: rawText,
      data: parsedData,
      provider: 'gemini',
      model,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        latencyMs: Date.now() - startTime
      }
    };
  }

  /**
   * Streaming generation using @google/genai stream API
   */
  async generateStream({
    model = keys.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash',
    messages,
    prompt,
    systemInstruction,
    temperature = 0.6,
    maxTokens = 4096,
    signal = null,
    onChunk,
    onMetadata
  }) {
    const startTime = Date.now();
    const ai = this.getClient();

    const config = {
      temperature,
      maxOutputTokens: maxTokens
    };
    if (systemInstruction) config.systemInstruction = systemInstruction;

    const contents = this._formatContents(messages, prompt);

    if (signal?.aborted) {
      throw new Error('REQUEST_CANCELLED');
    }

    const streamResult = await ai.models.generateContentStream({
      model,
      contents,
      config
    });

    let fullText = '';
    let firstTokenTime = null;
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of streamResult) {
      if (signal?.aborted) {
        throw new Error('REQUEST_CANCELLED');
      }

      if (!firstTokenTime) {
        firstTokenTime = Date.now() - startTime;
      }

      const chunkText = chunk.text || '';
      if (chunkText) {
        fullText += chunkText;
        if (typeof onChunk === 'function') {
          onChunk(chunkText);
        }
      }

      if (chunk.usageMetadata) {
        inputTokens = chunk.usageMetadata.promptTokenCount || inputTokens;
        outputTokens = chunk.usageMetadata.candidatesTokenCount || outputTokens;
      }
    }

    // Fallback heuristic token count if usageMetadata omitted
    if (!inputTokens) inputTokens = Math.ceil(JSON.stringify(contents).length / 4);
    if (!outputTokens) outputTokens = Math.ceil(fullText.length / 4);

    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = this.calculateCost(model, inputTokens, outputTokens);
    const durationMs = Date.now() - startTime;

    const metadata = {
      provider: 'gemini',
      model,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        timeToFirstTokenMs: firstTokenTime || durationMs,
        durationMs
      }
    };

    if (typeof onMetadata === 'function') {
      onMetadata(metadata);
    }

    return {
      text: fullText,
      provider: 'gemini',
      model,
      usage: metadata.usage
    };
  }
}

module.exports = {
  GeminiProvider,
  GEMINI_MODELS
};

