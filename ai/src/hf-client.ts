/**
 * Hugging Face Inference Providers — OpenAI-compatible chat.
 *
 * Talks to the unified HF router endpoint (https://router.huggingface.co/v1),
 * which routes to the best available GPU host (Groq, Novita, Nvidia, …) for
 * the requested model. Requires a HF Access Token with Inference enabled:
 *   https://huggingface.co/settings/tokens
 *
 * Server-only module — never import from browser code.
 */

export interface HFChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface HFChatOptions {
  temperature?: number;
  maxTokens?: number;
}

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

/** Default model — a strong, widely-available open model on HF routers. */
export const HF_MODEL =
  process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.3-70B-Instruct";

export function getHuggingFaceKey(): string {
  return (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "").trim();
}

export function hfConfigured(): boolean {
  return Boolean(getHuggingFaceKey());
}

/**
 * Runs a chat completion through Hugging Face Inference Providers.
 * Throws on transport or upstream errors so callers can fall back.
 */
export async function callHuggingFaceChat(
  messages: HFChatMessage[],
  options: HFChatOptions = {},
): Promise<{ text: string; model: string; citations: string[] }> {
  const key = getHuggingFaceKey();
  if (!key) throw new Error("Hugging Face is not configured");

  const res = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hugging Face error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    "";
  if (!text) throw new Error("Hugging Face returned an empty completion");

  return { text, model: data?.model || HF_MODEL, citations: [] };
}

/**
 * Streaming variant: calls the same OpenAI-compatible HF router with
 * `stream: true` and yields each content delta as it arrives. Used by
 * `/api/chat` to relay tokens to the client as an SSE stream so replies
 * feel like a human typing.
 */
export async function* callHuggingFaceStream(
  messages: HFChatMessage[],
  options: HFChatOptions = {},
): AsyncGenerator<string> {
  const key = getHuggingFaceKey();
  if (!key) throw new Error("Hugging Face is not configured");

  const res = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hugging Face stream error ${res.status}: ${body.slice(0, 300)}`);
  }
  if (!res.body) throw new Error("Hugging Face stream returned no body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const raw of lines) {
        const line = raw.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const chunk = JSON.parse(payload);
          const delta: string =
            chunk?.choices?.[0]?.delta?.content ??
            chunk?.choices?.[0]?.message?.content ??
            "";
          if (delta) yield delta;
        } catch {
          // Malformed keepalive/comment chunk — ignore.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
