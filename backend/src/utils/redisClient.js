'use strict';

const { Redis } = require('ioredis');
const config = require('../config');

// One ioredis client per role. BullMQ requires dedicated connections
// (blocking commands); rate limiters share a second client. Reused
// across require()s so dev (in-process worker) does not open duplicates.
const clients = new Map();

function getSharedRedis(role) {
  if (!clients.has(role)) {
    const client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    client.on('error', (err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[redis:${role}] ${err.message}`);
      }
    });
    clients.set(role, client);
  }
  return clients.get(role);
}

function closeSharedRedis() {
  const all = [...clients.values()];
  clients.clear();
  return Promise.all(all.map((c) => c.quit().catch(() => {})));
}

module.exports = { getSharedRedis, closeSharedRedis };
