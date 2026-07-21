import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  X,
  Check,
  Clock,
  AlertCircle,
  CreditCard,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Wallet,
  Eye,
  Edit3,
  Trash2,
  Smartphone,
  Building2,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";
import type { Currency } from "../types";

// ── Local Types ─────────────────────────────────────────────────────────────

type TabId = "transactions" | "invoices" | "methods" | "wallets" | "reports";

type TxType = "income" | "expense" | "refund";
type TxStatus = "completed" | "pending" | "failed";

interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TxType;
  status: TxStatus;
  category: string;
  paymentMethod: string;
}

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceItemForm {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface Invoice {
  id: string;
  client: string;
  email: string;
  items: InvoiceItem[];
  tax: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

interface PaymentMethod {
  id: string;
  type: "mpesa" | "bank" | "card" | "paypal";
  label: string;
  details: string;
  isDefault: boolean;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
  color: string;
}

// ── Seed Data ───────────────────────────────────────────────────────────────

const SEED_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "pt-001",
    date: "2026-07-20",
    description: "Wholesale order — Men Cotton Shirts",
    amount: 2700000,
    type: "income",
    status: "completed",
    category: "Sales",
    paymentMethod: "M-Pesa",
  },
  {
    id: "pt-002",
    date: "2026-07-18",
    description: "Warehouse rent — July",
    amount: 450000,
    type: "expense",
    status: "completed",
    category: "Rent",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "pt-003",
    date: "2026-07-15",
    description: "MacBook Air M2 sale",
    amount: 850000,
    type: "income",
    status: "completed",
    category: "Electronics",
    paymentMethod: "M-Pesa",
  },
  {
    id: "pt-004",
    date: "2026-07-14",
    description: "Refund — Damaged shipment batch #44",
    amount: 180000,
    type: "refund",
    status: "completed",
    category: "Refunds",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "pt-005",
    date: "2026-07-12",
    description: "Office supplies & packaging",
    amount: 95000,
    type: "expense",
    status: "completed",
    category: "Supplies",
    paymentMethod: "M-Pesa",
  },
  {
    id: "pt-006",
    date: "2026-07-10",
    description: "International buyer — Gemstone parcel",
    amount: 5200000,
    type: "income",
    status: "completed",
    category: "Sales",
    paymentMethod: "PayPal",
  },
  {
    id: "pt-007",
    date: "2026-07-08",
    description: "Staff salaries — July",
    amount: 1800000,
    type: "expense",
    status: "completed",
    category: "Payroll",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "pt-008",
    date: "2026-07-06",
    description: "Pending payment — Agri bulk order",
    amount: 340000,
    type: "income",
    status: "pending",
    category: "Sales",
    paymentMethod: "M-Pesa",
  },
  {
    id: "pt-009",
    date: "2026-07-04",
    description: "Software subscription renewal",
    amount: 120000,
    type: "expense",
    status: "failed",
    category: "Subscriptions",
    paymentMethod: "Card",
  },
  {
    id: "pt-010",
    date: "2026-07-02",
    description: "Export — Cotton fabric to Nairobi",
    amount: 1500000,
    type: "income",
    status: "completed",
    category: "Sales",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "pt-011",
    date: "2026-07-01",
    description: "Logistics & shipping fees",
    amount: 280000,
    type: "expense",
    status: "completed",
    category: "Logistics",
    paymentMethod: "M-Pesa",
  },
  {
    id: "pt-012",
    date: "2026-06-30",
    description: "Quarterly insurance premium",
    amount: 350000,
    type: "expense",
    status: "pending",
    category: "Insurance",
    paymentMethod: "Bank Transfer",
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    client: "Portmetals Trading Co.",
    email: "accounts@portmetals.co.tz",
    items: [
      { id: "ii-1", description: "Men Cotton Shirts (100 pcs)", quantity: 100, unitPrice: 27000 },
      { id: "ii-2", description: "Packaging & labeling", quantity: 1, unitPrice: 50000 },
    ],
    tax: 18,
    dueDate: "2026-08-01",
    status: "sent",
    createdAt: "2026-07-10",
  },
  {
    id: "inv-002",
    client: "Nairobi Fashion Hub",
    email: "finance@nfh.co.ke",
    items: [
      { id: "ii-3", description: "Cotton fabric export — 500m", quantity: 500, unitPrice: 3000 },
    ],
    tax: 16,
    dueDate: "2026-07-25",
    status: "paid",
    createdAt: "2026-07-02",
  },
  {
    id: "inv-003",
    client: "Dar Tech Supplies",
    email: "pay@dartech.co.tz",
    items: [
      { id: "ii-4", description: "MacBook Air M2", quantity: 2, unitPrice: 850000 },
      { id: "ii-5", description: "Accessories bundle", quantity: 2, unitPrice: 120000 },
    ],
    tax: 18,
    dueDate: "2026-07-15",
    status: "overdue",
    createdAt: "2026-06-28",
  },
  {
    id: "inv-004",
    client: "AgriPro Enterprises",
    email: "ops@agripro.ug",
    items: [
      { id: "ii-6", description: "Gemstone parcel — Grade A+", quantity: 1, unitPrice: 5200000 },
    ],
    tax: 18,
    dueDate: "2026-08-10",
    status: "draft",
    createdAt: "2026-07-18",
  },
];

const SEED_METHODS: PaymentMethod[] = [
  { id: "pm-1", type: "mpesa", label: "M-Pesa", details: "+255 700 ***001", isDefault: true },
  { id: "pm-2", type: "bank", label: "CRDB Bank", details: "Account ****4521", isDefault: false },
  { id: "pm-3", type: "card", label: "Visa Card", details: "**** **** **** 8834", isDefault: false },
  { id: "pm-4", type: "paypal", label: "PayPal", details: "frank@portmetals.co.tz", isDefault: false },
];

const SEED_WALLETS: Wallet[] = [
  { id: "w-1", name: "Business Primary", balance: 8450000, currency: "TZS", color: "#007AFF" },
  { id: "w-2", name: "Savings Reserve", balance: 3200000, currency: "TZS", color: "#30D158" },
  { id: "w-3", name: "USD Operations", balance: 4250, currency: "USD", color: "#FF9500" },
  { id: "w-4", name: "Petty Cash", balance: 185000, currency: "TZS", color: "#AF52DE" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<TxType, "success" | "warning" | "info"> = {
  income: "success",
  expense: "warning",
  refund: "info",
};

const STATUS_BADGE: Record<TxStatus, "success" | "warning" | "error"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
};

const INVOICE_STATUS_BADGE: Record<InvoiceStatus, "success" | "info" | "warning" | "error"> = {
  draft: "info",
  sent: "warning",
  paid: "success",
  overdue: "error",
};

const METHOD_ICONS: Record<PaymentMethod["type"], typeof Smartphone> = {
  mpesa: Smartphone,
  bank: Building2,
  card: CreditCard,
  paypal: Send,
};

function uid(): string {
  return `px-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Tabs Config ─────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof DollarSign }[] = [
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "methods", label: "Payment Methods", icon: CreditCard },
  { id: "wallets", label: "Digital Wallets", icon: Wallet },
  { id: "reports", label: "Reports", icon: TrendingUp },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PaymentsPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);

  // ── Tab state ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("transactions");

  // ── Transactions state ──────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(SEED_TRANSACTIONS);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<"all" | TxType>("all");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<PaymentTransaction | null>(null);
  const [txForm, setTxForm] = useState({
    description: "",
    amount: "",
    type: "income" as TxType,
    status: "completed" as TxStatus,
    category: "",
    date: today(),
    paymentMethod: "M-Pesa",
  });

  // ── Invoices state ──────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFilter, setInvStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Invoice | null>(null);
  const [invForm, setInvForm] = useState({
    client: "",
    email: "",
    tax: "18",
    dueDate: "",
    items: [{ id: uid(), description: "", quantity: "1", unitPrice: "0" }] as InvoiceItemForm[],
  });

  // ── Payment methods state ───────────────────────────────────────────────
  const [methods, setMethods] = useState<PaymentMethod[]>(SEED_METHODS);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [methodForm, setMethodForm] = useState({
    type: "mpesa" as PaymentMethod["type"],
    label: "",
    details: "",
  });

  // ── Wallets state ───────────────────────────────────────────────────────
  const [wallets, setWallets] = useState<Wallet[]>(SEED_WALLETS);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [topUpTarget, setTopUpTarget] = useState<string>("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // ── Detail modal ────────────────────────────────────────────────────────
  const [detailTx, setDetailTx] = useState<PaymentTransaction | null>(null);
  const [detailInv, setDetailInv] = useState<Invoice | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════

  const stats = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0);
    const refunds = transactions
      .filter((t) => t.type === "refund" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0);
    const pendingPayments = transactions
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.amount, 0);
    const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
    const pendingInvoices = invoices.filter((i) => i.status === "sent").length;
    return { revenue, expenses, net: revenue - expenses - refunds, pendingPayments, overdueInvoices, pendingInvoices, refunds };
  }, [transactions, invoices]);

  const filteredTx = useMemo(() => {
    let list = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (txTypeFilter !== "all") list = list.filter((t) => t.type === txTypeFilter);
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q),
      );
    }
    if (txDateFrom) list = list.filter((t) => t.date >= txDateFrom);
    if (txDateTo) list = list.filter((t) => t.date <= txDateTo);
    return list;
  }, [transactions, txTypeFilter, txSearch, txDateFrom, txDateTo]);

  const filteredInvoices = useMemo(() => {
    let list = [...invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (invStatusFilter !== "all") list = list.filter((i) => i.status === invStatusFilter);
    if (invSearch.trim()) {
      const q = invSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.client.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [invoices, invStatusFilter, invSearch]);

  const reportsData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    const monthMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      const month = t.date.slice(0, 7);
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
      if (t.type === "income") monthMap[month].income += t.amount;
      else if (t.type === "expense") monthMap[month].expense += t.amount;
    });

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxCategoryVal = topCategories.length > 0 ? topCategories[0][1] : 1;

    const monthlyData = Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    const maxMonthly = monthlyData.reduce(
      (m, [, v]) => Math.max(m, v.income, v.expense),
      1,
    );

    return { topCategories, maxCategoryVal, monthlyData, maxMonthly };
  }, [transactions]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS — Transactions
  // ═══════════════════════════════════════════════════════════════════════════

  const openAddTx = useCallback(() => {
    setEditingTx(null);
    setTxForm({
      description: "",
      amount: "",
      type: "income",
      status: "completed",
      category: "",
      date: today(),
      paymentMethod: "M-Pesa",
    });
    setTxModalOpen(true);
  }, []);

  const openEditTx = useCallback(
    (tx: PaymentTransaction) => {
      setEditingTx(tx);
      setTxForm({
        description: tx.description,
        amount: String(tx.amount),
        type: tx.type,
        status: tx.status,
        category: tx.category,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
      });
      setTxModalOpen(true);
    },
    [],
  );

  const submitTx = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!txForm.description.trim() || !txForm.amount) return;
      const amount = parseFloat(txForm.amount) || 0;
      if (editingTx) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTx.id
              ? { ...t, ...txForm, amount }
              : t,
          ),
        );
      } else {
        setTransactions((prev) => [
          { id: uid(), ...txForm, amount },
          ...prev,
        ]);
      }
      setTxModalOpen(false);
    },
    [txForm, editingTx],
  );

  const deleteTx = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS — Invoices
  // ═══════════════════════════════════════════════════════════════════════════

  const openAddInv = useCallback(() => {
    setEditingInv(null);
    setInvForm({
      client: "",
      email: "",
      tax: "18",
      dueDate: "",
      items: [{ id: uid(), description: "", quantity: "1", unitPrice: "0" }],
    });
    setInvModalOpen(true);
  }, []);

  const openEditInv = useCallback((inv: Invoice) => {
    setEditingInv(inv);
    setInvForm({
      client: inv.client,
      email: inv.email,
      tax: String(inv.tax),
      dueDate: inv.dueDate,
      items: inv.items.map((it) => ({ id: it.id, description: it.description, quantity: String(it.quantity), unitPrice: String(it.unitPrice) })),
    });
    setInvModalOpen(true);
  }, []);

  const addInvItem = useCallback(() => {
    setInvForm((f) => ({
      ...f,
      items: [...f.items, { id: uid(), description: "", quantity: "1", unitPrice: "0" } as InvoiceItemForm],
    }));
  }, []);

  const removeInvItem = useCallback((id: string) => {
    setInvForm((f) => ({
      ...f,
      items: f.items.length > 1 ? f.items.filter((it) => it.id !== id) : f.items,
    }));
  }, []);

  const updateInvItem = useCallback((id: string, field: string, value: string) => {
    setInvForm((f) => ({
      ...f,
      items: f.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  }, []);

  const submitInv = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!invForm.client.trim()) return;
      const items: InvoiceItem[] = invForm.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: parseInt(it.quantity) || 1,
        unitPrice: parseFloat(it.unitPrice) || 0,
      }));
      if (editingInv) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === editingInv.id
              ? { ...inv, client: invForm.client, email: invForm.email, tax: parseFloat(invForm.tax) || 0, dueDate: invForm.dueDate, items }
              : inv,
          ),
        );
      } else {
        const newInv: Invoice = {
          id: uid(),
          client: invForm.client,
          email: invForm.email,
          items,
          tax: parseFloat(invForm.tax) || 0,
          dueDate: invForm.dueDate,
          status: "draft",
          createdAt: today(),
        };
        setInvoices((prev) => [newInv, ...prev]);
      }
      setInvModalOpen(false);
    },
    [invForm, editingInv],
  );

  const deleteInv = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const updateInvStatus = useCallback((id: string, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
  }, []);

  const invoiceTotal = useCallback((inv: Invoice) => {
    const sub = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    return sub + sub * (inv.tax / 100);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS — Payment Methods
  // ═══════════════════════════════════════════════════════════════════════════

  const submitMethod = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!methodForm.label.trim() || !methodForm.details.trim()) return;
      setMethods((prev) => [
        ...prev,
        { id: uid(), type: methodForm.type, label: methodForm.label, details: methodForm.details, isDefault: prev.length === 0 },
      ]);
      setMethodModalOpen(false);
      setMethodForm({ type: "mpesa", label: "", details: "" });
    },
    [methodForm],
  );

  const removeMethod = useCallback((id: string) => {
    setMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  }, []);

  const setDefaultMethod = useCallback((id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS — Wallets
  // ═══════════════════════════════════════════════════════════════════════════

  const submitTopUp = useCallback(() => {
    if (!topUpTarget || !topUpAmount) return;
    const amt = parseFloat(topUpAmount) || 0;
    setWallets((prev) =>
      prev.map((w) => (w.id === topUpTarget ? { ...w, balance: w.balance + amt } : w)),
    );
    setTopUpModalOpen(false);
    setTopUpTarget("");
    setTopUpAmount("");
  }, [topUpTarget, topUpAmount]);

  const submitTransfer = useCallback(() => {
    if (!transferFrom || !transferTo || transferFrom === transferTo || !transferAmount) return;
    const amt = parseFloat(transferAmount) || 0;
    const fromWallet = wallets.find((w) => w.id === transferFrom);
    if (!fromWallet || fromWallet.balance < amt) return;
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === transferFrom) return { ...w, balance: w.balance - amt };
        if (w.id === transferTo) return { ...w, balance: w.balance + amt };
        return w;
      }),
    );
    setTransferModalOpen(false);
    setTransferFrom("");
    setTransferTo("");
    setTransferAmount("");
  }, [transferFrom, transferTo, transferAmount, wallets]);

  const totalWalletBalance = useMemo(
    () => wallets.reduce((s, w) => s + (w.currency === "TZS" ? w.balance : w.balance * 2500), 0),
    [wallets],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Stats
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStats = () => {
    const statCards = [
      { label: "Total Revenue", value: stats.revenue, icon: TrendingUp, color: "#30D158", trend: 12 as const },
      { label: "Total Expenses", value: stats.expenses, icon: TrendingDown, color: "#FF9500", trend: -5 as const },
      { label: "Net Profit", value: stats.net, icon: DollarSign, color: "#007AFF", trend: 8 as const },
      { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "#FFD60A", trend: null },
      { label: "Overdue Invoices", value: stats.overdueInvoices, icon: AlertCircle, color: "#FF3B30", trend: null, count: true },
      { label: "Sent Invoices", value: stats.pendingInvoices, icon: Send, color: "#AF52DE", trend: null, count: true },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="md" hover>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="h-9 w-9 rounded-[10px] flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}12` }}
                  >
                    <s.icon className="h-4 w-4" style={{ color: s.color }} strokeWidth={1.5} />
                  </div>
                  {s.trend !== null && (
                    <Badge variant={s.trend >= 0 ? "success" : "error"} size="sm" dot>
                      {s.trend >= 0 ? "+" : ""}
                      {s.trend}%
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-ink-tertiary uppercase tracking-wider font-semibold">{s.label}</p>
                <p className="text-[17px] font-bold text-ink mt-0.5 tracking-tight">
                  {s.count ? s.value : formatPrice(s.value, selectedCurrency)}
                </p>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Transactions Tab
  // ═══════════════════════════════════════════════════════════════════════════

  const renderTransactions = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
          <input
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-10 pl-9 pr-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {(["all", "income", "expense", "refund"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTxTypeFilter(f)}
                className={`h-8 px-3 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                  txTypeFilter === f
                    ? "bg-brand/10 text-brand"
                    : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={txDateFrom}
            onChange={(e) => setTxDateFrom(e.target.value)}
            className="h-8 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[11px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <span className="text-ink-quaternary text-[11px]">to</span>
          <input
            type="date"
            value={txDateTo}
            onChange={(e) => setTxDateTo(e.target.value)}
            className="h-8 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[11px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <MagneticButton>
          <Button variant="brand" size="sm" icon={<Plus className="h-4 w-4" />} onClick={openAddTx}>
            Add Transaction
          </Button>
        </MagneticButton>
      </div>

      {/* Table */}
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Date</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Description</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Category</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Method</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Type</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Status</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary text-right">Amount</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[13px] text-ink-quaternary">
                    No transactions found
                  </td>
                </tr>
              )}
              {filteredTx.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-surface-secondary/30 transition-colors"
                >
                  <td className="px-5 py-3.5 text-[13px] text-ink-secondary whitespace-nowrap">{tx.date}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink font-medium max-w-[240px] truncate">{tx.description}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-tertiary">{tx.category}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-tertiary">{tx.paymentMethod}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={TYPE_BADGE[tx.type]} size="sm">
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : tx.type === "refund" ? (
                        <RotateIcon />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_BADGE[tx.status]} size="sm" dot>
                      {tx.status}
                    </Badge>
                  </td>
                  <td
                    className={`px-5 py-3.5 text-[13px] font-bold text-right whitespace-nowrap ${
                      tx.type === "income"
                        ? "text-success"
                        : tx.type === "refund"
                          ? "text-info"
                          : "text-ink"
                    }`}
                  >
                    {tx.type === "income" ? "+" : tx.type === "refund" ? "+" : "-"}
                    {formatPrice(tx.amount, selectedCurrency)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailTx(tx)}
                        className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => openEditTx(tx)}
                        className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => deleteTx(tx.id)}
                        className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-glass-border flex items-center justify-between">
          <p className="text-[11px] text-ink-quaternary">
            Showing {filteredTx.length} of {transactions.length} transactions
          </p>
          <p className="text-[11px] text-ink-tertiary font-semibold">
            Total: {formatPrice(filteredTx.reduce((s, t) => s + (t.type === "expense" ? -t.amount : t.amount), 0), selectedCurrency)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Invoices Tab
  // ═══════════════════════════════════════════════════════════════════════════

  const renderInvoices = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
          <input
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            placeholder="Search invoices..."
            className="w-full h-10 pl-9 pr-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "draft", "sent", "paid", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setInvStatusFilter(f)}
              className={`h-8 px-3 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                invStatusFilter === f
                  ? "bg-brand/10 text-brand"
                  : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <MagneticButton>
          <Button variant="brand" size="sm" icon={<Plus className="h-4 w-4" />} onClick={openAddInv}>
            New Invoice
          </Button>
        </MagneticButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInvoices.length === 0 && (
          <div className="lg:col-span-2 px-5 py-12 text-center text-[13px] text-ink-quaternary glass-material rounded-[14px]">
            No invoices found
          </div>
        )}
        {filteredInvoices.map((inv, i) => {
          const total = invoiceTotal(inv);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard padding="none" hover>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-mono text-ink-quaternary">{inv.id.toUpperCase()}</p>
                      <p className="text-[15px] font-bold text-ink mt-0.5">{inv.client}</p>
                      <p className="text-[13px] text-ink-tertiary">{inv.email}</p>
                    </div>
                    <Badge variant={INVOICE_STATUS_BADGE[inv.status]} size="md" dot>
                      {inv.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {inv.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-[13px]">
                        <span className="text-ink-secondary truncate mr-2">
                          {it.description} <span className="text-ink-quaternary">x{it.quantity}</span>
                        </span>
                        <span className="text-ink font-medium whitespace-nowrap">{formatPrice(it.quantity * it.unitPrice, selectedCurrency)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-divider mb-3" />

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-tertiary">Tax ({inv.tax}%)</span>
                    <span className="text-ink-secondary">
                      {formatPrice(inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0) * (inv.tax / 100), selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[15px] mt-1">
                    <span className="font-bold text-ink">Total</span>
                    <span className="font-bold text-ink">{formatPrice(total, selectedCurrency)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-ink-quaternary">
                    <span>Due: {inv.dueDate}</span>
                    <span>Created: {inv.createdAt}</span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {inv.status === "draft" && (
                      <Button variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => updateInvStatus(inv.id, "sent")}>
                        Send
                      </Button>
                    )}
                    {inv.status === "sent" && (
                      <Button variant="ghost" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => updateInvStatus(inv.id, "paid")}>
                        Mark Paid
                      </Button>
                    )}
                    {inv.status === "overdue" && (
                      <Button variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => updateInvStatus(inv.id, "sent")}>
                        Remind
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailInv(inv)}
                      className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => openEditInv(inv)}
                      className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => deleteInv(inv.id)}
                      className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Payment Methods Tab
  // ═══════════════════════════════════════════════════════════════════════════

  const renderMethods = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-tertiary">Manage your payment methods</p>
        <MagneticButton>
          <Button variant="brand" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => {
            setMethodForm({ type: "mpesa", label: "", details: "" });
            setMethodModalOpen(true);
          }}>
            Add Method
          </Button>
        </MagneticButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m, i) => {
          const Icon = METHOD_ICONS[m.type];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard>
                <GlassCard padding="md" hover>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-[12px] bg-brand/8 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-ink">{m.label}</p>
                          {m.isDefault && (
                            <Badge variant="brand" size="sm">Default</Badge>
                          )}
                        </div>
                        <p className="text-[13px] text-ink-tertiary font-mono">{m.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!m.isDefault && (
                        <button
                          onClick={() => setDefaultMethod(m.id)}
                          className="h-7 px-2 rounded-[7px] text-[11px] font-semibold text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeMethod(m.id)}
                        className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Wallets Tab
  // ═══════════════════════════════════════════════════════════════════════════

  const renderWallets = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-ink-tertiary">Total Balance (TZS equiv.)</p>
          <p className="text-[22px] font-bold text-ink tracking-tight">{formatPrice(totalWalletBalance, "TZS")}</p>
        </div>
        <div className="flex items-center gap-2">
          <MagneticButton>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => {
              setTopUpTarget(wallets[0]?.id || "");
              setTopUpAmount("");
              setTopUpModalOpen(true);
            }}>
              Top Up
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button variant="brand" size="sm" icon={<Send className="h-4 w-4" />} onClick={() => {
              setTransferFrom(wallets[0]?.id || "");
              setTransferTo(wallets[1]?.id || wallets[0]?.id || "");
              setTransferAmount("");
              setTransferModalOpen(true);
            }}>
              Transfer
            </Button>
          </MagneticButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="lg" hover>
                <div
                  className="h-10 w-10 rounded-[12px] flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${w.color}14` }}
                >
                  <Wallet className="h-5 w-5" style={{ color: w.color }} strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-ink-tertiary font-medium">{w.name}</p>
                <p className="text-[18px] font-bold text-ink mt-1 tracking-tight">
                  {formatPrice(w.balance, w.currency)}
                </p>
                <p className="text-[11px] text-ink-quaternary mt-0.5">{w.currency}</p>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Reports Tab
  // ═══════════════════════════════════════════════════════════════════════════

  const renderReports = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Monthly Revenue vs Expenses */}
      <GlassCard padding="lg">
        <h3 className="text-[15px] font-bold text-ink mb-1">Revenue vs Expenses</h3>
        <p className="text-[13px] text-ink-tertiary mb-5">Monthly comparison</p>
        <div className="space-y-4">
          {reportsData.monthlyData.length === 0 && (
            <p className="text-[13px] text-ink-quaternary text-center py-8">No monthly data available</p>
          )}
          {reportsData.monthlyData.map(([month, data]) => (
            <div key={month} className="space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-secondary font-medium">{month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-success font-semibold">{formatPrice(data.income, selectedCurrency)}</span>
                  <span className="text-ink-quaternary">/</span>
                  <span className="text-warning font-semibold">{formatPrice(data.expense, selectedCurrency)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 h-5">
                <div
                  className="rounded-[4px] bg-success/70 transition-all duration-500"
                  style={{ width: `${(data.income / reportsData.maxMonthly) * 100}%`, minWidth: data.income > 0 ? "8px" : "0" }}
                />
                <div
                  className="rounded-[4px] bg-warning/70 transition-all duration-500"
                  style={{ width: `${(data.expense / reportsData.maxMonthly) * 100}%`, minWidth: data.expense > 0 ? "8px" : "0" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-[3px] bg-success/70" />
            <span className="text-[11px] text-ink-quaternary">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-[3px] bg-warning/70" />
            <span className="text-[11px] text-ink-quaternary">Expenses</span>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Categories */}
        <GlassCard padding="lg">
          <h3 className="text-[15px] font-bold text-ink mb-1">Top Categories</h3>
          <p className="text-[13px] text-ink-tertiary mb-5">Spending & income breakdown</p>
          <div className="space-y-4">
            {reportsData.topCategories.map(([cat, val]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-secondary font-medium">{cat}</span>
                  <span className="text-ink font-semibold">{formatPrice(val, selectedCurrency)}</span>
                </div>
                <div className="h-2 bg-surface-secondary/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / reportsData.maxCategoryVal) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-brand/60"
                  />
                </div>
              </div>
            ))}
            {reportsData.topCategories.length === 0 && (
              <p className="text-[13px] text-ink-quaternary text-center py-4">No data</p>
            )}
          </div>
        </GlassCard>

        {/* Monthly Summary */}
        <GlassCard padding="lg">
          <h3 className="text-[15px] font-bold text-ink mb-1">Monthly Summary</h3>
          <p className="text-[13px] text-ink-tertiary mb-5">Key financial metrics</p>
          <div className="space-y-4">
            {[
              { label: "Total Revenue", value: stats.revenue, color: "#30D158" },
              { label: "Total Expenses", value: stats.expenses, color: "#FF9500" },
              { label: "Refunds", value: stats.refunds, color: "#AF52DE" },
              { label: "Net Profit", value: stats.net, color: "#007AFF" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] text-ink-secondary">{item.label}</span>
                </div>
                <span className="text-[13px] font-bold text-ink">{formatPrice(item.value, selectedCurrency)}</span>
              </div>
            ))}
          </div>

          <div className="glass-divider my-5" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-tertiary">Pending Payments</span>
              <span className="text-[13px] font-semibold text-warning">{formatPrice(stats.pendingPayments, selectedCurrency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-tertiary">Overdue Invoices</span>
              <span className="text-[13px] font-semibold text-error">{stats.overdueInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-tertiary">Pending Invoices</span>
              <span className="text-[13px] font-semibold text-brand">{stats.pendingInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-tertiary">Active Wallets</span>
              <span className="text-[13px] font-semibold text-ink">{wallets.length}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MODALS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderTxModal = () => (
    <AnimatePresence>
      {txModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setTxModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">{editingTx ? "Edit Transaction" : "New Transaction"}</h2>
                <button onClick={() => setTxModalOpen(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <form onSubmit={submitTx} className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Type</label>
                <div className="flex gap-2">
                  {(["income", "expense", "refund"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTxForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 h-9 rounded-[10px] text-[12px] font-semibold capitalize border transition-colors ${
                        txForm.type === t
                          ? t === "income"
                            ? "bg-success/10 border-success/30 text-success"
                            : t === "expense"
                              ? "bg-warning/10 border-warning/30 text-warning"
                              : "bg-info/10 border-info/30 text-info"
                          : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Description</label>
                <input
                  required
                  value={txForm.description}
                  onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="e.g. Payment from client"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Category</label>
                  <input
                    value={txForm.category}
                    onChange={(e) => setTxForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Sales"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Status</label>
                  <select
                    value={txForm.status}
                    onChange={(e) => setTxForm((f) => ({ ...f, status: e.target.value as TxStatus }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Payment Method</label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    {methods.map((m) => (
                      <option key={m.id} value={m.label}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Date</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setTxModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingTx ? "Save Changes" : "Add Transaction"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderInvModal = () => (
    <AnimatePresence>
      {invModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setInvModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">{editingInv ? "Edit Invoice" : "New Invoice"}</h2>
                <button onClick={() => setInvModalOpen(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <form onSubmit={submitInv} className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Client Name</label>
                  <input
                    required
                    value={invForm.client}
                    onChange={(e) => setInvForm((f) => ({ ...f, client: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={invForm.email}
                    onChange={(e) => setInvForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="client@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invForm.tax}
                    onChange={(e) => setInvForm((f) => ({ ...f, tax: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={invForm.dueDate}
                    onChange={(e) => setInvForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] text-ink-secondary font-semibold">Line Items</label>
                  <button
                    type="button"
                    onClick={addInvItem}
                    className="text-[12px] font-semibold text-brand hover:text-brand-dark transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {invForm.items.map((it, idx) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <input
                        value={it.description}
                        onChange={(e) => updateInvItem(it.id, "description", e.target.value)}
                        className="flex-1 h-9 px-3 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[12px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder={`Item ${idx + 1}`}
                      />
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateInvItem(it.id, "quantity", e.target.value)}
                        className="w-16 h-9 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[12px] text-ink text-center focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        min="0"
                        value={it.unitPrice}
                        onChange={(e) => updateInvItem(it.id, "unitPrice", e.target.value)}
                        className="w-24 h-9 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[12px] text-ink text-right focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Price"
                      />
                      {invForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvItem(it.id)}
                          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-divider" />

              <div className="text-right text-[13px] text-ink font-bold">
                Total:{" "}
                {formatPrice(
                  invForm.items.reduce((s, it) => s + (parseFloat(it.quantity as any) || 1) * (parseFloat(it.unitPrice as any) || 0), 0) *
                    (1 + (parseFloat(invForm.tax) || 0) / 100),
                  selectedCurrency,
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setInvModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingInv ? "Save Changes" : "Create Invoice"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderMethodModal = () => (
    <AnimatePresence>
      {methodModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setMethodModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">Add Payment Method</h2>
                <button onClick={() => setMethodModalOpen(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <form onSubmit={submitMethod} className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Type</label>
                <div className="flex gap-2">
                  {([
                    { value: "mpesa" as const, label: "M-Pesa", icon: Smartphone },
                    { value: "bank" as const, label: "Bank", icon: Building2 },
                    { value: "card" as const, label: "Card", icon: CreditCard },
                    { value: "paypal" as const, label: "PayPal", icon: Send },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMethodForm((f) => ({ ...f, type: opt.value }))}
                      className={`flex-1 h-16 rounded-[10px] flex flex-col items-center justify-center gap-1 border transition-colors ${
                        methodForm.type === opt.value
                          ? "bg-brand/10 border-brand/30 text-brand"
                          : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                      }`}
                    >
                      <opt.icon className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Label</label>
                <input
                  required
                  value={methodForm.label}
                  onChange={(e) => setMethodForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="e.g. My M-Pesa"
                />
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Details</label>
                <input
                  required
                  value={methodForm.details}
                  onChange={(e) => setMethodForm((f) => ({ ...f, details: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="Phone number, account, etc."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setMethodModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Add Method
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderTopUpModal = () => (
    <AnimatePresence>
      {topUpModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setTopUpModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">Top Up Wallet</h2>
                <button onClick={() => setTopUpModalOpen(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Select Wallet</label>
                <select
                  value={topUpTarget}
                  onChange={(e) => setTopUpTarget(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {formatPrice(w.balance, w.currency)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setTopUpModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={submitTopUp}>
                  Top Up
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderTransferModal = () => (
    <AnimatePresence>
      {transferModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setTransferModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">Transfer Between Wallets</h2>
                <button onClick={() => setTransferModalOpen(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">From</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {formatPrice(w.balance, w.currency)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">To</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {wallets
                    .filter((w) => w.id !== transferFrom)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {formatPrice(w.balance, w.currency)}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="0"
                />
              </div>
              {transferFrom && transferTo && transferFrom === transferTo && (
                <p className="text-[12px] text-error font-medium">Source and destination cannot be the same</p>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setTransferModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!transferFrom || !transferTo || transferFrom === transferTo || !transferAmount}
                  onClick={submitTransfer}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Detail Modals ─────────────────────────────────────────────────────

  const renderDetailTxModal = () => (
    <AnimatePresence>
      {detailTx && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setDetailTx(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">Transaction Details</h2>
                <button onClick={() => setDetailTx(null)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="text-center py-3">
                <p className={`text-[24px] font-bold tracking-tight ${detailTx.type === "income" ? "text-success" : detailTx.type === "refund" ? "text-info" : "text-ink"}`}>
                  {detailTx.type === "income" || detailTx.type === "refund" ? "+" : "-"}
                  {formatPrice(detailTx.amount, selectedCurrency)}
                </p>
                <Badge variant={TYPE_BADGE[detailTx.type]} size="md" dot className="mt-2">
                  {detailTx.type}
                </Badge>
              </div>
              {[
                { label: "Description", value: detailTx.description },
                { label: "Category", value: detailTx.category },
                { label: "Payment Method", value: detailTx.paymentMethod },
                { label: "Date", value: detailTx.date },
                { label: "Status", value: detailTx.status },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-tertiary">{row.label}</span>
                  <span className="text-[13px] font-semibold text-ink capitalize">{row.value}</span>
                </div>
              ))}
              <Button variant="ghost" fullWidth onClick={() => setDetailTx(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDetailInvModal = () => (
    <AnimatePresence>
      {detailInv && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => setDetailInv(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md glass-material-lg specular-sheen rounded-[24px] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-ink">Invoice {detailInv.id.toUpperCase()}</h2>
                <button onClick={() => setDetailInv(null)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="glass-divider" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-ink">{detailInv.client}</p>
                  <p className="text-[13px] text-ink-tertiary">{detailInv.email}</p>
                </div>
                <Badge variant={INVOICE_STATUS_BADGE[detailInv.status]} size="md" dot>
                  {detailInv.status}
                </Badge>
              </div>
              <div className="glass-divider" />
              <div className="space-y-2">
                {detailInv.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-secondary">
                      {it.description} <span className="text-ink-quaternary">x{it.quantity}</span>
                    </span>
                    <span className="text-ink font-medium">{formatPrice(it.quantity * it.unitPrice, selectedCurrency)}</span>
                  </div>
                ))}
              </div>
              <div className="glass-divider" />
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-tertiary">Subtotal</span>
                  <span className="text-ink">
                    {formatPrice(detailInv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-tertiary">Tax ({detailInv.tax}%)</span>
                  <span className="text-ink">
                    {formatPrice(detailInv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0) * (detailInv.tax / 100), selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-[15px] font-bold">
                  <span className="text-ink">Total</span>
                  <span className="text-ink">{formatPrice(invoiceTotal(detailInv), selectedCurrency)}</span>
                </div>
              </div>
              <div className="flex justify-between text-[12px] text-ink-quaternary">
                <span>Created: {detailInv.createdAt}</span>
                <span>Due: {detailInv.dueDate}</span>
              </div>
              <Button variant="ghost" fullWidth onClick={() => setDetailInv(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <CursorSpotlight className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
        <h1 className="text-headline text-gradient-brand tracking-tight">Payments</h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Transactions, invoices, payment methods, wallets, and financial reports.
        </p>
      </motion.div>

      {/* Stats */}
      {renderStats()}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-1 p-1 glass-material rounded-[14px] w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-9 px-4 rounded-[10px] text-[12px] font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-secondary/60"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === "transactions" && renderTransactions()}
          {activeTab === "invoices" && renderInvoices()}
          {activeTab === "methods" && renderMethods()}
          {activeTab === "wallets" && renderWallets()}
          {activeTab === "reports" && renderReports()}
        </motion.div>
      </AnimatePresence>

      {/* All Modals */}
      {renderTxModal()}
      {renderInvModal()}
      {renderMethodModal()}
      {renderTopUpModal()}
      {renderTransferModal()}
      {renderDetailTxModal()}
      {renderDetailInvModal()}
    </CursorSpotlight>
  );
}

// ── Small Helpers ─────────────────────────────────────────────────────────

function RotateIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
