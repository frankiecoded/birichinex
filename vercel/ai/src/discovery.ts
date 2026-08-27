// ============================================
// BirichiNex™️ AI Discovery Engine
// The intelligent onboarding engine of the
// Entrepreneurial Operating System.
// Implements the AI Discovery Conversation and
// Business Audit described in the Building
// Beyond Business Manifesto (Version 1).
// ============================================

import {
  ActionPlanItem,
  ActionPlanHorizon,
  BirichiNexView,
  BusinessAudit,
  BusinessProfile,
  FounderJourneyStage,
  FounderProfile,
  FOUNDER_JOURNEY_STAGES,
  HealthScores,
} from "../../src/types";

// ─── Dimensions ─────────────────────────────────────────────────────────────

export type AuditDimension =
  | "founderReadiness"
  | "businessMaturity"
  | "growthReadiness"
  | "digitalReadiness"
  | "marketplaceReadiness";

export type AnswerValue = string | string[];

export type DiscoveryAnswers = Record<string, AnswerValue>;

// ─── Questions ──────────────────────────────────────────────────────────────

export interface DiscoveryOption {
  value: string;
  label: string;
  icon: string;
  scores?: Partial<Record<AuditDimension, number>>;
}

export interface DiscoveryQuestion {
  id: string;
  area: string;
  dimension: AuditDimension;
  prompt: string;
  hint: string;
  kind: "text" | "single" | "multi";
  options?: DiscoveryOption[];
  placeholder?: string;
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "experience",
    area: "Founder Profile",
    dimension: "founderReadiness",
    prompt: "Let's start simple — where are you on your business journey right now?",
    hint: "Pick the one that sounds most like you. This helps me match my guidance to your level.",
    kind: "single",
    options: [
      { value: "just-starting", label: "Just starting out — I'm new to business", icon: "🌱", scores: { founderReadiness: 30 } },
      { value: "pro", label: "I'm a pro — I've been running my business", icon: "💼", scores: { founderReadiness: 65 } },
      { value: "expert", label: "I'm an expert — I know my business inside out", icon: "🏆", scores: { founderReadiness: 90 } },
    ],
  },
  {
    id: "businessName",
    area: "Business Profile",
    dimension: "businessMaturity",
    prompt: "Let's start with the essentials. What is your business called?",
    hint: "Your business name will appear on your Verified Business ID and Founder Dashboard.",
    kind: "text",
    placeholder: "e.g., Portmetals Africa Ltd.",
  },
  {
    id: "role",
    area: "Founder Profile",
    dimension: "founderReadiness",
    prompt: "Which best describes your current role in the business?",
    hint: "Understanding your role helps me calibrate my guidance to you as a founder.",
    kind: "single",
    options: [
      { value: "idea", label: "Just exploring an idea", icon: "💡", scores: { founderReadiness: 35 } },
      { value: "solo", label: "Solo founder running everything", icon: "🚀", scores: { founderReadiness: 55 } },
      { value: "operator", label: "Founder with a small team", icon: "👥", scores: { founderReadiness: 70 } },
      { value: "leader", label: "Leading managers & departments", icon: "🧭", scores: { founderReadiness: 85 } },
    ],
  },
  {
    id: "stage",
    area: "Business Stage",
    dimension: "growthReadiness",
    prompt: "Where is your business on its journey right now?",
    hint: "Pick the stage that most closely matches where your business is today.",
    kind: "single",
    options: [
      { value: "Idea", label: "Idea — shaping the concept", icon: "💡", scores: { growthReadiness: 20, businessMaturity: 20 } },
      { value: "Validation", label: "Validation — testing demand", icon: "🔬", scores: { growthReadiness: 35, businessMaturity: 30 } },
      { value: "Launch", label: "Launch — first sales", icon: "🚀", scores: { growthReadiness: 45, businessMaturity: 40 } },
      { value: "Operations", label: "Operations — daily running", icon: "⚙️", scores: { growthReadiness: 55, businessMaturity: 55 } },
      { value: "Stability", label: "Stability — reliable income", icon: "🛡️", scores: { growthReadiness: 65, businessMaturity: 65 } },
      { value: "Growth", label: "Growth — scaling revenue", icon: "📈", scores: { growthReadiness: 75, businessMaturity: 70 } },
      { value: "Scale", label: "Scale — national expansion", icon: "🌍", scores: { growthReadiness: 85, businessMaturity: 80 } },
      { value: "Institution", label: "Institution — building to outlive me", icon: "🏛️", scores: { growthReadiness: 92, businessMaturity: 92 } },
    ],
  },
  {
    id: "industry",
    area: "Industry",
    dimension: "marketplaceReadiness",
    prompt: "Which industry does your business operate in?",
    hint: "This helps me connect you to the right suppliers, buyers, and learning paths.",
    kind: "single",
    options: [
      { value: "fashion", label: "Fashion & Apparel", icon: "👗", scores: { marketplaceReadiness: 55 } },
      { value: "technology", label: "Technology & Electronics", icon: "💻", scores: { marketplaceReadiness: 60 } },
      { value: "gemstones", label: "Gemstones & Minerals", icon: "💎", scores: { marketplaceReadiness: 50 } },
      { value: "agriculture", label: "Agriculture & Produce", icon: "🌾", scores: { marketplaceReadiness: 50 } },
      { value: "manufacturing", label: "Manufacturing", icon: "🏭", scores: { marketplaceReadiness: 55 } },
      { value: "retail", label: "Retail & Distribution", icon: "🛒", scores: { marketplaceReadiness: 60 } },
      { value: "services", label: "Services & Consulting", icon: "🤝", scores: { marketplaceReadiness: 45 } },
      { value: "healthcare", label: "Health & Beauty", icon: "💆", scores: { marketplaceReadiness: 50 } },
    ],
  },
  {
    id: "vision",
    area: "Vision",
    dimension: "founderReadiness",
    prompt: "In one sentence, what do you want your business to become?",
    hint: "A clear vision is the foundation of an enduring institution.",
    kind: "text",
    placeholder: "e.g., Africa's most trusted fashion supplier, built to last generations",
  },
  {
    id: "products",
    area: "Products & Services",
    dimension: "marketplaceReadiness",
    prompt: "What do you sell today?",
    hint: "Describe your main products or services in a few words.",
    kind: "text",
    placeholder: "e.g., Clothing bales, electronics, coffee, consulting services",
  },
  {
    id: "customers",
    area: "Customers",
    dimension: "growthReadiness",
    prompt: "Who are your customers today?",
    hint: "Knowing your customer is the first step to serving them better.",
    kind: "single",
    options: [
      { value: "none", label: "Not selling yet", icon: "🕒", scores: { growthReadiness: 15, marketplaceReadiness: 20 } },
      { value: "friends", label: "Friends, family & referrals", icon: "🙌", scores: { growthReadiness: 35, marketplaceReadiness: 35 } },
      { value: "local", label: "Local walk-in customers", icon: "🏪", scores: { growthReadiness: 55, marketplaceReadiness: 50 } },
      { value: "wholesale", label: "Wholesale & business buyers", icon: "📦", scores: { growthReadiness: 75, marketplaceReadiness: 70 } },
      { value: "export", label: "Cross-border / export buyers", icon: "🌍", scores: { growthReadiness: 90, marketplaceReadiness: 88 } },
    ],
  },
  {
    id: "marketing",
    area: "Marketing",
    dimension: "digitalReadiness",
    prompt: "How do you attract customers today?",
    hint: "Your marketing engine determines how predictable your demand is.",
    kind: "single",
    options: [
      { value: "none", label: "I don't market yet", icon: "🔇", scores: { digitalReadiness: 15, growthReadiness: 20 } },
      { value: "word", label: "Word of mouth only", icon: "🗣️", scores: { digitalReadiness: 35, growthReadiness: 40 } },
      { value: "social", label: "Social media (casual posts)", icon: "📱", scores: { digitalReadiness: 60, growthReadiness: 55 } },
      { value: "paid", label: "Paid ads & campaigns", icon: "📣", scores: { digitalReadiness: 80, growthReadiness: 75 } },
      { value: "full", label: "Full marketing system", icon: "🎯", scores: { digitalReadiness: 95, growthReadiness: 88 } },
    ],
  },
  {
    id: "sales",
    area: "Sales",
    dimension: "growthReadiness",
    prompt: "How consistent is your sales process?",
    hint: "Repeatable sales are the difference between a hustle and a business.",
    kind: "single",
    options: [
      { value: "chaotic", label: "Sales happen when they happen", icon: "🎲", scores: { growthReadiness: 25 } },
      { value: "manual", label: "I chase every sale manually", icon: "🏃", scores: { growthReadiness: 50 } },
      { value: "pipeline", label: "We have a sales pipeline", icon: "🔁", scores: { growthReadiness: 70 } },
      { value: "system", label: "Repeatable, measurable system", icon: "🏆", scores: { growthReadiness: 92 } },
    ],
  },
  {
    id: "operations",
    area: "Operations",
    dimension: "businessMaturity",
    prompt: "How organized are your day-to-day operations?",
    hint: "Systems turn chaos into capacity.",
    kind: "single",
    options: [
      { value: "chaotic", label: "Ad-hoc — we improvise daily", icon: "🌀", scores: { businessMaturity: 20 } },
      { value: "basic", label: "A few written processes", icon: "📋", scores: { businessMaturity: 45 } },
      { value: "organized", label: "Documented procedures", icon: "🗂️", scores: { businessMaturity: 70 } },
      { value: "advanced", label: "Optimized, measured systems", icon: "⚙️", scores: { businessMaturity: 92 } },
    ],
  },
  {
    id: "team",
    area: "Team",
    dimension: "founderReadiness",
    prompt: "How is your team structured today?",
    hint: "Great institutions are built by teams, not solo founders.",
    kind: "single",
    options: [
      { value: "solo", label: "Just me", icon: "1️⃣", scores: { founderReadiness: 40, businessMaturity: 40 } },
      { value: "contractors", label: "Freelancers & contractors", icon: "🤝", scores: { founderReadiness: 55, businessMaturity: 55 } },
      { value: "small", label: "Small full-time team", icon: "👥", scores: { founderReadiness: 75, businessMaturity: 70 } },
      { value: "leaders", label: "Team with leaders & managers", icon: "🏢", scores: { founderReadiness: 90, businessMaturity: 85 } },
    ],
  },
  {
    id: "leadership",
    area: "Leadership",
    dimension: "founderReadiness",
    prompt: "How would you describe your leadership today?",
    hint: "Honest self-assessment is the first act of strong leadership.",
    kind: "single",
    options: [
      { value: "learning", label: "Still learning to lead", icon: "🌱", scores: { founderReadiness: 35 } },
      { value: "doing", label: "Leading by doing", icon: "💪", scores: { founderReadiness: 55 } },
      { value: "delegating", label: "Delegating & developing others", icon: "🤲", scores: { founderReadiness: 75 } },
      { value: "mentoring", label: "Building future leaders", icon: "🏛️", scores: { founderReadiness: 95 } },
    ],
  },
  {
    id: "technology",
    area: "Technology",
    dimension: "digitalReadiness",
    prompt: "How much technology does your business use?",
    hint: "Technology accelerates progress — but only when it's used well.",
    kind: "single",
    options: [
      { value: "none", label: "Pen and paper mostly", icon: "📝", scores: { digitalReadiness: 15 } },
      { value: "basic", label: "Phone, social media, basic tools", icon: "📱", scores: { digitalReadiness: 45 } },
      { value: "modern", label: "Modern tools & software", icon: "💼", scores: { digitalReadiness: 70 } },
      { value: "integrated", label: "Integrated digital operations", icon: "🖥️", scores: { digitalReadiness: 92 } },
    ],
  },
  {
    id: "finance",
    area: "Finance",
    dimension: "businessMaturity",
    prompt: "How healthy is your business finance today?",
    hint: "Cash flow discipline builds the foundation for scale.",
    kind: "single",
    options: [
      { value: "mixed", label: "Money is personal & business mixed", icon: "🫣", scores: { businessMaturity: 25, growthReadiness: 30 } },
      { value: "tracked", label: "We track income and expenses", icon: "🧾", scores: { businessMaturity: 55, growthReadiness: 55 } },
      { value: "managed", label: "Managed cash flow & records", icon: "📊", scores: { businessMaturity: 75, growthReadiness: 75 } },
      { value: "healthy", label: "Strong margins & reserves", icon: "🏦", scores: { businessMaturity: 92, growthReadiness: 90 } },
    ],
  },
  {
    id: "challenges",
    area: "Current Challenges",
    dimension: "growthReadiness",
    prompt: "What is holding your business back right now?",
    hint: "Select the challenges you face most. This sharpens my diagnosis.",
    kind: "multi",
    options: [
      { value: "customers", label: "Finding customers", icon: "🔍", scores: { growthReadiness: -10 } },
      { value: "capital", label: "Access to capital", icon: "💰", scores: { businessMaturity: -10 } },
      { value: "suppliers", label: "Reliable suppliers", icon: "🚚", scores: { marketplaceReadiness: -12 } },
      { value: "systems", label: "Systems & organization", icon: "🗃️", scores: { businessMaturity: -12 } },
      { value: "marketing", label: "Marketing & visibility", icon: "📢", scores: { digitalReadiness: -12 } },
      { value: "team", label: "Team & delegation", icon: "🧑‍🤝‍🧑", scores: { founderReadiness: -12 } },
      { value: "operations", label: "Day-to-day operations", icon: "⚡", scores: { businessMaturity: -10 } },
      { value: "none", label: "None of these", icon: "✅" },
    ],
  },
  {
    id: "goals",
    area: "Growth Goals",
    dimension: "growthReadiness",
    prompt: "What do you want to achieve in the next 12 months?",
    hint: "Your goals shape your 90-day roadmap.",
    kind: "multi",
    options: [
      { value: "revenue", label: "Grow revenue", icon: "📈", scores: { growthReadiness: 8 } },
      { value: "marketplace", label: "Start selling on the Marketplace", icon: "🛍️", scores: { marketplaceReadiness: 10 } },
      { value: "team", label: "Build my team", icon: "👥", scores: { founderReadiness: 8 } },
      { value: "systems", label: "Put real systems in place", icon: "🔧", scores: { businessMaturity: 8 } },
      { value: "digital", label: "Go digital", icon: "💻", scores: { digitalReadiness: 8 } },
      { value: "export", label: "Expand beyond my country", icon: "🌍", scores: { marketplaceReadiness: 8 } },
      { value: "institution", label: "Build an enduring institution", icon: "🏛️", scores: { founderReadiness: 8, businessMaturity: 6 } },
    ],
  },
];

// ─── Stage mapping ───────────────────────────────────────────────────────────

const STAGE_INDEX: Record<string, number> = {};
FOUNDER_JOURNEY_STAGES.forEach((s, i) => {
  STAGE_INDEX[s] = i;
});

// ─── Scoring ────────────────────────────────────────────────────────────────

const DIMENSION_WEIGHTS: Record<AuditDimension, number> = {
  founderReadiness: 0.22,
  businessMaturity: 0.24,
  growthReadiness: 0.22,
  digitalReadiness: 0.16,
  marketplaceReadiness: 0.16,
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function computeScores(answers: DiscoveryAnswers): HealthScores {
  const dimensionPoints: Record<AuditDimension, number[]> = {
    founderReadiness: [],
    businessMaturity: [],
    growthReadiness: [],
    digitalReadiness: [],
    marketplaceReadiness: [],
  };

  for (const question of DISCOVERY_QUESTIONS) {
    const raw = answers[question.id];
    if (raw === undefined || raw === null) continue;

    const values = Array.isArray(raw) ? raw : [raw];

    for (const value of values) {
      const option = question.options?.find((o) => o.value === value);
      if (!option?.scores) continue;
      for (const [dim, score] of Object.entries(option.scores) as [AuditDimension, number][]) {
        if (!dimensionPoints[dim]) continue;
        dimensionPoints[dim].push(score);
      }
    }
  }

  const dimensionAverage = (dim: AuditDimension): number => {
    const points = dimensionPoints[dim];
    if (points.length === 0) return 50;
    const sum = points.reduce((a, b) => a + b, 0);
    return clampScore(sum / points.length);
  };

  const founderReadiness = dimensionAverage("founderReadiness");
  const businessMaturity = dimensionAverage("businessMaturity");
  const growthReadiness = dimensionAverage("growthReadiness");
  const digitalReadiness = dimensionAverage("digitalReadiness");
  const marketplaceReadiness = dimensionAverage("marketplaceReadiness");

  const weighted =
    founderReadiness * DIMENSION_WEIGHTS.founderReadiness +
    businessMaturity * DIMENSION_WEIGHTS.businessMaturity +
    growthReadiness * DIMENSION_WEIGHTS.growthReadiness +
    digitalReadiness * DIMENSION_WEIGHTS.digitalReadiness +
    marketplaceReadiness * DIMENSION_WEIGHTS.marketplaceReadiness;

  return {
    businessHealth: clampScore(weighted),
    founderReadiness,
    businessMaturity,
    growthReadiness,
    digitalReadiness,
    marketplaceReadiness,
  };
}

// ─── Action plan generation ─────────────────────────────────────────────────

interface DimensionRemedy {
  dimension: AuditDimension;
  when: ActionPlanHorizon;
  title: string;
  rationale: string;
  view: BirichiNexView;
  actionLabel: string;
}

const DIMENSION_REMEDIES: Record<AuditDimension, DimensionRemedy[]> = {
  founderReadiness: [
    { dimension: "founderReadiness", when: "now", title: "Define your founder operating rhythm", rationale: "Your leadership capacity is the ceiling on your business's growth. Start a simple weekly founder review so decisions become deliberate.", view: "ai-advisor", actionLabel: "Open AI Advisor" },
    { dimension: "founderReadiness", when: "30-days", title: "Begin the Daily Founder Reflection", rationale: "Reflection turns experience into wisdom. Ten focused minutes a day compounds into clarity within a month.", view: "entrepreneur-hub", actionLabel: "Open Founder Success Centre" },
    { dimension: "founderReadiness", when: "90-days", title: "Develop your first leader", rationale: "An institution runs on leaders, not a single founder. Identify one person to develop and delegate real responsibility.", view: "recruitment", actionLabel: "Plan your team" },
    { dimension: "founderReadiness", when: "long-term", title: "Build a succession strategy", rationale: "Enduring institutions outlive their founders. Document your role so the business can run beyond you.", view: "documents", actionLabel: "Document it" },
  ],
  businessMaturity: [
    { dimension: "businessMaturity", when: "now", title: "Separate your personal and business money", rationale: "Healthy institutions keep clean financial boundaries. Clear records are the first proof of a real business.", view: "finance", actionLabel: "Open Finance" },
    { dimension: "businessMaturity", when: "30-days", title: "Document your core processes", rationale: "What is written can be repeated, improved, and delegated. Capture your top 5 operating procedures.", view: "documents", actionLabel: "Create documents" },
    { dimension: "businessMaturity", when: "90-days", title: "Introduce stock and order controls", rationale: "Predictable operations protect margins. Track what you hold, what sells, and what needs replenishing.", view: "inventory", actionLabel: "Open Inventory" },
    { dimension: "businessMaturity", when: "long-term", title: "Install financial governance", rationale: "Institutions run on governance — budgets, reviews, and accountability at every level.", view: "analytics", actionLabel: "Open Analytics" },
  ],
  growthReadiness: [
    { dimension: "growthReadiness", when: "now", title: "Build a repeatable sales pipeline", rationale: "Chasing sales is a hustle; managing a pipeline is a business. Track every lead until it becomes revenue.", view: "crm", actionLabel: "Open CRM" },
    { dimension: "growthReadiness", when: "30-days", title: "Set pricing that protects your margin", rationale: "Revenue without margin is just movement. Price with structure, not guesswork.", view: "finance", actionLabel: "Review pricing" },
    { dimension: "growthReadiness", when: "90-days", title: "Launch a structured growth campaign", rationale: "Turn word-of-mouth into a system. Plan one campaign per month and measure what it returns.", view: "automation", actionLabel: "Open Automation" },
    { dimension: "growthReadiness", when: "long-term", title: "Move from sales to customer value", rationale: "Customers invest in outcomes. Build retention, loyalty, and repeat value — not just transactions.", view: "loyalty", actionLabel: "Open Loyalty" },
  ],
  digitalReadiness: [
    { dimension: "digitalReadiness", when: "now", title: "Establish your digital presence", rationale: "Customers search before they buy. A consistent digital identity makes you findable and credible.", view: "entrepreneur-hub", actionLabel: "Visit Founder Success Centre" },
    { dimension: "digitalReadiness", when: "30-days", title: "Automate repetitive admin tasks", rationale: "Your time is the scarcest asset. Automate follow-ups, receipts, and reminders to buy it back.", view: "automation", actionLabel: "Open Automation" },
    { dimension: "digitalReadiness", when: "90-days", title: "Go digital end-to-end", rationale: "Move records, orders, and communications into one connected system so nothing falls through the cracks.", view: "integrations", actionLabel: "Explore Integrations" },
    { dimension: "digitalReadiness", when: "long-term", title: "Use AI as your daily advisor", rationale: "The BirichiNex AI reasons across your business. Make it part of your weekly operating rhythm.", view: "ai-advisor", actionLabel: "Talk to your Advisor" },
  ],
  marketplaceReadiness: [
    { dimension: "marketplaceReadiness", when: "now", title: "List your first products on the Marketplace", rationale: "The Marketplace connects you to verified buyers across the region. Start with one strong product line.", view: "marketplace", actionLabel: "Go to Marketplace" },
    { dimension: "marketplaceReadiness", when: "30-days", title: "Connect with verified suppliers", rationale: "Reliable supply is the backbone of reliable delivery. Build your verified supplier network.", view: "procurement", actionLabel: "Open Procurement" },
    { dimension: "marketplaceReadiness", when: "90-days", title: "Prepare for cross-border trade", rationale: "East Africa's markets reward exporters. Arrange logistics and compliance before the orders arrive.", view: "logistics", actionLabel: "Open Logistics" },
    { dimension: "marketplaceReadiness", when: "long-term", title: "Become a Verified Supplier", rationale: "A Verified Supplier badge builds buyer confidence and unlocks premium demand.", view: "membership", actionLabel: "Explore Membership" },
  ],
};

function stageBasedRemedies(stage: FounderJourneyStage): DimensionRemedy[] {
  const idx = STAGE_INDEX[stage] ?? 3;
  const base: DimensionRemedy[] = [
    {
      dimension: "businessMaturity",
      when: "now",
      title: "Enrol in the BirichiNex Academy",
      rationale: "Every strong institution begins with knowledge. Start the course matched to your stage and build the foundation to grow on.",
      view: "learning",
      actionLabel: "Open Academy",
    },
  ];

  if (idx <= 3) {
    base.push(
      {
        dimension: "growthReadiness",
        when: "90-days",
        title: "Harden your business model",
        rationale: "Your early focus should be proving repeatable value. Validate pricing, delivery, and customer satisfaction before scaling.",
        view: "learning",
        actionLabel: "Take a foundation course",
      },
      {
        dimension: "marketplaceReadiness",
        when: "30-days",
        title: "Join the verified supplier network",
        rationale: "Early access to trusted supply removes guesswork from your sourcing while you focus on customers.",
        view: "procurement",
        actionLabel: "Meet suppliers",
      },
    );
  } else if (idx <= 5) {
    base.push(
      {
        dimension: "businessMaturity",
        when: "90-days",
        title: "Strengthen operations before you scale",
        rationale: "Growth exposes weak systems. Fix your operations now so scaling doesn't break them.",
        view: "automation",
        actionLabel: "Optimize operations",
      },
      {
        dimension: "growthReadiness",
        when: "30-days",
        title: "Track customers with a real CRM",
        rationale: "Your existing buyers are your most valuable asset. Manage them with discipline, not memory.",
        view: "crm",
        actionLabel: "Open CRM",
      },
    );
  } else {
    base.push(
      {
        dimension: "founderReadiness",
        when: "90-days",
        title: "Build leadership depth",
        rationale: "At scale, the founder's job shifts from doing to developing. Invest in leaders who can run the machine.",
        view: "recruitment",
        actionLabel: "Plan leadership",
      },
      {
        dimension: "digitalReadiness",
        when: "30-days",
        title: "Integrate your ecosystem",
        rationale: "Connect your tools into one operating system so decisions are informed by the whole business, not silos.",
        view: "integrations",
        actionLabel: "Open Integrations",
      },
    );
  }

  return base;
}

function generateActionPlan(
  scores: HealthScores,
  stage: FounderJourneyStage,
): ActionPlanItem[] {
  const sorted = (Object.keys(DIMENSION_REMEDIES) as AuditDimension[]).sort(
    (a, b) => scores[a] - scores[b],
  );

  const weakestTwo = sorted.slice(0, 2);
  const picked: DimensionRemedy[] = [];
  const used: Record<string, boolean> = {};

  const add = (remedy: DimensionRemedy) => {
    if (used[remedy.title]) return;
    used[remedy.title] = true;
    picked.push(remedy);
  };

  for (const dim of weakestTwo) {
    for (const remedy of DIMENSION_REMEDIES[dim]) {
      if (remedy.when === "now" || remedy.when === "30-days") add(remedy);
    }
  }

  const stageItems = stageBasedRemedies(stage);
  for (const remedy of stageItems) add(remedy);

  // Fill remaining slots across horizons with the highest-leverage remedies.
  const horizons: ActionPlanHorizon[] = ["now", "30-days", "90-days", "long-term"];
  const targetPerHorizon: Record<ActionPlanHorizon, number> = {
    "now": 3,
    "30-days": 4,
    "90-days": 4,
    "long-term": 3,
  };

  for (const dim of sorted) {
    for (const remedy of DIMENSION_REMEDIES[dim]) {
      add(remedy);
    }
  }

  const byHorizon: Record<ActionPlanHorizon, DimensionRemedy[]> = {
    "now": [],
    "30-days": [],
    "90-days": [],
    "long-term": [],
  };
  for (const remedy of picked) byHorizon[remedy.when].push(remedy);

  // Trim any horizon that overshoots its target (prefer the weakest-dimension remedies).
  for (const horizon of horizons) {
    byHorizon[horizon] = byHorizon[horizon].slice(0, targetPerHorizon[horizon]);
  }

  const plan: ActionPlanItem[] = [];
  let seq = 0;
  for (const horizon of horizons) {
    for (const remedy of byHorizon[horizon]) {
      plan.push({
        id: `plan-${++seq}`,
        horizon,
        title: remedy.title,
        rationale: remedy.rationale,
        view: remedy.view,
        actionLabel: remedy.actionLabel,
      });
    }
  }

  return plan;
}

// ─── Profiles ───────────────────────────────────────────────────────────────

const INDUSTRY_AVATARS: Record<string, string> = {
  fashion: "👗",
  technology: "💻",
  gemstones: "💎",
  agriculture: "🌾",
  manufacturing: "🏭",
  retail: "🛒",
  services: "🤝",
  healthcare: "💆",
};

const INDUSTRY_LABELS: Record<string, string> = {
  fashion: "Fashion & Apparel",
  technology: "Technology & Electronics",
  gemstones: "Gemstones & Minerals",
  agriculture: "Agriculture & Produce",
  manufacturing: "Manufacturing",
  retail: "Retail & Distribution",
  services: "Services & Consulting",
  healthcare: "Health & Beauty",
};

const STAGE_TEAM: Record<string, string> = {
  Idea: "Just me",
  Validation: "Just me",
  Launch: "Just me",
  Operations: "1-5 people",
  Stability: "2-10 people",
  Growth: "5-20 people",
  Scale: "10-50 people",
  Institution: "50+ people",
};

// ─── Main entry ─────────────────────────────────────────────────────────────

export function computeAudit(answers: DiscoveryAnswers, userName: string): BusinessAudit {
  const stageAnswer = answers["stage"];
  const stage = (Array.isArray(stageAnswer) ? stageAnswer[0] : stageAnswer) as FounderJourneyStage | undefined;
  const maturityStage = stage && FOUNDER_JOURNEY_STAGES.includes(stage) ? stage : "Launch";

  const industryValue = answers["industry"];
  const industryKey = Array.isArray(industryValue) ? industryValue[0] : (industryValue ?? "retail");
  const industry = INDUSTRY_LABELS[industryKey] ?? "Retail & Distribution";
  const avatar = INDUSTRY_AVATARS[industryKey] ?? "🚀";

  const businessNameValue = answers["businessName"];
  const businessName = Array.isArray(businessNameValue) ? businessNameValue[0] : (businessNameValue ?? `${userName}'s Business`);

  const visionValue = answers["vision"];
  const vision = Array.isArray(visionValue) ? visionValue[0] : (visionValue ?? "To build a business that creates lasting value.");

  const productsValue = answers["products"];
  const products = Array.isArray(productsValue) ? productsValue[0] : (productsValue ?? "Products & services");
  const productList = products.split(",").map((p) => p.trim()).filter(Boolean).slice(0, 3);

  const roleValue = answers["role"];
  const role = Array.isArray(roleValue) ? roleValue[0] : (roleValue ?? "solo");
  const roleLabel: Record<string, string> = {
    idea: "Founder — exploring an idea",
    solo: "Founder — running everything",
    operator: "Founder — leading a small team",
    leader: "Founder — leading leaders",
  };

  const customersValue = answers["customers"];
  const customers = Array.isArray(customersValue) ? customersValue[0] : (customersValue ?? "local");
  const customerLabel: Record<string, string> = {
    none: "Not selling yet",
    friends: "Friends, family & referrals",
    local: "Local walk-in customers",
    wholesale: "Wholesale & business buyers",
    export: "Cross-border / export buyers",
  };

  const teamAnswer = answers["team"];
  const teamLabel: Record<string, string> = {
    solo: "Just me",
    contractors: "Freelancers & contractors",
    small: "Small full-time team",
    leaders: "Team with leaders & managers",
  };

  const scores = computeScores(answers);
  const actionPlan = generateActionPlan(scores, maturityStage);

  const challengeOptions = DISCOVERY_QUESTIONS.find((q) => q.id === "challenges");
  const goalOptions = DISCOVERY_QUESTIONS.find((q) => q.id === "goals");
  const rawChallenges = answers["challenges"];
  const rawGoals = answers["goals"];
  const challengeValues = Array.isArray(rawChallenges) ? rawChallenges : [];
  const goalValues = Array.isArray(rawGoals) ? rawGoals : [];
  const challenges = challengeOptions?.options
    ?.filter((o) => challengeValues.includes(o.value))
    .map((o) => o.label) ?? [];
  const goals = goalOptions?.options
    ?.filter((o) => goalValues.includes(o.value))
    .map((o) => o.label) ?? [];

  const founderProfile: FounderProfile = {
    name: userName,
    role: roleLabel[role] ?? roleLabel.solo,
    vision,
    leadershipStage: teamLabel[teamAnswer as string] ?? "Just me",
    challenges,
    goals,
    avatar,
  };

  const businessProfile: BusinessProfile = {
    name: businessName,
    industry,
    location: "East Africa",
    teamSize: STAGE_TEAM[maturityStage] ?? "Just me",
    products: productList,
    customers: customerLabel[customers] ?? customerLabel.local,
    revenueStage: scores.growthReadiness >= 75 ? "Scaling" : scores.growthReadiness >= 55 ? "Growing" : "Early",
    growthStage: maturityStage,
    operationalMaturity:
      scores.businessMaturity >= 80 ? "Advanced" : scores.businessMaturity >= 55 ? "Organized" : scores.businessMaturity >= 35 ? "Basic" : "Informal",
    digitalPresence:
      scores.digitalReadiness >= 80 ? "Strong" : scores.digitalReadiness >= 55 ? "Moderate" : scores.digitalReadiness >= 35 ? "Minimal" : "None",
    marketplaceReadiness:
      scores.marketplaceReadiness >= 80 ? "Export-ready" : scores.marketplaceReadiness >= 55 ? "Ready" : "Starting",
  };

  return {
    founderProfile,
    businessProfile,
    scores,
    actionPlan,
    maturityStage,
    completedAt: new Date().toISOString(),
  };
}

export function scoreTone(score: number): { label: string; tone: "low" | "medium" | "high" } {
  if (score >= 70) return { label: "Strong", tone: "high" };
  if (score >= 45) return { label: "Developing", tone: "medium" };
  return { label: "Foundation", tone: "low" };
}
