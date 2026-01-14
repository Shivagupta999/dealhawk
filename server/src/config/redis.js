const { Redis } = require('@upstash/redis');

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('✅ Upstash Redis connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to Upstash Redis:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown (no quit() needed for REST Redis)
const closeRedis = async () => {
  console.log('🛑 Upstash Redis connection closed (stateless)');
};

process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);

module.exports = {
  redisClient,
  connectRedis,
};
