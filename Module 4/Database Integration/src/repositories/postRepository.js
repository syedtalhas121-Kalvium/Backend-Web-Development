const prisma = require('../db/prisma');
async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}
async function findById(id) {
  const postId = Number(id);
  if (!Number.isSafeInteger(postId) || postId <= 0) return null;
  return prisma.post.findUnique({ where: { id: postId } });
}
async function create(fields) {
  return prisma.post.create({ data: {
    title: fields.title, body: fields.body || '', authorId: Number(fields.authorId)
  }});
}
async function update(id, patch) {
  const postId = Number(id);
  if (!Number.isSafeInteger(postId) || postId <= 0) return null;
  if (!(await prisma.post.findUnique({ where: { id: postId } }))) return null;
  return prisma.post.update({ where: { id: postId }, data: {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.body !== undefined ? { body: patch.body } : {})
  }});
}
async function remove(id) {
  const postId = Number(id);
  if (!Number.isSafeInteger(postId) || postId <= 0) return false;
  if (!(await prisma.post.findUnique({ where: { id: postId } }))) return false;
  try { await prisma.post.delete({ where: { id: postId } }); return true; }
  catch (error) { if (error && error.code === 'P2025') return false; throw error; }
}
module.exports = { findAll, findById, create, update, remove };