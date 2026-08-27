<div align="center">

# BirichiNex™️ OS

**Building the Digital Infrastructure for Business**

*Powered by BirichiNex™️*

---

</div>

## Philosophy

> Technology should never dictate how businesses operate. Businesses should define technology.

BirichiNex™️ is built from real business operations — not theoretical software concepts. Every capability originates from practical commercial experience, is validated through real-world implementation, and is engineered as reusable digital infrastructure.

**Build once. Reuse everywhere. Scale without rebuilding.**

---

## Architecture

### Platform Layers

| Layer | Description |
|-------|-------------|
| **Layer 1 — Core** | The intelligent digital operating system powering every capability |
| **Layer 2 — Industry Ecosystems** | Fashion, Technology, Gemstones, Agriculture, Manufacturing, and 7 more |
| **Layer 3 — Businesses** | Each ecosystem contains businesses of every size |
| **Layer 4 — Reusable Modules** | 19 Business Capabilities designed once, reused everywhere |

### Business Capabilities (19)

| Capability | Description |
|------------|-------------|
| **Marketplace** | Buy, sell, source, B2B/B2C commerce |
| **CRM** | Customer management, leads, sales pipeline |
| **Inventory** | Stock management, warehouses, forecasting |
| **Procurement** | Supplier management, quotations, purchasing |
| **Logistics** | Shipping, fulfillment, tracking, supply chain |
| **Payments** | Gateways, invoicing, digital wallets |
| **Finance** | Accounting, reporting, budgeting |
| **Documents** | Contracts, invoices, e-signatures |
| **AI Assistant** | Business intelligence, automation, advisors |
| **Analytics** | Dashboards, KPIs, business insights |
| **Automation** | Workflows, triggers, business rules |
| **Entrepreneur Hub** | Launch businesses, dropshipping, mentorship |
| **Learning Academy** | Courses, certifications, education |
| **Recruitment** | Talent acquisition, freelancer management |
| **Community** | Networking, forums, events |
| **Identity & Access** | Authentication, permissions, security |
| **Collaboration** | Teamwork, project management |
| **Integrations** | APIs, third-party connections |
| **Media** | Podcasts, Business TV, webinars |

### Membership Tiers

| Tier | Stage | For |
|------|-------|-----|
| **Silver** | Start | Startups and entrepreneurs |
| **Gold** | Grow | Growing SMEs and established businesses |
| **Platinum** | Scale | Businesses expanding nationally/internationally |
| **Enterprise** | Custom | Corporations, NGOs, government organizations |

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS 4 with Apple 2026 Liquid Glass design system
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **3D:** Three.js (React Three Fiber)
- **AI:** Google GenAI
- **Live AI Calling:** Twilio Voice API

## Live AI Calling (Amani)

The AI Sales Agent places **real outbound calls** through the Twilio Voice API when credentials are present, and gracefully falls back to its full simulation mode otherwise. Live calls play a conversational script (order follow-ups, sales pitches, repeat-order offers) and let customers navigate with keypad input. Every call is logged, transcribed, and emailed to the owner.

To go live, add to your environment (see `.env.example`):

```
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
TWILIO_TWIML_BASE_URL   # public HTTPS URL — dev: ngrok tunnel, prod: deployed app URL
```

For inbound calls, point your Twilio number's "A call comes in" webhook at `<TWILIO_TWIML_BASE_URL>/api/twilio/inbound`. Call status flows back through `/api/twilio/status`.

## Zahara — AI Finance Agent

Zahara (Money → Zahara) is a CFO-grade agent that reads your live wallet, ledger, stock and orders, proposes strategies, and can **actually run business actions in the app** — restock inventory, settle payables, record purchases, place dropship orders, transfer to savings — but **never without your explicit approval**.

- **Human-in-the-loop guardrail:** every money move or stock/price change is proposed with an exact amount, shown in the Actions tab, and executed only when you press **Approve**. Denied actions change nothing. All decisions are logged in an audit trail.
- **Advice:** `POST /api/finance/advise` — Qwen3 (self-hosted on your VPS via Ollama) with the Zahara system prompt and guardrails; falls back to Gemini, then the local deterministic engine when no live provider is configured.
- **Live research:** `POST /api/finance/research` — current exchange rates, taxes, mobile money and market prices, web-grounded via Gemini Google Search when available; otherwise answered by the on-device Qwen3 model, with a dataset-backed fallback.
- **Per-user dataset:** your business data is saved as a dataset and re-synced automatically at most every **24 hours** (and instantly on manual sync) — see the Dataset tab.

## AI Providers

The app's production AI brain runs on **Hugging Face Inference Providers**
(OpenAI-compatible router) with Qwen3/Ollama on your VPS as an offline fallback,
then Google Gemini, then a smart local engine when no live provider is
configured. Keys stay on the server — nothing ever ships to the browser.

| Variable | Default | Purpose |
| --- | --- | --- |
| `HUGGINGFACE_API_KEY` (alias `HF_TOKEN`) | — | **Primary AI** — HF Access Token with Inference enabled (chat, quote analyst, Zahara finance) |
| `HUGGINGFACE_MODEL` | `meta-llama/Llama-3.3-70B-Instruct` | Model served by HF Inference Providers |
| `OLLAMA_ENABLED` | — | Set to `true` to use the self-hosted Qwen3 (Ollama) fallback |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Ollama's OpenAI-compatible endpoint (also enables Ollama on its own) |
| `OLLAMA_MODEL` | `qwen3:4b` | Qwen3 model tag pulled into Ollama |
| `GEMINI_API_KEY` | — | Powers the copilot voice (Gemini TTS) and the final fallback chat provider |
| `GEMINI_TTS_MODEL` | `gemini-2.5-flash-preview-tts` | Free Gemini TTS model used by `POST /api/ai/voice` |
| `GEMINI_TTS_VOICE` | `Kore` | Free female voice (Gemini's own assistant-class voice) |

The copilot speaks through `POST /api/ai/voice` using **Gemini TTS** (free Google AI Studio tier — the same neural voices Gemini uses), and automatically falls back to the browser's speech synthesizer otherwise.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Set HUGGINGFACE_API_KEY (production AI) — OLLAMA/GEMINI are optional fallbacks

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run lint
```

## Design System

Built on Apple's 2026 Liquid Glass design language:

- **Glass Materials** — Translucent, frosted surfaces with depth
- **Concentric Radii** — UI curvature aligned with hardware bezels
- **Spatial Layers** — Content, controls, overlays, modals
- **Scroll Edge Effects** — Subtle blur replacing hard dividers
- **Brand Colors** — Gold (#D4AF37) on Apple's neutral palette

## Project Structure

```
src/
├── components/
│   ├── shell/          # Navigation Shell (Apple sidebar)
│   ├── ai/             # Copilot UI, GuideTour, Command Palette
│   └── ui/             # Reusable UI components
│       ├── GlassCard.tsx
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── StatCard.tsx
├── data/
│   └── platform.ts     # Capabilities, memberships, products
├── pages/
│   ├── DashboardPage.tsx
│   ├── MarketplacePage.tsx
│   ├── CRMPage.tsx
│   ├── InventoryPage.tsx
│   ├── FinancePage.tsx
│   ├── AIAdvisorPage.tsx
│   ├── LearningPage.tsx
│   ├── EntrepreneurHubPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── SettingsPage.tsx
│   ├── MembershipPage.tsx
│   ├── OnboardingFlow.tsx
│   └── PlaceholderPage.tsx
├── types.ts            # Complete platform type system
├── App.tsx             # BirichiNex™️ OS shell
├── main.tsx            # Entry point
└── index.css           # Design system tokens

ai/                     # THE AI CENTER — all AI code, prompts & tuning
├── README.md           # Center overview
├── FEATURES.md         # Registry of every AI feature
├── src/                # AI engines (imported by the app from here)
├── tuning/             # Fine-tuning workspace & prompt templates
└── lab/                # Terminal playground (npm run ai:lab)
```

## BirichiNex™️ Principle

Every new feature must satisfy three questions:

1. Does Portmetals Africa genuinely need this capability?
2. Can businesses in other industries also benefit from it?
3. Can it become a reusable platform module?

If the answer is yes, it belongs inside BirichiNex™️.

---

<div align="center">

**Built for the Next. Connected for the Future.**

*BirichiNex™️ — Where proven business ecosystems become scalable digital infrastructure.*

</div>
