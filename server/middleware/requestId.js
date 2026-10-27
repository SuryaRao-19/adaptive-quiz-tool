const crypto = require('crypto');

/**
 * Request ID middleware.
 * Attaches a unique X-Request-ID to every incoming HTTP request and response header.
 * Provides safe operational logging with automatic redaction of credentials and PINs.
 */
function requestIdMiddleware(req, res, next) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    // Safe operational logging: never log authorization headers, passwords, or PIN codes
    if (process.env.NODE_ENV !== 'test') {
      const sanitizedUrl = req.originalUrl.split('?')[0];
      console.log(`[HTTP] [${reqId.substring(0, 8)}] ${req.method} ${sanitizedUrl} ${res.statusCode} ${durationMs}ms`);
    }
  });

  next();
}

module.exports = requestIdMiddleware;
