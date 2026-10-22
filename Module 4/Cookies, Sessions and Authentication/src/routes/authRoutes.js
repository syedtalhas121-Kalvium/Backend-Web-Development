const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const cookieOptions = require('../session/cookieOptions');

const router = express.Router();
const genericLoginFailure = {
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
};

router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length > 1024) {
      return res.status(401).json(genericLoginFailure);
    }
    const user = await userRepository.findByEmail(email);
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) return res.status(401).json(genericLoginFailure);

    const session = sessionStore.create(user.id);
    res.cookie('sid', session.id, { ...cookieOptions(), signed: true, maxAge: sessionStore.SESSION_TTL_MS });
    return res.status(200).json({ data: userRepository.toPublicUser(user) });
  } catch {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ data: req.user });
});

router.post('/logout', (req, res) => {
  const sid = req.signedCookies && req.signedCookies.sid;
  sessionStore.destroy(sid);
  res.clearCookie('sid', { ...cookieOptions(), signed: true });
  return res.status(204).send();
});

module.exports = router;
