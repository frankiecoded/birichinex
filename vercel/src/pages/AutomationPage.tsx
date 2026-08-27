import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap, Plus, Search, X, Check, Clock, Eye, Edit3, Trash2,
  Bell, Mail, MessageSquare, Play, Pause, RotateCcw,
  ToggleLeft, ToggleRight, AlertCircle, Settings, Send,
  Workflow, Target, Filter,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";

// ── Types ──────────────────────────────────────────────────────────────────

type TriggerType = "on-order" | "inventory-low" | "schedule" | "manual";
type ActionType = "send-email" | "update-status" | "create-task" | "notify";
type NotificationChannel = "email" | "push" | "sms";
type TaskStatus = "pending" | "running" | "completed" | "failed";

interface Workflow {
  id: string;
  name: string;
  trigger: TriggerType;
  actions: ActionType[];
  conditions: string;
  enabled: boolean;
  createdAt: string;
  lastRun: string | null;
  runCount: number;
}

interface Trigger {
  id: string;
  name: string;
  description: string;
  category: "event" | "time" | "condition";
  usageCount: number;
}

interface NotificationRule {
  id: string;
  name: string;
  event: string;
  channels: { email: boolean; push: boolean; sms: boolean };
  enabled: boolean;
}

interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  createdAt: string;
}

interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  lastRun: string | null;
  nextScheduled: string | null;
  workflowId: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1", name: "Order Confirmation", trigger: "on-order",
    actions: ["send-email", "update-status", "create-task"],
    conditions: "Order total > 0", enabled: true,
    createdAt: "2026-06-15T10:00:00Z", lastRun: "2026-07-21T08:30:00Z", runCount: 342,
  },
  {
    id: "wf-2", name: "Low Stock Alert", trigger: "inventory-low",
    actions: ["notify", "send-email"],
    conditions: "Stock < Minimum Stock Level", enabled: true,
    createdAt: "2026-06-20T14:00:00Z", lastRun: "2026-07-20T16:45:00Z", runCount: 89,
  },
  {
    id: "wf-3", name: "Weekly Report", trigger: "schedule",
    actions: ["send-email"],
    conditions: "Every Monday at 08:00", enabled: true,
    createdAt: "2026-05-10T09:00:00Z", lastRun: "2026-07-14T08:00:00Z", runCount: 11,
  },
  {
    id: "wf-4", name: "Payment Reminder", trigger: "manual",
    actions: ["send-email", "notify"],
    conditions: "Invoice overdue > 7 days", enabled: false,
    createdAt: "2026-07-01T11:00:00Z", lastRun: null, runCount: 0,
  },
  {
    id: "wf-5", name: "Supplier Restock", trigger: "inventory-low",
    actions: ["send-email", "create-task"],
    conditions: "Stock < 5 AND supplier = approved", enabled: true,
    createdAt: "2026-06-25T15:00:00Z", lastRun: "2026-07-19T12:00:00Z", runCount: 24,
  },
];

const SEED_TRIGGERS: Trigger[] = [
  { id: "tr-1", name: "New Order Placed", description: "Fires when a customer completes checkout", category: "event", usageCount: 3 },
  { id: "tr-2", name: "Inventory Below Minimum", description: "Fires when any item drops below minimum stock", category: "condition", usageCount: 2 },
  { id: "tr-3", name: "Daily Schedule", description: "Runs every day at a configured time", category: "time", usageCount: 1 },
  { id: "tr-4", name: "Payment Received", description: "Fires when payment is confirmed", category: "event", usageCount: 0 },
  { id: "tr-5", name: "Order Overdue", description: "Fires when an order passes its delivery date", category: "condition", usageCount: 1 },
  { id: "tr-6", name: "Weekly Digest", description: "Runs every Monday morning", category: "time", usageCount: 1 },
  { id: "tr-7", name: "Customer Created", description: "Fires when a new CRM contact is added", category: "event", usageCount: 0 },
  { id: "tr-8", name: "Stock Depleted", description: "Fires when stock hits zero", category: "condition", usageCount: 0 },
];

const SEED_NOTIFICATIONS: NotificationRule[] = [
  { id: "nt-1", name: "New Order Alerts", event: "Order placed", channels: { email: true, push: true, sms: false }, enabled: true },
  { id: "nt-2", name: "Stock Warnings", event: "Inventory low", channels: { email: true, push: true, sms: true }, enabled: true },
  { id: "nt-3", name: "Payment Confirmation", event: "Payment received", channels: { email: true, push: false, sms: false }, enabled: true },
  { id: "nt-4", name: "Delivery Updates", event: "Shipment status change", channels: { email: false, push: true, sms: false }, enabled: false },
  { id: "nt-5", name: "System Errors", event: "Workflow failed", channels: { email: true, push: true, sms: true }, enabled: true },
];

const SEED_BUSINESS_RULES: BusinessRule[] = [
  { id: "br-1", name: "Auto-approve small orders", condition: "Order total < 500,000 TZS", action: "Auto-approve and send confirmation", enabled: true, createdAt: "2026-06-10T10:00:00Z" },
  { id: "br-2", name: "Low stock reorder", condition: "Stock < minimum threshold", action: "Send reorder request to supplier", enabled: true, createdAt: "2026-06-12T11:00:00Z" },
  { id: "br-3", name: "VIP customer priority", condition: "Customer tier = Platinum", action: "Priority processing and free shipping", enabled: true, createdAt: "2026-06-15T14:00:00Z" },
  { id: "br-4", name: "Flag large expenses", condition: "Expense > 2,000,000 TZS", action: "Require manager approval", enabled: true, createdAt: "2026-07-01T09:00:00Z" },
  { id: "br-5", name: "Auto-archive stale contacts", condition: "Last contact > 180 days", action: "Move to inactive list", enabled: false, createdAt: "2026-07-05T10:00:00Z" },
];

const SEED_TASKS: Task[] = [
  { id: "tk-1", name: "Send order confirmation emails", status: "completed", lastRun: "2026-07-21T08:30:00Z", nextScheduled: "2026-07-22T08:30:00Z", workflowId: "wf-1" },
  { id: "tk-2", name: "Check inventory levels", status: "running", lastRun: "2026-07-21T10:00:00Z", nextScheduled: "2026-07-21T22:00:00Z", workflowId: "wf-2" },
  { id: "tk-3", name: "Generate weekly report", status: "pending", lastRun: "2026-07-14T08:00:00Z", nextScheduled: "2026-07-21T08:00:00Z", workflowId: "wf-3" },
  { id: "tk-4", name: "Supplier restock notifications", status: "completed", lastRun: "2026-07-19T12:00:00Z", nextScheduled: "2026-07-22T12:00:00Z", workflowId: "wf-5" },
  { id: "tk-5", name: "Reorder at threshold", status: "failed", lastRun: "2026-07-20T09:15:00Z", nextScheduled: "2026-07-21T09:15:00Z", workflowId: "wf-5" },
  { id: "tk-6", name: "Sync marketplace prices", status: "completed", lastRun: "2026-07-21T06:00:00Z", nextScheduled: "2026-07-22T06:00:00Z", workflowId: "wf-1" },
];

// ── Constants ──────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, string> = {
  "on-order": "On Order",
  "inventory-low": "Inventory Low",
  schedule: "Scheduled",
  manual: "Manual",
};

const ACTION_LABELS: Record<ActionType, string> = {
  "send-email": "Send Email",
  "update-status": "Update Status",
  "create-task": "Create Task",
  notify: "Notify Team",
};

const TASK_STATUS_STYLES: Record<TaskStatus, { variant: "success" | "warning" | "error" | "info" | "default"; label: string }> = {
  completed: { variant: "success", label: "Completed" },
  running: { variant: "info", label: "Running" },
  pending: { variant: "warning", label: "Pending" },
  failed: { variant: "error", label: "Failed" },
};

const TRIGGER_CATEGORY_STYLES: Record<string, { variant: "info" | "warning" | "success"; label: string }> = {
  event: { variant: "info", label: "Event-based" },
  time: { variant: "warning", label: "Time-based" },
  condition: { variant: "success", label: "Condition-based" },
};

type Tab = "workflows" | "triggers" | "notifications" | "rules" | "tasks";

const TABS: { key: Tab; label: string; icon: typeof Zap }[] = [
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "triggers", label: "Triggers", icon: Target },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "rules", label: "Business Rules", icon: Settings },
  { key: "tasks", label: "Task Queue", icon: Clock },
];

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "on-order", label: "On Order" },
  { value: "inventory-low", label: "Inventory Low" },
  { value: "schedule", label: "Scheduled" },
  { value: "manual", label: "Manual" },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "send-email", label: "Send Email" },
  { value: "update-status", label: "Update Status" },
  { value: "create-task", label: "Create Task" },
  { value: "notify", label: "Notify Team" },
];

// ── Utility ────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Components ─────────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        background: enabled
          ? "linear-gradient(135deg, #34D399, #10B981)"
          : "rgba(0,0,0,0.15)",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function SectionHeader({
  title,
  count,
  onAdd,
  searchQuery,
  onSearch,
  searchPlaceholder,
}: {
  title: string;
  count: number;
  onAdd?: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  searchPlaceholder?: string;
}) {
  return (
    <div className="p-5 border-b border-glass-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        <Badge variant="default" size="sm">{count}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
          <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
          <input
            placeholder={searchPlaceholder || "Search..."}
            className="bg-transparent text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[160px]"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {onAdd && (
          <MagneticButton strength={0.2}>
            <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={onAdd}>
              Add
            </Button>
          </MagneticButton>
        )}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">{label}</label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
        placeholder={placeholder}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <Zap className="h-8 w-8 text-ink-quaternary mx-auto mb-2" strokeWidth={1.5} />
      <p className="text-[13px] text-ink-quaternary">{message}</p>
    </div>
  );
}

function FormCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 text-[15px] text-ink"
    >
      <div
        className={`h-5 w-5 rounded-[6px] border flex items-center justify-center transition-colors ${
          checked
            ? "bg-brand border-brand-dark"
            : "bg-surface-secondary/60 border-glass-border"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
      </div>
      {label}
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AutomationPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("workflows");
  const [searchQuery, setSearchQuery] = useState("");

  // Workflows
  const [workflows, setWorkflows] = useState<Workflow[]>(SEED_WORKFLOWS);
  const [workflowModal, setWorkflowModal] = useState<"add" | "edit" | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [wfForm, setWfForm] = useState({ name: "", trigger: "on-order" as TriggerType, conditions: "" });
  const [wfActions, setWfActions] = useState<ActionType[]>([]);

  // Triggers
  const [triggers, setTriggers] = useState<Trigger[]>(SEED_TRIGGERS);
  const [triggerModal, setTriggerModal] = useState<"add" | "edit" | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [trForm, setTrForm] = useState({ name: "", description: "", category: "event" as "event" | "time" | "condition" });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationRule[]>(SEED_NOTIFICATIONS);
  const [notifModal, setNotifModal] = useState<"add" | "edit" | null>(null);
  const [editingNotif, setEditingNotif] = useState<NotificationRule | null>(null);
  const [ntForm, setNtForm] = useState({ name: "", event: "" });
  const [ntChannels, setNtChannels] = useState({ email: true, push: true, sms: false });

  // Business Rules
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>(SEED_BUSINESS_RULES);
  const [ruleModal, setRuleModal] = useState<"add" | "edit" | null>(null);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [brForm, setBrForm] = useState({ name: "", condition: "", action: "" });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeWorkflows = workflows.filter((w) => w.enabled).length;
    const totalRuns = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const failedTasks = tasks.filter((t) => t.status === "failed").length;
    const successRate = totalRuns > 0 ? Math.round(((totalRuns - failedTasks) / totalRuns) * 100) : 100;
    const timeSaved = workflows.filter((w) => w.enabled).reduce((acc, w) => acc + w.runCount * 3, 0);
    return [
      { label: "Active Workflows", value: String(activeWorkflows), icon: Workflow },
      { label: "Tasks Executed", value: String(completedTasks), icon: Check },
      { label: "Success Rate", value: `${successRate}%`, icon: Target },
      { label: "Minutes Saved", value: timeSaved.toLocaleString(), icon: Clock },
    ];
  }, [workflows, tasks]);

  // ── Filtered Lists ───────────────────────────────────────────────────────
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) return workflows;
    const q = searchQuery.toLowerCase();
    return workflows.filter(
      (w) => w.name.toLowerCase().includes(q) || w.conditions.toLowerCase().includes(q),
    );
  }, [workflows, searchQuery]);

  const filteredTriggers = useMemo(() => {
    if (!searchQuery.trim()) return triggers;
    const q = searchQuery.toLowerCase();
    return triggers.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [triggers, searchQuery]);

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) => n.name.toLowerCase().includes(q) || n.event.toLowerCase().includes(q),
    );
  }, [notifications, searchQuery]);

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return businessRules;
    const q = searchQuery.toLowerCase();
    return businessRules.filter(
      (r) => r.name.toLowerCase().includes(q) || r.condition.toLowerCase().includes(q) || r.action.toLowerCase().includes(q),
    );
  }, [businessRules, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) => t.name.toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  // ── Workflow CRUD ────────────────────────────────────────────────────────
  const openAddWorkflow = useCallback(() => {
    setWfForm({ name: "", trigger: "on-order", conditions: "" });
    setWfActions([]);
    setEditingWorkflow(null);
    setWorkflowModal("add");
  }, []);

  const openEditWorkflow = useCallback((wf: Workflow) => {
    setWfForm({ name: wf.name, trigger: wf.trigger, conditions: wf.conditions });
    setWfActions([...wf.actions]);
    setEditingWorkflow(wf);
    setWorkflowModal("edit");
  }, []);

  const handleWorkflowSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!wfForm.name.trim()) return;
    const now = new Date().toISOString();
    if (workflowModal === "edit" && editingWorkflow) {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === editingWorkflow.id
            ? { ...w, name: wfForm.name.trim(), trigger: wfForm.trigger, actions: wfActions, conditions: wfForm.conditions.trim() }
            : w,
        ),
      );
    } else {
      const newWf: Workflow = {
        id: `wf-${crypto.randomUUID().slice(0, 8)}`,
        name: wfForm.name.trim(),
        trigger: wfForm.trigger,
        actions: wfActions,
        conditions: wfForm.conditions.trim() || "No conditions",
        enabled: true,
        createdAt: now,
        lastRun: null,
        runCount: 0,
      };
      setWorkflows((prev) => [...prev, newWf]);
    }
    setWorkflowModal(null);
  }, [workflowModal, editingWorkflow, wfForm, wfActions]);

  const toggleWorkflow = useCallback((id: string) => {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)));
  }, []);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleWfAction = useCallback((action: ActionType) => {
    setWfActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    );
  }, []);

  // ── Trigger CRUD ─────────────────────────────────────────────────────────
  const openAddTrigger = useCallback(() => {
    setTrForm({ name: "", description: "", category: "event" });
    setEditingTrigger(null);
    setTriggerModal("add");
  }, []);

  const openEditTrigger = useCallback((tr: Trigger) => {
    setTrForm({ name: tr.name, description: tr.description, category: tr.category });
    setEditingTrigger(tr);
    setTriggerModal("edit");
  }, []);

  const handleTriggerSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!trForm.name.trim()) return;
    if (triggerModal === "edit" && editingTrigger) {
      setTriggers((prev) =>
        prev.map((t) =>
          t.id === editingTrigger.id
            ? { ...t, name: trForm.name.trim(), description: trForm.description.trim(), category: trForm.category }
            : t,
        ),
      );
    } else {
      const newTr: Trigger = {
        id: `tr-${crypto.randomUUID().slice(0, 8)}`,
        name: trForm.name.trim(),
        description: trForm.description.trim(),
        category: trForm.category,
        usageCount: 0,
      };
      setTriggers((prev) => [...prev, newTr]);
    }
    setTriggerModal(null);
  }, [triggerModal, editingTrigger, trForm]);

  const deleteTrigger = useCallback((id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Notification CRUD ────────────────────────────────────────────────────
  const openAddNotif = useCallback(() => {
    setNtForm({ name: "", event: "" });
    setNtChannels({ email: true, push: true, sms: false });
    setEditingNotif(null);
    setNotifModal("add");
  }, []);

  const openEditNotif = useCallback((nt: NotificationRule) => {
    setNtForm({ name: nt.name, event: nt.event });
    setNtChannels({ ...nt.channels });
    setEditingNotif(nt);
    setNotifModal("edit");
  }, []);

  const handleNotifSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!ntForm.name.trim()) return;
    if (notifModal === "edit" && editingNotif) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingNotif.id
            ? { ...n, name: ntForm.name.trim(), event: ntForm.event.trim(), channels: { ...ntChannels } }
            : n,
        ),
      );
    } else {
      const newNt: NotificationRule = {
        id: `nt-${crypto.randomUUID().slice(0, 8)}`,
        name: ntForm.name.trim(),
        event: ntForm.event.trim(),
        channels: { ...ntChannels },
        enabled: true,
      };
      setNotifications((prev) => [...prev, newNt]);
    }
    setNotifModal(null);
  }, [notifModal, editingNotif, ntForm, ntChannels]);

  const toggleNotif = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
  }, []);

  const toggleNotifChannel = useCallback((id: string, channel: NotificationChannel) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, channels: { ...n.channels, [channel]: !n.channels[channel] } } : n,
      ),
    );
  }, []);

  const deleteNotif = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Business Rule CRUD ───────────────────────────────────────────────────
  const openAddRule = useCallback(() => {
    setBrForm({ name: "", condition: "", action: "" });
    setEditingRule(null);
    setRuleModal("add");
  }, []);

  const openEditRule = useCallback((rule: BusinessRule) => {
    setBrForm({ name: rule.name, condition: rule.condition, action: rule.action });
    setEditingRule(rule);
    setRuleModal("edit");
  }, []);

  const handleRuleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!brForm.name.trim()) return;
    const now = new Date().toISOString();
    if (ruleModal === "edit" && editingRule) {
      setBusinessRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? { ...r, name: brForm.name.trim(), condition: brForm.condition.trim(), action: brForm.action.trim() }
            : r,
        ),
      );
    } else {
      const newRule: BusinessRule = {
        id: `br-${crypto.randomUUID().slice(0, 8)}`,
        name: brForm.name.trim(),
        condition: brForm.condition.trim(),
        action: brForm.action.trim(),
        enabled: true,
        createdAt: now,
      };
      setBusinessRules((prev) => [...prev, newRule]);
    }
    setRuleModal(null);
  }, [ruleModal, editingRule, brForm]);

  const toggleRule = useCallback((id: string) => {
    setBusinessRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setBusinessRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ── Task Actions ─────────────────────────────────────────────────────────
  const runTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "running" as TaskStatus, lastRun: new Date().toISOString() }
          : t,
      ),
    );
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "completed" as TaskStatus } : t,
        ),
      );
    }, 2000);
  }, []);

  const resetTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "pending" as TaskStatus, lastRun: null }
          : t,
      ),
    );
  }, []);

  // ── Search Reset on Tab Change ───────────────────────────────────────────
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
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
          <h1 className="text-headline text-ink tracking-tight">
            <span className="text-gradient-brand">Automation</span>
          </h1>
          <p className="text-callout text-ink-tertiary mt-1">
            Workflows, triggers, rules — automate your entire business.
          </p>
        </div>
        <MagneticButton strength={0.2}>
          <Button
            variant="primary"
            icon={<Zap className="h-4 w-4" />}
            onClick={openAddWorkflow}
          >
            New Workflow
          </Button>
        </MagneticButton>
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
                  <p className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex gap-1 p-1 bg-surface-secondary/40 rounded-[14px] border border-glass-border backdrop-blur-sm overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-emphasis text-on-emphasis shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    : "text-ink-secondary hover:text-ink hover:bg-surface-secondary/60"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── Workflows Tab ─────────────────────────────────────────────── */}
        {activeTab === "workflows" && (
          <motion.div
            key="workflows"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="none">
              <SectionHeader
                title="Workflows"
                count={filteredWorkflows.length}
                onAdd={openAddWorkflow}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search workflows..."
              />
              <div className="divide-y divide-glass-border">
                {filteredWorkflows.length === 0 && <EmptyState message="No workflows found" />}
                {filteredWorkflows.map((wf, i) => (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                      wf.enabled ? "bg-brand/10" : "bg-surface-secondary/80"
                    }`}>
                      <Zap className={`h-5 w-5 ${wf.enabled ? "text-brand-dark" : "text-ink-quaternary"}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-ink truncate">{wf.name}</p>
                        <Badge variant={wf.enabled ? "success" : "default"} size="sm">
                          {wf.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[13px] text-ink-tertiary">
                          Trigger: <span className="text-ink-secondary font-medium">{TRIGGER_LABELS[wf.trigger]}</span>
                        </span>
                        <span className="text-[13px] text-ink-quaternary">·</span>
                        <span className="text-[13px] text-ink-tertiary">
                          {wf.actions.length} action{wf.actions.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[13px] text-ink-quaternary">·</span>
                        <span className="text-[13px] text-ink-tertiary">
                          {wf.runCount} runs
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                      {wf.actions.map((action) => (
                        <Badge key={action} variant="default" size="sm">
                          {ACTION_LABELS[action]}
                        </Badge>
                      ))}
                    </div>
                    <div className="hidden sm:block text-right shrink-0 w-20">
                      <p className="text-[13px] text-ink-tertiary">Last run</p>
                      <p className="text-[13px] text-ink-secondary font-medium">{formatRelative(wf.lastRun)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleWorkflow(wf.id)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                      >
                        {wf.enabled ? (
                          <ToggleRight className="h-4 w-4 text-success" strokeWidth={1.5} />
                        ) : (
                          <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                      <button
                        onClick={() => openEditWorkflow(wf)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => deleteWorkflow(wf.id)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Triggers Tab ──────────────────────────────────────────────── */}
        {activeTab === "triggers" && (
          <motion.div
            key="triggers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="none">
              <SectionHeader
                title="Triggers"
                count={filteredTriggers.length}
                onAdd={openAddTrigger}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search triggers..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-glass-border">
                {filteredTriggers.length === 0 && (
                  <div className="col-span-2">
                    <EmptyState message="No triggers found" />
                  </div>
                )}
                {filteredTriggers.map((tr, i) => {
                  const catStyle = TRIGGER_CATEGORY_STYLES[tr.category];
                  return (
                    <motion.div
                      key={tr.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
                      className="px-5 py-4 hover:bg-surface-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-bold text-ink truncate">{tr.name}</p>
                            <Badge variant={catStyle.variant} size="sm">{catStyle.label}</Badge>
                          </div>
                          <p className="text-[13px] text-ink-tertiary mt-0.5 line-clamp-2">{tr.description}</p>
                          <p className="text-[13px] text-ink-quaternary mt-1">Used in {tr.usageCount} workflow{tr.usageCount !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditTrigger(tr)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => deleteTrigger(tr.id)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Notifications Tab ─────────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="none">
              <SectionHeader
                title="Notification Rules"
                count={filteredNotifications.length}
                onAdd={openAddNotif}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search notifications..."
              />
              <div className="divide-y divide-glass-border">
                {filteredNotifications.length === 0 && <EmptyState message="No notification rules found" />}
                {filteredNotifications.map((nt, i) => (
                  <motion.div
                    key={nt.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                    className="px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                        nt.enabled ? "bg-info/10" : "bg-surface-secondary/80"
                      }`}>
                        <Bell className={`h-5 w-5 ${nt.enabled ? "text-info" : "text-ink-quaternary"}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-ink truncate">{nt.name}</p>
                          <Badge variant={nt.enabled ? "success" : "default"} size="sm">
                            {nt.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-[13px] text-ink-tertiary mt-0.5">Event: {nt.event}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleNotifChannel(nt.id, "email")}
                            className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors ${
                              nt.channels.email
                                ? "bg-brand/10 text-brand-dark"
                                : "bg-surface-secondary/60 text-ink-quaternary"
                            }`}
                          >
                            <Mail className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => toggleNotifChannel(nt.id, "push")}
                            className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors ${
                              nt.channels.push
                                ? "bg-brand/10 text-brand-dark"
                                : "bg-surface-secondary/60 text-ink-quaternary"
                            }`}
                          >
                            <Bell className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => toggleNotifChannel(nt.id, "sms")}
                            className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors ${
                              nt.channels.sms
                                ? "bg-brand/10 text-brand-dark"
                                : "bg-surface-secondary/60 text-ink-quaternary"
                            }`}
                          >
                            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <Toggle enabled={nt.enabled} onToggle={() => toggleNotif(nt.id)} />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditNotif(nt)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => deleteNotif(nt.id)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Business Rules Tab ────────────────────────────────────────── */}
        {activeTab === "rules" && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="none">
              <SectionHeader
                title="Business Rules"
                count={filteredRules.length}
                onAdd={openAddRule}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search rules..."
              />
              <div className="divide-y divide-glass-border">
                {filteredRules.length === 0 && <EmptyState message="No business rules found" />}
                {filteredRules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                    className="px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                        rule.enabled ? "bg-success/10" : "bg-surface-secondary/80"
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${rule.enabled ? "text-success" : "text-ink-quaternary"}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-ink truncate">{rule.name}</p>
                          <Badge variant={rule.enabled ? "success" : "default"} size="sm">
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[13px]">
                          <span className="text-ink-tertiary">IF <span className="text-ink-secondary font-medium">{rule.condition}</span></span>
                          <span className="text-ink-quaternary">→</span>
                          <span className="text-ink-tertiary">THEN <span className="text-ink-secondary font-medium">{rule.action}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Toggle enabled={rule.enabled} onToggle={() => toggleRule(rule.id)} />
                        <button
                          onClick={() => openEditRule(rule)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Task Queue Tab ────────────────────────────────────────────── */}
        {activeTab === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="none">
              <SectionHeader
                title="Task Queue"
                count={filteredTasks.length}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search tasks..."
              />
              <div className="divide-y divide-glass-border">
                {filteredTasks.length === 0 && <EmptyState message="No tasks in queue" />}
                {filteredTasks.map((task, i) => {
                  const statusStyle = TASK_STATUS_STYLES[task.status];
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.02 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                        task.status === "running"
                          ? "bg-info/10"
                          : task.status === "completed"
                            ? "bg-success/10"
                            : task.status === "failed"
                              ? "bg-error/10"
                              : "bg-surface-secondary/80"
                      }`}>
                        {task.status === "running" ? (
                          <RotateCcw className="h-5 w-5 text-info animate-spin" strokeWidth={1.5} />
                        ) : task.status === "completed" ? (
                          <Check className="h-5 w-5 text-success" strokeWidth={2} />
                        ) : task.status === "failed" ? (
                          <AlertCircle className="h-5 w-5 text-error" strokeWidth={1.5} />
                        ) : (
                          <Clock className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-ink truncate">{task.name}</p>
                          <Badge variant={statusStyle.variant} size="sm">{statusStyle.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[13px] text-ink-tertiary">
                            Last: <span className="text-ink-secondary font-medium">{formatRelative(task.lastRun)}</span>
                          </span>
                          <span className="text-[13px] text-ink-quaternary">·</span>
                          <span className="text-[13px] text-ink-tertiary">
                            Next: <span className="text-ink-secondary font-medium">{formatDateTime(task.nextScheduled)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {task.status !== "running" && (
                          <button
                            onClick={() => runTask(task.id)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-success hover:bg-success/10 transition-colors"
                            title="Run now"
                          >
                            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                        {task.status === "running" && (
                          <button
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary"
                            disabled
                          >
                            <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                        <button
                          onClick={() => resetTask(task.id)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                          title="Reset"
                        >
                          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Workflow Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {workflowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setWorkflowModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[15px] font-bold text-ink">
                    {workflowModal === "edit" ? "Edit Workflow" : "New Workflow"}
                  </h2>
                  <button
                    onClick={() => setWorkflowModal(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleWorkflowSubmit} className="space-y-4">
                  <FormInput
                    label="Workflow Name"
                    value={wfForm.name}
                    onChange={(v) => setWfForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. Order Confirmation"
                    required
                  />
                  <FormSelect
                    label="Trigger"
                    value={wfForm.trigger}
                    onChange={(v) => setWfForm((f) => ({ ...f, trigger: v as TriggerType }))}
                    options={TRIGGER_OPTIONS}
                  />
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-2">Actions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTION_OPTIONS.map((opt) => (
                        <FormCheckbox
                          key={opt.value}
                          label={opt.label}
                          checked={wfActions.includes(opt.value)}
                          onChange={() => toggleWfAction(opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Conditions</label>
                    <textarea
                      value={wfForm.conditions}
                      onChange={(e) => setWfForm((f) => ({ ...f, conditions: e.target.value }))}
                      className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      placeholder="e.g. Order total > 0"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setWorkflowModal(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {workflowModal === "edit" ? "Save Changes" : "Create Workflow"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {triggerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setTriggerModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[15px] font-bold text-ink">
                    {triggerModal === "edit" ? "Edit Trigger" : "New Trigger"}
                  </h2>
                  <button
                    onClick={() => setTriggerModal(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleTriggerSubmit} className="space-y-4">
                  <FormInput
                    label="Trigger Name"
                    value={trForm.name}
                    onChange={(v) => setTrForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. New Order Placed"
                    required
                  />
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Description</label>
                    <textarea
                      value={trForm.description}
                      onChange={(e) => setTrForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      placeholder="What triggers this event?"
                    />
                  </div>
                  <FormSelect
                    label="Category"
                    value={trForm.category}
                    onChange={(v) => setTrForm((f) => ({ ...f, category: v as "event" | "time" | "condition" }))}
                    options={[
                      { value: "event", label: "Event-based" },
                      { value: "time", label: "Time-based" },
                      { value: "condition", label: "Condition-based" },
                    ]}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setTriggerModal(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {triggerModal === "edit" ? "Save Changes" : "Create Trigger"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {notifModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setNotifModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[15px] font-bold text-ink">
                    {notifModal === "edit" ? "Edit Notification Rule" : "New Notification Rule"}
                  </h2>
                  <button
                    onClick={() => setNotifModal(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleNotifSubmit} className="space-y-4">
                  <FormInput
                    label="Rule Name"
                    value={ntForm.name}
                    onChange={(v) => setNtForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. New Order Alerts"
                    required
                  />
                  <FormInput
                    label="Event"
                    value={ntForm.event}
                    onChange={(v) => setNtForm((f) => ({ ...f, event: v }))}
                    placeholder="e.g. Order placed"
                    required
                  />
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-2">Channels</label>
                    <div className="flex gap-4">
                      <FormCheckbox
                        label="Email"
                        checked={ntChannels.email}
                        onChange={() => setNtChannels((c) => ({ ...c, email: !c.email }))}
                      />
                      <FormCheckbox
                        label="Push"
                        checked={ntChannels.push}
                        onChange={() => setNtChannels((c) => ({ ...c, push: !c.push }))}
                      />
                      <FormCheckbox
                        label="SMS"
                        checked={ntChannels.sms}
                        onChange={() => setNtChannels((c) => ({ ...c, sms: !c.sms }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setNotifModal(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {notifModal === "edit" ? "Save Changes" : "Create Rule"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Business Rule Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {ruleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setRuleModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[15px] font-bold text-ink">
                    {ruleModal === "edit" ? "Edit Business Rule" : "New Business Rule"}
                  </h2>
                  <button
                    onClick={() => setRuleModal(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleRuleSubmit} className="space-y-4">
                  <FormInput
                    label="Rule Name"
                    value={brForm.name}
                    onChange={(v) => setBrForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. Auto-approve small orders"
                    required
                  />
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Condition (IF)</label>
                    <textarea
                      value={brForm.condition}
                      onChange={(e) => setBrForm((f) => ({ ...f, condition: e.target.value }))}
                      className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      placeholder="e.g. Order total < 500,000 TZS"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Action (THEN)</label>
                    <textarea
                      value={brForm.action}
                      onChange={(e) => setBrForm((f) => ({ ...f, action: e.target.value }))}
                      className="w-full h-20 px-3 py-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      placeholder="e.g. Auto-approve and send confirmation"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setRuleModal(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {ruleModal === "edit" ? "Save Changes" : "Create Rule"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
