/**
 * Ollama Local AI Provider Adapter
 * Implements BaseAIProvider for on-premise / local LLMs via Ollama's HTTP REST API.
 * Gracefully disables if local daemon is unreachable.
 */

const BaseAIProvider = require('./baseProvider');
const keys = require('../../../config/keys');

const OLLAMA_MODELS = [
  {
    id: 'llama3.2',
    name: 'Ollama LLaMA 3.2 (Local)',
    provider: 'ollama',
    speed: 'fast',
    reasoning: 'medium',
    contextLimit: 131072,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0, output: 0 },
    description: 'Local on-device inference with zero external network dependency.'
  },
  {
    id: 'deepseek-r1:7b',
    name: 'Ollama DeepSeek-R1 7B (Local)',
    provider: 'ollama',
    speed: 'moderate',
    reasoning: 'expert',
    contextLimit: 65536,
    maxOutputTokens: 4096,
    streaming: true,
    structuredOutput: true,
    pricing: { input: 0, output: 0 },
    description: 'Local deep reasoning model for mathematical derivations.'
  }
];

class OllamaProvider extends BaseAIProvider {
  constructor(host = null) {
    super('ollama');
    this.host = host || keys.OLLAMA_HOST || 'http://localhost:11434';
    this.isReachable = false;
    this.lastChecked = 0;
  }

  validateConfiguration() {
    return {
      configured: Boolean(this.host),
      defaultModel: keys.OLLAMA_DEFAULT_MODEL || 'llama3.2',
      host: this.host
    };
  }

  listConfiguredModels() {
    return OLLAMA_MODELS.map(m => ({
      ...m,
      available: this.isReachable
    }));
  }

  getCapabilities(modelId) {
    const found = OLLAMA_MODELS.find(m => m.id === modelId);
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
      const res = await fetch(`${this.host}/api/tags`, {
        signal: AbortSignal.timeout(2000)
      });
      this.isReachable = res.ok;
      this.lastChecked = Date.now();
      return {
        healthy: res.ok,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      this.isReachable = false;
      this.lastChecked = Date.now();
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: 'Ollama daemon not reachable at ' + this.host
      };
    }
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
    model = keys.OLLAMA_DEFAULT_MODEL || 'llama3.2',
    messages,
    prompt,
    systemInstruction,
    temperature = 0.5,
    signal = null
  }) {
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt, systemInstruction);

    const res = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: false,
        options: { temperature }
      }),
      signal
    });

    if (!res.ok) {
      throw new Error(`Ollama generation failed (HTTP ${res.status})`);
    }

    const data = await res.json();
    const rawText = data.message?.content || '';

    return {
      text: rawText,
      provider: 'ollama',
      model,
      usage: {
        inputTokens: data.prompt_eval_count || 0,
        outputTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        estimatedCost: 0,
        latencyMs: Date.now() - startTime
      }
    };
  }

  async generateStream({
    model = keys.OLLAMA_DEFAULT_MODEL || 'llama3.2',
    messages,
    prompt,
    systemInstruction,
    temperature = 0.6,
    signal = null,
    onChunk,
    onMetadata
  }) {
    const startTime = Date.now();
    const formattedMessages = this._formatMessages(messages, prompt, systemInstruction);

    const res = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
        options: { temperature }
      }),
      signal
    });

    if (!res.ok) {
      throw new Error(`Ollama stream failed (HTTP ${res.status})`);
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
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const chunk = parsed.message?.content;
          if (chunk) {
            if (!firstTokenTime) firstTokenTime = Date.now() - startTime;
            fullText += chunk;
            if (typeof onChunk === 'function') onChunk(chunk);
          }
        } catch (e) {
          // ignore partial JSON parse error
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const metadata = {
      provider: 'ollama',
      model,
      usage: {
        inputTokens: Math.ceil(JSON.stringify(formattedMessages).length / 4),
        outputTokens: Math.ceil(fullText.length / 4),
        totalTokens: Math.ceil(fullText.length / 4),
        estimatedCost: 0,
        timeToFirstTokenMs: firstTokenTime || durationMs,
        durationMs
      }
    };

    if (typeof onMetadata === 'function') onMetadata(metadata);

    return {
      text: fullText,
      provider: 'ollama',
      model,
      usage: metadata.usage
    };
  }
}

module.exports = {
  OllamaProvider,
  OLLAMA_MODELS
};

