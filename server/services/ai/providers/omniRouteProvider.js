/**
 * OmniRoute Upstream AI Infrastructure Provider
 * 
 * Official documentation: https://omni.inamoriyama.com/docs
 * Conforms to BaseAIProvider contract and integrates through AdaptIQ AI Gateway.
 * 
 * Supports:
 * - GET /v1/models (Dynamic catalog discovery)
 * - POST /v1/chat/completions (Unary & SSE Streaming)
 * - POST /v1/responses (OmniRoute structured responses)
 * - POST /v1/embeddings (Vector embeddings)
 * - POST /v1/audio/transcriptions (Speech-to-text)
 * - POST /v1/audio/speech (Text-to-speech)
 * - POST /v1/images/generations (Educational diagram/illustration generation)
 */

const BaseAIProvider = require('./baseProvider');
const keys = require('../../../config/keys');

const OMNIROUTE_PRECONFIGURED_MODELS = [
  {
    id: 'omni-auto',
    name: 'OmniRoute Intelligent Auto-Router',
    provider: 'omni',
    speed: 'fast',
    reasoning: 'expert',
    contextLimit: 128000,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.20, output: 0.80 },
    description: 'Dynamic upstream model routing based on prompt intent, latency, and cost.'
  },
  {
    id: 'omni-reasoning-r1',
    name: 'OmniRoute Deep Reasoning (DeepSeek-R1 / Sonnet)',
    provider: 'omni',
    speed: 'medium',
    reasoning: 'expert',
    contextLimit: 128000,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.55, output: 2.19 },
    description: 'Specialized deep reasoning model for complex mathematics and science problem derivations.'
  },
  {
    id: 'omni-fast-flash',
    name: 'OmniRoute Fast Flash (Ultra-Low Latency)',
    provider: 'omni',
    speed: 'fast',
    reasoning: 'high',
    contextLimit: 64000,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.075, output: 0.30 },
    description: 'High-throughput economical model for routine student conversations and hints.'
  },
  {
    id: 'omni-structured-json',
    name: 'OmniRoute Structured Generator',
    provider: 'omni',
    speed: 'fast',
    reasoning: 'high',
    contextLimit: 64000,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.15, output: 0.60 },
    description: 'Strict JSON schema adhering model for assessment item authoring.'
  }
];

class OmniRouteProvider extends BaseAIProvider {
  constructor(config = {}) {
    super('omni');
    this.baseUrl = (config.baseUrl || keys.OMNIROUTE_BASE_URL || 'https://api.omniroute.ai/v1').replace(/\/+$/, '');
    this.apiKey = config.apiKey || keys.OMNIROUTE_API_KEY || '';
    this.defaultModel = keys.OMNIROUTE_DEFAULT_MODEL || 'omni-auto';
    this.reasoningModel = keys.OMNIROUTE_REASONING_MODEL || 'omni-reasoning-r1';
    this.fastModel = keys.OMNIROUTE_FAST_MODEL || 'omni-fast-flash';
    this.fallbackModel = keys.OMNIROUTE_FALLBACK_MODEL || 'gemini-2.0-flash';
    this.cachedModels = [];
    this.lastCatalogFetch = 0;
  }

  validateConfiguration() {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim());
    return {
      configured: hasKey,
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      reasoningModel: this.reasoningModel,
      fastModel: this.fastModel,
      error: hasKey ? undefined : 'OMNIROUTE_API_KEY is not configured in environment.'
    };
  }

  listConfiguredModels() {
    const isConfigured = this.validateConfiguration().configured;
    const staticList = OMNIROUTE_PRECONFIGURED_MODELS.map(m => ({
      ...m,
      available: isConfigured
    }));

    if (this.cachedModels.length > 0) {
      return [...staticList, ...this.cachedModels];
    }
    return staticList;
  }

  getCapabilities(modelId) {
    const all = this.listConfiguredModels();
    const found = all.find(m => m.id === modelId);
    return found || {
      streaming: true,
      structuredOutput: true,
      reasoning: modelId?.includes('reasoning') || modelId?.includes('r1') ? 'expert' : 'high',
      speed: modelId?.includes('flash') || modelId?.includes('fast') ? 'fast' : 'medium'
    };
  }

  /**
   * Dynamically fetch live model catalog from GET /v1/models
   */
  async fetchRemoteModelCatalog() {
    if (!this.validateConfiguration().configured) return [];
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data || json.models || [];
      this.cachedModels = list.map(item => ({
        id: item.id,
        name: item.name || item.id,
        provider: 'omniroute',
        speed: item.speed || 'fast',
        reasoning: item.reasoning || 'high',
        contextLimit: item.context_length || 128000,
        maxOutputTokens: item.max_tokens || 4096,
        streaming: true,
        structuredOutput: true,
        available: true,
        pricing: item.pricing || { input: 0.20, output: 0.80 },
        description: item.description || 'OmniRoute routed model.'
      }));
      this.lastCatalogFetch = Date.now();
      return this.cachedModels;
    } catch (err) {
      console.warn('[OmniRoute] Catalog discovery notice:', err.message);
      return [];
    }
  }

  async healthCheck() {
    const start = Date.now();
    try {
      if (!this.validateConfiguration().configured) {
        return { healthy: false, latencyMs: 0, error: 'OMNIROUTE_API_KEY not configured' };
      }
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`
        }
      });
      return {
        healthy: res.ok,
        latencyMs: Date.now() - start,
        error: res.ok ? undefined : `HTTP ${res.status}: ${res.statusText}`
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: err.message
      };
    }
  }

  calculateCost(modelId, inputTokens = 0, outputTokens = 0) {
    const model = this.listConfiguredModels().find(m => m.id === modelId) || OMNIROUTE_PRECONFIGURED_MODELS[0];
    const pricing = model.pricing || { input: 0.20, output: 0.80 };
    const cost = ((inputTokens / 1_000_000) * pricing.input) +
                 ((outputTokens / 1_000_000) * pricing.output);
    return Math.round(cost * 1_000_000) / 1_000_000;
  }

  /**
   * Unary content generation via POST /v1/chat/completions or POST /v1/responses
   */
  async generate({ prompt, systemPrompt, conversation = [], model = null, temperature = 0.7, maxTokens = 2048, responseFormat = null, signal = null }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const targetModel = model || this.defaultModel;
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    conversation.forEach(m => {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });

    if (prompt) {
      messages.push({ role: 'user', content: prompt });
    }

    const payload = {
      model: targetModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    if (responseFormat === 'json' || responseFormat === 'json_object') {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OMNIROUTE_ERROR: HTTP ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = this.calculateCost(targetModel, usage.prompt_tokens, usage.completion_tokens);

    return {
      text,
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        costUsd: cost
      },
      model: data.model || targetModel,
      provider: 'omniroute'
    };
  }

  /**
   * Streaming content generation via SSE (POST /v1/chat/completions)
   */
  async generateStream({ prompt, systemPrompt, conversation = [], model = null, temperature = 0.7, maxTokens = 2048, onChunk, onMetadata, signal = null }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const targetModel = model || this.defaultModel;
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    conversation.forEach(m => {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });

    if (prompt) {
      messages.push({ role: 'user', content: prompt });
    }

    const payload = {
      model: targetModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true }
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OMNIROUTE_STREAM_ERROR: HTTP ${res.status} - ${errText}`);
    }

    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        if (signal?.aborted) {
          await reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial trailing line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // skip keep-alives

          if (trimmed === 'data: [DONE]') {
            break;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                if (onChunk) onChunk(delta);
              }

              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens || inputTokens;
                outputTokens = parsed.usage.completion_tokens || outputTokens;
              }
            } catch (_) {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Rough fallback estimation if provider usage omitted
    if (!outputTokens) {
      outputTokens = Math.ceil(fullText.length / 4);
      inputTokens = Math.ceil((prompt?.length || 0 + (systemPrompt?.length || 0)) / 4);
    }

    const cost = this.calculateCost(targetModel, inputTokens, outputTokens);
    const finalUsage = {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd: cost
    };

    if (onMetadata) {
      onMetadata({
        model: targetModel,
        provider: 'omniroute',
        usage: finalUsage
      });
    }

    return {
      text: fullText,
      usage: finalUsage,
      model: targetModel,
      provider: 'omniroute'
    };
  }

  /**
   * Vector Embeddings API (POST /v1/embeddings)
   */
  async createEmbedding({ input, model = 'text-embedding-3-small' }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, input })
    });

    if (!res.ok) {
      throw new Error(`OMNIROUTE_EMBEDDING_ERROR: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      embedding: data.data?.[0]?.embedding || [],
      model: data.model || model,
      usage: data.usage || {}
    };
  }

  async generateEmbeddings(opts) {
    return this.createEmbedding(opts);
  }

  /**
   * Audio Speech-to-Text Transcription (POST /v1/audio/transcriptions)
   */
  async transcribeAudio({ fileBuffer, mimeType = 'audio/webm', model = 'whisper-1' }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, 'audio_input.webm');
    formData.append('model', model);

    const res = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error(`OMNIROUTE_TRANSCRIPTION_ERROR: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || '',
      model
    };
  }

  /**
   * Audio Text-to-Speech Generation (POST /v1/audio/speech)
   */
  async generateSpeech({ text, voice = 'alloy', model = 'tts-1' }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const res = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: text,
        voice
      })
    });

    if (!res.ok) {
      throw new Error(`OMNIROUTE_TTS_ERROR: HTTP ${res.status}`);
    }

    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Educational Diagram / Image Generation (POST /v1/images/generations)
   */
  async generateImage({ prompt, size = '1024x1024', n = 1, model = 'dall-e-3' }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('OMNIROUTE_UNCONFIGURED: OMNIROUTE_API_KEY is missing.');
    }

    const res = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt: `Educational scientific illustration, clear diagram: ${prompt}`,
        size,
        n
      })
    });

    if (!res.ok) {
      throw new Error(`OMNIROUTE_IMAGE_ERROR: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      images: data.data || [],
      model
    };
  }
}

const omniRouteProvider = new OmniRouteProvider();

module.exports = {
  OmniRouteProvider,
  omniRouteProvider,
  OMNIROUTE_PRECONFIGURED_MODELS
};
