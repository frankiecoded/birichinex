# BirichiNex AI — Feature Registry

Every AI capability in the platform, where it lives, and what it does.

---

## 1. Copilot (Floating Assistant)

**Source:** `ai/src/knowledge.ts`

The always-available assistant orb. It knows every page, explains it, suggests
next actions, routes the user anywhere in the app — and now **talks** like a
Siri/Bixby-style proactive assistant.

- **Page knowledge** — `PAGE_KNOWLEDGE`: tailored explainer + tips + actions for every hub/view.
- **Intent router** — `respondToQuery`: detects health, next-move, selling, customers, money, inventory, orders, logistics, growth, thanks, and navigation intents.
- **Live tracking intelligence** — recognizes tracking numbers (`PM-XXX-YYYY-NNN`) and reports live status, route, carrier, and ETA using the store's orders + shipments.
- **Chips** — `viewChips`: contextual suggestion chips per screen.
- **Voice input (speech-to-text)** — Web Speech API mic button in the chat input; transcript is auto-sent to the intent router. Speech is interpreted — you can talk naturally, e.g. "open finance".
- **Voice replies (text-to-speech)** — `speechSynthesis` reads every AI answer aloud in a **natural female voice** (`pickFemaleVoice`: Samantha/Aria/Jenny & friends, with graceful fallback), at a calm pace (rate 0.96). Per-message "Listen" replay; global voice toggle persisted in `localStorage` (`bnx.voice`).
- **Human speech, no jargon** — `toSpokenText` converts written replies to everyday spoken language before reading: strips bullets/options/symbols, turns tracking codes into "your tracking code", drops raw URLs and long numbers.
- **Talks only when summoned** — the copilot speaks the greeting when you open it and every reply while voice is on. It never speaks or pops open on its own.
- **Voice navigation** — spoken commands like *"open the marketplace"* are resolved by a dedicated navigation intent and auto-navigate to the destination view.
- **External prompts** — the store's `copilotPrompt` lets any button (Dashboard briefing "Boost sales", "Social plan", "Ask your copilot") open the copilot and fire a real question.
- **Attention badge** — the orb shows a red count of open attention items (low/out-of-stock, negative cash flow, missed calls, pending payables) instead of the idle dot — a quiet visual cue, never spoken unprompted.

**Tweak points:** reply text, intent regexes, chips, tracking replies.

---

## 2. AI Advisor (Business Consultant)

**Source:** `ai/src/prompt-builder.ts`, `ai/src/intent-engine.ts`, `ai/src/api-client.ts`

A principal-level advisor for East African commerce. Combines the user's live
business data, the Five BirichiNex Laws, and the Framework Library into
structured, actionable answers.

- **System prompt** — identity, 8 capability areas, response guidelines, data + framework + history injection (`buildSystemPrompt`).
- **Intent engine** — local deterministic response generation with confidence + follow-up suggestions (`generateResponse`).
- **Provider abstraction** — `chatWithAI` (default provider `ollama`) calls the server's AI brain (`POST /api/chat`), which prefers self-hosted Qwen3 on the VPS (`OLLAMA_ENABLED` + Ollama's OpenAI-compatible endpoint) and falls back to Gemini (`GEMINI_API_KEY`) + the full Portmetals pricing/identity system prompt server-side — no key in the browser. Falls back to browser OpenAI/Anthropic (optional) or the local engine. `GET /api/ai/mode` reports the live provider to the UI (`checkServerAIMode`).
- **Gemini TTS** — the copilot speaks through `POST /api/ai/voice` (free Google AI Studio Gemini TTS — Gemini's own neural voices, default female voice `Kore`) when `GEMINI_API_KEY` is set; the client falls back to the browser's speech synthesizer otherwise.

**Tweak points:** advisor identity/rules, intent branches, model/provider config.

---

## 3. Discovery Conversation → Business Audit

**Source:** `ai/src/discovery.ts`

An interactive interview that scores the founder across 5 dimensions.

- **Dimensions:** Founder Readiness, Business Maturity, Growth Readiness, Digital Readiness, Marketplace Readiness.
- **Output:** `computeAudit` → `BusinessAudit` with weighted Business Health score, strengths, gaps, and a prioritised action plan.
- **Tone helper:** `scoreTone(score)` maps scores to encouraging copy.

**Tweak points:** `DISCOVERY_QUESTIONS` (wording/options), dimension weights in `computeAudit`, action recommendations.

---

## 4. Amani — AI Sales Agent

**Sources:** `ai/src/sales-agent.ts` (simulation) + `ai/src/twilio-client.ts` (live calling) + `server.ts` (Twilio webhooks)

A scripted sales agent that lives in the CRM — with **real outbound calling** through the Twilio Voice API and a graceful simulation fallback.

- **Live calling** — `placeOutboundCall`: places real calls via the Twilio Voice API; `buildOutboundTwiml` / `buildInboundTwiml` serve conversational TwiML (Say + DTMF Gather) for order follow-ups, sales pitches, repeat-order offers, and inbound menus. Requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_TWIML_BASE_URL` (see `.env.example`). Call status flows back to `/api/twilio/status`.
- **Call simulation** — `simulateAgentCall`: phone-script style dialogues with outcome branching (opening → pitch → objection handling → close). Used automatically when Twilio is not configured or an inbound call is simulated.
- **Order follow-ups** — calls customers with abandoned/awaiting-payment orders (live when configured, simulated otherwise).
- **Alerts** — `buildCallNotification`, `buildCallEmail`, `buildFollowUpReminderEmail`: in-app notifications + owner emails.
- **Seeding** — `seedAgentCalls` generates sample call history.

**Tweak points:** opening phrases, pitch scripts, objection responses, email copy, TwiML script text (`twilio-client.ts`).

---

## 5. Zahara — AI Finance Agent

**Sources:** `ai/src/finance-agent.ts` (engine) + `server.ts` (`/api/finance/advise`, `/api/finance/research`) + `src/pages/FinanceAgentPage.tsx` (UI) + store `executeAgentAction` (approval-gated executor)

A CFO-grade agent that reads the live business snapshot, proposes strategies, and can **actually run business actions in the app** — subject to a hard human-in-the-loop guardrail.

- **Snapshot** — `buildFinanceSnapshot`: wallet balance, income, expenses, net flow, pending payables, low/out-of-stock items, inventory value, active order value, loyalty, subscription, runway.
- **Strategies** — `generateFinanceStrategies`: deterministic plans (cash flow, savings 10% rule, restocking, pricing, growth) with rationale, impact and confidence.
- **Actions with approval gate** — `proposeFinanceActions` + store `executeAgentAction`: the agent **never moves money on its own**. Every withdrawal, purchase, dropship order, transfer, settlement, restock or price change runs only after the owner presses **Approve**. Denying changes nothing; every decision lands in an audit trail (`agentApprovals`).
- **Full app access (confirmed)** — approved actions really update the ledger (`addTransaction`), settle payables (`updateTransaction`), restock inventory (`updateInventoryItem`), and record purchases/dropship orders.
- **Server advice** — `POST /api/finance/advise`: live provider (self-hosted Qwen3 via Ollama, else Gemini) with the Zahara system prompt + guardrails; falls back to `localFinanceReply` when no live provider is configured.
- **Live research** — `POST /api/finance/research`: web grounding via Gemini Google Search when available, else on-device Qwen3 via Ollama; `localFinanceResearch` dataset fallback otherwise.
- **Per-user dataset** — `UserBusinessDataset` persisted in the store, refreshed automatically at most every **24 hours** (`isDatasetStale`) and instantly on manual sync; learns average order value, stock alerts and health notes.

**Tweak points:** strategies in `generateFinanceStrategies`, action wiring in `executeAgentAction`, guardrails in `AGENT_GUARDRAILS`, research fallbacks in `localFinanceResearch`.

---

## 6. Knowledge Base (the AI's brain)

**Source:** `ai/src/knowledge-base.ts`

A large searchable corpus of facts, tips and examples.

- **Categories:** platform, business, advisory, operations, finance, marketing, technology, legal, market-intelligence.
- **Search:** `searchKnowledge(query, limit)` keyword-rank search.
- **Related entries:** `getRelatedEntries(id)`, `getEntriesByCategory(category)`.

**Tweak points:** add/edit `KNOWLEDGE_BASE` entries — every entry has topic, keywords, content, tips, examples, related topics.

---

## 7. BNX Intelligence Core

**Source:** `ai/src/bnxi.ts`

The single business-intelligence brain behind the whole platform. It reads a
live snapshot of the founder's business and answers the three questions that
matter: *what changed / needs attention*, *what to do next*, and *what are the
personalized pros & cons of each move*. Principle: Understand → Recommend →
Execute → Measure → Learn → Verify → Connect.

- **Daily briefing** — `buildBNXBriefing`: what changed, top attention items (severity-ordered: cash flow, stock-outs, missed calls, payables, low stock, active orders, savings opportunity) and the single move that matters most.
- **Marketplace pulse** — `marketplacePulse`: what's moving fast (orders + revenue + share per product from sales and dropship), slow sellers, and concrete boost tips.
- **Personalized strategy** — `strategyProsCons`: data-driven pros/cons + verdict (restock now, 10% savings rule, price review, marketplace push) using the founder's real numbers.
- **Social media manager** — `socialMediaPlan`: a 7-day content plan (channel, caption, hashtags, goal, CTA) generated from the founder's actual fast movers, plus posting-time tips.
- **Spoken briefing** — `speakableBriefing`: a short natural-language announcement the copilot speaks aloud.
- **Surfaced** in the copilot chat ("what should I focus on today?", "what's moving fast?", "pros and cons", "social media plan") and as the **BNX Briefing card** on the Dashboard.

**Tweak points:** attention rules in `buildAttention`, pulse aggregation, strategy options in `strategyProsCons`, social copy in `socialMediaPlan`.

---

## 8. Navigation Intelligence

**Source:** `ai/src/navigation.ts`

The map the copilot uses to understand the product: 9 hubs across Daily /
Operations / Growth groups, hub tabs, titles, and view→hub resolution.

**Tweak points:** hub labels, tabs, descriptions, view aliases.

---

## Feature → Where to change

| Feature | File | Key symbol |
|---|---|---|
| Copilot answers | `knowledge.ts` | `respondToQuery` |
| Copilot page knowledge | `knowledge.ts` | `PAGE_KNOWLEDGE` |
| Advisor identity/rules | `prompt-builder.ts` | `buildSystemPrompt` |
| Advisor intents | `intent-engine.ts` | `generateResponse` |
| Provider / model | `api-client.ts` | `configureAI` |
| Knowledge corpus | `knowledge-base.ts` | `KNOWLEDGE_BASE` |
| Discovery questions | `discovery.ts` | `DISCOVERY_QUESTIONS` |
| Audit scoring | `discovery.ts` | `computeAudit` |
| Amani scripts | `sales-agent.ts` | `simulateAgentCall` |
| Amani live calls | `twilio-client.ts` + `server.ts` | `placeOutboundCall` / `/api/agent-call` |
| Zahara engine | `finance-agent.ts` | `generateFinanceStrategies` / `proposeFinanceActions` |
| Zahara executor | `store/useStore.ts` | `executeAgentAction` |
| Zahara advice | `server.ts` | `/api/finance/advise` |
| Zahara research | `server.ts` | `/api/finance/research` |
| User dataset sync | `finance-agent.ts` | `buildUserDataset` / `isDatasetStale` |
| BNX briefing | `bnxi.ts` | `buildBNXBriefing` |
| Marketplace pulse | `bnxi.ts` | `marketplacePulse` |
| Strategy pros/cons | `bnxi.ts` | `strategyProsCons` |
| Social media plan | `bnxi.ts` | `socialMediaPlan` |
| Voice input/output | `AICopilot.tsx` | Web Speech API (mic / TTS) + `pickFemaleVoice` |
| Voice navigation | `knowledge.ts` | navigation intent ("open X") |
| External copilot prompts | `useStore.ts` | `copilotPrompt` / `setCopilotPrompt` |
| Dashboard briefing | `DashboardPage.tsx` | BNX Briefing card |
| Hub map | `navigation.ts` | `NAV_ITEMS` |
