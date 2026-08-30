/**
 * Express Middleware Architecture — Build the Pipeline
 *
 * The app uses three global observability middleware in order:
 * requestId -> logger -> timing, followed by the routers.
 */

const express = require('express');

// The two routers are already written and mounted for you.
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const timing = require('./middleware/timing');

const app = express();

// Built-in body parser so POST /posts can read req.body.
app.use(express.json());

// Global observability pipeline: request ID must be available before the
// logger and timing middleware run.
app.use(requestId);
app.use(logger);
app.use(timing);

// Two mounted routers (do not remove these).
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
