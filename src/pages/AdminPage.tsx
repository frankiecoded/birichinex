import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Phone,
  Newspaper,
  GraduationCap,
  LogOut,
  Search,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  Mail,
  Lock,
  CircleAlert,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { COURSES } from "../data/platform";
import { clearOwnerSession, getOwnerSession, ownerFetch, setOwnerSession } from "../lib/ownerSession";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface OverviewData {
  users: { total: number; customers: number; newThisMonth: number; active30d: number };
  subscriptions: { membershipActive: number; dropshipActive: number };
  commerce: { orders: number; dropshipOrders: number; contacts: number; inventory: number; transactions: number };
  revenue: { businessEarned: number; paymentsLedgerCount: number; paymentsLedgerThisMonth: number; ledgerSumMinor: number };
  engagement: { calls: number; liveCallEvents: number; completedCourses: number; startedCourses: number; communityPosts: number };
  visits: { total: number; today: number; daily: { day: string; count: number }[]; byMonth: { month: string; count: number }[]; topPaths: { path: string; count: number }[] };
  generatedAt: string;
}

interface CustomerRow {
  key: string;
  email: string;
  name: string;
  accountType: string;
  createdAt: string;
  lastActive: string;
  membership: { plan: string; status: string };
  dropship: { tier: string; status: string; subscribedAt: string };
  walletBalance: number;
  totalEarned: number;
  orders: number;
  dropshipOrders: number;
  contacts: number;
  inventory: number;
  transactions: number;
  calls: number;
  courseProgress: number;
  completedCourses: number;
  loyalty: number;
  communityPosts: number;
}

interface LedgerEntry {
  at?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  channel?: string;
  kind?: string;
  tier?: string;
  billingPeriod?: string;
  email?: string;
}

interface PaymentsData {
  ledger: LedgerEntry[];
  months: { month: string; count: number; sumMinor: number }[];
  totalCount: number;
  totalSumMinor: number;
}

interface VisitData {
  total: number;
  today: number;
  daily: { day: string; count: number }[];
  byMonth: { month: string; count: number }[];
  topPaths: { path: string; count: number }[];
  last: { t?: string; path?: string; email?: string }[];
}

interface CallData {
  liveEvents: Record<string, string>[];
  transcripts: { at?: string; role?: string; text?: string }[];
}

interface PlatformPost {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type Tab = "overview" | "customers" | "payments" | "visits" | "calls" | "posts" | "academy";

// ─────────────────────────────────────────────────────────────────────────────
// Data hook
// ─────────────────────────────────────────────────────────────────────────────
function useOwnerData<T>(path: string, enabled: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const d = await ownerFetch<T>(path);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled]);

  return { data, loading, error, refresh: load };
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat().format(Math.round(n));
}

function fmtMoneyMinor(minor: number): string {
  return fmtNum(minor / 100);
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
interface AdminPageProps {
  onSignOut?: () => void;
}

export default function AdminPage({ onSignOut }: AdminPageProps) {
  const [phase, setPhase] = useState<"checking" | "login" | "open">("checking");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    let alive = true;
    (async () => {
      const session = getOwnerSession();
      if (!session) {
        if (alive) setPhase("login");
        return;
      }
      try {
        await ownerFetch("/api/admin/me");
        if (alive) setPhase("open");
      } catch {
        clearOwnerSession();
        if (alive) setPhase("login");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const attemptLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await ownerFetch<{ ok: boolean; token: string; expiresIn: number; email: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res?.token) throw new Error("No token returned");
      setOwnerSession({ token: res.token, email: res.email, expiresAt: Date.now() + res.expiresIn * 1000 });
      setPhase("open");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleSignOut = () => {
    clearOwnerSession();
    setPhase("login");
    onSignOut?.();
  };

  if (phase !== "open") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090c] relative overflow-hidden px-4">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-brand/10 blur-[140px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
          <GlassCard variant="dark" padding="lg" className="backdrop-blur-2xl">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-[18px] bg-brand/15 border border-brand/30 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-brand" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">Owner Access</h1>
                <p className="text-[13px] text-white/50 mt-1">Restricted control plane · session expires in 12h</p>
              </div>
            </div>
            <form onSubmit={attemptLogin} className="space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40 pl-1">Email</span>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="owner@…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-[12px] pl-10 pr-4 py-3 text-[14px] text-white placeholder-white/25 outline-none focus:border-brand/50 focus:bg-white/[0.06] transition-colors"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40 pl-1">Password</span>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-[12px] pl-10 pr-4 py-3 text-[14px] text-white placeholder-white/25 outline-none focus:border-brand/50 focus:bg-white/[0.06] transition-colors"
                  />
                </div>
              </label>
              {loginError && (
                <div className="flex items-start gap-2 text-[13px] text-[#ff6b6b] bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-[10px] px-3 py-2.5">
                  <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              <Button type="submit" fullWidth size="lg" loading={loginBusy} icon={<ShieldCheck className="w-4 h-4" />}>
                Sign in to control plane
              </Button>
            </form>
            <p className="text-center text-[11px] text-white/30 mt-5">
              Credentials are never stored in client code or the public repo.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090c] text-white pb-24 font-sans">
      <div className="pointer-events-none fixed -top-48 left-1/3 w-[800px] h-[600px] bg-brand/8 blur-[160px] rounded-full" />
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07090c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="h-9 w-9 rounded-[12px] bg-brand/15 border border-brand/30 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight truncate">BirichiNex · Owner Console</h1>
            <p className="text-[11px] text-white/40 truncate">Server-side control plane · everything below is fetched live</p>
          </div>
          <button
            onClick={() => void location.reload()}
            className="h-9 px-3 rounded-[10px] text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Button size="sm" variant="ghost" icon={<LogOut className="w-3.5 h-3.5" />} onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              ["overview", "Overview", LayoutDashboard],
              ["customers", "Customers", Users],
              ["payments", "Payments", CreditCard],
              ["visits", "Visits", BarChart3],
              ["calls", "Calls", Phone],
              ["posts", "News", Newspaper],
              ["academy", "Academy", GraduationCap],
            ] as [Tab, string, typeof LayoutDashboard][]
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors",
                tab === id ? "bg-brand text-ink" : "text-white/55 hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            {tab === "overview" && <OverviewTab />}
            {tab === "customers" && <CustomersTab />}
            {tab === "payments" && <PaymentsTab />}
            {tab === "visits" && <VisitsTab />}
            {tab === "calls" && <CallsTab />}
            {tab === "posts" && <PostsTab />}
            {tab === "academy" && <AcademyTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
      <p className={`mt-2 text-[24px] font-semibold tracking-tight ${accent ? "text-brand" : "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-[12px] text-white/40">{sub}</p>}
    </GlassCard>
  );
}

function OverviewTab() {
  const { data, loading, error, refresh } = useOwnerData<OverviewData>("/api/admin/overview", true);

  if (loading && !data) return <LoadingCard />;
  if (error && !data) return <ErrorCard message={error} onRetry={refresh} />;
  if (!data) return null;

  const v = data.visits;
  const monthSeries = [...v.byMonth].slice(-8);
  const maxMonth = Math.max(1, ...monthSeries.map((m) => m.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total users" value={fmtNum(data.users.total)} sub={`${fmtNum(data.users.newThisMonth)} new this month`} accent />
        <MetricCard label="Active 30d" value={fmtNum(data.users.active30d)} sub={`${fmtNum(data.users.customers)} customer accounts`} />
        <MetricCard label="Memberships" value={String(data.subscriptions.membershipActive)} sub="active paid members" />
        <MetricCard label="Dropship active" value={String(data.subscriptions.dropshipActive)} sub="paid tiers (starter→enterprise)" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Orders" value={fmtNum(data.commerce.orders)} sub={`${fmtNum(data.commerce.dropshipOrders)} dropship`} />
        <MetricCard label="Contacts" value={fmtNum(data.commerce.contacts)} sub={`${fmtNum(data.commerce.inventory)} inventory items`} />
        <MetricCard label="Transactions" value={fmtNum(data.commerce.transactions)} sub="recorded in-store" />
        <MetricCard label="Business earned" value={fmtNum(data.revenue.businessEarned)} sub="TZS across wallets" accent />
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Visits · {v.total} total</p>
              <p className="text-[13px] text-white/60 mt-1">{fmtNum(v.today)} today · page-level analytics since deploy</p>
            </div>
            <Badge variant="info" dot>live</Badge>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {monthSeries.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-white/50">{fmtNum(m.count)}</span>
                <div
                  className="w-full rounded-t-[6px] bg-gradient-to-t from-brand/25 to-brand/70"
                  style={{ height: `${Math.max(6, Math.round((m.count / maxMonth) * 88))}px` }}
                />
                <span className="text-[10px] text-white/35 truncate w-full text-center">{m.month}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Top paths</p>
          <ul className="mt-3 space-y-2">
            {v.topPaths.slice(0, 8).map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-white/35 font-mono w-5">{fmtNum(p.count)}</span>
                <span className="text-white/70 truncate flex-1">{p.path || "/"}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">AI calls</p>
          <p className="mt-2 text-[24px] font-semibold text-white">{fmtNum(data.engagement.calls)}</p>
          <p className="mt-1 text-[12px] text-white/40">{fmtNum(data.engagement.liveCallEvents)} live-telephony events</p>
        </GlassCard>
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Academy</p>
          <p className="mt-2 text-[24px] font-semibold text-white">{fmtNum(data.engagement.completedCourses)}</p>
          <p className="mt-1 text-[12px] text-white/40">{fmtNum(data.engagement.startedCourses)} courses started</p>
        </GlassCard>
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Payments (ledger)</p>
          <p className="mt-2 text-[24px] font-semibold text-brand">{fmtNum(data.revenue.paymentsLedgerCount)}</p>
          <p className="mt-1 text-[12px] text-white/40">
            {fmtNum(data.revenue.paymentsLedgerThisMonth)} this month · {fmtMoneyMinor(data.revenue.ledgerSumMinor)} collected
          </p>
        </GlassCard>
      </div>

      <p className="text-[11px] text-white/30">Server snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────
function CustomersTab() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useOwnerData<{ total: number; items: CustomerRow[] }>(
    `/api/admin/users?q=${encodeURIComponent(q)}&offset=${page * 40}&limit=40`,
    true,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ updatedAt: string; payload: any } | null>(null);

  useEffect(() => {
    setPage(0);
  }, [q]);

  const openDetail = async (key: string) => {
    setSelectedKey(key);
    setDetail(null);
    try {
      const d = await ownerFetch<{ updatedAt: string; payload: any }>(`/api/admin/users/${encodeURIComponent(key)}`);
      setDetail(d);
    } catch {
      setDetail({ updatedAt: "", payload: null });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email or key…"
          className="w-full bg-white/[0.04] border border-white/10 rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-white/25 outline-none focus:border-brand/50 transition-colors"
        />
      </div>

      {loading && !data ? (
        <LoadingCard />
      ) : error && !data ? (
        <ErrorCard message={error} onRetry={refresh} />
      ) : data ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/50">{fmtNum(data.total)} accounts</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="text-[12px] text-white/50 font-mono">{page + 1}</span>
              <Button size="sm" variant="ghost" disabled={(page + 1) * 40 >= data.total} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>

          <GlassCard variant="dark" padding="none" className="backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-white/35 border-b border-white/[0.06]">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Membership</th>
                    <th className="px-4 py-3 font-semibold">Dropship</th>
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr
                      key={u.key}
                      onClick={() => void openDetail(u.key)}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-[10px] bg-brand/15 border border-brand/25 flex items-center justify-center text-[11px] font-bold text-brand">
                            {(u.name || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{u.name}</p>
                            <p className="text-[12px] text-white/45 truncate">{u.email || u.key}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.membership.status === "active" ? (
                          <Badge variant="success" dot>{u.membership.plan || "member"}</Badge>
                        ) : (
                          <span className="text-white/35">none</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.dropship.status === "active" && u.dropship.tier && u.dropship.tier !== "free" ? (
                          <Badge variant="brand" dot>{u.dropship.tier}</Badge>
                        ) : (
                          <span className="text-white/35">free</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {fmtNum(u.orders)} orders · {fmtNum(u.calls)} calls · {fmtNum(u.transactions)} tx
                      </td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{timeAgo(u.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.items.length === 0 && <p className="px-4 py-8 text-center text-white/35 text-[13px]">No accounts match.</p>}
          </GlassCard>
        </>
      ) : null}

      <AnimatePresence>
        {selectedKey && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setSelectedKey(null)}>
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full sm:max-w-3xl max-h-[86vh] overflow-y-auto bg-[#0d1015] border border-white/10 rounded-t-[24px] sm:rounded-[24px] p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-white">Full snapshot</h3>
                  <p className="text-[12px] text-white/45 mt-0.5">{selectedKey} · updated {fmtDate(detail?.updatedAt)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedKey(null)}>Close</Button>
              </div>
              {detail?.payload ? (
                <pre className="text-[11px] leading-relaxed text-white/75 bg-white/[0.03] border border-white/[0.06] rounded-[14px] p-4 overflow-x-auto max-h-[60vh] font-mono whitespace-pre-wrap">
                  {JSON.stringify(detail.payload, null, 2)}
                </pre>
              ) : (
                <p className="text-white/45 text-[13px]">Loading…</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────────────────────
function PaymentsTab() {
  const { data, loading, error, refresh } = useOwnerData<PaymentsData>("/api/admin/payments", true);
  if (loading && !data) return <LoadingCard />;
  if (error && !data) return <ErrorCard message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <MetricCard label="Charges recorded" value={fmtNum(data.totalCount)} sub="verified Paystack webhook events" accent />
        <MetricCard label="Collected" value={fmtMoneyMinor(data.totalSumMinor)} sub="charge currency major units (KES)" />
        <MetricCard label="This month" value={String((data.months.at(-1) || { count: 0 }).count)} sub={`${fmtMoneyMinor((data.months.at(-1) || { sumMinor: 0 }).sumMinor)} in ${(data.months.at(-1) || { month: "—" }).month}`} />
      </div>

      <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Monthly totals</p>
        <div className="flex items-end gap-2 h-32 overflow-x-auto pb-1">
          {data.months.map((m) => {
            const max = Math.max(1, ...data.months.map((x) => x.sumMinor));
            return (
              <div key={m.month} className="flex-1 min-w-[52px] flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-white/50">{fmtMoneyMinor(m.sumMinor)}</span>
                <div className="w-full rounded-t-[6px] bg-gradient-to-t from-emerald-500/20 to-emerald-400/70" style={{ height: `${Math.max(8, Math.round((m.sumMinor / max) * 88))}px` }} />
                <span className="text-[10px] text-white/35">{m.month}</span>
                <span className="text-[9px] text-white/25">{m.count}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard variant="dark" padding="none" className="backdrop-blur-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white/80">Ledger</p>
          <Badge variant="default">verified webhooks</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-white/35 border-b border-white/[0.06]">
                <th className="px-4 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Reference</th>
                <th className="px-4 py-2.5 font-semibold">Kind</th>
                <th className="px-4 py-2.5 font-semibold">Tier</th>
                <th className="px-4 py-2.5 font-semibold">Amount</th>
                <th className="px-4 py-2.5 font-semibold">Channel</th>
                <th className="px-4 py-2.5 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 120).map((e, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 text-white/50 whitespace-nowrap">{fmtDate(e.at)}</td>
                  <td className="px-4 py-2.5 text-white/70 font-mono">{e.reference}</td>
                  <td className="px-4 py-2.5"><Badge variant="info">{e.kind}</Badge></td>
                  <td className="px-4 py-2.5 text-white/60">{e.tier || "—"}</td>
                  <td className="px-4 py-2.5 text-white font-mono">{fmtMoneyMinor(Number(e.amount || 0))} {e.currency}</td>
                  <td className="px-4 py-2.5 text-white/50">{e.channel || "—"}</td>
                  <td className="px-4 py-2.5 text-white/50 truncate max-w-[220px]">{e.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.ledger.length === 0 && (
            <p className="px-4 py-8 text-center text-white/35 text-[13px]">No verified webhook charges yet. Set the Paystack webhook URL to populate this.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visits
// ─────────────────────────────────────────────────────────────────────────────
function VisitsTab() {
  const { data, loading, error, refresh } = useOwnerData<VisitData>("/api/admin/visits", true);
  if (loading && !data) return <LoadingCard />;
  if (error && !data) return <ErrorCard message={error} onRetry={refresh} />;
  if (!data) return null;

  const daily = [...data.daily].slice(-14);
  const maxD = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="All time" value={fmtNum(data.total)} accent />
        <MetricCard label="Today" value={fmtNum(data.today)} />
        <MetricCard label="Top page" value={(data.topPaths[0]?.path || "—").slice(0, 24)} sub={data.topPaths[0] ? `${fmtNum(data.topPaths[0].count)} views` : undefined} />
      </div>

      <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Last 14 days</p>
        <div className="flex items-end gap-1.5 h-32">
          {daily.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-white/50">{fmtNum(d.count)}</span>
              <div className="w-full rounded-t-[6px] bg-gradient-to-t from-brand/25 to-brand/70" style={{ height: `${Math.max(6, Math.round((d.count / maxD) * 88))}px` }} />
              <span className="text-[9px] text-white/35 truncate w-full text-center">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-3">
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Top pages</p>
          <ul className="space-y-2">
            {data.topPaths.map((p, i) => (
              <li key={i} className="flex items-center gap-3 text-[12px]">
                <span className="text-white/30 font-mono w-6">{fmtNum(p.count)}</span>
                <span className="text-[11px] text-white/50 w-16 shrink-0">{p.count > 0 ? Math.round((p.count / data.total) * 100) + "%" : "0%"}</span>
                <span className="text-white/70 font-mono truncate flex-1">{p.path || "/"}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Recent visits</p>
          <ul className="space-y-1.5 max-h-72 overflow-y-auto">
            {data.last.map((v, i) => (
              <li key={i} className="flex items-center gap-3 text-[12px] py-1 border-b border-white/[0.04] last:border-0">
                <span className="text-white/35 font-mono shrink-0 text-[11px]">{timeAgo(v.t)}</span>
                <span className="text-white/70 font-mono truncate flex-1">{v.path || "/"}</span>
                {v.email && <span className="text-white/40 text-[11px] truncate max-w-[140px]">{v.email}</span>}
              </li>
            ))}
            {data.last.length === 0 && <li className="text-white/35 text-[13px] py-3">No visits recorded yet.</li>}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calls
// ─────────────────────────────────────────────────────────────────────────────
function CallsTab() {
  const { data, loading, error, refresh } = useOwnerData<CallData>("/api/admin/calls", true);
  if (loading && !data) return <LoadingCard />;
  if (error && !data) return <ErrorCard message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <MetricCard label="Live telephony events" value={fmtNum(data.liveEvents.length)} accent />
        <MetricCard label="Gemini Live lines transcribed" value={fmtNum(data.transcripts.length)} />
      </div>

      <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Call status events</p>
        <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-[12px]">
          {data.liveEvents.map((e, i) => (
            <p key={i} className="text-white/65 py-1 border-b border-white/[0.04] last:border-0 truncate">
              {JSON.stringify(e)}
            </p>
          ))}
          {data.liveEvents.length === 0 && <p className="text-white/35">No telephony events in this boot.</p>}
        </div>
      </GlassCard>

      <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Conversation transcripts</p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.transcripts.map((t, i) => (
            <div key={i} className="flex items-start gap-3 text-[13px]">
              <Badge variant={t.role === "user" ? "info" : "brand"} size="sm">{t.role || "?"}</Badge>
              <div className="flex-1">
                <p className="text-white/80 leading-relaxed">{t.text}</p>
                {t.at && <p className="text-white/30 text-[11px] mt-0.5">{fmtDate(t.at)}</p>}
              </div>
            </div>
          ))}
          {data.transcripts.length === 0 && <p className="text-white/35">No transcripts in this boot.</p>}
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Posts (BirichiNex news)
// ─────────────────────────────────────────────────────────────────────────────
function PostsTab() {
  const { data, loading, error, refresh } = useOwnerData<{ posts: PlatformPost[] }>("/api/admin/posts", true);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftCategory, setDraftCategory] = useState("News");
  const [draftPinned, setDraftPinned] = useState(false);
  const [draftPublished, setDraftPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftBody.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await ownerFetch("/api/admin/posts", {
        method: "POST",
        body: JSON.stringify({ title: draftTitle, body: draftBody, category: draftCategory, pinned: draftPinned, published: draftPublished }),
      });
      setDraftTitle("");
      setDraftBody("");
      setDraftPinned(false);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (p: PlatformPost) => {
    try {
      await ownerFetch(`/api/admin/posts/${p.id}`, { method: "PUT", body: JSON.stringify({ published: !p.published }) });
      await refresh();
    } catch {
      /* ignore */
    }
  };

  const remove = async (id: string) => {
    await ownerFetch(`/api/admin/posts/${id}`, { method: "DELETE" }).catch(() => undefined);
    await refresh();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <GlassCard variant="dark" padding="lg" className="backdrop-blur-xl h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-4 h-4 text-brand" />
          <p className="text-[13px] font-semibold text-white/85">Publish a BirichiNex post</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Headline"
            required
            maxLength={160}
            className="w-full bg-white/[0.04] border border-white/10 rounded-[12px] px-4 py-3 text-[14px] text-white placeholder-white/25 outline-none focus:border-brand/50 transition-colors"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Body — you are speaking as BirichiNex. Markdown-ish plain text."
            required
            rows={6}
            maxLength={12000}
            className="w-full bg-white/[0.04] border border-white/10 rounded-[12px] px-4 py-3 text-[13px] text-white placeholder-white/25 outline-none focus:border-brand/50 transition-colors resize-y"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value)}
              placeholder="Category"
              maxLength={40}
              className="flex-1 min-w-[120px] bg-white/[0.04] border border-white/10 rounded-[10px] px-3 py-2 text-[13px] text-white placeholder-white/25 outline-none focus:border-brand/50"
            />
            <label className="flex items-center gap-1.5 text-[12px] text-white/60 cursor-pointer">
              <input type="checkbox" checked={draftPinned} onChange={(e) => setDraftPinned(e.target.checked)} className="accent-brand" /> <Pin className="w-3 h-3" /> Pin
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-white/60 cursor-pointer">
              <input type="checkbox" checked={draftPublished} onChange={(e) => setDraftPublished(e.target.checked)} className="accent-brand" /> Publish now
            </label>
          </div>
          {msg && <p className="text-[12px] text-[#ff6b6b]">{msg}</p>}
          <Button type="submit" loading={busy} icon={<Plus className="w-4 h-4" />}>Publish</Button>
        </form>
      </GlassCard>

      <div className="space-y-3">
        {loading && !data ? <LoadingCard /> : null}
        {(data?.posts || []).map((p) => (
          <GlassCard key={p.id} variant="dark" padding="md" className="backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.pinned && <Badge variant="warning">pinned</Badge>}
                  <Badge variant={p.published ? "success" : "default"}>{p.published ? "live" : "draft"}</Badge>
                  <span className="text-[11px] text-white/35">{p.category} · {fmtDate(p.createdAt)}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-white mt-2">{p.title}</h3>
                <p className="text-[13px] text-white/65 mt-1 whitespace-pre-wrap line-clamp-4">{p.body}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="secondary" icon={p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} onClick={() => void togglePublish(p)}>
                {p.published ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => void remove(p.id)}>
                Delete
              </Button>
            </div>
          </GlassCard>
        ))}
        {!loading && data && data.posts.length === 0 && (
          <p className="text-white/35 text-[13px] py-6 text-center">No posts yet. Publish your first BirichiNex update.</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Academy control
// ─────────────────────────────────────────────────────────────────────────────
function AcademyTab() {
  const { data, loading, error, refresh } = useOwnerData<{ disabled: string[] }>("/api/platform/academy", true);
  const [busy, setBusy] = useState(false);

  const toggle = async (id: string) => {
    if (!data) return;
    const disabled = data.disabled.includes(id) ? data.disabled.filter((d) => d !== id) : [...data.disabled, id];
    setBusy(true);
    try {
      await ownerFetch("/api/admin/academy", { method: "PUT", body: JSON.stringify({ disabled }) });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) return <LoadingCard />;
  if (error && !data) return <ErrorCard message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="space-y-4 max-w-3xl">
      <GlassCard variant="dark" padding="md" className="backdrop-blur-xl">
        <p className="text-[13px] font-semibold text-white/85">Academy visibility</p>
        <p className="text-[12px] text-white/50 mt-1 mb-4">
          Disabled courses are hidden from the Learning Academy across the app. Toggle to control early access or gate unfinished work.
        </p>
        <div className="space-y-2">
          {COURSES.map((c) => {
            const isOff = data.disabled.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-[12px] px-3.5 py-3">
                <button
                  onClick={() => void toggle(c.id)}
                  disabled={busy}
                  className={`relative w-10 h-6 rounded-full transition-colors ${isOff ? "bg-white/20" : "bg-emerald-500/80"}`}
                  aria-label="toggle"
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${isOff ? "left-0.5" : "left-[18px]"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{c.title}</p>
                  <p className="text-[11px] text-white/40">{c.category} · {c.difficulty} · {c.duration}</p>
                </div>
                {isOff ? <Badge variant="error">disabled</Badge> : <Badge variant="success" dot>live</Badge>}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────
function LoadingCard() {
  return (
    <GlassCard variant="dark" padding="lg" className="backdrop-blur-xl">
      <div className="flex items-center gap-3 text-white/50 text-[13px]">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    </GlassCard>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GlassCard variant="dark" padding="lg" className="backdrop-blur-xl">
      <p className="text-[13px] text-[#ff6b6b]">{message}</p>
      <Button size="sm" variant="secondary" className="mt-3" onClick={onRetry}>Retry</Button>
    </GlassCard>
  );
}