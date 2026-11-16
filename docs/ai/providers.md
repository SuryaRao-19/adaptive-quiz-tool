# AI Providers Specification

AdaptIQ AI Tutor 3.0 supports multiple AI providers through standardized adapters conforming to `BaseAIProvider`.

## Supported Providers

### 1. Google Gemini (Primary)
- **SDK**: Official `@google/genai` (v2.32.0)
- **Config Key**: `GEMINI_API_KEY` (or `AI_API_KEY`)
- **Default Model**: `gemini-3.8-flash`
- **Supported Models**:
  - `gemini-3.8-flash`: Ultra-fast, reasoning, 1M context window, structured JSON schemas.
  - `gemini-2.0-flash`: Low-latency conversational model.
  - `gemini-1.5-flash`: High-throughput fallback.
  - `gemini-2.5-pro`: Deep STEM reasoning, algorithmic proofs.
- **Features**: Native streaming (`generateContentStream`), structured JSON output, token calculation.

### 2. OpenAI (Secondary)
- **Adapter**: Native fetch with Server-Sent Events stream reader.
- **Config Key**: `OPENAI_API_KEY`
- **Default Model**: `gpt-4o-mini`
- **Supported Models**: `gpt-4o-mini`, `gpt-4o`.
- **Status**: Enabled only when `OPENAI_API_KEY` is present. Gracefully disabled without crashing if key is absent.

### 3. Anthropic (Secondary)
- **Adapter**: Native fetch with Anthropic SSE protocol.
- **Config Key**: `ANTHROPIC_API_KEY`
- **Default Model**: `claude-3-5-haiku-20241022`
- **Supported Models**: `claude-3-5-haiku-20241022`, `claude-3-5-sonnet-20241022`.
- **Status**: Enabled only when `ANTHROPIC_API_KEY` is present.

### 4. Ollama (Local On-Premises)
- **Adapter**: Local REST client via `http://localhost:11434`.
- **Config Key**: `OLLAMA_HOST`
- **Default Model**: `llama3.2`
- **Supported Models**: `llama3.2`, `deepseek-r1:7b`.
- **Status**: Dynamically verified via `/api/tags` health check.

## Common Interface Contract
Every provider implements:
- `validateConfiguration()`
- `listConfiguredModels()`
- `getCapabilities(modelId)`
- `healthCheck()`
- `generate({ model, messages, prompt, systemInstruction, schema, signal })`
- `generateStream({ model, messages, prompt, systemInstruction, signal, onChunk, onMetadata })`

