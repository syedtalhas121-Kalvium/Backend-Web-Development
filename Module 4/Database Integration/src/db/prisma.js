const { PrismaClient } = require('@prisma/client');
// One shared client per application process.
module.exports = new PrismaClient();