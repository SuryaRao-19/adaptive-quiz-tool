/**
 * Server-Sent Events (SSE) Streaming Protocol Handler
 * Provides standardized streaming response lifecycles, heartbeats, 
 * granular timeouts (connection, first-token, idle-stream, max-duration),
 * and client cancellation detection.
 */

const keys = require('../../../config/keys');

const DEFAULT_TIMEOUTS = {
  connectionTimeoutMs: keys.AI_CONNECTION_TIMEOUT_MS || 10000,
  firstTokenTimeoutMs: keys.AI_FIRST_TOKEN_TIMEOUT_MS || 20000,
  idleStreamTimeoutMs: keys.AI_IDLE_STREAM_TIMEOUT_MS || 20000,
  maxDurationMs: keys.AI_MAX_GENERATION_MS || 120000
};

class SSEStreamSession {
  constructor(req, res, options = {}) {
    this.req = req;
    this.res = res;
    this.options = { ...DEFAULT_TIMEOUTS, ...options };
    
    this.isClosed = false;
    this.firstTokenReceived = false;
    this.startTime = Date.now();
    this.lastChunkTime = Date.now();
    this.heartbeatTimer = null;
    this.firstTokenTimer = null;
    this.idleTimer = null;
    this.maxDurationTimer = null;
    
    this.abortController = new AbortController();

    this._initializeHeaders();
    this._setupCancellation();
    this._startTimers();
  }

  get signal() {
    return this.abortController.signal;
  }

  _initializeHeaders() {
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    if (typeof this.res.flushHeaders === 'function') {
      this.res.flushHeaders();
    }
  }

  _setupCancellation() {
    // Detect when client aborts, stops, or navigates away
    if (typeof this.req?.on === 'function') {
      this.req.on('close', () => {
        if (!this.isClosed) {
          this.isClosed = true;
          this.abortController.abort(new Error('REQUEST_CANCELLED'));
          this._cleanup();
        }
      });
    }

    if (typeof this.res?.on === 'function') {
      this.res.on('finish', () => {
        this.isClosed = true;
        this._cleanup();
      });
    }
  }

  _startTimers() {
    // 1. Heartbeat ping every 15s to prevent proxy/browser connection drops
    this.heartbeatTimer = setInterval(() => {
      if (!this.isClosed) {
        this.res.write(': ping\n\n');
        if (typeof this.res.flush === 'function') this.res.flush();
      }
    }, 15000);

    // 2. First-token timeout
    this.firstTokenTimer = setTimeout(() => {
      if (!this.firstTokenReceived && !this.isClosed) {
        this.sendError(
          new Error(`First token timeout exceeded (${this.options.firstTokenTimeoutMs}ms)`),
          'PROVIDER_TIMEOUT'
        );
        this.abortController.abort(new Error('FIRST_TOKEN_TIMEOUT'));
      }
    }, this.options.firstTokenTimeoutMs);

    // 3. Max generation duration
    this.maxDurationTimer = setTimeout(() => {
      if (!this.isClosed) {
        this.sendError(
          new Error(`Maximum generation duration exceeded (${this.options.maxDurationMs}ms)`),
          'MAX_DURATION_EXCEEDED'
        );
        this.abortController.abort(new Error('MAX_DURATION_EXCEEDED'));
      }
    }, this.options.maxDurationMs);
  }

  _resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (!this.isClosed) {
        this.sendError(
          new Error(`Idle stream timeout exceeded (${this.options.idleStreamTimeoutMs}ms)`),
          'STREAM_IDLE_TIMEOUT'
        );
        this.abortController.abort(new Error('STREAM_IDLE_TIMEOUT'));
      }
    }, this.options.idleStreamTimeoutMs);
  }

  /**
   * Emits a text chunk to the client
   * @param {string} text
   */
  sendChunk(text) {
    if (this.isClosed || text === undefined || text === null) return;

    if (!this.firstTokenReceived) {
      this.firstTokenReceived = true;
      if (this.firstTokenTimer) {
        clearTimeout(this.firstTokenTimer);
        this.firstTokenTimer = null;
      }
    }

    this.lastChunkTime = Date.now();
    this._resetIdleTimer();

    const payload = JSON.stringify({ chunk: text });
    this.res.write(`event: chunk\ndata: ${payload}\n\n`);
    if (typeof this.res.flush === 'function') this.res.flush();
  }

  /**
   * Emits metadata (provider, model, token stats, timings)
   * @param {Object} metadata
   */
  sendMetadata(metadata) {
    if (this.isClosed) return;
    const payload = JSON.stringify(metadata);
    this.res.write(`event: metadata\ndata: ${payload}\n\n`);
    if (typeof this.res.flush === 'function') this.res.flush();
  }

  /**
   * Emits completion event and gracefully closes the stream
   * @param {Object} [summary]
   */
  sendDone(summary = {}) {
    if (this.isClosed) return;
    const payload = JSON.stringify({
      done: true,
      totalDurationMs: Date.now() - this.startTime,
      ...summary
    });
    this.res.write(`event: done\ndata: ${payload}\n\n`);
    if (typeof this.res.flush === 'function') this.res.flush();
    this.close();
  }

  /**
   * Emits an error event to the client
   * @param {Error|string} error
   * @param {string} [code='INTERNAL_ERROR']
   */
  sendError(error, code = 'INTERNAL_ERROR') {
    if (this.isClosed) return;
    const message = error?.message || String(error);
    const payload = JSON.stringify({
      error: message,
      code,
      timestamp: new Date().toISOString()
    });
    this.res.write(`event: error\ndata: ${payload}\n\n`);
    if (typeof this.res.flush === 'function') this.res.flush();
    this.close();
  }

  close() {
    if (this.isClosed) return;
    this.isClosed = true;
    this._cleanup();
    try {
      this.res.end();
    } catch (e) {
      // response might already be closed
    }
  }

  _cleanup() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.firstTokenTimer) clearTimeout(this.firstTokenTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.maxDurationTimer) clearTimeout(this.maxDurationTimer);
  }
}

/**
 * Creates and starts an SSE stream session
 */
function createSSESession(req, res, options) {
  return new SSEStreamSession(req, res, options);
}

module.exports = {
  SSEStreamSession,
  createSSESession,
  DEFAULT_TIMEOUTS
};
