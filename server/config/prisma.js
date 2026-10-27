const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

let rawPrismaInstance = null;
let isConnected = false;

function getRawPrismaClient() {
  if (!rawPrismaInstance) {
    rawPrismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['error', 'warn'] 
        : ['error'],
    });
  }
  return rawPrismaInstance;
}

// Model-level proxy returning rejected promises if PostgreSQL is not connected
const disconnectedModelProxy = new Proxy({}, {
  get(target, operation) {
    return () => Promise.reject(new Error(`PostgreSQL is not connected (Prisma operation ${String(operation)} skipped)`));
  }
});

// Safe Prisma Proxy ensuring immediate fallback when Postgres is not available
const safePrisma = new Proxy({}, {
  get(target, prop) {
    const raw = getRawPrismaClient();
    if (prop === '$queryRaw' || prop === '$connect' || prop === '$disconnect') {
      return raw[prop].bind(raw);
    }
    if (prop === '$transaction') {
      if (!isConnected) {
        return () => Promise.reject(new Error('PostgreSQL is not connected (Prisma $transaction skipped)'));
      }
      return raw.$transaction.bind(raw);
    }
    if (!isConnected) {
      return disconnectedModelProxy;
    }
    const val = raw[prop];
    if (typeof val === 'function') {
      return val.bind(raw);
    }
    return val;
  }
});

/**
 * Validates database connectivity
 * @returns {Promise<{ ok: boolean, error?: string, status: string }>}
 */
async function verifyDatabaseConnection() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalDb = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  // In cloud/Vercel serverless environment, skip local Postgres to avoid 10s connection hangs
  if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && isLocalDb) {
    isConnected = false;
    return { ok: false, status: 'skipped_local_in_production', error: 'No cloud PostgreSQL configured' };
  }

  const client = getRawPrismaClient();
  try {
    const pingPromise = client.$queryRaw`SELECT 1 as ping`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PostgreSQL connection timed out after 2000ms')), 2000)
    );
    await Promise.race([pingPromise, timeoutPromise]);
    isConnected = true;
    return { ok: true, status: 'connected' };
  } catch (error) {
    isConnected = false;
    return { 
      ok: false, 
      status: 'disconnected', 
      error: error.message 
    };
  }
}

function getDatabaseStatus() {
  return isConnected ? 'connected' : 'disconnected';
}

module.exports = {
  prisma: safePrisma,
  getPrismaClient: () => safePrisma,
  verifyDatabaseConnection,
  getDatabaseStatus
};
