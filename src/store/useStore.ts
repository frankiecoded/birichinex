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
} from '../types';
import { PRODUCTS, TECH_PRODUCTS, COURSES, DROPSHIP_CATALOG, DROPSHIP_TIERS, LOYALTY_CONFIG } from '../data/platform';
import type { TrackedOrder, TrackingStatus } from '../data/delivery';
import { SEED_TRACKED_ORDERS } from '../data/delivery';

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

// ── Seed data ────────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [...PRODUCTS, ...TECH_PRODUCTS];

const SEED_DOCUMENTS: AppDocument[] = [
  {
    id: 'doc-001',
    title: 'Q3 Supply Agreement — Portmetals Africa',
    type: 'contract',
    category: 'Legal',
    content: 'This Supply Agreement is entered into between Portmetals Africa Ltd. and the undersigned buyer for the supply of minerals and metals per agreed terms.',
    status: 'signed',
    size: '245 KB',
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-20T14:30:00.000Z',
    signatures: [
      { id: 'sig-001', signerName: 'Frank Musau', signedAt: '2026-06-20T14:30:00.000Z', method: 'type' },
    ],
    attachments: ['terms_and_conditions.pdf'],
    templateId: 'tpl-service-agreement',
  },
  {
    id: 'doc-002',
    title: 'Invoice #INV-2026-0412',
    type: 'invoice',
    category: 'Financial',
    content: 'Invoice for 500 units of Copper Cathode (Grade A) delivered to Dar es Salaam port. Total: TZS 12,500,000.',
    status: 'review',
    size: '89 KB',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    signatures: [],
    attachments: [],
    templateId: 'tpl-invoice',
  },
  {
    id: 'doc-003',
    title: 'Non-Disclosure Agreement — TechPartner Ltd.',
    type: 'contract',
    category: 'Legal',
    content: 'Mutual NDA between Portmetals Africa Ltd. and TechPartner Ltd. for the purpose of evaluating a technology partnership.',
    status: 'draft',
    size: '128 KB',
    createdAt: '2026-07-10T11:00:00.000Z',
    updatedAt: '2026-07-10T11:00:00.000Z',
    signatures: [],
    attachments: [],
    templateId: 'tpl-nda',
  },
  {
    id: 'doc-004',
    title: 'Business License — 2026 Renewal',
    type: 'license',
    category: 'Compliance',
    content: 'Annual business operating license for Portmetals Africa Ltd. issued by the Tanzania Business Licensing Authority. Valid: Jan 2026 – Dec 2026.',
    status: 'signed',
    size: '340 KB',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T16:00:00.000Z',
    signatures: [
      { id: 'sig-002', signerName: 'Licensing Authority', signedAt: '2026-01-10T16:00:00.000Z', method: 'type' },
    ],
    attachments: ['license_certificate.pdf', 'renewal_receipt.pdf'],
  },
  {
    id: 'doc-005',
    title: 'Employee Contract — Juma Mwakasege',
    type: 'contract',
    category: 'HR',
    content: 'Employment contract for Juma Mwakasege as Operations Manager. Start date: August 1, 2026. Salary: TZS 3,500,000/month.',
    status: 'draft',
    size: '156 KB',
    createdAt: '2026-07-15T13:00:00.000Z',
    updatedAt: '2026-07-15T13:00:00.000Z',
    signatures: [],
    attachments: [],
    templateId: 'tpl-employment',
  },
  {
    id: 'doc-006',
    title: 'Service Proposal — Logistics Integration',
    type: 'proposal',
    category: 'Operations',
    content: 'Proposal for integration of automated logistics tracking system. Project timeline: 3 months. Budget: TZS 15,000,000.',
    status: 'review',
    size: '210 KB',
    createdAt: '2026-07-08T10:30:00.000Z',
    updatedAt: '2026-07-12T15:00:00.000Z',
    signatures: [],
    attachments: ['project_scope.pdf', 'budget_breakdown.xlsx'],
  },
  {
    id: 'doc-007',
    title: 'ISO 9001 Quality Certificate',
    type: 'certificate',
    category: 'Compliance',
    content: 'ISO 9001:2015 Quality Management System certification for Portmetals Africa Ltd. Issued by TÜV Rheinland. Valid until March 2028.',
    status: 'archived',
    size: '520 KB',
    createdAt: '2025-03-15T09:00:00.000Z',
    updatedAt: '2025-04-01T12:00:00.000Z',
    signatures: [
      { id: 'sig-003', signerName: 'TÜV Auditor', signedAt: '2025-04-01T12:00:00.000Z', method: 'type' },
    ],
    attachments: ['iso_certificate.pdf'],
  },
  {
    id: 'doc-008',
    title: 'Purchase Order — Mining Equipment',
    type: 'invoice',
    category: 'Financial',
    content: 'PO for 2x excavators, 5x conveyor belts from CME Mining Equipment. Total: TZS 85,000,000. Delivery: August 2026.',
    status: 'signed',
    size: '95 KB',
    createdAt: '2026-06-28T14:00:00.000Z',
    updatedAt: '2026-07-02T10:00:00.000Z',
    signatures: [
      { id: 'sig-004', signerName: 'Frank Musau', signedAt: '2026-07-02T10:00:00.000Z', method: 'draw' },
    ],
    attachments: ['quotation_cme.pdf'],
    templateId: 'tpl-purchase-order',
  },
];

const SEED_COURSES = COURSES.reduce<
  Record<string, { started: boolean; completedLessons: string[]; completed: boolean; startedAt: string }>
>((acc, c) => {
  acc[c.id] = { started: false, completedLessons: [], completed: false, startedAt: '' };
  return acc;
}, {});

// ── Types ────────────────────────────────────────────────────────────────────

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

interface InventoryItem {
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
  profile: { name: string; email: string; phone: string; company: string };
  notifications: { email: boolean; push: boolean; sms: boolean };
  theme: 'light' | 'dark' | 'system';
}

interface StoreState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: { email: string; name: string } | null;
  authView: 'login' | 'signup' | 'forgot' | null;
  introComplete: boolean;
  login: (email: string, name: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  setAuthView: (view: 'login' | 'signup' | 'forgot' | null) => void;
  setIntroComplete: (v: boolean) => void;

  // ── Core ───────────────────────────────────────────────────────────────────
  currentView: BirichiNexView;
  appMode: 'shopping' | 'business';
  selectedCurrency: Currency;
  shopView: string;

  // ── Cart ───────────────────────────────────────────────────────────────────
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;

  // ── Orders ─────────────────────────────────────────────────────────────────
  orders: TrackedOrder[];
  addOrder: (order: TrackedOrder) => void;
  updateOrderStatus: (id: string, status: TrackingStatus, note: string, lat: number, lng: number, location: string) => void;

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

  // ── Membership ─────────────────────────────────────────────────────────────
  currentTier: MembershipTier;
  upgradeTier: (tier: MembershipTier) => void;

  // ── Settings ───────────────────────────────────────────────────────────────
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

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

  // ── Navigation ─────────────────────────────────────────────────────────────
  setAppMode: (mode: 'shopping' | 'business') => void;
  setShopView: (view: string) => void;
  setCurrentView: (view: BirichiNexView) => void;
  setCurrency: (c: Currency) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      user: null,
      authView: null,
      introComplete: false,

      login: (email, name) => set({ user: { email, name }, authView: null }),
      signup: (email, name) => set({ user: { email, name }, authView: null }),
      logout: () => set({ user: null, authView: 'login' }),
      setAuthView: (view) => set({ authView: view }),
      setIntroComplete: (v) => set({ introComplete: v }),

      // ── Core State ────────────────────────────────────────────────────────
      currentView: 'dashboard',
      appMode: 'shopping',
      selectedCurrency: 'TZS',
      shopView: 'home',

      setAppMode: (mode) => set({ appMode: mode }),
      setShopView: (view) => set({ shopView: view }),
      setCurrentView: (view) => set({ currentView: view }),
      setCurrency: (c) => set({ selectedCurrency: c }),

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

      clearCart: () => set({ cart: [] }),

      // ── Orders ──────────────────────────────────────────────────────────────
      orders: SEED_TRACKED_ORDERS,

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

      // ── CRM ───────────────────────────────────────────────────────────────
      contacts: [
        { id: 'cnt-001', name: 'Aisha Nakamya', email: 'aisha@nakamya.co.ug', phone: '+256789123456', company: 'Nakamya Trading', role: 'Owner', status: 'active', tags: ['wholesale', 'uganda'], notes: 'Bulk buyer - 45kg bales monthly', createdAt: '2026-06-01T10:00:00Z', lastContactAt: '2026-07-19T14:30:00Z' },
        { id: 'cnt-002', name: 'Jabali Enterprises', email: 'info@jabali.co.ke', phone: '+254722345678', company: 'Jabali Enterprises Ltd', role: 'Procurement Manager', status: 'active', tags: ['wholesale', 'kenya', 'corporate'], notes: 'Large volume orders - Nairobi CBD', createdAt: '2026-05-15T08:00:00Z', lastContactAt: '2026-07-21T06:00:00Z' },
        { id: 'cnt-003', name: 'Neema Electronics', email: 'sales@neema-electronics.co.tz', phone: '+255712345678', company: 'Neema Electronics', role: 'Sales Director', status: 'active', tags: ['electronics', 'tanzania', 'arusha'], notes: 'Regular iPhone/laptop buyer', createdAt: '2026-06-10T09:00:00Z', lastContactAt: '2026-07-21T07:30:00Z' },
        { id: 'cnt-004', name: 'Mama Zawadi Boutique', email: 'mama.zawadi@boutique.co.tz', phone: '+255754321098', company: 'Mama Zawadi Boutique', role: 'Owner', status: 'active', tags: ['fashion', 'tanzania', 'dar-es-salaam'], notes: 'Handbags and fashion accessories buyer', createdAt: '2026-06-20T11:00:00Z', lastContactAt: '2026-07-21T08:00:00Z' },
        { id: 'cnt-005', name: 'TechHub Rwanda', email: 'orders@techhub.rw', phone: '+250789123456', company: 'TechHub Rwanda Ltd', role: 'Purchasing Manager', status: 'active', tags: ['electronics', 'rwanda', 'kigali'], notes: 'Premium electronics distributor', createdAt: '2026-06-25T14:00:00Z', lastContactAt: '2026-07-21T09:00:00Z' },
        { id: 'cnt-006', name: 'Rehema Nkwabi', email: 'rehema.nkwabi@gmail.com', phone: '+255754111222', company: 'Nkwabi Home Decor', role: 'Owner', status: 'active', tags: ['home', 'tanzania', 'mwanza'], notes: 'Bedsheets and home goods buyer', createdAt: '2026-05-20T10:00:00Z', lastContactAt: '2026-07-14T11:20:00Z' },
        { id: 'cnt-007', name: 'Peter Okello', email: 'pokello@outlook.com', phone: '+256771234567', company: 'Okello Tech Store', role: 'Owner', status: 'active', tags: ['electronics', 'uganda', 'jinja'], notes: 'Laptop specialist - small business', createdAt: '2026-06-15T08:30:00Z', lastContactAt: '2026-07-21T12:00:00Z' },
        { id: 'cnt-008', name: 'Sarah Wanjiku', email: 'sarah@wanjiku.co.ke', phone: '+254733444555', company: 'Wanjiku Coffee Traders', role: 'Director', status: 'active', tags: ['food', 'kenya', 'nairobi'], notes: 'Premium coffee buyer - Karen area', createdAt: '2026-06-05T09:00:00Z', lastContactAt: '2026-07-21T10:00:00Z' },
        { id: 'cnt-009', name: 'David Mwangi', email: 'david@mwangi.co.tz', phone: '+255766777888', company: 'Mwangi Fashion House', role: 'Buyer', status: 'active', tags: ['fashion', 'tanzania', 'dar-es-salaam'], notes: 'Leather goods specialist', createdAt: '2026-06-12T14:00:00Z', lastContactAt: '2026-07-19T10:00:00Z' },
        { id: 'cnt-010', name: 'Grace Auma', email: 'grace.auma@yahoo.com', phone: '+256781222333', company: 'Auma Accessories', role: 'Owner', status: 'active', tags: ['electronics', 'uganda', 'kampala'], notes: 'Audio equipment buyer', createdAt: '2026-05-25T11:00:00Z', lastContactAt: '2026-07-14T09:45:00Z' },
        { id: 'cnt-011', name: 'Fatma Ali', email: 'fatma.ali@gmail.com', phone: '+254711999888', company: 'Fatma Beauty Spa', role: 'Owner', status: 'lead', tags: ['beauty', 'kenya', 'mombasa'], notes: 'Interested in skincare sets', createdAt: '2026-07-15T10:00:00Z', lastContactAt: '2026-07-21T10:30:00Z' },
        { id: 'cnt-012', name: 'Patrick Habimana', email: 'patrick@habimana.rw', phone: '+250788111222', company: 'Habimana Schools', role: 'Procurement Officer', status: 'active', tags: ['wholesale', 'rwanda', 'kigali'], notes: 'School uniform buyer - bulk orders', createdAt: '2026-06-08T08:00:00Z', lastContactAt: '2026-07-18T10:00:00Z' },
        { id: 'cnt-013', name: 'Hassan Mwinyi', email: 'hassan@mwinyi.co.tz', phone: '+255777333444', company: 'Mwinyi Wholesale', role: 'Director', status: 'active', tags: ['wholesale', 'tanzania', 'dodoma'], notes: 'Shirt and fashion wholesale buyer', createdAt: '2026-04-10T10:00:00Z', lastContactAt: '2026-07-11T16:00:00Z' },
        { id: 'cnt-014', name: 'Immaculate Nyirahabimana', email: 'immaculate@nyira.rw', phone: '+250799444555', company: 'Nyira Home Collection', role: 'Owner', status: 'lead', tags: ['home', 'rwanda', 'kigali'], notes: 'Bamboo towel and linen buyer', createdAt: '2026-07-10T08:00:00Z', lastContactAt: '2026-07-21T08:45:00Z' },
        { id: 'cnt-015', name: 'Brian Kiprop', email: 'brian@kiprop.co.ke', phone: '+254722666777', company: 'Kiprop Sports', role: 'Owner', status: 'active', tags: ['sports', 'kenya', 'eldoret'], notes: 'GPS watches and fitness gear buyer', createdAt: '2026-06-30T09:00:00Z', lastContactAt: '2026-07-21T09:00:00Z' },
        { id: 'cnt-016', name: 'Claire Mugisha', email: 'claire@mugisha.co.ug', phone: '+256788333444', company: 'Mugisha Gifts', role: 'Owner', status: 'active', tags: ['home', 'uganda', 'entebbe'], notes: 'Gift items and candles buyer', createdAt: '2026-05-18T11:00:00Z', lastContactAt: '2026-07-13T14:30:00Z' },
        { id: 'cnt-017', name: 'Diane Uwimana', email: 'diane@uwimana.rw', phone: '+250785666777', company: 'Uwimana Beauty Salon', role: 'Owner', status: 'active', tags: ['beauty', 'rwanda', 'huye'], notes: 'Hair extensions and beauty products', createdAt: '2026-06-22T10:00:00Z', lastContactAt: '2026-07-20T14:00:00Z' },
        { id: 'cnt-018', name: 'Joan Nabukera', email: 'joan.nabukera@gmail.com', phone: '+256771555666', company: 'Nabukera Fashion', role: 'Buyer', status: 'inactive', tags: ['fashion', 'uganda', 'kampala'], notes: 'Had a return - silk scarf color issue', createdAt: '2026-06-01T14:00:00Z', lastContactAt: '2026-07-08T14:00:00Z' },
        { id: 'cnt-019', name: 'John Shirima', email: 'john@shirima.co.tz', phone: '+255789444555', company: 'Shirima Kitchen Store', role: 'Owner', status: 'lead', tags: ['home', 'tanzania', 'arusha'], notes: 'Kitchen utensils and cookware buyer', createdAt: '2026-07-18T11:00:00Z', lastContactAt: '2026-07-21T11:00:00Z' },
        { id: 'cnt-020', name: 'James Ochieng', email: 'james@ochieng.co.ke', phone: '+254733888999', company: 'Ochieng IT Solutions', role: 'Director', status: 'active', tags: ['electronics', 'kenya', 'nakuru'], notes: 'USB-C hubs and tech accessories', createdAt: '2026-06-18T14:00:00Z', lastContactAt: '2026-07-21T07:30:00Z' },
        { id: 'cnt-021', name: 'Alice Njeri', email: 'alice@njeri.co.ke', phone: '+254711222333', company: 'Njeri Coffee House', role: 'Owner', status: 'active', tags: ['food', 'kenya', 'nairobi'], notes: 'Tanzanian coffee bean buyer - premium roaster', createdAt: '2026-06-28T09:00:00Z', lastContactAt: '2026-07-21T09:00:00Z' },
      ],
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
      inventoryItems: [
        ...ALL_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.id.toUpperCase(),
          category: p.category,
          stock: p.stock,
          minStock: Math.floor(p.stock * 0.1),
          price: p.price,
          unit: 'pcs',
          status: (p.stock > 50
            ? 'in-stock'
            : p.stock > 0
              ? 'low-stock'
              : 'out-of-stock') as 'in-stock' | 'low-stock' | 'out-of-stock',
          supplier: p.supplier.name,
          lastRestocked: p.createdAt,
          source: 'manual' as const,
          postedToMarketplace: false,
        })),
      ],
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
      transactions: [
        {
          id: 'tx-001',
          type: 'income',
          amount: { amount: 2700000, currency: 'TZS' },
          description: 'Wholesale order — Men Cotton Shirts (100 pcs)',
          category: 'Sales',
          date: '2026-07-10',
          status: 'completed',
        },
        {
          id: 'tx-002',
          type: 'expense',
          amount: { amount: 450000, currency: 'TZS' },
          description: 'Warehouse rent — July 2026',
          category: 'Rent',
          date: '2026-07-01',
          status: 'completed',
        },
        {
          id: 'tx-003',
          type: 'income',
          amount: { amount: 850000, currency: 'TZS' },
          description: 'MacBook Air M2 sale (1 unit)',
          category: 'Sales',
          date: '2026-07-15',
          status: 'completed',
        },
        {
          id: 'tx-004',
          type: 'expense',
          amount: { amount: 120000, currency: 'TZS' },
          description: 'BirichiNex subscription — Gold plan',
          category: 'Subscriptions',
          date: '2026-07-05',
          status: 'completed',
        },
        {
          id: 'tx-005',
          type: 'transfer',
          amount: { amount: 500000, currency: 'TZS' },
          description: 'Transfer to savings account',
          category: 'Transfer',
          date: '2026-07-18',
          status: 'pending',
        },
        {
          id: 'tx-006',
          type: 'income',
          amount: { amount: 1350000, currency: 'TZS' },
          description: 'Retail sale — Women Handbags (25 units)',
          category: 'Sales',
          date: '2026-06-12',
          status: 'completed',
        },
        {
          id: 'tx-007',
          type: 'income',
          amount: { amount: 4200000, currency: 'TZS' },
          description: 'Wholesale bale — Grade A European Fashion Mix (5 bales)',
          category: 'Sales',
          date: '2026-06-18',
          status: 'completed',
        },
        {
          id: 'tx-008',
          type: 'expense',
          amount: { amount: 380000, currency: 'TZS' },
          description: 'International shipping — supplier order from Dubai',
          category: 'Shipping',
          date: '2026-06-22',
          status: 'completed',
        },
        {
          id: 'tx-009',
          type: 'income',
          amount: { amount: 675000, currency: 'TZS' },
          description: 'Electronics sale — Samsung Galaxy A15 (5 units)',
          category: 'Sales',
          date: '2026-06-25',
          status: 'completed',
        },
        {
          id: 'tx-010',
          type: 'expense',
          amount: { amount: 200000, currency: 'TZS' },
          description: 'Social media advertising — Instagram & TikTok campaigns',
          category: 'Marketing',
          date: '2026-07-03',
          status: 'completed',
        },
        {
          id: 'tx-011',
          type: 'income',
          amount: { amount: 1800000, currency: 'TZS' },
          description: 'Bulk sale — Women Polyester Dresses (60 pcs)',
          category: 'Sales',
          date: '2026-07-08',
          status: 'completed',
        },
        {
          id: 'tx-012',
          type: 'expense',
          amount: { amount: 95000, currency: 'TZS' },
          description: 'Electricity & water bill — July 2026',
          category: 'Utilities',
          date: '2026-07-05',
          status: 'completed',
        },
        {
          id: 'tx-013',
          type: 'income',
          amount: { amount: 520000, currency: 'TZS' },
          description: 'Retail sale — Children Clothing Bundle (15 sets)',
          category: 'Sales',
          date: '2026-06-28',
          status: 'completed',
        },
        {
          id: 'tx-014',
          type: 'expense',
          amount: { amount: 75000, currency: 'TZS' },
          description: 'Packaging materials — poly bags, tissue paper, boxes',
          category: 'Packaging',
          date: '2026-07-12',
          status: 'completed',
        },
        {
          id: 'tx-015',
          type: 'income',
          amount: { amount: 3150000, currency: 'TZS' },
          description: 'Wholesale order — Grade B Denim Bales (3 bales)',
          category: 'Sales',
          date: '2026-07-02',
          status: 'completed',
        },
        {
          id: 'tx-016',
          type: 'transfer',
          amount: { amount: 1200000, currency: 'TZS' },
          description: 'Investment — BirichiNex Gold Tier Partnership',
          category: 'Investment',
          date: '2026-06-30',
          status: 'completed',
        },
        {
          id: 'tx-017',
          type: 'expense',
          amount: { amount: 150000, currency: 'TZS' },
          description: 'Business insurance premium — Q3 2026',
          category: 'Insurance',
          date: '2026-07-01',
          status: 'completed',
        },
        {
          id: 'tx-018',
          type: 'income',
          amount: { amount: 2400000, currency: 'TZS' },
          description: 'Wholesale order — Men Polo Shirts (80 pcs)',
          category: 'Sales',
          date: '2026-07-16',
          status: 'pending',
        },
        {
          id: 'tx-019',
          type: 'expense',
          amount: { amount: 250000, currency: 'TZS' },
          description: 'Domestic courier delivery — Dar es Salaam to Arusha',
          category: 'Shipping',
          date: '2026-07-14',
          status: 'pending',
        },
        {
          id: 'tx-020',
          type: 'transfer',
          amount: { amount: 300000, currency: 'TZS' },
          description: 'Petty cash replenishment — office supplies & small purchases',
          category: 'Transfer',
          date: '2026-07-19',
          status: 'completed',
        },
      ],
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

      // ── Membership ────────────────────────────────────────────────────────
      currentTier: 'silver',

      upgradeTier: (tier) => set({ currentTier: tier }),

      // ── Settings ──────────────────────────────────────────────────────────
      settings: {
        profile: {
          name: 'Frank Musau',
          email: 'frank@portmetals.co.tz',
          phone: '+255 700 000 000',
          company: 'Portmetals Africa Ltd.',
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        theme: 'light',
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

      // ── Dropshipping ────────────────────────────────────────────────────
      dropshipSubscription: {
        tier: 'starter',
        status: 'active',
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        const config = LOYALTY_CONFIG;
        const state = get();
        const tierConfig = config.tiers[state.loyalty.currentTier];
        const basePoints = Math.floor(amountTZS / 150) * config.pointsPer150KES;
        const earned = Math.floor(basePoints * tierConfig.multiplier);
        if (earned > 0) {
          state.addLoyaltyPoints(earned, `Purchase reward: ${earned} points earned`);
        }
      },

      // ── Documents ──────────────────────────────────────────────────────────
      documents: SEED_DOCUMENTS,
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
    }),
    {
      name: 'birichinex-store',
      version: 2,
    },
  ),
);
