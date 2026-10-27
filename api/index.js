const app = require('../server/server');
const connectDB = require('../server/config/db');

let isConnected = false;

/**
 * Serverless Function Handler for Vercel
 * Adapts the Express API for serverless request routing and maintains DB connectivity.
 */
module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.warn('[Vercel Serverless] Database connection notice:', err.message);
    }
  }
  return app(req, res);
};
