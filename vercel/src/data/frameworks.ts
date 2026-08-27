// ============================================
// BirichiNex™️ Framework Library
// The intellectual property of the BirichiNex
// ecosystem — the practical bridge between
// philosophy and execution.
// ============================================

// ─── The Five BirichiNex Laws ───────────────────────────────────────────────

export interface BirichiNexLaw {
  number: number;
  name: string;
  statement: string;
  meaning: string;
  color: string;
  icon: string;
}

export const LAWS: BirichiNexLaw[] = [
  {
    number: 1,
    name: "The Law of Value",
    statement: "Businesses Create Value. Institutions Create Legacy.",
    meaning: "BirichiNex exists to help entrepreneurs build both — immediate value and enduring institutions.",
    color: "#D4AF37",
    icon: "🏛️",
  },
  {
    number: 2,
    name: "The Law of Ambition",
    statement: "Build Beyond Business.",
    meaning: "Do not stop at a business that generates income. Build an organisation that generates enduring impact.",
    color: "#30D158",
    icon: "🚀",
  },
  {
    number: 3,
    name: "The Law of the Customer",
    statement: "Customers Buy Transformation.",
    meaning: "Every recommendation begins with one question: what transformation is the customer truly seeking?",
    color: "#FF6482",
    icon: "🧭",
  },
  {
    number: 4,
    name: "The Law of Systems",
    statement: "Systems Build Institutions.",
    meaning: "Repeatable systems outlast individual effort. Document, delegate and measure everything that matters.",
    color: "#007AFF",
    icon: "⚙️",
  },
  {
    number: 5,
    name: "The Law of Leadership",
    statement: "Leadership Is Stewardship.",
    meaning: "The purpose of leadership is not control. It is to empower people and build organisations that thrive beyond the founder.",
    color: "#AF52DE",
    icon: "🛡️",
  },
];

// ─── Framework Domain ────────────────────────────────────────────────────────

export type FrameworkDomain =
  | "Institution"
  | "Growth"
  | "Customer"
  | "Founder"
  | "Assessment"
  | "Decision"
  | "Operations"
  | "Leadership"
  | "Partnership"
  | "Innovation"
  | "Review";

// ─── Framework Definition ───────────────────────────────────────────────────

export interface FrameworkDefinition {
  id: string;
  number: number;
  name: string;
  tagline: string;
  domain: FrameworkDomain;
  color: string;
  icon: string;
  principle: string;
  steps: string[];
  whenToApply: string;
}

export const FRAMEWORKS: FrameworkDefinition[] = [
  {
    id: "institution-builder",
    number: 1,
    name: "The Institution Builder Framework™️",
    tagline: "Transform your business into an enduring institution.",
    domain: "Institution",
    color: "#D4AF37",
    icon: "🏛️",
    principle: "Businesses may generate income. Institutions generate enduring impact. This framework guides entrepreneurs through the ten components of an institution.",
    steps: [
      "Purpose — define why your organisation exists beyond profit.",
      "Vision — articulate the future you are building toward.",
      "Leadership — develop leaders, not just followers.",
      "Culture — codify the values people live by daily.",
      "Governance — install ethical decision-making structures.",
      "Systems — document repeatable, scalable processes.",
      "Financial Sustainability — build reserves that outlast volatility.",
      "Innovation — keep improving what you deliver.",
      "Succession — prepare the organisation to thrive beyond you.",
      "Legacy — define the impact you want to leave.",
    ],
    whenToApply: "Apply whenever you discuss long-term growth, scaling, succession or organisational development.",
  },
  {
    id: "business-growth",
    number: 2,
    name: "The Business Growth Framework™️",
    tagline: "Know your stage. Take the next step.",
    domain: "Growth",
    color: "#007AFF",
    icon: "📈",
    principle: "Growth is a journey through defined stages. Every recommendation must consider the entrepreneur's current stage before proposing solutions.",
    steps: [
      "Idea — shaping the concept.",
      "Validation — testing real demand.",
      "Launch — securing your first sales.",
      "Operations — running the business daily.",
      "Stability — achieving reliable income.",
      "Growth — scaling revenue deliberately.",
      "Scale — expanding nationally and beyond.",
      "Institution — building to outlive the founder.",
      "Expansion — entering new markets and ventures.",
      "Legacy — creating impact across generations.",
    ],
    whenToApply: "Apply whenever you need to understand where your business is and what to do next.",
  },
  {
    id: "customer-transformation",
    number: 3,
    name: "The Customer Transformation Framework™️",
    tagline: "Sell outcomes, not products.",
    domain: "Customer",
    color: "#AF52DE",
    icon: "🧭",
    principle: "Customers never truly buy products — they invest in outcomes. Prioritise transformation before discussing products.",
    steps: [
      "What problem exists for the customer?",
      "What outcome does the customer desire?",
      "What emotional need is underneath the purchase?",
      "What transformation does the customer expect?",
      "How will we measure whether the transformation succeeded?",
    ],
    whenToApply: "Apply whenever you design offers, marketing, or customer experience.",
  },
  {
    id: "founder-success",
    number: 4,
    name: "The Founder Success Framework™️",
    tagline: "Master the twelve areas of sustainable success.",
    domain: "Founder",
    color: "#FF6482",
    icon: "🧭",
    principle: "Sustainable success is built across twelve essential areas. Weak areas should receive focused recommendations.",
    steps: [
      "Personal Leadership — lead yourself before leading others.",
      "Vision — know where you are going.",
      "Strategy — decide how you will get there.",
      "Financial Management — master your numbers.",
      "Operations — run the machine reliably.",
      "Sales — convert value into revenue.",
      "Marketing — attract the right customers.",
      "Customer Experience — exceed expectations.",
      "Team Development — grow people, not just roles.",
      "Innovation — keep your offers fresh.",
      "Partnerships — build your ecosystem.",
      "Continuous Learning — never stop getting better.",
    ],
    whenToApply: "Apply whenever you want a holistic health check of your business fundamentals.",
  },
  {
    id: "business-health",
    number: 5,
    name: "The Business Health Assessment™️",
    tagline: "Score your business across ten health indicators.",
    domain: "Assessment",
    color: "#30D158",
    icon: "🩺",
    principle: "Every business should be evaluated across ten health indicators, each with a score and recommendations for improvement.",
    steps: [
      "Vision — clarity and strength of direction.",
      "Customers — who you serve and how well.",
      "Revenue — the scale and reliability of income.",
      "Cash Flow — your capacity to fund operations.",
      "Operations — how smoothly the business runs.",
      "Team — the people powering the business.",
      "Systems — repeatable, documented processes.",
      "Marketing — how you attract demand.",
      "Innovation — how you stay ahead.",
      "Leadership — the quality of your direction.",
    ],
    whenToApply: "Apply as your primary diagnostic whenever you need an objective picture of business health.",
  },
  {
    id: "strategic-decision",
    number: 6,
    name: "The Strategic Decision Framework™️",
    tagline: "Decide with structure, not impulse.",
    domain: "Decision",
    color: "#5856D6",
    icon: "⚖️",
    principle: "Before making important decisions, evaluate every option against a consistent set of questions. Guide through the process rather than jumping to conclusions.",
    steps: [
      "Does this align with our vision?",
      "Does it create customer value?",
      "Is it financially sustainable?",
      "Can it scale?",
      "Does it strengthen our institution?",
      "Does it increase trust?",
      "What are the risks?",
      "What opportunities are created?",
    ],
    whenToApply: "Apply before any major investment, hiring, expansion, or partnership decision.",
  },
  {
    id: "operating-excellence",
    number: 7,
    name: "The Business Operating Excellence Framework™️",
    tagline: "Improve operations across ten dimensions.",
    domain: "Operations",
    color: "#FF9500",
    icon: "⚙️",
    principle: "Every operational recommendation should improve one or more of the ten dimensions of operating excellence.",
    steps: [
      "Efficiency — do more with less waste.",
      "Consistency — deliver the same standard every time.",
      "Quality — raise the bar on output.",
      "Speed — reduce time-to-value.",
      "Profitability — protect and grow margins.",
      "Customer Satisfaction — measure what customers feel.",
      "Scalability — build capacity that grows.",
      "Automation — remove repetitive manual work.",
      "Measurement — track what matters.",
      "Continuous Improvement — always get better.",
    ],
    whenToApply: "Apply when optimising processes, fulfilment, or daily operations.",
  },
  {
    id: "leadership-development",
    number: 8,
    name: "The Leadership Development Framework™️",
    tagline: "Develop in five dimensions. Always.",
    domain: "Leadership",
    color: "#FF375F",
    icon: "👑",
    principle: "Entrepreneurs should continuously develop in five dimensions. Leadership development never stops, regardless of business size.",
    steps: [
      "Character — integrity and responsibility.",
      "Competence — mastery of your craft.",
      "Communication — clarity that moves people.",
      "Decision Making — judgement under pressure.",
      "Institution Building — developing the organisation.",
    ],
    whenToApply: "Apply whenever you invest in yourself, your team, or your next generation of leaders.",
  },
  {
    id: "growth-flywheel",
    number: 9,
    name: "The Growth Flywheel™️",
    tagline: "Sustainable growth is a cycle, not a tactic.",
    domain: "Growth",
    color: "#00C7BE",
    icon: "🎡",
    principle: "Sustainable growth follows a continuous reinforcing cycle. Reinforce the loop rather than relying on isolated tactics.",
    steps: [
      "Purpose — your reason for existing.",
      "Customer Value — deliver something worth paying for.",
      "Trust — prove you can be relied on.",
      "Revenue — convert trust into income.",
      "Reinvestment — put gains back into the business.",
      "Innovation — improve your offer.",
      "Better Customer Value — raise the bar again.",
      "Greater Trust — compound the relationship.",
      "Sustainable Growth — the cycle becomes the engine.",
    ],
    whenToApply: "Apply whenever you plan growth, marketing, or customer retention.",
  },
  {
    id: "partnership",
    number: 10,
    name: "The Partnership Framework™️",
    tagline: "Ecosystems outperform isolated businesses.",
    domain: "Partnership",
    color: "#0A84FF",
    icon: "🤝",
    principle: "Evaluate every partnership against shared values and long-term sustainability. Every partnership should strengthen the ecosystem.",
    steps: [
      "Shared Values — do we believe the same things?",
      "Strategic Fit — do we complement each other?",
      "Mutual Benefit — do both sides win?",
      "Long-Term Sustainability — will this endure?",
      "Trust — can we rely on each other?",
      "Capability — can each side deliver?",
      "Market Opportunity — does it open new doors?",
      "Scalability — can it grow with us?",
    ],
    whenToApply: "Apply before entering supplier, distribution, or joint-venture relationships.",
  },
  {
    id: "innovation",
    number: 11,
    name: "The Innovation Framework™️",
    tagline: "Innovation begins with understanding.",
    domain: "Innovation",
    color: "#FF9F0A",
    icon: "💡",
    principle: "Innovation begins with the customer, not technology. Follow a disciplined sequence from observation to scale.",
    steps: [
      "Observe — study customers and the market.",
      "Understand — grasp the real problem.",
      "Define — state the opportunity clearly.",
      "Design — craft a solution.",
      "Test — prove it with real users.",
      "Measure — capture the outcome.",
      "Improve — refine relentlessly.",
      "Scale — roll out what works.",
    ],
    whenToApply: "Apply whenever you develop a new product, service, or process.",
  },
  {
    id: "legacy",
    number: 12,
    name: "The Legacy Framework™️",
    tagline: "If you left today, would the business endure?",
    domain: "Institution",
    color: "#B8860B",
    icon: "🌳",
    principle: "Every entrepreneur should periodically ask what happens if they leave. If the answer is uncertain, institution building remains incomplete.",
    steps: [
      "If I left today, would the business continue?",
      "Would the culture survive?",
      "Would customers still trust us?",
      "Would employees still thrive?",
      "Would future leaders understand our purpose?",
    ],
    whenToApply: "Apply quarterly — the discipline that turns a founder into an institution builder.",
  },
  {
    id: "weekly-ceo-review",
    number: 13,
    name: "The Weekly CEO Review™️",
    tagline: "A disciplined weekly operating rhythm.",
    domain: "Review",
    color: "#FF6482",
    icon: "📅",
    principle: "Structured weekly review creates disciplined execution. Review progress, performance, decisions, risks and next priorities.",
    steps: [
      "Progress toward strategic goals.",
      "Financial performance.",
      "Operational efficiency.",
      "Customer satisfaction.",
      "Team development.",
      "Key decisions made.",
      "Risks that emerged.",
      "Opportunities spotted.",
      "Learning from the week.",
      "Next priorities.",
      "Leadership effectiveness.",
    ],
    whenToApply: "Apply every week as your CEO operating rhythm. Run it in Founder Routines.",
  },
  {
    id: "daily-founder-reflection",
    number: 14,
    name: "The Daily Founder Reflection™️",
    tagline: "Ten minutes a day develops intentional leadership.",
    domain: "Review",
    color: "#FF9F0A",
    icon: "🌅",
    principle: "At the end of every working day, answer six questions. Reflection turns experience into wisdom.",
    steps: [
      "What meaningful progress did I create today?",
      "What decision produced the greatest value?",
      "What challenge remains unresolved?",
      "Who did I help succeed today?",
      "What did I learn?",
      "What must improve tomorrow?",
    ],
    whenToApply: "Apply every working day. Run it in Founder Routines.",
  },
  {
    id: "build-beyond-business",
    number: 15,
    name: "The Build Beyond Business Assessment™️",
    tagline: "Measure organisational maturity, not just revenue.",
    domain: "Assessment",
    color: "#AF52DE",
    icon: "🚀",
    principle: "Growth is measured not only by revenue but by organisational maturity. Assess whether you are building a product, business, company, organisation, institution — or a legacy.",
    steps: [
      "Product — you have something to sell.",
      "Business — you generate income.",
      "Company — you have structure and people.",
      "Organisation — systems run the operation.",
      "Institution — it outlives any individual.",
      "Legacy — it creates impact across generations.",
    ],
    whenToApply: "Apply to evaluate organisational maturity beyond revenue alone.",
  },
];

export interface FrameworkDomainConfig {
  color: string;
}

export const DOMAIN_META: Record<FrameworkDomain, FrameworkDomainConfig> = {
  Institution: { color: "#D4AF37" },
  Growth: { color: "#007AFF" },
  Customer: { color: "#AF52DE" },
  Founder: { color: "#FF6482" },
  Assessment: { color: "#30D158" },
  Decision: { color: "#5856D6" },
  Operations: { color: "#FF9500" },
  Leadership: { color: "#FF375F" },
  Partnership: { color: "#0A84FF" },
  Innovation: { color: "#FF9F0A" },
  Review: { color: "#00C7BE" },
};

// ─── Build Beyond Business rungs ────────────────────────────────────────────

export const INSTITUTION_RUNGS = [
  { id: "product", label: "Product", description: "You have something to sell." },
  { id: "business", label: "Business", description: "You generate income." },
  { id: "company", label: "Company", description: "You have structure and people." },
  { id: "organisation", label: "Organisation", description: "Systems run the operation." },
  { id: "institution", label: "Institution", description: "It outlives any individual." },
  { id: "legacy", label: "Legacy", description: "Impact across generations." },
] as const;

export type InstitutionRung = (typeof INSTITUTION_RUNGS)[number]["id"];
