const service = require('../services/postService');
const http = require('../utils/http');

function handleError(res, err) {
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = status === 500 ? 'Something went wrong' : err.message;
  return http.sendError(res, status, code, message, err.details);
}

function listPosts(req, res) {
  try {
    const { rows, meta } = service.listPosts(req.query);
    return http.sendList(res, rows, meta);
  } catch (err) {
    return handleError(res, err);
  }
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'NOT_FOUND', 'Post not found');
  }
  return http.sendData(res, post);
}

function createPost(req, res) {
  try {
    const post = service.createPost(req.body);
    return http.sendData(res, post, 201);
  } catch (err) {
    return handleError(res, err);
  }
}

function likePost(req, res) {
  const like = service.likePost(req.params.id);
  if (!like) {
    return http.sendError(res, 404, 'NOT_FOUND', 'Post not found');
  }
  return http.sendData(res, like, 201);
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
