const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

// Lightweight contract tests for the safe serializer. Endpoint integration
// checks require a configured PostgreSQL database; see README.md.
const { toSafeUser } = require('../src/services/authService');

test('safe user serialization allowlists only public identity fields', () => {
  const result = toSafeUser({
    id: 'user-1',
    name: 'Sam',
    email: 'sam@example.com',
    passwordHash: '$2a$10$private',
    password: 'never-return-this',
  });

  assert.deepEqual(result, {
    id: 'user-1',
    name: 'Sam',
    email: 'sam@example.com',
  });
  assert.equal(Object.hasOwn(result, 'passwordHash'), false);
  assert.equal(Object.hasOwn(result, 'password'), false);
});

test('bcrypt hash can verify the original password without storing plaintext', async () => {
  const hash = await bcrypt.hash('sample-password', 4);
  assert.notEqual(hash, 'sample-password');
  assert.equal(await bcrypt.compare('sample-password', hash), true);
  assert.equal(await bcrypt.compare('wrong-password', hash), false);
});
