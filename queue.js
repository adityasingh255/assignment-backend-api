const Queue = require('bull');
const config = require('./config');
const imageProcessor = require('./workers/imageProcessor');

const imageQueue = new Queue('image-processing', {
    redis: { host: config.redisHost, port: config.redisPort }
});

// Process queue jobs
imageQueue.process(imageProcessor);

module.exports = imageQueue;
