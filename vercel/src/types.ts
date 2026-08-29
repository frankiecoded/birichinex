// ============================================
// BirichiNex™️ Platform Type System
// Business Capabilities Architecture
// ============================================

// --- Membership & Identity ---

export type MembershipTier = "silver" | "gold" | "platinum" | "enterprise";

export type MembershipStage = "start" | "grow" | "scale" | "enterprise";

export interface MembershipConfig {
  tier: MembershipTier;
  stage: MembershipStage;
  label: string;
  description: string;
  monthlyPrice: number | null; // null = custom pricing
  currency: string;
  features: string[];
  moduleAccess: BusinessCapability[];
  maxTeamMembers: number;
  apiRateLimit: number;
  storageGB: number;
  supportLevel: "community" | "priority" | "dedicated" | "white-glove";
}

export interface VerifiedBusinessID {
  id: string;
  businessName: string;
  verifiedAt: string;
  tier: MembershipTier;
  trustScore: number; // 0-100
  verificationLevel: "basic" | "enhanced" | "enterprise";
  badges: string[];
}

// --- User & Organization ---

export type UserRole = "owner" | "admin" | "manager" | "member" | "viewer";

export interface BirichiNexUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  preferredCurrency: Currency;
  createdAt: string;
  lastActiveAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  verifiedBusinessId: VerifiedBusinessID;
  membership: MembershipConfig;
  industry: IndustryEcosystem;
  location: BusinessLocation;
  teamMembers: TeamMember[];
  activeCapabilities: BusinessCapability[];
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  role: UserRole;
  joinedAt: string;
  permissions: Permission[];
}

export interface Permission {
  capability: BusinessCapability;
  actions: ("read" | "write" | "delete" | "admin")[];
}

export interface BusinessLocation {
  country: string;
  city: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

// --- Business Capabilities (Core Architecture) ---

export type BusinessCapability =
  | "marketplace"
  | "crm"
  | "inventory"
  | "procurement"
  | "logistics"
  | "payments"
  | "finance"
  | "documents"
  | "ai"
  | "analytics"
  | "automation"
  | "entrepreneur-hub"
  | "learning"
  | "recruitment"
  | "community"
  | "identity-access"
  | "collaboration"
  | "integrations"
  | "media";

export interface CapabilityDefinition {
  id: BusinessCapability;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: ModuleDefinition[];
  tier: MembershipTier; // minimum tier required
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  capability: BusinessCapability;
  isActive: boolean;
}

// --- Industry Ecosystems ---

export type IndustryEcosystem =
  | "fashion"
  | "technology"
  | "gemstones"
  | "agriculture"
  | "manufacturing"
  | "healthcare"
  | "construction"
  | "education"
  | "energy"
  | "financial-services"
  | "logistics"
  | "government";

export interface EcosystemConfig {
  id: IndustryEcosystem;
  name: string;
  description: string;
  icon: string;
  color: string;
  activeBusinesses: number;
  availableCapabilities: BusinessCapability[];
}

// --- Marketplace Types ---

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: PriceAmount;
  images: string[];
  supplier: SupplierReference;
  grade: ProductGrade;
  origin: string;
  specifications: Record<string, string>;
  stock: number;
  minOrder: number;
  createdAt: string;
}

export type ProductGrade = "A+" | "A" | "B+" | "B" | "C";

export interface PriceAmount {
  amount: number;
  currency: Currency;
}

export type Currency = "TZS" | "KES" | "UGX" | "USD" | "EUR" | "GBP" | "NGN" | "GHS" | "ZAR";

export interface SupplierReference {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  location: string;
}

// --- Cart & Orders ---

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: PriceAmount;
  addedAt: string;
}

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "in-transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  organizationId: string;
  items: CartItem[];
  status: OrderStatus;
  total: PriceAmount;
  shippingAddress: BusinessLocation;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

// --- Learning Academy ---

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: Lesson[];
  completionReward: string;
  tier: MembershipTier;
}

export type CourseCategory =
  | "business-fundamentals"
  | "sourcing"
  | "sales"
  | "marketing"
  | "finance"
  | "leadership"
  | "technology"
  | "supply-chain"
  | "operations"
  | "crm";

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  type: "text" | "video" | "quiz" | "interactive";
}

// --- AI Assistant ---

export type AIAssistantType = "advisor" | "analyst" | "creator" | "support";

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  assistantType: AIAssistantType;
  metadata?: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  assistantType: AIAssistantType;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Documents ---

export type DocumentType =
  | "invoice"
  | "quotation"
  | "contract"
  | "receipt"
  | "certificate"
  | "delivery-note"
  | "purchase-order";

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: Record<string, unknown>;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  status: "draft" | "sent" | "viewed" | "approved" | "signed";
}

// --- Finance ---

export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: PriceAmount;
  description: string;
  category: string;
  date: string;
  orderId?: string;
  status: "pending" | "completed" | "failed";
}

export interface FinancialSummary {
  revenue: PriceAmount;
  expenses: PriceAmount;
  profit: PriceAmount;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

// --- Analytics ---

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change: number; // percentage
  trend: "up" | "down" | "neutral";
  icon: string;
}

export interface AnalyticsWidget {
  id: string;
  title: string;
  type: "chart" | "metric" | "table" | "list";
  data: unknown;
  size: "sm" | "md" | "lg" | "xl";
}

// --- App State ---

export type BirichiNexView =
  | "dashboard"
  | "sell"
  | "customers"
  | "products"
  | "money"
  | "orders"
  | "grow"
  | "learn"
  | "account"
  | "marketplace"
  | "crm"
  | "inventory"
  | "procurement"
  | "logistics"
  | "payments"
  | "finance"
  | "documents"
  | "ai"
  | "ai-agent"
  | "finance-agent"
  | "analytics"
  | "automation"
  | "entrepreneur-hub"
  | "learning"
  | "recruitment"
  | "community"
  | "identity-access"
  | "collaboration"
  | "integrations"
  | "media"
  | "settings"
  | "membership"
  | "dropshipping"
  | "loyalty"
  | "profile"
  | "ai-advisor"
  | "frameworks"
  | "routines";

export interface AppState {
  currentView: BirichiNexView;
  user: BirichiNexUser | null;
  organization: Organization | null;
  cart: CartItem[];
  selectedCurrency: Currency;
  sidebarCollapsed: boolean;
  onboardingComplete: boolean;
}

// --- Dropshipping ---

export type DropshippingTier = "starter" | "growth" | "pro" | "enterprise";

export interface DropshippingConfig {
  tier: DropshippingTier;
  label: string;
  description: string;
  monthlyPrice: number; // TZS
  discount: number; // percentage off retail
  deliveryDays: number;
  features: string[];
  minOrderValue: number; // TZS
  maxSKUs: number;
  prioritySupport: boolean;
  analyticsAccess: boolean;
  customBranding: boolean;
  dedicatedManager: boolean;
}

export interface DropshipProduct {
  id: string;
  sourceProductId: string;
  name: string;
  category: string;
  retailPrice: PriceAmount;
  dropshipPrice: PriceAmount;
  discount: number;
  stock: number;
  images: string[];
  description: string;
  origin: string;
  grade: ProductGrade;
}

export type DropshipOrderStatus =
  | "placed"
  | "confirmed"
  | "sourcing"
  | "quality-check"
  | "packed"
  | "shipped"
  | "in-transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface DropshipOrder {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: PriceAmount;
  total: PriceAmount;
  status: DropshipOrderStatus;
  fulfillmentType: "deliver" | "store";
  customerName: string;
  customerAddress: string;
  trackingNumber?: string;
  placedAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  notes: string;
}

export interface DropshippingSubscription {
  tier: DropshippingTier;
  status: "active" | "inactive" | "cancelled";
  subscribedAt: string;
  /** Omitted (undefined) means no expiration — the free Starter tier is permanent. */
  expiresAt?: string;
}

// --- Business Audit (AI Discovery Engine) ---

export const FOUNDER_JOURNEY_STAGES = [
  "Idea",
  "Validation",
  "Launch",
  "Operations",
  "Stability",
  "Growth",
  "Scale",
  "Institution",
  "Expansion",
  "Legacy",
] as const;

export type FounderJourneyStage = (typeof FOUNDER_JOURNEY_STAGES)[number];

export interface FounderProfile {
  name: string;
  role: string;
  vision: string;
  leadershipStage: string;
  challenges: string[];
  goals: string[];
  avatar: string;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  location: string;
  teamSize: string;
  products: string[];
  customers: string;
  revenueStage: string;
  growthStage: FounderJourneyStage;
  operationalMaturity: string;
  digitalPresence: string;
  marketplaceReadiness: string;
}

export interface HealthScores {
  businessHealth: number;
  founderReadiness: number;
  businessMaturity: number;
  growthReadiness: number;
  digitalReadiness: number;
  marketplaceReadiness: number;
}

export type ActionPlanHorizon = "now" | "30-days" | "90-days" | "long-term";

export interface ActionPlanItem {
  id: string;
  horizon: ActionPlanHorizon;
  title: string;
  rationale: string;
  view: BirichiNexView;
  actionLabel: string;
}

export interface BusinessAudit {
  founderProfile: FounderProfile;
  businessProfile: BusinessProfile;
  scores: HealthScores;
  actionPlan: ActionPlanItem[];
  maturityStage: FounderJourneyStage;
  completedAt: string;
}

// --- Closed-Loop Intelligence (BNX Core) ---
// Each recommendation is data-grounded (rationale cites the real signal),
// connected to an action (view + prep), and measurable (measure). Executing
// one records an Outcome so the AI learns what worked for THIS business.

export type RecommendationSource =
  | "diagnosis"
  | "finance"
  | "sales"
  | "inventory"
  | "growth"
  | "advisor"
  | "copilot";

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export type RecommendationStatus = "suggested" | "approved" | "done" | "skipped";

export interface RecommendationMeasure {
  metric: string; // e.g. "Out-of-stock items"
  direction: "up" | "down" | "zero"; // after should be up / down / unchanged vs before
  before?: number;
  after?: number;
  unit?: string; // "TZS" | "items" | "pts" | "score"
}

export interface BusinessRecommendation {
  id: string;
  key: string; // stable dedup key, e.g. "restock", "cashflow", "payables"
  source: RecommendationSource;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
  title: string;
  detail: string;
  rationale: string; // the real signal behind it — never generic
  horizon: ActionPlanHorizon;
  view: BirichiNexView;
  actionLabel: string;
  prep: string; // one-line instruction the copilot can act on
  measure: RecommendationMeasure;
  healthAt?: number; // live health proxy captured when this was diagnosed
  executedAt?: string;
  outcomeId?: string;
}

export interface OutcomeMetric {
  label: string;
  before: number;
  after: number;
  unit: string; // "TZS" | "items" | "pts" | "score"
}

export interface RecommendationOutcome {
  id: string;
  recommendationKey: string;
  recommendationTitle: string;
  summary: string; // what was actually done
  metrics: OutcomeMetric[];
  healthBefore?: number;
  healthAfter?: number;
  recordedAt: string;
  source: RecommendationSource;
}

// --- Loyalty Points ---

export interface LoyaltyTransaction {
  id: string;
  type: "earn" | "redeem" | "expire" | "bonus";
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface LoyaltyState {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  history: LoyaltyTransaction[];
  currentTier: "bronze" | "silver" | "gold" | "platinum";
}

// --- Account Types & Subscription ---

export type AccountType = "shopper" | "business";

export type BillingPeriod = "monthly" | "yearly";
export type PaymentMethod = "card" | "mpesa";
export type PaymentMode = "flutterwave" | "simulation";

export interface SubscriptionState {
  plan: MembershipTier;
  status: "none" | "active" | "cancelled" | "expired";
  startedAt: string;
  /** Omitted (undefined) means the plan has no expiry — the free Silver tier is permanent. */
  expiresAt?: string;
  billingPeriod?: BillingPeriod;
  autoRenew?: boolean;
}

export const PAID_PLANS: MembershipTier[] = ["gold", "platinum", "enterprise"];

// --- Community (forums, partnerships, events, directory, networking) ---

export interface CommunityComment {
  id: string;
  content: string;
  author: string;
  authorCompany: string;
  likes: number;
  likedByUser: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorCompany: string;
  likes: number;
  likedByUser: boolean;
  bookmarkedByUser: boolean;
  comments: CommunityComment[];
  createdAt: string;
}

export type CommunityPartnershipStatus = "proposed" | "active" | "expired" | "declined";

export interface CommunityPartnership {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerCompany: string;
  target: string;
  targetCompany: string;
  category: string;
  status: CommunityPartnershipStatus;
  createdAt: string;
}

export type CommunityEventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerCompany: string;
  status: CommunityEventStatus;
  rsvpCount: number;
  rsvpByUser: boolean;
  maxAttendees: number;
  createdAt: string;
}

export interface CommunityBusiness {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  owner: string;
  rating: number;
  memberSince: string;
  specialties: string[];
  connected: boolean;
}

export type CommunityConnectionStatus = "pending" | "accepted" | "declined";

export interface CommunityConnection {
  id: string;
  from: string;
  fromCompany: string;
  message: string;
  status: CommunityConnectionStatus;
  createdAt: string;
}

// --- Wallet (shopper balance, Amazon/Jumia style) ---

export interface WalletTransaction {
  id: string;
  type: "deposit" | "spend" | "cashback" | "refund" | "loyalty-bonus" | "revenue" | "withdraw";
  amount: number; // in selectedCurrency minor units
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface WalletState {
  balance: number;
  totalDeposited: number;
  totalSpent: number;
  transactions: WalletTransaction[];
}

// --- Business wallet (owner earnings, withdrawable to a bank account) ---

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export interface BankAccountDetails {
  accountBank: string;
  accountNumber: string;
  accountName: string;
  country: string;
  destinationBranchCode?: string;
}

export interface Withdrawal {
  id: string;
  amount: number; // TZS, major units
  currency: "TZS";
  status: WithdrawalStatus;
  bankAccount: BankAccountDetails;
  reference?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWalletState {
  balance: number; // TZS base (displayed in the selected currency)
  totalEarned: number;
  totalWithdrawn: number;
  transactions: WalletTransaction[];
}

// --- AI Sales Agent (Amani) ---

export type AgentVoiceId =
  | "kore"
  | "aria"
  | "leda"
  | "aoede"
  | "puck"
  | "zephyr"
  | "charon"
  | "fenrir";

export type AgentLanguage = "en" | "sw" | "mixed";

export type AgentCallObjective =
  | "inform"
  | "close-sale"
  | "schedule-followup"
  | "collect-details"
  | "survey";

export interface AIAgentConfig {
  name: string;
  tone: "friendly" | "professional" | "warm" | "confident";
  language: AgentLanguage;
  voice: AgentVoiceId;
  openingPhrases: string[];
  closingPhrases: string[];
  callObjective: AgentCallObjective;
  humanTouch: boolean;
  workingHours: { enabled: boolean; start: string; end: string };
  autoFollowUp: boolean;
  followUpHours: number;
  answerCalls: boolean;
  recordCalls: boolean;
  sendOwnerEmails: boolean;
  repeatOrders: boolean;
  knowledge: string[];
}

export interface TranscriptLine {
  speaker: "agent" | "customer";
  text: string;
}

export type AgentCallType =
  | "inbound"
  | "outbound-followup"
  | "outbound-sales"
  | "outbound-cart-recovery";

export type AgentCallOutcome =
  | "order-placed"
  | "order-repeated"
  | "order-status"
  | "query-answered"
  | "callback-requested"
  | "voicemail"
  | "no-answer"
  | "unresolved";

export interface AgentCall {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: AgentCallType;
  status: "completed" | "voicemail" | "no-answer" | "missed";
  outcome: AgentCallOutcome;
  durationSec: number;
  transcript: TranscriptLine[];
  orderId?: string;
  reorderProductId?: string;
  createdAt: string;
  summary: string;
}

// --- Notifications & Owner Email Inbox ---

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "call" | "order" | "payment" | "system" | "lead";
  read: boolean;
  createdAt: string;
  actionView?: BirichiNexView;
}

export interface OwnerEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  kind: "call-transcript" | "order-update" | "follow-up" | "alert";
  read: boolean;
  createdAt: string;
}
