/**
 * Provider Health Tracker & Circuit Breaker Engine
 * Monitors provider latency, error rates, and prevents cascading retry storms.
 */

const STATES = {
  CLOSED: 'CLOSED',       // Normal operation
  OPEN: 'OPEN',           // Tripped, failing, bypass
  HALF_OPEN: 'HALF_OPEN'  // Testing recovery
};

class ProviderHealthMonitor {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 30000; // 30s
    this.windowSize = options.windowSize || 10;

    this.stats = {
      gemini: this._createProviderState(),
      openai: this._createProviderState(),
      anthropic: this._createProviderState(),
      ollama: this._createProviderState()
    };
  }

  _createProviderState() {
    return {
      state: STATES.CLOSED,
      consecutiveFailures: 0,
      totalRequests: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      lastFailureTime: null,
      lastError: null,
      latencies: [],
      averageLatencyMs: 0
    };
  }

  getProviderState(providerName) {
    const key = providerName?.toLowerCase();
    if (!this.stats[key]) {
      this.stats[key] = this._createProviderState();
    }
    const p = this.stats[key];

    // Check if OPEN circuit can transition to HALF_OPEN after cooldown
    if (p.state === STATES.OPEN && p.lastFailureTime) {
      if (Date.now() - p.lastFailureTime > this.cooldownPeriodMs) {
        p.state = STATES.HALF_OPEN;
      }
    }

    return p;
  }

  isAvailable(providerName) {
    const state = this.getProviderState(providerName);
    return state.state !== STATES.OPEN;
  }

  recordSuccess(providerName, durationMs = 0) {
    const p = this.getProviderState(providerName);
    p.totalRequests++;
    p.totalSuccesses++;
    p.consecutiveFailures = 0;
    p.state = STATES.CLOSED;

    p.latencies.push(durationMs);
    if (p.latencies.length > this.windowSize) {
      p.latencies.shift();
    }
    const sum = p.latencies.reduce((a, b) => a + b, 0);
    p.averageLatencyMs = Math.round(sum / p.latencies.length);
  }

  recordFailure(providerName, error) {
    const p = this.getProviderState(providerName);
    p.totalRequests++;
    p.totalFailures++;
    p.consecutiveFailures++;
    p.lastFailureTime = Date.now();
    p.lastError = error?.message || String(error);

    if (p.consecutiveFailures >= this.failureThreshold) {
      p.state = STATES.OPEN;
    }
  }

  reset(providerName) {
    const key = providerName?.toLowerCase();
    if (this.stats[key]) {
      this.stats[key] = this._createProviderState();
    }
  }

  getMetrics() {
    const metrics = {};
    for (const [name, s] of Object.entries(this.stats)) {
      metrics[name] = {
        state: s.state,
        healthy: s.state !== STATES.OPEN,
        consecutiveFailures: s.consecutiveFailures,
        totalRequests: s.totalRequests,
        totalSuccesses: s.totalSuccesses,
        totalFailures: s.totalFailures,
        averageLatencyMs: s.averageLatencyMs,
        lastError: s.lastError
      };
    }
    return metrics;
  }
}

const providerHealth = new ProviderHealthMonitor();

module.exports = {
  STATES,
  ProviderHealthMonitor,
  providerHealth
};

