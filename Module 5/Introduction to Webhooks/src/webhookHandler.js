'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Reject missing or malformed signatures before attempting comparison.
  if (
    typeof signature !== 'string' ||
    !signature.startsWith('sha256=') ||
    typeof secret !== 'string' ||
    !secret
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const receivedHex = signature.slice('sha256='.length);
  if (!/^[0-9a-f]{64}$/i.test(receivedHex)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // The provider signs the exact raw request bytes, not parsed JSON.
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(receivedHex, 'hex');

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Idempotency: acknowledge retries without repeating side effects.
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Mark before scheduling work so concurrent retries are also deduplicated.
  _processedIds.add(event.id);

  // Acknowledge the provider before doing potentially slow work.
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch((error) => {
      console.error('[webhook] Event processing failed:', error);
    });
  });
}

module.exports = { handleWebhook, _processedIds };
