// ============================================
// Amani — Live Conversational Call Bridge.
//
// Bridges real-time audio to the Gemini Live API (real-time, bidirectional
// audio). Two call paths share this module:
//
//   1. Twilio Media Streams (G.711 μ-law audio over WebSocket):
//        caller audio -> μ-law 8kHz -> PCM16 16kHz -> Gemini Live
//        Gemini Live  -> PCM16 24kHz -> μ-law 8kHz   -> caller audio
//
//   2. In-app live voice (browser -> /api/agent-live WebSocket):
//        browser mic -> PCM16 16kHz -> Gemini Live
//        Gemini Live -> PCM16 24kHz -> PCM16 16kHz  -> browser speaker
//
// The AI persona (name, tone, language, objective, order context, opening
// and closing lines) is built from the same AIAgentConfig used across the
// app and injected as the Live API system instruction.
// ============================================

import { GoogleGenAI, Modality } from "@google/genai";
import type { WebSocket } from "ws";
import type { TwilioCallContext } from "./twilio-client";
import {
  createResampler,
  decodePcm16Base64,
  pcm16ToUlaw,
  ulawToPcm16,
} from "./live-audio";

export const GEMINI_LIVE_MODEL =
  process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";

const GEMINI_LIVE_VOICE: Record<string, string> = {
  kore: "Kore",
  aria: "Aria",
  leda: "Leda",
  aoede: "Aoede",
  puck: "Puck",
  zephyr: "Zephyr",
  charon: "Charon",
  fenrir: "Fenrir",
};

/** Live conversational calling requires Twilio AND the Gemini API key. */
export function isLiveConversationReady(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      (process.env.TWILIO_TWIML_BASE_URL || process.env.APP_URL) &&
      process.env.GEMINI_API_KEY,
  );
}

/** True when Gemini Live itself is usable (Gemini key present). */
export function isGeminiLiveReady(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export interface MediaStreamCallbacks {
  /** Agent (output) transcription or customer (input) transcription, as text. */
  onTranscription?: (role: "agent" | "customer", text: string, partial: boolean) => void;
}

const LANGUAGE_RULES: Record<TwilioCallContext["language"], string> = {
  en: "Speak English. If the customer speaks Swahili, answer them in Swahili.",
  sw: "Speak Swahili naturally, the way an East African business person would.",
  mixed:
    "You naturally mix English and Swahili the way East African business people do. Mirror the language the customer uses.",
};

const OBJECTIVE_RULES: Record<string, string> = {
  inform:
    "Goal: give the customer a clear, natural update about their order and answer any questions they have about it. " +
    "Check whether they need anything else before ending.",
  "close-sale":
    "Goal: introduce the offer conversationally and try to close the sale. Handle objections politely and without pressure. " +
    "Only confirm an order if the customer clearly agrees — never invent their consent.",
  "schedule-followup":
    "Goal: agree on a good time for a follow-up call and confirm it clearly before ending.",
  "collect-details":
    "Goal: politely collect or confirm the delivery/payment details needed to finalize the order.",
  survey:
    "Goal: ask for brief, genuine feedback about their last order. Keep it short and never scripted.",
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

/**
 * Builds the persona + context system instruction that makes the AI respond
 * specifically to THIS conversation (the customer, their order, the objective)
 * rather than reading a generic script.
 */
export function buildLiveSystemInstruction(
  ctx: TwilioCallContext,
  extra?: Record<string, string>,
): string {
  const objective = OBJECTIVE_RULES[ctx.objective] ?? OBJECTIVE_RULES.inform;
  const vars: Record<string, string> = {
    customer: ctx.customer,
    agent: ctx.agent,
    business: ctx.business,
    order: ctx.orderId ?? "your order",
    product: ctx.productName ?? "",
    status: ctx.orderStatus ?? "",
    ...extra,
  };
  const opener = ctx.opener
    ? `Open the call with: "${fill(ctx.opener, vars)}"`
    : `Open the call with a natural greeting to ${ctx.customer}.`;
  const closing = ctx.closing ? fill(ctx.closing, vars) : "Thank you, take care!";

  return [
    `You are ${ctx.agent}, a ${ctx.tone} AI sales assistant for ${ctx.business}, speaking on a real phone call with ${ctx.customer}.`,
    "",
    "Behave exactly like a skilled human secretary on the phone — not like an automated voice menu:",
    "- Listen to what the customer actually says and respond to THAT. Answer the specific thing they ask about.",
    "- Keep every reply short and conversational (one to three sentences). Never read from a script.",
    "- If the customer asks about something you do not know, say honestly that a staff member will look into it and call back. Never invent facts, prices, or dates.",
    "- If the customer asks to speak to a human or the shop team, say the team has been notified and will call them back shortly, then end warmly.",
    "- If the customer starts speaking while you are talking, stop talking and listen to them.",
    "",
    objective,
    opener,
    "",
    `When the conversation reaches a natural end (the customer says goodbye, the goal is achieved, or the customer clearly has nothing more), say a short closing like: "${closing}" and end the call.`,
    "",
    `Language: ${LANGUAGE_RULES[ctx.language] || LANGUAGE_RULES.en}`,
    ctx.humanTouch
      ? "Use small natural human touches — brief acknowledgements, light politeness — but never overdo it."
      : "Keep it concise and professional.",
    "",
    `Call context — order ${ctx.orderId ? `#${ctx.orderId}` : "unknown"}${ctx.productName ? ` for ${ctx.productName}` : ""}${ctx.orderStatus ? `, current status: ${ctx.orderStatus}` : ""}.`,
  ].join("\n");
}

interface TwilioMediaEvent {
  event: string;
  streamSid?: string;
  start?: {
    streamSid?: string;
    callSid?: string;
    from?: string;
    to?: string;
  };
  media?: { payload?: string };
}

/**
 * A live Gemini session opened to a stable handle decoupled from the
 * transport (Twilio vs browser WebSocket).
 */
export interface LiveSessionHandle {
  /** Send caller/mic audio as 16-bit little-endian PCM at 16kHz. */
  sendAudio16k(data: Buffer): void;
  /** Send a textual user turn (priming, barge-in text, silent fallback). */
  sendUserText(text: string): void;
  close(): void;
}

export interface LiveSessionHandlers {
  /** Gemini output audio — 16-bit little-endian PCM at 24kHz. */
  onAudioPcm24k?: (pcm24k: Int16Array) => void;
  onAgentText?: (text: string, partial: boolean) => void;
  onCustomerText?: (text: string, partial: boolean) => void;
  /** Caller spoke over the AI — cancel queued output playback. */
  onInterrupted?: () => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

/**
 * Opens a Gemini Live audio session configured for the given call context.
 * Shared by the Twilio media-stream handler and the in-app browser bridge so
 * both paths get identical behavior and the same persona.
 */
export async function openGeminiLive(
  gemini: GoogleGenAI,
  ctx: TwilioCallContext,
  handlers: LiveSessionHandlers,
): Promise<LiveSessionHandle | null> {
  let session: any = null;
  let closed = false;

  const onGeminiMessage = (msg: any) => {
    if (closed) return;
    const sc = msg?.serverContent;
    if (!sc) return;

    // Caller spoke over the AI — stop playback and clear what we queued.
    if (sc.interrupted) {
      handlers.onInterrupted?.();
      return;
    }

    // Gemini output audio lives under serverContent.modelTurn.parts[].
    const turn = sc.modelTurn;
    if (turn?.parts) {
      for (const part of turn.parts) {
        const inline = part?.inlineData;
        if (inline?.data) {
          try {
            const pcm24k = decodePcm16Base64(inline.data);
            if (pcm24k.length > 0) handlers.onAudioPcm24k?.(pcm24k);
          } catch (err) {
            console.error("[media-stream] Audio decode error:", err);
          }
        }
      }
    }

    const agentText = sc.outputTranscription?.text;
    if (agentText) handlers.onAgentText?.(agentText, !sc.turnComplete);
    const customerText = sc.interimInputTranscription?.text;
    if (customerText) handlers.onCustomerText?.(customerText, true);
  };

  try {
    const liveSession = await gemini.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: [{ text: buildLiveSystemInstruction(ctx) }],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: GEMINI_LIVE_VOICE[ctx.voice] || "Kore",
            },
          },
        },
        inputAudioTranscription: { languageAuto: {} },
        outputAudioTranscription: { languageAuto: {} },
      },
      callbacks: {
        onopen: () => console.log("[media-stream] Gemini Live session open."),
        onmessage: onGeminiMessage,
        onerror: (e: any) => {
          const message = e?.error?.message || e?.message || String(e);
          console.error("[media-stream] Gemini error:", message);
          handlers.onError?.(message);
        },
        onclose: () => {
          if (!closed) {
            try { handlers.onClose?.(); } catch { /* noop */ }
          }
        },
      },
    });

    session = liveSession as any;
    return {
      sendAudio16k(data: Buffer) {
        if (closed) return;
        try {
          session?.sendRealtimeInput?.({ audio: { data: data.toString("base64"), mimeType: "audio/pcm;rate=16000" } });
        } catch (err) {
          console.error("[media-stream] Audio forward error:", err);
        }
      },
      sendUserText(text: string) {
        if (closed) return;
        try {
          session?.sendClientContent?.({
            turns: [{ role: "user", parts: [{ text }] }],
            turnComplete: true,
          });
        } catch (err) {
          console.error("[media-stream] Text send error:", err);
        }
      },
      close() {
        closed = true;
        try {
          session?.close?.();
        } catch { /* noop */ }
      },
    };
  } catch (err) {
    console.error("[media-stream] Failed to open Gemini Live session:", err);
    handlers.onError?.(err instanceof Error ? err.message : String(err));
    return null;
  }
}

const MAX_PRE_BUFFER = 50; // ~1s of 20ms frames buffered while the session opens

/**
 * Handles one Twilio Media Streams WebSocket connection and bridges its
 * audio to a Gemini Live session for the whole call.
 */
export async function handleTwilioMediaStream(
  ws: WebSocket,
  ctx: TwilioCallContext,
  gemini: GoogleGenAI | null,
  callbacks?: MediaStreamCallbacks,
): Promise<void> {
  if (!gemini) {
    console.warn("[media-stream] No Gemini client — closing stream.");
    try { ws.close(); } catch { /* noop */ }
    return;
  }

  const upsample = createResampler(8000, 16000);
  const downsample = createResampler(24000, 8000);

  let streamSid: string | null = null;
  let closed = false;
  let sessionFailed = false;
  let session: LiveSessionHandle | null = null;
  let sessionPromise: Promise<LiveSessionHandle | null> | null = null;
  const preSessionAudio: string[] = [];

  const send = (payload: Record<string, unknown>) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  const sendMedia = (mulaw: Buffer) => {
    send({ event: "media", streamSid, media: { payload: mulaw.toString("base64") } });
  };

  const openSession = async (): Promise<LiveSessionHandle | null> => {
    if (!gemini) return null;
    const handle = await openGeminiLive(gemini, ctx, {
      onAudioPcm24k: (pcm24k) => {
        const pcm8k = downsample(pcm24k);
        if (streamSid) sendMedia(pcm16ToUlaw(pcm8k));
      },
      onInterrupted: () => {
        downsample.reset();
        send({ event: "clear", streamSid });
      },
      onAgentText: (text, partial) => callbacks?.onTranscription?.("agent", text, partial),
      onCustomerText: (text, partial) => callbacks?.onTranscription?.("customer", text, partial),
      onError: (message) => console.error("[media-stream] Gemini:", message),
    });
    if (!handle) {
      // Session never established — close the stream so Twilio serves the
      // fallback <Say> in the conversational TwiML instead of dead air.
      sessionFailed = true;
      try { ws.close(); } catch { /* noop */ }
      return null;
    }

    // Flush any caller audio captured while the session was opening.
    for (const payload of preSessionAudio.splice(0)) {
      forwardAudio(payload);
    }

    // Prime the model so it speaks first — the customer has just answered.
    handle.sendUserText(
      "[The customer just answered the phone. Open the call now — greet them and begin.]",
    );
    return handle;
  };

  const ensureSession = (): Promise<LiveSessionHandle | null> => {
    if (!sessionPromise) sessionPromise = openSession();
    return sessionPromise;
  };

  const cleanup = () => {
    if (closed) return;
    closed = true;
    try { session?.close(); } catch { /* noop */ }
    session = null;
    try {
      if (ws.readyState === ws.OPEN) ws.close();
    } catch { /* noop */ }
  };

  function forwardAudio(payload: string) {
    if (closed || !session) return;
    try {
      const mulaw = Buffer.from(payload, "base64");
      const pcm8k = ulawToPcm16(mulaw);
      const pcm16k = upsample(pcm8k);
      session.sendAudio16k(
        Buffer.from(pcm16k.buffer, pcm16k.byteOffset, pcm16k.byteLength),
      );
    } catch (err) {
      console.error("[media-stream] Audio forward error:", err);
    }
  }

  ws.on("message", (raw: Buffer) => {
    if (closed) return;
    let msg: TwilioMediaEvent;
    try {
      msg = JSON.parse(raw.toString("utf8"));
    } catch {
      return;
    }

    switch (msg.event) {
      case "start":
        streamSid = msg.start?.streamSid ?? null;
        console.log(
          `[media-stream] Call started: ${msg.start?.from ?? "?"} -> ${msg.start?.to ?? "?"} (stream ${streamSid})`,
        );
        void ensureSession();
        break;
      case "media": {
        const payload = msg.media?.payload;
        if (!payload || !streamSid) return;
        if (!session) {
          if (preSessionAudio.length < MAX_PRE_BUFFER) preSessionAudio.push(payload);
          void ensureSession();
          return;
        }
        forwardAudio(payload);
        break;
      }
      case "stop":
        console.log("[media-stream] Call ended.");
        cleanup();
        break;
      default:
        break;
    }
  });

  ws.on("close", () => cleanup());
  ws.on("error", () => cleanup());
}