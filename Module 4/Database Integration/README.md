# Database Integration
Replaces the post in-memory repository with PostgreSQL through Prisma while preserving its asynchronous contract.

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env` and configure a local PostgreSQL `DATABASE_URL`. Never commit `.env`.
3. Run:
```bash
npm run prisma:validate
npm run prisma:migrate
npm run prisma:generate
npm run db:seed
npm start
```
The seed is repeatable and does not delete data. Only run `npx prisma migrate reset` on a disposable local database you intend to erase.

## API
- `GET /posts`, `GET /posts/:id`
- `POST /posts` (provide a valid `authorId`)
- `PATCH /posts/:id`, `DELETE /posts/:id`

Prisma access stays in the database module and repository. Services/controllers do not import Prisma.