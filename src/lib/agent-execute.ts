/**
 * BNX Agent Executor.
 *
 * The second half of the "Hey BNX" agent loop. The classifier
 * (ai/src/agent.ts) turns natural language into a structured AgentCommand;
 * this module executes it for real against the zustand store and the live
 * Twilio calling API (/api/agent-call), then reports back an ExecutionResult
 * the copilot renders as a result card (with undo where it is safe).
 *
 * Confirmation happens BEFORE this runs — the copilot gates money-moving and
 * phone-calling commands behind an explicit confirm step.
 */

import { AgentCommand, AgentContext } from "../../ai/src/agent";
import {
  buildCallEmail,
  buildCallNotification,
  CustomerContext,
  SimContact,
  SimOrder,
  simulateAgentCall,
} from "../../ai/src/sales-agent";
import { useStore } from "../store/useStore";
import {
  AgentCall,
  BirichiNexView,
  Currency,
  TranscriptLine,
} from "../types";
import { captureExecutionOutcome } from "../../ai/src/core";
import { formatPrice } from "../data/platform";

export type UndoKind =
  | "contact"
  | "transaction"
  | "document"
  | "restock"
  | "marketplace"
  | "expense";

export interface UndoAction {
  label: string;
  kind: UndoKind;
  id?: string;
  stockBefore?: number;
}

export interface ExecutionResult {
  ok: boolean;
  title: string;
  detail: string;
  view?: BirichiNexView;
  followUp?: { label: string; text: string };
  undo?: UndoAction;
}

// ── Context building ────────────────────────────────────────────────────────

export function buildAgentContext(): AgentContext {
  const s = useStore.getState();
  return {
    userName: s.user?.name ?? s.settings.profile.name ?? "Frank",
    businessName: s.settings.profile.company ?? "BirichiNex",
    currency: s.selectedCurrency,
    currentView: s.currentView,
    knownContacts: s.contacts.map((c) => c.name),
    knownInventory: s.inventoryItems.map((i) => i.name),
    knownProducts: s.inventoryItems.map((i) => i.name),
  };
}

export function ownerEmailFor(): string {
  const s = useStore.getState();
  return s.user?.email ?? s.settings.profile.email ?? "owner@birichinex.com";
}

// ── Lookup helpers ──────────────────────────────────────────────────────────

function fuzzyMatch(phrase: string | undefined, names: string[]): string | undefined {
  if (!phrase) return undefined;
  const p = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  if (!p) return undefined;
  return names.find((k) => {
    const kk = k.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    return p === kk || p.includes(kk) || kk.includes(p);
  });
}

export function resolveContact(
  name?: string,
  phone?: string,
): { contact: SimContact; found: boolean } | null {
  const s = useStore.getState();
  if (name) {
    const matched = fuzzyMatch(name, s.contacts.map((c) => c.name));
    const known = s.contacts.find((c) => c.name === matched);
    if (known) {
      return {
        contact: {
          id: known.id,
          name: known.name,
          phone: phone ?? known.phone ?? "",
          company: known.company,
        },
        found: true,
      };
    }
  }
  if (phone) {
    return {
      contact: { id: "direct", name: name ?? "Customer", phone, company: undefined },
      found: false,
    };
  }
  return null;
}

export function resolveInventoryItem(
  name?: string,
): { id: string; name: string; stock: number; minStock: number } | null {
  const s = useStore.getState();
  const matched = fuzzyMatch(name, s.inventoryItems.map((i) => i.name));
  const item = s.inventoryItems.find((i) => i.name === matched);
  return item ? { id: item.id, name: item.name, stock: item.stock, minStock: item.minStock } : null;
}

function catalogProduct(_name?: string) {
  return null;
}

function money(amount: number, currency: Currency): string {
  return formatPrice(amount, currency, "TZS");
}

function now(): string {
  return new Date().toISOString();
}

// ── Live dial + simulation fallback (mirrors AISalesAgentPage.dialCall) ─────

async function dialCall(
  type: AgentCall["type"],
  contact: SimContact,
  customer: CustomerContext,
  order?: SimOrder,
): Promise<Omit<AgentCall, "id" | "createdAt">> {
  const s = useStore.getState();
  try {
    const resp = await fetch("/api/agent-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        contact,
        order,
        config: { ...s.aiAgent, business: "BirichiNex" },
      }),
    });
    const data = await resp.json();
    if (data?.mode === "live" || data?.mode === "conversational") {
      const script: TranscriptLine[] = Array.isArray(data.transcript)
        ? data.transcript
        : [{ speaker: "agent", text: `${s.aiAgent.name} is calling ${contact.name} now.` }];
      const liveConversation = data?.mode === "conversational";
      return {
        customerId: contact.id,
        customerName: contact.name,
        customerPhone: contact.phone,
        type,
        status: "completed",
        outcome: type === "outbound-sales" ? "callback-requested" : "order-status",
        durationSec: 0,
        transcript: [
          ...script,
          {
            speaker: "customer",
            text: liveConversation
              ? `(live AI conversation — ${contact.phone} is ringing now)`
              : `(live call — ${contact.phone} is ringing now)`,
          },
        ],
        orderId: order?.id,
        summary: liveConversation
          ? `Live AI conversation via Twilio + Gemini — ${contact.name} (${contact.phone}). SID ${data.callSid}.`
          : `Live call placed via Twilio — ${contact.name} (${contact.phone}). SID ${data.callSid}.`,
      };
    }
  } catch {
    // Server not reachable or not configured — fall through to simulation.
  }
  return simulateAgentCall(s.aiAgent, contact, customer, type, order);
}

function recordCall(call: Omit<AgentCall, "id" | "createdAt">): AgentCall {
  const s = useStore.getState();
  s.logAgentCall(call);
  const full: AgentCall = { ...call, id: crypto.randomUUID(), createdAt: now() };
  s.addNotification(buildCallNotification(full));
  if (s.aiAgent.sendOwnerEmails) {
    s.logEmail(buildCallEmail(full, ownerEmailFor(), s.aiAgent.name));
  }
  if (call.outcome === "order-placed" || call.outcome === "order-repeated") {
    s.addWalletFunds(2500, `Cashback — ${call.customerName} placed an order via ${s.aiAgent.name}`);
    s.addLoyaltyPoints(120, `AI sales bonus — ${call.customerName}'s order`, call.orderId);
  }
  return full;
}

// ── Per-intent execution ─────────────────────────────────────────────────────

async function runMakeCall(cmd: AgentCommand): Promise<ExecutionResult> {
  const s = useStore.getState();
  const { contactName, phone, batch } = cmd.fields;

  if (batch === "missed") {
    const missed = s.contacts.filter((c) => c.status !== "active");
    const pool = missed.length > 0 ? missed : s.contacts;
    const targets = pool.slice(0, 3);
    if (targets.length === 0) {
      return { ok: false, title: "No customers found", detail: "There are no customers on file to call." };
    }
    const results = await Promise.all(
      targets.map((c) =>
        dialCall("outbound-followup", {
          id: c.id,
          name: c.name,
          phone: c.phone,
          company: c.company,
        }, {
          name: c.name,
          orderCount: s.orders.filter((o) => o.customerName === c.name).length,
          lifetimeSpend: 0,
        }),
      ),
    );
    results.forEach(recordCall);
    const answered = results.filter((r) => r.status === "completed").length;
    return {
      ok: true,
      title: `Called ${targets.length} missed customer${targets.length === 1 ? "" : "s"}`,
      detail: `${results.length} call${results.length === 1 ? "" : "s"} placed — ${answered} answered, ${results.length - answered} left voicemail or didn't pick up. Full transcripts are in the AI Call Center.`,
      view: "ai-agent",
      followUp: { label: "Review transcripts", text: "Open the AI Call Center" },
    };
  }

  const resolved = resolveContact(contactName, phone);
  if (!resolved) {
    return {
      ok: false,
      title: "Can't place that call",
      detail: "I couldn't find that customer. Add them first, or tell me their phone number.",
    };
  }
  const { contact, found } = resolved;
  const type: AgentCall["type"] = found ? "outbound-sales" : "outbound-followup";
  const customer: CustomerContext = {
    name: contact.name,
    orderCount: s.orders.filter((o) => o.customerName === contact.name).length,
    lifetimeSpend: 0,
  };
  const call = recordCall(await dialCall(type, contact, customer));
  const outcome = call.outcome.replace(/-/g, " ");
  return {
    ok: true,
    title: `Called ${contact.name}`,
    detail: `${call.status === "completed" ? `Call went through — ${outcome}.` : `No answer${call.status === "voicemail" ? " — left a voicemail." : "."}`} ${call.summary}`,
    view: "ai-agent",
    followUp: {
      label: "Follow up tomorrow",
      text: `Call ${contact.name} again tomorrow`,
    },
  };
}

function runAddContact(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const name = cmd.fields.contactName ?? cmd.fields.title;
  if (!name) {
    return { ok: false, title: "Missing contact name", detail: "I need the customer's name to add them." };
  }
  const idsBefore = new Set(s.contacts.map((c) => c.id));
  s.addContact({
    name,
    email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@customer.local`,
    phone: cmd.fields.phone ?? "",
    company: "",
    role: "Customer",
    status: "lead",
    tags: ["agent-added"],
    notes: `Added via BNX agent — "${cmd.label}"`,
    createdAt: now(),
    lastContactAt: now(),
  });
  const after = useStore.getState();
  const created = after.contacts.find((c) => c.name === name && !idsBefore.has(c.id));
  return {
    ok: true,
    title: `Added ${name} to your CRM`,
    detail: `New lead saved${cmd.fields.phone ? ` with phone ${cmd.fields.phone}` : " (no phone yet — I can add one later)"}. You'll find them in Contacts.`,
    view: "crm",
    followUp: { label: "Call them now", text: `Call ${name} now` },
    undo: created ? { label: "Undo", kind: "contact", id: created.id } : undefined,
  };
}

function runLogTransaction(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const currency = s.selectedCurrency;
  const kind = cmd.fields.kind ?? "expense";
  const amount = cmd.fields.amount;
  const description = cmd.fields.description ?? cmd.label;
  if (!amount) {
    return { ok: false, title: "Missing amount", detail: "I need the amount to log this." };
  }
  const idsBefore = new Set(s.transactions.map((t) => t.id));
  s.addTransaction({
    type: kind,
    amount: { amount, currency },
    description,
    category: kind === "income" ? "Sales" : "Operations",
    date: now().slice(0, 10),
    status: "completed",
  });
  const after = useStore.getState();
  const created = after.transactions.find(
    (t) => !idsBefore.has(t.id) && t.amount.amount === amount && t.description === description,
  );
  const verb = kind === "income" ? "Logged" : "Recorded";
  return {
    ok: true,
    title: `${verb} ${money(amount, currency)} ${kind}`,
    detail: `"${description}" is now in your ledger${currency !== "TZS" ? ` in ${currency}` : ""}. Finance reports update automatically.`,
    view: "finance",
    followUp: { label: "See my finances", text: "Open my finance dashboard" },
    undo: created ? { label: "Undo", kind: "transaction", id: created.id } : undefined,
  };
}

function runCreateDocument(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const docType = cmd.fields.documentType ?? "invoice";
  const title = cmd.fields.title ?? `Untitled ${docType}`;
  const subject = cmd.fields.contactName ?? cmd.fields.itemName ?? "Client";
  const category =
    docType === "invoice" ? ("Financial" as const) : docType === "contract" ? ("Legal" as const) : ("Operations" as const);
  const body = `[${docType.toUpperCase()}] ${title}\n\nPrepared for: ${subject}\nPrepared by: ${s.settings.profile.name ?? "Frank"}\nBusiness: ${s.settings.profile.company ?? "BirichiNex"}\n\nGenerated on ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })} by the BNX agent. Fill in the remaining details, then sign or export.`;
  const idsBefore = new Set(s.documents.map((d) => d.id));
  s.addDocument({
    title,
    type: docType,
    category,
    content: body,
    status: "draft",
    size: "~4 KB",
    attachments: [],
  });
  const after = useStore.getState();
  const created = after.documents.find((d) => !idsBefore.has(d.id) && d.title === title);
  return {
    ok: true,
    title: `Created ${title}`,
    detail: `${/^[aeiou]/i.test(docType) ? "An" : "A"} ${docType} draft is saved in Documents (${category}). Open it to fill in the final details and sign.`,
    view: "documents",
    followUp: { label: "Open it", text: "Open my documents" },
    undo: created ? { label: "Delete", kind: "document", id: created.id } : undefined,
  };
}

function runPostToMarketplace(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const item = resolveInventoryItem(cmd.fields.itemName);
  if (!item) {
    return {
      ok: false,
      title: "Item not found",
      detail: "I couldn't find that product in your inventory. Tell me its exact name, or add it first.",
    };
  }
  const full = s.inventoryItems.find((i) => i.id === item.id);
  if (!full) {
    return { ok: false, title: "Item not found", detail: "The product no longer exists in inventory." };
  }
  if (full.postedToMarketplace) {
    return {
      ok: true,
      title: `${item.name} is already listed`,
      detail: "This product is already on the Marketplace — nothing changed.",
      view: "marketplace",
    };
  }
  s.postItemToMarketplace(item.id, {
    amount: full.price.amount,
    currency: full.price.currency,
  });
  return {
    ok: true,
    title: `Listed ${item.name} on the Marketplace`,
    detail: `Posted at ${money(full.price.amount, full.price.currency)}${full.stock <= 0 ? " — but stock is 0, so it will show as sold out." : ` with ${full.stock} in stock.`}`,
    view: "marketplace",
    followUp: { label: "View listing", text: "Open my marketplace" },
    undo: { label: "Unlist", kind: "marketplace", id: item.id },
  };
}

function runRestock(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const item = resolveInventoryItem(cmd.fields.itemName);
  if (!item) {
    return {
      ok: false,
      title: "Item not found",
      detail: "I couldn't find that product in your inventory. Tell me its exact name.",
    };
  }
  const qty = cmd.fields.quantity ?? Math.max(1, item.minStock);
  const newStock = item.stock + qty;
  const status = newStock <= 0 ? ("out-of-stock" as const) : newStock <= item.minStock ? ("low-stock" as const) : ("in-stock" as const);
  s.updateInventoryItem(item.id, {
    stock: newStock,
    status,
    lastRestocked: now(),
  });
  return {
    ok: true,
    title: `Restocked ${item.name}`,
    detail: `Added ${qty} unit${qty === 1 ? "" : "s"} — now at ${newStock} in stock${item.stock <= item.minStock ? ` (was ${item.stock}, below the ${item.minStock} minimum)` : "."}`,
    view: "inventory",
    followUp: { label: "View inventory", text: "Open my inventory" },
    undo: { label: "Undo", kind: "restock", id: item.id, stockBefore: item.stock },
  };
}

function runPlaceDropshipOrder(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const product = catalogProduct(cmd.fields.productName);
  if (!product) {
    return {
      ok: false,
      title: "No dropship products yet",
      detail: "No supplier-published products are available to buy at the moment. When suppliers list products in the Dropshipping hub, I'll be able to order them for you.",
    };
  }
  const qty = cmd.fields.quantity ?? 1;
  const unit = product.dropshipPrice.amount;
  const currency = product.dropshipPrice.currency;
  const total = unit * qty;
  const buyer = s.settings.profile.name ?? s.user?.name ?? "Business Owner";
  s.placeDropshipOrder({
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitPrice: { amount: unit, currency },
    total: { amount: total, currency },
    status: "placed",
    fulfillmentType: "deliver",
    customerName: buyer,
    customerAddress: s.settings.profile.city ? `${s.settings.profile.city}, ${s.settings.profile.country ?? ""}`.trim() : "To be confirmed",
    estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: `Placed via BNX agent — ${cmd.label}`,
  });
  s.addTransaction({
    type: "expense",
    amount: { amount: total, currency },
    description: `Dropship order — ${product.name} ×${qty}`,
    category: "Dropshipping",
    date: now().slice(0, 10),
    status: "completed",
  });
  return {
    ok: true,
    title: `Placed dropship order for ${product.name}`,
    detail: `${qty} × ${money(unit, currency)} = ${money(total, currency)} (${product.origin}, ${product.grade}). Estimated delivery ${new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}. Order + ledger expense recorded.`,
    view: "dropshipping",
    followUp: { label: "Track it", text: "Open my dropshipping orders" },
  };
}

function runSendEmail(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const recipient = cmd.fields.contactName;
  const emailKind = cmd.fields.emailKind ?? "follow-up";
  const subject =
    emailKind === "invoice"
      ? "Your invoice is ready"
      : emailKind === "thank-you"
        ? "Thank you for your business"
        : emailKind === "reminder"
          ? "A friendly reminder from us"
          : "Quick follow-up";
  const to = recipient ? `${recipient.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@customer.local` : ownerEmailFor();
  const body = `Hi${recipient ? ` ${recipient.split(" ")[0]}` : ""},\n\n${emailKind === "invoice" ? "Your invoice is ready and attached here." : emailKind === "thank-you" ? "Thank you for choosing us — we truly appreciate your business." : emailKind === "reminder" ? "This is a friendly reminder about your recent order." : "Just following up — is there anything we can help you with?"}\n\nBest regards,\n${s.settings.profile.company ?? "BirichiNex"}`;
  s.logEmail({
    to,
    subject,
    body,
    kind: emailKind === "invoice" ? ("order-update" as const) : ("follow-up" as const),
  });
  return {
    ok: true,
    title: `Email ${emailKind === "invoice" ? "sent" : "drafted"}`,
    detail: `"${subject}" ${recipient ? `to ${recipient}` : `to your inbox (${to})`} — it's in your email log.`,
    view: "ai-agent",
    followUp: { label: "Open inbox", text: "Show my email inbox" },
  };
}

function runRemindMe(cmd: AgentCommand): ExecutionResult {
  const s = useStore.getState();
  const text = cmd.fields.reminderText ?? cmd.label;
  const when = cmd.fields.reminderWhen;
  const title = when ? `Reminder${when.toLowerCase().startsWith("at") ? "" : " — " + when}` : "Reminder";
  s.addNotification({
    title,
    body: when ? `${when} — ${text}` : text,
    type: "system",
  });
  return {
    ok: true,
    title: `Reminder set${when ? ` for ${when}` : ""}`,
    detail: `"${text}" — I'll remind you${when ? ` ${when}` : " soon"}. Check your notifications bell.`,
    followUp: { label: "See notifications", text: "Open my notifications" },
  };
}

// ── Entry point ─────────────────────────────────────────────────────────────

// Every executed action lands in the closed loop: EXECUTE → MEASURE → LEARN.
function finish(intent: string, result: ExecutionResult): ExecutionResult {
  if (result.ok) {
    captureExecutionOutcome(intent, true, result.title, result.detail);
  }
  return result;
}

export async function executeAgentCommand(cmd: AgentCommand): Promise<ExecutionResult> {
  switch (cmd.intent) {
    case "navigate":
      return {
        ok: true,
        title: cmd.label,
        detail: cmd.summary,
        view: cmd.fields.view,
      };
    case "makeCall":
      return finish("makeCall", await runMakeCall(cmd));
    case "addContact":
      return finish("addContact", runAddContact(cmd));
    case "logTransaction":
      return finish("logTransaction", runLogTransaction(cmd));
    case "createDocument":
      return runCreateDocument(cmd);
    case "postToMarketplace":
      return finish("postToMarketplace", runPostToMarketplace(cmd));
    case "restock":
      return finish("restock", runRestock(cmd));
    case "placeDropshipOrder":
      return finish("placeDropshipOrder", runPlaceDropshipOrder(cmd));
    case "sendEmail":
      return runSendEmail(cmd);
    case "remindMe":
      return runRemindMe(cmd);
    case "answer":
    default:
      return {
        ok: false,
        title: "I can't do that yet",
        detail: "That sounds like a question rather than an action — try asking me directly.",
      };
  }
}

// ── Undo ─────────────────────────────────────────────────────────────────────

export function undoExecution(undo: UndoAction): void {
  const s = useStore.getState();
  switch (undo.kind) {
    case "contact":
      if (undo.id) s.deleteContact(undo.id);
      break;
    case "transaction":
      if (undo.id) s.deleteTransaction(undo.id);
      break;
    case "document":
      if (undo.id) s.deleteDocument(undo.id);
      break;
    case "restock":
      if (undo.id && typeof undo.stockBefore === "number") {
        const item = s.inventoryItems.find((i) => i.id === undo.id);
        if (item) {
          const restored = undo.stockBefore;
          s.updateInventoryItem(item.id, {
            stock: restored,
            status:
              restored <= 0
                ? ("out-of-stock" as const)
                : restored <= item.minStock
                  ? ("low-stock" as const)
                  : ("in-stock" as const),
          });
        }
      }
      break;
    case "marketplace":
      if (undo.id) s.removeItemFromMarketplace(undo.id);
      break;
    case "expense":
      if (undo.id) s.deleteTransaction(undo.id);
      break;
  }
}
