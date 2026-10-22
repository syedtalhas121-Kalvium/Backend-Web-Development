# Cookies, Sessions and Authentication

## Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to a long random value (at least 32 characters). Keep `COOKIE_SECURE=false` for local HTTP. In production, use HTTPS and set `COOKIE_SECURE=true`. Never commit `.env` or real secrets.

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## Endpoints

- `POST /auth/login` — validates credentials with bcrypt, creates an opaque server-side session, and sets a signed `sid` cookie.
- `GET /auth/me` — returns the safe user identity only when the signed cookie maps to a live server-side session and existing user.
- `POST /auth/logout` — destroys the server-side record and clears the cookie; repeat calls are safe.

## Verify with curl

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" -d '{"email":"sam@example.com","password":"SessionDemo!48"}' http://localhost:3000/auth/login
curl -i -b cookies.txt http://localhost:3000/auth/me
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Login should return a signed `sid` cookie with `HttpOnly` and `SameSite=Lax`. Missing, altered, expired, or revoked cookies should receive generic `401 AUTH_REQUIRED`; after logout, the old cookie is unusable. With `COOKIE_SECURE=true`, use HTTPS because browsers/clients should not send Secure cookies over plain HTTP.

## Session storage note

The included in-memory Map is for learning and local execution only: sessions disappear on restart and are not shared across processes. Production requires a shared expiring store such as Redis. Session IDs contain no identity or credential data. Cookie flags are centralized in `src/session/cookieOptions.js`.
