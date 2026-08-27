// ============================================
// BirichiNex™️ Founder Routines
// The Daily Founder Reflection™️ and the
// Weekly CEO Review™️ — the operating rhythm
// that turns experience into wisdom.
// ============================================

export interface RoutineQuestion {
  key: string;
  label: string;
  hint: string;
}

// ─── The Daily Founder Reflection™️ ─────────────────────────────────────────

export const DAILY_REFLECTION_QUESTIONS: RoutineQuestion[] = [
  {
    key: "progress",
    label: "What meaningful progress did I create today?",
    hint: "Not activity — progress. What moved the business forward?",
  },
  {
    key: "valueDecision",
    label: "What decision produced the greatest value?",
    hint: "Which call today created the most value for customers or the business?",
  },
  {
    key: "challenge",
    label: "What challenge remains unresolved?",
    hint: "Name the problem honestly. Naming it is the first step to solving it.",
  },
  {
    key: "helped",
    label: "Who did I help succeed today?",
    hint: "A customer, a teammate, a partner — helping others is leading.",
  },
  {
    key: "learned",
    label: "What did I learn?",
    hint: "One lesson, clearly captured. Reflection turns experience into wisdom.",
  },
  {
    key: "tomorrow",
    label: "What must improve tomorrow?",
    hint: "Pick the single most important improvement for tomorrow.",
  },
];

export interface DailyReflection {
  id: string;
  date: string;
  answers: Record<string, string>;
  createdAt: string;
}

// ─── The Weekly CEO Review™️ ────────────────────────────────────────────────

export interface WeeklyReviewArea {
  key: string;
  label: string;
  icon: string;
  hint: string;
}

export const WEEKLY_REVIEW_AREAS: WeeklyReviewArea[] = [
  { key: "goals", label: "Strategic Progress", icon: "🎯", hint: "Progress toward the goals that matter most." },
  { key: "finances", label: "Financial Performance", icon: "💰", hint: "Revenue, margins, cash position — the numbers." },
  { key: "operations", label: "Operational Efficiency", icon: "⚙️", hint: "How smoothly did the week run?" },
  { key: "customers", label: "Customer Satisfaction", icon: "❤️", hint: "Feedback, retention, wins and complaints." },
  { key: "team", label: "Team Development", icon: "👥", hint: "People growing, coached, and thriving." },
  { key: "decisions", label: "Key Decisions", icon: "⚖️", hint: "The decisions that moved the needle." },
  { key: "risks", label: "Risks That Emerged", icon: "⚠️", hint: "Anything threatening momentum." },
  { key: "opportunities", label: "Opportunities Spotted", icon: "🌟", hint: "Openings to pursue next week." },
  { key: "learning", label: "Learning From The Week", icon: "📚", hint: "The week's biggest lesson." },
  { key: "priorities", label: "Next Priorities", icon: "📌", hint: "The focus for the week ahead." },
  { key: "leadership", label: "Leadership Effectiveness", icon: "🛡️", hint: "Did you lead as a steward this week?" },
];

export interface WeeklyReview {
  id: string;
  weekLabel: string;
  answers: Record<string, string>;
  createdAt: string;
}

// ─── Review cycles ─────────────────────────────────────────────────────────

export const REVIEW_CYCLES = [
  {
    id: "daily",
    name: "Daily",
    detail: "Daily Founder Reflection™️",
    cadence: "Every working day",
    goal: "Turn daily experience into wisdom.",
    icon: "🌅",
  },
  {
    id: "weekly",
    name: "Weekly",
    detail: "Weekly CEO Review™️",
    cadence: "Every week",
    goal: "Keep execution disciplined and aligned.",
    icon: "📅",
  },
  {
    id: "monthly",
    name: "Monthly",
    detail: "Monthly Business Review",
    cadence: "Every month",
    goal: "Compare this month's performance against your long-term objectives.",
    icon: "📊",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    detail: "Quarterly Strategic Review",
    cadence: "Every quarter",
    goal: "Revisit strategy and adjust the plan.",
    icon: "🧭",
  },
  {
    id: "annual",
    name: "Annual",
    detail: "Annual Institutional Review",
    cadence: "Every year",
    goal: "Evaluate institution strength and legacy progress.",
    icon: "🏛️",
  },
];
