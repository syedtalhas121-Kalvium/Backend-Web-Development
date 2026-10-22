const crypto = require('node:crypto');

// Learning/local-only store. Restarts clear sessions and separate processes cannot share them.
// Production should use a shared expiring store such as Redis.
const sessions = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000;

function create(userId) {
  const id = crypto.randomBytes(32).toString('base64url');
  const session = { userId, expiresAt: Date.now() + SESSION_TTL_MS };
  sessions.set(id, session);
  return { id, ...session };
}
function get(id) {
  if (typeof id !== 'string') return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }
  return { ...session };
}
function destroy(id) {
  if (typeof id === 'string') sessions.delete(id);
}
module.exports = { create, get, destroy, SESSION_TTL_MS };
