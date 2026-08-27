import { KNOWLEDGE_BASE, KnowledgeEntry, searchKnowledge } from './knowledge-base';

export interface UserData {
  userName: string;
  membershipTier: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  inventoryCount: number;
  transactionCount: number;
  contactCount: number;
  cartCount: number;
  currency: string;
  businessName?: string;
  industry?: string;
  growthStage?: string;
  businessHealth?: number;
  founderReadiness?: number;
  businessMaturity?: number;
  growthReadiness?: number;
  digitalReadiness?: number;
  marketplaceReadiness?: number;
}

export interface ConversationMessage {
  role: string;
  content: string;
}

export interface AIContext {
  userData?: UserData;
  conversationHistory: ConversationMessage[];
  currentPage?: string;
  currentTopic?: string;
  businessIntel?: string; // live closed-loop intelligence block from ai/src/core
  language?: string; // preferred reply language (en | sw | fr | de)
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  suggestedFollowUps: string[];
  intent: string;
}

// ── Intent Patterns ───────────────────────────────────────────────────────

interface IntentPattern {
  pattern: RegExp;
  intent: string;
  weight: number;
  category?: string;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Greetings
  { pattern: /^(hi|hello|hey|good morning|good afternoon|good evening|jambo|habari|sawa|mambo|niaje)\b/i, intent: 'greeting', weight: 10 },
  { pattern: /^(bye|goodbye|see you|later|kwaheri|tutaonana)\b/i, intent: 'farewell', weight: 10 },
  { pattern: /^(thanks|thank you|asante|shukran|cheers)\b/i, intent: 'thanks', weight: 10 },

  // How-to
  { pattern: /how (do|can|should|to|would) i\b/i, intent: 'how_to', weight: 9 },
  { pattern: /how (do|does|can) (the|this|birichinex|platform)\b/i, intent: 'platform_help', weight: 9 },
  { pattern: /can (i|you|we)\b/i, intent: 'capability_query', weight: 7 },
  { pattern: /what (is|are|does|should|i|we|can)\b/i, intent: 'information_query', weight: 8 },

  // Strategy & Advice
  { pattern: /best (way|strategy|approach|practice|price|method)\b/i, intent: 'strategy', weight: 9 },
  { pattern: /should (i|we)\b/i, intent: 'advice_request', weight: 8 },
  { pattern: /advise|advice|recommend|suggest|guide/i, intent: 'advice_request', weight: 8 },
  { pattern: /what (do you|would you) (think|recommend|suggest)\b/i, intent: 'advice_request', weight: 8 },

  // Pricing
  { pattern: /pric(e|ing)|how much|cost|charge|margin|markup|profit/i, intent: 'pricing', weight: 9, category: 'pricing' },
  { pattern: /break.?even|margin|markup|discount/i, intent: 'pricing_math', weight: 9, category: 'finance' },

  // Inventory
  { pattern: /inventory|stock|warehouse|reorder|low.?stock|out of stock/i, intent: 'inventory', weight: 9, category: 'operations' },
  { pattern: /how many (items|products|units)/i, intent: 'inventory_query', weight: 8, category: 'operations' },

  // Finance
  { pattern: /cash flow|money|revenue|profit|loss|income|expense/i, intent: 'finance', weight: 9, category: 'finance' },
  { pattern: /tax|vat|kra|tra|ura|compliance|register|license/i, intent: 'tax', weight: 9, category: 'legal' },
  { pattern: /budget|forecast|financial plan/i, intent: 'budgeting', weight: 8, category: 'finance' },
  { pattern: /invoice|bill|payment term|receivable/i, intent: 'invoicing', weight: 8, category: 'finance' },
  { pattern: /bookkeep|accounting|ledger|journal/i, intent: 'bookkeeping', weight: 8, category: 'finance' },

  // Marketing
  { pattern: /market|customer|client|sell|buyer|audience/i, intent: 'marketing', weight: 8, category: 'marketing' },
  { pattern: /instagram|social media|facebook|tiktok|content/i, intent: 'social_media', weight: 9, category: 'marketing' },
  { pattern: /whatsapp|broadcast|catalog|status/i, intent: 'whatsapp', weight: 9, category: 'marketing' },
  { pattern: /brand|logo|positioning|identity|packaging/i, intent: 'branding', weight: 8, category: 'marketing' },
  { pattern: /referral|retention|repeat|loyal|loyalty/i, intent: 'retention', weight: 8, category: 'marketing' },
  { pattern: /promot|sale|discount|flash|bundle|deal|offer/i, intent: 'promotions', weight: 8, category: 'marketing' },
  { pattern: /campaign|ads|advertising|reach|engagement/i, intent: 'advertising', weight: 8, category: 'marketing' },

  // Supply Chain
  { pattern: /supplier|sourcing|import|export|customs|shipping|logistics/i, intent: 'supply_chain', weight: 9, category: 'operations' },
  { pattern: /delivery|deliver|courier|transport|carrier/i, intent: 'logistics', weight: 8, category: 'operations' },
  { pattern: /cross.?border|international|foreign|china|india|dubai/i, intent: 'international', weight: 8, category: 'market-intelligence' },

  // Dropshipping
  { pattern: /dropship|drop.?ship|fulfill|fulfilment/i, intent: 'dropshipping', weight: 9, category: 'platform' },

  // Market Intelligence
  { pattern: /kenya|nairobi|mombasa|kisumu/i, intent: 'kenya_market', weight: 8, category: 'market-intelligence' },
  { pattern: /tanzania|dar|dodoma|arusha/i, intent: 'tanzania_market', weight: 8, category: 'market-intelligence' },
  { pattern: /uganda|kampala|jinja/i, intent: 'uganda_market', weight: 8, category: 'market-intelligence' },
  { pattern: /rwanda|kigali/i, intent: 'rwanda_market', weight: 8, category: 'market-intelligence' },
  { pattern: /competitor|competition|rival|benchmark/i, intent: 'competition', weight: 7, category: 'market-intelligence' },
  { pattern: /trend|market.?size|gdp|economy|growth/i, intent: 'market_trend', weight: 7, category: 'market-intelligence' },
  { pattern: /consumer|spend|buy|shop|purchase|demand/i, intent: 'consumer', weight: 7, category: 'market-intelligence' },

  // Operations
  { pattern: /process|workflow|automate|automat|efficien/i, intent: 'operations', weight: 7, category: 'operations' },
  { pattern: /quality|defect|inspect|standard|grade/i, intent: 'quality', weight: 7, category: 'operations' },
  { pattern: /return|refund|exchange|complaint/i, intent: 'returns', weight: 7, category: 'operations' },
  { pattern: /negotiat|bargain|haggle|deal|terms/i, intent: 'negotiation', weight: 8, category: 'advisory' },

  // Growth & Investment
  { pattern: /grow|scale|expand|accelerat|hack/i, intent: 'growth', weight: 8, category: 'advisory' },
  { pattern: /invest|fund|raise|capital|pitch|investor/i, intent: 'investment', weight: 8, category: 'advisory' },
  { pattern: /risk|protect|insur|fraud|secure/i, intent: 'risk', weight: 7, category: 'advisory' },

  // Platform features
  { pattern: /membership|tier|subscribe|plan|upgrade/i, intent: 'membership', weight: 8, category: 'platform' },
  { pattern: /loyalty|points|earn|redeem|reward/i, intent: 'loyalty', weight: 8, category: 'platform' },
  { pattern: /CRM|contact|lead|pipeline|relationship/i, intent: 'crm', weight: 8, category: 'platform' },
  { pattern: /analytics|data|report|dashboard|KPI|metric/i, intent: 'analytics', weight: 7, category: 'platform' },
  { pattern: /course|learn|train|educat|lesson|academy/i, intent: 'learning', weight: 7, category: 'platform' },
  { pattern: /order|track|trackin|delivery status/i, intent: 'tracking', weight: 8, category: 'platform' },
  { pattern: /bale|mitumba|secondhand|wholesale/i, intent: 'wholesale', weight: 9, category: 'advisory' },

  // Product queries
  { pattern: /shirt|dress|jacket|pants|fashion|cloth|wear|apparel/i, intent: 'fashion', weight: 7, category: 'market-intelligence' },
  { pattern: /laptop|phone|headphone|earbuds|tablet|electronics|tech/i, intent: 'electronics', weight: 7, category: 'market-intelligence' },

  // Troubleshooting
  { pattern: /problem|issue|error|bug|fix|trouble|help me/i, intent: 'troubleshooting', weight: 6 },
  { pattern: /not work|broken|fail|crash/i, intent: 'troubleshooting', weight: 6 },
];

// ── Entity Extraction ─────────────────────────────────────────────────────

const ENTITIES = {
  countries: ['kenya', 'tanzania', 'uganda', 'rwanda', 'south sudan', 'ethiopia', 'congo'],
  cities: ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'dar es salaam', 'arusha', 'dodoma', 'mwanza', 'kampala', 'jinja', 'gulu', 'kigali'],
  currencies: ['kes', 'tzs', 'ugx', 'rwf', 'usd', 'dollar', 'shilling', 'franc'],
  products: ['shirt', 'dress', 'jacket', 'pant', 'shoe', 'bag', 'watch', 'phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'bale', 'mitumba'],
  businessFunctions: ['inventory', 'crm', 'finance', 'marketing', 'sales', 'logistics', 'procurement', 'documents', 'automation', 'analytics'],
  timeReferences: ['today', 'this week', 'this month', 'last month', 'quarterly', 'annually', 'yearly'],
  amounts: /\b\d{1,3}(,\d{3})*(\.\d+)?\s*(kes|tzs|ugx|rwf|usd|\$|ksh|tsh|ugx)\b/gi,
};

function extractEntities(query: string): Record<string, string[]> {
  const q = query.toLowerCase();
  const entities: Record<string, string[]> = {};

  for (const country of ENTITIES.countries) {
    if (q.includes(country)) {
      if (!entities.countries) entities.countries = [];
      entities.countries.push(country);
    }
  }

  for (const city of ENTITIES.cities) {
    if (q.includes(city)) {
      if (!entities.cities) entities.cities = [];
      entities.cities.push(city);
    }
  }

  for (const currency of ENTITIES.currencies) {
    if (q.includes(currency)) {
      if (!entities.currencies) entities.currencies = [];
      entities.currencies.push(currency);
    }
  }

  for (const product of ENTITIES.products) {
    if (q.includes(product)) {
      if (!entities.products) entities.products = [];
      entities.products.push(product);
    }
  }

  for (const fn of ENTITIES.businessFunctions) {
    if (q.includes(fn)) {
      if (!entities.functions) entities.functions = [];
      entities.functions.push(fn);
    }
  }

  const amountMatches = q.match(ENTITIES.amounts);
  if (amountMatches) {
    entities.amounts = amountMatches;
  }

  return entities;
}

// ── Intent Classification ─────────────────────────────────────────────────

interface ClassifiedIntent {
  intent: string;
  weight: number;
  entities: Record<string, string[]>;
  relatedEntries: KnowledgeEntry[];
}

function classifyIntent(query: string, context: AIContext): ClassifiedIntent {
  const entities = extractEntities(query);
  let bestIntent = 'general_query';
  let bestWeight = 0;

  for (const { pattern, intent, weight } of INTENT_PATTERNS) {
    if (pattern.test(query) && weight > bestWeight) {
      bestIntent = intent;
      bestWeight = weight;
    }
  }

  // Check for follow-up context
  const lastAssistantMsg = [...context.conversationHistory].reverse().find(m => m.role === 'assistant');
  if (lastAssistantMsg && context.conversationHistory.length > 1) {
    const lastContent = lastAssistantMsg.content.toLowerCase();
    // If previous response mentioned a specific topic, boost related intents
    if ((lastContent.includes('pricing') || lastContent.includes('margin')) && query.length < 50) {
      if (bestIntent === 'general_query') {
        bestIntent = 'pricing';
        bestWeight = 7;
      }
    }
  }

  // Search knowledge base for related entries
  const relatedEntries = searchKnowledge(query, 5);

  return {
    intent: bestIntent,
    weight: bestWeight,
    entities,
    relatedEntries,
  };
}

// ── Response Generation ───────────────────────────────────────────────────

function formatKnowledgeResponse(entries: KnowledgeEntry[], query: string): string {
  if (entries.length === 0) return '';

  let response = '';

  // Primary entry
  const primary = entries[0];
  response += `## ${primary.topic} — ${primary.subtopic}\n\n`;
  response += primary.content + '\n\n';

  // Tips
  if (primary.tips.length > 0) {
    response += '**Key Tips:**\n';
    for (const tip of primary.tips) {
      response += `• ${tip}\n`;
    }
    response += '\n';
  }

  // Examples
  if (primary.examples.length > 0) {
    response += '**Example:**\n';
    for (const example of primary.examples) {
      response += `${example}\n\n`;
    }
  }

  // Related entries
  if (entries.length > 1) {
    response += '**Related Topics:**\n';
    for (let i = 1; i < Math.min(entries.length, 4); i++) {
      response += `• **${entries[i].topic} — ${entries[i].subtopic}**: ${entries[i].content.substring(0, 150)}...\n`;
    }
  }

  return response;
}

function generateContextualResponse(intent: string, query: string, context: AIContext, entries: KnowledgeEntry[]): string {
  const userName = context.userData?.userName || 'there';
  const currency = context.userData?.currency || 'TZS';

  // Build knowledge-based response
  const knowledgeResponse = formatKnowledgeResponse(entries, query);

  // If we have good knowledge base matches, use them
  if (entries.length > 0 && knowledgeResponse.length > 100) {
    return knowledgeResponse;
  }

  // Fallback to intent-specific responses with context
  const contextualResponses: Record<string, string> = {
    greeting: `Hello ${userName}! 👋 Welcome to BirichiNex AI Advisor.\n\nI'm here to help you grow your business in East Africa. I can assist with:\n\n• **Business Strategy** — pricing, growth, market entry\n• **Finance** — cash flow, budgeting, tax compliance\n• **Marketing** — social media, WhatsApp, branding\n• **Operations** — inventory, supply chain, logistics\n• **Platform Help** — using BirichiNex features\n\nWhat would you like to discuss today?`,

    farewell: `Goodbye ${userName}! 👋\n\nRemember, you can always come back for business advice. Good luck with your ventures!\n\n*BirichiNex AI — Your Business, Elevated.*`,

    thanks: `You're welcome, ${userName}! 🙏\n\nI'm always here to help. Is there anything else you'd like to know about growing your business?`,

    general_query: entries.length > 0
      ? knowledgeResponse
      : `**Business Advisory**\n\nHi ${userName}! I'm here to help with your business needs.${context.userData ? `\n\nBased on your BirichiNex account, you have **${context.userData.inventoryCount} inventory items**, **${context.userData.transactionCount} transactions**, and **${context.userData.contactCount} contacts**.` : ''}\n\n**Ask me about:**\n• Pricing strategy and margins\n• Marketing and customer acquisition\n• Inventory and supply chain\n• Financial planning and tax\n• Market entry in Kenya, Tanzania, Uganda, or Rwanda\n• Using BirichiNex platform features\n\nWhat specific question do you have?`,

    platform_help: `**BirichiNex Platform Help**\n\nHere's what I can help you with:\n\n• **Shopping** — Browse products, add to cart, checkout with M-Pesa\n• **Business Dashboard** — View KPIs, activity feed, quick actions\n• **CRM** — Manage contacts, track leads, build pipeline\n• **Inventory** — Track stock, set alerts, post to marketplace\n• **Finance** — Track transactions, create invoices, manage budgets\n• **Dropshipping** — Subscribe to tiers, source products, fulfill orders\n• **Loyalty** — Earn points (1 per 150 KES), redeem for products\n• **AI Advisor** — Toggle Context ON for personalized advice\n\nWhat feature would you like help with?`,
  };

  return contextualResponses[intent] || contextualResponses.general_query;
}

// ── Follow-Up Suggestions ─────────────────────────────────────────────────

function getFollowUpSuggestions(intent: string, entries: KnowledgeEntry[]): string[] {
  const suggestions: string[] = [];

  // From knowledge base related topics
  if (entries.length > 0 && entries[0].relatedTopics.length > 0) {
    const related = entries[0].relatedTopics.slice(0, 2);
    for (const rid of related) {
      const entry = KNOWLEDGE_BASE.find(e => e.id === rid);
      if (entry) {
        suggestions.push(`Tell me about ${entry.subtopic.toLowerCase()}`);
      }
    }
  }

  // Intent-specific suggestions
  const intentSuggestions: Record<string, string[]> = {
    greeting: ['How do I price my products?', 'What marketing channels work best?', 'Help me plan my finances'],
    pricing: ['How do I calculate margins?', 'What\'s the best pricing strategy for my market?', 'How do I handle currency fluctuations?'],
    inventory: ['How do I forecast demand?', 'What\'s the best reorder strategy?', 'How do I manage slow-moving stock?'],
    finance: ['How do I create a budget?', 'What tax obligations do I have?', 'How do I improve cash flow?'],
    marketing: ['How do I get more customers?', 'What social media strategy works?', 'How do I build my brand?'],
    supply_chain: ['How do I find reliable suppliers?', 'What are the shipping costs?', 'How do I handle customs?'],
    growth: ['How do I scale my business?', 'What partnerships should I pursue?', 'How do I increase average order value?'],
    wholesale: ['What bale grades should I buy?', 'How do I calculate bale margins?', 'Which suppliers are best?'],
    membership: ['What tier is right for me?', 'How do I upgrade?', 'What features do I get?'],
    loyalty: ['How do I earn more points?', 'What can I redeem points for?', 'How does the tier system work?'],
  };

  const intentSugs = intentSuggestions[intent] || [];
  for (const s of intentSugs) {
    if (suggestions.length < 3 && !suggestions.includes(s)) {
      suggestions.push(s);
    }
  }

  // Fill remaining slots with generic suggestions
  const genericSuggestions = [
    'What are the best practices for my business?',
    'How can I reduce costs?',
    'What market trends should I know about?',
  ];
  for (const s of genericSuggestions) {
    if (suggestions.length < 3 && !suggestions.includes(s)) {
      suggestions.push(s);
    }
  }

  return suggestions.slice(0, 3);
}

// ── Main Export ───────────────────────────────────────────────────────────

export async function generateResponse(query: string, context: AIContext): Promise<AIResponse> {
  const classified = classifyIntent(query, context);
  const content = generateContextualResponse(classified.intent, query, context, classified.relatedEntries);
  const suggestedFollowUps = getFollowUpSuggestions(classified.intent, classified.relatedEntries);

  return {
    content,
    confidence: classified.relatedEntries.length > 0 ? 0.9 : 0.75,
    sources: classified.relatedEntries.map(e => `${e.topic} — ${e.subtopic}`),
    suggestedFollowUps,
    intent: classified.intent,
  };
}
