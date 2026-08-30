/**
 * requestId middleware  [mount GLOBALLY in app.js]
 *
 * Generates a unique request ID, makes it available to downstream middleware,
 * and echoes it back to the client in the response header.
 */

const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  const id = randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
