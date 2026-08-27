import {
  CapabilityDefinition,
  MembershipConfig,
  EcosystemConfig,
  BusinessCapability,
  Course,
  Currency,
  DropshippingConfig,
} from "../types";

// ============================================
// BirichiNex™️ Business Capabilities Registry
// ============================================

export const CAPABILITIES: CapabilityDefinition[] = [
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, source, product catalogues, suppliers, B2B and B2C commerce",
    icon: "Store",
    color: "#007AFF",
    tier: "silver",
    modules: [
      { id: "product-catalog", name: "Product Catalog", description: "Browse and manage products", capability: "marketplace", isActive: true },
      { id: "supplier-network", name: "Supplier Network", description: "Connect with verified suppliers", capability: "marketplace", isActive: true },
      { id: "b2b-commerce", name: "B2B Commerce", description: "Business-to-business transactions", capability: "marketplace", isActive: true },
      { id: "b2c-commerce", name: "B2C Commerce", description: "Business-to-consumer sales", capability: "marketplace", isActive: true },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Customer management, leads, communication, support, sales pipeline",
    icon: "Users",
    color: "#5856D6",
    tier: "silver",
    modules: [
      { id: "contacts", name: "Contacts", description: "Manage customer contacts", capability: "crm", isActive: true },
      { id: "leads", name: "Leads", description: "Track and nurture leads", capability: "crm", isActive: true },
      { id: "pipeline", name: "Sales Pipeline", description: "Visual sales pipeline", capability: "crm", isActive: true },
      { id: "support", name: "Support Tickets", description: "Customer support management", capability: "crm", isActive: true },
    ],
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Stock management, warehouses, product movement, forecasting",
    icon: "Package",
    color: "#FF9500",
    tier: "silver",
    modules: [
      { id: "stock-tracking", name: "Stock Tracking", description: "Real-time inventory levels", capability: "inventory", isActive: true },
      { id: "warehouses", name: "Warehouses", description: "Multi-warehouse management", capability: "inventory", isActive: true },
      { id: "movements", name: "Stock Movements", description: "Track item movements", capability: "inventory", isActive: true },
      { id: "forecasting", name: "Forecasting", description: "Demand prediction", capability: "inventory", isActive: false },
    ],
  },
  {
    id: "procurement",
    name: "Procurement",
    description: "Supplier management, quotations, purchasing, approvals, contracts",
    icon: "ShoppingCart",
    color: "#FF2D55",
    tier: "gold",
    modules: [
      { id: "purchase-orders", name: "Purchase Orders", description: "Create and manage POs", capability: "procurement", isActive: true },
      { id: "quotations", name: "Quotations", description: "Request and compare quotes", capability: "procurement", isActive: true },
      { id: "approvals", name: "Approvals", description: "Approval workflows", capability: "procurement", isActive: false },
    ],
  },
  {
    id: "logistics",
    name: "Logistics",
    description: "Shipping, fulfillment, tracking, import/export, supply chain",
    icon: "Truck",
    color: "#34C759",
    tier: "gold",
    modules: [
      { id: "shipping", name: "Shipping", description: "Manage shipments", capability: "logistics", isActive: true },
      { id: "tracking", name: "Tracking", description: "Real-time shipment tracking", capability: "logistics", isActive: true },
      { id: "fulfillment", name: "Fulfillment", description: "Order fulfillment workflows", capability: "logistics", isActive: false },
    ],
  },
  {
    id: "payments",
    name: "Payments",
    description: "Payment gateways, subscriptions, invoicing, digital wallets",
    icon: "CreditCard",
    color: "#AF52DE",
    tier: "silver",
    modules: [
      { id: "invoicing", name: "Invoicing", description: "Generate and send invoices", capability: "payments", isActive: true },
      { id: "payment-gateway", name: "Payment Gateway", description: "Accept payments online", capability: "payments", isActive: true },
      { id: "subscriptions", name: "Subscriptions", description: "Recurring billing", capability: "payments", isActive: false },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Accounting, reporting, budgeting, lending, payroll",
    icon: "TrendingUp",
    color: "#00C7BE",
    tier: "gold",
    modules: [
      { id: "accounting", name: "Accounting", description: "Double-entry bookkeeping", capability: "finance", isActive: true },
      { id: "reports", name: "Financial Reports", description: "P&L, balance sheets, cash flow", capability: "finance", isActive: true },
      { id: "budgeting", name: "Budgeting", description: "Budget planning and tracking", capability: "finance", isActive: false },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Contracts, invoices, digital signatures, compliance records",
    icon: "FileText",
    color: "#8E8E93",
    tier: "silver",
    modules: [
      { id: "doc-manager", name: "Document Manager", description: "Organize business documents", capability: "documents", isActive: true },
      { id: "e-signatures", name: "E-Signatures", description: "Digital document signing", capability: "documents", isActive: false },
    ],
  },
  {
    id: "ai",
    name: "AI Assistant",
    description: "Business intelligence, automation, assistants, forecasting",
    icon: "Sparkles",
    color: "#FF6482",
    tier: "silver",
    modules: [
      { id: "advisor", name: "Business Advisor", description: "AI-powered business guidance", capability: "ai", isActive: true },
      { id: "content-gen", name: "Content Generation", description: "AI content creation", capability: "ai", isActive: true },
      { id: "forecasting-ai", name: "AI Forecasting", description: "Predictive analytics", capability: "ai", isActive: false },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Dashboards, KPIs, reporting, business insights",
    icon: "BarChart3",
    color: "#64D2FF",
    tier: "silver",
    modules: [
      { id: "dashboards", name: "Dashboards", description: "Visual business dashboards", capability: "analytics", isActive: true },
      { id: "kpis", name: "KPI Tracking", description: "Key performance indicators", capability: "analytics", isActive: true },
    ],
  },
  {
    id: "automation",
    name: "Automation",
    description: "Workflow automation, approvals, notifications, triggers",
    icon: "Zap",
    color: "#FFD60A",
    tier: "gold",
    modules: [
      { id: "workflows", name: "Workflows", description: "Automated business workflows", capability: "automation", isActive: true },
      { id: "triggers", name: "Triggers", description: "Event-based automations", capability: "automation", isActive: false },
    ],
  },
  {
    id: "entrepreneur-hub",
    name: "Entrepreneur Hub",
    description: "Launch businesses, access products, dropshipping, mentorship, funding",
    icon: "Rocket",
    color: "#30D158",
    tier: "silver",
    modules: [
      { id: "launchpad", name: "Launchpad", description: "Start your business journey", capability: "entrepreneur-hub", isActive: true },
      { id: "dropshipping", name: "Dropshipping", description: "Zero-inventory selling", capability: "entrepreneur-hub", isActive: true },
      { id: "mentorship", name: "Mentorship", description: "Connect with mentors", capability: "entrepreneur-hub", isActive: false },
      { id: "funding", name: "Funding", description: "Access funding opportunities", capability: "entrepreneur-hub", isActive: false },
    ],
  },
  {
    id: "learning",
    name: "Learning Academy",
    description: "Courses, certifications, leadership development, onboarding",
    icon: "GraduationCap",
    color: "#0A84FF",
    tier: "silver",
    modules: [
      { id: "courses", name: "Courses", description: "Business education courses", capability: "learning", isActive: true },
      { id: "certifications", name: "Certifications", description: "Earn certificates", capability: "learning", isActive: true },
    ],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    description: "Talent acquisition, hiring, freelancer management",
    icon: "UserPlus",
    color: "#BF5AF2",
    tier: "platinum",
    modules: [
      { id: "job-board", name: "Job Board", description: "Post and manage jobs", capability: "recruitment", isActive: false },
      { id: "freelancers", name: "Freelancer Network", description: "Find freelancers", capability: "recruitment", isActive: false },
    ],
  },
  {
    id: "community",
    name: "Community",
    description: "Business networking, partnerships, forums, events",
    icon: "Globe",
    color: "#5AC8FA",
    tier: "silver",
    modules: [
      { id: "forums", name: "Forums", description: "Business discussion forums", capability: "community", isActive: true },
      { id: "events", name: "Events", description: "Networking events", capability: "community", isActive: false },
    ],
  },
  {
    id: "identity-access",
    name: "Identity & Access",
    description: "Business profiles, authentication, permissions, security",
    icon: "Shield",
    color: "#48484A",
    tier: "silver",
    modules: [
      { id: "business-profile", name: "Business Profile", description: "Verified business identity", capability: "identity-access", isActive: true },
      { id: "auth", name: "Authentication", description: "Secure login and MFA", capability: "identity-access", isActive: true },
      { id: "roles", name: "Roles & Permissions", description: "Team access control", capability: "identity-access", isActive: true },
    ],
  },
  {
    id: "collaboration",
    name: "Collaboration",
    description: "Teamwork, project management, shared workspaces",
    icon: "MessageSquare",
    color: "#FF9F0A",
    tier: "gold",
    modules: [
      { id: "projects", name: "Projects", description: "Project management", capability: "collaboration", isActive: false },
      { id: "messaging", name: "Messaging", description: "Team communication", capability: "collaboration", isActive: true },
    ],
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "APIs, third-party software, banks, shipping providers",
    icon: "Plug",
    color: "#636366",
    tier: "platinum",
    modules: [
      { id: "api-access", name: "API Access", description: "REST & GraphQL APIs", capability: "integrations", isActive: true },
      { id: "third-party", name: "Third-Party", description: "Connect external services", capability: "integrations", isActive: false },
    ],
  },
  {
    id: "media",
    name: "Media",
    description: "Podcasts, Business TV, webinars, live streaming, marketing content",
    icon: "Play",
    color: "#FF375F",
    tier: "platinum",
    modules: [
      { id: "business-tv", name: "Business TV", description: "Video content platform", capability: "media", isActive: false },
      { id: "podcasts", name: "Podcasts", description: "Business podcasts", capability: "media", isActive: false },
    ],
  },
];

// ============================================
// Membership Configurations
// ============================================

export const MEMBERSHIP_TIERS: MembershipConfig[] = [
  {
    tier: "silver",
    stage: "start",
    label: "Silver — Start",
    description: "For startups and entrepreneurs beginning their journey",
    monthlyPrice: 0,
    currency: "USD",
    features: [
      "Access to Marketplace",
      "Basic CRM",
      "Inventory Tracking",
      "AI Business Advisor",
      "Learning Academy (Beginner)",
      "Community Forums",
      "Business Profile",
      "Entrepreneur Hub Launchpad",
    ],
    moduleAccess: ["marketplace", "crm", "inventory", "payments", "documents", "ai", "analytics", "entrepreneur-hub", "learning", "community", "identity-access"],
    maxTeamMembers: 1,
    apiRateLimit: 100,
    storageGB: 1,
    supportLevel: "community",
  },
  {
    tier: "gold",
    stage: "grow",
    label: "Gold — Grow",
    description: "For growing SMEs and established businesses expanding",
    monthlyPrice: 49,
    currency: "USD",
    features: [
      "Everything in Silver",
      "Procurement & Purchase Orders",
      "Logistics & Shipping",
      "Finance & Accounting",
      "Advanced Analytics",
      "Workflow Automation",
      "Collaboration Tools",
      "AI Content Generation",
      "Priority Support",
    ],
    moduleAccess: ["marketplace", "crm", "inventory", "procurement", "logistics", "payments", "finance", "documents", "ai", "analytics", "automation", "entrepreneur-hub", "learning", "community", "identity-access", "collaboration"],
    maxTeamMembers: 10,
    apiRateLimit: 1000,
    storageGB: 25,
    supportLevel: "priority",
  },
  {
    tier: "platinum",
    stage: "scale",
    label: "Platinum — Scale",
    description: "For businesses ready to scale nationally and internationally",
    monthlyPrice: 199,
    currency: "USD",
    features: [
      "Everything in Gold",
      "Recruitment & Freelancer Network",
      "Media Platform Access",
      "Integrations & API Access",
      "Advanced AI Forecasting",
      "White-label Options",
      "Multi-currency Support",
      "Dedicated Account Manager",
    ],
    moduleAccess: ["marketplace", "crm", "inventory", "procurement", "logistics", "payments", "finance", "documents", "ai", "analytics", "automation", "entrepreneur-hub", "learning", "recruitment", "community", "identity-access", "collaboration", "integrations", "media"],
    maxTeamMembers: 50,
    apiRateLimit: 10000,
    storageGB: 100,
    supportLevel: "dedicated",
  },
  {
    tier: "enterprise",
    stage: "enterprise",
    label: "Enterprise",
    description: "Custom solutions for corporations, NGOs, and government organizations",
    monthlyPrice: null, // Custom pricing
    currency: "USD",
    features: [
      "Everything in Platinum",
      "Custom Module Development",
      "Dedicated Infrastructure",
      "SLA Guarantees",
      "Custom Integrations",
      "On-premise Deployment Options",
      "White-glove Onboarding",
      "Executive Business Reviews",
    ],
    moduleAccess: ["marketplace", "crm", "inventory", "procurement", "logistics", "payments", "finance", "documents", "ai", "analytics", "automation", "entrepreneur-hub", "learning", "recruitment", "community", "identity-access", "collaboration", "integrations", "media"],
    maxTeamMembers: -1, // unlimited
    apiRateLimit: 100000,
    storageGB: 1000,
    supportLevel: "white-glove",
  },
];

// ============================================
// Industry Ecosystems
// ============================================

export const ECOSYSTEMS: EcosystemConfig[] = [
  { id: "fashion", name: "Fashion", description: "Clothing, accessories, and textile supply chains", icon: "Shirt", color: "#FF6482", activeBusinesses: 1240, availableCapabilities: ["marketplace", "crm", "inventory", "procurement", "logistics", "learning", "entrepreneur-hub"] },
  { id: "technology", name: "Technology", description: "Hardware, software, and digital services", icon: "Cpu", color: "#007AFF", activeBusinesses: 890, availableCapabilities: ["marketplace", "crm", "inventory", "logistics", "ai", "integrations"] },
  { id: "gemstones", name: "Gemstones", description: "Ethical sourcing, certification, and trade", icon: "Gem", color: "#AF52DE", activeBusinesses: 340, availableCapabilities: ["marketplace", "crm", "procurement", "documents", "analytics", "logistics"] },
  { id: "agriculture", name: "Agriculture", description: "Farming, food processing, and distribution", icon: "Leaf", color: "#34C759", activeBusinesses: 560, availableCapabilities: ["marketplace", "inventory", "logistics", "finance", "learning"] },
  { id: "manufacturing", name: "Manufacturing", description: "Production, assembly, and industrial goods", icon: "Factory", color: "#8E8E93", activeBusinesses: 210, availableCapabilities: ["marketplace", "inventory", "procurement", "logistics", "automation", "finance"] },
  { id: "healthcare", name: "Healthcare", description: "Medical supplies, pharmaceuticals, and services", icon: "Heart", color: "#FF375F", activeBusinesses: 180, availableCapabilities: ["marketplace", "inventory", "procurement", "documents", "crm"] },
  { id: "construction", name: "Construction", description: "Building materials, equipment, and services", icon: "Building2", color: "#FF9500", activeBusinesses: 320, availableCapabilities: ["marketplace", "procurement", "logistics", "finance", "documents"] },
  { id: "education", name: "Education", description: "Schools, training, and educational resources", icon: "BookOpen", color: "#0A84FF", activeBusinesses: 150, availableCapabilities: ["learning", "community", "crm", "documents", "media"] },
  { id: "energy", name: "Energy", description: "Power, renewables, and energy solutions", icon: "Zap", color: "#FFD60A", activeBusinesses: 90, availableCapabilities: ["marketplace", "procurement", "logistics", "finance"] },
  { id: "financial-services", name: "Financial Services", description: "Banking, insurance, and fintech", icon: "Landmark", color: "#5856D6", activeBusinesses: 270, availableCapabilities: ["payments", "finance", "documents", "analytics", "ai"] },
  { id: "logistics", name: "Logistics", description: "Transportation, warehousing, and fulfillment", icon: "Truck", color: "#30D158", activeBusinesses: 420, availableCapabilities: ["logistics", "inventory", "analytics"] },
  { id: "government", name: "Government", description: "Public sector and institutional services", icon: "Building", color: "#636366", activeBusinesses: 45, availableCapabilities: ["documents", "procurement", "finance", "analytics", "community"] },
];

// ============================================
// Currency Utilities
// ============================================

export const EXCHANGE_RATES: Record<Currency, number> = {
  TZS: 1.0,
  KES: 0.05,
  UGX: 1.45,
  USD: 0.00037,
  EUR: 0.00034,
  GBP: 0.00029,
  NGN: 0.57,
  GHS: 0.057,
  ZAR: 0.0069,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TZS: "TSh",
  KES: "KSh",
  UGX: "USh",
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  GHS: "GH₵",
  ZAR: "R",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  TZS: "Tanzanian Shilling",
  KES: "Kenyan Shilling",
  UGX: "Ugandan Shilling",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  ZAR: "South African Rand",
};

export function convertPrice(amount: number, from: Currency, to: Currency): number {
  const inBase = amount / EXCHANGE_RATES[from];
  return Math.round(inBase * EXCHANGE_RATES[to]);
}

export function formatPrice(amount: number, currency: Currency, fromCurrency: Currency = "TZS"): string {
  const converted = fromCurrency === currency ? amount : convertPrice(amount, fromCurrency, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === "TZS" || currency === "KES" || currency === "UGX" || currency === "NGN") {
    return `${symbol} ${converted.toLocaleString()}`;
  }
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}




// ============================================
// Course Catalog (Learning Academy)
// ============================================

export const COURSES: Course[] = [
  {
    id: "course-001",
    title: "Start Your First Business",
    description: "A step-by-step guide to launching your business with zero inventory using BirichiNex.",
    category: "business-fundamentals",
    difficulty: "beginner",
    duration: "2 hours",
    tier: "silver",
    completionReward: "Silver Launchpad Badge",
    lessons: [
      { id: "l-001", title: "Understanding the BirichiNex Ecosystem", content: "Learn how BirichiNex connects businesses, suppliers, and entrepreneurs.", duration: "15 min", type: "text" },
      { id: "l-002", title: "Setting Up Your Business Profile", content: "Create your verified BirichiNex business identity.", duration: "10 min", type: "interactive" },
      { id: "l-003", title: "Your First Product Listing", content: "List products on the marketplace and reach buyers.", duration: "20 min", type: "video" },
    ],
  },
  {
    id: "course-002",
    title: "Wholesale Sourcing Mastery",
    description: "Learn to source wholesale product lots and maximize profit margins.",
    category: "sourcing",
    difficulty: "intermediate",
    duration: "3 hours",
    tier: "silver",
    completionReward: "Sourcing Expert Badge",
    lessons: [
      { id: "l-004", title: "European Sourcing Standards", content: "Understanding grade certifications and quality tiers.", duration: "25 min", type: "text" },
      { id: "l-005", title: "Margin Calculation", content: "Calculate unit economics for wholesale products.", duration: "20 min", type: "interactive" },
    ],
  },
  {
    id: "course-003",
    title: "Scale Your Business",
    description: "Advanced strategies for growing from startup to established business.",
    category: "leadership",
    difficulty: "advanced",
    duration: "4 hours",
    tier: "gold",
    completionReward: "Scale Leader Badge",
    lessons: [
      { id: "l-006", title: "Building Your Team", content: "Hiring and managing team members effectively.", duration: "30 min", type: "text" },
      { id: "l-007", title: "Financial Management", content: "Track revenue, expenses, and cash flow.", duration: "25 min", type: "video" },
    ],
  },
  {
    id: "course-004",
    title: "Digital Marketing for Fashion",
    description: "Master Instagram, TikTok, and social media selling strategies.",
    category: "marketing",
    difficulty: "beginner",
    duration: "2.5 hours",
    tier: "silver",
    completionReward: "Digital Marketer Badge",
    lessons: [
      { id: "l-008", title: "Social Media Foundations", content: "Build your brand presence on key platforms.", duration: "20 min", type: "text" },
      { id: "l-009", title: "Content Creation for Fashion", content: "Photography tips and content strategies.", duration: "30 min", type: "video" },
    ],
  },
  {
    id: "course-005",
    title: "Dropshipping Fundamentals",
    description: "Build a profitable dropshipping business without holding inventory, leveraging BirichiNex supplier networks.",
    category: "business-fundamentals",
    difficulty: "beginner",
    duration: "2.5 hours",
    tier: "silver",
    completionReward: "Dropship Pioneer Badge",
    lessons: [
      { id: "l-010", title: "How Dropshipping Works", content: "Understand the dropshipping model, from order placement to fulfillment and customer delivery.", duration: "20 min", type: "text" },
      { id: "l-011", title: "Finding Reliable Suppliers", content: "Evaluate supplier reliability, shipping times, and product quality on the BirichiNex marketplace.", duration: "25 min", type: "interactive" },
      { id: "l-012", title: "Setting Up Your Storefront", content: "Configure your BirichiNex storefront, product pages, and payment options.", duration: "20 min", type: "video" },
    ],
  },
  {
    id: "course-006",
    title: "Financial Planning & Budgeting",
    description: "Master personal and business budgeting, cash flow forecasting, and financial decision-making for SMEs.",
    category: "finance",
    difficulty: "intermediate",
    duration: "3 hours",
    tier: "gold",
    completionReward: "Financial Strategist Badge",
    lessons: [
      { id: "l-013", title: "Building a Business Budget", content: "Create a monthly budget that accounts for fixed costs, variable expenses, and profit targets.", duration: "30 min", type: "text" },
      { id: "l-014", title: "Cash Flow Management", content: "Track money in and out, forecast shortfalls, and maintain healthy working capital.", duration: "25 min", type: "interactive" },
      { id: "l-015", title: "Investment Readiness", content: "Prepare financial statements and projections that attract investors and lenders.", duration: "20 min", type: "video" },
    ],
  },
  {
    id: "course-007",
    title: "Advanced Marketing Analytics",
    description: "Use data-driven insights to optimize your marketing spend, track conversions, and scale campaigns.",
    category: "marketing",
    difficulty: "advanced",
    duration: "3.5 hours",
    tier: "gold",
    completionReward: "Analytics Pro Badge",
    lessons: [
      { id: "l-016", title: "Key Marketing Metrics", content: "Learn CAC, LTV, ROAS, and conversion rate and how they impact your bottom line.", duration: "25 min", type: "text" },
      { id: "l-017", title: "Google Analytics & UTM Tracking", content: "Set up tracking parameters and analyze traffic sources to measure campaign performance.", duration: "30 min", type: "interactive" },
      { id: "l-018", title: "A/B Testing Strategies", content: "Design and execute experiments to improve ad creatives, landing pages, and email campaigns.", duration: "25 min", type: "video" },
      { id: "l-019", title: "Scaling With Data", content: "Use analytics dashboards to allocate budget toward highest-performing channels.", duration: "20 min", type: "text" },
    ],
  },
  {
    id: "course-008",
    title: "Supply Chain Management",
    description: "Optimize your procurement, logistics, and fulfillment processes for faster delivery and lower costs.",
    category: "operations",
    difficulty: "intermediate",
    duration: "3 hours",
    tier: "silver",
    completionReward: "Supply Chain Specialist Badge",
    lessons: [
      { id: "l-020", title: "Mapping Your Supply Chain", content: "Identify every step from raw material sourcing to final customer delivery.", duration: "20 min", type: "text" },
      { id: "l-021", title: "Supplier Negotiation Tactics", content: "Secure better pricing, payment terms, and delivery schedules from your suppliers.", duration: "25 min", type: "video" },
      { id: "l-022", title: "Logistics & Last-Mile Delivery", content: "Choose between courier services, third-party logistics, and in-house delivery options.", duration: "30 min", type: "interactive" },
    ],
  },
  {
    id: "course-009",
    title: "Customer Relationship Mastery",
    description: "Build lasting customer relationships through excellent service, retention strategies, and feedback loops.",
    category: "crm",
    difficulty: "intermediate",
    duration: "2.5 hours",
    tier: "silver",
    completionReward: "Customer Champion Badge",
    lessons: [
      { id: "l-023", title: "Understanding Customer Needs", content: "Use surveys, reviews, and purchase history to anticipate what your customers want.", duration: "20 min", type: "text" },
      { id: "l-024", title: "Handling Complaints & Returns", content: "Turn negative experiences into loyalty through structured complaint resolution processes.", duration: "25 min", type: "video" },
      { id: "l-025", title: "Loyalty Programs & Upselling", content: "Design repeat-purchase incentives and cross-sell strategies that increase lifetime value.", duration: "20 min", type: "interactive" },
    ],
  },
  {
    id: "course-010",
    title: "Cross-Border Trade in East Africa",
    description: "Navigate regulations, tariffs, and logistics for trading across Tanzania, Kenya, Uganda, and Rwanda.",
    category: "operations",
    difficulty: "advanced",
    duration: "4 hours",
    tier: "gold",
    completionReward: "East Africa Trade Badge",
    lessons: [
      { id: "l-026", title: "EAC Trade Agreements", content: "Understand the East African Community customs union and preferential tariff schedules.", duration: "30 min", type: "text" },
      { id: "l-027", title: "Import & Export Documentation", content: "Prepare bills of lading, certificates of origin, and customs declarations correctly.", duration: "25 min", type: "interactive" },
      { id: "l-028", title: "Currency & Payment Risks", content: "Manage exchange rate fluctuations and choose cost-effective cross-border payment methods.", duration: "25 min", type: "video" },
      { id: "l-029", title: "Regional Logistics Networks", content: "Leverage port facilities, dry corridors, and air freight for efficient regional distribution.", duration: "20 min", type: "text" },
    ],
  },
  {
    id: "course-011",
    title: "Building Your Brand Identity",
    description: "Create a memorable brand with professional logos, color palettes, tone of voice, and brand guidelines.",
    category: "marketing",
    difficulty: "beginner",
    duration: "2 hours",
    tier: "silver",
    completionReward: "Brand Architect Badge",
    lessons: [
      { id: "l-030", title: "Brand Story & Values", content: "Define your mission, vision, and core values that resonate with your target audience.", duration: "15 min", type: "text" },
      { id: "l-031", title: "Visual Identity Design", content: "Choose a logo, typography, and color palette that reflect your brand personality.", duration: "25 min", type: "video" },
      { id: "l-032", title: "Consistent Brand Voice", content: "Develop messaging guidelines for social media, packaging, and customer communications.", duration: "20 min", type: "interactive" },
    ],
  },
  {
    id: "course-012",
    title: "Inventory Optimization",
    description: "Reduce overstock and stockouts using demand forecasting, ABC analysis, and just-in-time principles.",
    category: "operations",
    difficulty: "advanced",
    duration: "3.5 hours",
    tier: "gold",
    completionReward: "Inventory Master Badge",
    lessons: [
      { id: "l-033", title: "Demand Forecasting Basics", content: "Use historical sales data and seasonal trends to predict future inventory needs.", duration: "25 min", type: "text" },
      { id: "l-034", title: "ABC Analysis & SKU Rationalization", content: "Classify inventory by value contribution and decide which items to prioritize.", duration: "20 min", type: "interactive" },
      { id: "l-035", title: "Just-In-Time Inventory", content: "Implement JIT principles to reduce holding costs while maintaining service levels.", duration: "25 min", type: "video" },
      { id: "l-036", title: "Automation & Reorder Points", content: "Set up automated reorder alerts and safety stock levels in your inventory system.", duration: "20 min", type: "interactive" },
    ],
  },
  {
    id: "course-013",
    title: "Tax Compliance for SMEs",
    description: "Understand Tanzanian tax obligations, VAT registration, filing deadlines, and record-keeping best practices.",
    category: "finance",
    difficulty: "intermediate",
    duration: "3 hours",
    tier: "silver",
    completionReward: "Tax Savvy Badge",
    lessons: [
      { id: "l-037", title: "Tanzanian Tax Landscape", content: "Overview of income tax, VAT, and withholding tax requirements for small businesses.", duration: "25 min", type: "text" },
      { id: "l-038", title: "VAT Registration & Filing", content: "Step-by-step guide to registering for VAT and submitting accurate quarterly returns.", duration: "30 min", type: "interactive" },
      { id: "l-039", title: "Record-Keeping for Audits", content: "Maintain organized financial records that satisfy TRA audit requirements.", duration: "20 min", type: "video" },
    ],
  },
  {
    id: "course-014",
    title: "Leadership & Team Building",
    description: "Develop leadership skills, build high-performing teams, and foster a culture of accountability and growth.",
    category: "leadership",
    difficulty: "advanced",
    duration: "4.5 hours",
    tier: "platinum",
    completionReward: "Platinum Leader Badge",
    lessons: [
      { id: "l-040", title: "Leadership Styles & Self-Assessment", content: "Identify your natural leadership style and adapt it to different team situations.", duration: "25 min", type: "text" },
      { id: "l-041", title: "Hiring & Onboarding Talent", content: "Write effective job descriptions, conduct structured interviews, and onboard new hires.", duration: "30 min", type: "video" },
      { id: "l-042", title: "Performance Management", content: "Set OKRs, run one-on-ones, and provide constructive feedback that drives results.", duration: "25 min", type: "interactive" },
      { id: "l-043", title: "Conflict Resolution", content: "Address team conflicts early with mediation techniques and clear escalation paths.", duration: "20 min", type: "text" },
      { id: "l-044", title: "Building Company Culture", content: "Establish values-driven rituals, recognition programs, and continuous learning habits.", duration: "20 min", type: "video" },
    ],
  },
  {
    id: "course-015",
    title: "E-Commerce Mastery",
    description: "Build, launch, and scale a successful online store using BirichiNex marketplace tools and digital marketing.",
    category: "business-fundamentals",
    difficulty: "intermediate",
    duration: "3.5 hours",
    tier: "silver",
    completionReward: "E-Commerce Expert Badge",
    lessons: [
      { id: "l-045", title: "Setting Up Your Online Store", content: "Configure your BirichiNex storefront, product pages, pricing, and payment gateways for maximum conversion.", duration: "25 min", type: "interactive" },
      { id: "l-046", title: "Product Photography & Listings", content: "Create compelling product listings with professional photography tips and SEO-optimized descriptions.", duration: "30 min", type: "video" },
      { id: "l-047", title: "Customer Acquisition Strategies", content: "Drive traffic to your store using social media, paid ads, influencer partnerships, and referral programs.", duration: "25 min", type: "text" },
      { id: "l-048", title: "Conversion Optimization", content: "Optimize your checkout flow, reduce cart abandonment, and increase average order value with upselling.", duration: "20 min", type: "interactive" },
    ],
  },
];



// ============================================
// Dropshipping Program
// ============================================

export const DROPSHIP_TIERS: DropshippingConfig[] = [
  {
    tier: "starter",
    label: "Starter",
    description: "Perfect for testing the dropshipping waters. Access our full catalog at standard wholesale prices.",
    monthlyPrice: 0,
    discount: 5,
    deliveryDays: 14,
    features: [
      "Access to full product catalog",
      "5% discount on all products",
      "Standard delivery (14 days)",
      "Basic order tracking",
      "Email support",
      "Up to 20 active products",
    ],
    minOrderValue: 50000,
    maxSKUs: 20,
    prioritySupport: false,
    analyticsAccess: false,
    customBranding: false,
    dedicatedManager: false,
  },
  {
    tier: "growth",
    label: "Growth",
    description: "For serious sellers ready to scale. Better margins, faster delivery, and priority support.",
    monthlyPrice: 78000,
    discount: 15,
    deliveryDays: 7,
    features: [
      "Access to full product catalog",
      "15% discount on all products",
      "Priority delivery (7 days)",
      "Real-time order tracking",
      "Priority email & chat support",
      "Up to 100 active products",
      "Sales analytics dashboard",
      "Bulk order pricing",
      "Seasonal trend reports",
    ],
    minOrderValue: 100000,
    maxSKUs: 100,
    prioritySupport: true,
    analyticsAccess: true,
    customBranding: false,
    dedicatedManager: false,
  },
  {
    tier: "pro",
    label: "Pro",
    description: "For established dropshippers who need premium features and the best margins.",
    monthlyPrice: 213000,
    discount: 25,
    deliveryDays: 3,
    features: [
      "Access to full product catalog",
      "25% discount on all products",
      "Express delivery (3 days)",
      "Live tracking with SMS updates",
      "Dedicated support line",
      "Unlimited active products",
      "Advanced analytics & forecasting",
      "Bulk order pricing + volume discounts",
      "Custom packaging & branding",
      "Seasonal trend reports + early access",
      "Product photography included",
      "Return handling included",
    ],
    minOrderValue: 200000,
    maxSKUs: -1,
    prioritySupport: true,
    analyticsAccess: true,
    customBranding: true,
    dedicatedManager: false,
  },
  {
    tier: "enterprise",
    label: "Enterprise",
    description: "Full white-glove service. Maximum discounts, dedicated support, and custom solutions.",
    monthlyPrice: 538000,
    discount: 35,
    deliveryDays: 1,
    features: [
      "Access to full product catalog",
      "35% discount on all products",
      "Same-day delivery (your city)",
      "Next-day delivery (East Africa)",
      "Dedicated account manager",
      "Custom catalog & pricing",
      "White-label packaging",
      "API access for automation",
      "Custom product sourcing",
      "Priority quality inspection",
      "Dedicated warehouse space",
      "Monthly business review calls",
      "Exclusive early access to new products",
      "Custom payment terms",
    ],
    minOrderValue: 500000,
    maxSKUs: -1,
    prioritySupport: true,
    analyticsAccess: true,
    customBranding: true,
    dedicatedManager: true,
  },
];


// Loyalty Points Configuration
export const LOYALTY_CONFIG = {
  pointsPer150KES: 1,
  pointsToKES: 1,
  tiers: {
    bronze: { minSpend: 0, multiplier: 1 },
    silver: { minSpend: 500000, multiplier: 1.5 },
    gold: { minSpend: 2000000, multiplier: 2 },
    platinum: { minSpend: 5000000, multiplier: 3 },
  },
  expiryDays: 365,
};

export type LoyaltyTier = keyof typeof LOYALTY_CONFIG.tiers;

export function calculateLoyaltyPoints(amountTZS: number, tier: LoyaltyTier = "bronze"): number {
  const tierConfig = LOYALTY_CONFIG.tiers[tier] ?? LOYALTY_CONFIG.tiers.bronze;
  return Math.floor(Math.floor(amountTZS / 150) * LOYALTY_CONFIG.pointsPer150KES * tierConfig.multiplier);
}