# Portmetals Africa — Frontend (Vercel deployment)

This folder is the **frontend-only** deployment for Vercel. It contains exactly
what the browser needs (`src/`, `ai/src/`, Vite config) plus a `vercel.json`
that proxies every `/api/*` call to the backend on your VPS.

It is a **copy** — the real code lives in the repo root. When you update the
app, re-copy the folders here (the root `npm run build` pipeline is unchanged).

## How it connects

```
Browser (anyone) ──► https://portmetals-backend.tailab82b8.ts.net  (Tailscale Funnel — public HTTPS, no DNS)
Browser ──► Vercel (HTTPS) ──► /api/* ──► https://portmetals-backend.tailab82b8.ts.net/api/*  (via Funnel)
Browser ──► VPS directly ──► http://100.74.243.92:3000  (Tailscale URL, private — tailnet devices only)
```

- Tailscale **Funnel** exposes the backend to the public internet on a free
  Let's Encrypt HTTPS URL (`portmetals-backend.tailab82b8.ts.net`). No domain
  and no DNS records needed.
- The browser talks only to the Vercel domain (same-origin, no CORS); Vercel
  proxies `/api/:path*` → the Funnel URL server-side.
- Flutterwave webhooks/redirects are sent to the Vercel domain and proxied
  through the same path (`paymentOrigin` derives the host from the forwarded
  headers).

## Deploy (2 minutes)

1. **Push this folder** to a new Git repo (or a subdirectory) and import it in
   Vercel as a *Vite* project. Vercel auto-detects it via `vercel.json`
   (`buildCommand: vite build`, output `dist`).
2. **Set the env var** in Vercel → Project → Settings → Environment Variables:
   - `VITE_SYNC_DEVICE_SECRET` = the same value as `SYNC_DEVICE_SECRET` on the
     VPS (`/etc/portmetals.env`). Without a match, cloud sync is disabled.
   - Redeploy after changing it.
3. Deploy. Visit the Vercel URL — the dashboard loads, and `/api/health`
   through the proxy should return `{"status":"healthy"}`.

## Re-deploying after a code change

The frontend build runs inside Vercel, so pushing new code to the Vercel repo
rebuilds automatically. Make sure `src/`, `ai/src/`, `index.html`, and
`package.json` here stay in sync with the root — the root repo's
`npm run build` is the source of truth for the full-stack VPS deployment.

## Notes

- This folder is deploy-only. It shares `package-lock.json` with the root so
  dependency versions stay identical.
- Do **not** put server files (`server.ts`, `payments/`) here — they run only
  on the VPS.
- If you ever host the frontend elsewhere, just point the `vercel.json` rewrite
  destination at your new API base URL.
