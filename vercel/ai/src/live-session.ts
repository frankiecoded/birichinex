// ============================================
// In-app live voice session.
//
// Bridges a browser WebSocket (/api/agent-live) to a Gemini Live session.
// The browser sends 16-bit little-endian PCM at 16kHz (from the mic); the
// session streams Amani's speech back as 16-bit little-endian PCM at 24kHz,
// which this module downsamples to 16kHz for the browser to play. Unlike the
// Twilio path there is no telephone framing — it is a plain duplex audio pipe
// between the phone/desktop app and the model.
//
// Message protocol (JSON text frames):
//   client -> server:
//     { type: "start" }                          open + prime the session
//     { type: "audio", data: "<pcm16 16k b64>" }
//     { type: "stop" }                           end the conversation
//
//   server -> client:
//     { type: "audio", data: "<pcm16 16k b64>" }
//     { type: "text", role: "agent"|"customer", text, partial }
//     { type: "interrupt" }                      caller spoke over the AI
//     { type: "status", state, message? }
//     { type: "error", message }
// ============================================

import type { WebSocket } from "ws";
import type { GoogleGenAI } from "@google/genai";
import type { TwilioCallContext } from "./twilio-client";
import { openGeminiLive, type LiveSessionHandlers } from "./media-stream";
import { createResampler, decodePcm16Base64 } from "./live-audio";

const DOWN_BYTE_RATE = 16000;

function encodePcm16(samples: Int16Array): string {
  return Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength).toString("base64");
}

/**
 * Handles one /api/agent-live browser connection for the lifetime of the
 * conversation. Authentication (a short-lived signed token) is verified by
 * the caller before this runs.
 */
export function handleLiveVoiceSocket(
  ws: WebSocket,
  ctx: TwilioCallContext,
  gemini: GoogleGenAI | null,
): void {
  const send = (payload: Record<string, unknown>) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  if (!gemini) {
    send({ type: "error", message: "Gemini voice is not configured on this server." });
    try { ws.close(); } catch { /* noop */ }
    return;
  }

  const downsample = createResampler(24000, DOWN_BYTE_RATE);
  let session: Awaited<ReturnType<typeof openGeminiLive>> | null = null;
  let opening = false;
  let closed = false;

  const handlers: LiveSessionHandlers = {
    onAudioPcm24k: (pcm24k) => {
      const pcm16k = downsample(pcm24k);
      if (pcm16k.length > 0) send({ type: "audio", data: encodePcm16(pcm16k) });
    },
    onInterrupted: () => {
      downsample.reset();
      send({ type: "interrupt" });
    },
    onAgentText: (text, partial) => send({ type: "text", role: "agent", text, partial }),
    onCustomerText: (text, partial) => send({ type: "text", role: "customer", text, partial }),
    onError: (message) => send({ type: "error", message }),
    onClose: () => {
      if (closed) return;
      closed = true;
      send({ type: "status", state: "closed", message: "Conversation ended." });
      try { ws.close(); } catch { /* noop */ }
    },
  };

  const openSession = async () => {
    if (opening || session) return;
    opening = true;
    send({ type: "status", state: "connecting", message: "Connecting to Amani…" });
    const handle = await openGeminiLive(gemini, ctx, handlers);
    opening = false;
    if (closed) return;
    if (!handle) {
      send({ type: "status", state: "closed", message: "Could not reach the voice assistant." });
      try { ws.close(); } catch { /* noop */ }
      return;
    }
    session = handle;
    send({ type: "status", state: "open", message: "Connected." });
    // Prime the model so Amani greets the owner immediately.
    handle.sendUserText(
      "[The business owner just connected from the app. Greet them warmly and ask how you can help.]",
    );
  };

  ws.on("message", (raw) => {
    if (closed) return;
    let msg: { type?: string; data?: string };
    try {
      msg = JSON.parse(raw.toString("utf8"));
    } catch {
      return;
    }
    switch (msg?.type) {
      case "start":
        void openSession();
        break;
      case "audio": {
        if (!msg.data) return;
        if (!session) {
          // Cache is unnecessary — browsers stream continuously, and the
          // phrase pre-roll in openSession primes a greeting. Just drop the
          // few frames that arrive while the session is opening.
          void openSession();
          return;
        }
        try {
          const pcm16k = decodePcm16Base64(msg.data);
          if (pcm16k.length === 0) return;
          session.sendAudio16k(
            Buffer.from(pcm16k.buffer, pcm16k.byteOffset, pcm16k.byteLength),
          );
        } catch (err) {
          console.error("[live-session] Audio parse error:", err);
        }
        break;
      }
      case "stop":
        send({ type: "status", state: "ending", message: "Ending conversation…" });
        closed = true;
        try { session?.close(); } catch { /* noop */ }
        session = null;
        try { ws.close(); } catch { /* noop */ }
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    if (closed) return;
    closed = true;
    try { session?.close(); } catch { /* noop */ }
    session = null;
  });
  ws.on("error", () => {
    if (closed) return;
    closed = true;
    try { session?.close(); } catch { /* noop */ }
    session = null;
  });
}