/**
 * Posts router (mounted at /posts in app.js).
 *
 * auditWrite is intentionally mounted only on POST / to demonstrate
 * per-route middleware while keeping public reads free of the audit log.
 */

const express = require('express');
const router = express.Router();

const auditWrite = require('../middleware/auditWrite');

const posts = [{ id: 1, title: 'Hello World' }];

// Public read — no extra middleware.
router.get('/', (req, res) => {
  res.json({ data: posts });
});

// Write audit is scoped to post creation only.
router.post('/', auditWrite, (req, res) => {
  const post = { id: posts.length + 1, title: req.body.title || 'Untitled' };
  posts.push(post);
  res.status(201).json({ data: post });
});

module.exports = router;
