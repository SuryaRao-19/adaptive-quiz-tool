# Intelligent Model Routing & Fallback Engine

## Routing Modes

AdaptIQ provides two operational modes:

1. **AUTO (Recommended)**: The system analyzes request intent, prompt length, token estimation, recent latencies, and circuit breaker health to select the optimal model.
2. **MANUAL**: The student or teacher explicitly chooses an active configured model from the dropdown.

## Intent Classification Categories

| Category | Typical Prompts | Selected Model Preference |
| :--- | :--- | :--- |
| **`SIMPLE`** | Greetings, definitions, factual lookups (<35 chars) | `gemini-1.5-flash`, `gpt-4o-mini`, `llama3.2` |
| **`EDUCATIONAL_REASONING`** | Multi-step algebra, physics derivations, stoichiometry | `gemini-3.8-flash`, `gemini-2.5-pro`, `gpt-4o` |
| **`PROGRAMMING`** | Code snippets, syntax errors, algorithm analysis | `gemini-3.8-flash`, `claude-3-5-sonnet`, `gpt-4o` |
| **`TUTORING`** | Socratic prompts, conceptual inquiry, step guidance | `gemini-3.8-flash`, `gemini-2.0-flash`, `gpt-4o-mini` |
| **`CONTENT_GENERATION`** | Quiz generator, question banks, worksheets | `gemini-3.8-flash`, `gpt-4o-mini` |
| **`LONG_CONTEXT`** | History > 12 turns, large documents (>3000 chars) | `gemini-3.8-flash`, `gemini-2.0-flash` (1M+ window) |

## Circuit Breaker & Fallback Rules

- **Failure Threshold**: 3 consecutive server errors (500, 502, 503, 504, 429) trip the circuit breaker to `OPEN`.
- **Cooldown**: 30 seconds before transitioning to `HALF_OPEN`.
- **Pre-Stream Cascade**: If a primary provider encounters a transient failure *before* any text chunk has been streamed to the student, the gateway catches the error and silently cascades to the next eligible configured model in `fallbackCandidates`.
- **Non-Retryable Errors**: Authentication errors (401, 403), prompt safety blocks, and client cancellations are never retried or cascaded across providers.

