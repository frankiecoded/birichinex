import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign,
  CreditCard, Wallet, PieChart, ArrowRight, Plus, Trash2, X,
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

interface TxForm {
  type: "income" | "expense" | "transfer";
  description: string;
  amount: string;
  category: string;
  date: string;
}

const EMPTY_TX_FORM: TxForm = { type: "income", description: "", amount: "", category: "", date: "" };

export default function FinancePage() {
  const transactions = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const txFilter = useStore((s) => s.transactionsFilter);
  const setTxFilter = useStore((s) => s.setTransactionsFilter);

  const [viewAll, setViewAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "invoice" | "expense">("add");
  const [form, setForm] = useState<TxForm>(EMPTY_TX_FORM);

  const financials = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount.amount, 0);
    const net = income - expenses;
    return { income, expenses, net };
  }, [transactions]);

  const displayedTransactions = useMemo(() => {
    let list = transactions;
    if (!viewAll) {
      list = list.slice(-5).reverse();
    } else {
      list = [...list].reverse();
    }
    if (txFilter !== "all") {
      list = list.filter((t) => t.type === txFilter);
    }
    return list;
  }, [transactions, viewAll, txFilter]);

  const openAddModal = (type: "add" | "invoice" | "expense") => {
    setModalType(type);
    if (type === "invoice") {
      setForm({ ...EMPTY_TX_FORM, type: "income", category: "Sales" });
    } else if (type === "expense") {
      setForm({ ...EMPTY_TX_FORM, type: "expense", category: "Expenses" });
    } else {
      setForm(EMPTY_TX_FORM);
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    addTransaction({
      type: form.type,
      amount: { amount: parseFloat(form.amount) || 0, currency: "TZS" },
      description: form.description.trim(),
      category: form.category.trim() || "General",
      date: form.date || new Date().toISOString().split("T")[0],
      status: "completed",
    });
    setForm(EMPTY_TX_FORM);
    setModalOpen(false);
  };

  const summaryCards = [
    { label: "Total Revenue", value: formatPrice(financials.income, selectedCurrency), icon: TrendingUp, color: "#30D158" },
    { label: "Total Expenses", value: formatPrice(financials.expenses, selectedCurrency), icon: CreditCard, color: "#FF9500" },
    { label: "Net Profit", value: formatPrice(financials.net, selectedCurrency), icon: Wallet, color: "#007AFF" },
  ];

  return (
    <CursorSpotlight className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
        <h1 className="text-headline text-gradient-brand tracking-tight">Finance</h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Accounting, financial reporting, budgeting, and business financing.
        </p>
      </motion.div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="lg" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-headline font-bold text-ink mt-1 tracking-tight truncate max-w-full">{item.value}</p>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="none">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-subhead font-bold text-ink">{viewAll ? "All Transactions" : "Recent Transactions"}</h3>
              <Badge variant="default" size="sm">{displayedTransactions.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {(["all", "income", "expense"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`h-7 px-2.5 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                      txFilter === f
                        ? "bg-brand/10 text-brand"
                        : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <MagneticButton>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                  onClick={() => setViewAll(!viewAll)}
                >
                  {viewAll ? "Recent" : "View All"}
                </Button>
              </MagneticButton>
            </div>
          </div>
          <div className="divide-y divide-glass-border">
            {displayedTransactions.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-callout text-ink-quaternary">No transactions found</p>
              </div>
            )}
            {displayedTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center ${tx.type === "income" ? "bg-success/10" : "bg-warning/10"}`}>
                  {tx.type === "income" ? <ArrowUpRight className="h-5 w-5 text-success" strokeWidth={1.5} /> : <ArrowDownRight className="h-5 w-5 text-warning" strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-subhead text-ink truncate">{tx.description}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-caption text-ink-quaternary">{tx.category}</p>
                    <span className="text-ink-quaternary text-[10px]">·</span>
                    <p className="text-caption text-ink-quaternary">{tx.date}</p>
                    {tx.status === "pending" && (
                      <Badge variant="warning" size="sm">Pending</Badge>
                    )}
                  </div>
                </div>
                <p className={`text-subhead font-bold shrink-0 tracking-tight ${tx.type === "income" ? "text-success" : "text-ink"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatPrice(tx.amount.amount, selectedCurrency)}
                </p>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Finance Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Generate Invoice", description: "Create and send professional invoices", color: "#007AFF", action: () => openAddModal("invoice") },
          { title: "Expense Report", description: "Log and view monthly expenses", color: "#FF9500", action: () => openAddModal("expense") },
          { title: "New Transaction", description: "Record income, expense, or transfer", color: "#30D158", action: () => openAddModal("add") },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="md" hover className="cursor-pointer" onClick={item.action}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                  <DollarSign className="h-5 w-5" style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-subhead font-bold text-ink">{item.title}</p>
                  <p className="text-caption text-ink-tertiary">{item.description}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">
                    {modalType === "invoice" ? "Generate Invoice" : modalType === "expense" ? "Expense Report" : "New Transaction"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Type</label>
                    <div className="flex gap-2">
                      {(["income", "expense", "transfer"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, type: t }))}
                          className={`flex-1 h-9 rounded-[10px] text-caption font-semibold capitalize border transition-colors ${
                            form.type === t
                              ? t === "income"
                                ? "bg-success/10 border-success/30 text-success"
                                : t === "expense"
                                  ? "bg-warning/10 border-warning/30 text-warning"
                                  : "bg-brand/10 border-brand/30 text-brand"
                              : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Description</label>
                    <input
                      required
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="e.g. Payment from client"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Amount ({selectedCurrency})</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Category</label>
                      <input
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder={modalType === "invoice" ? "Sales" : modalType === "expense" ? "Expenses" : "Category"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {modalType === "invoice" ? "Create Invoice" : modalType === "expense" ? "Log Expense" : "Add Transaction"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CursorSpotlight>
  );
}
