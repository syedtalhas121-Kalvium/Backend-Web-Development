'use strict';

require('dotenv').config();

const express = require('express');
const { handleWebhook } = require('./webhookHandler');

const app = express();

app.post(
  '/webhooks',
  express.raw({ type: 'application/json' }),
  handleWebhook,
);

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}

module.exports = { app };
