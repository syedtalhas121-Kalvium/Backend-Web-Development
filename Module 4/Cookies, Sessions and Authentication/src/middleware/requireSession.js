const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');

function authRequired(res) {
  return res.status(401).json({
    error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
  });
}

module.exports = async function requireSession(req, res, next) {
  try {
    const sid = req.signedCookies && req.signedCookies.sid;
    if (!sid || typeof sid !== 'string') return authRequired(res);
    const session = sessionStore.get(sid);
    if (!session) return authRequired(res);
    const user = await userRepository.findPublicById(session.userId);
    if (!user) {
      sessionStore.destroy(sid);
      return authRequired(res);
    }
    req.user = user;
    next();
  } catch {
    return authRequired(res);
  }
};
