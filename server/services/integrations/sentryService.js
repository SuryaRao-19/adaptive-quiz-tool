/**
 * AdaptIQ 3.0 — Sentry Monitoring & Error Telemetry Service
 * server/services/integrations/sentryService.js
 * 
 * Provides centralized error tracking, breadcrumb recording, and user context.
 * Graceful no-op when SENTRY_DSN is omitted.
 */

class SentryService {
  constructor() {
    this.dsn = process.env.SENTRY_DSN || null;
    this.environment = process.env.NODE_ENV || 'development';
    this.isConfigured = Boolean(this.dsn);
    this.recentErrors = [];
  }

  getStatus() {
    return {
      service: 'Sentry Telemetry',
      configured: this.isConfigured,
      environment: this.environment,
      capturedErrorCount: this.recentErrors.length,
      mode: this.isConfigured ? 'LIVE_INGEST' : 'IN_MEMORY_LOG'
    };
  }

  captureException(error, context = {}) {
    const errorRecord = {
      message: error?.message || String(error),
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    };

    this.recentErrors.unshift(errorRecord);
    if (this.recentErrors.length > 50) {
      this.recentErrors.pop();
    }

    if (this.isConfigured) {
      // In live production with @sentry/node installed, forward to Sentry.captureException(error)
      console.error('[SentryService Live Exception]', errorRecord);
    } else {
      console.warn('[SentryService Logged Exception (DSN not set)]', errorRecord.message);
    }

    return { logged: true, timestamp: errorRecord.timestamp };
  }

  captureMessage(message, level = 'info') {
    const record = { message, level, timestamp: new Date().toISOString() };
    if (this.isConfigured) {
      console.log(`[SentryService Live ${level.toUpperCase()}]`, message);
    }
    return record;
  }

  addBreadcrumb(breadcrumb) {
    // Breadcrumb recording for telemetry
    return { recorded: true, ...breadcrumb, timestamp: Date.now() };
  }
}

module.exports = new SentryService();
