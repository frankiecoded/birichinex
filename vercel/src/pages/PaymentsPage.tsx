import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  Plus,
  Search,
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
  PiggyBank,
  Landmark,
  ArrowDownToLine,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";
import type { WalletTransaction } from "../types";

type TabId = "transactions" | "invoices" | "methods" | "wallets" | "business" | "reports";

type TxType = "income" | "expense" | "transfer";
type TxStatus = "completed" | "pending" | "failed";

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
  status: "draft" | "sent" | "paid" | "overdue";
  createdAt: string;
}

interface PaymentMethod {
  id: string;
  type: "mpesa" | "bank" | "card" | "paypal";
  label: string;
  details: string;
  isDefault: boolean;
}

const TYPE_BADGE: Record<TxType, "success" | "warning" | "info"> = {
  income: "success",
  expense: "warning",
  transfer: "info",
};

const STATUS_BADGE: Record<TxStatus, "success" | "warning" | "error"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
};

const INVOICE_STATUS_BADGE: Record<Invoice["status"], "success" | "info" | "warning" | "error"> = {
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

const WALLET_ICONS: Record<WalletTransaction["type"], typeof Wallet> = {
  deposit: TrendingUp,
  spend: ArrowDownRight,
  cashback: PiggyBank,
  refund: ArrowDownRight,
  "loyalty-bonus": Check,
  revenue: TrendingUp,
  withdraw: Send,
};

const TABS: { id: TabId; label: string; icon: typeof DollarSign }[] = [
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "methods", label: "Payment Methods", icon: CreditCard },
  { id: "wallets", label: "Shopper Wallet", icon: Wallet },
  { id: "business", label: "Business Wallet", icon: Landmark },
  { id: "reports", label: "Reports", icon: TrendingUp },
];

function uid(): string {
  return `px-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-scrim backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative glass-material-lg specular-sheen rounded-[22px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-surface-secondary/70 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const inputClass =
  "w-full h-10 px-3.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all";

export default function PaymentsPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const transactions = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const wallet = useStore((s) => s.wallet);
  const addWalletFunds = useStore((s) => s.addWalletFunds);
  const spendWalletFunds = useStore((s) => s.spendWalletFunds);
  const businessWallet = useStore((s) => s.businessWallet);
  const withdrawals = useStore((s) => s.withdrawals);
  const withdrawFromWallet = useStore((s) => s.withdrawFromWallet);
  const updateWithdrawalStatus = useStore((s) => s.updateWithdrawalStatus);
  const addNotification = useStore((s) => s.addNotification);
  const payoutBank = useStore((s) => s.settings.payoutBank);

  const [activeTab, setActiveTab] = useState<TabId>("transactions");

  // ── Transactions state ──────────────────────────────────────────────────
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<"all" | TxType>("all");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txForm, setTxForm] = useState({
    description: "",
    amount: "",
    type: "income" as TxType,
    status: "completed" as TxStatus,
    category: "",
    date: today(),
  });

  // ── Invoices state ──────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFilter, setInvStatusFilter] = useState<"all" | Invoice["status"]>("all");
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
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [methodForm, setMethodForm] = useState({
    type: "mpesa" as PaymentMethod["type"],
    label: "",
    details: "",
  });

  // ── Wallet state ────────────────────────────────────────────────────────
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpNote, setTopUpNote] = useState("");
  const [topUpError, setTopUpError] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendNote, setSpendNote] = useState("");
  const [spendError, setSpendError] = useState("");

  // ── Business wallet / withdrawal state ───────────────────────────────────
  const [wdrAmount, setWdrAmount] = useState("");
  const [wdrAccountName, setWdrAccountName] = useState(payoutBank?.accountName ?? "");
  const [wdrAccountBank, setWdrAccountBank] = useState(payoutBank?.accountBank ?? "");
  const [wdrAccountNumber, setWdrAccountNumber] = useState(payoutBank?.accountNumber ?? "");
  const [wdrCountry, setWdrCountry] = useState(payoutBank?.country ?? "TZ");
  const [wdrBranchCode, setWdrBranchCode] = useState(payoutBank?.destinationBranchCode ?? "");
  const [wdrError, setWdrError] = useState("");
  const [wdrLoading, setWdrLoading] = useState(false);
  const [payMode, setPayMode] = useState<"flutterwave" | "simulation">("simulation");
  const [withdrawLimits, setWithdrawLimits] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {
        if (data?.mode) setPayMode(data.mode);
        if (data?.withdraw) setWithdrawLimits(data.withdraw);
      })
      .catch(() => { /* offline — default to simulation label */ });
  }, []);

  // ── Detail modal ────────────────────────────────────────────────────────
  const [detailTxId, setDetailTxId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((s, t) => s + t.amount.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((s, t) => s + t.amount.amount, 0);
    const pendingPayments = transactions
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.amount.amount, 0);
    const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
    const pendingInvoices = invoices.filter((i) => i.status === "sent").length;
    return { revenue, expenses, net: revenue - expenses, pendingPayments, overdueInvoices, pendingInvoices };
  }, [transactions, invoices]);

  const filteredTx = useMemo(() => {
    let list = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (txTypeFilter !== "all") list = list.filter((t) => t.type === txTypeFilter);
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      list = list.filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
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
      list = list.filter((i) => i.client.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
    }
    return list;
  }, [invoices, invStatusFilter, invSearch]);

  const reportsData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    const monthMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount.amount;
      const month = t.date.slice(0, 7);
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
      if (t.type === "income") monthMap[month].income += t.amount.amount;
      else if (t.type === "expense") monthMap[month].expense += t.amount.amount;
    });

    const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxCategoryVal = topCategories.length > 0 ? topCategories[0][1] : 1;
    const monthlyData = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const maxMonthly = monthlyData.reduce((m, [, v]) => Math.max(m, v.income, v.expense), 1);

    return { topCategories, maxCategoryVal, monthlyData, maxMonthly };
  }, [transactions]);

  // ── Transaction handlers ─────────────────────────────────────────────────

  const openAddTx = useCallback(() => {
    setEditingTxId(null);
    setTxForm({ description: "", amount: "", type: "income", status: "completed", category: "", date: today() });
    setTxModalOpen(true);
  }, []);

  const openEditTx = useCallback(
    (id: string) => {
      const tx = transactions.find((t) => t.id === id);
      if (!tx) return;
      setEditingTxId(tx.id);
      setTxForm({
        description: tx.description,
        amount: String(tx.amount.amount),
        type: tx.type,
        status: tx.status,
        category: tx.category,
        date: tx.date,
      });
      setTxModalOpen(true);
    },
    [transactions],
  );

  const submitTx = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!txForm.description.trim() || !txForm.amount) return;
      const amount = Math.abs(parseFloat(txForm.amount)) || 0;
      const currency = selectedCurrency;
      if (editingTxId) {
        updateTransaction(editingTxId, {
          description: txForm.description.trim(),
          amount: { amount, currency },
          type: txForm.type,
          status: txForm.status,
          category: txForm.category,
          date: txForm.date,
        });
      } else {
        addTransaction({
          description: txForm.description.trim(),
          amount: { amount, currency },
          type: txForm.type,
          status: txForm.status,
          category: txForm.category,
          date: txForm.date,
        });
      }
      setTxModalOpen(false);
    },
    [txForm, editingTxId, selectedCurrency, addTransaction, updateTransaction],
  );

  const deleteTx = useCallback(
    (id: string) => {
      deleteTransaction(id);
      setDetailTxId(null);
    },
    [deleteTransaction],
  );

  // ── Invoice handlers ─────────────────────────────────────────────────────

  const openAddInv = useCallback(() => {
    setEditingInv(null);
    setInvForm({ client: "", email: "", tax: "18", dueDate: "", items: [{ id: uid(), description: "", quantity: "1", unitPrice: "0" }] });
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

  const submitInv = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!invForm.client.trim()) return;
      const items: InvoiceItem[] = invForm.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: parseInt(it.quantity, 10) || 1,
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
        setInvoices((prev) => [
          { id: uid(), client: invForm.client, email: invForm.email, items, tax: parseFloat(invForm.tax) || 0, dueDate: invForm.dueDate, status: "draft", createdAt: today() },
          ...prev,
        ]);
      }
      setInvModalOpen(false);
    },
    [invForm, editingInv],
  );

  const invoiceTotal = useCallback((inv: Invoice) => {
    const sub = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    return sub + sub * (inv.tax / 100);
  }, []);

  // ── Method handlers ──────────────────────────────────────────────────────

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

  // ── Wallet handlers ──────────────────────────────────────────────────────

  const submitTopUp = useCallback(() => {
    setTopUpError("");
    const amt = Math.floor(parseFloat(topUpAmount) || 0);
    if (amt <= 0) {
      setTopUpError("Enter a valid amount");
      return;
    }
    addWalletFunds(amt, topUpNote.trim() || "Wallet top-up");
    setTopUpModalOpen(false);
    setTopUpAmount("");
    setTopUpNote("");
  }, [topUpAmount, topUpNote, addWalletFunds]);

  const submitSpend = useCallback(() => {
    setSpendError("");
    const amt = Math.floor(parseFloat(spendAmount) || 0);
    if (amt <= 0) {
      setSpendError("Enter a valid amount");
      return;
    }
    const ok = spendWalletFunds(amt, spendNote.trim() || "Wallet withdrawal");
    if (!ok) {
      setSpendError("Insufficient wallet balance");
      return;
    }
    setSpendAmount("");
    setSpendNote("");
  }, [spendAmount, spendNote, spendWalletFunds]);

  // ── Business wallet: withdraw to bank ────────────────────────────────────

  const submitWithdrawal = useCallback(async () => {
    setWdrError("");
    const amt = Math.floor(parseFloat(wdrAmount) || 0);
    if (amt <= 0) {
      setWdrError("Enter a valid amount");
      return;
    }
    if (amt > businessWallet.balance) {
      setWdrError("Insufficient business wallet balance");
      return;
    }
    const accountName = wdrAccountName.trim();
    const accountBank = wdrAccountBank.trim();
    const accountNumber = wdrAccountNumber.trim();
    if (!accountName || !accountBank || !accountNumber) {
      setWdrError("Fill in the beneficiary bank details");
      return;
    }
    setWdrLoading(true);
    try {
      const res = await fetch("/api/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          bankAccount: {
            accountBank,
            accountNumber,
            accountName,
            country: wdrCountry,
            destinationBranchCode: wdrBranchCode.trim() || undefined,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.reference) {
        setWdrError(data?.error || "Withdrawal failed. Try again.");
        return;
      }
      withdrawFromWallet(amt, {
        accountBank,
        accountNumber,
        accountName,
        country: wdrCountry,
        destinationBranchCode: wdrBranchCode.trim() || undefined,
      });
      const created = withdrawals[0];
      if (created) {
        updateWithdrawalStatus(created.id, data.status === "failed" ? "failed" : "completed", data?.message);
      }
      addNotification({
        title: "Withdrawal submitted",
        body: `${data.status === "failed" ? "Failed — " : ""}${amt.toLocaleString("en-US")} TZS → ${accountName} •••• ${accountNumber.slice(-4)}`,
        type: "system",
        actionView: "payments",
      });
      setWdrAmount("");
      setWdrBranchCode("");
    } catch (err) {
      setWdrError("Withdrawal request failed. Check your connection.");
    } finally {
      setWdrLoading(false);
    }
  }, [wdrAmount, wdrAccountName, wdrAccountBank, wdrAccountNumber, wdrCountry, wdrBranchCode, businessWallet.balance, withdrawals, withdrawFromWallet, updateWithdrawalStatus, addNotification]);

  // ── Render: Stats ─────────────────────────────────────────────────────────

  const renderStats = () => {
    const statCards = [
      { label: "Total Revenue", value: stats.revenue, icon: TrendingUp, color: "#30D158" },
      { label: "Total Expenses", value: stats.expenses, icon: TrendingDown, color: "#FF9500" },
      { label: "Net Profit", value: stats.net, icon: DollarSign, color: "#007AFF" },
      { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "#FFD60A" },
      { label: "Overdue Invoices", value: stats.overdueInvoices, icon: AlertCircle, color: "#FF3B30", count: true },
      { label: "Sent Invoices", value: stats.pendingInvoices, icon: Send, color: "#AF52DE", count: true },
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
                  <div className="h-9 w-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${s.color}12` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.color }} strokeWidth={1.5} />
                  </div>
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

  const detailTx = detailTxId ? transactions.find((t) => t.id === detailTxId) ?? null : null;

  // ── Render: Transactions ──────────────────────────────────────────────────

  const renderTransactions = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
            {(["all", "income", "expense", "transfer"] as const).map((f) => (
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
          <input type="date" value={txDateFrom} onChange={(e) => setTxDateFrom(e.target.value)} className="h-8 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[11px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <span className="text-ink-quaternary text-[11px]">to</span>
          <input type="date" value={txDateTo} onChange={(e) => setTxDateTo(e.target.value)} className="h-8 px-2 bg-surface-secondary/60 border border-glass-border rounded-[8px] text-[11px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        <MagneticButton>
          <Button variant="brand" size="sm" icon={<Plus className="h-4 w-4" />} onClick={openAddTx}>
            Add Transaction
          </Button>
        </MagneticButton>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Date</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Description</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Category</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Type</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">Status</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary text-right">Amount</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-ink-quaternary">
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
                  <td className="px-5 py-3.5">
                    <Badge variant={TYPE_BADGE[tx.type]} size="sm">
                      {tx.type === "income" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_BADGE[tx.status]} size="sm" dot>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className={`px-5 py-3.5 text-[13px] font-bold text-right whitespace-nowrap ${tx.type === "income" ? "text-success" : "text-ink"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatPrice(tx.amount.amount, tx.amount.currency)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailTxId(tx.id)} className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors" aria-label="View">
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => openEditTx(tx.id)} className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors" aria-label="Edit">
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => deleteTx(tx.id)} className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors" aria-label="Delete">
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
            Total: {formatPrice(filteredTx.reduce((s, t) => s + (t.type === "expense" ? -t.amount.amount : t.amount.amount), 0), selectedCurrency)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );

  // ── Render: Invoices ──────────────────────────────────────────────────────

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
            No invoices yet — create your first invoice to get paid faster.
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
                    <span>Due: {inv.dueDate || "—"}</span>
                    <span>Created: {inv.createdAt}</span>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {inv.status === "draft" && (
                      <Button variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => setInvoices((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status: "sent" } : x)))}>
                        Send
                      </Button>
                    )}
                    {inv.status === "sent" && (
                      <Button variant="ghost" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => setInvoices((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status: "paid" } : x)))}>
                        Mark Paid
                      </Button>
                    )}
                    {inv.status === "overdue" && (
                      <Button variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => setInvoices((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status: "sent" } : x)))}>
                        Remind
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditInv(inv)} className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors" aria-label="Edit">
                      <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => setInvoices((prev) => prev.filter((x) => x.id !== inv.id))} className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors" aria-label="Delete">
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

  // ── Render: Payment Methods ───────────────────────────────────────────────

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
        {methods.length === 0 && (
          <div className="md:col-span-2 px-5 py-12 text-center text-[13px] text-ink-quaternary glass-material rounded-[14px]">
            No payment methods saved yet. Add your M-Pesa, bank, or card details.
          </div>
        )}
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
                          {m.isDefault && <Badge variant="brand" size="sm">Default</Badge>}
                        </div>
                        <p className="text-[13px] text-ink-tertiary font-mono">{m.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!m.isDefault && (
                        <button
                          onClick={() => setMethods((prev) => prev.map((x) => ({ ...x, isDefault: x.id === m.id })))}
                          className="h-7 px-2 rounded-[7px] text-[11px] font-semibold text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => setMethods((prev) => prev.filter((x) => x.id !== m.id))}
                        className="h-7 w-7 rounded-[7px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                        aria-label="Delete"
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

  // ── Render: Digital Wallet ────────────────────────────────────────────────

  const renderWallets = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <CursorSpotlight spotlightSize={380} spotlightColor="rgba(212,175,55,0.05)">
        <div className="glass-material-lg specular-sheen rounded-[24px] p-6 sm:p-8 border border-glass-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/6 via-transparent to-[#007AFF]/4" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-[12px] bg-brand/12 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <span className="text-overline font-bold uppercase tracking-[0.15em] text-ink-tertiary">BirichiNex Wallet</span>
              </div>
              <p className="text-[13px] text-ink-tertiary">Available balance</p>
              <p className="text-[34px] font-bold text-ink tracking-tight">{formatPrice(wallet.balance, selectedCurrency)}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-ink-tertiary">
                <span>Deposited: <span className="font-semibold text-ink">{formatPrice(wallet.totalDeposited, selectedCurrency)}</span></span>
                <span>Spent: <span className="font-semibold text-ink">{formatPrice(wallet.totalSpent, selectedCurrency)}</span></span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <MagneticButton>
                <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />} onClick={() => { setTopUpError(""); setTopUpAmount(""); setTopUpNote(""); setTopUpModalOpen(true); }}>
                  Top Up
                </Button>
              </MagneticButton>
              <Button variant="secondary" size="md" icon={<ArrowDownRight className="h-4 w-4" />} onClick={() => { setSpendError(""); setSpendAmount(""); setSpendNote(""); }}>
                Spend
              </Button>
            </div>
          </div>
        </div>
      </CursorSpotlight>

      {(spendAmount || spendNote || spendError) && (
        <div className="glass-material rounded-[18px] p-5 border border-glass-border/30">
          <h3 className="text-[14px] font-bold text-ink mb-4">Withdraw from Wallet</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              value={spendAmount}
              onChange={(e) => { setSpendAmount(e.target.value); setSpendError(""); }}
              placeholder="Amount"
              className={inputClass}
            />
            <input
              type="text"
              value={spendNote}
              onChange={(e) => { setSpendNote(e.target.value); setSpendError(""); }}
              placeholder="Note (optional)"
              className={inputClass}
            />
          </div>
          {spendError && <p className="text-[12px] text-error mt-2">{spendError}</p>}
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="md" onClick={submitSpend} disabled={!spendAmount}>Withdraw</Button>
            <Button variant="ghost" size="md" onClick={() => { setSpendAmount(""); setSpendNote(""); setSpendError(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-ink">Recent Activity</h3>
          <p className="text-[13px] text-ink-tertiary">Wallet transactions</p>
        </div>
      </div>

      <GlassCard padding="none">
        <div className="divide-y divide-glass-border">
          {wallet.transactions.length === 0 && (
            <p className="px-5 py-12 text-center text-[13px] text-ink-quaternary">
              No wallet activity yet. Top up to start paying with your wallet.
            </p>
          )}
          {wallet.transactions.slice(0, 20).map((tx) => {
            const Icon = WALLET_ICONS[tx.type] ?? Wallet;
            const positive = tx.type === "deposit" || tx.type === "cashback" || tx.type === "refund" || tx.type === "loyalty-bonus";
            return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 ${positive ? "bg-success/10" : "bg-error/10"}`}>
                  <Icon className={`h-4 w-4 ${positive ? "text-success" : "text-error"}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate capitalize">{tx.description}</p>
                  <p className="text-[11px] text-ink-quaternary">{tx.type} · {new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-[13px] font-bold whitespace-nowrap ${positive ? "text-success" : "text-ink"}`}>
                  {positive ? "+" : "-"}{formatPrice(Math.abs(tx.amount), selectedCurrency)}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );

  // ── Render: Reports ───────────────────────────────────────────────────────

  const renderReports = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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

        <GlassCard padding="lg">
          <h3 className="text-[15px] font-bold text-ink mb-1">Summary</h3>
          <p className="text-[13px] text-ink-tertiary mb-5">Key financial metrics</p>
          <div className="space-y-4">
            {[
              { label: "Total Revenue", value: stats.revenue, color: "#30D158" },
              { label: "Total Expenses", value: stats.expenses, color: "#FF9500" },
              { label: "Net Profit", value: stats.net, color: "#007AFF" },
              { label: "Pending Payments", value: stats.pendingPayments, color: "#FFD60A" },
              { label: "Wallet Balance", value: wallet.balance, color: "#d4af37" },
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
        </GlassCard>
      </div>
    </motion.div>
  );

  // ── Render: Business Wallet ───────────────────────────────────────────────

  const WITHDRAWAL_BADGE: Record<string, "success" | "warning" | "error" | "info"> = {
    completed: "success",
    pending: "warning",
    processing: "warning",
    failed: "error",
  };

  const renderBusiness = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <CursorSpotlight spotlightSize={380} spotlightColor="rgba(212,175,55,0.05)">
        <div className="glass-material-lg specular-sheen rounded-[24px] p-6 sm:p-8 border border-glass-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/6 via-transparent to-[#007AFF]/4" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-[12px] bg-brand/12 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <span className="text-overline font-bold uppercase tracking-[0.15em] text-ink-tertiary">Business Earnings</span>
                <Badge variant={payMode === "flutterwave" ? "success" : "info"} size="sm">
                  {payMode === "flutterwave" ? "Live gateway" : "Simulation mode"}
                </Badge>
              </div>
              <p className="text-[13px] text-ink-tertiary">Withdrawable balance (owner payout)</p>
              <p className="text-[34px] font-bold text-ink tracking-tight">{formatPrice(businessWallet.balance, selectedCurrency)}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-ink-tertiary">
                <span>Earned: <span className="font-semibold text-success">{formatPrice(businessWallet.totalEarned, selectedCurrency)}</span></span>
                <span>Withdrawn: <span className="font-semibold text-ink">{formatPrice(businessWallet.totalWithdrawn, selectedCurrency)}</span></span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 text-[12px] text-ink-quaternary">
              <span>Subscription & dropshipping revenue accrues here.</span>
              <span>Withdraw to your bank in TZS, KES, UGX, NGN, or GHS.</span>
            </div>
          </div>
        </div>
      </CursorSpotlight>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard padding="md" className="space-y-3">
          <div>
            <h3 className="text-[14px] font-bold text-ink">Withdraw to Bank Account</h3>
            <p className="text-[12px] text-ink-tertiary">
              {withdrawLimits
                ? `Min ${formatPrice(withdrawLimits.min, "TZS", "TZS")} · Max ${formatPrice(withdrawLimits.max, "TZS", "TZS")}`
                : "Verified payouts land in 1–2 business days."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Amount (TZS)">
              <input
                type="number"
                min="1"
                value={wdrAmount}
                onChange={(e) => { setWdrAmount(e.target.value); setWdrError(""); }}
                placeholder="e.g. 250000"
                className={inputClass}
              />
            </Field>
            <Field label="Beneficiary name">
              <input
                type="text"
                value={wdrAccountName}
                onChange={(e) => { setWdrAccountName(e.target.value); setWdrError(""); }}
                placeholder="e.g. Frank Musau"
                className={inputClass}
              />
            </Field>
            <Field label="Bank code">
              <input
                type="text"
                value={wdrAccountBank}
                onChange={(e) => { setWdrAccountBank(e.target.value); setWdrError(""); }}
                placeholder="e.g. NMB"
                className={inputClass}
              />
            </Field>
            <Field label="Account number">
              <input
                type="text"
                value={wdrAccountNumber}
                onChange={(e) => { setWdrAccountNumber(e.target.value); setWdrError(""); }}
                placeholder="e.g. 1234567890"
                className={inputClass}
              />
            </Field>
            <Field label="Country">
              <select value={wdrCountry} onChange={(e) => setWdrCountry(e.target.value)} className={inputClass}>
                <option value="TZ">Tanzania</option>
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
              </select>
            </Field>
            <Field label="Branch code (optional, TZ)">
              <input
                type="text"
                value={wdrBranchCode}
                onChange={(e) => setWdrBranchCode(e.target.value)}
                placeholder="Required for some banks"
                className={inputClass}
              />
            </Field>
          </div>
          {wdrError && <p className="text-[12px] text-error">{wdrError}</p>}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<ArrowDownToLine className="h-4 w-4" />}
              onClick={() => void submitWithdrawal()}
              disabled={wdrLoading || !wdrAmount}
            >
              {wdrLoading ? "Submitting…" : "Withdraw"}
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setWdrAmount(""); setWdrAccountName(""); setWdrAccountBank(""); setWdrAccountNumber(""); setWdrBranchCode(""); setWdrError(""); }}>
              Clear
            </Button>
          </div>
        </GlassCard>

        <GlassCard padding="none">
          <div className="px-5 pt-4 pb-3">
            <h3 className="text-[14px] font-bold text-ink">Withdrawal Requests</h3>
            <p className="text-[12px] text-ink-tertiary">Money moves to the owner's bank account</p>
          </div>
          <div className="divide-y divide-glass-border">
            {withdrawals.length === 0 && (
              <p className="px-5 py-10 text-center text-[13px] text-ink-quaternary">
                No withdrawals yet. Your first payout is minutes away.
              </p>
            )}
            {withdrawals.slice(0, 10).map((w) => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                  <Landmark className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {w.bankAccount.accountName} •••• {w.bankAccount.accountNumber.slice(-4)}
                  </p>
                  <p className="text-[11px] text-ink-quaternary">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-ink">{formatPrice(w.amount, selectedCurrency)}</p>
                  <Badge variant={WITHDRAWAL_BADGE[w.status] ?? "info"} size="sm">{w.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-ink">Earnings Activity</h3>
          <p className="text-[13px] text-ink-tertiary">Revenue and withdrawals</p>
        </div>
      </div>

      <GlassCard padding="none">
        <div className="divide-y divide-glass-border">
          {businessWallet.transactions.length === 0 && (
            <p className="px-5 py-12 text-center text-[13px] text-ink-quaternary">
              No earnings yet. Subscriptions and dropshipping sales land here.
            </p>
          )}
          {businessWallet.transactions.slice(0, 20).map((tx) => {
            const Icon = WALLET_ICONS[tx.type] ?? Wallet;
            const positive = tx.type === "revenue" || tx.type === "refund";
            return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 ${positive ? "bg-success/10" : "bg-error/10"}`}>
                  <Icon className={`h-4 w-4 ${positive ? "text-success" : "text-error"}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{tx.description}</p>
                  <p className="text-[11px] text-ink-quaternary">{tx.type} · {new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-[13px] font-bold whitespace-nowrap ${positive ? "text-success" : "text-ink"}`}>
                  {positive ? "+" : "-"}{formatPrice(Math.abs(tx.amount), selectedCurrency)}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "transactions": return renderTransactions();
      case "invoices": return renderInvoices();
      case "methods": return renderMethods();
      case "wallets": return renderWallets();
      case "business": return renderBusiness();
      case "reports": return renderReports();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline text-ink tracking-tight">Payments</h1>
          <p className="text-callout text-ink-tertiary mt-1">Transactions, invoices, payment methods, and wallet</p>
        </div>
      </motion.div>

      {activeTab === "transactions" && renderStats()}

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                active ? "bg-emphasis text-on-emphasis shadow-md" : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-secondary/80"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {txModalOpen && (
          <Modal title={editingTxId ? "Edit Transaction" : "Add Transaction"} onClose={() => setTxModalOpen(false)}>
            <form onSubmit={submitTx} className="space-y-4">
              <Field label="Description *">
                <input type="text" required value={txForm.description} onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Wholesale order — Cotton shirts" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Amount *">
                  <input type="number" required min="1" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} placeholder="250000" className={inputClass} />
                </Field>
                <Field label="Category">
                  <input type="text" value={txForm.category} onChange={(e) => setTxForm((f) => ({ ...f, category: e.target.value }))} placeholder="Sales" className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select value={txForm.type} onChange={(e) => setTxForm((f) => ({ ...f, type: e.target.value as TxType }))} className={inputClass}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={txForm.status} onChange={(e) => setTxForm((f) => ({ ...f, status: e.target.value as TxStatus }))} className={inputClass}>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </Field>
              </div>
              <Field label="Date">
                <input type="date" value={txForm.date} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
              </Field>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setTxModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={<Check className="h-4 w-4" />}>{editingTxId ? "Save Changes" : "Add Transaction"}</Button>
              </div>
            </form>
          </Modal>
        )}

        {invModalOpen && (
          <Modal title={editingInv ? "Edit Invoice" : "New Invoice"} onClose={() => setInvModalOpen(false)}>
            <form onSubmit={submitInv} className="space-y-4">
              <Field label="Client *">
                <input type="text" required value={invForm.client} onChange={(e) => setInvForm((f) => ({ ...f, client: e.target.value }))} placeholder="Company or person" className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" value={invForm.email} onChange={(e) => setInvForm((f) => ({ ...f, email: e.target.value }))} placeholder="client@example.com" className={inputClass} />
              </Field>
              <div>
                <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Items</label>
                <div className="space-y-2">
                  {invForm.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <input type="text" value={it.description} onChange={(e) => setInvForm((f) => ({ ...f, items: f.items.map((x) => (x.id === it.id ? { ...x, description: e.target.value } : x)) }))} placeholder="Description" className={`${inputClass} flex-1`} />
                      <input type="number" value={it.quantity} onChange={(e) => setInvForm((f) => ({ ...f, items: f.items.map((x) => (x.id === it.id ? { ...x, quantity: e.target.value } : x)) }))} placeholder="Qty" className={`${inputClass} w-16`} />
                      <input type="number" value={it.unitPrice} onChange={(e) => setInvForm((f) => ({ ...f, items: f.items.map((x) => (x.id === it.id ? { ...x, unitPrice: e.target.value } : x)) }))} placeholder="Unit price" className={`${inputClass} w-28`} />
                      <button type="button" onClick={() => setInvForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((x) => x.id !== it.id) : f.items }))} className="h-8 w-8 rounded-full text-ink-quaternary hover:text-error transition-colors shrink-0" aria-label="Remove item">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setInvForm((f) => ({ ...f, items: [...f.items, { id: uid(), description: "", quantity: "1", unitPrice: "0" }] }))}>
                  Add Item
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tax %">
                  <input type="number" value={invForm.tax} onChange={(e) => setInvForm((f) => ({ ...f, tax: e.target.value }))} className={inputClass} />
                </Field>
                <Field label="Due Date">
                  <input type="date" value={invForm.dueDate} onChange={(e) => setInvForm((f) => ({ ...f, dueDate: e.target.value }))} className={inputClass} />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setInvModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={<Check className="h-4 w-4" />}>{editingInv ? "Save Changes" : "Create Invoice"}</Button>
              </div>
            </form>
          </Modal>
        )}

        {methodModalOpen && (
          <Modal title="Add Payment Method" onClose={() => setMethodModalOpen(false)}>
            <form onSubmit={submitMethod} className="space-y-4">
              <Field label="Type">
                <select value={methodForm.type} onChange={(e) => setMethodForm((f) => ({ ...f, type: e.target.value as PaymentMethod["type"] }))} className={inputClass}>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Account</option>
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </Field>
              <Field label="Label *">
                <input type="text" required value={methodForm.label} onChange={(e) => setMethodForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. M-Pesa Business" className={inputClass} />
              </Field>
              <Field label="Details *">
                <input type="text" required value={methodForm.details} onChange={(e) => setMethodForm((f) => ({ ...f, details: e.target.value }))} placeholder="+255 7XX XXX XXX" className={inputClass} />
              </Field>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setMethodModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={<Check className="h-4 w-4" />}>Add Method</Button>
              </div>
            </form>
          </Modal>
        )}

        {topUpModalOpen && (
          <Modal title="Top Up Wallet" onClose={() => setTopUpModalOpen(false)}>
            <div className="space-y-4">
              <Field label="Amount *">
                <input type="number" min="1" value={topUpAmount} onChange={(e) => { setTopUpAmount(e.target.value); setTopUpError(""); }} placeholder="e.g. 50000" className={inputClass} />
              </Field>
              <Field label="Note">
                <input type="text" value={topUpNote} onChange={(e) => setTopUpNote(e.target.value)} placeholder="Optional reference" className={inputClass} />
              </Field>
              {topUpError && <p className="text-[12px] text-error">{topUpError}</p>}
              <p className="text-[11px] text-ink-quaternary">Funds are added instantly and can be used at checkout, in the shop, or the marketplace.</p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setTopUpModalOpen(false)}>Cancel</Button>
                <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={submitTopUp}>Add Funds</Button>
              </div>
            </div>
          </Modal>
        )}

        {detailTx && (
          <Modal title="Transaction Details" onClose={() => setDetailTxId(null)}>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-[13px] text-ink-tertiary">Description</span><span className="text-[13px] font-semibold text-ink text-right">{detailTx.description}</span></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-ink-tertiary">Category</span><span className="text-[13px] font-semibold text-ink">{detailTx.category}</span></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-ink-tertiary">Type</span><Badge variant={TYPE_BADGE[detailTx.type]} size="sm">{detailTx.type}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-ink-tertiary">Status</span><Badge variant={STATUS_BADGE[detailTx.status]} size="sm" dot>{detailTx.status}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-ink-tertiary">Date</span><span className="text-[13px] font-semibold text-ink">{detailTx.date}</span></div>
              <div className="glass-divider" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-tertiary">Amount</span>
                <span className={`text-[16px] font-bold ${detailTx.type === "income" ? "text-success" : "text-ink"}`}>
                  {detailTx.type === "income" ? "+" : "-"}{formatPrice(detailTx.amount.amount, detailTx.amount.currency)}
                </span>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

