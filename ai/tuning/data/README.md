# Fine-tuning Data

This folder is the destination for curated conversation / evaluation data used to
fine-tune the AI's model. It is optional — most tuning happens in the prompts and
knowledge base — but it becomes valuable as you collect real usage.

---

## How to structure data

Each row represents one training example for supervised fine-tuning (SFT).

```json
{
  "instruction": "My shop sells phones in Nairobi. How do I price them for Tanzania?",
  "input": {
    "currency": "TZS",
    "inventoryCount": 40,
    "businessHealth": 68
  },
  "output": "Convert your KES price to TZS at today's rate, then add 12–15% for cross-border delivery and duty..."
}
```

- `instruction` — what the user asked (or the exact user turn).
- `input` — the business context the advisor saw (optional).
- `output` — the ideal advisor answer.

## Quality rules

- 500+ examples to see real gains; quality beats quantity.
- Prefer realistic East African cases (M-Pesa, cross-border, informal→formal).
- Keep the advisor's voice consistent — bold summary, steps, follow-up.
- Never train on personal data of real users.

## Suggested datasets

| File | Purpose |
|---|---|
| `advisor-conversations.jsonl` | Best copilot/advisor exchanges (curated) |
| `objections.jsonl` | Amani objection-handling pairs |
| `discovery-answers.jsonl` | Question → score mappings |
