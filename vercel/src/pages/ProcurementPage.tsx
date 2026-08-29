import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Plus, Search, Filter, X, Check, Clock, AlertCircle,
  Building2, Truck, DollarSign, Send, Eye, Edit3, Trash2,
  ArrowUpRight, Shield, Package, Users, Sparkles, Bot,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";


// ============================================
// Types
// ============================================

type SupplierCategory = "Raw Materials" | "Electronics" | "Packaging" | "Logistics" | "Software" | "Services";
type POStatus = "draft" | "pending" | "approved" | "received" | "cancelled";
type QuoteStatus = "requested" | "received" | "accepted" | "expired";
type ContractStatus = "active" | "expiring" | "expired" | "terminated";

interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  rating: number;
  location: string;
  contact: string;
  email: string;
  activeOrders: number;
  totalSpend: number;
}

interface POItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: POItem[];
  total: number;
  status: POStatus;
  createdAt: string;
  expectedDelivery: string;
  notes: string;
  requiresApproval: boolean;
  approved: boolean;
}

interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  description: string;
  requestedAmount: number;
  quotedAmount: number;
  status: QuoteStatus;
  requestedAt: string;
  validUntil: string;
  notes: string;
}

interface Contract {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
}

interface Approval {
  id: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

const APPROVAL_THRESHOLD = 10000000;

// ============================================
// Helpers
// ============================================

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function statusBadgeVariant(status: string): "success" | "warning" | "error" | "info" | "default" {
  switch (status) {
    case "approved":
    case "received":
    case "accepted":
    case "active":
      return "success";
    case "pending":
    case "requested":
    case "expiring":
      return "warning";
    case "cancelled":
    case "expired":
    case "rejected":
    case "terminated":
      return "error";
    case "draft":
      return "info";
    default:
      return "default";
  }
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}

// ============================================
// Component
// ============================================

type ActiveTab = "overview" | "suppliers" | "orders" | "quotes" | "contracts" | "approvals";

export default function ProcurementPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const settings = useStore((s) => s.settings);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Supplier state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierModal, setSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({ name: "", category: "Raw Materials" as SupplierCategory, location: "", contact: "", email: "" });

  // PO state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poSearch, setPoSearch] = useState("");
  const [poFilter, setPoFilter] = useState<POStatus | "all">("all");
  const [poModal, setPoModal] = useState(false);
  const [poForm, setPoForm] = useState({ supplierId: "", items: [{ name: "", quantity: "", unitPrice: "" }], notes: "", expectedDelivery: "" });

  // Quote state
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteFilter, setQuoteFilter] = useState<QuoteStatus | "all">("all");
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ supplierId: "", description: "", requestedAmount: "", notes: "", validUntil: "" });

  // Contract state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractModal, setContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({ supplierId: "", title: "", value: "", startDate: "", endDate: "", autoRenew: false });

  // Detail view
  const [detailView, setDetailView] = useState<{ type: "po" | "quote" | "contract"; id: string } | null>(null);

  // AI Quote Analyst state
  const [playbook, setPlaybook] = useState<{ text: string; source: string } | null>(null);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const [playbookError, setPlaybookError] = useState<string | null>(null);

  const companyName = settings.profile.company || "My Business";
  const generatePlaybook = async (quote: Quotation) => {
    if (playbookLoading) return;
    setPlaybookLoading(true);
    setPlaybookError(null);
    setPlaybook(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: quote.description || "Bulk quotation",
              quantity: 1,
              priceTZS: quote.requestedAmount || 0,
            },
          ],
          businessProfile: {
            businessName: companyName,
            businessLocation: quote.supplierName ? `Sourcing from ${quote.supplierName}` : "East Africa",
            experience: "Entrepreneur",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed");
      setPlaybook({ text: data?.playbook || "", source: data?.source || "simulated-analyst" });
    } catch (err: any) {
      setPlaybookError(err?.message || "Could not reach the AI analyst. Check that the server is running.");
    } finally {
      setPlaybookLoading(false);
    }
  };

  // ============================================
  // Computed / Memoised
  // ============================================

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const q = supplierSearch.toLowerCase();
    return suppliers.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.location.toLowerCase().includes(q),
    );
  }, [suppliers, supplierSearch]);

  const filteredPOs = useMemo(() => {
    let list = purchaseOrders;
    if (poFilter !== "all") list = list.filter((po) => po.status === poFilter);
    if (poSearch.trim()) {
      const q = poSearch.toLowerCase();
      list = list.filter((po) => po.supplierName.toLowerCase().includes(q) || po.id.toLowerCase().includes(q));
    }
    return list;
  }, [purchaseOrders, poSearch, poFilter]);

  const filteredQuotes = useMemo(() => {
    let list = quotations;
    if (quoteFilter !== "all") list = list.filter((q) => q.status === quoteFilter);
    if (quoteSearch.trim()) {
      const q = quoteSearch.toLowerCase();
      list = list.filter((qt) => qt.supplierName.toLowerCase().includes(q) || qt.description.toLowerCase().includes(q));
    }
    return list;
  }, [quotations, quoteSearch, quoteFilter]);

  const pendingApprovals = useMemo(() => {
    const list: Approval[] = [];
    purchaseOrders.forEach((po) => {
      if (po.requiresApproval && !po.approved && po.status === "pending") {
        list.push({
          id: `a-${po.id}`,
          poId: po.id,
          poNumber: po.id.toUpperCase(),
          supplierName: po.supplierName,
          amount: po.total,
          requestedBy: "Procurement Team",
          requestedAt: po.createdAt,
          status: "pending",
          reason: po.notes,
        });
      }
    });
    return list;
  }, [purchaseOrders]);

  const stats = useMemo(() => {
    const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.total, 0);
    const activeSuppliers = suppliers.filter((s) => s.activeOrders > 0).length;
    const pendingOrders = purchaseOrders.filter((po) => po.status === "pending" || po.status === "draft").length;
    const pendingApprovalCount = pendingApprovals.length;
    return [
      { label: "Total Spend", value: formatPrice(totalSpend, selectedCurrency), icon: DollarSign, color: "#D4AF37" },
      { label: "Active Suppliers", value: String(activeSuppliers), icon: Building2, color: "#007AFF" },
      { label: "Pending Orders", value: String(pendingOrders), icon: Package, color: "#FF9500" },
      { label: "Pending Approvals", value: String(pendingApprovalCount), icon: Shield, color: "#FF3B30" },
    ];
  }, [purchaseOrders, suppliers, pendingApprovals, selectedCurrency]);

  // ============================================
  // Supplier CRUD
  // ============================================

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id ? { ...s, name: supplierForm.name, category: supplierForm.category, location: supplierForm.location, contact: supplierForm.contact, email: supplierForm.email } : s,
        ),
      );
    } else {
      setSuppliers((prev) => [
        ...prev,
        {
          id: genId("sup"),
          name: supplierForm.name,
          category: supplierForm.category,
          rating: 0,
          location: supplierForm.location,
          contact: supplierForm.contact,
          email: supplierForm.email,
          activeOrders: 0,
          totalSpend: 0,
        },
      ]);
    }
    setSupplierForm({ name: "", category: "Raw Materials", location: "", contact: "", email: "" });
    setEditingSupplier(null);
    setSupplierModal(false);
  };

  const openEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({ name: supplier.name, category: supplier.category, location: supplier.location, contact: supplier.contact, email: supplier.email });
    setSupplierModal(true);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================================
  // PO CRUD
  // ============================================

  const handlePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplierId) return;
    const supplier = suppliers.find((s) => s.id === poForm.supplierId);
    if (!supplier) return;
    const items: POItem[] = poForm.items
      .filter((item) => item.name.trim() && item.quantity)
      .map((item) => {
        const qty = parseInt(item.quantity, 10) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        return { name: item.name, quantity: qty, unitPrice: price, total: qty * price };
      });
    if (items.length === 0) return;
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const requiresApproval = total >= APPROVAL_THRESHOLD;
    setPurchaseOrders((prev) => [
      ...prev,
      {
        id: genId("po"),
        supplierId: supplier.id,
        supplierName: supplier.name,
        items,
        total,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        expectedDelivery: poForm.expectedDelivery,
        notes: poForm.notes,
        requiresApproval,
        approved: false,
      },
    ]);
    setPoForm({ supplierId: "", items: [{ name: "", quantity: "", unitPrice: "" }], notes: "", expectedDelivery: "" });
    setPoModal(false);
  };

  const updatePOStatus = (id: string, status: POStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== id) return po;
        if (status === "approved" && po.requiresApproval) return { ...po, status, approved: true };
        return { ...po, status };
      }),
    );
  };

  const deletePO = (id: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
  };

  // ============================================
  // Quote CRUD
  // ============================================

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.supplierId) return;
    const supplier = suppliers.find((s) => s.id === quoteForm.supplierId);
    if (!supplier) return;
    setQuotations((prev) => [
      ...prev,
      {
        id: genId("qt"),
        supplierId: supplier.id,
        supplierName: supplier.name,
        description: quoteForm.description,
        requestedAmount: parseFloat(quoteForm.requestedAmount) || 0,
        quotedAmount: 0,
        status: "requested",
        requestedAt: new Date().toISOString().split("T")[0],
        validUntil: quoteForm.validUntil,
        notes: quoteForm.notes,
      },
    ]);
    setQuoteForm({ supplierId: "", description: "", requestedAmount: "", notes: "", validUntil: "" });
    setQuoteModal(false);
  };

  const updateQuoteStatus = (id: string, status: QuoteStatus) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  const deleteQuote = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  // ============================================
  // Contract CRUD
  // ============================================

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.supplierId) return;
    const supplier = suppliers.find((s) => s.id === contractForm.supplierId);
    if (!supplier) return;
    const endDate = new Date(contractForm.endDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: ContractStatus = "active";
    if (daysUntilEnd < 0) status = "expired";
    else if (daysUntilEnd < 30) status = "expiring";
    setContracts((prev) => [
      ...prev,
      {
        id: genId("ct"),
        supplierId: supplier.id,
        supplierName: supplier.name,
        title: contractForm.title,
        value: parseFloat(contractForm.value) || 0,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        status,
        autoRenew: contractForm.autoRenew,
      },
    ]);
    setContractForm({ supplierId: "", title: "", value: "", startDate: "", endDate: "", autoRenew: false });
    setContractModal(false);
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  // ============================================
  // Approval Actions
  // ============================================

  const approvePO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "approved" as POStatus, approved: true } : po)),
    );
  };

  const rejectPO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "cancelled" as POStatus } : po)),
    );
  };

  // ============================================
  // Detail Modal
  // ============================================

  const renderDetailModal = () => {
    if (!detailView) return null;

    if (detailView.type === "po") {
      const po = purchaseOrders.find((p) => p.id === detailView.id);
      if (!po) return null;
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setDetailView(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-subhead font-bold text-ink">Purchase Order</h2>
                  <Badge variant={statusBadgeVariant(po.status)} size="sm">{po.status}</Badge>
                </div>
                <button onClick={() => setDetailView(null)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Supplier</p>
                    <p className="text-subhead text-ink font-semibold">{po.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Total</p>
                    <p className="text-subhead text-ink font-bold">{formatPrice(po.total, selectedCurrency)}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Created</p>
                    <p className="text-caption text-ink-secondary">{po.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Expected Delivery</p>
                    <p className="text-caption text-ink-secondary">{po.expectedDelivery}</p>
                  </div>
                </div>
                <div>
                  <p className="text-caption text-ink-quaternary mb-2">Items</p>
                  <div className="space-y-2">
                    {po.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface-secondary/40 rounded-[10px]">
                        <div>
                          <p className="text-caption text-ink font-semibold">{item.name}</p>
                          <p className="text-[11px] text-ink-quaternary">{item.quantity} × {formatPrice(item.unitPrice, selectedCurrency)}</p>
                        </div>
                        <p className="text-caption text-ink font-bold">{formatPrice(item.total, selectedCurrency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {po.notes && (
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Notes</p>
                    <p className="text-caption text-ink-secondary">{po.notes}</p>
                  </div>
                )}
                {po.requiresApproval && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-[10px]">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0" strokeWidth={1.5} />
                    <p className="text-caption text-warning">Requires approval (above {formatPrice(APPROVAL_THRESHOLD, selectedCurrency)} threshold)</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (detailView.type === "quote") {
      const quote = quotations.find((q) => q.id === detailView.id);
      if (!quote) return null;
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setDetailView(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-subhead font-bold text-ink">Quotation</h2>
                  <Badge variant={statusBadgeVariant(quote.status)} size="sm">{quote.status}</Badge>
                </div>
                <button onClick={() => setDetailView(null)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-ink-quaternary mb-1">Supplier</p>
                  <p className="text-subhead text-ink font-semibold">{quote.supplierName}</p>
                </div>
                <div>
                  <p className="text-caption text-ink-quaternary mb-1">Description</p>
                  <p className="text-caption text-ink-secondary">{quote.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Requested Amount</p>
                    <p className="text-subhead text-ink font-bold">{formatPrice(quote.requestedAmount, selectedCurrency)}</p>
                  </div>
                  {quote.quotedAmount > 0 && (
                    <div>
                      <p className="text-caption text-ink-quaternary mb-1">Quoted Amount</p>
                      <p className="text-subhead text-success font-bold">{formatPrice(quote.quotedAmount, selectedCurrency)}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Requested</p>
                    <p className="text-caption text-ink-secondary">{quote.requestedAt}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Valid Until</p>
                    <p className="text-caption text-ink-secondary">{quote.validUntil}</p>
                  </div>
                </div>
                {quote.notes && (
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Notes</p>
                    <p className="text-caption text-ink-secondary">{quote.notes}</p>
                  </div>
                )}

                {/* AI Quote Analyst */}
                <div className="pt-2 border-t border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-brand" strokeWidth={1.5} />
                      <p className="text-caption font-bold text-ink">AI Growth Playbook</p>
                    </div>
                    {playbook?.source && (
                      <Badge variant={playbook.source === "gemini-3.5-flash" ? "brand" : "default"} size="sm">
                        {playbook.source === "gemini-3.5-flash" ? "AI analyst · live" : "Built-in analyst"}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    loading={playbookLoading}
                    onClick={() => generatePlaybook(quote)}
                  >
                    {playbookLoading ? "Analyzing…" : "Generate Growth Playbook"}
                  </Button>
                  {playbookError && (
                    <p className="text-caption text-error mt-2">{playbookError}</p>
                  )}
                  {playbook?.text && (
                    <div className="mt-3 rounded-[12px] bg-surface-secondary/50 border border-glass-border p-4">
                      <pre className="text-caption text-ink-secondary whitespace-pre-wrap font-sans leading-relaxed max-h-[320px] overflow-y-auto">
                        {playbook.text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (detailView.type === "contract") {
      const contract = contracts.find((c) => c.id === detailView.id);
      if (!contract) return null;
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setDetailView(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-subhead font-bold text-ink">Contract</h2>
                  <Badge variant={statusBadgeVariant(contract.status)} size="sm">{contract.status}</Badge>
                </div>
                <button onClick={() => setDetailView(null)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-ink-quaternary mb-1">Title</p>
                  <p className="text-subhead text-ink font-semibold">{contract.title}</p>
                </div>
                <div>
                  <p className="text-caption text-ink-quaternary mb-1">Supplier</p>
                  <p className="text-caption text-ink-secondary">{contract.supplierName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Contract Value</p>
                    <p className="text-subhead text-ink font-bold">{formatPrice(contract.value, selectedCurrency)}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Auto-Renew</p>
                    <p className="text-caption text-ink-secondary">{contract.autoRenew ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">Start Date</p>
                    <p className="text-caption text-ink-secondary">{contract.startDate}</p>
                  </div>
                  <div>
                    <p className="text-caption text-ink-quaternary mb-1">End Date</p>
                    <p className="text-caption text-ink-secondary">{contract.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    return null;
  };

  // ============================================
  // Tab Definitions
  // ============================================

  const tabs: { id: ActiveTab; label: string; icon: typeof FileText }[] = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "suppliers", label: "Suppliers", icon: Building2 },
    { id: "orders", label: "Purchase Orders", icon: Package },
    { id: "quotes", label: "Quotations", icon: FileText },
    { id: "contracts", label: "Contracts", icon: Shield },
    { id: "approvals", label: "Approvals", icon: Check },
  ];

  // ============================================
  // Render
  // ============================================

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-headline text-ink tracking-tight"><span className="text-gradient-brand">Procurement</span></h1>
          <p className="text-callout text-ink-tertiary mt-1">Suppliers, purchase orders, quotations, and contracts.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={5}>
                <GlassCard padding="md" hover>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                    <div className="h-8 w-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                      <stat.icon className="h-4 w-4" style={{ color: stat.color }} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-1 p-1 bg-surface-secondary/40 backdrop-blur-sm rounded-[14px] border border-glass-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-10 px-4 rounded-[12px] text-caption font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-surface-primary shadow-sm text-ink"
                  : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/60"
              }`}
            >
              <tab.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ============================
          OVERVIEW TAB
          ============================ */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
            {/* Recent POs */}
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <h3 className="text-subhead font-bold text-ink">Recent Purchase Orders</h3>
                <MagneticButton>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} icon={<ArrowUpRight className="h-3.5 w-3.5" />} iconPosition="right">View All</Button>
                </MagneticButton>
              </div>
              <div className="divide-y divide-glass-border">
                {purchaseOrders.slice(-4).reverse().map((po) => (
                  <div key={po.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors cursor-pointer" onClick={() => setDetailView({ type: "po", id: po.id })}>
                    <div className="h-10 w-10 rounded-[12px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-ink-tertiary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subhead text-ink truncate">{po.supplierName}</p>
                      <p className="text-caption text-ink-quaternary">{po.items.length} item{po.items.length > 1 ? "s" : ""} · {po.createdAt}</p>
                    </div>
                    <p className="text-subhead font-bold text-ink shrink-0">{formatPrice(po.total, selectedCurrency)}</p>
                    <Badge variant={statusBadgeVariant(po.status)} size="sm">{po.status}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <GlassCard padding="none">
                <div className="p-5 border-b border-glass-border flex items-center gap-3">
                  <Shield className="h-4 w-4 text-warning" strokeWidth={1.5} />
                  <h3 className="text-subhead font-bold text-ink">Pending Approvals</h3>
                  <Badge variant="warning" size="sm">{pendingApprovals.length}</Badge>
                </div>
                <div className="divide-y divide-glass-border">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors">
                      <div className="h-10 w-10 rounded-[12px] bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5 text-warning" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-subhead text-ink truncate">{approval.supplierName}</p>
                        <p className="text-caption text-ink-quaternary">PO: {approval.poNumber} · {approval.requestedAt}</p>
                      </div>
                      <p className="text-subhead font-bold text-ink shrink-0">{formatPrice(approval.amount, selectedCurrency)}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="primary" size="sm" onClick={() => approvePO(approval.poId)}>
                          <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} /> Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => rejectPO(approval.poId)}>
                          <X className="h-3.5 w-3.5 mr-1" strokeWidth={2} /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Active Contracts */}
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <h3 className="text-subhead font-bold text-ink">Active Contracts</h3>
                <MagneticButton>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("contracts")} icon={<ArrowUpRight className="h-3.5 w-3.5" />} iconPosition="right">View All</Button>
                </MagneticButton>
              </div>
              <div className="divide-y divide-glass-border">
                {contracts.filter((c) => c.status === "active" || c.status === "expiring").slice(0, 3).map((contract) => (
                  <div key={contract.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors cursor-pointer" onClick={() => setDetailView({ type: "contract", id: contract.id })}>
                    <div className="h-10 w-10 rounded-[12px] bg-brand/10 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subhead text-ink truncate">{contract.title}</p>
                      <p className="text-caption text-ink-quaternary">{contract.supplierName} · Ends {contract.endDate}</p>
                    </div>
                    <p className="text-subhead font-bold text-ink shrink-0">{formatPrice(contract.value, selectedCurrency)}</p>
                    <Badge variant={statusBadgeVariant(contract.status)} size="sm">{contract.status}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ============================
            SUPPLIERS TAB
            ============================ */}
        {activeTab === "suppliers" && (
          <motion.div key="suppliers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Suppliers</h3>
                  <Badge variant="default" size="sm">{filteredSuppliers.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
                    <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                    <input
                      placeholder="Search suppliers..."
                      className="bg-transparent text-caption text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[160px]"
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingSupplier(null); setSupplierForm({ name: "", category: "Raw Materials", location: "", contact: "", email: "" }); setSupplierModal(true); }}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">Supplier</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Category</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden lg:table-cell">Location</th>
                      <th className="text-center text-overline text-ink-quaternary px-5 py-3">Rating</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Total Spend</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Active Orders</th>
                      <th className="w-24 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-callout text-ink-quaternary">No suppliers found</td></tr>
                    )}
                    {filteredSuppliers.map((supplier, i) => (
                      <motion.tr
                        key={supplier.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                            </div>
                            <div>
                              <span className="text-subhead font-semibold text-ink">{supplier.name}</span>
                              <p className="text-[11px] text-ink-quaternary">{supplier.contact}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <Badge variant="default" size="sm">{supplier.category}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden lg:table-cell">{supplier.location}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-[13px] text-brand font-semibold">{renderStars(supplier.rating)}</span>
                          <span className="text-[11px] text-ink-quaternary ml-1">{supplier.rating}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-caption text-ink font-semibold hidden sm:table-cell">{formatPrice(supplier.totalSpend, selectedCurrency)}</td>
                        <td className="px-5 py-3.5 text-right text-caption text-ink-secondary hidden md:table-cell">{supplier.activeOrders}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openEditSupplier(supplier)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-brand hover:bg-brand/10 transition-colors">
                              <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <button onClick={() => deleteSupplier(supplier.id)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ============================
            PURCHASE ORDERS TAB
            ============================ */}
        {activeTab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Purchase Orders</h3>
                  <Badge variant="default" size="sm">{filteredPOs.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {(["all", "draft", "pending", "approved", "received", "cancelled"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setPoFilter(f)}
                        className={`h-7 px-2.5 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                          poFilter === f
                            ? "bg-brand/10 text-brand"
                            : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/80"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
                    <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                    <input
                      placeholder="Search POs..."
                      className="bg-transparent text-caption text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[140px]"
                      value={poSearch}
                      onChange={(e) => setPoSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setPoModal(true)}>
                    New PO
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">PO ID</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">Supplier</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Items</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3">Total</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Created</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden lg:table-cell">Delivery</th>
                      <th className="text-center text-overline text-ink-quaternary px-5 py-3">Status</th>
                      <th className="w-28 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPOs.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-callout text-ink-quaternary">No purchase orders found</td></tr>
                    )}
                    {filteredPOs.map((po, i) => (
                      <motion.tr
                        key={po.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-caption font-mono text-ink font-semibold cursor-pointer hover:text-brand" onClick={() => setDetailView({ type: "po", id: po.id })}>
                            {po.id.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-subhead text-ink">{po.supplierName}</span>
                          {po.requiresApproval && !po.approved && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3 text-warning" strokeWidth={1.5} />
                              <span className="text-[10px] text-warning font-semibold">Needs approval</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-caption text-ink-secondary hidden sm:table-cell">{po.items.length}</td>
                        <td className="px-5 py-3.5 text-right text-subhead font-bold text-ink">{formatPrice(po.total, selectedCurrency)}</td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden md:table-cell">{po.createdAt}</td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden lg:table-cell">{po.expectedDelivery}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={statusBadgeVariant(po.status)} size="sm">{po.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setDetailView({ type: "po", id: po.id })} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors">
                              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            {po.status === "draft" && (
                              <button onClick={() => updatePOStatus(po.id, "pending")} className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-caption font-semibold text-brand hover:bg-brand/10 transition-colors">
                                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Submit</span>
                              </button>
                            )}
                            {po.status === "pending" && !po.requiresApproval && (
                              <button onClick={() => updatePOStatus(po.id, "approved")} className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-caption font-semibold text-success hover:bg-success/10 transition-colors">
                                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                            )}
                            {po.status === "approved" && (
                              <button onClick={() => updatePOStatus(po.id, "received")} className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-caption font-semibold text-success hover:bg-success/10 transition-colors">
                                <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Receive</span>
                              </button>
                            )}
                            <button onClick={() => deletePO(po.id)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ============================
            QUOTATIONS TAB
            ============================ */}
        {activeTab === "quotes" && (
          <motion.div key="quotes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Quotations</h3>
                  <Badge variant="default" size="sm">{filteredQuotes.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {(["all", "requested", "received", "accepted", "expired"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setQuoteFilter(f)}
                        className={`h-7 px-2.5 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                          quoteFilter === f
                            ? "bg-brand/10 text-brand"
                            : "text-ink-quaternary hover:text-ink-secondary hover:bg-surface-secondary/80"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
                    <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                    <input
                      placeholder="Search quotes..."
                      className="bg-transparent text-caption text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[140px]"
                      value={quoteSearch}
                      onChange={(e) => setQuoteSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setQuoteModal(true)}>
                    Request Quote
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">Quote ID</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">Supplier</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Description</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Requested</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3">Quoted</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden lg:table-cell">Valid Until</th>
                      <th className="text-center text-overline text-ink-quaternary px-5 py-3">Status</th>
                      <th className="w-28 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-callout text-ink-quaternary">No quotations found</td></tr>
                    )}
                    {filteredQuotes.map((quote, i) => (
                      <motion.tr
                        key={quote.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-caption font-mono text-ink font-semibold cursor-pointer hover:text-brand" onClick={() => setDetailView({ type: "quote", id: quote.id })}>
                            {quote.id.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-subhead text-ink">{quote.supplierName}</td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden md:table-cell max-w-[200px] truncate">{quote.description}</td>
                        <td className="px-5 py-3.5 text-right text-caption text-ink-secondary hidden sm:table-cell">{formatPrice(quote.requestedAmount, selectedCurrency)}</td>
                        <td className="px-5 py-3.5 text-right text-subhead font-bold text-ink">
                          {quote.quotedAmount > 0 ? formatPrice(quote.quotedAmount, selectedCurrency) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden lg:table-cell">{quote.validUntil}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={statusBadgeVariant(quote.status)} size="sm">{quote.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setDetailView({ type: "quote", id: quote.id })} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors">
                              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            {quote.status === "requested" && (
                              <button onClick={() => updateQuoteStatus(quote.id, "received")} className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-caption font-semibold text-info hover:bg-info/10 transition-colors">
                                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Received</span>
                              </button>
                            )}
                            {quote.status === "received" && (
                              <button onClick={() => updateQuoteStatus(quote.id, "accepted")} className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-caption font-semibold text-success hover:bg-success/10 transition-colors">
                                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Accept</span>
                              </button>
                            )}
                            <button onClick={() => deleteQuote(quote.id)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ============================
            CONTRACTS TAB
            ============================ */}
        {activeTab === "contracts" && (
          <motion.div key="contracts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Contracts</h3>
                  <Badge variant="default" size="sm">{contracts.length}</Badge>
                </div>
                <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setContractModal(true)}>
                  New Contract
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3">Title</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Supplier</th>
                      <th className="text-right text-overline text-ink-quaternary px-5 py-3">Value</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Start</th>
                      <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">End</th>
                      <th className="text-center text-overline text-ink-quaternary px-5 py-3">Auto-Renew</th>
                      <th className="text-center text-overline text-ink-quaternary px-5 py-3">Status</th>
                      <th className="w-24 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-callout text-ink-quaternary">No contracts found</td></tr>
                    )}
                    {contracts.map((contract, i) => (
                      <motion.tr
                        key={contract.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-subhead font-semibold text-ink cursor-pointer hover:text-brand" onClick={() => setDetailView({ type: "contract", id: contract.id })}>
                            {contract.title}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden md:table-cell">{contract.supplierName}</td>
                        <td className="px-5 py-3.5 text-right text-subhead font-bold text-ink">{formatPrice(contract.value, selectedCurrency)}</td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden sm:table-cell">{contract.startDate}</td>
                        <td className="px-5 py-3.5 text-caption text-ink-secondary hidden sm:table-cell">{contract.endDate}</td>
                        <td className="px-5 py-3.5 text-center">
                          {contract.autoRenew ? (
                            <span className="text-[11px] text-success font-semibold">Yes</span>
                          ) : (
                            <span className="text-[11px] text-ink-quaternary font-semibold">No</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={statusBadgeVariant(contract.status)} size="sm">{contract.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setDetailView({ type: "contract", id: contract.id })} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors">
                              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <button onClick={() => deleteContract(contract.id)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ============================
            APPROVALS TAB
            ============================ */}
        {activeTab === "approvals" && (
          <motion.div key="approvals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Approval Workflow</h3>
                  <Badge variant="warning" size="sm">{pendingApprovals.length} pending</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                    <span className="text-caption text-ink-secondary font-semibold">Threshold: {formatPrice(APPROVAL_THRESHOLD, selectedCurrency)}</span>
                  </div>
                </div>
              </div>
              {pendingApprovals.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="h-16 w-16 rounded-[16px] bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-success" strokeWidth={1.5} />
                  </div>
                  <p className="text-subhead font-bold text-ink">All caught up</p>
                  <p className="text-caption text-ink-tertiary mt-1">No purchase orders pending approval</p>
                </div>
              ) : (
                <div className="divide-y divide-glass-border">
                  {pendingApprovals.map((approval, i) => (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
                      className="flex items-center gap-4 px-5 py-5 hover:bg-surface-secondary/40 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-[12px] bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-6 w-6 text-warning" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-subhead font-bold text-ink">{approval.supplierName}</p>
                          <Badge variant="warning" size="sm">Pending Review</Badge>
                        </div>
                        <p className="text-caption text-ink-tertiary">PO: {approval.poNumber} · Requested by {approval.requestedBy}</p>
                        <p className="text-caption text-ink-quaternary mt-0.5">{approval.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-headline font-bold text-ink">{formatPrice(approval.amount, selectedCurrency)}</p>
                        <p className="text-caption text-ink-quaternary mt-0.5">{approval.requestedAt}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button variant="primary" size="sm" onClick={() => approvePO(approval.poId)} icon={<Check className="h-4 w-4" />}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => rejectPO(approval.poId)} icon={<X className="h-4 w-4" />}>
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================
          MODALS
          ============================ */}

      {/* Supplier Modal */}
      <AnimatePresence>
        {supplierModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setSupplierModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
                  <button onClick={() => setSupplierModal(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Supplier Name</label>
                    <input required value={supplierForm.name} onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="e.g. Tanzania Minerals Ltd" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Category</label>
                      <select value={supplierForm.category} onChange={(e) => setSupplierForm((f) => ({ ...f, category: e.target.value as SupplierCategory }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30">
                        <option>Raw Materials</option>
                        <option>Electronics</option>
                        <option>Packaging</option>
                        <option>Logistics</option>
                        <option>Software</option>
                        <option>Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Location</label>
                      <input value={supplierForm.location} onChange={(e) => setSupplierForm((f) => ({ ...f, location: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="City, Country" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Contact Number</label>
                      <input value={supplierForm.contact} onChange={(e) => setSupplierForm((f) => ({ ...f, contact: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="+255 712 345 678" />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Email</label>
                      <input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="sales@company.co.tz" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setSupplierModal(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1">{editingSupplier ? "Update Supplier" : "Add Supplier"}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PO Modal */}
      <AnimatePresence>
        {poModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setPoModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">Create Purchase Order</h2>
                  <button onClick={() => setPoModal(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handlePoSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Supplier</label>
                    <select required value={poForm.supplierId} onChange={(e) => setPoForm((f) => ({ ...f, supplierId: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30">
                      <option value="">Select supplier...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Expected Delivery</label>
                    <input type="date" value={poForm.expectedDelivery} onChange={(e) => setPoForm((f) => ({ ...f, expectedDelivery: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-caption text-ink-secondary font-semibold">Items</label>
                      <button type="button" onClick={() => setPoForm((f) => ({ ...f, items: [...f.items, { name: "", quantity: "", unitPrice: "" }] }))} className="text-caption text-brand font-semibold hover:text-brand-dark transition-colors">
                        + Add Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {poForm.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-7 gap-2 items-end">
                          <div className="col-span-3">
                            <input required value={item.name} onChange={(e) => {
                              const newItems = [...poForm.items];
                              newItems[idx] = { ...newItems[idx], name: e.target.value };
                              setPoForm((f) => ({ ...f, items: newItems }));
                            }} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Item name" />
                          </div>
                          <div className="col-span-1">
                            <input required type="number" min="1" value={item.quantity} onChange={(e) => {
                              const newItems = [...poForm.items];
                              newItems[idx] = { ...newItems[idx], quantity: e.target.value };
                              setPoForm((f) => ({ ...f, items: newItems }));
                            }} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Qty" />
                          </div>
                          <div className="col-span-2">
                            <input required type="number" min="0" value={item.unitPrice} onChange={(e) => {
                              const newItems = [...poForm.items];
                              newItems[idx] = { ...newItems[idx], unitPrice: e.target.value };
                              setPoForm((f) => ({ ...f, items: newItems }));
                            }} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Unit price" />
                          </div>
                          <div className="col-span-1">
                            {poForm.items.length > 1 && (
                              <button type="button" onClick={() => {
                                const newItems = poForm.items.filter((_, i) => i !== idx);
                                setPoForm((f) => ({ ...f, items: newItems }));
                              }} className="h-10 w-10 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {poForm.items.length > 0 && (
                      <div className="mt-2 p-3 bg-surface-secondary/40 rounded-[10px] flex items-center justify-between">
                        <span className="text-caption text-ink-secondary font-semibold">Estimated Total</span>
                        <span className="text-subhead font-bold text-ink">
                          {formatPrice(
                            poForm.items.reduce((sum, item) => {
                              const qty = parseInt(item.quantity, 10) || 0;
                              const price = parseFloat(item.unitPrice) || 0;
                              return sum + qty * price;
                            }, 0),
                            selectedCurrency,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Notes</label>
                    <textarea value={poForm.notes} onChange={(e) => setPoForm((f) => ({ ...f, notes: e.target.value }))} className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" placeholder="Order notes (optional)" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setPoModal(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1">Create PO</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Modal */}
      <AnimatePresence>
        {quoteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setQuoteModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">Request Quotation</h2>
                  <button onClick={() => setQuoteModal(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Supplier</label>
                    <select required value={quoteForm.supplierId} onChange={(e) => setQuoteForm((f) => ({ ...f, supplierId: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30">
                      <option value="">Select supplier...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Description</label>
                    <textarea required value={quoteForm.description} onChange={(e) => setQuoteForm((f) => ({ ...f, description: e.target.value }))} className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" placeholder="Describe what you need quoted" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Estimated Budget ({selectedCurrency})</label>
                      <input type="number" min="0" value={quoteForm.requestedAmount} onChange={(e) => setQuoteForm((f) => ({ ...f, requestedAmount: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Valid Until</label>
                      <input type="date" value={quoteForm.validUntil} onChange={(e) => setQuoteForm((f) => ({ ...f, validUntil: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Notes</label>
                    <textarea value={quoteForm.notes} onChange={(e) => setQuoteForm((f) => ({ ...f, notes: e.target.value }))} className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" placeholder="Additional requirements" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setQuoteModal(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1">Send Request</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <AnimatePresence>
        {contractModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setContractModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">New Contract</h2>
                  <button onClick={() => setContractModal(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleContractSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Supplier</label>
                    <select required value={contractForm.supplierId} onChange={(e) => setContractForm((f) => ({ ...f, supplierId: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30">
                      <option value="">Select supplier...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Contract Title</label>
                    <input required value={contractForm.title} onChange={(e) => setContractForm((f) => ({ ...f, title: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="e.g. Annual Supply Agreement" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Contract Value ({selectedCurrency})</label>
                      <input type="number" min="0" required value={contractForm.value} onChange={(e) => setContractForm((f) => ({ ...f, value: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Auto-Renew</label>
                      <div className="flex items-center h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={contractForm.autoRenew} onChange={(e) => setContractForm((f) => ({ ...f, autoRenew: e.target.checked }))} className="h-4 w-4 rounded border-glass-border text-brand focus:ring-brand/30" />
                          <span className="text-caption text-ink">{contractForm.autoRenew ? "Enabled" : "Disabled"}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Start Date</label>
                      <input type="date" required value={contractForm.startDate} onChange={(e) => setContractForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">End Date</label>
                      <input type="date" required value={contractForm.endDate} onChange={(e) => setContractForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setContractModal(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1">Create Contract</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {renderDetailModal()}
      </AnimatePresence>
    </div>
  );
}
