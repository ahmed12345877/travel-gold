# Admin Access Quickstart

This project supports two fully working admin sign-in methods. Pick whichever is easiest for your deployment.

1. Password (no OAuth) — simplest and works anywhere
2. Supabase Auth (Google, Magic Link, password) — if you already use Supabase

Both methods end up issuing the same first‑party session cookie so the admin UI works uniformly.

## 1) Password Admin (no OAuth)

Configure two environment variables on the server:

- `ADMIN_EMAIL` — the admin email address (used for login username)
- `ADMIN_PASSWORD_HASH` — either the plain password (dev only) or a SHA‑256 hex hash of the password

Recommended: use a SHA‑256 hash. You can generate it with the included helper:

```bash
pnpm run hash-admin-password "your-strong-password"
# -> prints a 64-char hex string; copy it to ADMIN_PASSWORD_HASH
```

Then restart the server and sign in at:

- URL: `/admin/login`
- Enter `ADMIN_EMAIL` and the original password you hashed

On success, you’ll be redirected to `/admin` with an admin session cookie.

Notes

- Plain‑text fallback: if `ADMIN_PASSWORD_HASH` is not a 64‑char hex, it is treated as a plain password (intended for development only).
- The first successful login upserts an admin user in the database with `role = "admin"`.

## 2) Supabase Admin (OAuth / Magic Link)

If you prefer Supabase authentication, configure both client and server:

Server (needed to verify tokens and manage users)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Client (browser)

- `VITE_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Create or mark an admin user in Supabase so the app can recognize it:

- Option A: In Supabase Dashboard → Authentication → Users, set the user’s `app_metadata` to include `{ "role": "admin" }`.
- Option B: Call the built‑in endpoint `auth.ensureAdmin` via the app (requires `SUPABASE_SERVICE_ROLE_KEY`). This will create (or update) a user and set `app_metadata.role = "admin"`.

Sign in flows supported on `/admin/login` when Supabase is configured:

- Google OAuth (if enabled in Supabase settings)
- Magic link to email (if email provider and signups are enabled)

After Supabase authenticates, the frontend sends the Supabase access token to the server (`auth.supabaseLogin`), which validates it and issues the standard admin session cookie.

## Where things live

- Client admin pages: `client/src/pages/admin/*` (wrapped by `AdminLayout` which requires `user.role === "admin"`)
- Admin login page: `client/src/pages/admin/AdminLogin.tsx`
- TRPC server auth: `server/routers.ts` → `auth.login`, `auth.supabaseLogin`, `auth.ensureAdmin`
- Context resolution (turns request into `ctx.user`): `server/_core/context.ts`

## Verifying it works

1. Start the app, open `/admin/login` and sign in using either method.
2. You should be redirected to `/admin` and see the dashboard.
3. API sanity check: the client sends `Authorization: Bearer <supabase-token>` automatically when present; otherwise the server uses the first‑party session cookie.

## Troubleshooting

- 401 or redirect loop on admin pages: ensure either the session cookie is present or Supabase token is valid; check that the admin user’s `role` is `admin`.
- Supabase OAuth says “provider not enabled”: enable Google provider or email in Supabase → Authentication → Providers.
- CI install fails with frozen lockfile: run `pnpm install` locally to update `pnpm-lock.yaml` and commit the change; CI requires the lockfile to match `package.json`.
