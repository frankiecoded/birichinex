# BirichiNex AI — Knowledge Datasets

The curated, machine-readable knowledge library that feeds the BirichiNex AI.
Each dataset is an array of entries sharing one schema, organised by domain.

```
ai/datasets/
├── features.json        36 entries — every platform feature, hub, and flow
├── monetization.json    13 entries — the ways a seller makes money
├── finance.json         12 entries — cash flow, costing, margins, tax, FX
├── marketing.json       12 entries — growth, positioning, retention, social
├── operations.json      13 entries — inventory, fulfillment, logistics, sourcing
├── legal.json           11 entries — registration, licenses, customs, contracts
├── market.json          12 entries — East Africa market intelligence
├── books/
│   ├── zero-to-one.json     26 entries — Zero to One (Thiel)
│   ├── start-with-why.json  24 entries — Start With Why (Sinek)
│   ├── lean-startup.json    28 entries — The Lean Startup (Ries)
│   ├── blue-ocean-strategy.json  27 entries — Blue Ocean Strategy (Kim & Mauborgne)
│   ├── effective-executive.json  24 entries — The Effective Executive (Drucker)
│   ├── built-to-last.json   24 entries — Built to Last (Collins & Porras)
│   └── enduring-success.json     21 entries — Enduring Success (Stadler)
└── README.md                ← this file
```

**Total: 283 curated entries.** Each book file carries the `ds-bk-<book>-*` prefix:
`zto` (Zero to One), `sww` (Start With Why), `lean` (Lean Startup), `bos`
(Blue Ocean), `ee` (Effective Executive), `btl` (Built to Last), `es`
(Enduring Success).

---

## Entry schema

Every entry has the same shape:

```json
{
  "id": "ds-fin-cash-flow",
  "topic": "Finance — Cash flow & working capital",
  "subtopic": "Know the money coming in and going out",
  "keywords": ["finance", "cash flow", "working capital", "income"],
  "content": "Human, actionable explanation… with a final 'Integrate:' how-to line.",
  "tips": ["Practical rule of thumb…"],
  "examples": ["One realistic East African scenario with a result…"],
  "relatedTopics": ["ds-f-money-finance", "ds-fin-margins", "ds-m-retail-margin"],
  "category": "finance"
}
```

| Field | Rules |
|---|---|
| `id` | Unique, prefix by dataset — `ds-f-` (features), `ds-m-` (money), `ds-fin-`, `ds-mkt-`, `ds-ops-`, `ds-leg-`, `ds-mi-`, `ds-bk-` (books) |
| `topic` / `subtopic` | Short human labels; `topic` starts with the domain, `subtopic` is the angle |
| `keywords` | Non-empty array of search terms (plural forms, local terms like `mpesa`, `mitumba`, `till`) |
| `content` | Self-contained advice, then a final `Integrate:` sentence naming the exact platform features to use |
| `tips` | 4 practical, opinionated rules — not generic filler |
| `examples` | 1 realistic East African scenario with a concrete result |
| `relatedTopics` | IDs that must exist elsewhere in the datasets (feature or knowledge IDs) |
| `category` | One of `platform`, `business`, `finance`, `marketing`, `operations`, `legal`, `market-intelligence`, `advisory` (books) |

---

## Consistency rules

- **IDs are checked.** `relatedTopics` must point at real IDs — run the validator
  (below) before committing new entries.
- **Feature IDs are canonical.** The money feature is `ds-f-payments`
  (not `ds-f-money-payments`); shopping is `ds-f-shopping-home`, etc. Copy IDs
  from `features.json`.
- **Voice.** Direct, practical, East African: TZS/KES/UGX, M-Pesa, bales, borders.
  Advice is concrete, never corporate filler.
- **Legal dataset** stays advisory ("get professional advice"), never absolute.

---

## Validating

```bash
node -e '
const fs = require("fs");
const dir = "./ai/datasets";
const files = [];
for (const d of [dir, dir + "/books"]) for (const f of fs.readdirSync(d).filter(f => f.endsWith(".json"))) files.push(d + "/" + f);
const known = new Set();
for (const f of files) for (const e of JSON.parse(fs.readFileSync(f, "utf8"))) known.add(e.id);
const missing = new Map();
for (const f of files) for (const e of JSON.parse(fs.readFileSync(f, "utf8")))
  for (const r of e.relatedTopics) if (!known.has(r)) missing.set(r, (missing.get(r) || 0) + 1);
console.log(missing.size ? [...missing.entries()] : "ALL RELATED TOPICS VALID");
'
```

Expect: `ALL RELATED TOPICS VALID`.
