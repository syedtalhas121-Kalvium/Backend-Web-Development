const express = require('express');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '16kb' }));
app.use('/auth', authRoutes);

// Invalid JSON is also a malformed request, not an internal server error.
app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
    });
  }
  return next(error);
});

app.use(errorHandler);

module.exports = app;
