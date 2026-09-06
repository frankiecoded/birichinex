# Payments — Simulation → Live (Paystack)

Portmetals Africa takes money through BirichiNex in two places right now: paid
subscriptions (Membership Gold/Platinum and Dropshipping Growth/Pro/Enterprise)
and shop order checkout. One gateway module (`payments/provider.ts`) sits behind
every `/api/payments/*` endpoint, so a future fund-tracking and payout dashboard
can plug into the same ledger.

## The two modes

**Simulation (default — no setup).** Until `PAYSTACK_SECRET_KEY` is set, every
payment flow runs locally in the browser with a clearly-labelled "Simulation"
badge:

- Membership checkout → **Simulate approve** / **Simulate decline** buttons
- Dropshipping plan upgrades → same approve/decline path
- Shop checkout (card/M-Pesa) → finalizes the order locally
- Status polling and subscription/plan activation

This means you can develop and demo the entire money flow with zero keys.

**Live.** The moment `PAYSTACK_SECRET_KEY` is present on the server, the provider
switches to Paystack automatically. Simulation buttons disappear and purchases
redirect to **Paystack's hosted checkout** (card, bank transfer, M-Pesa). A plan
or membership only activates after Paystack reports a successful charge — never
before, and never for free.

## Going live

1. Log in at https://dashboard.paystack.com and copy your **Secret** and
   **Public** keys (Settings → API Keys & Webhooks).

2. Set server env vars (Render → your service → Environment, or the VPS `.env`):

   | Variable | Value |
   | --- | --- |
   | `PAYSTACK_SECRET_KEY` | your secret key (keep it secret) |
   | `PAYSTACK_PUBLIC_KEY` | your public key |
   | `PAYSTACK_CURRENCY` | settlement currency, default `KES` (any FX-table currency) |

3. Set the webhook URL in Paystack: Settings → API Keys & Webhooks → **Webhook
   URL** → `https://<your-app>.com/api/payments/webhook`. Every message is
   HMAC-SHA512 signed with your secret key; the server verifies it over the raw
   body and fails closed (401) when the signature is wrong. Successful charges
   are appended to a server-side payment ledger (`payments/ledger.jsonl`) — the
   foundation for the fund-tracking dashboard.

4. Redeploy. The Payments page badge flips from "Simulation" to "Paystack · Live".

## How the pieces fit

- `POST /api/payments/checkout` — creates a subscription checkout for
  `kind: "membership"` (USD-priced tiers, monthly or yearly) or
  `kind: "dropship"` (TZS-priced tiers, monthly). Prices are validated
  server-side from the tier tables and converted to `PAYSTACK_CURRENCY`.
- `POST /api/payments/order` — shop checkout; the client's chosen currency is
  converted to the Paystack charge currency.
- `GET /api/payments/status?reference=…` — polls the provider until the payment
  settles; the client activates the subscription / plan (or finalizes the order)
  only when `paid`.
- `POST /api/payments/webhook` — server-only; verifies the `x-paystack-signature`
  and records the charge in the ledger. Never callable from the browser.
- `GET /api/payments/ledger` — admin-only (owner device secret): the last 200
  ledger entries, newest first, for the upcoming fund-tracking dashboard.
- `POST /api/payments/withdraw` — wallet payouts are **simulation-only for now**.
  In live mode Paystack rejects the request with a clear message until the
  fund-tracking update ships (money deliberately stays in your Paystack balance).

## Testing locally (simulation)

```bash
npm run dev
# open the app → Membership (try Gold monthly) → Pay → Simulate approve
# → Dropshipping Hub → Upgrade Plan → Subscribe & Pay → Approve → plan activates
# → Shop → checkout with Card → order finalizes
```

## Revenue model

- Membership revenue is credited to the business wallet in TZS (converted from
  the USD price) once payment is confirmed.
- Dropshipping **deliver** orders credit their total (TZS) as sale revenue.
- Shop orders accrue cashback to customer wallets.
- Every confirmed Paystack charge is written to `payments/ledger.jsonl` with the
  reference, amount, currency, channel, purpose, tier and email — so "how much
  went where, for what" is always auditable, even before the tracking UI lands.