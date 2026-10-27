const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

let prismaInstance = null;
let isConnected = false;

function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['error', 'warn'] 
        : ['error'],
    });
  }
  return prismaInstance;
}

/**
 * Validates database connectivity
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function verifyDatabaseConnection() {
  const client = getPrismaClient();
  try {
    // Parameterized ping query to verify network connectivity and credentials
    await client.$queryRaw`SELECT 1 as ping`;
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
  prisma: getPrismaClient(),
  getPrismaClient,
  verifyDatabaseConnection,
  getDatabaseStatus
};
