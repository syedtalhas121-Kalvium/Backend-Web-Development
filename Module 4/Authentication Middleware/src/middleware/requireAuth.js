const jwt = require('jsonwebtoken');

const unauthorized = {
  error: {
    code: 'AUTH_REQUIRED',
    message: 'Authentication required',
  },
};

module.exports = function requireAuth(req, res, next) {
  // Extract only a non-empty Bearer token. Other schemes are rejected.
  const authHeader = req.headers.authorization ?? '';
  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  const token = match ? match[1] : null;

  if (!token) {
    return res.status(401).json(unauthorized);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Only verified claims are trusted by downstream route handlers.
    req.user = payload;
    return next();
  } catch (_error) {
    // Keep every authentication failure indistinguishable to the client.
    return res.status(401).json(unauthorized);
  }
};
