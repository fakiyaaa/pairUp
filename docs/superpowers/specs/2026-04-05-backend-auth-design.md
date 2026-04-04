# Backend Authentication Design

Date: 2026-04-05

## Overview

Backend authentication for PairUp using Supabase Auth via supabase-py, with HTTP-only cookies for token storage. Flask acts as the auth proxy — the frontend never talks to Supabase directly.

## Decisions

- **Supabase Auth** for user registration, login, and token management (not DIY bcrypt + JWT)
- **HTTP-only cookies** for storing access and refresh tokens (not localStorage)
- **Backend proxy** — frontend sends credentials to Flask, Flask calls Supabase Auth, Flask sets cookies
- **No email verification** — accounts are active immediately after signup
- **No email domain restriction** — any email accepted (Minerva-only deferred to later)

## Environment Variables

| Variable | Purpose | Source |
|---|---|---|
| `DATABASE_URL` | PostgreSQL session pooler connection for direct DB queries | Already exists |
| `SUPABASE_URL` | Supabase API URL (e.g. `https://xyz.supabase.co`) | Supabase dashboard > Settings > API |
| `SUPABASE_KEY` | Supabase anon/public key | Same location |

## Endpoints

All under `/auth` blueprint.

### `POST /auth/signup`

**Request body:**
```json
{
  "full_name": "required",
  "email": "required",
  "password": "required",
  "timezone": "required",
  "experience": "optional",
  "bio": "optional",
  "cal_com_link": "optional"
}
```

**Steps:**
1. Call `supabase.auth.sign_up({"email", "password", "options": {"data": {"full_name", "timezone"}}})` to create the auth user
2. If error (e.g. email already exists), return error response
3. Insert a row into `users` table (id, full_name, email, timezone, experience, bio, cal_com_link) with Supabase Auth user ID as PK
4. Set `access_token` and `refresh_token` as HTTP-only cookies
5. Return user profile JSON

### `POST /auth/login`

**Request body:**
```json
{
  "email": "required",
  "password": "required"
}
```

**Steps:**
1. Call `supabase.auth.sign_in_with_password({"email", "password"})`
2. If error (invalid credentials), return error response
3. Set `access_token` and `refresh_token` as HTTP-only cookies
4. Query `users` table for the user profile
5. Return user profile JSON

### `POST /auth/logout`

**Request body:** none

**Steps:**
1. Read `access_token` from cookie
2. Call `supabase.auth.sign_out()`
3. Clear both cookies
4. Return 200

### `POST /auth/refresh`

**Request body:** none

**Steps:**
1. Read `refresh_token` from cookie
2. Call `supabase.auth.refresh_session(refresh_token)`
3. Set new `access_token` and `refresh_token` cookies
4. Return 200

## Middleware — `require_auth` decorator

1. Read `access_token` cookie from request
2. Call `supabase.auth.get_user(access_token)` to verify
3. If invalid/expired, return 401
4. Set `g.user` with the Supabase user info
5. Proceed to the route handler

## Cookie Settings

| Property | Value |
|---|---|
| `httponly` | `True` |
| `secure` | `True` in production, `False` in dev |
| `samesite` | `Lax` |
| `path` | `/` |
| `access_token` max age | 900s (15 min) |
| `refresh_token` max age | 604800s (7 days) |

## Files Touched

| File | Change |
|---|---|
| `server/src/config.py` | Add `SUPABASE_URL`, `SUPABASE_KEY` |
| `server/src/supabase_client.py` | New — Supabase client initialization |
| `server/src/services/auth_service.py` | Signup, login, logout, refresh logic |
| `server/src/routes/auth.py` | Endpoint definitions |
| `server/src/middleware/auth.py` | `require_auth` decorator implementation |

## Supabase Python API Reference

```python
# Sign up
response = supabase.auth.sign_up({
    "email": "...",
    "password": "...",
    "options": {"data": {"full_name": "...", "timezone": "..."}}
})
# response.session.access_token, response.session.refresh_token, response.user

# Sign in
response = supabase.auth.sign_in_with_password({
    "email": "...",
    "password": "..."
})
# Same response shape

# Sign out
supabase.auth.sign_out()

# Refresh session
response = supabase.auth.refresh_session(refresh_token)
# New session with fresh tokens

# Verify user
response = supabase.auth.get_user(access_token)
# response.user
```
