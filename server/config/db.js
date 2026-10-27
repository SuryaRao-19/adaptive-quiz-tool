const dns = require('dns');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const keys = require('./keys');

// Ensure reliable SRV resolution for local environments without interfering with cloud VPC DNS
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_) {}
}

let mongodInstance = null;
let cachedConnection = null;

const connectDB = async () => {
  // Return cached active connection in serverless or multi-call environments
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  const connUri = keys.MONGODB_URI;
  try {
    const maskedUri = connUri.replace(/:[^:]*@/, ':****@');
    console.log(`[Database] Attempting connection to MongoDB at: ${maskedUri}...`);
    cachedConnection = await mongoose.connect(connUri, { 
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to external MongoDB (${error.message}).`);

    // In production or cloud serverless, prohibit silent fallback to ephemeral in-memory database
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('[CRITICAL PRODUCTION DATABASE ERROR] Could not connect to external production MongoDB. Fallback to in-memory database is strictly disabled in production.');
      throw new Error(`Production database connection failed: ${error.message}. Please configure a valid MONGODB_URI.`);
    }

    console.log(`[Database] Starting zero-configuration in-memory MongoDB server for local/development use...`);
    try {
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-Memory MongoDB Connected at: ${memoryUri}`);
      try {
        const { seedData } = require('../scripts/seedFunction');
        await seedData();
      } catch (seedErr) {
        console.warn(`[Database Notice] In-memory auto-seed notice: ${seedErr.message}`);
      }
      console.log(`[Database] App initialized and seeded for local testing.`);
    } catch (memError) {
      console.error(`[Database Error] Failed to start in-memory database: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
