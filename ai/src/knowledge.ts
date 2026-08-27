import { BirichiNexView, BusinessAudit, Currency } from "../../src/types";
import { formatPrice } from "../../src/data/platform";
import { getViewLabel } from "./navigation";
import type { TrackingStatus } from "../../src/data/delivery";
import { buildBNXBriefing, marketplacePulse, socialMediaPlan, strategyProsCons, BNXState } from "./bnxi";

export interface TrackingItem {
  kind: "order" | "shipment";
  trackingNumber: string;
  status: TrackingStatus;
  title: string;
  originCity: string;
  destinationCity: string;
  carrier: string;
  estimatedDelivery: string;
}

export interface CopilotContext {
  currentView: BirichiNexView;
  userName: string;
  businessName: string;
  audit: BusinessAudit | null;
  contactsCount: number;
  revenue: number;
  inventoryCount: number;
  agentCalls: number;
  activeCourses: number;
  currency: Currency;
  hasSubscription: boolean;
  trackedItems?: TrackingItem[];
  bnx?: BNXState;
}

export interface CopilotAction {
  label: string;
  view: BirichiNexView;
}

export interface CopilotReply {
  text: string;
  actions?: CopilotAction[];
}

export interface PageKnowledge {
  space: string;
  explain: string;
  tips: string[];
  actions: CopilotAction[];
}

const K = (space: string, explain: string, tips: string[], actions: CopilotAction[]): PageKnowledge => ({
  space, explain, tips, actions,
});

export const PAGE_KNOWLEDGE: Record<string, PageKnowledge> = {
  dashboard: K(
    "Daily",
    "This is your command centre. It reads your whole business and shows your Business Health, your next move, and the numbers that matter today. Nothing here is noise; everything points somewhere.",
    [
      "The gold gauge is your Business Health — higher means more ready to grow.",
      "Your next move card is the single most important thing to do today.",
      "Tap any number or card and it takes you straight to the right tool.",
    ],
    [
      { label: "See my next move", view: "dashboard" },
      { label: "Open my action plan", view: "grow" },
      { label: "Meet Amani, my sales agent", view: "sell" },
    ],
  ),
  sell: K(
    "Daily",
    "Sell is everything that brings money in — your storefront, dropshipping, loyalty rewards, and Amani your AI sales agent. Four ways to make money, in one calm place.",
    [
      "Amani (the AI Sales Agent) answers calls and follows up while you sleep.",
      "Dropshipping lets you sell without buying stock first.",
      "Loyalty points turn one-time buyers into regulars.",
    ],
    [
      { label: "Open my storefront", view: "sell" },
      { label: "Meet Amani", view: "sell" },
      { label: "See my customers", view: "customers" },
    ],
  ),
  customers: K(
    "Daily",
    "Customers is everyone who buys from you — their name, history, orders and preferences. The more complete it is, the smarter your business becomes at winning them back.",
    [
      "Add every customer, even the ones who just ask questions.",
      "New customers from Amani land here automatically.",
      "A full record helps Amani personalise every call.",
    ],
    [
      { label: "Add a customer", view: "customers" },
      { label: "Let Amani handle calls", view: "sell" },
    ],
  ),
  products: K(
    "Operations",
    "Products is what you sell and how you keep it stocked — your inventory plus the suppliers you buy from. Keep it accurate and you'll never be embarrassed by a sold-out promise.",
    [
      "Low-stock items are flagged here and on your Home.",
      "Procurement helps you buy smarter from trusted suppliers.",
      "Post an item to your storefront in one tap.",
    ],
    [
      { label: "Open inventory", view: "products" },
      { label: "Source a supplier", view: "products" },
      { label: "Open my storefront", view: "sell" },
    ],
  ),
  money: K(
    "Operations",
    "Money is the honest truth of your cash — finance for what comes in and out, and payments for how you get paid. Built for African founders, no confusing jargon.",
    [
      "Log every payment, even small ones — patterns are power.",
      "Your Home dashboard revenue is calculated from completed income.",
      "Keep expenses separate so you know your true profit.",
    ],
    [
      { label: "Open finance", view: "money" },
      { label: "Open payments", view: "money" },
    ],
  ),
  orders: K(
    "Operations",
    "Orders is how everything you sell travels — shipping and live tracking, plus the documents like invoices and quotes that go with them. Happy deliveries build repeat customers.",
    [
      "Orders move through clear stages your customer can see.",
      "Documents handles contracts and e-signatures.",
      "Follow-up emails from Amani keep orders moving.",
    ],
    [
      { label: "Track an order", view: "orders" },
      { label: "Create a document", view: "orders" },
    ],
  ),
  grow: K(
    "Growth",
    "Grow is your intelligence wing — one AI that runs your whole business, battle-tested frameworks to borrow, analytics to see what's working, and automation to put busywork on autopilot.",
    [
      "The AI Advisor remembers your health scores and action plan.",
      "Start with one automation and expand from there.",
      "Borrow a proven framework instead of reinventing the wheel.",
      "Check analytics weekly, not hourly.",
    ],
    [
      { label: "Talk to my AI Advisor", view: "grow" },
      { label: "See my dashboard", view: "dashboard" },
    ],
  ),
  learn: K(
    "Growth",
    "Learn is where you level up — the Academy, the community of founders, your growth hub, and daily routines. Ten minutes a day compounds.",
    [
      "Finish one course before starting ten.",
      "The community has founders who've walked your exact path.",
      "Routines are the small daily habits that build big businesses.",
    ],
    [
      { label: "Open the Academy", view: "learn" },
      { label: "Join the community", view: "learn" },
      { label: "Do today's reflection", view: "learn" },
    ],
  ),
  account: K(
    "Growth",
    "Account is you and your plan — your founder profile, your membership, and your settings. Small tweaks here make the whole platform feel like yours.",
    [
      "Your verified badge tells customers you're real.",
      "Your plan shows what's already unlocked.",
      "Set your home currency once — everything respects it.",
    ],
    [
      { label: "Edit my profile", view: "account" },
      { label: "Compare plans", view: "account" },
    ],
  ),
  marketplace: K(
    "Sell",
    "The Marketplace is your shop window. List what you sell, set your price in the customer's currency, and let BirichiNex put it in front of buyers across the region. You can post items straight from your inventory.",
    [
      "Items posted from Inventory appear here automatically.",
      "Price in TZS, KES, UGX or USD — your customers pick the currency.",
      "Posting more products usually means more sales. Start with your 5 best sellers.",
    ],
    [
      { label: "Post a product", view: "inventory" },
      { label: "See my listings", view: "marketplace" },
    ],
  ),
  crm: K(
    "Run",
    "Customers are your business. This is where every person who buys from you lives — their name, history, orders and preferences. The more complete it is, the smarter I become at helping you win them back.",
    [
      "Add every customer — even the ones who just ask questions.",
      "New customers from your AI sales agent land here automatically.",
      "A full customer record helps Amani personalise every call.",
    ],
    [
      { label: "Add a customer", view: "crm" },
      { label: "Let Amani handle calls", view: "ai-agent" },
    ],
  ),
  inventory: K(
    "Run",
    "Inventory is everything you sell and how much you have of it. Keep it accurate and you'll never be embarrassed by a sold-out promise or dead stock sitting around.",
    [
      "Low-stock items are flagged here and on your dashboard.",
      "Items you dropship are tracked separately — no warehouse needed.",
      "Post an item to the Marketplace in one tap.",
    ],
    [
      { label: "Add an item", view: "inventory" },
      { label: "Post to Marketplace", view: "marketplace" },
    ],
  ),
  finance: K(
    "Money",
    "Finance is the honest truth of your money — cash in, cash out, and what you actually keep. It's built for African founders: no confusing accounting jargon, just clarity.",
    [
      "Log every payment, even small ones — patterns are power.",
      "Your dashboard revenue is calculated from completed income here.",
      "Keep expenses separate so you know your true profit.",
    ],
    [
      { label: "Log a transaction", view: "finance" },
      { label: "See my payments", view: "payments" },
    ],
  ),
  payments: K(
    "Money",
    "Payments is how money reaches you. Your customers pay in their preferred currency and you get settled cleanly. Think of it as your till — always open, always honest.",
    [
      "Get paid in the currency your customer chooses.",
      "Track every payment status from one screen.",
      "Membership unlocks better payment terms.",
    ],
    [
      { label: "Go to finance", view: "finance" },
      { label: "See my membership", view: "membership" },
    ],
  ),
  "finance-agent": K(
    "Money",
    "Meet Zahara — your AI finance agent. She reads your wallet, ledger, stock and orders, proposes strategies, and can restock inventory, settle payables, record purchases and manage budgets. She can do anything in the app — except move money without you.",
    [
      "Every withdrawal, purchase, transfer and settlement needs your approval first.",
      "Approved actions actually update your inventory and ledger — Zahara runs the books.",
      "Your business data is saved as a dataset and refreshed automatically at least every 24 hours.",
      "The Research tab pulls current rates and market facts from the web when your server AI is connected.",
    ],
    [
      { label: "Ask Zahara a question", view: "finance-agent" },
      { label: "Approve her actions", view: "finance-agent" },
    ],
  ),
  "ai-agent": K(
    "Sell",
    "Meet Amani — your 24/7 AI sales agent. She answers calls when you can't, calls customers back, follows up on orders, records every conversation and emails you the transcript. She sells while you sleep.",
    [
      "Simulated calls here let you see exactly how she works.",
      "Every call is logged, transcribed and emailed to you.",
      "You can edit her name, tone and working hours in Agent Voice.",
    ],
    [
      { label: "Make a test call", view: "ai-agent" },
      { label: "Teach Amani her tone", view: "ai-agent" },
    ],
  ),
  dropshipping: K(
    "Sell",
    "Dropshipping lets you sell without holding stock — we source and ship for you. It's the fastest way to test products and grow a catalogue with zero warehouse cost.",
    [
      "You get your own storefront that you can share anywhere.",
      "Subscriptions unlock unlimited products and faster shipping.",
      "Start with a small catalogue and expand what sells.",
    ],
    [
      { label: "Browse dropship products", view: "dropshipping" },
      { label: "See my plan", view: "membership" },
    ],
  ),
  loyalty: K(
    "Sell",
    "Loyalty Points turn one-time buyers into regulars. Every purchase earns points they can spend — and every point they spend is money back in your pocket. It's the cheapest marketing there is.",
    [
      "Points are awarded automatically on purchases.",
      "You can run special point events to boost slow days.",
      "Repeat customers are your most profitable customers.",
    ],
    [
      { label: "Run a points event", view: "loyalty" },
      { label: "See my customers", view: "crm" },
    ],
  ),
  ai: K(
    "Grow",
    "This is the BirichiNex AI Assistant — my cousin. A general-purpose helper for business questions, ideas and planning. For advice tied to YOUR business, use the AI Advisor instead.",
    [
      "Ask anything — pricing, ideas, how to handle a tricky customer.",
      "The AI Advisor (next to this) is personalised to your business.",
    ],
    [
      { label: "Talk to my AI Advisor", view: "ai-advisor" },
      { label: "Open my dashboard", view: "dashboard" },
    ],
  ),
  "ai-advisor": K(
    "Grow",
    "Your AI Advisor is me, grounded in your Discovery Conversation. It knows your business, your stage and your scores, so its advice is personal — not generic.",
    [
      "It remembers your health scores and action plan.",
      "The more you tell it, the sharper it gets.",
      "Use it to plan your next 30, 60 and 90 days.",
    ],
    [
      { label: "Review my action plan", view: "ai-advisor" },
      { label: "See my dashboard", view: "dashboard" },
    ],
  ),
  analytics: K(
    "Grow",
    "Analytics shows what's actually working — sales, customers, and trends over time. Data feels scary until it's simple; here it's just a friendly mirror of your effort.",
    [
      "Check weekly, not hourly — small businesses don't need daily noise.",
      "Compare periods to see real growth, not just busy days.",
    ],
    [
      { label: "See my dashboard", view: "dashboard" },
      { label: "Review my finances", view: "finance" },
    ],
  ),
  automation: K(
    "Grow",
    "Automation does your busywork. Order confirmations, follow-ups, reminders — set them once and they run forever, so you can focus on selling and growing.",
    [
      "Start with one automation and expand from there.",
      "The AI Sales Agent is automation on steroids — it talks to people.",
    ],
    [
      { label: "Set up an automation", view: "automation" },
      { label: "Meet Amani", view: "ai-agent" },
    ],
  ),
  learning: K(
    "Grow",
    "The Academy is your education wing — practical courses built for African founders. No fluff, no foreign business theory — just what works here.",
    [
      "Courses are short and built around real situations.",
      "Track your progress — your dashboard counts active courses.",
    ],
    [
      { label: "Browse courses", view: "learning" },
      { label: "See my progress", view: "dashboard" },
    ],
  ),
  community: K(
    "Grow",
    "Community is your people — founders building like you, across the region. Share wins, get answers, find partners. You don't build alone.",
    [
      "Introduce yourself — founders here love supporting new people.",
      "Ask real questions; you'll get real answers.",
    ],
    [
      { label: "Join the conversation", view: "community" },
      { label: "Meet other founders", view: "entrepreneur-hub" },
    ],
  ),
  "entrepreneur-hub": K(
    "Grow",
    "The Entrepreneur Hub is your growth path — from idea, to business, to company, to institution. It's the long game, laid out one honest step at a time.",
    [
      "Your Founder Journey on the dashboard tracks this.",
      "Each stage unlocks new tools and capabilities.",
    ],
    [
      { label: "See my journey", view: "dashboard" },
      { label: "Explore the hub", view: "entrepreneur-hub" },
    ],
  ),
  frameworks: K(
    "Grow",
    "The Framework Library is your toolbox of battle-tested playbooks — how to price, hire, market, and structure your business. Wisdom from founders who've done it.",
    [
      "Recommendations are matched to your health scores.",
      "Apply one framework at a time — don't boil the ocean.",
    ],
    [
      { label: "Browse frameworks", view: "frameworks" },
      { label: "See what's recommended", view: "dashboard" },
    ],
  ),
  routines: K(
    "Grow",
    "Founder Routines keep you sharp — a short daily reflection and a weekly CEO review. Ten minutes a day that compound into a better business.",
    [
      "Consistency beats intensity. Keep it daily.",
      "Your weekly review becomes a record of how far you've come.",
    ],
    [
      { label: "Do today's reflection", view: "routines" },
      { label: "See my dashboard", view: "dashboard" },
    ],
  ),
  procurement: K(
    "Run",
    "Procurement is buying smarter — sourcing from trusted suppliers, comparing prices, and keeping your costs down. What you save here is profit.",
    [
      "Buying in bulk from vetted suppliers lowers unit costs.",
      "Link procurement to inventory to avoid overstocking.",
    ],
    [
      { label: "Source a supplier", view: "procurement" },
      { label: "Check inventory", view: "inventory" },
    ],
  ),
  logistics: K(
    "Run",
    "Logistics is how orders travel — from your door to your customer's. Live tracking keeps your customers calm and your reputation strong.",
    [
      "Orders move through clear stages your customer can see.",
      "Fulfilment partners are available right from the platform.",
    ],
    [
      { label: "Track an order", view: "logistics" },
      { label: "See my customers", view: "crm" },
    ],
  ),
  documents: K(
    "Run",
    "Documents is your paperless office — contracts, quotes, and invoices with e-signatures. Sign, send and store everything without chasing anyone with a printer.",
    [
      "E-signatures make deals official in minutes.",
      "Every document is versioned and searchable.",
    ],
    [
      { label: "Create a document", view: "documents" },
      { label: "Open finance", view: "finance" },
    ],
  ),
  profile: K(
    "Account",
    "Profile is your founder identity — who you are and what you're building. It's also your verified Business ID that builds trust with customers and partners.",
    [
      "Keep your vision updated — it powers your AI's advice.",
      "Your verified badge tells customers you're real.",
    ],
    [
      { label: "Edit my profile", view: "profile" },
      { label: "See my membership", view: "membership" },
    ],
  ),
  membership: K(
    "Account",
    "Membership is your plan — Gold, Platinum or Enterprise. Each unlocks more of the platform. It's built to pay for itself quickly through better tools, not toys.",
    [
      "Your current tier shows what's already unlocked.",
      "Upgrading when you're growing is almost always worth it.",
    ],
    [
      { label: "Compare plans", view: "membership" },
      { label: "See my dashboard", view: "dashboard" },
    ],
  ),
  settings: K(
    "Account",
    "Settings is your control room — profile details, currency, notifications and security. Small tweaks here make the whole platform feel like yours.",
    [
      "Set your home currency once — everything respects it.",
      "Choose which notifications you actually want.",
    ],
    [
      { label: "Edit my profile", view: "profile" },
      { label: "Back to dashboard", view: "dashboard" },
    ],
  ),
};

// ─── Intent Router ──────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TrackingStatus, string> = {
  placed: "placed (awaiting pickup)",
  confirmed: "confirmed",
  processing: "being processed",
  picked_up: "picked up",
  in_transit: "in transit",
  out_for_delivery: "out for delivery",
  delivered: "delivered",
  cancelled: "cancelled",
  returned: "returned",
};

function formatEstimate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function weakestScore(audit: BusinessAudit): { label: string; view: BirichiNexView } {
  const entries = [
    { label: "Founder Readiness", score: audit.scores.founderReadiness, view: "frameworks" as BirichiNexView },
    { label: "Business Maturity", score: audit.scores.businessMaturity, view: "entrepreneur-hub" as BirichiNexView },
    { label: "Growth Readiness", score: audit.scores.growthReadiness, view: "routines" as BirichiNexView },
    { label: "Digital Readiness", score: audit.scores.digitalReadiness, view: "ai-advisor" as BirichiNexView },
    { label: "Marketplace Readiness", score: audit.scores.marketplaceReadiness, view: "marketplace" as BirichiNexView },
  ];
  return entries.reduce((a, b) => (b.score < a.score ? b : a));
}

export function respondToQuery(
  rawInput: string,
  ctx: CopilotContext,
): CopilotReply {
  const q = rawInput.toLowerCase();
  const first = ctx.userName.split(" ")[0] || "friend";
  const page = PAGE_KNOWLEDGE[ctx.currentView];
  const business = ctx.businessName || "your business";

  const health =
    ctx.audit?.scores.businessHealth != null
      ? `Your Business Health is ${ctx.audit.scores.businessHealth}. ${
          ctx.audit.scores.businessHealth >= 70
            ? "That's a healthy, ready-to-grow business."
            : ctx.audit.scores.businessHealth >= 45
              ? "There's real momentum here — let's build on it."
              : "Every strong business starts here. The next steps will move that number fast."
        }`
      : "You haven't run your Discovery Conversation yet, so I don't have your health score. Run it when you're ready and I'll personalise everything.";

  const nextMove =
    ctx.audit
      ? (() => {
          const weak = weakestScore(ctx.audit);
          return {
            text: `Here's the highest-value thing you can do today: work on ${weak.label}. It's your lowest score right now, so improving it lifts your whole business. I'd start inside ${getViewLabel(weak.view)}.`,
            actions: [{ label: `Go to ${getViewLabel(weak.view)}`, view: weak.view }],
          };
        })()
      : {
          text: `The best first step is to tell me about ${business} in the Discovery Conversation. It's a short, friendly chat — then I can build your action plan and health score.`,
          actions: [] as CopilotAction[],
        };

  // Greeting
  if (/(^|\s)(hi|hello|hey|habari|jambo|sasa)\b/.test(q) && q.length < 24) {
    return {
      text: `Karibu, ${first}! I'm your BirichiNex copilot. I can explain anything here, tell you your next move, or take you anywhere. Try asking: "What should I do first?"`,
      actions: [
        { label: "What should I do first?", view: ctx.currentView },
        { label: "Show me around", view: ctx.currentView },
      ],
    };
  }

  // Tour / help / guide
  if (/(tour|show me around|help me (understand|get started|learn)|getting started|guide me|where am i|explain this page|what is this|walk me)/.test(q)) {
    const explain = page
      ? `This is ${getViewLabel(ctx.currentView)} — in the ${page.space} area. ${page.explain}`
      : `You're on ${getViewLabel(ctx.currentView)}. I can walk you through it.`;
    return {
      text: `${explain} Want the full tour? It takes under a minute and I'll show you the highlights.`,
      actions: [
        { label: "Take the guided tour", view: ctx.currentView },
        ...(page ? page.actions.slice(0, 2) : []),
      ],
    };
  }

  // Health
  if (/(health|score|how (is|am) i doing|doing well|how healthy)/.test(q)) {
    return {
      text: `${health} ${
        ctx.audit
          ? ` Your weakest area is ${weakestScore(ctx.audit).label} — improving it matters most right now.`
          : ""
      }`,
      actions: [
        { label: "See my action plan", view: "ai-advisor" },
        { label: "Back to dashboard", view: "dashboard" },
      ],
    };
  }

  // Next move
  if (/(next move|what should i do first|start(ed)? today|first step|do today|priorit)/.test(q)) {
    return nextMove;
  }

  // ── BNX Intelligence Core ─────────────────────────────────────────────────

  // Daily briefing: what changed, what needs attention, what to do next
  if (ctx.bnx && /(\bbrief(ing)?\b|what changed|what needs (attention|your eyes)|anything (i should|i need to|you (noticed|see))|what should i (focus|know|look at|do today|watch)|today'?s (brief|plan)|morning brief|attention|heads? ?up|status of (my )?business|how('| i)s (my )?business doing)/.test(q)) {
    const brief = buildBNXBriefing(ctx.bnx);
    const lines = [brief.summary];
    const rest = brief.next ? brief.attention.filter((a) => a.id !== brief.next!.id).slice(0, 3) : brief.attention.slice(0, 3);
    rest.forEach((a, i) => {
      lines.push(`${i + 1}. ${a.title} — ${a.detail}`);
    });
    return {
      text: lines.join("\n\n"),
      actions: brief.attention.slice(0, 3).map((a) => ({ label: `Open ${getViewLabel(a.view)}`, view: a.view })),
    };
  }

  // Marketplace pulse: what's moving fast + how to boost it
  if (ctx.bnx && /(market(place)? (pulse|stats|stats?)|what('| i)s moving|moving fast|what('| i)s selling|what should i (sell|push|stock)|boost (my|the) (sales|market|store)|how do i sell (more|faster)|demand|best seller|slow seller|top (product|seller|seller?))/.test(q)) {
    const pulse = marketplacePulse(ctx.bnx);
    const lines = [pulse.summary];
    pulse.movers.forEach((m) => lines.push(`• ${m.product} — ${m.orders} sold, ${formatPrice(m.revenue, ctx.currency)} (${m.share}% of revenue)`));
    lines.push(`Boost: ${pulse.boostTips.slice(0, 2).join(" ")}`);
    return {
      text: lines.join("\n"),
      actions: [{ label: "Open Marketplace", view: "marketplace" }],
    };
  }

  // Social media manager: 7-day content plan from real business data
  if (ctx.bnx && /(social media|content plan|post ideas|what should i post|social plan|instagram|tiktok|whatsapp status|reels|followers|social (presence|strategy|management))/.test(q)) {
    const plan = socialMediaPlan(ctx.bnx);
    const upcoming = plan.posts.slice(0, 3);
    const lines = [plan.summary];
    upcoming.forEach((p) => lines.push(`• ${p.day} (${p.channel}): ${p.caption.slice(0, 140)}… CTA: ${p.cta}.`));
    lines.push(`Tip: ${plan.tips[0]}`);
    return {
      text: lines.join("\n"),
      actions: [{ label: "Open my dashboard", view: "dashboard" }],
    };
  }

  // Strategy pros & cons, personalized to this business
  if (ctx.bnx && /(pros? and cons?|strategy|options|should i (restock|invest|save|raise (prices|my prices)|expand|post)|what('| i)s my best move|weigh the (options|choices)|risks?|trade.?offs?)/.test(q)) {
    const options = strategyProsCons(ctx.bnx);
    if (options.length > 0) {
      const o = options[0];
      const lines = [
        `Strategy: ${o.strategy}`,
        `Pros:\n${o.pros.map((p) => `• ${p}`).join("\n")}`,
        `Cons:\n${o.cons.map((c) => `• ${c}`).join("\n")}`,
        `Verdict: ${o.verdict}`,
      ];
      return {
        text: lines.join("\n\n"),
        actions: [{ label: `Go to ${getViewLabel(o.view)}`, view: o.view }],
      };
    }
  }

  // Direct navigation — "open X", "go to X", "take me to X"…
  const navMatch = q.match(/^(?:open|go to|take me to|show me|switch to|navigate to|let'?s (?:go|head) to)\s+(.+)$/);
  if (navMatch) {
    const target = navMatch[1];
    const navTargets: { re: RegExp; view: BirichiNexView; label: string }[] = [
      { re: /(aman|sales ?agent|ai ?agent)/, view: "ai-agent", label: "Amani" },
      { re: /(zahara|finance ?agent)/, view: "finance-agent", label: "Zahara" },
      { re: /(market|store|shop)/, view: "marketplace", label: "Marketplace" },
      { re: /(payment|payout|get paid)/, view: "payments", label: "Payments" },
      { re: /(finance|money|ledger)/, view: "finance", label: "Finance" },
      { re: /(inventor|products|stock|warehouse|supplier|procurement)/, view: "inventory", label: "Inventory" },
      { re: /(customer|crm|contact|client)/, view: "crm", label: "Customers" },
      { re: /(order|logistic|shipping|track)/, view: "logistics", label: "Logistics" },
      { re: /(learn|academy|course)/, view: "learning", label: "Academy" },
      { re: /(grow|action plan|routine)/, view: "grow", label: "Grow" },
      { re: /(advisor|consultant)/, view: "ai-advisor", label: "AI Advisor" },
      { re: /(community|people)/, view: "community", label: "Community" },
      { re: /(dashboard|home|overview|command)/, view: "dashboard", label: "Dashboard" },
      { re: /(sell|storefront)/, view: "sell", label: "Sell" },
    ];
    const hit = navTargets.find((t) => t.re.test(target));
    if (hit) {
      return {
        text: `On my way — opening ${hit.label} for you.`,
        actions: [{ label: `Open ${hit.label}`, view: hit.view }],
      };
    }
  }

  // Sales agent / Amani
  if (/(amani|sales agent|answer(ed|ing)? call|take call|follow.?up|ai agent)/.test(q)) {
    return {
      text: `Amani is your 24/7 AI sales agent — she answers calls, calls customers back, follows up on orders, records every conversation and emails you the transcript. She's already wired into your customers and orders.`,
      actions: [
        { label: "Meet Amani", view: "ai-agent" },
        { label: "Hear a sample call", view: "ai-agent" },
      ],
    };
  }

  // Finance agent / Zahara
  if (/(zahara|finance agent|financial advisor|money manager|agent.*money)/.test(q)) {
    return {
      text: `Zahara is your AI finance agent. She reads your wallet, ledger, stock and orders, proposes strategies, restocks inventory, settles payables and manages budgets — and can even buy stock or place dropship orders. Nothing moves without your approval, and your business data is saved as a dataset refreshed at least every 24 hours.`,
      actions: [
        { label: "Meet Zahara", view: "finance-agent" },
        { label: "Approve her actions", view: "finance-agent" },
      ],
    };
  }

  // Sell / add product
  if (/(sell|add a? product|add inventory|list a? product|post|stock)/.test(q)) {
    return {
      text: `Let's put something in front of buyers. Add or review what you sell in Inventory, then post your best items to the Marketplace — or let Amani start selling for you.`,
      actions: [
        { label: "Go to Inventory", view: "inventory" },
        { label: "Go to Marketplace", view: "marketplace" },
        { label: "Meet Amani", view: "ai-agent" },
      ],
    };
  }

  // Customers / CRM
  if (/(customer|crm|client|contact|who buys|lead)/.test(q)) {
    return {
      text: ctx.contactsCount === 0
        ? "You don't have any customers saved yet. Let's fix that — add your first customer in Customers. Every relationship starts with a name."
        : `You have ${ctx.contactsCount} customer${ctx.contactsCount === 1 ? "" : "s"} saved. That's your gold. Keep it growing and let Amani add more while you sleep.`,
      actions: [
        { label: "Open Customers", view: "crm" },
        { label: "Meet Amani", view: "ai-agent" },
      ],
    };
  }

  // Money / finance / revenue
  if (/(money|finance|revenue|profit|cash|income|earn|paid|salary|till)/.test(q)) {
    return {
      text: `You've taken in ${formatPrice(ctx.revenue, ctx.currency)} in completed income so far. Finance keeps the honest story of your money; Payments is how it reaches you.`,
      actions: [
        { label: "Open Finance", view: "finance" },
        { label: "Open Payments", view: "payments" },
      ],
    };
  }

  // Inventory / stock
  if (/(inventory|stock|how many.*(product|item)|what do i have|warehouse)/.test(q)) {
    return {
      text: `You have ${ctx.inventoryCount} item${ctx.inventoryCount === 1 ? "" : "s"} in inventory. Keep it accurate and you'll never over-promise or under-stock.`,
      actions: [
        { label: "Open Inventory", view: "inventory" },
        { label: "Post to Marketplace", view: "marketplace" },
      ],
    };
  }

  // Orders / logistics
  if (/(order|shipping|logistic|deliver|track|sent)/.test(q)) {
    return {
      text: "Orders live across Logistics — from payment to the customer's door, with live tracking they can follow. Happy deliveries build repeat customers.",
      actions: [
        { label: "Open Logistics", view: "logistics" },
        { label: "Open Customers", view: "crm" },
      ],
    };
  }

  // Live tracking by number
  const trackingNumber = q.match(/\bpm-[a-z]{2,3}-\d{4}-\d{3,}\b/);
  if (trackingNumber) {
    const num = trackingNumber[0].toUpperCase();
    const item = ctx.trackedItems?.find((i) => i.trackingNumber.toUpperCase() === num);
    if (item) {
      return {
        text: `${item.title} (${item.trackingNumber}) is ${STATUS_LABELS[item.status]}. ${item.originCity} → ${item.destinationCity} via ${item.carrier}, expected ${formatEstimate(item.estimatedDelivery)}. See it live on the map.`,
        actions: [
          { label: "See it on the Live Map", view: "orders" },
          { label: "Open Logistics", view: "logistics" },
        ],
      };
    }
    return {
      text: `I can't find a package matching ${num} just yet. Double-check the number and try again — or open the Live Map to see everything moving.`,
      actions: [{ label: "Open Live Map", view: "orders" }],
    };
  }

  // Growth / learning / community
  if (/(grow|learn|course|academy|community|market|advertise|bigger|scale|improve)/.test(q)) {
    return {
      text: `Growth is a calm, daily process. You have ${ctx.activeCourses} course${ctx.activeCourses === 1 ? "" : "s"} in progress — finishing one beats starting ten. And the community has founders who've walked your exact path.`,
      actions: [
        { label: "Open Academy", view: "learning" },
        { label: "Join the Community", view: "community" },
      ],
    };
  }

  // Thanks
  if (/(thank|asante|asanti|shukran|karibu)/.test(q)) {
    return {
      text: `You're welcome, ${first}. That's what I'm here for — go build, and I'll hold the light.`,
    };
  }

  // Fallback: explain current page
  if (page) {
    return {
      text: page.explain,
      actions: page.actions,
    };
  }

  return {
    text: `I understand ${business} best when we work together. Ask me about your health score, your next move, Amani your sales agent, or tell me to take you somewhere — like "open Finance".`,
    actions: [
      { label: "What should I do first?", view: ctx.currentView },
      { label: "Show me around", view: ctx.currentView },
    ],
  };
}

export function viewChips(view: BirichiNexView | string): string[] {
  const chips: Record<string, string[]> = {
    dashboard: ["What should I do first?", "Explain my health score", "What should I focus on today?", "Meet Amani"],
    sell: ["How do I sell?", "Meet Amani", "What's my loyalty doing?"],
    customers: ["Who are my customers?", "Let Amani take calls"],
    products: ["What's low on stock?", "Post to my storefront"],
    money: ["Where's my money going?", "Get paid", "Ask Zahara about cash flow"],
    orders: ["Where's my package?", "Track an order", "Create an invoice"],
    grow: ["Review my action plan", "Find a framework", "What's my weakest area?"],
    learn: ["What should I learn first?", "Find people like me"],
    account: ["What's in my plan?", "Edit my profile"],
    marketplace: ["How do I sell?", "Open my inventory", "What's moving fast?"],
    crm: ["Who are my customers?", "Let Amani take calls"],
    inventory: ["What's low on stock?", "Post to Marketplace"],
    finance: ["Where's my money going?", "Open payments"],
    "finance-agent": ["How do I approve an action?", "Should I restock now?", "What's my cash flow?"],
    "ai-agent": ["How does Amani work?", "Make a sample call"],
    learning: ["What should I learn first?", "Show my progress"],
    community: ["Find people like me", "Share my journey"],
    "ai-advisor": ["Review my action plan", "What's my weakest area?"],
  };
  return chips[view] ?? ["What should I do first?", "Show me around"];
}
