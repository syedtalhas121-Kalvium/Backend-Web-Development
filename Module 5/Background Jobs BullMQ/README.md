# Background Jobs with BullMQ: Email Verification OTP Flow

Registration should not wait for SMTP. This project queues OTP emails in Redis with BullMQ and verifies one-time codes with expiry and attempt limits.

## Setup

```bash
npm install
cp .env.example .env
# Add Ethereal SMTP credentials to .env
redis-server
npm test
npm start
```

## Implementation

- `src/queue.js`: shared Redis connection and `email` queue with three attempts and exponential backoff.
- `src/worker.js`: processes OTP email jobs asynchronously and logs completion/failure.
- `src/otpStore.js`: six-digit OTP generation, 10-minute expiry, three-attempt limit, and single-use verification.

The routes in `src/app.js`, mail transporter in `src/email.js`, and tests are the provided scaffold and remain unchanged.
