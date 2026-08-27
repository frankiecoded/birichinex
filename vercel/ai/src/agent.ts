/**
 * BNX Agent Command Engine.
 *
 * Turns natural-language instructions from the "Hey BNX" copilot into
 * structured, executable commands. The copilot runs this FIRST — if the input
 * is actionable (call a customer, log income, create a document, place an
 * order…) it gets a structured AgentCommand; otherwise it falls through to the
 * Q&A engine (respondToQuery).
 *
 * Design: deterministic grammar (fast, offline, testable) + a confirmation
 * step for anything touching money or a real phone call + clarification when a
 * required field (amount, name…) is missing. Humans confirm, the agent acts.
 */

import { BirichiNexView, Currency } from "../../src/types";
import { formatPrice } from "../../src/data/platform";

export type AgentIntentType =
  | "navigate"
  | "makeCall"
  | "addContact"
  | "logTransaction"
  | "createDocument"
  | "postToMarketplace"
  | "restock"
  | "placeDropshipOrder"
  | "sendEmail"
  | "remindMe"
  | "answer";

export interface AgentContext {
  userName: string;
  businessName: string;
  currency: Currency;
  currentView: BirichiNexView;
  knownContacts: string[];
  knownInventory: string[];
  knownProducts: string[];
}

export interface AgentFields {
  view?: BirichiNexView;
  viewLabel?: string;
  contactName?: string;
  phone?: string;
  batch?: "missed";
  kind?: "income" | "expense";
  amount?: number;
  description?: string;
  documentType?: "invoice" | "contract" | "proposal";
  title?: string;
  itemName?: string;
  quantity?: number;
  productName?: string;
  emailKind?: "follow-up" | "reminder" | "invoice" | "thank-you";
  reminderText?: string;
  reminderWhen?: string;
}

export interface AgentCommand {
  intent: AgentIntentType;
  /** Short action label — e.g. "Log income". */
  label: string;
  /** Natural sentence describing what will happen — spoken + shown to the user. */
  summary: string;
  fields: AgentFields;
  /** Required fields that are still missing (used to ask a clarifying question). */
  missing: string[];
  /** True when execution must wait for an explicit user confirmation. */
  needsConfirmation: boolean;
}

// ── Number / money parsing (operates on the RAW text, never normalized) ─────

const MONEY_TOKEN = /(\d[\d,.]*(?:\.\d+)?)(k|m|thousand|million)?\s*(tsh|tzs|kes|ksh|ugx|ngn|usd|shs?|shillings?)?/i;

export function parseMoneyAmount(text: string): { amount?: number; suffix?: string } {
  const m = text.match(MONEY_TOKEN);
  if (!m) return {};
  const raw = m[1].replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(raw)) return {};
  let value = parseFloat(raw);
  const suf = (m[2] || "").toLowerCase();
  if (suf === "k" || suf === "thousand") value *= 1000;
  if (suf === "m" || suf === "million") value *= 1e6;
  if (!isFinite(value) || value <= 0) return {};
  return { amount: Math.round(value), suffix: (m[3] || "").toLowerCase() };
}

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function wordCount(token: string): number {
  const t = token.toLowerCase();
  if (/^\d+$/.test(t)) return parseInt(t, 10) || 1;
  return WORDS[t] ?? 1;
}

function firstAmount(text: string): { amount: number; end: number } | null {
  const m = text.match(MONEY_TOKEN);
  if (!m || !m[1]) return null;
  const parsed = parseMoneyAmount(m[0]);
  if (!parsed.amount) return null;
  return { amount: parsed.amount, end: (m.index ?? 0) + m[0].length };
}

// ── Phone parsing ────────────────────────────────────────────────────────────

const PHONE_RE = /(\+?\d[\d ()-]{6,}\d)/;

function parsePhone(text: string): string | undefined {
  const m = text.match(PHONE_RE);
  return m ? m[1].trim() : undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Fuzzy match a phrase against known names. */
function matchKnown(phrase: string, known: string[]): string | undefined {
  const p = norm(phrase);
  if (!p) return undefined;
  return known.find((k) => {
    const kk = norm(k);
    return p === kk || p.includes(kk) || kk.includes(p);
  });
}

function fuzzyExtract(phrase: string, known: string[]): string | undefined {
  const hit = matchKnown(phrase, known);
  if (hit) return hit;
  const fb = phrase.trim();
  if (fb.length >= 2 && !/^[^a-z]+$/i.test(fb) && /\p{L}/u.test(fb)) return fb;
  const cap = phrase.match(/[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*)*/);
  if (cap) return cap[0].trim();
  return undefined;
}

function baseCommand(intent: AgentIntentType, label: string): AgentCommand {
  return { intent, label, summary: "", fields: {}, missing: [], needsConfirmation: false };
}

// ── Intent grammar ───────────────────────────────────────────────────────────

export function classifyAgentCommand(raw: string, ctx: AgentContext): AgentCommand {
  const text = raw.trim();
  const currency = ctx.currency || "TZS";
  const business = ctx.businessName || "your business";

  // ── navigate ──────────────────────────────────────────────────────────────
  {
    const m = text.match(/^(?:open|go to|take me to|show me|switch to|navigate to|let'?s (?:go|head) to)\s+(.+)$/i);
    if (m) {
      const target = norm(m[1]);
      const targets: { re: RegExp; view: BirichiNexView; label: string }[] = [
        { re: /(aman|sales ?agent|ai ?agent|call agent)/, view: "ai-agent", label: "Amani" },
        { re: /(zahara|finance ?agent)/, view: "finance-agent", label: "Zahara" },
        { re: /(market|store|shop|storefront)/, view: "marketplace", label: "Marketplace" },
        { re: /(payment|payout|get paid)/, view: "payments", label: "Payments" },
        { re: /(finance|money|ledger)/, view: "finance", label: "Finance" },
        { re: /(inventor|products|stock|warehouse|supplier|procurement)/, view: "inventory", label: "Inventory" },
        { re: /(customer|crm|contact|client)/, view: "crm", label: "Customers" },
        { re: /(order|logistic|shipping|track|deliver)/, view: "logistics", label: "Logistics" },
        { re: /(learn|academy|course)/, view: "learning", label: "Academy" },
        { re: /(advisor|consultant)/, view: "ai-advisor", label: "AI Advisor" },
        { re: /(community|people)/, view: "community", label: "Community" },
        { re: /(dashboard|home|overview|command)/, view: "dashboard", label: "Dashboard" },
        { re: /(sell|sales)/, view: "sell", label: "Sell" },
        { re: /(document|invoice|contract|signature)/, view: "documents", label: "Documents" },
        { re: /(analytics|report|trend|data)/, view: "analytics", label: "Analytics" },
        { re: /(dropship)/, view: "dropshipping", label: "Dropshipping" },
        { re: /(loyalty|points)/, view: "loyalty", label: "Loyalty" },
        { re: /(membership|plan|subscription)/, view: "membership", label: "Membership" },
        { re: /(profile|account)/, view: "profile", label: "Profile" },
        { re: /(settings|preferences)/, view: "settings", label: "Settings" },
        { re: /(automation)/, view: "automation", label: "Automation" },
        { re: /(framework)/, view: "frameworks", label: "Framework Library" },
        { re: /(routine|reflection|review)/, view: "routines", label: "Routines" },
      ];
      const hit = targets.find((t) => t.re.test(target));
      if (hit) {
        const cmd = baseCommand("navigate", `Open ${hit.label}`);
        cmd.fields.view = hit.view;
        cmd.fields.viewLabel = hit.label;
        cmd.summary = `Opening ${hit.label}.`;
        return cmd;
      }
    }
  }

  // ── makeCall ──────────────────────────────────────────────────────────────
  {
    if (/call\s+(?:back\s+)?my\s+(missed|unreached|waiting)\s+(calls|customers)/i.test(text)) {
      const cmd = baseCommand("makeCall", "Call missed customers");
      cmd.fields.batch = "missed";
      cmd.needsConfirmation = true;
      cmd.summary = "Calling your missed customers now — Amani will work through them.";
      return cmd;
    }
    const m =
      text.match(/(?:have|let) (?:amani|the (?:ai )?(?:sales )?agent|her|him) (?:call|ring|phone|dial)\s+(.+)/i) ||
      text.match(/(?:make|place) (?:a )?(?:phone )?(?:call|follow-?up)(?:\s+(?:call|follow-?up))?\s+(?:to|with)\s+(.+)/i) ||
      text.match(/^(?:call|ring|phone|dial)\s+(?:up\s+)?(?:(?:the\s+)?(?:customer|contact|client|lead)\s+)?(.+)$/i) ||
      text.match(/(?:follow-?up|follow up|get back|reach out)\s+(?:with|to)\s+(.+)/i);
    if (m) {
      const who = m[1].trim();
      const cmd = baseCommand("makeCall", "Call a customer");
      cmd.fields.contactName = fuzzyExtract(who, ctx.knownContacts);
      cmd.fields.phone = parsePhone(who);
      cmd.needsConfirmation = true;
      if (!cmd.fields.contactName && !cmd.fields.phone) cmd.missing.push("which customer");
      cmd.summary = cmd.fields.contactName
        ? `Calling ${cmd.fields.contactName}${cmd.fields.phone ? ` at ${cmd.fields.phone}` : ""} — Amani will make the call and record it.`
        : cmd.fields.phone
          ? `Calling ${cmd.fields.phone} — Amani will make the call and record it.`
          : "Making the call — who should Amani dial?";
      return cmd;
    }
  }

  // ── addContact ────────────────────────────────────────────────────────────
  {
    const m =
      text.match(/(?:add|save|register|create) (?:a )?(?:new )?(?:customer|contact|client|lead)\s+(.+)/i) ||
      text.match(/(?:add|save|register|create)\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z.'-]+)*)\s+(?:as\s+)?(?:a\s+)?(?:customer|contact|client|lead)/i) ||
      text.match(/(?:add|save|register)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]*)*)$/i);
    if (m) {
      const rest = m[1]
        .trim()
        .replace(/\s+(?:to|into|in)\s+(?:the\s+|my\s+|your\s+)?(?:contacts?|crm|address\s+book|list|clients?|customers?|leads?|rolodex)\b/gi, "")
        .replace(/\s+(?:to|into|in|on|as)\s+(?:(?:the|my|your)\s*)?$/i, "");
      const phone = parsePhone(rest);
      const name = fuzzyExtract(rest.replace(PHONE_RE, "").replace(/\bon\s+/i, ""), ctx.knownContacts);
      // "Add MacBook Air M2" is a stock/inventory command, not a person — let
      // the later intents (restock/marketplace) decide instead.
      if (!(name && matchKnown(name, [...ctx.knownInventory, ...ctx.knownProducts]))) {
        const cmd = baseCommand("addContact", "Add a customer");
        cmd.fields.contactName = name;
        cmd.fields.phone = phone;
        if (!name) cmd.missing.push("the customer's name");
        cmd.summary = name
          ? `Adding ${name}${phone ? ` (${phone})` : ""} to your customers.`
          : "Adding a new customer to your list.";
        return cmd;
      }
    }
  }

  // ── logTransaction ────────────────────────────────────────────────────────
  {
    const explicitVerb = /(?:log|add|record|enter|register)\b/i.test(text);
    const amt = firstAmount(text);
    const incomeSignal =
      /(got\s+paid|received|earned|made|banked|took in|sold|income|revenue|earnings|sales of|payment from)/i.test(text);
    const expenseSignal =
      /(spent|bought|paid\s+(?:for|out)|expense|expenditure|cost|settled|purchased|payment to)/i.test(text);
    const isMoneyCommand =
      (explicitVerb && (amt !== null || incomeSignal || expenseSignal)) ||
      (amt !== null && (incomeSignal || expenseSignal || /(paid|got|spent|made|received|earned|sold)\b/i.test(text)));

    if (isMoneyCommand) {
      const kind: "income" | "expense" = expenseSignal && !incomeSignal ? "expense" : "income";
      const description = amt
        ? text
            .slice(amt.end)
            .replace(/^(?:from|for|on|of|about|as|to|in|with)\s+/i, "")
            .replace(/^(?:income|expense|expenditure|payment|money|revenue|earnings)\s+(?:from|for|of|on)\s+/i, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80)
        : undefined;
      const cmd = baseCommand("logTransaction", kind === "income" ? "Log income" : "Log an expense");
      cmd.fields.kind = kind;
      cmd.fields.amount = amt?.amount;
      cmd.fields.description = description || undefined;
      cmd.needsConfirmation = true;
      if (!cmd.fields.amount) cmd.missing.push(`how much ${kind}`);
      cmd.summary = cmd.fields.amount
        ? `Log ${formatPrice(cmd.fields.amount, currency)} as ${kind}${cmd.fields.description ? ` — ${cmd.fields.description}` : ""}.`
        : `Log the ${kind}. What amount should I record?`;
      return cmd;
    }
  }

  // ── createDocument ────────────────────────────────────────────────────────
  {
    const m = text.match(
      /(?:create|make|generate|draft|prepare)\s+(?:an?\s+)?(invoice|quotation|quote|proposal|contract|agreement|receipt)(?:\s+(?:for|of|for the)\s+(.+))?/i,
    );
    if (m) {
      const type = m[1].toLowerCase();
      const documentType: AgentFields["documentType"] =
        type === "contract" || type === "agreement"
          ? "contract"
          : type === "proposal" || type === "quote" || type === "quotation"
            ? "proposal"
            : "invoice";
      const title = m[2]?.trim()
        ? `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} for ${m[2].trim()}`
        : documentType === "invoice"
          ? `Invoice for ${business}`
          : `${documentType} for ${business}`;
      const cmd = baseCommand("createDocument", `Create a ${documentType}`);
      cmd.fields.documentType = documentType;
      cmd.fields.title = title;
      cmd.summary = `Creating a ${documentType} — "${title}" — in your Documents.`;
      return cmd;
    }
  }

  // ── postToMarketplace ─────────────────────────────────────────────────────
  {
    const m =
      text.match(/(?:post|list|publish)\s+(.+?)\s+(?:to|on|onto|into)\s+(?:the\s+)?(?:marketplace|store|storefront|shop)/i) ||
      text.match(/list\s+(?:the\s+)?(.+?)\s+(?:for sale|on sale)/i);
    if (m) {
      const itemName = matchKnown(m[1].trim(), ctx.knownInventory);
      const cmd = baseCommand("postToMarketplace", "Post to Marketplace");
      cmd.fields.itemName = itemName;
      if (!itemName) cmd.missing.push("which item to post");
      cmd.summary = itemName ? `Posting ${itemName} to your Marketplace.` : "Posting that item to your Marketplace.";
      return cmd;
    }
  }

  // ── restock ───────────────────────────────────────────────────────────────
  {
    const m =
      text.match(/(?:restock|reorder|refill|top\s*up|stock\s*up)\s+(?:on\s+)?(.+)/i) ||
      text.match(/(?:order|buy)\s+more\s+(?:of\s+)?(.+)/i);
    if (m) {
      const rest = m[1].trim();
      // Only strip a LEADING quantity ("restock 5 of the X"), never digits that
      // belong to the product name itself (MacBook Air M2, iPhone 15 Pro…).
      const stripped = rest.replace(/^\d[\d,.]*(?:\.\d+)?(?:k|m|thousand|million)?\s*(?:units?|pcs?|pieces?|pairs?|each|boxes?|cartons?|items?|bales?|packs?)\s+(?:of\s+|x\s+)?/i, "");
      const itemName = matchKnown(stripped, ctx.knownInventory);
      const qty = firstAmount(rest);
      const cmd = baseCommand("restock", "Restock inventory");
      cmd.fields.itemName = itemName;
      if (qty && /(unit|piece|pcs|pair|each|box|carton|item|bale|pack)/i.test(rest)) cmd.fields.quantity = qty.amount;
      if (!itemName) cmd.missing.push("which item to restock");
      cmd.summary = itemName
        ? `Restocking ${itemName}${cmd.fields.quantity ? ` by ${cmd.fields.quantity}` : ""}.`
        : "Restocking inventory.";
      return cmd;
    }
  }

  // ── placeDropshipOrder ────────────────────────────────────────────────────
  {
    const m =
      text.match(/(?:place|make|put|submit|create)\s+(?:a\s+)?dropship(?:ping)?\s+order\s+(?:for|of)\s+(.+)/i) ||
      text.match(/(?:order|buy)\s+(.+?)\s+(?:from\s+)?(?:the\s+)?dropship(?:ping)?/i);
    if (m) {
      const rest = m[1].trim();
      // Strip a leading quantity phrase ("one X", "2 of the X") but KEEP the
      // digits that are part of the product name (iPhone 15 Pro Max…).
      const cleaned = rest
        .replace(/^(one|a|an|two|three|four|five|six|seven|eight|nine|ten)\s+/i, "")
        .replace(/^\d+(\s+x\s+|\s+of\s+|\s+)/i, "")
        .trim();
      const productName = matchKnown(cleaned, ctx.knownProducts);
      const cmd = baseCommand("placeDropshipOrder", "Place a dropship order");
      cmd.fields.productName = productName;
      const count = rest.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|\d+)/i);
      cmd.fields.quantity = count ? wordCount(count[1]) : 1;
      cmd.needsConfirmation = true;
      if (!productName) cmd.missing.push("which product to order");
      cmd.summary = productName ? `Placing a dropship order for ${productName}.` : "Placing a dropship order.";
      return cmd;
    }
  }

  // ── sendEmail ─────────────────────────────────────────────────────────────
  {
    const m =
      text.match(/send\s+(?:an?\s+)?(follow-?up|reminder|thank\s*you|receipt|invoice)\s*(?:email)?\s*(?:to|for)\s*(.+)/i) ||
      text.match(/email\s+(.+?)\s+(?:a\s+)?(follow-?up|reminder|receipt|invoice|thank\s*you)?/i) ||
      text.match(/send\s+(?:an?\s+)?email\s+(?:to|for)\s+(.+)/i);
    if (m) {
      const kindRaw = (m[1] || m[2] || "").toLowerCase();
      const emailKind: AgentFields["emailKind"] = kindRaw.includes("remind")
        ? "reminder"
        : kindRaw.includes("invoice") || kindRaw.includes("receipt")
          ? "invoice"
          : kindRaw.includes("thank")
            ? "thank-you"
            : "follow-up";
      const who = (m[2] || m[1] || "")
        .replace(/(follow-?up|reminder|thank\s*you|receipt|invoice|email)/gi, "")
        .trim();
      const contactName = fuzzyExtract(who, ctx.knownContacts);
      const cmd = baseCommand("sendEmail", `Send ${emailKind} email`);
      cmd.fields.emailKind = emailKind;
      cmd.fields.contactName = contactName;
      if (!contactName) cmd.missing.push("who should receive it");
      cmd.summary = contactName ? `Sending ${contactName} a ${emailKind} email.` : "Sending the email.";
      return cmd;
    }
  }

  // ── remindMe ──────────────────────────────────────────────────────────────
  {
    const m = text.match(/remind\s+me\s+(?:to\s+|about\s+|that\s+)?(.+)/i) || text.match(/set\s+(?:a|an)?\s*reminder\s+(?:for|to|about)\s+(.+)/i);
    if (m) {
      const rest = m[1].trim();
      const whenMatch = rest.match(
        /\b(today|tomorrow|in\s+\d+\s+\w+|at\s+\d+\s?(?:am|pm)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this\s+(?:week|evening|afternoon|morning))\b/i,
      );
      const textOnly = rest
        .replace(/\b(today|tomorrow|in\s+\d+\s+\w+|at\s+\d+\s?(?:am|pm)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this\s+(?:week|evening|afternoon|morning))\b/gi, "")
        .replace(/^(to|about|that)\s+/i, "")
        .trim();
      const cmd = baseCommand("remindMe", "Set a reminder");
      cmd.fields.reminderText = textOnly || rest;
      cmd.fields.reminderWhen = whenMatch ? whenMatch[1].toLowerCase() : "today";
      cmd.summary = `I'll remind you${whenMatch ? ` ${whenMatch[1].toLowerCase()}` : ""} to ${cmd.fields.reminderText}.`;
      return cmd;
    }
  }

  // Fall through: the input is a question — let the Q&A engine answer it.
  return {
    intent: "answer",
    label: "",
    summary: "",
    fields: {},
    missing: [],
    needsConfirmation: false,
  };
}

/** Natural-language follow-up for a missing field (used by the copilot). */
export function clarificationFor(command: AgentCommand, ctx: AgentContext): string {
  const first = ctx.userName.split(" ")[0] || "boss";
  if (command.intent === "makeCall") return `Who should I call, ${first}? Say a name or number.`;
  if (command.intent === "addContact") return `What's the customer's name, ${first}?`;
  if (command.intent === "logTransaction") return `How much ${command.fields.kind || "income"} should I record, ${first}?`;
  if (command.intent === "postToMarketplace") return `Which item should I post, ${first}?`;
  if (command.intent === "restock") return `Which item should I restock, ${first}?`;
  if (command.intent === "placeDropshipOrder") return `Which product should I order, ${first}?`;
  if (command.intent === "sendEmail") return `Who should get the email, ${first}?`;
  return `What exactly would you like me to do, ${first}?`;
}
