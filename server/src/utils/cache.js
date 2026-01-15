const { redisClient } = require('../config/redis');

const DEFAULT_TTL = 900; 

exports.getCache = async (key) => {
  const cached = await redisClient.get(key);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    await redisClient.del(key);
    return null;
  }
};

exports.setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttl
  });
};

exports.deleteCache = async (key) => {
  await redisClient.del(key);
};
