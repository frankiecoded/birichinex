import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Plus, Search, Filter, X, Check, Clock, Eye, Edit3,
  Trash2, Download, Upload, Pen, Stamp, Folder, Tag, AlertCircle,
  Shield, Award, Briefcase, Building2, Archive,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import type {
  AppDocument,
  DocumentTemplate,
  DocumentCategory,
  DocumentStatus,
} from "../store/useStore";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: DocumentCategory[] = ["Legal", "Financial", "HR", "Operations", "Compliance"];

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "brand"; icon: typeof Clock }
> = {
  draft: { label: "Draft", variant: "warning", icon: Edit3 },
  review: { label: "In Review", variant: "info", icon: Eye },
  signed: { label: "Signed", variant: "success", icon: Check },
  archived: { label: "Archived", variant: "default", icon: Archive },
};

const DOC_TYPE_CONFIG: Record<
  AppDocument["type"],
  { label: string; color: string; icon: typeof FileText }
> = {
  contract: { label: "Contract", color: "#5856D6", icon: FileText },
  invoice: { label: "Invoice", color: "#30D158", icon: FileText },
  proposal: { label: "Proposal", color: "#007AFF", icon: FileText },
  certificate: { label: "Certificate", color: "#FF9500", icon: Award },
  license: { label: "License", color: "#AF52DE", icon: Shield },
};

const CATEGORY_ICON: Record<DocumentCategory, typeof Briefcase> = {
  Legal: Shield,
  Financial: Building2,
  HR: Briefcase,
  Operations: Folder,
  Compliance: Award,
};

const TEMPLATES: DocumentTemplate[] = [
  {
    id: "tpl-invoice",
    name: "Invoice Template",
    type: "invoice",
    category: "Financial",
    description: "Standard invoice with line items, tax, and payment terms",
    content:
      "INVOICE\n\nInvoice Number: [INV-XXXX]\nDate: [Date]\nDue Date: [Due Date]\n\nBill To:\n[Client Name]\n[Client Address]\n\nLine Items:\n1. [Item Description] — [Qty] × [Unit Price] = [Total]\n\nSubtotal: [Subtotal]\nTax ([TaxRate]%): [Tax Amount]\nTotal Due: [Total]\n\nPayment Terms: Net 30 days\nBank: [Bank Name]\nAccount: [Account Number]",
    icon: "Invoice",
  },
  {
    id: "tpl-nda",
    name: "Non-Disclosure Agreement",
    type: "contract",
    category: "Legal",
    description: "Mutual NDA for protecting confidential business information",
    content:
      "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement ('Agreement') is entered into as of [Date] between:\n\nDisclosing Party: [Party A Name]\nReceiving Party: [Party B Name]\n\n1. CONFIDENTIAL INFORMATION\nAll non-public information disclosed by either party.\n\n2. OBLIGATIONS\nThe Receiving Party shall: (a) hold all Confidential Information in strict confidence; (b) not disclose to any third party without prior written consent; (c) use the information solely for the Purpose described herein.\n\n3. TERM\nThis Agreement shall remain in effect for [Term] years from the Effective Date.\n\n4. RETURN OF MATERIALS\nUpon termination, all Confidential Information shall be returned or destroyed.\n\n5. GOVERNING LAW\nThis Agreement shall be governed by the laws of [Jurisdiction].",
    icon: "NDA",
  },
  {
    id: "tpl-service-agreement",
    name: "Service Agreement",
    type: "contract",
    category: "Legal",
    description: "General service agreement for client engagements",
    content:
      "SERVICE AGREEMENT\n\nEffective Date: [Date]\n\nBetween:\nService Provider: [Provider Name]\nClient: [Client Name]\n\n1. SCOPE OF SERVICES\n[Detailed description of services]\n\n2. TERM\nThis Agreement shall commence on [Start Date] and continue until [End Date] unless terminated earlier.\n\n3. COMPENSATION\nClient shall pay Provider [Amount] per [period] for the services rendered.\n\n4. INDEPENDENT CONTRACTOR\nProvider is an independent contractor and not an employee of Client.\n\n5. CONFIDENTIALITY\nBoth parties agree to maintain confidentiality of proprietary information.\n\n6. TERMINATION\nEither party may terminate with [Notice] days written notice.\n\n7. GOVERNING LAW\nThis Agreement is governed by the laws of [Jurisdiction].",
    icon: "Service",
  },
  {
    id: "tpl-purchase-order",
    name: "Purchase Order",
    type: "invoice",
    category: "Financial",
    description: "Standard purchase order for procurement",
    content:
      "PURCHASE ORDER\n\nPO Number: [PO-XXXX]\nDate: [Date]\nDelivery Date: [Delivery Date]\n\nVendor:\n[Vendor Name]\n[Vendor Address]\n\nShip To:\n[Delivery Address]\n\nItems:\n1. [Item Description] — [SKU]\n   Quantity: [Qty] | Unit Price: [Price] | Total: [Total]\n\n2. [Item Description] — [SKU]\n   Quantity: [Qty] | Unit Price: [Price] | Total: [Total]\n\nSubtotal: [Subtotal]\nShipping: [Shipping]\nTax: [Tax]\nGrand Total: [Grand Total]\n\nPayment Terms: [Terms]\nDelivery Instructions: [Instructions]",
    icon: "PO",
  },
  {
    id: "tpl-employment",
    name: "Employment Contract",
    type: "contract",
    category: "HR",
    description: "Full employment contract with standard terms",
    content:
      "EMPLOYMENT CONTRACT\n\nThis Employment Contract is entered into on [Date] between:\n\nEmployer: [Company Name]\nEmployee: [Employee Name]\n\n1. POSITION\nEmployee is hired as [Job Title] in the [Department] department.\n\n2. START DATE\nEmployment commences on [Start Date].\n\n3. COMPENSATION\nBase salary: [Amount] per [month/year], payable on [payment schedule].\n\n4. WORKING HOURS\nStandard working hours: [Hours] per week, [Schedule].\n\n5. BENEFITS\n[Benefits package details]\n\n6. LEAVE ENTITLEMENT\nAnnual leave: [Days] days per year.\nSick leave: [Days] days per year.\n\n7. CONFIDENTIALITY\nEmployee agrees to maintain confidentiality of all proprietary information.\n\n8. TERMINATION\nEither party may terminate with [Notice] days written notice.\n\n9. GOVERNING LAW\nThis Agreement is governed by the laws of [Jurisdiction].",
    icon: "Employment",
  },
];

// ── Signature Canvas Component ───────────────────────────────────────────────

interface SignatureCanvasProps {
  onSign: (method: "draw" | "type", name: string) => void;
  onCancel: () => void;
}

function SignatureCanvas({ onSign, onCancel }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [inputMethod, setInputMethod] = useState<"draw" | "type">("draw");
  const lastPos = useRef({ x: 0, y: 0 });

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => setIsDrawing(false);

  const handleSign = () => {
    if (!signerName.trim()) return;
    onSign(inputMethod, signerName.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["draw", "type"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setInputMethod(m)}
            className={`flex-1 h-9 rounded-[10px] text-caption font-semibold capitalize border transition-colors ${
              inputMethod === m
                ? "bg-brand/10 border-brand/30 text-brand"
                : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
            }`}
          >
            {m === "draw" ? "Draw Signature" : "Type Name"}
          </button>
        ))}
      </div>

      {inputMethod === "draw" ? (
        <div className="relative">
          <div className="border border-glass-border rounded-[12px] bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={120}
              className="w-full h-[120px] cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute top-2 right-2 h-7 px-2 rounded-[8px] bg-surface-secondary/80 backdrop-blur-sm text-[10px] font-semibold text-ink-tertiary hover:text-ink transition-colors"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="border border-glass-border rounded-[12px] bg-white p-4">
          <p className="text-center font-['Brush_Script_MT',cursive] text-2xl text-ink min-h-[48px] flex items-center justify-center">
            {signerName || <span className="text-ink-quaternary font-sans text-caption">Type your name above</span>}
          </p>
        </div>
      )}

      <div>
        <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Signer Name</label>
        <input
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="Enter full legal name"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          icon={<Pen className="h-3.5 w-3.5" />}
          onClick={handleSign}
          disabled={!signerName.trim()}
        >
          Sign Document
        </Button>
      </div>
    </div>
  );
}

// ── Create Document Form ─────────────────────────────────────────────────────

interface CreateDocForm {
  title: string;
  type: AppDocument["type"];
  category: DocumentCategory;
  content: string;
  attachments: string[];
}

const EMPTY_FORM: CreateDocForm = {
  title: "",
  type: "contract",
  category: "Legal",
  content: "",
  attachments: [],
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const signDocument = useStore((s) => s.signDocument);
  const searchQuery = useStore((s) => s.documentSearchQuery);
  const setSearchQuery = useStore((s) => s.setDocumentSearchQuery);
  const categoryFilter = useStore((s) => s.documentCategoryFilter);
  const setCategoryFilter = useStore((s) => s.setDocumentCategoryFilter);
  const statusFilter = useStore((s) => s.documentStatusFilter);
  const setStatusFilter = useStore((s) => s.setDocumentStatusFilter);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateDocForm>(EMPTY_FORM);
  const [viewDoc, setViewDoc] = useState<AppDocument | null>(null);
  const [editDoc, setEditDoc] = useState<AppDocument | null>(null);
  const [editForm, setEditForm] = useState<CreateDocForm>(EMPTY_FORM);
  const [signDoc, setSignDoc] = useState<AppDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "templates">("library");

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = documents.length;
    const pendingSignatures = documents.filter(
      (d) => d.status === "draft" || d.status === "review"
    ).length;
    const drafts = documents.filter((d) => d.status === "draft").length;
    const archived = documents.filter((d) => d.status === "archived").length;
    return { total, pendingSignatures, drafts, archived };
  }, [documents]);

  // ── Filtered Documents ───────────────────────────────────────────────────

  const filteredDocuments = useMemo(() => {
    let list = [...documents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((d) => d.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((d) => d.status === statusFilter);
    }
    list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return list;
  }, [documents, searchQuery, categoryFilter, statusFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addDocument({
      title: form.title.trim(),
      type: form.type,
      category: form.category,
      content: form.content.trim(),
      status: "draft",
      size: `${Math.floor(Math.random() * 300 + 50)} KB`,
      attachments: form.attachments,
    });
    setForm(EMPTY_FORM);
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc || !editForm.title.trim()) return;
    updateDocument(editDoc.id, {
      title: editForm.title.trim(),
      type: editForm.type,
      category: editForm.category,
      content: editForm.content.trim(),
    });
    setEditDoc(null);
    setEditForm(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDeleteConfirm(null);
    if (viewDoc?.id === id) setViewDoc(null);
  };

  const handleSign = (docId: string, method: "draw" | "type", name: string) => {
    signDocument(docId, name, method);
    setSignDoc(null);
  };

  const openEditModal = (doc: AppDocument) => {
    setEditForm({
      title: doc.title,
      type: doc.type,
      category: doc.category,
      content: doc.content,
      attachments: doc.attachments,
    });
    setEditDoc(doc);
    setViewDoc(null);
  };

  const applyTemplate = (template: DocumentTemplate) => {
    setForm({
      title: "",
      type: template.type,
      category: template.category,
      content: template.content,
      attachments: [],
    });
    setActiveTab("library");
    setCreateOpen(true);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────

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
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-headline text-gradient-brand tracking-tight">Documents</h1>
            <p className="text-callout text-ink-tertiary mt-1">
              Manage contracts, invoices, proposals, and business documents.
            </p>
          </div>
          <MagneticButton>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateOpen(true)}
            >
              New Document
            </Button>
          </MagneticButton>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.total.toString(), icon: FileText, color: "#007AFF" },
          { label: "Pending Signatures", value: stats.pendingSignatures.toString(), icon: Pen, color: "#FF9500" },
          { label: "Draft Documents", value: stats.drafts.toString(), icon: Edit3, color: "#5856D6" },
          { label: "Archived", value: stats.archived.toString(), icon: Archive, color: "#8E8E93" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="md" hover>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className="text-[22px] font-bold text-ink tracking-tight">{stat.value}</p>
                  </div>
                  <div
                    className="h-9 w-9 rounded-[12px] flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}12` }}
                  >
                    <stat.icon className="h-4 w-4" style={{ color: stat.color }} strokeWidth={2} />
                  </div>
                </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-1 bg-surface-secondary/60 rounded-[14px] p-1 w-fit">
          {([
            { id: "library" as const, label: "Document Library", icon: Folder },
            { id: "templates" as const, label: "Templates", icon: FileText },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-9 px-4 rounded-[12px] text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-quaternary hover:text-ink-secondary"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Document Library Tab */}
      {activeTab === "library" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Search & Filters */}
          <GlassCard padding="none">
            <div className="p-4 border-b border-glass-border">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                    placeholder="Search documents by name, type, or content..."
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-quaternary hover:text-ink transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5 text-ink-quaternary mr-1" strokeWidth={1.5} />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="signed">Signed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] text-ink-quaternary">Active filters:</span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-1 h-6 px-2 rounded-full bg-brand/10 text-brand text-[10px] font-semibold hover:bg-brand/20 transition-colors"
                    >
                      Search: "{searchQuery}" <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                  {categoryFilter !== "all" && (
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="flex items-center gap-1 h-6 px-2 rounded-full bg-brand/10 text-brand text-[10px] font-semibold hover:bg-brand/20 transition-colors"
                    >
                      {categoryFilter} <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                  {statusFilter !== "all" && (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="flex items-center gap-1 h-6 px-2 rounded-full bg-brand/10 text-brand text-[10px] font-semibold hover:bg-brand/20 transition-colors"
                    >
                      {STATUS_CONFIG[statusFilter as DocumentStatus]?.label} <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="text-[10px] text-ink-quaternary hover:text-ink-secondary transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Document List */}
            <div className="divide-y divide-glass-border">
              {filteredDocuments.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="h-14 w-14 rounded-[16px] bg-surface-secondary/60 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-ink-quaternary" strokeWidth={1.5} />
                  </div>
                  <p className="text-[15px] text-ink-secondary font-semibold">No documents found</p>
                  <p className="text-[13px] text-ink-quaternary mt-1">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first document to get started"}
                  </p>
                </div>
              )}
              {filteredDocuments.map((doc, i) => {
                const typeCfg = DOC_TYPE_CONFIG[doc.type];
                const statusCfg = STATUS_CONFIG[doc.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors group"
                  >
                    <div
                      className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${typeCfg.color}12` }}
                    >
                      <typeCfg.icon className="h-5 w-5" style={{ color: typeCfg.color }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-ink font-semibold truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[13px] text-ink-quaternary">{typeCfg.label}</span>
                        <span className="text-ink-quaternary text-[10px]">·</span>
                        <span className="text-[13px] text-ink-quaternary">{doc.category}</span>
                        <span className="text-ink-quaternary text-[10px]">·</span>
                        <span className="text-[13px] text-ink-quaternary">{doc.size}</span>
                        <span className="text-ink-quaternary text-[10px]">·</span>
                        <span className="text-[13px] text-ink-quaternary">{formatDate(doc.updatedAt)}</span>
                        {doc.signatures.length > 0 && (
                          <>
                            <span className="text-ink-quaternary text-[10px]">·</span>
                            <span className="flex items-center gap-1 text-[12px] text-success font-medium">
                              <Stamp className="h-3 w-3" strokeWidth={1.5} />
                              {doc.signatures.length} signature{doc.signatures.length > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusCfg.variant} size="sm" dot>
                      {statusCfg.label}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewDoc(doc)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => openEditModal(doc)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      {doc.status !== "signed" && doc.status !== "archived" && (
                        <button
                          onClick={() => setSignDoc(doc)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-success hover:bg-success/10 transition-colors"
                          title="Sign"
                        >
                          <Pen className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(doc.id)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {TEMPLATES.map((template, i) => {
            const typeCfg = DOC_TYPE_CONFIG[template.type];
            const CatIcon = CATEGORY_ICON[template.category];
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard>
                  <GlassCard padding="lg" hover className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="h-12 w-12 rounded-[14px] flex items-center justify-center"
                        style={{ backgroundColor: `${typeCfg.color}12` }}
                      >
                        <typeCfg.icon className="h-6 w-6" style={{ color: typeCfg.color }} strokeWidth={1.5} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CatIcon className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                        <span className="text-[11px] text-ink-quaternary font-medium">{template.category}</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-bold text-ink mb-1">{template.name}</h3>
                    <p className="text-[13px] text-ink-tertiary leading-relaxed flex-1 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">
                        {typeCfg.label}
                      </Badge>
                      <MagneticButton className="ml-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Plus className="h-3 w-3" />}
                          onClick={() => applyTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </MagneticButton>
                    </div>
                  </GlassCard>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Create Document Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg glass-material-lg specular-sheen rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-bold text-ink">Create New Document</h2>
                  <button
                    onClick={() => setCreateOpen(false)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Title</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="e.g. Service Agreement — Client Co."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(DOC_TYPE_CONFIG) as AppDocument["type"][]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, type: t }))}
                            className={`h-8 px-2.5 rounded-[8px] text-[11px] font-semibold capitalize border transition-colors ${
                              form.type === t
                                ? "bg-brand/10 border-brand/30 text-brand"
                                : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                            }`}
                          >
                            {DOC_TYPE_CONFIG[t].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, category: c }))}
                            className={`h-8 px-2.5 rounded-[8px] text-[11px] font-semibold border transition-colors ${
                              form.category === c
                                ? "bg-brand/10 border-brand/30 text-brand"
                                : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Content / Description</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      placeholder="Enter document content or description..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" icon={<Plus className="h-3.5 w-3.5" />}>
                      Create Document
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Document Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setViewDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl glass-material-lg specular-sheen rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-[14px] flex items-center justify-center"
                      style={{ backgroundColor: `${DOC_TYPE_CONFIG[viewDoc.type].color}12` }}
                    >
                      {(() => {
                        const Icon = DOC_TYPE_CONFIG[viewDoc.type].icon;
                        return <Icon className="h-5 w-5" style={{ color: DOC_TYPE_CONFIG[viewDoc.type].color }} strokeWidth={1.5} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-ink">{viewDoc.title}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={STATUS_CONFIG[viewDoc.status].variant} size="sm" dot>
                          {STATUS_CONFIG[viewDoc.status].label}
                        </Badge>
                        <span className="text-[12px] text-ink-quaternary">{DOC_TYPE_CONFIG[viewDoc.type].label}</span>
                        <span className="text-ink-quaternary text-[10px]">·</span>
                        <span className="text-[12px] text-ink-quaternary">{viewDoc.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDoc(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="glass-divider mb-5" />

                {/* Document Content */}
                <div className="mb-5">
                  <h3 className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold mb-2">Content</h3>
                  <div className="bg-surface-secondary/40 rounded-[12px] p-4 max-h-48 overflow-y-auto">
                    <pre className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap font-sans">
                      {viewDoc.content}
                    </pre>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-surface-secondary/40 rounded-[10px] p-3">
                    <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Created</p>
                    <p className="text-[13px] text-ink font-medium mt-0.5">{formatDateTime(viewDoc.createdAt)}</p>
                  </div>
                  <div className="bg-surface-secondary/40 rounded-[10px] p-3">
                    <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Last Updated</p>
                    <p className="text-[13px] text-ink font-medium mt-0.5">{formatDateTime(viewDoc.updatedAt)}</p>
                  </div>
                  <div className="bg-surface-secondary/40 rounded-[10px] p-3">
                    <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Size</p>
                    <p className="text-[13px] text-ink font-medium mt-0.5">{viewDoc.size}</p>
                  </div>
                  <div className="bg-surface-secondary/40 rounded-[10px] p-3">
                    <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Attachments</p>
                    <p className="text-[13px] text-ink font-medium mt-0.5">
                      {viewDoc.attachments.length > 0
                        ? `${viewDoc.attachments.length} file${viewDoc.attachments.length > 1 ? "s" : ""}`
                        : "None"}
                    </p>
                  </div>
                </div>

                {/* Attachments List */}
                {viewDoc.attachments.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold mb-2">Attachments</h3>
                    <div className="space-y-1.5">
                      {viewDoc.attachments.map((att) => (
                        <div
                          key={att}
                          className="flex items-center gap-2.5 px-3 py-2 bg-surface-secondary/40 rounded-[10px]"
                        >
                          <Download className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                          <span className="text-[13px] text-ink flex-1">{att}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold">
                      Digital Signatures ({viewDoc.signatures.length})
                    </h3>
                    {viewDoc.status !== "signed" && viewDoc.status !== "archived" && (
                      <button
                        onClick={() => {
                          setSignDoc(viewDoc);
                          setViewDoc(null);
                        }}
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-success/10 text-success text-[11px] font-semibold hover:bg-success/20 transition-colors"
                      >
                        <Pen className="h-3 w-3" strokeWidth={1.5} />
                        Add Signature
                      </button>
                    )}
                  </div>
                  {viewDoc.signatures.length === 0 ? (
                    <div className="text-center py-6 bg-surface-secondary/30 rounded-[12px]">
                      <Stamp className="h-8 w-8 text-ink-quaternary mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-[13px] text-ink-quaternary">No signatures yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {viewDoc.signatures.map((sig) => (
                        <div
                          key={sig.id}
                          className="flex items-center gap-3 px-3 py-2.5 bg-surface-secondary/40 rounded-[10px]"
                        >
                          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                            <Check className="h-4 w-4 text-success" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-ink font-semibold">{sig.signerName}</p>
                            <p className="text-[11px] text-ink-quaternary">
                              Signed {formatDateTime(sig.signedAt)} · {sig.method === "draw" ? "Drawn" : "Typed"}
                            </p>
                          </div>
                          <Badge variant="success" size="sm">Verified</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <MagneticButton className="flex-1">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      icon={<Edit3 className="h-3.5 w-3.5" />}
                      onClick={() => openEditModal(viewDoc)}
                    >
                      Edit
                    </Button>
                  </MagneticButton>
                  {viewDoc.status !== "signed" && viewDoc.status !== "archived" && (
                    <MagneticButton className="flex-1">
                      <Button
                        variant="brand"
                        size="md"
                        fullWidth
                        icon={<Pen className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setSignDoc(viewDoc);
                          setViewDoc(null);
                        }}
                      >
                        Sign
                      </Button>
                    </MagneticButton>
                  )}
                  <MagneticButton className="flex-1">
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setDeleteConfirm(viewDoc.id);
                        setViewDoc(null);
                      }}
                    >
                      Delete
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Document Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setEditDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg glass-material-lg specular-sheen rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-bold text-ink">Edit Document</h2>
                  <button
                    onClick={() => setEditDoc(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Title</label>
                    <input
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(DOC_TYPE_CONFIG) as AppDocument["type"][]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditForm((f) => ({ ...f, type: t }))}
                            className={`h-8 px-2.5 rounded-[8px] text-[11px] font-semibold capitalize border transition-colors ${
                              editForm.type === t
                                ? "bg-brand/10 border-brand/30 text-brand"
                                : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                            }`}
                          >
                            {DOC_TYPE_CONFIG[t].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditForm((f) => ({ ...f, category: c }))}
                            className={`h-8 px-2.5 rounded-[8px] text-[11px] font-semibold border transition-colors ${
                              editForm.category === c
                                ? "bg-brand/10 border-brand/30 text-brand"
                                : "bg-surface-secondary/60 border-glass-border text-ink-quaternary hover:text-ink-secondary"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Content</label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditDoc(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" icon={<Check className="h-3.5 w-3.5" />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sign Document Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {signDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setSignDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md glass-material-lg specular-sheen rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-ink">Sign Document</h2>
                    <p className="text-[13px] text-ink-tertiary mt-0.5 truncate max-w-[280px]">{signDoc.title}</p>
                  </div>
                  <button
                    onClick={() => setSignDoc(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="glass-divider mb-5" />
                <SignatureCanvas
                  onSign={(method, name) => handleSign(signDoc.id, method, name)}
                  onCancel={() => setSignDoc(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm glass-material-lg specular-sheen rounded-[20px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="h-14 w-14 rounded-[16px] bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-7 w-7 text-error" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-bold text-ink mb-1">Delete Document?</h2>
                <p className="text-[13px] text-ink-tertiary mb-6">
                  This action cannot be undone. The document and all signatures will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => handleDelete(deleteConfirm)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CursorSpotlight>
  );
}
