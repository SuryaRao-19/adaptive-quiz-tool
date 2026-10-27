const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const { verifyDatabaseConnection, getDatabaseStatus } = require('./config/prisma');
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App
const app = express();

// Request ID & Safe Operational Logging
app.use(requestIdMiddleware);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database auto-connection middleware for serverless (Vercel) & traditional hosting
let mongoConnectionPromise = null;

const ensureDbConnected = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState < 1) {
      if (!mongoConnectionPromise) {
        mongoConnectionPromise = connectDB().finally(() => {
          mongoConnectionPromise = null;
        });
      }
      await mongoConnectionPromise;
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    if (req.path === '/api/health') return next();
    return res.status(503).json({
      success: false,
      message: 'Database connection initializing. Please retry in a moment.',
      error: err.message
    });
  }
};

// Health Check & Gateway Discovery
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  let mongoErr = null;
  if (mongoose.connection.readyState < 1) {
    try {
      await connectDB();
    } catch (err) {
      mongoErr = err.message;
    }
  }
  const pgStatus = await verifyDatabaseConnection();
  const isMongoConnected = mongoose.connection.readyState === 1;

  const isHealthy = pgStatus.ok || isMongoConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    mode: process.env.GATEWAY_MODE === 'true' ? 'classroom_gateway' : 'cloud',
    message: 'AdaptIQ Adaptive Quiz & Assessment Engine API is running.',
    databases: {
      postgresql: pgStatus.status,
      mongodb: isMongoConnected ? 'connected' : 'disconnected',
      mongoError: mongoErr
    },
    database: pgStatus.ok ? 'connected' : (isMongoConnected ? 'connected_mongo_fallback' : 'disconnected'),
    contentBundleVersion: process.env.CONTENT_BUNDLE_VERSION || '2.0.0-stem-offline',
    timestamp: new Date().toISOString()
  });
});

// Ensure Database Connected before processing API routes
app.use(ensureDbConnected);

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/gateway', require('./routes/gatewayRoutes'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Resource endpoint not found.' });
});

// Central Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database Connections and start HTTP server
async function startServer() {
  // 1. Check PostgreSQL via Prisma
  const pgStatus = await verifyDatabaseConnection();
  if (pgStatus.ok) {
    console.log('[Database] PostgreSQL Connected successfully via Prisma ORM.');
  } else {
    console.warn(`[Database Notice] PostgreSQL not reachable at ${process.env.DATABASE_URL || 'default'} (${pgStatus.error}).`);
    console.log('[Database Notice] Run "docker compose up -d" to launch the PostgreSQL container.');
  }

  // 2. Connect MongoDB fallback if available
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Database Notice] MongoDB initialization notice:', err.message);
  }

  // 3. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 AdaptIQ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🐘 PostgreSQL Status: ${pgStatus.status}`);
    console.log(`=============================================`);
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;
