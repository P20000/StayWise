const redis = require('redis');
const EventEmitter = require('events');

// Global event bus for in-memory pub/sub when Redis is offline
const memoryBus = new EventEmitter();
memoryBus.setMaxListeners(1000);

// In-Memory Fallback Map when Redis is unreachable locally
class MemoryCacheFallback {
  constructor() {
    this.store = new Map();
    this.hashStore = new Map();
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

  async setEx(key, seconds, value) {
    this.store.set(key, value);
    setTimeout(() => this.store.delete(key), seconds * 1000);
    return 'OK';
  }

  async del(key) {
    this.hashStore.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async setNX(key, value) {
    if (this.store.has(key)) return false;
    this.store.set(key, value);
    return true;
  }

  async hSet(key, fieldOrObj, value) {
    if (!this.hashStore.has(key)) {
      this.hashStore.set(key, new Map());
    }
    const map = this.hashStore.get(key);
    if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
      for (const [k, v] of Object.entries(fieldOrObj)) {
        map.set(k, String(v));
      }
    } else {
      map.set(fieldOrObj, String(value));
    }
    return map.size;
  }

  async hGetAll(key) {
    if (!this.hashStore.has(key)) return {};
    const map = this.hashStore.get(key);
    const result = {};
    for (const [k, v] of map.entries()) {
      result[k] = v;
    }
    return result;
  }

  async publish(channel, message) {
    memoryBus.emit(channel, message);
    return 1;
  }

  async subscribe(channel, callback) {
    memoryBus.on(channel, callback);
    return Promise.resolve();
  }

  async unsubscribe(channel, callback) {
    if (callback) {
      memoryBus.removeListener(channel, callback);
    } else {
      memoryBus.removeAllListeners(channel);
    }
    return Promise.resolve();
  }

  duplicate() {
    return this;
  }

  async connect() {
    return Promise.resolve();
  }

  async disconnect() {
    return Promise.resolve();
  }
}

let redisClient;
let pubClient;
let subClient;

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

    // Create dedicated pub and sub clients for SSE / BullMQ / Telemetry channels
    pubClient = client.duplicate();
    subClient = client.duplicate();
    pubClient.on('error', () => {});
    subClient.on('error', () => {});
    await pubClient.connect();
    await subClient.connect();
  } catch (error) {
    console.warn(`[CACHE] Redis Connection Failed (${error.message}). Falling back to local memory map.`);
    const fallback = new MemoryCacheFallback();
    redisClient = fallback;
    pubClient = fallback;
    subClient = fallback;
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    const fallback = new MemoryCacheFallback();
    redisClient = fallback;
    pubClient = fallback;
    subClient = fallback;
  }
  return redisClient;
};

const getPubSubClients = () => {
  if (!pubClient || !subClient) {
    getRedisClient();
  }
  return { pubClient, subClient };
};

module.exports = { initRedis, getRedisClient, getPubSubClients };
