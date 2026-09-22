const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

function listPosts(query = {}) {
  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

  if (!page || !requestedLimit) {
    const error = new Error('page and limit must be positive integers');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const posts = store.getAllPosts();
  const total = posts.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    rows: posts.slice(start, start + limit),
    meta: { page, limit, total, pages }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';

  if (!title || !author) {
    const error = new Error('title and author are required');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    error.details = [
      ...(!title ? [{ field: 'title', message: 'Title is required' }] : []),
      ...(!author ? [{ field: 'author', message: 'Author is required' }] : [])
    ];
    throw error;
  }

  return store.createPost({ title, author });
}

function likePost(id) {
  const post = store.incrementLikes(id);
  if (!post) return null;
  return { postId: post.id, likes: post.likes };
}

function explode() {
  const err = new Error('internal diagnostic details');
  err.statusCode = 500;
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
