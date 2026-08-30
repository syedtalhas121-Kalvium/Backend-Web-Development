/**
 * logger middleware  [mount GLOBALLY in app.js]
 *
 * Logs the final request method, path, and response status when the response
 * finishes. The request ID is included when requestId has already run.
 */

module.exports = function logger(req, res, next) {
  res.on('finish', () => {
    const prefix = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${prefix}${req.method} ${req.path} ${res.statusCode}`);
  });

  next();
};
