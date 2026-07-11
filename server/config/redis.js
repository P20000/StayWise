const redis = require('redis');

// In-Memory Fallback Map when Redis is unreachable locally
class MemoryCacheFallback {
  constructor() {
    this.store = new Map();
    console.warn('[CACHE] Using In-Memory Fallback Store (Redis offline or unavailable)');
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, options = {}) {
    this.store.set(key, value);
    if (options.EX || options.ex) {
      setTimeout(() => this.store.delete(key), (options.EX || options.ex) * 1000);
    }
    return 'OK';
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async setNX(key, value) {
    if (this.store.has(key)) return false;
    this.store.set(key, value);
    return true;
  }
}

let redisClient;

const initRedis = async () => {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    const client = redis.createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            return new Error('Redis connection attempts exhausted');
          }
          return 100; // retry after 100ms
        },
        connectTimeout: 2000 // 2 seconds timeout
      }
    });

    client.on('error', (err) => {
      // Catch socket connection errors without crashing Node process
    });

    await client.connect();
    console.log('[CACHE] Connected to Distributed Redis Cluster');
    redisClient = client;
  } catch (error) {
    console.warn(`[CACHE] Redis Connection Failed (${error.message}). Falling back to local memory map.`);
    redisClient = new MemoryCacheFallback();
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new MemoryCacheFallback();
  }
  return redisClient;
};

module.exports = { initRedis, getRedisClient };
