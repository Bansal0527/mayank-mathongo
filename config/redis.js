const Redis = require('redis');
require('dotenv').config();

const redisClient = Redis.createClient({
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
