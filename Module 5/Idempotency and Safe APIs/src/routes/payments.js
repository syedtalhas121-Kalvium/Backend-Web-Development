'use strict';
// routes/payments.js
//
// POST /payments is protected by an Idempotency-Key. A repeated key replays
// the original response instead of creating another charge.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // Without a client-supplied key, this operation cannot be deduplicated.
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  // Replay the exact status and body saved for this logical operation.
  const saved = idempotency.get(key);
  if (saved) {
    return res.status(saved.status).json(saved.body);
  }

  // A new key represents a new payment operation and creates one charge.
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const status = 201;
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status, body });

  return res.status(status).json(body);
});

module.exports = router;
