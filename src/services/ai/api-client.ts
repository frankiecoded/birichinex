import { AIContext, AIResponse, generateResponse } from './intent-engine';
import { buildSystemPrompt } from './prompt-builder';

export type AIProvider = 'openai' | 'anthropic' | 'local';

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
  provider: 'local',
  model: 'gpt-4o',
  maxTokens: 2048,
  temperature: 0.7,
};

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

export async function chatWithAI(query: string, context: AIContext): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(context);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: query },
  ];

  try {
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
  return currentConfig.provider !== 'local' && !!currentConfig.apiKey;
}
