require('dotenv').config();
const express = require('express');
const postController = require('./controllers/postController');
const prisma = require('./db/prisma');
const app = express();
app.use(express.json());
app.get('/posts', postController.list);
app.get('/posts/:id', postController.get);
app.post('/posts', postController.create);
app.patch('/posts/:id', postController.update);
app.delete('/posts/:id', postController.remove);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error && error.statusCode) return res.status(error.statusCode).json({ error: error.message });
  if (error && error.code === 'P2002') return res.status(409).json({ error: 'A record with those details already exists' });
  if (error && error.code === 'P2003') return res.status(400).json({ error: 'A referenced record does not exist' });
  if (error && error.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  console.error('Unhandled API error:', error && error.name ? error.name : 'Error');
  return res.status(500).json({ error: 'Internal server error' });
});
if (require.main === module) {
  const server = app.listen(process.env.PORT || 3000, () => console.log('API listening'));
  const shutdown = () => server.close(async () => { await prisma.$disconnect(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
module.exports = app;