# Supabase Setup — Portmetals Africa

The app persists its business data to **Supabase Postgres** as a JSONB document
per user ("cloud state sync"). The Express server is the only database client
(service-role key, server-side), so the browser never talks to Postgres
directly.

## 1. Create the project

1. Sign in at https://supabase.com → **New project**.
2. Name: `portmetals-africa` (project ref auto-generated, e.g.
   `sknxblcmkmgmaovepafz`).
3. Choose a region close to your users (e.g. `eu-central-1` / nearest), set a
   database password, **save it somewhere safe**.
4. Wait for provisioning (~2 minutes).

## 2. Apply the schema

Open **SQL Editor** and run the whole file:

```bash
# From this repo:
open deploy/supabase/schema.sql
# copy the contents into Supabase → SQL Editor → Run
```

What it creates:

- `public.business_state` — one row per `user_key`, holding the whole business
  snapshot in a `payload jsonb` column, with `version` and `updated_at`.
- RLS **enabled with zero policies** → anonymous/authenticated clients are
  locked out entirely; only the service role can read/write.
- `save_business_state(key, payload)` — atomic upsert + version bump, granted
  **only** to `service_role`.
- `clear_business_state(key)` — delete helper for the server.

## 3. Get the connection values

**Project Settings → API** (or **Database → Connection strings**):

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_URL` | Project Settings → API → Project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` secret (server only) |
| `SUPABASE_ANON_KEY` | Project Settings → API → `anon public` key (optional; the server is the DB client) |

## 4. Configure the app

Local `.env` (gitignored) and Render environment variables:

```env
SUPABASE_URL="https://YOUR-REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
SYNC_DEVICE_SECRET="<random string>"          # server-side gate (see below)
VITE_SYNC_DEVICE_SECRET="<same random string>" # baked into the build bundle
```

Generate the secret with `openssl rand -hex 32`. It must match on both sides.

The server enables the sync layer **only** when `SUPABASE_URL` + the service key
+ `SYNC_DEVICE_SECRET` are all present, and rejects `/api/sync` requests that
don't carry the secret in the `X-Device-Secret` header (timing-safe compare).
Without them, `/api/sync` returns 503 and the app runs fully offline
(localStorage as before) — nothing breaks.

> **Why a secret?** The sync API is what reads/writes your whole business
> snapshot. The shared secret stops anonymous drive-by reads and writes of
> `business_state` by anyone who finds your deployed app's URL. The value ships
> in the browser bundle (it's a gate, not a password), so it's always worth
> keeping RLS + service-role-only grants in place too — defense in depth.

## 5. Verify

Restart the server and check:

```bash
# Health
curl http://localhost:3000/api/health

# Write a snapshot (note the secret header)
curl -X PUT http://localhost:3000/api/sync \
  -H 'Content-Type: application/json' \
  -H 'X-Device-Secret: <secret>' \
  -d '{"userKey":"demo@portmetals.co.tz","payload":{"hello":"world","cart":[]}}'

# Read it back (should show version 2 after the upsert bump)
curl -H 'X-Device-Secret: <secret>' \
  "http://localhost:3000/api/sync?userKey=demo@portmetals.co.tz"

# Without the header the server answers 401:
curl "http://localhost:3000/api/sync?userKey=demo@portmetals.co.tz"

# Clear it
curl -X DELETE -H 'X-Device-Secret: <secret>' \
  "http://localhost:3000/api/sync?userKey=demo@portmetals.co.tz"
```

In Supabase → **Table Editor** you'll see the `business_state` row appear.

## Security notes

- The `service_role` key bypasses RLS — it must **never** be shipped to the
  browser. It lives only in server env.
- RLS with no policies means even a leaked anon key cannot read user data.
- `save_business_state` is `security definer` with a pinned `search_path`, so
  it can only touch `public.business_state`.

## Global accounts registry (shared customer roster)

Every registered account across **all** devices is stored in the existing
`business_state` table under the reserved key `__platform_accounts` (no extra
schema migration required — the sync RLS/RPC grants already lock it down).

- `GET /api/accounts` — returns the full shared roster
  (`{ accounts: [{ email, name, accountType, createdAt, lastLogin }] }`).
- `PUT /api/accounts` — upserts one account (signup, login or profile refresh).
  Public metadata only; passwords/2FA are never sent to the server.

The app pulls this on boot (`pullAccounts`) and merge-merges it into the local
`users` map (`mergeAccounts`), so the "Customers" counter and roster are
identical on every phone/laptop. Signups and logins push the account
(`pushAccount`), making new customers appear everywhere immediately.

Both endpoints require the same `X-Device-Secret` header as `/api/sync`.

## Freshness (always-latest state)

Each device tracks `syncVersion` (the cloud document version it last applied).
On boot `pullSnapshot` re-hydrates whenever the server's version is **newer**
than local — stale localStorage no longer wins silently. A successful push
records the returned version via `setSyncVersion`. Pending local edits made
offline are still protected, because an equal/older cloud doc is never applied
over them.
