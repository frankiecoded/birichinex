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
  | "media"
  | "settings"
  | "membership"
  | "dropshipping"
  | "loyalty"
  | "profile"
  | "ai-advisor";

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
  expiresAt: string;
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
