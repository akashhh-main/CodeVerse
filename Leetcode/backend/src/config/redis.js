const { createClient } = require('redis');
require('dotenv').config();
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-16238.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16238
    }
});

module.exports = redisClient;