import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, ArrowUpRight, Users, Package, ShoppingCart } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";

type Period = "6M" | "1Y" | "All";

const PERIOD_MONTHS: Record<Period, number> = {
  "6M": 6,
  "1Y": 12,
  "All": Infinity,
};

const compactAmount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

export default function AnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("6M");
  const { transactions, contacts, inventoryItems, selectedCurrency } = useStore();

  const chartData = useMemo(() => {
    const now = new Date();
    const monthsBack = PERIOD_MONTHS[activePeriod];
    const map = new Map<string, { key: string; label: string; revenue: number }>();
    transactions.forEach((t) => {
      if (t.type !== "income" || t.status !== "completed") return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      const ageMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (ageMonths < 0 || ageMonths >= monthsBack) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("en", { month: "short" });
      const entry = map.get(key) ?? { key, label, revenue: 0 };
      entry.revenue += t.amount.amount;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
  }, [transactions, activePeriod]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.type !== "income" || t.status !== "completed") return;
      const cat = t.category?.trim() || "General";
      map.set(cat, (map.get(cat) ?? 0) + t.amount.amount);
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
    const COLORS = ["#AF52DE", "#FF6482", "#007AFF", "#30D158", "#FF9500", "#00C7BE"];
    return sorted.map(([name, revenue], i) => ({
      name,
      revenue,
      share: Math.round((revenue / total) * 100),
      color: COLORS[i % COLORS.length],
    }));
  }, [transactions]);

  const kpis = useMemo(() => {
    const completedIncome = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const completedExpenses = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const totalIncomeTx = transactions.filter((t) => t.type === "income").length;
    const totalContacts = contacts.length;
    const inventoryValue = inventoryItems.reduce((s, i) => s + i.price.amount * i.stock, 0);

    const now = new Date();
    const monthlyIncome = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .filter((t) => {
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && now.getTime() - d.getTime() <= 30 * 24 * 3600 * 1000;
      })
      .reduce((s, t) => s + t.amount.amount, 0);

    const growth =
      completedExpenses === 0
        ? completedIncome > 0 ? 100 : 0
        : ((completedIncome - completedExpenses) / completedExpenses) * 100;
    const revenueGrowth = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
    const turnover = inventoryValue > 0 ? `${(monthlyIncome / inventoryValue).toFixed(1)}x` : "0x";

    return {
      revenueGrowth,
      customerAcquisition: `+${totalContacts}`,
      orderVolume: `+${totalIncomeTx}`,
      inventoryTurnover: turnover,
    };
  }, [transactions, contacts, inventoryItems]);

  return (
    <CursorSpotlight className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-headline text-ink tracking-tight text-gradient-brand">Analytics</h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Dashboards, KPIs, reporting, and business intelligence.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue Growth", value: kpis.revenueGrowth, icon: TrendingUp, color: "#30D158" },
          { label: "Total Contacts", value: kpis.customerAcquisition, icon: Users, color: "#007AFF" },
          { label: "Transactions", value: kpis.orderVolume, icon: ShoppingCart, color: "#FF9500" },
          { label: "Inventory Turnover", value: kpis.inventoryTurnover, icon: Package, color: "#AF52DE" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="md" hover>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${kpi.color}12` }}>
                  <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{kpi.label}</p>
                  <p className="text-title font-bold text-ink tracking-tight">{kpi.value}</p>
                </div>
              </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
        <GlassCard padding="lg" className="glass-material">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-subhead font-bold text-ink">Revenue Overview</h3>
            <div className="flex items-center gap-1.5">
              {(["6M", "1Y", "All"] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 h-8 rounded-[8px] text-caption font-semibold transition-all duration-200 ${
                    period === activePeriod ? "bg-emphasis text-on-emphasis" : "bg-surface-secondary/60 text-ink-secondary hover:text-ink"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Bars */}
          {chartData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-8 w-8 text-ink-quaternary mb-2" strokeWidth={1.5} />
              <p className="text-callout text-ink-tertiary">No completed income yet</p>
              <p className="text-caption text-ink-quaternary mt-1">Add transactions in Money → Payments to see revenue here.</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {chartData.map((d, i) => (
                <motion.div
                  key={d.key}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-caption text-ink-secondary font-semibold">{compactAmount(d.revenue)}</span>
                  <div className="w-full bg-brand/15 rounded-[8px] relative overflow-hidden" style={{ height: "100%" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand to-brand-light rounded-[8px]"
                    />
                  </div>
                  <span className="text-[10px] text-ink-quaternary font-semibold">{d.label}</span>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Top Categories */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg">
          <h3 className="text-subhead font-bold text-ink mb-4">Top Revenue Categories</h3>
          {topCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-callout text-ink-tertiary">No revenue categories yet</p>
              <p className="text-caption text-ink-quaternary mt-1">Completed income transactions will appear here by category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat) => (
                <div key={cat.name} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span className="text-caption font-semibold text-ink w-full sm:w-28 shrink-0 truncate">{cat.name}</span>
                  <div className="flex-1 h-2 bg-surface-secondary/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.share}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-caption font-bold text-ink w-full sm:w-36 text-left sm:text-right shrink-0">{formatPrice(cat.revenue, selectedCurrency)}</span>
                  <span className="text-caption text-ink-tertiary w-12 shrink-0">{cat.share}%</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </CursorSpotlight>
  );
}
