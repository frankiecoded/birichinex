// ============================================
// Amani — BirichiNex AI Sales Agent Engine
// Call simulation, order follow-ups, and owner alerts.
// A persona-driven conversational model: the agent's
// tone, language (English / Kiswahili / mixed), call
// objective and human-touch fillers shape every line,
// so it sounds like a warm, competent human secretary.
// ============================================

import {
  AIAgentConfig,
  AgentCall,
  AgentCallObjective,
  AgentCallOutcome,
  AgentCallType,
  AgentLanguage,
  TranscriptLine,
  AppNotification,
  OwnerEmail,
} from "../../src/types";

export interface SimContact {
  id: string;
  name: string;
  phone: string;
  company?: string;
}

export interface SimOrder {
  id: string;
  productName?: string;
  status?: string;
  customerName?: string;
}

export interface CustomerContext {
  name: string;
  orderCount: number;
  lifetimeSpend: number;
  lastOrder?: string;
  openOrderId?: string;
}

export interface CallScript {
  transcript: TranscriptLine[];
  outcome: AgentCallOutcome;
  summary: string;
}

// ─── Persona pools ───────────────────────────────────────────────────────────

type TonePool = {
  greets: string[];
  ack: string[];
  filler: string[];
  react: string[];
  confirm: string[];
  emphatic: string[];
  closes: string[];
};

const TONE_PERSONA: Record<AIAgentConfig["tone"], TonePool> = {
  friendly: {
    greets: ["Hey {name}!", "Hi {name}! "],
    ack: ["No worries at all!", "That's totally fine!", "No problem!"],
    filler: ["Just a moment...", "Let me check that for you...", "One sec..."],
    react: ["You're welcome, happy to help!", "Anytime, that's what I'm here for!"],
    confirm: ["Perfect, thank you!", "Awesome, done!"],
    emphatic: ["That's great news!", "Love to hear that!"],
    closes: ["Take care, {name}, and talk soon!", "Have a lovely day, {name}!"],
  },
  professional: {
    greets: ["Good day, {name}.", "Good morning, {name}."],
    ack: ["Thank you.", "I understand.", "Noted."],
    filler: ["One moment, please.", "Let me verify that for you."],
    react: ["You're most welcome.", "My pleasure."],
    confirm: ["Thank you for confirming.", "Understood."],
    emphatic: ["Excellent.", "Very good."],
    closes: ["Thank you for your time, {name}. Goodbye.", "Please don't hesitate to reach out. Goodbye, {name}."],
  },
  warm: {
    greets: ["Hello, {name}, how are you today?", "Hi dear {name}!"],
    ack: ["Of course, I'm happy to help.", "No problem at all.", "That's quite alright."],
    filler: ["Let me have a look for you...", "Hold on just a moment..."],
    react: ["You're very welcome, {name}.", "It's my pleasure, {name}."],
    confirm: ["Lovely, thank you.", "Marvelous!"],
    emphatic: ["How wonderful!", "That's just lovely."],
    closes: ["God bless you, {name}. Take care.", "Sending you well wishes, {name}. Goodbye!"],
  },
  confident: {
    greets: ["Hi {name}, {agent} here.", "Morning {name}!"],
    ack: ["Got it.", "No stress.", "On it."],
    filler: ["Give me a second...", "Let me sort that out now."],
    react: ["You got it!", "Done deal."],
    confirm: ["Locked in.", "Perfect, that's confirmed."],
    emphatic: ["We've got you covered.", "That's the easy part."],
    closes: ["Talk soon, {name}!", "All the best, {name}. We'll be in touch."],
  },
};

const SW_GREETS = ["Habari, {name}!", "Habari yako, {name}?", "Shikamoo, {name}."];
const SW_FILLERS = ["Sekunde moja...", "Hebu niangalie...", "Kila kitu kiko sawa."];
const SW_CONFIRMS = ["Asante, {name}.", "Asante sana!"];
const SW_CLOSES = ["Asante sana, {name}. Kwaheri na karibu tena.", "Karibu tena, {name}. Kwaheri!"];

const DEFAULT_OPENERS: Record<AgentCallObjective, string[]> = {
  inform: [
    "Hello {customer}, this is {agent} from {business}. I'm calling about {order} — just a quick update.",
  ],
  "close-sale": [
    "Hi {customer}! {agent} here from {business}. We have something special for you today.",
  ],
  "schedule-followup": [
    "Hello {customer}, {agent} calling from {business}. When would be a good time to call back?",
  ],
  "collect-details": [
    "Good day {customer}, {agent} from {business}. I just need a couple of details to finalize {order}.",
  ],
  survey: [
    "Hi {customer}! {agent} here from {business}. Would you mind a quick two-question survey?",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function fillPool(pool: string[], vars: Record<string, string>): string {
  return fill(pick(pool), vars);
}

/** Builds a persona object whose lines are already shaped by config. */
function persona(config: AIAgentConfig, vars: Record<string, string>) {
  const T = TONE_PERSONA[config.tone];
  const sw = config.language !== "en";
  const mixed = config.language === "mixed";
  const maybe = (swPool: string[], enPool: string[]) => {
    if (config.language === "sw") return pick(swPool);
    if (mixed && Math.random() > 0.5) return pick(swPool);
    return pick(enPool);
  };
  return {
    greet(): string {
      const greeting = maybe(SW_GREETS, T.greets);
      return fill(greeting, vars);
    },
    ack(): string {
      return maybe(SW_CONFIRMS, T.ack);
    },
    filler(): string {
      if (config.humanTouch) return maybe(SW_FILLERS, T.filler);
      return "";
    },
    react(): string {
      return fill(pick(T.react), vars);
    },
    confirm(): string {
      return maybe(SW_CONFIRMS, T.confirm);
    },
    emphatic(): string {
      return pick(T.emphatic);
    },
    close(): string {
      const custom = config.closingPhrases.length ? config.closingPhrases : undefined;
      if (custom) return fill(pick(custom), vars);
      return maybe(SW_CLOSES, T.closes);
    },
  };
}

const VARS = (config: AIAgentConfig, customer: CustomerContext, order?: SimOrder): Record<string, string> => ({
  name: customer.name,
  customer: customer.name,
  agent: config.name,
  business: "BirichiNex",
  order: order?.id ?? "your order",
  product: order?.productName ?? "your purchase",
  status: order?.status ?? "on its way",
});

// ─── Script builders ─────────────────────────────────────────────────────────

export function buildCallScript(
  config: AIAgentConfig,
  contact: SimContact,
  customer: CustomerContext,
  type: AgentCallType,
  order?: SimOrder,
): CallScript {
  const vars = VARS(config, customer, order);
  const p = persona(config, vars);
  const opener =
    config.openingPhrases.length > 0
      ? fill(pick(config.openingPhrases), { ...vars, business: "BirichiNex" })
      : fill(pick(DEFAULT_OPENERS[config.callObjective]), vars);
  const fillerLine = () => {
    const f = p.filler();
    return f ? ` ${f}` : "";
  };

  const statusLine = () =>
    order
      ? `Your order ${order.id} for ${order.productName ?? "your purchase"} is ${order.status ?? "on its way"}.`
      : "Everything with your recent order is on track.";

  if (type === "inbound") {
    return buildInboundScript(config, customer, order, p, vars, opener, statusLine, fillerLine);
  }
  if (type === "outbound-followup") {
    return buildFollowUpScript(config, customer, order, p, vars, opener, statusLine, fillerLine);
  }
  return buildSalesScript(config, customer, order, p, vars, opener, statusLine, fillerLine);
}

function buildInboundScript(
  config: AIAgentConfig,
  customer: CustomerContext,
  order: SimOrder | undefined,
  p: ReturnType<typeof persona>,
  vars: Record<string, string>,
  opener: string,
  statusLine: () => string,
  fillerLine: () => string,
): CallScript {
  const lines: TranscriptLine[] = [
    {
      speaker: "customer",
      text: pick(["Hi, I'd like to check on my order.", "Hello! Can you help me with a delivery?", "Hi, I want to order something."]),
    },
    { speaker: "agent", text: `${p.greet()} ${opener}` },
  ];

  const objective = config.callObjective;

  if (objective === "close-sale") {
    lines.push(
      { speaker: "agent", text: `${p.emphatic()} We just launched a fresh selection with member pricing, and your loyalty tier unlocks an extra discount today.${fillerLine()}` },
      { speaker: "customer", text: pick(["That sounds great, I'll take something.", "Okay, place the order for me."]) },
      { speaker: "agent", text: `Done! I've placed the order, ${vars.name}. ${p.confirm()} ${p.emphatic()}` },
      { speaker: "customer", text: "Thank you so much!" },
      { speaker: "agent", text: p.react() },
    );
    return { transcript: lines, outcome: "order-placed", summary: `Inbound call — ${customer.name} placed an order over the phone.` };
  }

  if (objective === "schedule-followup") {
    lines.push(
      { speaker: "customer", text: "I'm a bit busy right now." },
      { speaker: "agent", text: `${p.ack()} ${statusLine()} Would tomorrow morning suit you for a call back?` },
      { speaker: "customer", text: "Tomorrow works, thanks." },
      { speaker: "agent", text: `${p.confirm()} I've booked a call for tomorrow morning.${fillerLine()}` },
    );
    return { transcript: lines, outcome: "callback-requested", summary: `Inbound call — scheduled a callback with ${customer.name}.` };
  }

  if (objective === "collect-details") {
    lines.push(
      { speaker: "customer", text: "Can you update my delivery details?" },
      { speaker: "agent", text: `${p.ack()} Of course.${fillerLine()} Could you confirm the delivery address on file?` },
      { speaker: "customer", text: "Yes, the one from last month is still correct." },
      { speaker: "agent", text: `${p.confirm()} I've noted that for you, ${vars.name}. ${p.emphatic()}` },
    );
    return { transcript: lines, outcome: "query-answered", summary: `Inbound call — collected and confirmed delivery details from ${customer.name}.` };
  }

  if (objective === "survey") {
    lines.push(
      { speaker: "customer", text: "Sure, go ahead." },
      { speaker: "agent", text: `Great. On a scale of one to ten, how happy are you with your last order?${fillerLine()}` },
      { speaker: "customer", text: "Nine, it was great." },
      { speaker: "agent", text: `${p.emphatic()} Thank you for that, ${vars.name}. ${p.react()}` },
    );
    return { transcript: lines, outcome: "query-answered", summary: `Inbound call — collected a satisfaction rating from ${customer.name}.` };
  }

  // inform (default)
  if (order) {
    lines.push(
      { speaker: "customer", text: pick([`It's about my order ${order.id}.`, `I'm asking about ${order.productName ?? "my order"}.`]) },
      { speaker: "agent", text: `${p.ack()} ${statusLine()}${fillerLine()} I've noted that for you.` },
    );
  }

  const hasRepeat = config.repeatOrders && customer.orderCount >= 1;
  if (hasRepeat) {
    lines.push(
      { speaker: "agent", text: `Also, I see you've ordered from us before — would you like me to repeat your last order?` },
      { speaker: "customer", text: pick(["Yes please, repeat it.", "Go ahead.", "Sure, that would be great."]) },
      { speaker: "agent", text: `Done! Your repeat order is placed and loyalty points were added.${fillerLine()}` },
      { speaker: "customer", text: "That's all, thank you!" },
      { speaker: "agent", text: `${p.react()} ${p.close()}` },
    );
    return { transcript: lines, outcome: "order-repeated", summary: `Inbound call — ${customer.name} repeated a previous order.` };
  }

  lines.push(
    { speaker: "customer", text: pick(["That's all, thank you!", "Perfect, thanks for the help."]) },
    { speaker: "agent", text: `${p.react()} ${p.close()}` },
  );
  return { transcript: lines, outcome: "query-answered", summary: `Inbound call — ${customer.name} inquiry handled.` };
}

function buildFollowUpScript(
  config: AIAgentConfig,
  customer: CustomerContext,
  order: SimOrder | undefined,
  p: ReturnType<typeof persona>,
  vars: Record<string, string>,
  opener: string,
  statusLine: () => string,
  fillerLine: () => string,
): CallScript {
  const lines: TranscriptLine[] = [
    { speaker: "agent", text: opener },
    { speaker: "customer", text: pick(["Oh hello! Yes, I was meaning to check on that.", "Hi! Thanks for following up.", "Hey, glad you called."]) },
  ];

  const objective = config.callObjective;

  if (objective === "close-sale") {
    lines.push(
      { speaker: "agent", text: `${p.ack()} ${p.emphatic()} We have a small bonus for repeat customers today — an extra member discount on your next order.${fillerLine()}` },
      { speaker: "customer", text: pick(["Okay, that sounds good.", "Sure, sign me up."]) },
      { speaker: "agent", text: `Done! I've applied it to ${vars.order}. ${p.confirm()}` },
      { speaker: "customer", text: "Thanks, appreciate it!" },
      { speaker: "agent", text: p.react() },
    );
    return { transcript: lines, outcome: "order-placed", summary: `Outbound follow-up — converted ${customer.name} into a repeat order.` };
  }

  if (objective === "schedule-followup") {
    lines.push(
      { speaker: "agent", text: `${statusLine()}${fillerLine()} Would it be easier if the shop called you back at a set time?` },
      { speaker: "customer", text: "Yes, that'd be better." },
      { speaker: "agent", text: `${p.confirm()} I'll book a callback for you, ${vars.name}.` },
    );
    return { transcript: lines, outcome: "callback-requested", summary: `Outbound follow-up — scheduled a callback with ${customer.name}.` };
  }

  if (objective === "collect-details" || objective === "survey") {
    lines.push(
      { speaker: "agent", text: `${p.ack()} May I confirm your delivery address and preferred contact time?${fillerLine()}` },
      { speaker: "customer", text: "Sure, the address is unchanged, mornings work best." },
      { speaker: "agent", text: `${p.confirm()} All updated, ${vars.name}.` },
    );
    return { transcript: lines, outcome: "query-answered", summary: `Outbound follow-up — collected details from ${customer.name}.` };
  }

  // inform (default)
  lines.push(
    { speaker: "agent", text: `${statusLine()}${fillerLine()} Want me to send the tracking to your phone?` },
    { speaker: "customer", text: pick(["Yes please!", "That'd be great.", "Sure."]) },
    { speaker: "agent", text: `Done! Also, because you're a loyalty member, I've added points for this order.${fillerLine()}` },
    { speaker: "customer", text: "No, thank you!" },
  );

  return {
    transcript: lines,
    outcome: "order-status",
    summary: `Outbound follow-up — updated ${customer.name} on ${order?.id ?? "their order"}.`,
  };
}

function buildSalesScript(
  config: AIAgentConfig,
  customer: CustomerContext,
  order: SimOrder | undefined,
  p: ReturnType<typeof persona>,
  vars: Record<string, string>,
  opener: string,
  _statusLine: () => string,
  fillerLine: () => string,
): CallScript {
  const lines: TranscriptLine[] = [
    { speaker: "agent", text: opener },
    { speaker: "customer", text: pick(["What do you have for me?", "I'm listening!", "Tell me more."]) },
    { speaker: "agent", text: `We just launched a new selection of premium fashion with member pricing, and your loyalty tier gives you an extra discount today.${fillerLine()}` },
    { speaker: "customer", text: pick(["That sounds good. Can I see the catalog?", "Okay, send it to me."]) },
    { speaker: "agent", text: `I've sent the catalog to your phone, ${vars.name}. I can place your order right here on the call.` },
  ];

  if (config.callObjective === "close-sale") {
    lines.push(
      { speaker: "customer", text: "Alright, let's do it." },
      { speaker: "agent", text: `${p.confirm()} Order placed — you're all set. ${p.emphatic()}` },
    );
    return { transcript: lines, outcome: "order-placed", summary: `Outbound sales — closed an order with ${customer.name}.` };
  }

  return {
    transcript: lines,
    outcome: "callback-requested",
    summary: `Outbound sales — presented new catalog to ${customer.name}.`,
  };
}

// ─── Public call simulator ───────────────────────────────────────────────────

export function simulateAgentCall(
  config: AIAgentConfig,
  contact: SimContact,
  customer: CustomerContext,
  type: AgentCallType,
  order?: SimOrder,
): Omit<AgentCall, "id" | "createdAt"> {
  const answered = config.answerCalls && Math.random() > 0.22;

  if (!answered) {
    const voicemail = Math.random() > 0.5;
    const opener = config.openingPhrases.length
      ? fill(pick(config.openingPhrases), { ...VARS(config, customer, order), business: "BirichiNex" })
      : fill(pick(DEFAULT_OPENERS[config.callObjective]), VARS(config, customer, order));
    return {
      customerId: contact.id,
      customerName: contact.name,
      customerPhone: contact.phone,
      type,
      status: voicemail ? "voicemail" : "no-answer",
      outcome: voicemail ? "callback-requested" : "no-answer",
      durationSec: voicemail ? 18 : 0,
      transcript: voicemail
        ? [
            { speaker: "agent", text: opener },
            { speaker: "customer", text: "(voicemail) Please leave a message." },
            { speaker: "agent", text: "I'll call back shortly — you can also reach us anytime." },
          ]
        : [],
      orderId: order?.id,
      summary: `${type === "outbound-followup" ? "Follow-up" : "Sales"} call — ${contact.name} did not answer.`,
    };
  }

  const script = buildCallScript(config, contact, customer, type, order);

  return {
    customerId: contact.id,
    customerName: contact.name,
    customerPhone: contact.phone,
    type,
    status: "completed",
    outcome: script.outcome,
    durationSec: 35 + Math.floor(Math.random() * 90),
    transcript: script.transcript,
    orderId: order?.id,
    summary: script.summary,
  };
}

// ─── Owner notifications & emails ────────────────────────────────────────────

export function buildCallNotification(call: AgentCall): Omit<AppNotification, "id" | "read" | "createdAt"> {
  const type = call.type === "inbound" ? "call" : "lead";
  return {
    title: `${call.customerName} — ${call.type.replace(/-/g, " ")}`,
    body: call.summary,
    type,
    actionView: "ai-agent",
  };
}

export function buildCallEmail(
  call: AgentCall,
  ownerEmail: string,
  agentName = "Amani",
): Omit<OwnerEmail, "id" | "read" | "createdAt"> {
  const transcript = call.transcript
    .map((l) => `${l.speaker === "agent" ? agentName : call.customerName}: ${l.text}`)
    .join("\n");

  return {
    to: ownerEmail,
    subject: `[Call #${call.id.slice(0, 8)}] ${call.customerName} — ${call.outcome.replace(/-/g, " ")}`,
    kind: call.type === "inbound" ? "call-transcript" : "follow-up",
    body: `Hi,\n\n${agentName} completed a ${call.type.replace(/-/g, " ")} call with ${call.customerName} (${call.durationSec}s).\n\nOutcome: ${call.outcome.replace(/-/g, " ")}\n\nTranscript:\n${transcript}\n\nYou can listen to the recording and view the full transcript in the AI Call Center.`,
  };
}

export function buildFollowUpReminderEmail(ownerEmail: string, dueCount: number): Omit<OwnerEmail, "id" | "read" | "createdAt"> {
  return {
    to: ownerEmail,
    subject: `${dueCount} customer order(s) are due for AI follow-up`,
    kind: "order-update",
    body: `Hi,\n\nAmani found ${dueCount} order(s) waiting for a follow-up this cycle. She is dialing them now — you'll get a transcript for each completed call.\n\n- The BirichiNex AI Sales Team`,
  };
}

// ─── Seed a believable recent call history on first open ─────────────────────

export function seedAgentCalls(config: AIAgentConfig): AgentCall[] {
  const names: [string, string][] = [
    ["Grace Mwangi", "+254 712 000 111"],
    ["Samuel Otieno", "+254 733 000 222"],
    ["Amina Hassan", "+255 754 000 333"],
    ["James Wanjala", "+254 700 000 444"],
  ];
  const now = Date.now();
  return names.map(([name, phone], i) => {
    const minutesAgo = i === 0 ? 12 : 47 + i * 58;
    const answered = i !== 2;
    const vars = VARS(config, { name, orderCount: i + 1, lifetimeSpend: 0 });
    const p = persona(config, vars);
    const greet = p.greet();
    const close = p.close();
    const call: Omit<AgentCall, "id" | "createdAt"> = {
      customerId: `seed-${i}`,
      customerName: name,
      customerPhone: phone,
      type: i === 0 ? "inbound" : "outbound-followup",
      status: answered ? "completed" : i === 2 ? "voicemail" : "no-answer",
      outcome: answered ? (i === 0 ? "order-placed" : "order-status") : "callback-requested",
      durationSec: answered ? 55 + i * 21 : 18,
      transcript: answered
        ? [
            { speaker: "customer", text: i === 0 ? "Hi! My order was supposed to arrive today." : `Hi, is ${name} available to talk about my order?` },
            { speaker: "agent", text: `${greet} ${config.openingPhrases[0] ? fill(config.openingPhrases[0], vars) : `This is ${config.name} from BirichiNex!`}` },
            { speaker: "customer", text: i === 0 ? "I also want to repeat my last order." : "Thanks for checking in." },
            { speaker: "agent", text: i === 0 ? `Done — your repeat order is placed and points are added. ${close}` : `Of course. I've sent a summary to your phone. ${close}` },
          ]
        : [
            { speaker: "agent", text: `${greet} This is ${config.name} from BirichiNex!` },
            { speaker: "customer", text: "(voicemail) Please leave a message." },
          ],
      summary: `${i === 0 ? "Inbound call" : "Order follow-up"} — ${name}${i === 0 ? " placed a repeat order" : " confirmed delivery status"}.`,
    };
    return { ...call, id: `seed-${i}`, createdAt: new Date(now - minutesAgo * 60_000).toISOString() };
  });
}
