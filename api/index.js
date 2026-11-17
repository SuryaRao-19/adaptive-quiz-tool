const app = require('../server/server');

/**
 * Serverless Function Handler for Vercel
 * Adapts the Express API for serverless request routing.
 * Ensures instant non-blocking responses on serverless cold starts.
 */
module.exports = (req, res) => {
  // Ensure the URL matches Express route prefix (/api/...)
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
