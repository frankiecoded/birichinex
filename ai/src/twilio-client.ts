// ============================================
// Amani — BirichiNex Live Call Engine (Twilio Voice)
// Places REAL outbound calls through the Twilio Voice API,
// serves conversational TwiML (Say + DTMF Gather) for outbound,
// inbound, and in-call choice handling, and reports call status
// through a webhook. Falls back to client-side simulation when
// Twilio credentials are not configured.
//
// Environment:
//   TWILIO_ACCOUNT_SID      — Twilio account SID
//   TWILIO_AUTH_TOKEN       — Twilio auth token
//   TWILIO_PHONE_NUMBER     — E.164 "from" number (e.g. +12025550123)
//   TWILIO_TWIML_BASE_URL   — public HTTPS base URL Twilio can reach
//                             (dev: an ngrok/cloudflare tunnel URL,
//                              prod: your deployed APP_URL)
//   TWILIO_RECORD_CALLS     — "true" to record every live call
// ============================================

import * as twilio from "twilio";
import { AgentVoiceId, AgentLanguage, AgentCallObjective } from "../../src/types";

export type LiveCallType = "outbound-followup" | "outbound-sales" | "outbound-cart-recovery";

export interface TwilioCallContext {
  /** E.164 destination phone number for outbound dialing */
  to: string;
  customer: string;
  agent: string;
  business: string;
  orderId?: string;
  productName?: string;
  orderStatus?: string;
  opener?: string;
  closing?: string;
  tone: "friendly" | "professional" | "warm" | "confident";
  language: AgentLanguage;
  voice: AgentVoiceId;
  objective: AgentCallObjective;
  humanTouch: boolean;
  repeatEnabled: boolean;
  record: boolean;
  type: LiveCallType;
  /** When true, the call runs as a live AI conversation (Media Streams -> Gemini Live). */
  conversational?: boolean;
}

export interface TwilioConfigStatus {
  configured: boolean;
  fromNumber: string | null;
  twimlBaseUrl: string | null;
  record: boolean;
}

export interface PlacedCall {
  callSid: string;
  status: string;
  to: string;
}

export interface TwiMLResult {
  twiml: string;
  lines: string[];
}

const VOICE = "Polly.Joanna";

const POLLY_VOICE: Record<AgentVoiceId, string> = {
  kore: "Polly.Joanna",
  aria: "Polly.Joanna",
  leda: "Polly.Salli",
  aoede: "Polly.Salli",
  puck: "Polly.Joey",
  zephyr: "Polly.Matthew",
  charon: "Polly.Brian",
  fenrir: "Polly.Daniel",
};

const TONE_GREET: Record<TwilioCallContext["tone"], (name: string) => string> = {
  friendly: (n) => `Hey ${n}!`,
  professional: (n) => `Good day, ${n}.`,
  warm: (n) => `Hello, ${n}, how are you today?`,
  confident: (n) => `Hi ${n}!`,
};

const TONE_CLOSE: Record<TwilioCallContext["tone"], (name: string) => string> = {
  friendly: (n) => `Take care, ${n}, and talk soon!`,
  professional: (n) => `Thank you for your time, ${n}. Goodbye.`,
  warm: (n) => `God bless you, ${n}. Take care.`,
  confident: (n) => `Talk soon, ${n}!`,
};

// ─── Config & client ─────────────────────────────────────────────────────────

export function getTwilioConfigStatus(): TwilioConfigStatus {
  return {
    configured: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER,
    ),
    fromNumber: process.env.TWILIO_PHONE_NUMBER ?? null,
    twimlBaseUrl: process.env.TWILIO_TWIML_BASE_URL || process.env.APP_URL || null,
    record: process.env.TWILIO_RECORD_CALLS === "true",
  };
}

/** Live calling is possible only when credentials AND a public TwiML URL exist. */
export function isLiveReady(): boolean {
  const s = getTwilioConfigStatus();
  return Boolean(s.configured && s.fromNumber && s.twimlBaseUrl);
}

let client: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio | null {
  if (!isLiveReady()) return null;
  if (!client) {
    client = new twilio.Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
  }
  return client;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function say(resp: twilio.twiml.VoiceResponse, text: string, lines: string[], voice?: string) {
  resp.say({ voice: (voice || VOICE) as any, language: "en-GB" }, text);
  lines.push(text);
}

function sayPause(resp: twilio.twiml.VoiceResponse, text: string, lines: string[], voice?: string) {
  say(resp, text, lines, voice);
  resp.pause({ length: 1 });
}

function ctxParams(ctx: TwilioCallContext): Record<string, string> {
  const params: Record<string, string> = {
    customer: ctx.customer,
    agent: ctx.agent,
    business: ctx.business,
    tone: ctx.tone,
    language: ctx.language,
    voice: ctx.voice,
    objective: ctx.objective,
    human: String(ctx.humanTouch),
    repeat: String(ctx.repeatEnabled),
    record: String(ctx.record),
    type: ctx.type,
    live: String(ctx.conversational === true),
  };
  if (ctx.orderId) params.order = ctx.orderId;
  if (ctx.productName) params.product = ctx.productName;
  if (ctx.orderStatus) params.status = ctx.orderStatus;
  if (ctx.opener) params.opener = ctx.opener;
  if (ctx.closing) params.close = ctx.closing;
  return params;
}

function buildQuery(ctx: TwilioCallContext): string {
  return new URLSearchParams(ctxParams(ctx)).toString();
}

function greetFor(ctx: TwilioCallContext): string {
  const base = TONE_GREET[ctx.tone](ctx.customer);
  if (ctx.language === "sw") return `Habari, ${ctx.customer}!`;
  if (ctx.language === "mixed") return Math.random() > 0.5 ? `Habari, ${ctx.customer}!` : base;
  return base;
}

function closeFor(ctx: TwilioCallContext): string {
  if (ctx.closing) return fill(ctx.closing, { customer: ctx.customer, agent: ctx.agent, business: ctx.business, order: ctx.orderId ?? "your order" });
  if (ctx.language === "sw" || ctx.language === "mixed") {
    return `Asante sana, ${ctx.customer}. Karibu tena!`;
  }
  return TONE_CLOSE[ctx.tone](ctx.customer);
}

function filler(ctx: TwilioCallContext): string {
  if (!ctx.humanTouch) return "";
  if (ctx.language === "sw") return " Sekunde moja.";
  if (ctx.language === "mixed" && Math.random() > 0.5) return " Sekunde moja.";
  return " Just a moment.";
}

function openerFor(ctx: TwilioCallContext): string {
  const greet = greetFor(ctx);
  if (!ctx.opener) {
    const defaults: Record<string, string> = {
      inform: `${greet} I'm calling about your recent order${ctx.orderId ? ` ${ctx.orderId}` : ""} — just a quick update.`,
      "close-sale": `${greet} This is ${ctx.agent} from ${ctx.business}. We have something special for you today.`,
      "schedule-followup": `${greet} This is ${ctx.agent} from ${ctx.business}. When would be a good time to call back?`,
      "collect-details": `${greet} This is ${ctx.agent} from ${ctx.business}. I just need a couple of details to finalize your order.`,
      survey: `${greet} This is ${ctx.agent} from ${ctx.business}. Would you mind a quick two-question survey?`,
    };
    return defaults[ctx.objective] ?? `${greet} This is ${ctx.agent} from ${ctx.business}.`;
  }
  return fill(ctx.opener, { customer: ctx.customer, agent: ctx.agent, business: ctx.business, order: ctx.orderId ?? "your order" });
}

// ─── TwiML builders ──────────────────────────────────────────────────────────

/**
 * Builds the conversational TwiML for an outbound call.
 * Pass `digits` to serve the in-call DTMF choice branch, otherwise
 * the initial opening script (with a <Gather> to capture choices).
 */
export function buildOutboundTwiml(ctx: TwilioCallContext, digits?: string): TwiMLResult {
  const base = getTwilioConfigStatus().twimlBaseUrl ?? "";
  const query = buildQuery(ctx);
  const endpoint = `${base}/api/twilio/twiml?${query}`;
  const resp = new twilio.twiml.VoiceResponse();
  const lines: string[] = [];
  const voice = POLLY_VOICE[ctx.voice] || VOICE;

  if (digits) {
    let text = "Thank you. Goodbye.";
    if (digits === "1") {
      text =
        ctx.objective === "close-sale"
          ? "Excellent! Your order has been placed, and your loyalty points have been added. " + closeFor(ctx)
          : ctx.objective === "schedule-followup"
            ? "I have booked a callback for you. " + closeFor(ctx)
            : ctx.objective === "collect-details"
              ? "Your delivery details are confirmed. " + closeFor(ctx)
              : ctx.objective === "survey"
                ? "Thank you for your feedback. " + closeFor(ctx)
                : "A detailed summary has been sent to your phone. " + closeFor(ctx);
    } else if (digits === "2") {
      text = "Our shop team will call you back shortly. " + closeFor(ctx);
    } else {
      text = "We did not catch that. A summary has been sent to your phone. " + closeFor(ctx);
    }
    say(resp, text, lines, voice);
    return { twiml: resp.toString(), lines };
  }

  sayPause(resp, openerFor(ctx), lines, voice);

  if (ctx.objective === "close-sale") {
    say(
      resp,
      `We just launched a new selection of premium fashion with member pricing, and your loyalty tier gives you an extra discount today.${filler(ctx)} Press 1 to place an order now, or press 2 to request a call back from the shop.`,
      lines,
      voice,
    );
    const g = resp.gather({ numDigits: 1, action: endpoint, method: "POST", timeout: 5, finishOnKey: "#" });
    g.pause({ length: 2 });
    say(resp, "We'll send the catalog to your phone. " + closeFor(ctx), lines, voice);
    return { twiml: resp.toString(), lines };
  }

  if (ctx.objective === "schedule-followup") {
    say(resp, `Press 1 to book a callback, or press 2 to speak with the shop team.${filler(ctx)}`, lines, voice);
    const g = resp.gather({ numDigits: 1, action: endpoint, method: "POST", timeout: 5, finishOnKey: "#" });
    g.pause({ length: 2 });
    say(resp, "Our team will be in touch shortly. " + closeFor(ctx), lines, voice);
    return { twiml: resp.toString(), lines };
  }

  if (ctx.objective === "collect-details") {
    say(resp, `Press 1 to confirm your delivery details, or press 2 to speak with the shop.${filler(ctx)}`, lines, voice);
    const g = resp.gather({ numDigits: 1, action: endpoint, method: "POST", timeout: 5, finishOnKey: "#" });
    g.pause({ length: 2 });
    say(resp, "We'll confirm your details shortly. " + closeFor(ctx), lines, voice);
    return { twiml: resp.toString(), lines };
  }

  if (ctx.objective === "survey") {
    say(resp, `On a scale of one to ten, how happy are you with your last order? Press 1 if you're satisfied, or press 2 if anything was wrong.${filler(ctx)}`, lines, voice);
    const g = resp.gather({ numDigits: 1, action: endpoint, method: "POST", timeout: 5, finishOnKey: "#" });
    g.pause({ length: 2 });
    say(resp, "Thank you for your feedback. " + closeFor(ctx), lines, voice);
    return { twiml: resp.toString(), lines };
  }

  // inform (default) — status update flow
  say(
    resp,
    `Your order ${ctx.orderId ?? ""}${ctx.productName ? ` for ${ctx.productName}` : ""} is ${ctx.orderStatus ?? "on its way"}.${filler(ctx)}`,
    lines,
    voice,
  );

  if (ctx.repeatEnabled) {
    say(resp, "Press 1 to repeat your last order. Press 2 to request a call back from the shop.", lines, voice);
    const g = resp.gather({ numDigits: 1, action: endpoint, method: "POST", timeout: 5, finishOnKey: "#" });
    g.pause({ length: 2 });
  }
  say(resp, "A summary of your order has been sent to your phone. " + closeFor(ctx), lines, voice);

  return { twiml: resp.toString(), lines };
}

/**
 * Builds the TwiML for an inbound (customer-dialed) call. Pass `digits`
 * to serve the DTMF choice branch, otherwise the greeting menu.
 */
export function buildInboundTwiml(ctx: TwilioCallContext, digits?: string): TwiMLResult {
  const base = getTwilioConfigStatus().twimlBaseUrl ?? "";
  const resp = new twilio.twiml.VoiceResponse();
  const lines: string[] = [];
  const voice = POLLY_VOICE[ctx.voice] || VOICE;

  if (digits) {
    let text = "Thank you. Goodbye.";
    if (digits === "1") {
      text =
        ctx.objective === "close-sale"
          ? "Wonderful! Your order has been placed. " + closeFor(ctx)
          : "Your order is on track. A detailed status update is being sent to your phone. " + closeFor(ctx);
    } else if (digits === "2") {
      text = ctx.repeatEnabled
        ? `Of course. Your repeat order has been placed and loyalty points were added. ${closeFor(ctx)}`
        : "Of course, I'm happy to help. " + closeFor(ctx);
    } else if (digits === "3") {
      text = "The shop team has been notified and will call you back shortly. " + closeFor(ctx);
    }
    say(resp, text, lines, voice);
    return { twiml: resp.toString(), lines };
  }

  sayPause(
    resp,
    `Thank you for calling ${ctx.business}. You have reached ${ctx.agent}, your AI sales assistant.`,
    lines,
    voice,
  );
  say(
    resp,
    "Press 1 to check your order status. Press 2 to place or repeat an order. Press 3 to speak with the shop team.",
    lines,
    voice,
  );
  const query = buildQuery(ctx);
  const g = resp.gather({
    numDigits: 1,
    action: `${base}/api/twilio/inbound?${query}`,
    method: "POST",
    timeout: 6,
    finishOnKey: "#",
  });
  g.pause({ length: 2 });
  say(resp, "We did not catch that. Our team will reach out to you shortly. " + closeFor(ctx), lines, voice);

  return { twiml: resp.toString(), lines };
}

// ─── Live conversational calling (Media Streams -> Gemini Live) ────────────

/**
 * Builds the TwiML that tells Twilio to open a bidirectional Media Streams
 * WebSocket. The bridge at /api/twilio/media-stream turns the stream into a
 * live Gemini conversation with full context about this specific call.
 */
export function buildConversationalTwiml(ctx: TwilioCallContext): TwiMLResult {
  const base = (getTwilioConfigStatus().twimlBaseUrl ?? "").replace(/\/+$/, "");
  const query = buildQuery(ctx);
  const streamUrl = `wss://${base.replace(/^https?:\/\//, "")}/api/twilio/media-stream?${query}`;

  const resp = new twilio.twiml.VoiceResponse();
  const voice = POLLY_VOICE[ctx.voice] || VOICE;
  const lines: string[] = [];

  // A quick hold line so the caller immediately hears something real while
  // the Gemini Live session opens (audio takes a moment to arrive).
  say(
    resp,
    `Thank you for calling ${ctx.business}. Please hold while I connect you to ${ctx.agent}.`,
    lines,
    voice,
  );

  // Full-duplex media stream bridged to Gemini Live. If the bridge closes
  // (e.g. Gemini is unavailable), Twilio runs the <Say> below so the caller
  // always gets a human-sounding answer instead of dead air.
  resp.connect().stream({ url: streamUrl, track: "inbound_track" });
  say(
    resp,
    "I'm sorry, our assistant is temporarily unavailable. Our team will call you back shortly. Have a great day.",
    lines,
    voice,
  );

  if (ctx.opener) {
    lines.push(fill(ctx.opener, { customer: ctx.customer, agent: ctx.agent, business: ctx.business, order: ctx.orderId ?? "your order" }));
  } else {
    lines.push(openerFor(ctx));
  }

  return { twiml: resp.toString(), lines };
}

// ─── Outbound dialing ────────────────────────────────────────────────────────

/**
 * Places a real outbound call via the Twilio Voice API. Twilio fetches
 * the TwiML for the call from the public webhook endpoint and streams
 * call status updates back to /api/twilio/status.
 */
export async function placeOutboundCall(ctx: TwilioCallContext): Promise<PlacedCall> {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER and TWILIO_TWIML_BASE_URL.");
  }
  const { fromNumber, twimlBaseUrl } = getTwilioConfigStatus();
  const query = buildQuery(ctx);
  const url = `${twimlBaseUrl}/api/twilio/twiml?${query}`;
  const statusCallback = `${twimlBaseUrl}/api/twilio/status`;

  const call = await client.calls.create({
    to: ctx.to,
    from: fromNumber!,
    url,
    statusCallback,
    statusCallbackMethod: "POST",
    record: ctx.record,
  });

  return { callSid: call.sid, status: call.status, to: String(call.to) };
}
