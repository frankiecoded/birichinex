import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BirichiNexView,
  Currency,
  Product,
  CartItem,
  AIAssistantType,
  AIConversation,
  AIMessage,
  MembershipTier,
  DropshippingTier,
  DropshippingSubscription,
  DropshipOrder,
  DropshipOrderStatus,
  LoyaltyTransaction,
  LoyaltyState,
  BusinessAudit,
  AccountType,
  SubscriptionState,
  WalletState,
  BusinessWalletState,
  BillingPeriod,
  Withdrawal,
  WithdrawalStatus,
  BankAccountDetails,
  AIAgentConfig,
  AgentCall,
  AppNotification,
  OwnerEmail,
  CommunityPost,
  CommunityComment,
  CommunityPartnership,
  CommunityPartnershipStatus,
  CommunityEvent,
  CommunityBusiness,
  CommunityConnection,
  CommunityConnectionStatus,
} from '../types';
import { hashPassword, verifyPassword, isHashedPassword } from "../lib/password";
import { computeAudit, type DiscoveryAnswers } from '../../ai/src/discovery';
import type {
  FinanceAction,
  FinanceApprovalEvent,
  UserBusinessDataset,
} from '../../ai/src/finance-agent';
import type { BusinessRecommendation, RecommendationOutcome, RecommendationStatus } from '../types';
import { COURSES, DROPSHIP_TIERS, calculateLoyaltyPoints, MEMBERSHIP_TIERS, convertPrice } from '../data/platform';
import type { TrackedOrder, TrackedShipment, TrackingStatus } from '../data/delivery';
import type { DailyReflection, WeeklyReview } from '../data/routines';

// ── Document Types ───────────────────────────────────────────────────────────

export type DocumentCategory = 'Legal' | 'Financial' | 'HR' | 'Operations' | 'Compliance';
export type DocumentStatus = 'draft' | 'review' | 'signed' | 'archived';

export interface DocumentSignature {
  id: string;
  signerName: string;
  signedAt: string;
  method: 'draw' | 'type';
}

export interface AppDocument {
  id: string;
  title: string;
  type: 'contract' | 'invoice' | 'proposal' | 'certificate' | 'license';
  category: DocumentCategory;
  content: string;
  status: DocumentStatus;
  size: string;
  createdAt: string;
  updatedAt: string;
  signatures: DocumentSignature[];
  attachments: string[];
  templateId?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: AppDocument['type'];
  category: DocumentCategory;
  description: string;
  content: string;
  icon: string;
}

// ── Seed data (empty state — every shop starts clean and records its own) ────

const SEED_COURSES = COURSES.reduce<
  Record<string, { started: boolean; completedLessons: string[]; completed: boolean; startedAt: string }>
>((acc, c) => {
  acc[c.id] = { started: false, completedLessons: [], completed: false, startedAt: '' };
  return acc;
}, {});

// ── Types ────────────────────────────────────────────────────────────────────

interface LoginHistoryEntry {
  id: string;
  email: string;
  device: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  createdAt: string;
  lastStatus: "idle" | "success" | "failed";
  lastPing?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: 'lead' | 'active' | 'inactive';
  tags: string[];
  notes: string;
  createdAt: string;
  lastContactAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: { amount: number; currency: Currency };
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  supplier: string;
  lastRestocked: string;
  source: 'manual' | 'dropship';
  postedToMarketplace: boolean;
  marketplacePrice?: { amount: number; currency: Currency };
}

interface TransactionItem {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: { amount: number; currency: Currency };
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

interface AppSettings {
  profile: { name: string; email: string; phone: string; company: string; language?: string; city?: string; country?: string };
  notifications: { email: boolean; push: boolean; sms: boolean };
  theme: 'light' | 'dark' | 'system';
  payoutBank: BankAccountDetails | null;
}

interface StoreState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: { email: string; name: string; accountType: AccountType } | null;
  authView: 'login' | 'signup' | 'forgot' | null;
  introComplete: boolean;
  entrySeen: boolean;
  users: Record<
    string,
    {
      name: string;
      accountType: AccountType;
      createdAt: string;
      password?: string;
      twoFactorCode?: string;
      recoveryCodes?: string[];
    }
  >;
  login: (email: string, name: string, accountType?: AccountType) => void;
  signup: (email: string, name: string, accountType: AccountType, password?: string) => void;
  attemptLogin: (email: string, password: string) => { ok: boolean; error?: string; needsTwoFactor?: boolean; name?: string };
  verifyTwoFactor: (email: string, code: string) => { ok: boolean; error?: string };
  changePassword: (currentPassword: string, newPassword: string) => { ok: boolean; error?: string };
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  enableTwoFactor: (code: string) => { ok: boolean; error?: string; recoveryCodes?: string[] };
  disableTwoFactor: (code: string) => { ok: boolean; error?: string };
  rotateRecoveryCodes: () => string[];
  loginHistory: LoginHistoryEntry[];
  sessions: ActiveSession[];
  revokeSession: (id: string) => void;
  apiKey: string;
  rotateApiKey: () => string;
  webhooks: WebhookConfig[];
  addWebhook: (w: Omit<WebhookConfig, "id" | "createdAt" | "lastStatus">) => void;
  removeWebhook: (id: string) => void;
  testWebhook: (id: string) => void;
  setAccountType: (type: AccountType) => void;
  logout: () => void;
  setAuthView: (view: 'login' | 'signup' | 'forgot' | null) => void;
  setIntroComplete: (v: boolean) => void;
  setEntrySeen: (v: boolean) => void;
  updateUser: (partial: Partial<{ name: string; email: string }>) => void;

  // ── Core ───────────────────────────────────────────────────────────────────
  currentView: BirichiNexView;
  appMode: 'shopping' | 'business';
  selectedCurrency: Currency;
  shopView: string;

  // ── On-demand AI setup ──────────────────────────────────────────────────────
  aiSetupOpen: boolean;
  openAiSetup: () => void;
  closeAiSetup: () => void;

  // ── Cart ───────────────────────────────────────────────────────────────────
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartRedeem: { points: number; value: number } | null;
  setCartRedeem: (redemption: { points: number; value: number } | null) => void;
  clearCartRedeem: () => void;

  // ── Orders ─────────────────────────────────────────────────────────────────
  orders: TrackedOrder[];
  addOrder: (order: TrackedOrder) => void;
  updateOrderStatus: (id: string, status: TrackingStatus, note: string, lat: number, lng: number, location: string) => void;

  // ── Shipments ──────────────────────────────────────────────────────────────
  shipments: TrackedShipment[];
  addShipment: (shipment: TrackedShipment) => void;
  updateShipment: (id: string, updates: Partial<TrackedShipment>) => void;
  deleteShipment: (id: string) => void;
  advanceShipment: (id: string, status: TrackingStatus, note: string, lat: number, lng: number, location: string) => void;

  // ── CRM ────────────────────────────────────────────────────────────────────
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  contactSearchQuery: string;
  setContactSearchQuery: (q: string) => void;
  contactFilter: string;
  setContactFilter: (f: string) => void;

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addToInventoryFromDropship: (productId: string, productName: string, category: string, quantity: number, unitPrice: { amount: number; currency: Currency }, supplier: string) => void;
  postItemToMarketplace: (id: string, marketplacePrice: { amount: number; currency: Currency }) => void;
  removeItemFromMarketplace: (id: string) => void;
  inventorySearchQuery: string;
  setInventorySearchQuery: (q: string) => void;

  // ── Finance ────────────────────────────────────────────────────────────────
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<TransactionItem>) => void;
  deleteTransaction: (id: string) => void;
  transactionsFilter: string;
  setTransactionsFilter: (f: string) => void;

  // ── Learning ───────────────────────────────────────────────────────────────
  courseProgress: Record<
    string,
    { started: boolean; completedLessons: string[]; completed: boolean; startedAt: string }
  >;
  startCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;

  // ── AI ─────────────────────────────────────────────────────────────────────
  aiConversations: AIConversation[];
  currentConversationId: string | null;
  addMessage: (conversationId: string, message: AIMessage) => void;
  createConversation: (assistantType: AIAssistantType) => string;
  deleteConversation: (conversationId: string) => void;

  // ── Membership ─────────────────────────────────────────────────────────────
  currentTier: MembershipTier;
  activateSubscription: (plan: MembershipTier, billingPeriod?: BillingPeriod, autoRenew?: boolean) => void;
  downgradeToFree: () => void;
  subscription: SubscriptionState;
  cancelSubscription: () => void;
  setAutoRenew: (autoRenew: boolean) => void;
  businessWallet: BusinessWalletState;
  creditWalletRevenue: (amountTZS: number, description: string, orderId?: string) => void;
  withdrawFromWallet: (amountTZS: number, bankAccount: BankAccountDetails) => void;
  updateWithdrawalStatus: (id: string, status: WithdrawalStatus, message?: string) => void;
  withdrawals: Withdrawal[];
  upgradeReminderDismissed: boolean;
  dismissUpgradeReminder: () => void;

  // ── Wallet (shopper balance) ────────────────────────────────────────────────
  wallet: WalletState;
  addWalletFunds: (amount: number, description?: string) => void;
  spendWalletFunds: (amount: number, description?: string) => boolean;
  awardWalletCashback: (amount: number, description?: string) => void;

  // ── Settings ───────────────────────────────────────────────────────────────
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  savePayoutBank: (details: BankAccountDetails) => void;

  // ── Dropshipping ──────────────────────────────────────────────────────────
  dropshipSubscription: DropshippingSubscription;
  subscribeDropship: (tier: DropshippingTier) => void;
  dropshipOrders: DropshipOrder[];
  placeDropshipOrder: (order: Omit<DropshipOrder, 'id' | 'placedAt' | 'updatedAt'>) => void;
  updateDropshipOrderStatus: (id: string, status: DropshipOrderStatus) => void;
  cancelDropshipOrder: (id: string) => void;

  // ── Loyalty Points ────────────────────────────────────────────────────────
  loyalty: LoyaltyState;
  addLoyaltyPoints: (points: number, description: string, orderId?: string) => void;
  redeemLoyaltyPoints: (points: number, description: string) => boolean;
  earnPointsFromPurchase: (amountTZS: number) => void;

  // ── Documents ──────────────────────────────────────────────────────────────
  documents: AppDocument[];
  addDocument: (doc: Omit<AppDocument, 'id' | 'createdAt' | 'updatedAt' | 'signatures'>) => void;
  updateDocument: (id: string, updates: Partial<AppDocument>) => void;
  deleteDocument: (id: string) => void;
  signDocument: (id: string, signerName: string, method: 'draw' | 'type') => void;
  documentSearchQuery: string;
  setDocumentSearchQuery: (q: string) => void;
  documentCategoryFilter: string;
  setDocumentCategoryFilter: (f: string) => void;
  documentStatusFilter: string;
  setDocumentStatusFilter: (f: string) => void;

  // ── Business Audit (AI Discovery) ──────────────────────────────────────────
  audit: BusinessAudit | null;
  auditCompleted: boolean;
  runAudit: (answers: DiscoveryAnswers) => void;

  // ── Founder Routines (Daily Reflection + Weekly CEO Review) ─────────────────
  reflections: DailyReflection[];
  weeklyReviews: WeeklyReview[];
  addReflection: (answers: Record<string, string>) => void;
  addWeeklyReview: (answers: Record<string, string>) => void;

  // ── Navigation ─────────────────────────────────────────────────────────────
  setAppMode: (mode: 'shopping' | 'business') => void;
  setShopView: (view: string) => void;
  setCurrentView: (view: BirichiNexView) => void;
  setCurrency: (c: Currency) => void;
  activeHubTab: string;
  setActiveHubTab: (tab: string) => void;

  // ── AI Sales Agent (Amani) ────────────────────────────────────────────────
  aiAgent: AIAgentConfig;
  updateAiAgent: (partial: Partial<AIAgentConfig>) => void;
  agentCalls: AgentCall[];
  logAgentCall: (call: Omit<AgentCall, 'id' | 'createdAt'>) => void;
  updateAgentCall: (id: string, updates: Partial<AgentCall>) => void;

  // ── AI Finance Agent (Zahara) ─────────────────────────────────────────────
  agentActions: FinanceAction[];
  agentApprovals: FinanceApprovalEvent[];
  proposeAgentAction: (action: Omit<FinanceAction, 'id' | 'createdAt' | 'status'>) => void;
  executeAgentAction: (actionId: string, decision: 'approved' | 'denied') => void;
  clearAgentActions: () => void;
  userDataset: UserBusinessDataset | null;
  setUserDataset: (dataset: UserBusinessDataset) => void;

  // ── Closed-Loop Intelligence (BNX Core) ───────────────────────────────────
  recommendations: BusinessRecommendation[];
  outcomes: RecommendationOutcome[];
  mergeRecommendations: (drafts: Omit<BusinessRecommendation, 'createdAt' | 'updatedAt'>[]) => void;
  recordOutcome: (outcome: RecommendationOutcome, linkedRecId?: string) => void;
  setRecommendationStatus: (id: string, status: RecommendationStatus) => void;

  // ── Notifications & Owner Email Inbox ─────────────────────────────────────
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  emails: OwnerEmail[];
  logEmail: (email: Omit<OwnerEmail, 'id' | 'read' | 'createdAt'>) => void;
  markEmailRead: (id: string) => void;

  // ── Community (created by this account, persisted + synced) ──────────────
  community: {
    posts: CommunityPost[];
    partnerships: CommunityPartnership[];
    events: CommunityEvent[];
    businesses: CommunityBusiness[];
    connections: CommunityConnection[];
  };
  addCommunityPost: (post: CommunityPost) => void;
  updateCommunityPost: (id: string, patch: Partial<CommunityPost>) => void;
  deleteCommunityPost: (id: string) => void;
  toggleCommunityPostLike: (id: string) => void;
  toggleCommunityPostBookmark: (id: string) => void;
  addCommunityComment: (postId: string, comment: CommunityComment) => void;
  toggleCommunityCommentLike: (postId: string, commentId: string) => void;
  addCommunityPartnership: (pt: CommunityPartnership) => void;
  setCommunityPartnershipStatus: (id: string, status: CommunityPartnershipStatus) => void;
  deleteCommunityPartnership: (id: string) => void;
  addCommunityEvent: (evt: CommunityEvent) => void;
  toggleCommunityEventRsvp: (id: string) => void;
  deleteCommunityEvent: (id: string) => void;
  setCommunityBusinessConnected: (id: string, connected: boolean) => void;
  setCommunityConnectionStatus: (id: string, status: CommunityConnectionStatus) => void;

  // ── AI Copilot, Guided Tour & Command Palette ────────────────────────────
  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;
  copilotPrompt: string | null;
  setCopilotPrompt: (p: string | null) => void;
  copilotNonce: number;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  guideActive: boolean;
  guideStep: number;
  guideCompleted: boolean;
  startGuide: () => void;
  nextGuideStep: () => void;
  prevGuideStep: () => void;
  endGuide: () => void;

  // ── Cloud sync hydration ─────────────────────────────────────────────────
  hydrate: (data: Record<string, unknown>) => void;
}

// Data slices synced to Supabase (everything except navigation/UI ephemera).
// Keep in sync with StoreState; serialization lives in src/lib/sync.ts.
export const SYNCED_KEYS = [
  "user",
  "introComplete",
  "cart",
  "orders",
  "shipments",
  "contacts",
  "inventoryItems",
  "transactions",
  "courseProgress",
  "aiConversations",
  "currentConversationId",
  "currentTier",
  "subscription",
  "wallet",
  "businessWallet",
  "withdrawals",
  "settings",
  "dropshipSubscription",
  "dropshipOrders",
  "loyalty",
  "documents",
  "audit",
  "auditCompleted",
  "reflections",
  "weeklyReviews",
  "aiAgent",
  "agentCalls",
  "agentActions",
  "agentApprovals",
  "userDataset",
  "recommendations",
  "outcomes",
  "notifications",
  "emails",
  "community",
] as const;

// ── Store ────────────────────────────────────────────────────────────────────

function friendlyDeviceName(ua: string): string {
  if (/iPhone/.test(ua)) return "iPhone — Safari";
  if (/iPad/.test(ua)) return "iPad — Safari";
  if (/Android/.test(ua)) return "Android — Chrome";
  if (/Macintosh|Mac OS/.test(ua)) return "Mac — Safari";
  if (/Windows/.test(ua)) return "Windows — Edge";
  if (/Linux/.test(ua)) return "Linux — Browser";
  return "Web Browser";
}

function timezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "—";
  } catch {
    return "—";
  }
}

function randomCode(prefix: string, len: number): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return prefix + out;
}

function makeSession(email: string): ActiveSession {
  return {
    id: crypto.randomUUID(),
    device: friendlyDeviceName(typeof navigator !== "undefined" ? navigator.userAgent : ""),
    location: timezoneLabel(),
    lastActive: new Date().toISOString(),
    current: true,
  };
}

function makeLoginEvent(email: string, status: "success" | "failed"): LoginHistoryEntry {
  return {
    id: crypto.randomUUID(),
    email,
    device: friendlyDeviceName(typeof navigator !== "undefined" ? navigator.userAgent : ""),
    location: timezoneLabel(),
    time: new Date().toISOString(),
    status,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      user: null,
      authView: null,
      introComplete: false,
      entrySeen: false,
      users: {},
      loginHistory: [],
      sessions: [],

      login: (email, name, accountType) =>
        set((state) => {
          const key = email.trim().toLowerCase();
          const reserved = state.users[key];
          const resolvedType: AccountType = reserved?.accountType ?? accountType ?? 'shopper';
          const resolvedName = reserved?.name ?? name;
          return {
            user: { email, name: resolvedName, accountType: resolvedType },
            users: {
              ...state.users,
              [key]: {
                ...reserved,
                name: resolvedName,
                accountType: resolvedType,
                createdAt: reserved?.createdAt ?? new Date().toISOString(),
              },
            },
            authView: null,
            sessions: [makeSession(key), ...state.sessions.map((s) => ({ ...s, current: false }))].slice(0, 8),
            loginHistory: [makeLoginEvent(key, 'success'), ...state.loginHistory].slice(0, 30),
          };
        }),

      signup: (email, name, accountType, password) =>
        set((state) => {
          const key = email.trim().toLowerCase();
          const reserved = state.users[key];
          const resolvedType = reserved?.accountType ?? accountType;
          const resolvedName = reserved?.name ?? name;
          return {
            user: { email, name: resolvedName, accountType: resolvedType },
            users: {
              ...state.users,
              [key]: {
                ...reserved,
                name: resolvedName,
                accountType: resolvedType,
                createdAt: reserved?.createdAt ?? new Date().toISOString(),
                password: password ? hashPassword(password, key) : reserved?.password,
              },
            },
            authView: null,
          };
        }),

      attemptLogin: (email, password) => {
        const key = email.trim().toLowerCase();
        const rec = get().users[key];
        if (!rec) return { ok: false, error: "No account found for this email." };
        if (rec.password) {
          let matches: boolean;
          if (isHashedPassword(rec.password)) {
            matches = verifyPassword(password, key, rec.password);
          } else {
            matches = rec.password === password;
            if (matches) {
              set((s) => ({
                users: { ...s.users, [key]: { ...rec, password: hashPassword(password, key) } },
              }));
            }
          }
          if (!matches) {
            set((s) => ({ loginHistory: [makeLoginEvent(key, 'failed'), ...s.loginHistory].slice(0, 30) }));
            return { ok: false, error: "Incorrect password. Try again." };
          }
        }
        if (rec.twoFactorCode) return { ok: true, needsTwoFactor: true, name: rec.name };
        return { ok: true, needsTwoFactor: false, name: rec.name };
      },

      verifyTwoFactor: (email, code) => {
        const key = email.trim().toLowerCase();
        const rec = get().users[key];
        if (!rec?.twoFactorCode) return { ok: false, error: "Two-factor authentication is not enabled for this account." };
        const trimmed = String(code).trim();
        if (trimmed === rec.twoFactorCode) return { ok: true };
        if (rec.recoveryCodes && rec.recoveryCodes.includes(trimmed)) {
          set((s) => ({
            users: {
              ...s.users,
              [key]: { ...rec, recoveryCodes: rec.recoveryCodes!.filter((c) => c !== trimmed) },
            },
          }));
          return { ok: true };
        }
        return { ok: false, error: "Invalid code. Check your code or use a recovery code." };
      },

      changePassword: (currentPassword, newPassword) => {
        const user = get().user;
        if (!user) return { ok: false, error: "You must be signed in to change your password." };
        const key = user.email.trim().toLowerCase();
        const rec = get().users[key];
        if (rec?.password) {
          const currentMatches = isHashedPassword(rec.password)
            ? verifyPassword(currentPassword, key, rec.password)
            : rec.password === currentPassword;
          if (!currentMatches) {
            return { ok: false, error: "Current password is incorrect." };
          }
        }
        set((s) => ({
          users: {
            ...s.users,
            [key]: {
              ...(rec ?? { name: user.name, accountType: user.accountType, createdAt: new Date().toISOString() }),
              password: hashPassword(newPassword, key),
            },
          },
        }));
        return { ok: true };
      },

      resetPassword: (email, newPassword) => {
        const key = email.trim().toLowerCase();
        const rec = get().users[key];
        if (!rec) return { ok: false, error: "No account found for this email." };
        set((s) => ({ users: { ...s.users, [key]: { ...rec, password: hashPassword(newPassword, key) } } }));
        return { ok: true };
      },

      enableTwoFactor: (code) => {
        const user = get().user;
        if (!user) return { ok: false, error: "You must be signed in to enable two-factor authentication." };
        if (!/^\d{6}$/.test(String(code).trim())) return { ok: false, error: "Enter a 6-digit code." };
        const key = user.email.trim().toLowerCase();
        const recoveryCodes = Array.from({ length: 6 }, () => randomCode("RC-", 10));
        set((s) => {
          const existing = s.users[key];
          return {
            users: {
              ...s.users,
              [key]: {
                name: existing?.name ?? user.name,
                accountType: existing?.accountType ?? user.accountType,
                createdAt: existing?.createdAt ?? new Date().toISOString(),
                password: existing?.password,
                twoFactorCode: String(code).trim(),
                recoveryCodes,
              },
            },
          };
        });
        return { ok: true, recoveryCodes };
      },

      disableTwoFactor: (code) => {
        const user = get().user;
        if (!user) return { ok: false, error: "You must be signed in to disable two-factor authentication." };
        const key = user.email.trim().toLowerCase();
        const rec = get().users[key];
        if (!rec?.twoFactorCode) return { ok: true };
        if (code && code.trim() !== rec.twoFactorCode) return { ok: false, error: "Code doesn't match your two-factor code." };
        set((s) => {
          const existing = s.users[key];
          if (!existing) return s;
          const { twoFactorCode, recoveryCodes, ...rest } = existing;
          return { users: { ...s.users, [key]: rest } };
        });
        return { ok: true };
      },

      rotateRecoveryCodes: () => {
        const user = get().user;
        if (!user) return [];
        const key = user.email.trim().toLowerCase();
        const codes = Array.from({ length: 6 }, () => randomCode("RC-", 10));
        set((s) => {
          const existing = s.users[key];
          return {
            users: {
              ...s.users,
              [key]: {
                name: existing?.name ?? user.name,
                accountType: existing?.accountType ?? user.accountType,
                createdAt: existing?.createdAt ?? new Date().toISOString(),
                password: existing?.password,
                twoFactorCode: existing?.twoFactorCode,
                recoveryCodes: codes,
              },
            },
          };
        });
        return codes;
      },

      revokeSession: (id) =>
        set((state) => {
          const target = state.sessions.find((s) => s.id === id);
          const sessions = state.sessions.filter((s) => s.id !== id);
          if (target?.current) {
            return { user: null, authView: 'login', sessions };
          }
          return { sessions };
        }),

      apiKey: `bnc_live_sk_${randomCode("", 24)}`,

      rotateApiKey: () => {
        const key = `bnc_live_sk_${randomCode("", 24)}`;
        set({ apiKey: key });
        return key;
      },

      webhooks: [],

      addWebhook: (w) =>
        set((state) => ({
          webhooks: [
            {
              ...w,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              lastStatus: "idle",
            },
            ...state.webhooks,
          ],
        })),

      removeWebhook: (id) =>
        set((state) => ({ webhooks: state.webhooks.filter((h) => h.id !== id) })),

      testWebhook: (id) =>
        set((state) => ({
          webhooks: state.webhooks.map((h) =>
            h.id === id
              ? {
                  ...h,
                  lastStatus: Math.random() > 0.25 ? "success" : "failed",
                  lastPing: new Date().toISOString(),
                }
              : h
          ),
        })),

      setAccountType: (type) =>
        set((state) => {
          if (!state.user) return { user: null };
          const key = state.user.email.trim().toLowerCase();
          return {
            user: { ...state.user, accountType: type },
            users: {
              ...state.users,
              [key]: {
                ...state.users[key],
                accountType: type,
              },
            },
          };
        }),

      logout: () =>
        set((state) => ({
          user: null,
          authView: 'login',
          sessions: state.sessions.map((s) => (s.current ? { ...s, current: false } : s)),
        })),
      setAuthView: (view) => set({ authView: view }),
      setIntroComplete: (v) => set({ introComplete: v }),
      setEntrySeen: (v) => set({ entrySeen: v }),

      updateUser: (partial) =>
        set((state) => {
          if (!state.user) return {};
          const oldKey = state.user.email.trim().toLowerCase();
          const newKey = (partial.email ?? state.user.email).trim().toLowerCase();
          const existing = state.users[oldKey];
          const nextUser = { ...state.user, ...partial };
          const users = { ...state.users };
          if (existing) {
            if (oldKey !== newKey) delete users[oldKey];
            users[newKey] = { ...existing, ...(partial.name ? { name: partial.name } : {}) };
          }
          return { user: nextUser, users };
        }),

      // ── Core State ────────────────────────────────────────────────────────
      currentView: 'dashboard',
      appMode: 'shopping',
      selectedCurrency: 'KES',
      shopView: 'home',

      setAppMode: (mode) => set({ appMode: mode }),
      setShopView: (view) => set({ shopView: view }),
      setCurrentView: (view) => set({ currentView: view }),
      setCurrency: (c) => set({ selectedCurrency: c }),
      activeHubTab: "",
      setActiveHubTab: (tab) => set({ activeHubTab: tab }),

      // ── On-demand AI setup ────────────────────────────────────────────────
      aiSetupOpen: false,
      openAiSetup: () => set({ aiSetupOpen: true }),
      closeAiSetup: () => set({ aiSetupOpen: false }),

      // ── Cart ──────────────────────────────────────────────────────────────
      cart: [],

      addToCart: (product) =>
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id,
          );
          if (existingIndex >= 0) {
            const updated = [...state.cart];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
            return { cart: updated };
          }
          const cartItem: CartItem = {
            id: crypto.randomUUID(),
            product,
            quantity: 1,
            unitPrice: product.price,
            addedAt: new Date().toISOString(),
          };
          return { cart: [...state.cart, cartItem] };
        }),

      removeFromCart: (index) =>
        set((state) => ({
          cart: state.cart.filter((_, i) => i !== index),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, Math.min(99, Math.floor(quantity) || 1)) }
              : item,
          ),
        })),

      clearCart: () => set({ cart: [] }),

      cartRedeem: null,
      setCartRedeem: (redemption) => set({ cartRedeem: redemption }),
      clearCartRedeem: () => set({ cartRedeem: null }),

      // ── Orders ──────────────────────────────────────────────────────────────
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [...state.orders, order],
        })),

      updateOrderStatus: (id, status, note, lat, lng, location) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  currentLat: lat,
                  currentLng: lng,
                  deliveredAt: status === 'delivered' ? new Date().toISOString() : o.deliveredAt,
                  events: [
                    ...o.events,
                    { status, timestamp: new Date().toISOString(), location, lat, lng, note },
                  ],
                }
              : o
          ),
        })),

      // ── Shipments ───────────────────────────────────────────────────────────
      shipments: [],

      addShipment: (shipment) =>
        set((state) => ({
          shipments: [shipment, ...state.shipments],
        })),

      updateShipment: (id, updates) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === id ? { ...s, ...updates, kind: 'shipment' } : s
          ),
        })),

      deleteShipment: (id) =>
        set((state) => ({
          shipments: state.shipments.filter((s) => s.id !== id),
        })),

      advanceShipment: (id, status, note, lat, lng, location) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  currentLat: lat,
                  currentLng: lng,
                  deliveredAt: status === 'delivered' ? new Date().toISOString() : s.deliveredAt,
                  events: [
                    ...s.events,
                    { status, timestamp: new Date().toISOString(), location, lat, lng, note },
                  ],
                }
              : s
          ),
        })),

      // ── CRM ───────────────────────────────────────────────────────────────
      contacts: [],
      contactSearchQuery: '',
      contactFilter: 'all',

      addContact: (contact) =>
        set((state) => ({
          contacts: [
            ...state.contacts,
            { ...contact, id: crypto.randomUUID() },
          ],
        })),

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      setContactSearchQuery: (q) => set({ contactSearchQuery: q }),
      setContactFilter: (f) => set({ contactFilter: f }),

      // ── Inventory ─────────────────────────────────────────────────────────
      inventoryItems: [],
      inventorySearchQuery: '',

      addInventoryItem: (item) =>
        set((state) => ({
          inventoryItems: [
            ...state.inventoryItems,
            { ...item, id: crypto.randomUUID() },
          ],
        })),

      updateInventoryItem: (id, updates) =>
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),

      deleteInventoryItem: (id) =>
        set((state) => ({
          inventoryItems: state.inventoryItems.filter((item) => item.id !== id),
        })),

      addToInventoryFromDropship: (productId, productName, category, quantity, unitPrice, supplier) =>
        set((state) => {
          const existingIndex = state.inventoryItems.findIndex(
            (item) => item.name === productName && item.source === 'dropship',
          );
          if (existingIndex >= 0) {
            const updated = [...state.inventoryItems];
            const item = updated[existingIndex];
            const newStock = item.stock + quantity;
            updated[existingIndex] = {
              ...item,
              stock: newStock,
              status: newStock <= 0 ? 'out-of-stock' as const : newStock <= item.minStock ? 'low-stock' as const : 'in-stock' as const,
              lastRestocked: new Date().toISOString(),
            };
            return { inventoryItems: updated };
          }
          return {
            inventoryItems: [
              ...state.inventoryItems,
              {
                id: crypto.randomUUID(),
                name: productName,
                sku: `DS-${productId.toUpperCase().slice(0, 8)}`,
                category,
                stock: quantity,
                minStock: 2,
                price: unitPrice,
                unit: 'unit',
                status: 'in-stock' as const,
                supplier,
                lastRestocked: new Date().toISOString(),
                source: 'dropship' as const,
                postedToMarketplace: false,
              },
            ],
          };
        }),

      postItemToMarketplace: (id, marketplacePrice) =>
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) =>
            item.id === id ? { ...item, postedToMarketplace: true, marketplacePrice } : item,
          ),
        })),

      removeItemFromMarketplace: (id) =>
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) =>
            item.id === id ? { ...item, postedToMarketplace: false } : item,
          ),
        })),

      setInventorySearchQuery: (q) => set({ inventorySearchQuery: q }),

      // ── Finance ───────────────────────────────────────────────────────────
      transactions: [],
      transactionsFilter: 'all',

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...tx, id: crypto.randomUUID() },
          ],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setTransactionsFilter: (f) => set({ transactionsFilter: f }),

      // ── Learning ──────────────────────────────────────────────────────────
      courseProgress: SEED_COURSES,

      startCourse: (courseId) =>
        set((state) => ({
          courseProgress: {
            ...state.courseProgress,
            [courseId]: {
              started: true,
              completedLessons: [],
              completed: false,
              startedAt: new Date().toISOString(),
            },
          },
        })),

      completeLesson: (courseId, lessonId) =>
        set((state) => {
          const current = state.courseProgress[courseId];
          if (!current || current.completedLessons.includes(lessonId)) {
            return state;
          }
          const updatedLessons = [...current.completedLessons, lessonId];
          const course = COURSES.find((c) => c.id === courseId);
          const isComplete =
            course !== undefined &&
            updatedLessons.length >= course.lessons.length;
          return {
            courseProgress: {
              ...state.courseProgress,
              [courseId]: {
                ...current,
                completedLessons: updatedLessons,
                completed: isComplete,
              },
            },
          };
        }),

      // ── AI ────────────────────────────────────────────────────────────────
      aiConversations: [],
      currentConversationId: null,

      createConversation: (assistantType) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const conversation: AIConversation = {
          id,
          assistantType,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          aiConversations: [...state.aiConversations, conversation],
          currentConversationId: id,
        }));
        return id;
      },

      addMessage: (conversationId, message) =>
        set((state) => ({
          aiConversations: state.aiConversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : conv,
          ),
        })),

      deleteConversation: (conversationId) =>
        set((state) => ({
          aiConversations: state.aiConversations.filter((conv) => conv.id !== conversationId),
          currentConversationId:
            state.currentConversationId === conversationId ? null : state.currentConversationId,
        })),

      // ── Membership ────────────────────────────────────────────────────────
      currentTier: 'silver',

      activateSubscription: (plan, billingPeriod = 'monthly', autoRenew = true) => {
        const days = billingPeriod === 'yearly' ? 365 : 30;
        const starts = new Date().toISOString();
        const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        set((state) => {
          const tier = MEMBERSHIP_TIERS.find((t) => t.tier === plan);
          const monthly = tier?.monthlyPrice ?? 0;
          const billed = billingPeriod === 'yearly' ? monthly * 10 : monthly;
          const revenueTZS = billed > 0 ? convertPrice(billed, 'USD', 'TZS') : 0;
          return {
            currentTier: plan,
            subscription: {
              plan,
              status: 'active',
              startedAt: starts,
              expiresAt: expires,
              billingPeriod,
              autoRenew,
            },
            // Subscription revenue accrues to the business wallet (owner payout).
            businessWallet: {
              ...state.businessWallet,
              balance: state.businessWallet.balance + revenueTZS,
              totalEarned: state.businessWallet.totalEarned + revenueTZS,
              transactions: [
                {
                  id: crypto.randomUUID(),
                  type: 'revenue' as const,
                  amount: revenueTZS,
                  description: `BirichiNex ${plan} subscription — ${billingPeriod} plan`,
                  createdAt: new Date().toISOString(),
                },
                ...state.businessWallet.transactions,
              ],
            },
          };
        });
      },

      subscription: {
        // Free Silver tier is permanent — no expiry, no auto-renew.
        plan: 'silver',
        status: 'none',
        startedAt: new Date().toISOString(),
        billingPeriod: undefined,
        autoRenew: false,
      },

      downgradeToFree: () =>
        set((state) => ({
          currentTier: 'silver',
          subscription: {
            plan: 'silver',
            status: 'none',
            startedAt: state.subscription.startedAt,
            billingPeriod: undefined,
            autoRenew: false,
          },
        })),

      cancelSubscription: () =>
        set((state) => ({
          subscription: { ...state.subscription, status: 'cancelled' },
        })),

      setAutoRenew: (autoRenew) =>
        set((state) => ({
          subscription: { ...state.subscription, autoRenew },
        })),

      // ── Business wallet (owner earnings, withdrawable to bank) ────────────
      businessWallet: {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        transactions: [],
      },

      withdrawals: [],

      upgradeReminderDismissed: false,

      dismissUpgradeReminder: () => set({ upgradeReminderDismissed: true }),

      creditWalletRevenue: (amountTZS, description, orderId) =>
        set((state) => ({
          businessWallet: {
            ...state.businessWallet,
            balance: state.businessWallet.balance + amountTZS,
            totalEarned: state.businessWallet.totalEarned + amountTZS,
            transactions: [
              {
                id: crypto.randomUUID(),
                type: 'revenue' as const,
                amount: amountTZS,
                description,
                orderId,
                createdAt: new Date().toISOString(),
              },
              ...state.businessWallet.transactions,
            ],
          },
        })),

      withdrawFromWallet: (amountTZS, bankAccount) => {
        const state = get();
        if (state.businessWallet.balance < amountTZS) return;
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        set({
          businessWallet: {
            ...state.businessWallet,
            balance: state.businessWallet.balance - amountTZS,
            totalWithdrawn: state.businessWallet.totalWithdrawn + amountTZS,
            transactions: [
              {
                id: crypto.randomUUID(),
                type: 'withdraw' as const,
                amount: -amountTZS,
                description: `Withdrawal to ${bankAccount.accountName} •••• ${bankAccount.accountNumber.slice(-4)}`,
                createdAt: now,
              },
              ...state.businessWallet.transactions,
            ],
          },
          withdrawals: [
            {
              id,
              amount: amountTZS,
              currency: 'TZS' as const,
              status: 'pending' as const,
              bankAccount,
              createdAt: now,
              updatedAt: now,
            },
            ...state.withdrawals,
          ],
        });
      },

      updateWithdrawalStatus: (id, status, message) =>
        set((state) => {
          const target = state.withdrawals.find((w) => w.id === id);
          if (!target) return state;
          let businessWallet = state.businessWallet;
          if (status === 'failed' && target.status !== 'completed' && target.status !== 'failed') {
            // Refund the wallet so a failed payout never eats owner earnings.
            businessWallet = {
              ...businessWallet,
              balance: businessWallet.balance + target.amount,
              transactions: [
                {
                  id: crypto.randomUUID(),
                  type: 'refund' as const,
                  amount: target.amount,
                  description: `Refund — withdrawal ${target.bankAccount.accountName} ${target.bankAccount.accountNumber.slice(-4)} failed`,
                  createdAt: new Date().toISOString(),
                },
                ...businessWallet.transactions,
              ],
            };
          }
          return {
            businessWallet,
            withdrawals: state.withdrawals.map((w) =>
              w.id === id
                ? { ...w, status, updatedAt: new Date().toISOString(), message: message ?? w.message }
                : w,
            ),
          };
        }),

      // ── Wallet (shopper balance) ─────────────────────────────────────────
      wallet: {
        balance: 0,
        totalDeposited: 0,
        totalSpent: 0,
        transactions: [],
      },

      addWalletFunds: (amount, description) =>
        set((state) => ({
          wallet: {
            balance: state.wallet.balance + amount,
            totalDeposited: state.wallet.totalDeposited + amount,
            totalSpent: state.wallet.totalSpent,
            transactions: [
              {
                id: crypto.randomUUID(),
                type: 'deposit' as const,
                amount,
                description: description ?? 'Wallet deposit',
                createdAt: new Date().toISOString(),
              },
              ...state.wallet.transactions,
            ],
          },
        })),

      spendWalletFunds: (amount, description) => {
        const state = get();
        if (state.wallet.balance < amount) return false;
        set({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance - amount,
            totalSpent: state.wallet.totalSpent + amount,
            transactions: [
              {
                id: crypto.randomUUID(),
                type: 'spend' as const,
                amount: -amount,
                description: description ?? 'Wallet payment',
                createdAt: new Date().toISOString(),
              },
              ...state.wallet.transactions,
            ],
          },
        });
        return true;
      },

      awardWalletCashback: (amount, description) =>
        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance + amount,
            transactions: [
              {
                id: crypto.randomUUID(),
                type: 'cashback' as const,
                amount,
                description: description ?? 'Purchase cashback',
                createdAt: new Date().toISOString(),
              },
              ...state.wallet.transactions,
            ],
          },
        })),

      // ── Settings ──────────────────────────────────────────────────────────
      settings: {
        profile: {
          name: '',
          email: '',
          phone: '',
          company: '',
          language: 'en',
          city: '',
          country: '',
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        theme: 'light',
        payoutBank: null,
      },

      updateSettings: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...partial,
            profile: { ...state.settings.profile, ...(partial.profile ?? {}) },
            notifications: {
              ...state.settings.notifications,
              ...(partial.notifications ?? {}),
            },
          },
        })),

      savePayoutBank: (details) =>
        set((state) => ({
          settings: { ...state.settings, payoutBank: details },
        })),

      // ── Dropshipping ────────────────────────────────────────────────────
      dropshipSubscription: {
        // Free Starter tier is included with the shop indefinitely.
        tier: 'starter',
        status: 'active',
        subscribedAt: new Date().toISOString(),
      },

      subscribeDropship: (tier) =>
        set({
          dropshipSubscription: {
            tier,
            status: 'active',
            subscribedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }),

      dropshipOrders: [],

      placeDropshipOrder: (order) =>
        set((state) => ({
          dropshipOrders: [
            ...state.dropshipOrders,
            {
              ...order,
              id: `dso-${crypto.randomUUID().slice(0, 8)}`,
              placedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateDropshipOrderStatus: (id, status) =>
        set((state) => ({
          dropshipOrders: state.dropshipOrders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
          ),
        })),

      cancelDropshipOrder: (id) =>
        set((state) => ({
          dropshipOrders: state.dropshipOrders.map((o) =>
            o.id === id ? { ...o, status: 'cancelled' as DropshipOrderStatus, updatedAt: new Date().toISOString() } : o,
          ),
        })),

      // ── Loyalty Points ──────────────────────────────────────────────────
      loyalty: {
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        history: [],
        currentTier: 'bronze',
      },

      addLoyaltyPoints: (points, description, orderId) =>
        set((state) => {
          const tx: LoyaltyTransaction = {
            id: crypto.randomUUID(),
            type: 'earn',
            points,
            description,
            orderId,
            createdAt: new Date().toISOString(),
          };
          const newPoints = state.loyalty.points + points;
          const newTotalEarned = state.loyalty.totalEarned + points;
          let newTier: LoyaltyState['currentTier'] = 'bronze';
          if (newTotalEarned >= 5000000) newTier = 'platinum';
          else if (newTotalEarned >= 2000000) newTier = 'gold';
          else if (newTotalEarned >= 500000) newTier = 'silver';
          return {
            loyalty: {
              ...state.loyalty,
              points: newPoints,
              totalEarned: newTotalEarned,
              history: [tx, ...state.loyalty.history],
              currentTier: newTier,
            },
          };
        }),

      redeemLoyaltyPoints: (points, description) => {
        const state = get();
        if (state.loyalty.points < points) return false;
        const tx: LoyaltyTransaction = {
          id: crypto.randomUUID(),
          type: 'redeem',
          points: -points,
          description,
          createdAt: new Date().toISOString(),
        };
        set({
          loyalty: {
            ...state.loyalty,
            points: state.loyalty.points - points,
            totalRedeemed: state.loyalty.totalRedeemed + points,
            history: [tx, ...state.loyalty.history],
          },
        });
        return true;
      },

      earnPointsFromPurchase: (amountTZS) => {
        const state = get();
        const earned = calculateLoyaltyPoints(amountTZS, state.loyalty.currentTier);
        if (earned > 0) {
          state.addLoyaltyPoints(earned, `Purchase reward: ${earned} points earned`);
        }
      },

      // ── Documents ──────────────────────────────────────────────────────────
      documents: [],
      documentSearchQuery: '',
      documentCategoryFilter: 'all',
      documentStatusFilter: 'all',

      addDocument: (doc) =>
        set((state) => ({
          documents: [
            {
              ...doc,
              id: `doc-${crypto.randomUUID().slice(0, 8)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              signatures: [],
            },
            ...state.documents,
          ],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d,
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      signDocument: (id, signerName, method) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: 'signed' as DocumentStatus,
                  updatedAt: new Date().toISOString(),
                  signatures: [
                    ...d.signatures,
                    {
                      id: `sig-${crypto.randomUUID().slice(0, 8)}`,
                      signerName,
                      signedAt: new Date().toISOString(),
                      method,
                    },
                  ],
                }
              : d,
          ),
        })),

      setDocumentSearchQuery: (q) => set({ documentSearchQuery: q }),
      setDocumentCategoryFilter: (f) => set({ documentCategoryFilter: f }),
      setDocumentStatusFilter: (f) => set({ documentStatusFilter: f }),

      // ── Business Audit (AI Discovery) ──────────────────────────────────────
      audit: null,
      auditCompleted: false,

      runAudit: (answers) =>
        set((state) => {
          const userName = state.user?.name ?? state.settings.profile.name ?? 'Founder';
          const audit = computeAudit(answers, userName);
          return { audit, auditCompleted: true };
        }),

      // ── Founder Routines ───────────────────────────────────────────────────
      reflections: [],
      weeklyReviews: [],

      addReflection: (answers) =>
        set((state) => ({
          reflections: [
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              answers,
              createdAt: new Date().toISOString(),
            },
            ...state.reflections,
          ],
        })),

      addWeeklyReview: (answers) => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const label = `Week of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        set((state) => ({
          weeklyReviews: [
            {
              id: crypto.randomUUID(),
              weekLabel: label,
              answers,
              createdAt: new Date().toISOString(),
            },
            ...state.weeklyReviews,
          ],
        }));
      },

      // ── AI Sales Agent (Amani) ───────────────────────────────────────────
      aiAgent: {
        name: 'Amani',
        tone: 'friendly',
        language: 'mixed',
        voice: 'kore',
        openingPhrases: [
          'Hi {customer}, this is Amani from {business}! Just checking on your order {order} — anything I can help with?',
          'Hello {customer}! Amani here — I see your cart still has items waiting. Want me to place that order for you?',
          'Good day {customer}, Amani from {business}. Quick follow-up on {order} — it is on track, and I found a deal for you.',
        ],
        closingPhrases: [
          'Asante sana, {customer}! Take care and we will talk soon.',
          'Thank you, {customer}. Have a wonderful day and karibu tena!',
        ],
        callObjective: 'inform',
        humanTouch: true,
        workingHours: { enabled: true, start: '08:00', end: '20:00' },
        autoFollowUp: true,
        followUpHours: 4,
        answerCalls: true,
        recordCalls: true,
        sendOwnerEmails: true,
        repeatOrders: true,
        knowledge: ['Speak your customer\'s language', 'Always confirm order numbers', 'Offer loyalty points on repeat orders'],
      },

      updateAiAgent: (partial) =>
        set((state) => ({
          aiAgent: {
            ...state.aiAgent,
            ...partial,
            workingHours: { ...state.aiAgent.workingHours, ...(partial.workingHours ?? {}) },
          },
        })),

      agentCalls: [],

      logAgentCall: (call) =>
        set((state) => ({
          agentCalls: [
            {
              ...call,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.agentCalls,
          ],
        })),

      updateAgentCall: (id, updates) =>
        set((state) => ({
          agentCalls: state.agentCalls.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      // ── AI Finance Agent (Zahara) ─────────────────────────────────────────
      agentActions: [],

      agentApprovals: [],

      userDataset: null,

      setUserDataset: (dataset) => set({ userDataset: dataset }),

      proposeAgentAction: (action) =>
        set((state) => ({
          agentActions: [
            {
              ...action,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              status: 'pending' as const,
            },
            ...state.agentActions,
          ],
        })),

      clearAgentActions: () => set({ agentActions: [] }),

      // ── Closed-Loop Intelligence (BNX Core) ────────────────────────────────
      // Persistent, deduplicated and synced — the same loop that feeds every
      // AI surface (Advisor, Amani, Zahara, Hey BNX) and the Intelligence Board.
      recommendations: [],

      outcomes: [],

      mergeRecommendations: (drafts) =>
        set((state) => {
          const map = new Map(state.recommendations.map((r) => [r.id, r]));
          const now = new Date().toISOString();
          for (const d of drafts) {
            const existing = map.get(d.id);
            if (existing && existing.status !== "suggested") {
              map.set(d.id, { ...d, ...existing, updatedAt: now, measure: { ...d.measure, ...existing.measure } });
            } else {
              map.set(d.id, { ...d, createdAt: existing?.createdAt ?? now, updatedAt: now });
            }
          }
          return { recommendations: [...map.values()] };
        }),

      recordOutcome: (outcome, linkedRecId) =>
        set((state) => {
          const outcomeId = outcome.id;
          return {
            outcomes: [outcome, ...state.outcomes].slice(0, 60),
            recommendations: state.recommendations.map((r) =>
              r.id === linkedRecId || r.key === outcome.recommendationKey
                ? { ...r, status: 'done' as const, outcomeId, executedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : r,
            ),
            ...(state.aiAgent.sendOwnerEmails
              ? {
                  emails: [
                    {
                      id: crypto.randomUUID() as string,
                      to: state.user?.email ?? state.settings.profile.email ?? 'owner@birichinex.com',
                      subject: `Measured: ${outcome.recommendationTitle}`,
                      body: `${outcome.recommendationTitle}\n\n${outcome.summary}\n\nMetrics: ${outcome.metrics.map((m) => `${m.label} ${m.before.toLocaleString()} → ${m.after.toLocaleString()} ${m.unit}`).join('; ') || '—'}\n\nRecorded ${new Date(outcome.recordedAt).toLocaleString()}.`,
                      kind: 'alert' as const,
                      read: false,
                      createdAt: new Date().toISOString(),
                    },
                    ...state.emails,
                  ],
                }
              : {}),
          };
        }),

      setRecommendationStatus: (id, status) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id
              ? { ...r, status, updatedAt: new Date().toISOString(), ...(status === 'approved' ? {} : {}) }
              : r,
          ),
        })),

      // The guardrail gate: no mutation runs until the owner approves.
      executeAgentAction: (actionId, decision) => {
        const state = get();
        const action = state.agentActions.find((a) => a.id === actionId);
        if (!action) return;

        if (decision === 'denied') {
          set((s) => ({
            agentActions: s.agentActions.map((a) =>
              a.id === actionId ? { ...a, status: 'denied' as const } : a,
            ),
            agentApprovals: [
              {
                id: crypto.randomUUID(),
                actionId,
                actionTitle: action.title,
                actionType: action.type,
                amount: action.amount,
                decision: 'denied' as const,
                executed: false,
                note: 'Declined by owner — nothing changed.',
                createdAt: new Date().toISOString(),
              },
              ...s.agentApprovals,
            ],
          }));
          return;
        }

        // Approved — execute the mutation for real.
        let executed = true;
        let note = 'Executed after owner approval.';
        const now = new Date().toISOString();

        switch (action.type) {
          case 'restock': {
            const item = state.inventoryItems.find((i) => i.id === action.targetId);
            if (item) {
              const qty = Math.max(1, item.minStock - item.stock);
              const newStock = item.stock + qty;
              state.updateInventoryItem(item.id, {
                stock: newStock,
                lastRestocked: now,
                status:
                  newStock <= 0
                    ? 'out-of-stock'
                    : newStock <= item.minStock
                      ? 'low-stock'
                      : 'in-stock',
              });
              note = `Restocked ${item.name} by ${qty} units (now ${newStock}).`;
            } else {
              executed = false;
              note = 'Approved, but the inventory item no longer exists.';
            }
            break;
          }
          case 'settle-expense': {
            const pending = state.transactions.filter(
              (t) => t.type === 'expense' && t.status === 'pending',
            );
            if (pending.length === 0) {
              executed = false;
              note = 'Approved, but there were no pending payables to settle.';
            } else {
              pending.forEach((t) => state.updateTransaction(t.id, { status: 'completed' as const }));
              note = `Settled ${pending.length} pending payable(s) (${action.amount?.toLocaleString('en-US') ?? 0} TZS).`;
            }
            break;
          }
          case 'transfer-savings': {
            state.addTransaction({
              type: 'transfer',
              amount: { amount: action.amount ?? 0, currency: 'TZS' },
              description: `Savings transfer via Zahara — ${action.title}`,
              category: 'Savings',
              date: now,
              status: 'completed',
            });
            note = `Transferred ${action.amount?.toLocaleString('en-US') ?? 0} TZS to savings.`;
            break;
          }
          case 'purchase': {
            state.addTransaction({
              type: 'expense',
              amount: { amount: action.amount ?? 0, currency: 'TZS' },
              description: action.targetLabel ?? `Purchase via Zahara — ${action.title}`,
              category: 'Purchases',
              date: now,
              status: 'completed',
            });
            note = `Recorded purchase of ${action.amount?.toLocaleString('en-US') ?? 0} TZS (${action.targetLabel ?? action.title}).`;
            break;
          }
          case 'withdraw': {
            state.addTransaction({
              type: 'expense',
              amount: { amount: action.amount ?? 0, currency: 'TZS' },
              description: `Withdrawal via Zahara — ${action.title}`,
              category: 'Withdrawals',
              date: now,
              status: 'completed',
            });
            note = `Recorded withdrawal of ${action.amount?.toLocaleString('en-US') ?? 0} TZS.`;
            break;
          }
          case 'dropship-order': {
            if (action.amount && action.amount > 0) {
              state.addTransaction({
                type: 'expense',
                amount: { amount: action.amount, currency: 'TZS' },
                description: action.targetLabel ?? 'Dropship order via Zahara',
                category: 'Dropshipping',
                date: now,
                status: 'completed',
              });
              note = `Dropship order placed (${action.amount.toLocaleString('en-US')} TZS) and recorded in the ledger.`;
            } else {
              executed = false;
              note = 'Approved, but the dropship order had no amount to record.';
            }
            break;
          }
          case 'adjust-price': {
            const item = state.inventoryItems.find((i) => i.id === action.targetId);
            if (item && action.amount && action.amount > 0) {
              state.updateInventoryItem(item.id, {
                price: { amount: action.amount, currency: item.price.currency },
              });
              note = `Updated ${item.name} price to ${action.amount.toLocaleString('en-US')} ${item.price.currency}.`;
            } else {
              executed = false;
              note = 'Approved, but the item or target price was missing.';
            }
            break;
          }
          case 'create-budget':
            note = 'Budget rule (70/20/10) recorded for upcoming periods.';
            break;
          case 'set-currency':
            note = 'Currency preference noted for future reports.';
            break;
          default:
            note = 'Planning action recorded — no funds moved.';
        }

        set((s) => ({
          agentActions: s.agentActions.map((a) =>
            a.id === actionId
              ? { ...a, status: (executed ? 'executed' : 'denied') as 'executed' | 'denied' }
              : a,
          ),
          agentApprovals: [
            {
              id: crypto.randomUUID(),
              actionId,
              actionTitle: action.title,
              actionType: action.type,
              amount: action.amount,
              decision: 'approved' as const,
              executed,
              note,
              createdAt: now,
            },
            ...s.agentApprovals,
          ],
        }));
      },

      // ── Notifications & Owner Email Inbox ────────────────────────────────
      notifications: [],

      addNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              ...n,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      emails: [],

      logEmail: (email) =>
        set((state) => ({
          emails: [
            {
              ...email,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.emails,
          ],
        })),

      markEmailRead: (id) =>
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === id ? { ...e, read: true } : e,
          ),
        })),

      // ── Community ────────────────────────────────────────────────────────
      community: {
        posts: [],
        partnerships: [],
        events: [],
        businesses: [],
        connections: [],
      },

      addCommunityPost: (post) =>
        set((state) => ({
          community: { ...state.community, posts: [post, ...state.community.posts] },
        })),
      updateCommunityPost: (id, patch) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),
      deleteCommunityPost: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.filter((p) => p.id !== id),
          },
        })),
      toggleCommunityPostLike: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.map((p) =>
              p.id === id
                ? { ...p, likedByUser: !p.likedByUser, likes: p.likedByUser ? p.likes - 1 : p.likes + 1 }
                : p,
            ),
          },
        })),
      toggleCommunityPostBookmark: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.map((p) =>
              p.id === id ? { ...p, bookmarkedByUser: !p.bookmarkedByUser } : p,
            ),
          },
        })),
      addCommunityComment: (postId, comment) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.map((p) =>
              p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
            ),
          },
        })),
      toggleCommunityCommentLike: (postId, commentId) =>
        set((state) => ({
          community: {
            ...state.community,
            posts: state.community.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    comments: p.comments.map((c) =>
                      c.id === commentId
                        ? { ...c, likedByUser: !c.likedByUser, likes: c.likedByUser ? c.likes - 1 : c.likes + 1 }
                        : c,
                    ),
                  }
                : p,
            ),
          },
        })),
      addCommunityPartnership: (pt) =>
        set((state) => ({
          community: { ...state.community, partnerships: [pt, ...state.community.partnerships] },
        })),
      setCommunityPartnershipStatus: (id, status) =>
        set((state) => ({
          community: {
            ...state.community,
            partnerships: state.community.partnerships.map((p) => (p.id === id ? { ...p, status } : p)),
          },
        })),
      deleteCommunityPartnership: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            partnerships: state.community.partnerships.filter((p) => p.id !== id),
          },
        })),
      addCommunityEvent: (evt) =>
        set((state) => ({
          community: { ...state.community, events: [evt, ...state.community.events] },
        })),
      toggleCommunityEventRsvp: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            events: state.community.events.map((e) =>
              e.id === id
                ? { ...e, rsvpByUser: !e.rsvpByUser, rsvpCount: e.rsvpByUser ? e.rsvpCount - 1 : e.rsvpCount + 1 }
                : e,
            ),
          },
        })),
      deleteCommunityEvent: (id) =>
        set((state) => ({
          community: {
            ...state.community,
            events: state.community.events.filter((e) => e.id !== id),
          },
        })),
      setCommunityBusinessConnected: (id, connected) =>
        set((state) => ({
          community: {
            ...state.community,
            businesses: state.community.businesses.map((b) => (b.id === id ? { ...b, connected } : b)),
          },
        })),
      setCommunityConnectionStatus: (id, status) =>
        set((state) => ({
          community: {
            ...state.community,
            connections: state.community.connections.map((c) => (c.id === id ? { ...c, status } : c)),
          },
        })),

      // ── AI Copilot, Guided Tour & Command Palette ────────────────────────
      copilotOpen: false,
      setCopilotOpen: (v) => set({ copilotOpen: v }),
      copilotPrompt: null,
      setCopilotPrompt: (p) =>
        set((s) => ({
          copilotPrompt: p,
          copilotNonce: p === null ? s.copilotNonce : s.copilotNonce + 1,
        })),
      copilotNonce: 0,

      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),

      guideActive: false,
      guideStep: 0,
      guideCompleted: false,

      startGuide: () => set({ guideActive: true, guideStep: 0 }),
      nextGuideStep: () => set((s) => ({ guideStep: s.guideStep + 1 })),
      prevGuideStep: () => set((s) => ({ guideStep: Math.max(0, s.guideStep - 1) })),
      endGuide: () => set({ guideActive: false, guideStep: 0, guideCompleted: true }),

      // ── Cloud sync hydration ──────────────────────────────────────────────
      // Merges a snapshot pulled from Supabase (/api/sync) into the store,
      // guarding against unknown keys and empty payloads.
      hydrate: (data) => {
        if (!data || typeof data !== "object") return;
        const patch: Record<string, unknown> = {};
        for (const key of SYNCED_KEYS) {
          if (key in data && data[key] !== undefined) patch[key] = data[key];
        }
        set(patch);
      },
    }),
    {
      name: 'birichinex-store',
      version: 10,
      // v9: production launch — wipe all demo/seed content left over from
      // pre-launch builds so every shop starts genuinely empty. Business data
      // from this point on comes only from real usage (manual entry + events).
      // v10: open-entry — new visitors explore in guest mode first (entrySeen),
      // registration is optional until they want to participate. KSh is the
      // primary currency.
      migrate: (persisted: any) => {
        const base = typeof persisted === 'object' && persisted !== null ? persisted : {};
        return {
          ...base,
          entrySeen: false,
          selectedCurrency: 'KES',
          contacts: [],
          transactions: [],
          orders: [],
          shipments: [],
          inventoryItems: [],
          documents: [],
          agentCalls: [],
          cart: [],
          cartRedeem: null,
          businessWallet: base.businessWallet ?? { balance: 0, totalEarned: 0, totalWithdrawn: 0, transactions: [] },
          withdrawals: base.withdrawals ?? [],
          recommendations: [],
          outcomes: [],
          settings: {
            ...(base.settings ?? {}),
            profile: {
              name: '',
              email: '',
              phone: '',
              company: '',
              language: base.settings?.profile?.language ?? 'en',
              city: '',
              country: '',
            },
          },
          upgradeReminderDismissed: base.upgradeReminderDismissed ?? false,
          subscription: {
            plan: 'silver',
            status: 'none',
            startedAt: new Date().toISOString(),
            billingPeriod: undefined,
            autoRenew: false,
            ...(base.subscription ?? {}),
          },
        };
      },
    },
  ),
);
