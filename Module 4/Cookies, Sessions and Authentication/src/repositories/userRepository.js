const prisma = require('../db/prisma');

function toPublicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}
async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
async function findPublicById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  return toPublicUser(user);
}
module.exports = { findByEmail, findPublicById, toPublicUser };
