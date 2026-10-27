const dns = require('dns');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const keys = require('./keys');

// Ensure reliable SRV resolution across all ISPs and OS environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

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
    console.log(`[Database] Attempting connection to MongoDB at: ${connUri}...`);
    cachedConnection = await mongoose.connect(connUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Database] MongoDB Connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to external MongoDB (${error.message}).`);

    // In production, prohibit silent fallback to ephemeral in-memory database to prevent catastrophic data loss (Phase 10.4)
    if (process.env.NODE_ENV === 'production') {
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
