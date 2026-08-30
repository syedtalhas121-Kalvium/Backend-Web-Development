/**
 * timing middleware  [mount GLOBALLY in app.js]
 *
 * Measures the time from middleware entry until the response finishes.
 */

module.exports = function timing(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const prefix = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${prefix}${req.method} ${req.path} took ${elapsed}ms`);
  });

  next();
};
