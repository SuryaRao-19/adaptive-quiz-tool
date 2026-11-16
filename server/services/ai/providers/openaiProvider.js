/**
 * OpenAI Provider Adapter
 * Implements BaseAIProvider using native fetch with SSE streaming,
 * token accounting, structured outputs, and AbortSignal cancellation.
 */

const BaseAIProvider = require('./baseProvider');
const keys = require('../../../config/keys');

const OPENAI_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    speed: 'fast',
    reasoning: 'high',
    contextLimit: 128000,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.15, output: 0.60 },
    description: 'Affordable, fast, and capable model for tutoring and reasoning.'
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    speed: 'fast',
    reasoning: 'expert',
    contextLimit: 128000,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 2.50, output: 10.00 },
    description: 'Flagship omni model with advanced coding and STEM reasoning.'
  }
];

class OpenAIProvider extends BaseAIProvider {
  constructor(apiKey = null) {
    super('openai');
    this.apiKey = apiKey || keys.OPENAI_API_KEY || '';
  }

  validateConfiguration() {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim());
    return {
      configured: hasKey,
      defaultModel: keys.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
      error: hasKey ? undefined : 'OPENAI_API_KEY is not configured in environment.'
    };
  }

  listConfiguredModels() {
    const isConfigured = this.validateConfiguration().configured;
    return OPENAI_MODELS.map(m => ({
      ...m,
      available: isConfigured
    }));
  }

  getCapabilities(modelId) {
    const found = OPENAI_MODELS.find(m => m.id === modelId);
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
        return { healthy: false, latencyMs: 0, error: 'OPENAI_API_KEY not configured' };
      }
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey.trim()}` }
      });
      return {
        healthy: res.ok,
        latencyMs: Date.now() - start,
        error: res.ok ? undefined : `HTTP ${res.status}`
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: err.message
      };
    }
  }

  calculateCost(modelId, inputTokens, outputTokens) {
    const model = OPENAI_MODELS.find(m => m.id === modelId) || OPENAI_MODELS[0];
    const cost = ((inputTokens / 1_000_000) * model.pricing.input) +
                 ((outputTokens / 1_000_000) * model.pricing.output);
    return Math.round(cost * 1_000_000) / 1_000_000;
  }

  _formatMessages(messages, prompt, systemInstruction) {
    const formatted = [];
    if (systemInstruction) {
      formatted.push({ role: 'system', content: systemInstruction });
    }
    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach(m => {
        formatted.push({
          role: m.role === 'model' ? 'assistant' : m.role,
          content: m.content || ''
        });
      });
    } else if (prompt) {
      formatted.push({ role: 'user', content: prompt });
    }
    return formatted;
  }

  async generate({
    model = keys.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
    messages,
    prompt,
    systemInstruction,
    schema,
    temperature = 0.4,
    maxTokens = 4096,
    signal = null
  }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('PROVIDER_NOT_CONFIGURED: OpenAI API key is missing.');
    }
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt, systemInstruction);

    const body = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens
    };
    if (schema) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

    let parsedData = null;
    if (schema) {
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        // fallback
      }
    }

    return {
      text: rawText,
      data: parsedData,
      provider: 'openai',
      model,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: this.calculateCost(model, inputTokens, outputTokens),
        latencyMs: Date.now() - startTime
      }
    };
  }

  async generateStream({
    model = keys.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
    messages,
    prompt,
    systemInstruction,
    temperature = 0.6,
    maxTokens = 4096,
    signal = null,
    onChunk,
    onMetadata
  }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('PROVIDER_NOT_CONFIGURED: OpenAI API key is missing.');
    }
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt, systemInstruction);

    const body = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI streaming failed (HTTP ${res.status}): ${errText}`);
    }

    let fullText = '';
    let firstTokenTime = null;
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        throw new Error('REQUEST_CANCELLED');
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              if (!firstTokenTime) firstTokenTime = Date.now() - startTime;
              fullText += delta;
              if (typeof onChunk === 'function') onChunk(delta);
            }
          } catch (e) {
            // ignore partial JSON parse error in stream line
          }
        }
      }
    }

    const inputTokens = Math.ceil(JSON.stringify(formattedMessages).length / 4);
    const outputTokens = Math.ceil(fullText.length / 4);
    const durationMs = Date.now() - startTime;

    const metadata = {
      provider: 'openai',
      model,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: this.calculateCost(model, inputTokens, outputTokens),
        timeToFirstTokenMs: firstTokenTime || durationMs,
        durationMs
      }
    };

    if (typeof onMetadata === 'function') onMetadata(metadata);

    return {
      text: fullText,
      provider: 'openai',
      model,
      usage: metadata.usage
    };
  }
}

module.exports = {
  OpenAIProvider,
  OPENAI_MODELS
};

