# Contabo VPS — Ollama Qwen3 Runbook

The Contabo VPS does **one job**: run the AI model (`qwen3:4b`) behind Ollama.
The app itself (frontend + Express server) deploys to **Render**, and the data
lives in **Supabase (Postgres)**. The VPS is not exposed to the public internet —
the Render app reaches it over an SSH tunnel or a private reverse proxy.

Why this setup:

- **No per-token AI bill.** Qwen3-4B runs on your own hardware, 24/7.
- **Keys stay server-side.** The browser only ever talks to your Express server;
  the Express server talks to Ollama over a private channel.
- **Fallbacks keep it alive.** If the VPS is down, the app falls back to
  Google Gemini (chat + the copilot voice), and finally to the local engine.

---

## 1. Provision the VPS

1. Order a Contabo VPS (Cloud VPS S or higher — 4+ GB RAM recommended for
   `qwen3:4b` comfortably). Pick Ubuntu 22.04 / 24.04.
2. Note the **IP address**, **root password** (or your SSH key), and the
   **hostname** from the Contabo panel.
3. From your laptop, connect and do the basics:

```bash
ssh root@YOUR_VPS_IP

# Update everything
apt update && apt upgrade -y

# Create a non-root user so the VPS isn't operated as root
adduser amani
usermod -aG sudo amani

# Optional but recommended: copy your laptop's SSH key
# On your laptop:  ssh-copy-id amani@YOUR_VPS_IP
```

---

## 2. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model we use (set as OLLAMA_MODEL in .env)
ollama pull qwen3:4b

# Confirm
ollama list
```

Expected output: `qwen3:4b   4.9GB   ...`

Test it locally on the VPS:

```bash
ollama run qwen3:4b "Say hello in one short sentence"
```

Then stop the interactive session with `Ctrl-D` (or `/bye`).

Ollama now listens on `127.0.0.1:11434` — localhost only. That is exactly
what we want; do **not** change `OLLAMA_HOST` to expose it publicly.

---

## 3. Run Ollama as a systemd service (so it survives reboots)

The installer normally adds a service already. Verify:

```bash
systemctl status ollama
sudo systemctl enable ollama   # start on boot, if not already
```

---

## 4. Open the private channel from Render to the VPS

Two options. **Option A (SSH tunnel) is the simplest and is what the app
expects by default.** Option B is for when you outgrow tunnels.

### Option A — SSH reverse tunnel (recommended to start)

On the VPS, install autossh:

```bash
apt install -y autossh
```

Create a dedicated service that maintains a persistent tunnel **from the VPS
out to a jump host** … this gets fiddly with two hosts in play. The cleaner
pattern: run the tunnel **from Render** is not possible (Render free tier has
no SSH). Instead use an **SSH reverse tunnel initiated by the VPS**:

The tunnel target must be reachable by the Render app. The simplest robust
setup without extra infra:

1. Create a small **TunnelBox** (or use the same VPS) that runs `cloudflared`
   and exposes **only** the Ollama port through Cloudflare Tunnel (private,
   authenticated) — OR
2. Use a **Tailscale** network (free) that both the VPS and Render connect to.

For a single-machine setup with zero external dependency, the pragmatic choice
is a **Cloudflare Tunnel** bound to `localhost:11434`:

```bash
# On the VPS
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb

cloudflared tunnel login
cloudflared tunnel create ollama
cloudflared tunnel route dns ollama ollama-YOURHOST.workers.dev
```

> URL rule — keep it **unlisted**: a random subdomain nobody can guess,
> e.g. `ollama-a7x2m9kq3.workers.dev`. The Render app is the only client.
> Do NOT bind this tunnel to a normal public domain.

Create `/etc/cloudflared/ollama.yml`:

```yaml
tunnel: ollama
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: ollama-YOURHOST.workers.dev
    service: http://localhost:11434
  - service: http_status:404
```

Run it:

```bash
cloudflared tunnel run ollama
# or as a service:  cloudflared service install
```

### Option B — Tailscale (private mesh, no public URL at all)

Install Tailscale on both the VPS and the Render server, then the app reaches
Ollama at the VPS's Tailscale IP:

```bash
# VPS
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# note the 100.x.y.z address
```

Render side: add a sidecar / run `tailscaled` in the app container, then set
`OLLAMA_BASE_URL="http://100.x.y.z:11434/v1"`.

---

## 5. Point the app at it

On **Render**, set these environment variables (Service → Environment):

```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://ollama-YOURHOST.workers.dev/v1   # Option A
# OLLAMA_BASE_URL=http://100.x.y.z:11434/v1             # Option B
OLLAMA_MODEL=qwen3:4b
OLLAMA_API_KEY=ollama
```

Back on the app side, `/api/ai/mode` will report `provider: "ollama"` and the
advisor, Zahara, and research will all answer from your VPS. If the VPS is
unreachable, the server automatically falls back to Gemini.

### Verify from your laptop (tunnel working)

```bash
curl http://ollama-YOURHOST.workers.dev/v1/models
```

If that returns JSON with `qwen3:4b`, the channel is live.

---

## 6. Security checklist

- [ ] `ufw` on the VPS: allow SSH, deny everything else (11434 stays localhost).
  ```bash
  apt install -y ufw
  ufw allow OpenSSH
  ufw enable
  ```
- [ ] Ollama bound to `127.0.0.1:11434` only — never `0.0.0.0`.
- [ ] Cloudflare Tunnel URL is random/unlisted, no DNS in public nameservers.
- [ ] Fail2ban for SSH brute force: `apt install -y fail2ban`.
- [ ] Keep the box patched: `apt update && apt upgrade -y` monthly.
- [ ] Disable root password login once your `amani` user + key works:
  `/etc/ssh/sshd_config` → `PermitRootLogin prohibit-password`.

## 7. Updating the model

```bash
ssh amani@YOUR_VPS_IP
ollama pull qwen3:4b   # re-pulls the latest tag
```

Upgrading to a bigger model later (e.g. `qwen3:8b`) = edit `OLLAMA_MODEL` on
Render + `ollama pull qwen3:8b` here. Nothing else changes.

---

## Quick reference

| Item | Value |
| --- | --- |
| Model | `qwen3:4b` (change via `OLLAMA_MODEL`) |
| Ollama endpoint (local) | `http://localhost:11434/v1` |
| Ollama endpoint (from Render) | your Cloudflare URL or Tailscale IP + `/v1` |
| OpenAI-compatible? | Yes — `/v1/chat/completions` |
| Auth key | ignored by Ollama; keep `OLLAMA_API_KEY=ollama` |
| App env vars | `OLLAMA_ENABLED=true`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL` |
| AI provider priority | Hugging Face → Ollama → Gemini → local |

> **Note:** Ollama is now the *fallback*. The app's primary AI is Hugging Face
> (`HUGGINGFACE_API_KEY`) — Ollama steps in only when HF is unreachable or not
> configured. See `deploy/RENDER.md` for the env vars.
