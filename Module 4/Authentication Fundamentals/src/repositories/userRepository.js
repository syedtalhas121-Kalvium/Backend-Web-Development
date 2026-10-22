const prisma = require('../db/prisma');

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function create({ name, email, passwordHash }) {
  return prisma.user.create({
    data: { name, email, passwordHash },
  });
}

module.exports = { findByEmail, create };
