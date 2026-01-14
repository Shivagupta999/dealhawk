const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis client is connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis connected successfully');
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('❌ Failed to connect to Redis:', err.message);
      process.exit(1); 
    }
  }
};

// Graceful shutdown
const closeRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
};

process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);

module.exports = {
  redisClient,
  connectRedis
};
