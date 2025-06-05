const Redis = require('redis');
require('dotenv').config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;
