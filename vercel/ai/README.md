# BirichiNex AI Center

The single home for everything that makes BirichiNex intelligent. All AI code,
features, prompts, knowledge and tuning tooling live here — the app imports from
this folder, so **every AI tweak happens in one place**.

> This is the AI "brain room". If you are tuning the AI, you work here.

---

## Folder Layout

```
ai/
├── README.md          ← You are here. The center's overview.
├── FEATURES.md        ← Registry of every AI feature & capability.
├── src/               ← All AI engine source code (what the app imports).
│   ├── navigation.ts       View map + hub routing used by the copilot.
│   ├── knowledge.ts        Copilot brain — page knowledge + intent router.
│   ├── knowledge-base.ts   Searchable knowledge corpus (1,382 lines of facts/tips).
│   ├── intent-engine.ts    AI Advisor engine — response generation.
│   ├── prompt-builder.ts   System prompt builder for the AI Advisor.
│   ├── api-client.ts       Provider client (OpenAI / Anthropic / local fallback).
│   ├── discovery.ts        Discovery Conversation → Business Audit engine.
│   └── sales-agent.ts      Amani — AI sales agent call simulation engine.
├── tuning/            ← Fine-tuning workspace (prompts, guides, data).
└── lab/               ← Playground to test AI responses from the terminal.
```

---

## The AI Engines

| Module | Role | Exports you'll use |
|---|---|---|
| `navigation.ts` | Map every app view to its hub, tab, label and title | `NAV_ITEMS`, `getHubForView`, `getHubTitle` |
| `knowledge.ts` | Copilot — answers any question about the app, routes intent, shows chips | `respondToQuery`, `PAGE_KNOWLEDGE`, `viewChips` |
| `knowledge-base.ts` | The AI's searchable brain of business + platform facts | `searchKnowledge`, `KNOWLEDGE_BASE` |
| `intent-engine.ts` | AI Advisor — understands intent & generates structured replies | `generateResponse` |
| `prompt-builder.ts` | Builds the AI Advisor system prompt (identity, laws, guidelines) | `buildSystemPrompt` |
| `api-client.ts` | Sends prompts to OpenAI / Anthropic, falls back to the local engine | `chatWithAI`, `configureAI` |
| `discovery.ts` | Discovery Conversation → 5-dimension Business Audit + health score | `computeAudit`, `DISCOVERY_QUESTIONS` |
| `sales-agent.ts` | Amani — scripted sales calls, order follow-ups, owner alerts | `simulateAgentCall`, `buildCallEmail` |

---

## All AI Features (summary)

See **[FEATURES.md](./FEATURES.md)** for the full registry.

- **Copilot** — floating assistant that knows every page, answers questions, and routes you anywhere.
- **AI Advisor** — principal-level East African business consultant using your live data + the Five BirichiNex Laws and Framework Library.
- **Discovery Conversation** — 30+ questions that score you on 5 dimensions and produce a Business Health score + action plan.
- **Amani (AI Sales Agent)** — simulated sales calls, follow-ups on abandoned orders, and owner email/notification alerts.
- **Live Tracking intelligence** — the copilot reads your orders & shipments and answers "where is PM-TRK-…?".
- **Provider abstraction** — one config switch between OpenAI, Anthropic, and the local engine.

---

## How the app consumes the AI Center

The app imports directly from `ai/src/` (e.g. `../../ai/src/knowledge`). There is
no duplicate copy — edit here, rebuild, done.

---

## How to tweak the AI

| I want to… | Edit this |
|---|---|
| Change the copilot's answers / intent rules | `ai/src/knowledge.ts` → `respondToQuery` |
| Add/change platform knowledge, tips, facts | `ai/src/knowledge-base.ts` → `KNOWLEDGE_BASE` |
| Change the AI Advisor's personality & rules | `ai/src/prompt-builder.ts` → `buildSystemPrompt` |
| Add advisor intents / response styles | `ai/src/intent-engine.ts` → `generateResponse` |
| Edit the Discovery questions & scoring | `ai/src/discovery.ts` → `DISCOVERY_QUESTIONS`, `computeAudit` |
| Change Amani's call scripts & follow-ups | `ai/src/sales-agent.ts` |
| Swap the AI provider or model | `ai/src/api-client.ts` → `configureAI` |
| Fine-tune on real training data | `ai/tuning/` (see playbook below) |

## Try it in the terminal

```bash
npm run ai:lab        # interact with the copilot & advisor locally
```

---

## See also

- [`FEATURES.md`](./FEATURES.md) — full feature registry
- [`tuning/README.md`](./tuning/README.md) — fine-tuning playbook
- [`lab/playground.ts`](./lab/playground.ts) — terminal playground
