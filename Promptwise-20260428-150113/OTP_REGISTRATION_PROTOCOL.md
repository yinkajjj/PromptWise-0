# Email OTP Registration Protocol

This protocol defines how PromptWise should register users using email and one-time passwords (OTP).

## Goals

- Verify email ownership before account activation.
- Prevent brute-force and replay attacks.
- Keep personally identifiable data minimal and auditable.

## Flow

1. Client submits email to `POST /api/auth/otp/request`.
2. Server normalizes email (trim + lowercase) and validates format.
3. Server enforces request throttling by IP, device fingerprint, and email.
4. Server generates a 6-digit OTP and stores only hashed OTP + metadata.
5. Server sends OTP to email using transactional provider.
6. Client submits email + OTP to `POST /api/auth/otp/verify`.
7. Server validates hash, expiry, attempt count, and lock state.
8. On success, server marks email as verified, creates user/session, invalidates OTP.
9. Server writes audit events for request and verify outcomes.

## Data Model

### otp_challenges

- `id` UUID
- `email_normalized` string
- `otp_hash` string (argon2id or bcrypt)
- `created_at` timestamp
- `expires_at` timestamp
- `attempt_count` integer
- `max_attempts` integer
- `status` enum (`pending`, `verified`, `expired`, `locked`, `cancelled`)
- `requested_ip` string
- `requested_user_agent` string

## Security Controls

- OTP length: 6 digits.
- OTP validity window: 5 minutes.
- Max attempts per challenge: 5.
- Cooldown between requests: 30 seconds per email.
- Hard cap: 10 requests per hour per email.
- Lockout for repeated abuse: progressive backoff.
- Compare OTP hashes in constant time.
- Do not return whether an email already exists.

## API Contracts

### `POST /api/auth/otp/request`

Request:

```json
{
  "email": "user@example.com"
}
```

Response (always generic):

```json
{
  "ok": true,
  "message": "If this email can receive codes, an OTP has been sent."
}
```

### `POST /api/auth/otp/verify`

Request:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Success response:

```json
{
  "ok": true,
  "verified": true,
  "session": {
    "token": "<jwt-or-session-id>",
    "expiresIn": 3600
  }
}
```

Failure response:

```json
{
  "ok": false,
  "verified": false,
  "error": "invalid_or_expired_otp"
}
```

## Operational Notes

- Use a dedicated email provider template with anti-phishing tips.
- Sign all auth events with request correlation IDs.
- Keep OTP logs redacted; never log raw OTP values.
- Add monitoring alarms for request spikes and verification failures.
