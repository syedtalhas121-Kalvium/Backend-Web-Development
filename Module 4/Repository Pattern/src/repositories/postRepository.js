// The repository is the only module that knows how posts are stored.
// When Prisma replaces this Map, only this file changes; services, controllers,
// routes, and the five-method contract remain unchanged.
const initialPosts = [
  { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 },
  { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 },
];

// Map-backed implementation proves that callers depend on the repository
// contract rather than array methods, indexes, or direct mutation.
const posts = new Map(initialPosts.map((post) => [post.id, { ...post }]));
let nextId = 3;

function findAll() {
  return Array.from(posts.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = posts.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const record = { id: nextId++, ...fields };
  posts.set(record.id, record);
  return { ...record };
}

function update(id, patch) {
  const numericId = Number(id);
  const existing = posts.get(numericId);
  if (!existing) return null;

  const updated = { ...existing, ...patch, id: numericId };
  posts.set(numericId, updated);
  return { ...updated };
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
