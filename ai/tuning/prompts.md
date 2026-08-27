# Prompt Templates

Every prompt the BirichiNex AI uses, where it is defined, and what it controls.
Edit the source in `ai/src/` — there are no duplicates anywhere else.

---

## 1. AI Advisor — System Prompt

**File:** `ai/src/prompt-builder.ts` → `buildSystemPrompt(context)`

Controls the advisor's entire personality. Assembled at runtime from:

- **Core identity** — principal-level East African business consultant; Kenya, Tanzania, Uganda, Rwanda focus; mobile money + cross-border expertise.
- **Capabilities** — 8 areas: strategy, finance, supply chain, marketing, operations, technology, compliance, market intelligence.
- **Response guidelines** — 10 numbered rules (be specific, reference platform features, use TZS/KES/UGX/RWF, etc.).
- **Response format** — bold summary → detailed explanation → numbered steps → tips → follow-ups.
- **Injected context** — `## User Business Context` (live store data), `## BirichiNex Framework Library` (Five Laws + frameworks), `## Recent Conversation` (last 6 turns).

**Tuning levers:** the identity paragraph, the 10 guidelines, the framework section, and how much business data is injected.

---

## 2. Copilot — Intent Rules

**File:** `ai/src/knowledge.ts` → `respondToQuery(rawInput, ctx)`

Not a single prompt but a decision tree. It matches the user's text against
intent regexes (health, next move, sell, customers, money, inventory, orders,
tracking numbers, growth, thanks, navigation) and returns `{ text, actions }`.

**Tuning levers:** the reply text, the regexes, the `actions` chips.

---

## 3. Discovery Conversation — Question Set

**File:** `ai/src/discovery.ts` → `DISCOVERY_QUESTIONS`

An interview of scenario-based questions across the 5 audit dimensions. Each
question has an id, text, options, and a mapping to scores.

**Tuning levers:** question wording, options, which dimension each question feeds.

---

## 4. Amani — Sales Scripts

**File:** `ai/src/sales-agent.ts` → `simulateAgentCall`, opening-phrase pools

Scripted dialogues: opening lines, pitch, objection handling, and close, with
outcome branching. Also the notification + email copy builders.

**Tuning levers:** phrase pools, script order, email wording.

---

## 5. Knowledge Entries

**File:** `ai/src/knowledge-base.ts` → `KNOWLEDGE_BASE`

Each entry: `topic`, `subtopic`, `keywords`, `content`, `tips`, `examples`,
`relatedTopics`, `category`. The AI surfaces these when intents match keywords.

**Tuning levers:** add entries, sharpen keywords, enrich content/tips/examples.

---

## 6. Provider / Model Settings

**File:** `ai/src/api-client.ts` → `DEFAULT_CONFIG`, `configureAI(config)`

- `provider`: `'openai' | 'anthropic' | 'local'`
- `model`, `maxTokens`, `temperature`, `baseUrl`, `apiKey`
- Falls back to the **local engine** whenever the API is unset or fails.

**Tuning levers:** model choice, temperature (lower = more consistent), fallback behaviour.
