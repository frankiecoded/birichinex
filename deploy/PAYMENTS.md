# Payments — Simulation → Live (Flutterwave)

Portmetals Africa takes money in two places: paid subscriptions (Gold /
Platinum / Enterprise) and business-wallet payouts to the owner's bank. Both go
through one gateway module (`payments/provider.ts`).

## The two modes

**Simulation (default — no setup).** Until `FLUTTERWAVE_SECRET_KEY` is set, every
payment flow runs locally in the browser with a clearly-labelled "Simulation"
badge:

- Membership checkout → **Simulate approve** / **Simulate decline** buttons
- Status polling, subscription activation, business-wallet revenue credits
- Bank withdrawal → request created as `pending`, server resolves it

This means you can develop and demo the entire money flow with zero keys.

**Live.** The moment `FLUTTERWAVE_SECRET_KEY` is present on the server, the
provider switches to Flutterwave automatically. Simulation buttons disappear
and the payment page is Flutterwave's hosted checkout.

## Going live

1. Create a [Flutterwave](https://dashboard.flutterwave.com) account and get
   your **Secret Key** (Dashboard → Settings → API). The Public Key stays in
   Flutterwave — the app only ever uses your server's secret key.

2. Set server env vars (Render → your service → Environment):

   | Variable | Value |
   | --- | --- |
   | `FLUTTERWAVE_SECRET_KEY` | your secret key (keep it secret) |
   | `FLUTTERWAVE_SECRET_HASH` | `openssl rand -hex 16` output |

3. Set the webhook hash to match in Flutterwave:
   Dashboard → Settings → **Webhooks** → set the same string as
   `FLUTTERWAVE_SECRET_HASH` as the **Webhook Hash**, and set the webhook URL
   to `https://<your-app>.onrender.com/api/payments/webhook`.

4. Redeploy. The Payments page badge flips from "Simulation" to "Live".

## How the pieces fit

- `POST /api/payments/checkout` — creates the order with Flutterwave and
  returns the payment link to redirect to (card + M-Pesa included). Subscriptions
  are priced server-side from the same tier table the UI uses; **Enterprise** is
  excluded from self-serve checkout ("Contact sales" instead).
- `GET /api/payments/status?reference=…` — polls the provider until the payment
  settles; the client activates the subscription when paid.
- `POST /api/payments/withdraw` — owner requests a payout from the business
  wallet (min 5,000 / max 50,000,000 TZS, payout countries TZ/KE/UG/NG/GH).
  Live mode pushes a bank transfer via Flutterwave; simulation creates a pending
  record.
- `POST /api/payments/webhook` — server-only; verifies the `verif-hash` header
  against `FLUTTERWAVE_SECRET_HASH` (timing-safe) and fails closed (401) if the
  hash isn't configured. Never callable from the browser.

## Testing locally (simulation)

```bash
npm run dev
# open the app → Membership (try Gold monthly) → Pay → Simulate approve
# → Back → Payments → Business Wallet (check earnings) → Withdraw
```

The withdraw form prefills from the payout bank saved in **Settings → Billing &
Membership → Payout Bank Account**.

## Revenue model

- Membership revenue is credited to the business wallet in TZS (converted from
  the USD price).
- Dropshipping **deliver** orders credit their total (TZS) as sale revenue.
- Revenue + previous wallet spend roll into one withdrawable business wallet.
