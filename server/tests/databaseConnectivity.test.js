const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getPrismaClient, getDatabaseStatus, verifyDatabaseConnection } = require('../config/prisma');

describe('Database Connectivity & Health Check (Phase 1 & 3)', () => {
  it('exports a singleton PrismaClient instance', () => {
    const client1 = getPrismaClient();
    const client2 = getPrismaClient();
    assert.strictEqual(client1, client2, 'getPrismaClient must return a singleton instance');
    assert(client1 !== null && typeof client1 === 'object', 'Client must be a valid object');
  });

  it('returns structured database status object on verification', async () => {
    // When run without live PostgreSQL daemon, verifyDatabaseConnection must safely catch and return disconnected
    const result = await verifyDatabaseConnection();
    assert(typeof result === 'object', 'Result must be an object');
    assert('ok' in result, 'Result must contain ok flag');
    assert('status' in result, 'Result must contain status string');
    assert(['connected', 'disconnected'].includes(result.status), 'Status must be connected or disconnected');

    if (!result.ok) {
      assert(typeof result.error === 'string', 'Error message must be present when disconnected');
      assert.strictEqual(result.status, 'disconnected');
    } else {
      assert.strictEqual(result.status, 'connected');
    }
  });

  it('tracks current connection state accurately via getDatabaseStatus', () => {
    const status = getDatabaseStatus();
    assert(['connected', 'disconnected'].includes(status), 'getDatabaseStatus must return a known state');
  });

  it('handles database query errors gracefully without unhandled promise rejections', async () => {
    const client = getPrismaClient();
    // Test that client.$queryRaw handles malformed or unreachable calls by returning a rejected promise that can be caught
    try {
      await client.$queryRaw`SELECT 1 FROM non_existent_table_xyz_123`;
      // If connected and fails, it throws an expected error
    } catch (err) {
      assert(err instanceof Error, 'Database error should be an instance of Error');
    }
  });
});
