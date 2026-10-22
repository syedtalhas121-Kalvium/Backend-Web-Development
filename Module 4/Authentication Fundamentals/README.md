# Authentication Fundamentals

Express + Prisma implementation of the Kalvium 4.7 assignment.

## Requirements

- Node.js 18+
- PostgreSQL
- npm

## Setup

Run these commands from this directory:

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your local PostgreSQL database. Never commit `.env`.

```bash
npm install
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -- --name init
npm start
```

The API listens on port 3000 by default. Set `PORT` to change it.

## Endpoints

### Register

`POST /auth/register`

```json
{
  "name": "Sam",
  "email": "sam@example.com",
  "password": "correct horse battery staple"
}
```

Success: `201 Created`

```json
{
  "data": {
    "id": "generated-user-id",
    "name": "Sam",
    "email": "sam@example.com"
  }
}
```

An existing normalized email returns `409`. Missing, non-string, or blank fields return `400`.

### Login

`POST /auth/login`

```json
{
  "email": "sam@example.com",
  "password": "correct horse battery staple"
}
```

Success: `200 OK` with the same safe `data` identity shape. Unknown email and incorrect password both return `401` with this exact body:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

The missing-account path compares against a valid dummy bcrypt hash to reduce account-enumeration timing differences.

## Security and architecture

- Only an asynchronous bcrypt hash is stored in `passwordHash`; plaintext passwords are never persisted or logged.
- Email is trimmed and lowercased for both registration and login. The database's unique constraint protects concurrent registrations.
- Repository functions are the only application layer that imports Prisma.
- Services own validation, normalization, hashing, comparison, and credential decisions. Controllers only translate service results into HTTP responses.
- Responses use an explicit allowlist: `id`, `name`, and `email`.
- Unexpected errors return a controlled `500` response without raw internal details.
- No JWT or session mechanism is implemented, as required by this assignment.

## Manual verification

After starting the API, send the sample requests above. Also test:

1. Register the same email with different casing; the second request should return `409`.
2. Log in with the wrong password.
3. Log in with an email that was never registered.
4. Compare the two failure responses: both must be exactly the same generic `401` JSON.
5. Submit missing or blank fields; expect `400`.
6. Confirm no response contains `password` or `passwordHash`.
