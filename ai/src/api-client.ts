import { AIContext, AIResponse, generateResponse } from './intent-engine';
import { buildSystemPrompt } from './prompt-builder';
import { buildBusinessContext, buildSystemContext, getPreferredLanguage } from './core';

export type AIProvider = 'ollama' | 'gemini' | 'openai' | 'anthropic' | 'local';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  model: 'qwen3:4b',
  maxTokens: 2048,
  temperature: 0.7,
};

/**
 * Talks to the server's AI brain (/api/chat). The server talks to Ollama
 * (self-hosted Qwen3 on the VPS) / Hugging Face / Google Gemini with the
 * shop-neutral system prompt, so no key ever ships to or leaves the
 * browser. `live` is true only when the server actually answered
 * with a real provider. When `onToken` is provided the request is streamed
 * (SSE) so the page can render tokens as they arrive, like a human typing.
 */
async function callServerChat(
  messages: ChatMessage[],
  onToken?: (delta: string) => void,
): Promise<{ content: string; live: boolean; provider: string }> {
  const useStream = typeof onToken === 'function';
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: useStream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: useStream,
    }),
  });
  if (!response.ok) throw new Error(`Server AI error: ${response.status}`);
  const isSSE = (response.headers.get("content-type") || "").includes("text/event-stream");
  if (!useStream || !isSSE) {
    // Non-stream response (or provider downgraded to non-stream) — parse JSON.
    const data = await response.json();
    return {
      content: data?.text ?? '',
      live: data?.live === true,
      provider: data?.source ?? 'local',
    };
  }
  if (!response.body) throw new Error('Streaming is not supported by this browser');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let provider = 'server';
  let lastEvent = 'message';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        if (line.startsWith('event:')) {
          lastEvent = line.slice(6).trim();
          continue;
        }
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let j: any = null;
        try { j = JSON.parse(payload); } catch { continue; }
        if (lastEvent === 'meta') {
          provider = j?.source ?? provider;
        } else if (lastEvent === 'error') {
          throw new Error(j?.error || 'Server stream failed');
        } else {
          const delta = j?.delta ?? j?.content ?? '';
          if (delta) {
            content += delta;
            onToken(delta);
          }
        }
        lastEvent = 'message';
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { content, live: content.length > 0, provider };
}

async function callOpenAI(messages: ChatMessage[], config: AIConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o',
      messages,
      max_tokens: config.maxTokens || 2048,
      temperature: config.temperature || 0.7,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(messages: ChatMessage[], config: AIConfig): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${config.baseUrl || 'https://api.anthropic.com/v1'}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens || 2048,
      system: systemMsg?.content || '',
      messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

async function callLocal(query: string, context: AIContext): Promise<AIResponse> {
  return generateResponse(query, context);
}

let currentConfig: AIConfig = { ...DEFAULT_CONFIG };

export function configureAI(config: Partial<AIConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getAIConfig(): AIConfig {
  return { ...currentConfig };
}

export async function chatWithAI(
  query: string,
  context: AIContext,
  onToken?: (delta: string) => void,
): Promise<AIResponse> {
  // Ground every reply in the ONE intelligence core — the AI can never be
  // generic because it always sees the live business numbers.
  const grounded: AIContext = {
    ...context,
    businessIntel: context.businessIntel ?? buildSystemContext(buildBusinessContext()),
    language: context.language ?? getPreferredLanguage(),
  };
  const systemPrompt = buildSystemPrompt(grounded);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: query },
  ];

  try {
    // 1. Server AI brain (Hugging Face / Ollama on the VPS / Gemini) — recommended. Keys live on the server.
    if (currentConfig.provider === 'ollama' || currentConfig.provider === 'gemini') {
      const { content, live, provider } = await callServerChat(messages, onToken);
      if (live && content) {
        return {
          content,
          confidence: 0.95,
          sources: [provider === 'ollama' ? 'Ollama Qwen3 (VPS)' : provider === 'huggingface' ? 'Hugging Face (server)' : 'Gemini (server)'],
          suggestedFollowUps: [],
          intent: 'api_response',
        };
      }
    }

    if (currentConfig.provider === 'openai' && currentConfig.apiKey) {
      const content = await callOpenAI(messages, currentConfig);
      return {
        content,
        confidence: 0.95,
        sources: ['OpenAI API'],
        suggestedFollowUps: [],
        intent: 'api_response',
      };
    }

    if (currentConfig.provider === 'anthropic' && currentConfig.apiKey) {
      const content = await callAnthropic(messages, currentConfig);
      return {
        content,
        confidence: 0.95,
        sources: ['Anthropic API'],
        suggestedFollowUps: [],
        intent: 'api_response',
      };
    }
  } catch (error) {
    console.warn('API call failed, falling back to local engine:', error);
  }

  return callLocal(query, context);
}

export function isAPIConfigured(): boolean {
  return currentConfig.provider === 'ollama' || currentConfig.provider === 'gemini' || (currentConfig.provider !== 'local' && !!currentConfig.apiKey);
}

// ── Free public assistant (guests + members, no business-data access) ───────
// The floating assistant on the public site. Answers platform/shopping Q&A,
// never touches a user's business data, and guides every actionable request
// toward creating an account / upgrading to the relevant BirichiNex tier.

const FREE_SYSTEM_PROMPT = `You are Amani — BirichiNex's smart free assistant, available to everyone on the public site. Greet briefly, then get straight to value. No filler, no clichés.

MODE: FREE PUBLIC ASSISTANT
- You have NO access to any user's business data. Never claim to see their inventory, sales, wallet, customers, documents or orders.
- Cover confidently: what BirichiNex is; shopping (browse, cart, checkout, order tracking, delivery to Dar es Salaam / Nairobi / Kampala and East Africa); Shopper vs Business mode; membership tiers (Starter Free, Silver, Gold, Platinum) and what each unlocks (the Amani AI Sales Agent who calls + follows up with customers, dropshipping with global suppliers, analytics, automation, procurement, logistics, documents, finance); and general guidance on selling smarter in East Africa.

RULES
- If the visitor asks for something that needs a BirichiNex ACCOUNT or a PAID TIER — reading their own data, real AI phone calls, automated follow-ups, deep analysis of their business, dropshipping subscriptions, automation — never fake it. Explain it in one or two natural sentences, then tell them exactly which plan unlocks it and invite them to create a free account (which unlocks Amani's deeper capabilities) or upgrade.
- END every reply with a single short, genuine line on how BirichiNex can help them grow further. Never repetitive and never pushy.
- Be concise (under ~140 words unless asked), warm and sharp. Mirror the visitor's language — reply in Kiswahili if they write Kiswahili, French if French, etc.
- Never invent prices, features or delivery quotes you are not sure about. Direct them to the app's shop, membership and payments screens instead.`;

function freeLocalReply(query: string): string {
  const q = query.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  if (has("hello", "hi", "hey", "jambo", "mambo", "habari", "halo", "salut", "bonjour")) {
    return `Hello! I'm Amani, your free BirichiNex assistant. I can walk you through shopping, delivery and order tracking — or show you how to turn your small business into a full online store with AI-driven follow-ups. What would you like to know?\n\nBirichiNex is here to help you move from "thinking about it" to selling every day.`;
  }
  if (has("deliver", "shipping", "ship", "courier", "dar es salaam", "nairobi", "kampala", "track")) {
    return `Every order gets a tracking number (like PM-TRK-...) and a full delivery map from Dar es Salaam to East African cities like Nairobi and Kampala. You can follow it live in the Orders tab. Delivery in Dar es Salaam is free on orders over 500,000 TZS.\n\nWant faster, more profitable delivery? The Logistics module plans smarter routes across all your orders — it's part of the business side of BirichiNex.`;
  }
  if (has("tier", "plan", "price", "pricing", "subscribe", "membership", "upgrade", "silver", "gold", "platinum", "subscription", "premium")) {
    return `Shopping is completely free — no subscription needed to buy. The paid side powers your business: Silver, Gold and Platinum tiers unlock the Amani AI Sales Agent (real customer calls + follow-ups), dropshipping, analytics, automation, procurement and more.\n\nYou can always start on the free Starter tier and upgrade the moment you need one of those tools — your data stays with you.`;
  }
  if (has("ai", "aman", "call my", "follow", "customer", "agent")) {
    return `The Amani AI Sales Agent is BirichiNex's smartest feature: it calls your customers in real time, answers questions about your products, and runs automatic follow-ups to recover missed calls and unpaid orders. That part needs an account on a paid tier.\n\nIn the free assistant, I'm here to answer your questions right now — create a free account and Amani will start working on your business with you.`;
  }
  if (has("dropship", "import", "supplier", "china", "procure", "wholesale")) {
    return `BirichiNex dropshipping lets you list global suppliers' products on your storefront and fulfil orders without holding stock. Dropshipping subscriptions are part of the paid business tiers.\n\nYour shop itself is free to set up — so you can start listing what you already sell today and add global sourcing when you upgrade.`;
  }
  if (has("sell", "business", "shop", "store", "start", "entrepreneur", "founder", "inventory", "profit")) {
    return `BirichiNex runs on the Five Laws: sell through proven channels, fund growth through cash flow, and build a shop that sells while you sleep. You can list products, set prices above cost, and publish a storefront right from your account.\n\nStart free as a shopper, and when you're ready to sell, the business mode walks you through your first inventory in minutes.`;
  }
  if (has("buy", "shop", "cart", "order", "checkout", "wallet", "pay", "mpesa")) {
    return `Shopping takes minutes: browse the shop, add to cart, check out with M-Pesa, Airtel Money, your BirichiNex wallet, card or cash on delivery. No login needed if you're just buying — you only create an account when you want a business tool.\n\nCreate a free account after an order to keep your history and earn loyalty points and cashback.`;
  }
  return `I'm Amani, BirichiNex's free assistant. I help with shopping, delivery and order tracking here on the free site — and the business side of BirichiNex (AI sales calls, follow-ups, dropshipping, analytics) unlocks through a free account and tier upgrade.\n\nWhat are you trying to do? Tell me and I'll point you to the fastest path.`;
}

/**
 * Free-tier public assistant: same server brain as the advisor, but with a
 * strict public-mode system prompt that never reads business data and always
 * steers actionable requests toward account creation / tier upgrades.
 */
export async function chatFree(
  query: string,
  history: ChatMessage[],
  onToken?: (delta: string) => void,
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    { role: 'system', content: FREE_SYSTEM_PROMPT },
    ...history.slice(-8),
    { role: 'user', content: query },
  ];

  try {
    if (currentConfig.provider === 'ollama' || currentConfig.provider === 'gemini') {
      const { content, live, provider } = await callServerChat(messages, onToken);
      if (live && content) {
        return {
          content,
          confidence: 0.9,
          sources: [`${provider} (server)`],
          suggestedFollowUps: [],
          intent: 'api_response',
        };
      }
    }
    if (currentConfig.provider === 'openai' && currentConfig.apiKey) {
      const content = await callOpenAI(messages, currentConfig);
      return { content, confidence: 0.9, sources: ['OpenAI API'], suggestedFollowUps: [], intent: 'api_response' };
    }
    if (currentConfig.provider === 'anthropic' && currentConfig.apiKey) {
      const content = await callAnthropic(messages, currentConfig);
      return { content, confidence: 0.9, sources: ['Anthropic API'], suggestedFollowUps: [], intent: 'api_response' };
    }
  } catch (error) {
    console.warn('Free assistant API call failed, falling back to local reply:', error);
  }

  return {
    content: freeLocalReply(query),
    confidence: 0.6,
    sources: ['local'],
    suggestedFollowUps: [],
    intent: 'api_response',
  };
}

export interface ServerAIMode {
  live: boolean;
}

/**
 * Reports whether the server has a live AI brain configured server-side.
 */
export async function checkServerAIMode(): Promise<ServerAIMode> {
  const empty: ServerAIMode = { live: false };
  try {
    const res = await fetch('/api/ai/mode');
    if (!res.ok) return empty;
    const data = await res.json();
    return { live: Boolean(data?.live) };
  } catch {
    return empty;
  }
}
