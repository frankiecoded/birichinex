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
 * Portmetals pricing/identity system prompt, so no key ever ships to (or
 * leaves) the browser. `live` is true only when the server actually answered
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

export interface ServerAIMode {
  live: boolean;
  provider: string;
  model: string;
  ollama: boolean;
  gemini: boolean;
  huggingface: boolean;
  label: string;
}

/**
 * Reports whether the server has a live AI brain configured (Hugging Face,
 * Ollama on the VPS, or a GEMINI_API_KEY set server-side).
 */
export async function checkServerAIMode(): Promise<ServerAIMode> {
  const empty: ServerAIMode = { live: false, provider: 'local', model: 'local', ollama: false, gemini: false, huggingface: false, label: 'Local simulation' };
  try {
    const res = await fetch('/api/ai/mode');
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      live: Boolean(data?.live),
      provider: String(data?.provider ?? 'local'),
      model: String(data?.model ?? 'local'),
      ollama: Boolean(data?.ollama),
      gemini: Boolean(data?.gemini),
      huggingface: Boolean(data?.huggingface),
      label: String(data?.label ?? 'Local simulation'),
    };
  } catch {
    return empty;
  }
}
