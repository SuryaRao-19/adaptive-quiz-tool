/**
 * Anthropic Provider Adapter
 * Implements BaseAIProvider using native fetch with SSE streaming,
 * token accounting, structured outputs, and AbortSignal cancellation.
 */

const BaseAIProvider = require('./baseProvider');
const keys = require('../../../config/keys');

const ANTHROPIC_MODELS = [
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    speed: 'ultra_fast',
    reasoning: 'high',
    contextLimit: 200000,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0.80, output: 4.00 },
    description: 'Fast, highly articulate conversational reasoning model.'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    speed: 'fast',
    reasoning: 'expert',
    contextLimit: 200000,
    maxOutputTokens: 8192,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 3.00, output: 15.00 },
    description: 'State-of-the-art coding, scientific reasoning, and nuances.'
  }
];

class AnthropicProvider extends BaseAIProvider {
  constructor(apiKey = null) {
    super('anthropic');
    this.apiKey = apiKey || keys.ANTHROPIC_API_KEY || '';
  }

  validateConfiguration() {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim());
    return {
      configured: hasKey,
      defaultModel: keys.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-haiku-20241022',
      error: hasKey ? undefined : 'ANTHROPIC_API_KEY is not configured in environment.'
    };
  }

  listConfiguredModels() {
    const isConfigured = this.validateConfiguration().configured;
    return ANTHROPIC_MODELS.map(m => ({
      ...m,
      available: isConfigured
    }));
  }

  getCapabilities(modelId) {
    const found = ANTHROPIC_MODELS.find(m => m.id === modelId);
    return found || {
      streaming: true,
      structuredOutput: true,
      reasoning: 'high',
      speed: 'fast'
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      if (!this.validateConfiguration().configured) {
        return { healthy: false, latencyMs: 0, error: 'ANTHROPIC_API_KEY not configured' };
      }
      return {
        healthy: true,
        latencyMs: Date.now() - start
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
    const model = ANTHROPIC_MODELS.find(m => m.id === modelId) || ANTHROPIC_MODELS[0];
    const cost = ((inputTokens / 1_000_000) * model.pricing.input) +
                 ((outputTokens / 1_000_000) * model.pricing.output);
    return Math.round(cost * 1_000_000) / 1_000_000;
  }

  _formatMessages(messages, prompt) {
    const formatted = [];
    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach(m => {
        if (m.role !== 'system') {
          formatted.push({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content || ''
          });
        }
      });
    } else if (prompt) {
      formatted.push({ role: 'user', content: prompt });
    }
    return formatted;
  }

  async generate({
    model = keys.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-haiku-20241022',
    messages,
    prompt,
    systemInstruction,
    temperature = 0.4,
    maxTokens = 4096,
    signal = null
  }) {
    if (!this.validateConfiguration().configured) {
      throw new Error('PROVIDER_NOT_CONFIGURED: Anthropic API key is missing.');
    }
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt);

    const body = {
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature
    };
    if (systemInstruction) body.system = systemInstruction;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || '';
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    return {
      text: rawText,
      provider: 'anthropic',
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
    model = keys.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-haiku-20241022',
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
      throw new Error('PROVIDER_NOT_CONFIGURED: Anthropic API key is missing.');
    }
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt);

    const body = {
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature,
      stream: true
    };
    if (systemInstruction) body.system = systemInstruction;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic streaming failed (HTTP ${res.status}): ${errText}`);
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
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              if (!firstTokenTime) firstTokenTime = Date.now() - startTime;
              fullText += parsed.delta.text;
              if (typeof onChunk === 'function') onChunk(parsed.delta.text);
            }
          } catch (e) {
            // ignore partial JSON parse error
          }
        }
      }
    }

    const inputTokens = Math.ceil(JSON.stringify(formattedMessages).length / 4);
    const outputTokens = Math.ceil(fullText.length / 4);
    const durationMs = Date.now() - startTime;

    const metadata = {
      provider: 'anthropic',
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
      provider: 'anthropic',
      model,
      usage: metadata.usage
    };
  }
}

module.exports = {
  AnthropicProvider,
  ANTHROPIC_MODELS
};

