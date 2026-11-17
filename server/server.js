const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
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
    if (mongoose.connection && mongoose.connection.readyState < 1) {
      if (!mongoConnectionPromise) {
        mongoConnectionPromise = connectDB().catch(() => {}).finally(() => {
          mongoConnectionPromise = null;
        });
      }
      await Promise.race([
        mongoConnectionPromise,
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    }
  } catch (err) {
    // Non-blocking: PostgreSQL and SyntheticStore provide primary storage
  }
  next();
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
  const { getIntegrationsStatus } = require('./services/integrations');

  const isHealthy = pgStatus.ok || isMongoConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    institution: 'Greenwood Public School, Sector-9, Gurugram (Affiliation: 530649)',
    mode: process.env.GATEWAY_MODE === 'true' ? 'classroom_gateway' : 'cloud',
    message: 'AdaptIQ 3.0 Deterministic Rule-Based Adaptive Learning & Assessment API is active.',
    adaptiveEngine: {
      mode: 'DETERMINISTIC_RULE_BASED',
      version: '3.0.0',
      algorithms: ['BKT (Bayesian Knowledge Tracing)', 'Rasch IRT (Item Response Theory)', 'Leitner 5-Box Spaced Repetition', 'Hake Normalized Gain', '3-Up / 2-Down Streak Calibration'],
      status: 'active'
    },
    integrations: getIntegrationsStatus(),
    databases: {
      postgresql: pgStatus.status,
      mongodb: isMongoConnected ? 'connected' : 'disconnected',
      mongoError: mongoErr
    },
    database: pgStatus.ok ? 'connected' : (isMongoConnected ? 'connected_mongo_fallback' : 'disconnected'),
    contentBundleVersion: process.env.CONTENT_BUNDLE_VERSION || '3.0.0-cbse-gps',
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
app.use('/api/adaptive', require('./routes/adaptiveRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/gateway', require('./routes/gatewayRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes'));
app.use('/api/school', require('./routes/schoolRoutes'));
app.use('/api/curriculum', require('./routes/curriculumRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/teacher', require('./routes/teacherAssessmentRoutes'));
app.use('/api/question-bank', require('./routes/questionBankRoutes'));
app.use('/api/curriculum-coverage', require('./routes/curriculumCoverageRoutes'));

// Decommissioned AI Routes Graceful Fallback
app.use('/api/chat', (req, res) => {
  res.status(200).json({
    success: true,
    decommissioned: true,
    message: 'AI Chat Assistant has been decommissioned in AdaptIQ 3.0 in favor of deterministic rule-based adaptive learning, Step-by-Step Solutions, and Reference Library.'
  });
});

app.use('/api/ai', (req, res) => {
  res.status(200).json({
    success: true,
    decommissioned: true,
    message: 'Generative AI routes have been decommissioned in AdaptIQ 3.0 in favor of deterministic adaptive algorithms.'
  });
});

// Root API & Service Status Entrypoint
const rootApiHandler = (req, res) => {
  if (req.accepts('html') && !req.accepts('json')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AdaptIQ 3.0 API &bull; Greenwood Public School</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem; max-width: 580px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .badge { display: inline-block; background: #4f46e5; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 1rem; }
          h1 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
          p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; margin: 0 0 1.5rem 0; }
          .links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
          .btn { background: #4f46e5; color: white; padding: 0.625rem 1.25rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
          .btn-outline { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
          .endpoints { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #334155; font-size: 0.75rem; font-family: monospace; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Greenwood Public School &bull; CBSE 530649</div>
          <h1>AdaptIQ 3.0 &bull; Backend API Server</h1>
          <p>The AdaptIQ deterministic rule-based adaptive learning server is active on Port 5000. Launch the student, teacher, or administrative interface on Port 5173.</p>
          <div class="links">
            <a class="btn" href="http://localhost:5173">Open Web App (localhost:5173)</a>
            <a class="btn btn-outline" href="/api/health">System Health Check</a>
          </div>
          <div class="endpoints">
            <strong>Active Core Endpoints:</strong><br>
            &bull; /api/curriculum/grades &bull; /api/questions &bull; /api/adaptive/learner-profile &bull; /api/schools/profile
          </div>
        </div>
      </body>
      </html>
    `);
  }

  return res.status(200).json({
    success: true,
    institution: 'Greenwood Public School, Sector-9, Gurugram (CBSE Affiliation: 530649, School Code: 40643)',
    platform: 'AdaptIQ 3.0 — Multi-Grade Adaptive Learning & Assessment Platform',
    status: 'ONLINE',
    port: process.env.PORT || 5000,
    frontend: 'http://localhost:5173',
    message: 'AdaptIQ 3.0 Backend API is operational.',
    endpoints: {
      health: '/api/health',
      schools: '/api/schools/profile',
      curriculum: '/api/curriculum/grades',
      adaptive: '/api/adaptive/learner-profile',
      questions: '/api/questions',
      assessments: '/api/assessments'
    }
  });
};

app.get('/', rootApiHandler);
app.get('/api', rootApiHandler);

// Serve Client Production SPA if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for API endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource endpoint not found.',
    requestedPath: req.originalUrl,
    method: req.method
  });
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

  // 2. Connect MongoDB fallback if available (with fast non-blocking timeout)
  try {
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB connection timeout (2.5s)')), 2500))
    ]);
  } catch (err) {
    console.warn('[Database Notice] MongoDB initialization skipped:', err.message);
  }

  // 3. Verify Deterministic Adaptive Engine & Integrations Status
  const { getIntegrationsStatus } = require('./services/integrations');
  const integrations = getIntegrationsStatus();
  const configuredIntegrationsCount = integrations.filter(i => i.configured).length;

  // 4. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 AdaptIQ 3.0 Server running on port ${PORT}`);
    console.log(`🏫 Institution: Greenwood Public School, Sector-9, Gurugram (CBSE: 530649)`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🐘 PostgreSQL Status: ${pgStatus.status}`);
    console.log(`🧠 Adaptive Engine: Deterministic Rule-Based (BKT, Rasch IRT, Leitner, Hake)`);
    console.log(`🔌 Integrations: ${configuredIntegrationsCount}/${integrations.length} active (Classroom, YouTube, Books, Calendar, Email, Sentry, OCR)`);
    console.log(`=============================================`);
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;
