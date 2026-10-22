const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`Authentication API listening on port ${config.port}`);
});

async function shutdown() {
  server.close(async () => {
    const prisma = require('./db/prisma');
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
