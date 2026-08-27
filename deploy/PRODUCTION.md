# Production deployment — VPS backend + Vercel frontend

The app runs in two parts:

| Part | Where | What |
| --- | --- | --- |
| **Backend** (Node/Express) | VPS `169.58.184.20` | All `/api/*`: AI (Hugging Face), payments, sync, Twilio, the built SPA fallback |
| **Frontend** (Vite/React) | Vercel (optional) | The dashboard UI; proxies `/api/*` to the backend |

```
Browser (anyone) ──► https://portmetals-backend.tailab82b8.ts.net  (Tailscale Funnel — public HTTPS)
Browser ──► Vercel (HTTPS) ──► /api/* ──► https://portmetals-backend.tailab82b8.ts.net/api/*
```

No custom domain and no DNS required. **Tailscale Funnel** gives the backend a
public HTTPS URL (`portmetals-backend.tailab82b8.ts.net`) with a free
Let's Encrypt cert. Vercel proxies `/api/*` to that same URL.

## Backend (already running, fully verified)

- App: `/opt/portmetals-africa` (server bundle `server-dist/server.cjs`, static
  `dist/`), runtime deps installed with `npm ci --omit=dev`.
- Service: `portmetals.service` (systemd, `Restart=always`), env file
  `/etc/portmetals.env`, logs `/var/log/portmetals.log`.
- AI provider: **Hugging Face live** (`/api/ai/mode` reports
  `provider: huggingface`, `meta-llama/Llama-3.3-70B-Instruct`); Gemini is the
  fallback.
- **Closed-loop CNX Intelligence** (`ai/src/core.ts`) is live: every AI chat is
  grounded in one persistent business-intelligence block (real figures, Top 3
  priorities, measured outcomes) so answers are never generic; the Intelligence
  Board (AI Advisor → "Intel") runs the loop
  Understand → Diagnose → Prioritize → Execute → Measure → Learn, supports
  EN/SW/FR/DE, and logs outcomes to the sync'd store.
- Firewall (ufw): 22, 80, 443, 3000, 8000 open. Port 3000 serves the app.
- Tailscale: **second, isolated instance** (`tailscaled-bnx.service`, own
  state/socket/port/tun) hosts node **`portmetals-backend`**
  (`100.74.243.92`) — separate from the existing `aios-vps` node (untouched,
  still on `100.98.9.116:443` / `:8000`).
- Caddy is installed but **disabled** (the `portmetals.co.tz` domain was
  removed; re-enable it only when a customer supplies a domain).

### Updating the backend

```bash
# build locally (npm run build), then:
scp server-dist/server.cjs root@169.58.184.20:/opt/portmetals-africa/server-dist/
scp -r dist/* root@169.58.184.20:/opt/portmetals-africa/dist/
ssh root@169.58.184.20 "systemctl restart portmetals"
```

## Frontend (Vercel) — the `vercel/` folder

`vercel/` is a self-contained frontend-only deploy. See `vercel/README.md`.

1. Import `vercel/` in Vercel as a Vite project (`vercel.json` handles the
   rest; `/api/*` rewrites to the Funnel URL).
2. Set `VITE_SYNC_DEVICE_SECRET` to match `SYNC_DEVICE_SECRET` in
   `/etc/portmetals.env`.

> The private Tailscale URL (`http://100.74.243.92:3000`) is only reachable
> from tailnet devices; the Funnel URL is public. Enable Funnel in the tailnet
> admin console (one-time), then it is active while `tailscaled-bnx` runs.

## Environment variables (`/etc/portmetals.env`)

| Variable | Status | Notes |
| --- | --- | --- |
| `HUGGINGFACE_API_KEY` | set | Primary AI — live |
| `HUGGINGFACE_MODEL` | optional | Default `meta-llama/Llama-3.3-70B-Instruct` |
| `GEMINI_API_KEY` | set | Fallback chat + Gemini TTS voice |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | set | Cloud sync |
| `SYNC_DEVICE_SECRET` / `VITE_SYNC_DEVICE_SECRET` | set | Must mirror in Vercel |
| `PORT` / `NODE_ENV` / `APP_URL` | set | `APP_URL=http://169.58.184.20:3000` (Twilio callbacks) |
| `FLUTTERWAVE_SECRET_KEY` / `FLUTTERWAVE_SECRET_HASH` | pending | Live payments (simulation until then) |
| `TWILIO_*` | not set | Live AI voice calls (simulated until then) |

## Live checks

```bash
curl https://portmetals-backend.tailab82b8.ts.net/api/health    # public (Funnel)
curl http://169.58.184.20:3000/api/health                       # public IP
curl http://100.74.243.92:3000/api/health                       # Tailscale (private)
curl http://169.58.184.20:3000/api/ai/mode                      # provider/model
```
