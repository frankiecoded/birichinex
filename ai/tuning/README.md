# AI Tuning Workspace

This is where the AI gets shaped. Everything you need to fine-tune BirichiNex's
AI lives here — prompt templates, guides, and training data structure.

```
ai/tuning/
├── README.md          ← this file
├── prompts.md         ← every prompt template the AI uses (edit source in ai/src/)
└── data/              ← (optional) training / evaluation data
    └── README.md      ← how to structure fine-tuning data
```

---

## Tuning layers (from quickest to deepest)

| Layer | What changes | Where |
|---|---|---|
| 1. Copy & wording | Reply text, chips, question wording | `ai/src/knowledge.ts`, `discovery.ts`, `sales-agent.ts` |
| 2. Knowledge | Facts, tips, examples the AI can cite | `ai/src/knowledge-base.ts` (`KNOWLEDGE_BASE`) |
| 3. Personality & rules | Advisor identity, laws, response guidelines | `ai/src/prompt-builder.ts` (`buildSystemPrompt`) |
| 4. Intents & logic | How queries are understood & routed | `ai/src/intent-engine.ts`, `knowledge.ts` (`respondToQuery`) |
| 5. Model/provider | OpenAI / Anthropic / local, temperature, max tokens | `ai/src/api-client.ts` (`configureAI`) |
| 6. Fine-tuning | Train a model on curated conversation data | see `data/` below |

---

## Recommended tuning workflow

1. **Baseline** — run the lab (`npm run ai:lab`) and note weak answers.
2. **Fix the source of truth** — if the answer is wrong, the fix is usually in the
   knowledge base or the prompt rules, not the model.
3. **Regenerate** — rebuild (`npm run build`) and re-test in the lab.
4. **Regression** — keep a list of test questions and confirm old answers still hold.

> Golden rule: **prefer a better prompt / richer knowledge base over a bigger
> model.** It is cheaper, faster, and fully under your control.

---

## Every prompt template

See [`prompts.md`](./prompts.md) for the exact templates, their location, and
what each one controls.
