const {redisClient} = require('../config/redis');

const DEFAULT_TTL = 900; // 15 minutes

exports.getCache = async (key) => {
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
};

exports.setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
};

exports.deleteCache = async (key) => {
  await redisClient.del(key);
};
