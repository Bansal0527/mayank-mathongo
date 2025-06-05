const redisClient = require('../config/redis');

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    
    // Get current count
    const count = await redisClient.incr(key);
    
    // Set expiry on first request
    if (count === 1) {
      await redisClient.expire(key, 60); // 60 seconds = 1 minute
    }
    
    // Check if rate limit exceeded
    if (count > 30) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again in a minute.'
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', 30);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, 30 - count));
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(); // Continue without rate limiting if Redis fails
  }
};

module.exports = rateLimiter; 