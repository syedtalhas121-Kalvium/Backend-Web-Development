'use strict';

const { Queue } = require('bullmq');

// Queue and Worker share these Redis connection settings.
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
};

// Retry policy belongs to the Queue's default job options so every job
// added by a route inherits it without awaiting the worker's completion.
const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

module.exports = { emailQueue, connection };
