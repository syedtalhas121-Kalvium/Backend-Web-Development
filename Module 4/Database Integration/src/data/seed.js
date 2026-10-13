const prisma = require('../db/prisma');
async function main() {
  await prisma.user.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'Demo user' } });
  await prisma.post.upsert({ where: { id: 1 }, update: {}, create: { id: 1, title: 'First post', body: 'The contract survives storage changes.', authorId: 1 } });
  await prisma.post.upsert({ where: { id: 2 }, update: {}, create: { id: 2, title: 'Second post', body: 'Migrations record database design.', authorId: 1 } });
}
main().catch(() => { console.error('Database seed failed.'); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });