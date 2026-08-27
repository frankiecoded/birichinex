import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot, Send, Plus, Search, X, Check, Clock, Trash2, Edit3,
  ChevronRight, Sparkles, Brain, Database, ToggleLeft, ToggleRight,
  Target, TrendingUp, DollarSign, Package, Users,
  ShoppingCart, BarChart3, Zap, Globe, AlertCircle, Settings, User,
  Key, ExternalLink, Shield, Activity,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import BNXIntelligenceBoard from "../components/BNXIntelligenceBoard";
import { useStore } from "../store/useStore";
import { chatWithAI, configureAI, isAPIConfigured, getAIConfig, checkServerAIMode } from "../../ai/src/api-client";
import { buildBusinessContext, getPreferredLanguage } from "../../ai/src/core";
import type { AIContext, UserData } from "../../ai/src/intent-engine";
import type { AIProvider } from "../../ai/src/api-client";

// ─── Types ────────────────────────────────────────────────────────────────

interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  suggestedFollowUps?: string[];
  confidence?: number;
}

interface AdvisorConversation {
  id: string;
  storeId?: string;
  title: string;
  messages: AdvisorMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Message Formatter ────────────────────────────────────────────────────

function formatMessage(content: string): string {
  let html = content;

  html = html.replace(/^## (.+)$/gm, '<h3 class="text-[15px] font-bold text-ink mb-2 mt-3">$1</h3>');
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-[13px] font-bold text-ink mb-1 mt-2">$1</h4>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-ink-secondary">$1</em>');
  html = html.replace(/^• (.+)$/gm, '<div class="flex gap-2 ml-1 mb-1"><span class="text-brand mt-0.5 shrink-0">•</span><span>$1</span></div>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-1 mb-1"><span class="text-brand font-semibold mt-0.5 shrink-0">$1.</span><span>$2</span></div>');
  html = html.replace(/^---$/gm, '<hr class="border-glass-border my-3" />');
  html = html.replace(/\n\n/g, '<div class="mb-2" />');
  html = html.replace(/\n/g, '<br />');

  return html;
}

// ─── Sidebar Conversation Item ────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  conv: AdvisorConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    if (editTitle.trim()) onRename(editTitle.trim());
    setEditing(false);
  };

  const msgCount = conv.messages.length;
  const lastMsg = conv.messages[conv.messages.length - 1];
  const preview = lastMsg ? lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? "..." : "") : "New conversation";
  const timeAgo = getTimeAgo(conv.updatedAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={`group relative px-3 py-2.5 rounded-[12px] cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-surface-secondary/80 border border-glass-border"
          : "hover:bg-surface-secondary/40 border border-transparent"
      }`}
      onClick={onSelect}
    >
      {editing ? (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={handleSave}
            className="flex-1 bg-surface-secondary/60 rounded-[8px] px-2 py-1 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand/30 border border-glass-border"
          />
          <button onClick={handleSave} className="p-1 hover:bg-surface-secondary rounded-[6px]">
            <Check className="h-3 w-3 text-success" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[13px] font-semibold text-ink truncate max-w-[160px]">{conv.title}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                className="p-1 hover:bg-surface-secondary rounded-[6px]"
              >
                <Edit3 className="h-3 w-3 text-ink-tertiary" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 hover:bg-error/10 rounded-[6px]"
              >
                <Trash2 className="h-3 w-3 text-error" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-ink-tertiary truncate">{preview}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="h-2.5 w-2.5 text-ink-quaternary" />
            <span className="text-[10px] text-ink-quaternary">{timeAgo}</span>
            <span className="text-[10px] text-ink-quaternary">· {msgCount} messages</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function getGreeting(businessName?: string, userName?: string): string {
  const name = userName && userName !== "User" && userName !== "Founder" ? userName.split(" ")[0] : null;

  // Personalize the opening with the live business pulse when available.
  let pulse = "";
  try {
    const c = buildBusinessContext();
    const top = c.next?.[0];
    const lang = getPreferredLanguage();
    if (lang === "sw") {
      pulse = "Nimepitia hesabu zako za leo. Niko tayari kufanya kazi — swali namba moja ni ipi?";
    } else if (lang === "fr") {
      pulse = "J'ai passé en revue les chiffres du moment. Si vous deviez avancer sur une seule chose aujourd'hui, ce serait quoi ?";
    } else if (top) {
      pulse = `I've been looking at the numbers — right now ${top.title.toLowerCase()} is what moves you most. Want me to walk us through it?`;
    } else if (c.health?.live !== undefined) {
      pulse = `I've been looking at the numbers — the business pulse reads ${c.health.live}/100 right now. Ask me anything, and I'll reason with your real data.`;
    } else {
      pulse = "Ask me anything about sourcing, pricing, finance, or growth — and I'll reason with your real data, not generic advice.";
    }
  } catch {
    pulse = "Ask me anything about sourcing, pricing, finance, or growth — and I'll reason with your real data, not generic advice.";
  }

  const base = businessName
    ? `Hello${name ? `, ${name}` : ""}. I'm Amani, your BirichiNex advisor — I've got ${businessName}'s profile, health scores, and action plan loaded.`
    : `Hello${name ? `, ${name}` : ""}. I'm Amani, your BirichiNex advisor.`;
  return `${base} ${pulse}`;
}

// ─── Suggested Prompts ────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { icon: ShoppingCart, label: "How do I source products?", color: "#007AFF" },
  { icon: Package, label: "Optimize my inventory", color: "#FF9500" },
  { icon: Sparkles, label: "Explain loyalty points", color: "#AF52DE" },
  { icon: DollarSign, label: "Financial advice", color: "#34C759" },
  { icon: Globe, label: "Dropshipping strategy", color: "#FF6482" },
  { icon: Target, label: "Market entry tips", color: "#5856D6" },
];

// ─── API Settings Modal ───────────────────────────────────────────────────

function APISettingsModal({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<AIProvider>(getAIConfig().provider);
  const [apiKey, setApiKey] = useState(getAIConfig().apiKey || "");
  const [model, setModel] = useState(getAIConfig().model || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    configureAI({
      provider,
      apiKey:
        provider === "local" || provider === "gemini" || provider === "ollama" ? undefined : apiKey,
      model:
        provider === "gemini" || provider === "ollama"
          ? undefined
          : provider === "openai"
            ? (model || "gpt-4o")
            : provider === "anthropic"
              ? (model || "claude-sonnet-4-20250514")
              : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-material rounded-[20px] border border-glass-border p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-ink">AI Configuration</h3>
              <p className="text-[11px] text-ink-tertiary">Connect to a live AI provider</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-secondary rounded-[10px]">
            <X className="h-4 w-4 text-ink-tertiary" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-ink-secondary block mb-1.5">Provider</label>
            <div className="flex flex-wrap gap-2">
              {(["ollama", "gemini", "openai", "anthropic", "local"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setModel(""); }}
                  className={`flex-1 min-w-[86px] h-10 rounded-[10px] text-[13px] font-medium border transition-all ${
                    provider === p
                      ? "bg-brand/10 border-brand/30 text-brand-dark"
                      : "bg-surface-secondary/60 border-glass-border text-ink-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {p === "ollama" ? "Ollama (VPS)" : p === "gemini" ? "Gemini (server)" : p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "Local"}
                </button>
              ))}
            </div>
          </div>

          {(provider === "gemini" || provider === "ollama") && (
            <div className="flex items-start gap-2 p-3 rounded-[10px] bg-[#30D158]/10 border border-[#30D158]/25">
              <Shield className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <p className="text-[11px] text-ink-tertiary leading-relaxed">
                Uses the server's <span className="font-mono text-ink-secondary">OLLAMA_ENABLED</span> (self-hosted
                Qwen3 on your VPS) or <span className="font-mono text-ink-secondary">GEMINI_API_KEY</span> with the
                full BirichiNex/Portmetals advisor brain — no key is stored or sent from your browser. This is the
                recommended option.
              </p>
            </div>
          )}

          {provider !== "local" && provider !== "gemini" && provider !== "ollama" && (
            <>
              <div>
                <label className="text-[12px] font-semibold text-ink-secondary block mb-1.5">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
                  className="w-full h-10 px-3 bg-surface-secondary/60 rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-1 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-secondary block mb-1.5">Model (optional)</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={provider === "openai" ? "gpt-4o" : "claude-sonnet-4-20250514"}
                  className="w-full h-10 px-3 bg-surface-secondary/60 rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-1 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-surface-secondary/40 border border-glass-border/50">
                <Shield className="h-4 w-4 text-ink-quaternary mt-0.5 shrink-0" />
                <p className="text-[11px] text-ink-tertiary leading-relaxed">
                  Your API key is stored locally in your browser and never sent to our servers. It's used directly to communicate with the AI provider.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="sm" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={saved ? "primary" : "primary"}
              size="sm"
              fullWidth
              onClick={handleSave}
              icon={saved ? <Check className="h-3.5 w-3.5" /> : undefined}
            >
              {saved ? "Saved!" : "Save Configuration"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

interface AIAdvisorPageProps {
  compact?: boolean;
}

export default function AIAdvisorPage({ compact = false }: AIAdvisorPageProps) {
  const {
    inventoryItems, dropshipOrders, transactions, contacts,
    loyalty, cart, currentTier, selectedCurrency, user, audit,
    aiConversations, createConversation, addMessage, deleteConversation,
  } = useStore();

  const [conversations, setConversations] = useState<AdvisorConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [dataToggle, setDataToggle] = useState(true);
  const [intelTab, setIntelTab] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAPISettings, setShowAPISettings] = useState(false);
  const [apiReady, setApiReady] = useState(isAPIConfigured());

  // Refresh connection status: Server AI liveness + browser providers.
  const refreshApiStatus = useCallback(() => {
    const cfg = getAIConfig();
    if (cfg.provider === "gemini" || cfg.provider === "ollama") {
      checkServerAIMode().then((m) => setApiReady(m.live));
    } else {
      setApiReady(isAPIConfigured());
    }
  }, []);

  useEffect(() => {
    refreshApiStatus();
  }, [refreshApiStatus]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? null,
    [conversations, activeConvId],
  );

  const messages = activeConv?.messages ?? [];

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [conversations, searchQuery]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages, loading]);

  // Hydrate advisor conversations from persistent memory (true continuity),
  // or seed the first conversation and persist it.
  useEffect(() => {
    const stored = [...aiConversations]
      .filter((c) => c.assistantType === "advisor" && c.messages.length > 0)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    if (stored.length > 0) {
      const hydrated: AdvisorConversation[] = stored.map((c) => ({
        id: c.id,
        storeId: c.id,
        title:
          c.messages.find((m) => m.role === "user")?.content.slice(0, 40) ||
          "New Conversation",
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
          timestamp: m.timestamp,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      setConversations(hydrated);
      setActiveConvId(hydrated[0].id);
      return;
    }

    const now = new Date().toISOString();
    const greetId = crypto.randomUUID();
    const storeId = createConversation("advisor");
    const conv: AdvisorConversation = {
      id: crypto.randomUUID(),
      storeId,
      title: "New Conversation",
      messages: [
        {
          id: greetId,
          role: "assistant",
          content: getGreeting(audit?.businessProfile.name, user?.name),
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    addMessage(storeId, {
      id: greetId,
      role: "assistant",
      content: conv.messages[0].content,
      timestamp: now,
      assistantType: "advisor",
    });
    setConversations([conv]);
    setActiveConvId(conv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check API status on mount
  useEffect(() => {
    setApiReady(isAPIConfigured());
  }, []);

  const userData: UserData | undefined = useMemo(
    () => dataToggle ? {
      userName: user?.name ?? "User",
      membershipTier: currentTier,
      loyaltyTier: loyalty.currentTier,
      loyaltyPoints: loyalty.points,
      inventoryCount: inventoryItems.length,
      transactionCount: transactions.length,
      contactCount: contacts.length,
      cartCount: cart.length,
      currency: selectedCurrency,
      businessName: audit?.businessProfile.name,
      industry: audit?.businessProfile.industry,
      growthStage: audit?.businessProfile.growthStage,
      businessHealth: audit?.scores.businessHealth,
      founderReadiness: audit?.scores.founderReadiness,
      businessMaturity: audit?.scores.businessMaturity,
      growthReadiness: audit?.scores.growthReadiness,
      digitalReadiness: audit?.scores.digitalReadiness,
      marketplaceReadiness: audit?.scores.marketplaceReadiness,
    } : undefined,
    [dataToggle, user, currentTier, loyalty, inventoryItems, transactions, contacts, cart, selectedCurrency, audit],
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || loading) return;

      setInput("");
      setLoading(true);
      setStreaming(true);

      let convId = activeConvId;
      let storeId: string | undefined;
      const now = new Date().toISOString();

      if (!convId) {
        const conv: AdvisorConversation = {
          id: crypto.randomUUID(),
          storeId: createConversation("advisor"),
          title: msg.slice(0, 40) + (msg.length > 40 ? "..." : ""),
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        storeId = conv.storeId;
        setConversations((prev) => [conv, ...prev]);
        setActiveConvId(conv.id);
        convId = conv.id;
      } else {
        storeId = conversations.find((c) => c.id === convId)?.storeId;
      }

      const userMsg: AdvisorMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: msg,
        timestamp: now,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const isFirstUserMsg = c.messages.filter((m) => m.role === "user").length === 0;
          return {
            ...c,
            title: isFirstUserMsg ? (msg.length > 40 ? msg.slice(0, 40) + "..." : msg) : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: now,
          };
        }),
      );

      if (storeId) {
        addMessage(storeId, { id: userMsg.id, role: "user", content: msg, timestamp: now, assistantType: "advisor" });
      }

      // Build conversation history for context
      const conv = conversations.find((c) => c.id === convId);
      const history = (conv?.messages ?? []).slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context: AIContext = {
        userData,
        conversationHistory: history,
        currentPage: "ai-advisor",
      };

      // Assistant shell that receives the streamed reply (feels like a person typing).
      const aiId = crypto.randomUUID();
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, { id: aiId, role: "assistant", content: "", timestamp: now }] }
            : c,
        ),
      );

      try {
        const response = await chatWithAI(msg, context, (delta) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === aiId ? { ...m, content: m.content + delta } : m,
                    ),
                  }
                : c,
            ),
          );
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiId
                      ? {
                          ...m,
                          content: response.content,
                          sources: response.sources,
                          suggestedFollowUps: response.suggestedFollowUps,
                          confidence: response.confidence,
                        }
                      : m,
                  ),
                  updatedAt: now,
                }
              : c,
          ),
        );
        if (storeId) {
          addMessage(storeId, {
            id: aiId,
            role: "assistant",
            content: response.content,
            timestamp: now,
            assistantType: "advisor",
          });
        }
      } catch {
        const errorText = "I hit a snag on that one — my connection to the live brain stumbled. Ask me again or try a slightly different phrasing.";
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiId ? { ...m, content: errorText } : m,
                  ),
                  updatedAt: now,
                }
              : c,
          ),
        );
        if (storeId) {
          addMessage(storeId, { id: aiId, role: "assistant", content: errorText, timestamp: now, assistantType: "advisor" });
        }
      }

      setLoading(false);
      setStreaming(false);
      inputRef.current?.focus();
    },
    [input, loading, activeConvId, dataToggle, userData, conversations, createConversation, addMessage],
  );

  const handleNewConversation = () => {
    const now = new Date().toISOString();
    const greetId = crypto.randomUUID();
    const storeId = createConversation("advisor");
    const conv: AdvisorConversation = {
      id: crypto.randomUUID(),
      storeId,
      title: "New Conversation",
      messages: [
        {
          id: greetId,
          role: "assistant",
          content: getGreeting(audit?.businessProfile.name, user?.name),
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    addMessage(storeId, {
      id: greetId,
      role: "assistant",
      content: conv.messages[0].content,
      timestamp: now,
      assistantType: "advisor",
    });
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
  };

  const handleDeleteConversation = (id: string) => {
    const storeId = conversations.find((c) => c.id === id)?.storeId;
    if (storeId) deleteConversation(storeId);
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeConvId === id) {
        setActiveConvId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const handleRenameConversation = (id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  };

  return (
    <div className={`flex ${compact ? "h-full" : "h-[calc(100dvh-3.5rem)]"} overflow-hidden`}>
      {/* Ambient orb */}
      <div className="fixed top-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none z-0" />

      {/* API Settings Modal */}
      <AnimatePresence>
        {showAPISettings && (
          <APISettingsModal onClose={() => { setShowAPISettings(false); refreshApiStatus(); }} />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 h-full border-r border-glass-border bg-surface/40 backdrop-blur-xl flex flex-col overflow-hidden relative z-10"
          >
            <div className="p-3 border-b border-glass-border">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={handleNewConversation}
              >
                New Chat
              </Button>
            </div>

            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-quaternary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full h-8 pl-8 pr-3 bg-surface-secondary/60 rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-1 focus:ring-brand/20 border border-glass-border"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3 w-3 text-ink-quaternary" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              <AnimatePresence>
                {filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConvId}
                    onSelect={() => setActiveConvId(conv.id)}
                    onDelete={() => handleDeleteConversation(conv.id)}
                    onRename={(t) => handleRenameConversation(conv.id, t)}
                  />
                ))}
              </AnimatePresence>
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[12px] text-ink-quaternary">No conversations found</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-glass-border">
              <button
                onClick={() => setShowAPISettings(true)}
                className="flex items-center gap-2 text-[11px] text-ink-tertiary hover:text-ink-secondary transition-colors w-full"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>BirichiNex AI v2.0</span>
                <span className={`ml-auto h-2 w-2 rounded-full ${apiReady ? "bg-success" : "bg-ink-quaternary"}`} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Main Chat Area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 px-6 py-4 border-b border-glass-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-surface-secondary/60 rounded-[10px] transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-4 w-4 text-ink-secondary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-ink-secondary" />
                )}
              </button>

              <div className="relative h-10 w-10 rounded-[14px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-lg shadow-[#FF6482]/20">
                <Brain className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>

              <div>
                <h1 className="text-[17px] font-bold text-ink tracking-tight flex items-center gap-2">
                  <span className="text-gradient-brand">BirichiNex AI Advisor</span>
                  <Badge variant="brand" size="sm">
                    <Sparkles className="h-2.5 w-2.5" />
                    {apiReady ? "Live" : "Local"}
                  </Badge>
                </h1>
                <p className="text-[12px] text-ink-tertiary">
                  {getAIConfig().provider === "gemini" || getAIConfig().provider === "ollama"
                    ? apiReady
                      ? "Server AI connected — live answers"
                      : "Server AI off — using local engine"
                    : apiReady
                      ? "Connected to live AI provider"
                      : "Pattern matching • Knowledge base"}{" "}
                  • 62 knowledge entries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Intelligence / Chat tabs */}
              <div className="flex items-center gap-1 p-1 rounded-[14px] border border-glass-border bg-surface-secondary/40">
                <button
                  onClick={() => setIntelTab(false)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[12px] font-semibold transition-all ${
                    !intelTab ? "bg-surface text-ink shadow-sm" : "text-ink-tertiary hover:text-ink-secondary"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" /> Chat
                </button>
                <button
                  onClick={() => setIntelTab(true)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[12px] font-semibold transition-all ${
                    intelTab ? "bg-surface text-ink shadow-sm" : "text-ink-tertiary hover:text-ink-secondary"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" /> Intel
                </button>
              </div>

              {/* API Config Button */}
              <CursorSpotlight className="rounded-[14px]" spotlightColor="rgba(212,175,55,0.04)">
                <button
                  onClick={() => setShowAPISettings(true)}
                  className={`flex items-center gap-2 h-10 px-3 rounded-[14px] border transition-all duration-300 ${
                    apiReady
                      ? "bg-success/10 border-success/30 text-success"
                      : "bg-surface-secondary/60 border-glass-border text-ink-secondary hover:bg-surface-secondary"
                  }`}
                >
                  <Key className="h-4 w-4" strokeWidth={2} />
                  <span className="text-[12px] font-semibold">{apiReady ? "Connected" : "Configure"}</span>
                </button>
              </CursorSpotlight>

              {/* Data Toggle */}
              <CursorSpotlight className="rounded-[14px]" spotlightColor="rgba(212,175,55,0.04)">
                <button
                  onClick={() => setDataToggle(!dataToggle)}
                  className={`flex items-center gap-2.5 h-10 px-4 rounded-[14px] border transition-all duration-300 ${
                    dataToggle
                      ? "bg-brand/10 border-brand/30 text-brand-dark"
                      : "bg-surface-secondary/60 border-glass-border text-ink-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {dataToggle ? (
                    <ToggleRight className="h-4.5 w-4.5" strokeWidth={2} />
                  ) : (
                    <ToggleLeft className="h-4.5 w-4.5" strokeWidth={2} />
                  )}
                  <div className="text-left">
                    <span className="text-[13px] font-semibold block leading-tight">Personal Data</span>
                    <span className="text-[10px] opacity-70 block leading-tight">
                      {dataToggle ? "Context ON" : "Context OFF"}
                    </span>
                  </div>
                  <Database className="h-3.5 w-3.5 opacity-50" />
                </button>
              </CursorSpotlight>
            </div>
          </div>
        </motion.div>

        {/* Capability Tags */}
        {!intelTab && (
        <div className="shrink-0 px-6 py-2.5 border-b border-glass-border/50 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { label: "Sourcing", icon: ShoppingCart, color: "#007AFF" },
            { label: "Pricing", icon: DollarSign, color: "#34C759" },
            { label: "Growth", icon: TrendingUp, color: "#FF9500" },
            { label: "Finance", icon: BarChart3, color: "#5856D6" },
            { label: "Operations", icon: Zap, color: "#FF6482" },
            { label: "Marketing", icon: Users, color: "#AF52DE" },
            { label: "Risk", icon: AlertCircle, color: "#FF375F" },
            { label: "Compliance", icon: Settings, color: "#8E8E93" },
          ].map((cap) => (
            <div
              key={cap.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-glass-border/50 bg-surface-secondary/30 hover:bg-surface-secondary/60 transition-colors cursor-default shrink-0"
            >
              <cap.icon className="h-3 w-3" style={{ color: cap.color }} strokeWidth={1.5} />
              <span className="text-[11px] font-medium text-ink-secondary whitespace-nowrap">{cap.label}</span>
            </div>
          ))}
        </div>
        )}

        {intelTab ? (
          <BNXIntelligenceBoard />
        ) : (
        <>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
            {messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-8"
              >
                <div className="relative h-16 w-16 rounded-[20px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#FF6482]/20">
                  <Brain className="h-8 w-8 text-white" strokeWidth={1.5} />
                  <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] animate-[glowPulse_3s_ease-in-out_infinite] blur-[12px] opacity-30" />
                </div>
                <h2 className="text-[20px] font-bold text-ink mb-2">How can I help you today?</h2>
                <p className="text-[13px] text-ink-tertiary max-w-md mx-auto mb-3">
                  I have comprehensive knowledge about BirichiNex's 19 capabilities, business strategy, finance, operations, and more.
                </p>
                {!apiReady && (
                  <button
                    onClick={() => setShowAPISettings(true)}
                    className="inline-flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-dark transition-colors mb-6"
                  >
                    <Key className="h-3 w-3" />
                    Connect Server AI or another provider for enhanced responses
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-lg mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={prompt.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => handleSend(prompt.label)}
                      className="glass-material rounded-[14px] p-3.5 text-left hover:scale-[1.02] transition-all duration-200 border border-glass-border/50 group"
                    >
                      <div
                        className="h-8 w-8 rounded-[10px] flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${prompt.color}15` }}
                      >
                        <prompt.icon className="h-4 w-4" style={{ color: prompt.color }} strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] font-medium text-ink leading-tight block">{prompt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i === messages.length - 1 ? 0.05 : 0, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 mr-3 mt-1">
                    <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-md shadow-[#FF6482]/15">
                      <Bot className="h-4 w-4 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                )}

                <div className="max-w-[80%]">
                  <div
                    className={`rounded-[18px] px-5 py-3.5 text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emphasis text-on-emphasis shadow-lg shadow-emphasis/10"
                        : "glass-material border border-glass-border text-ink"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        className="prose-sm text-[14px] leading-relaxed [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:text-ink [&_h3]:mb-2 [&_h3]:mt-1 [&_strong]:font-semibold [&_strong]:text-ink [&_em]:italic [&_em]:text-ink-secondary"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    <div
                      className={`text-[10px] mt-2 ${
                        msg.role === "user" ? "text-white/40 text-right" : "text-ink-quaternary"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Sources and Follow-ups for assistant messages */}
                  {msg.role === "assistant" && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((followUp, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleSend(followUp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/5 hover:bg-brand/10 border border-brand/15 text-[11px] text-brand-dark font-medium transition-colors"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          {followUp}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {msg.sources.slice(0, 3).map((source, si) => (
                        <span
                          key={si}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-secondary/60 text-[10px] text-ink-quaternary"
                        >
                          <Database className="h-2 w-2" />
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="shrink-0 ml-3 mt-1">
                    <div className="h-8 w-8 rounded-[10px] bg-surface-secondary/80 border border-glass-border flex items-center justify-center">
                      <User className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {loading && !streaming && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="shrink-0 mr-3 mt-1">
                    <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-md shadow-[#FF6482]/15">
                      <Bot className="h-4 w-4 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="glass-material rounded-[18px] px-5 py-4 border border-glass-border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#FF6482] animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-[#FF6482] animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-[#FF6482] animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-[11px] text-ink-tertiary ml-1">
                        {apiReady ? "AI thinking..." : "Searching knowledge base..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Input Area ─────────────────────────────────────── */}
        <div className="shrink-0 border-t border-glass-border bg-surface/30 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-6 py-4">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handleSend(prompt.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary/60 hover:bg-surface-secondary border border-glass-border/50 hover:border-glass-border transition-all duration-200 text-[12px] font-medium text-ink-secondary hover:text-ink"
                  >
                    <prompt.icon className="h-3 w-3" style={{ color: prompt.color }} strokeWidth={1.5} />
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about sourcing, pricing, finance, growth..."
                  className="w-full h-12 pl-4 pr-12 bg-surface-secondary/60 backdrop-blur-sm rounded-[14px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border transition-all duration-200"
                  disabled={loading}
                />
                {input && (
                  <button
                    onClick={() => setInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-secondary rounded-[6px] transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-ink-quaternary" />
                  </button>
                )}
              </div>

              <motion.button
                onClick={() => handleSend()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || loading}
                className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] text-white flex items-center justify-center disabled:opacity-40 transition-all duration-200 shadow-lg shadow-[#FF6482]/20 disabled:shadow-none shrink-0"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Send className="h-5 w-5" strokeWidth={1.5} />
                )}
              </motion.button>
            </div>

            <p className="text-[10px] text-ink-quaternary text-center mt-2.5">
              {getAIConfig().provider === "gemini" || getAIConfig().provider === "ollama"
                ? apiReady
                  ? "Connected to the server AI brain. Your keys stay on the server."
                  : "Server AI is off — set OLLAMA_ENABLED=true (VPS) or GEMINI_API_KEY in .env, or connect another provider in settings."
                : apiReady
                  ? "Connected to a live AI provider."
                  : "Using local knowledge base with 62 entries. Configure an AI provider for enhanced responses."}
            </p>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
