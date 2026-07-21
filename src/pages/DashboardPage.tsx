import { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, ShoppingBag, Users, Package, BarChart3, Star,
  ArrowUpRight, ArrowDownRight, Clock, Zap, Globe, Shield, Rocket,
  DollarSign, BookOpen
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice, CURRENCY_SYMBOLS } from "../data/platform";
import { BirichiNexView } from "../types";

interface DashboardPageProps {
  onNavigate: (view: BirichiNexView) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { settings, contacts, transactions, inventoryItems, courseProgress, selectedCurrency } = useStore();

  const firstName = settings.profile.name.split(" ")[0];

  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const totalRevenue = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount.amount, 0);
    const inventoryCount = inventoryItems.length;
    const activeCourses = Object.values(courseProgress).filter((c) => c.started && !c.completed).length;
    return { totalContacts, totalRevenue, inventoryCount, activeCourses };
  }, [contacts, transactions, inventoryItems, courseProgress]);

  const recentActivity = useMemo(() => {
    const items: { id: string; type: string; title: string; time: string; badge: string | null; navigateTo: BirichiNexView }[] = [];

    const sortedContacts = [...contacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sortedContacts.slice(0, 2).forEach((c) => {
      items.push({ id: `c-${c.id}`, type: "customer", title: `New contact added: ${c.name}`, time: timeAgo(c.createdAt), badge: "New", navigateTo: "crm" });
    });

    const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sortedTx.slice(0, 2).forEach((t) => {
      if (t.type === "income" && t.status === "completed") {
        items.push({ id: `t-${t.id}`, type: "payment", title: `Payment received: ${formatPrice(t.amount.amount, selectedCurrency)}`, time: timeAgo(t.date), badge: "Payment", navigateTo: "finance" });
      }
    });

    const lowStock = inventoryItems.filter((i) => i.status === "low-stock" || i.status === "out-of-stock");
    if (lowStock.length > 0) {
      items.push({ id: "low-stock", type: "inventory", title: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} low on stock`, time: "Inventory check", badge: "Alert", navigateTo: "inventory" });
    }

    items.sort((a, b) => {
      const order = { New: 0, Payment: 1, Alert: 2 };
      return (order[a.badge as keyof typeof order] ?? 3) - (order[b.badge as keyof typeof order] ?? 3);
    });

    return items.slice(0, 5);
  }, [contacts, transactions, inventoryItems, selectedCurrency]);

  const quickActions = [
    { id: "marketplace" as BirichiNexView, label: "Browse Marketplace", icon: ShoppingBag, color: "#007AFF" },
    { id: "ai-advisor" as BirichiNexView, label: "AI Advisor", icon: Zap, color: "#FF6482" },
    { id: "learning" as BirichiNexView, label: "Continue Learning", icon: BookOpen, color: "#0A84FF" },
    { id: "entrepreneur-hub" as BirichiNexView, label: "Entrepreneur Hub", icon: Rocket, color: "#30D158" },
  ];

  const activityNavMap: Record<string, BirichiNexView> = {
    customer: "crm",
    payment: "finance",
    inventory: "inventory",
  };

  return (
    <CursorSpotlight className="rounded-2xl">
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative space-y-1"
      >
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.08)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
        <h1 className="text-headline text-gradient-brand tracking-tight">{getGreeting()}, {firstName}</h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Here's what's happening across your BirichiNex ecosystem today.
        </p>
      </motion.div>

      {/* Verified Business ID Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard variant="brand" padding="lg" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[14px] bg-brand/15 flex items-center justify-center">
              <Shield className="h-6 w-6 text-brand-dark" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-subhead font-bold text-ink">BirichiNex Verified Business</h3>
                <Badge variant="success" size="sm" dot>Active</Badge>
              </div>
              <p className="text-caption text-ink-tertiary mt-0.5">{settings.profile.company} · Silver Tier</p>
            </div>
          </div>
          <MagneticButton>
            <button
              onClick={() => onNavigate("identity-access")}
              className="text-caption font-semibold text-brand-dark hover:text-brand flex items-center gap-1 transition-colors"
            >
              View Profile <ArrowUpRight className="h-3 w-3" />
            </button>
          </MagneticButton>
        </GlassCard>
      </motion.div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contacts", value: stats.totalContacts.toString(), icon: Users, color: "#007AFF" },
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue, selectedCurrency), icon: DollarSign, color: "#30D158" },
          { label: "Inventory Items", value: stats.inventoryCount.toString(), icon: Package, color: "#FF9500" },
          { label: "Active Courses", value: stats.activeCourses.toString(), icon: BookOpen, color: "#AF52DE" },
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
                    <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className="text-title font-bold text-ink tracking-tight">{stat.value}</p>
                  </div>
                  <div className="h-9 w-9 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                    <stat.icon className="h-4 w-4" style={{ color: stat.color }} strokeWidth={2} />
                  </div>
                </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-1"
        >
          <GlassCard padding="lg" className="h-full">
            <h3 className="text-subhead font-bold text-ink mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    onClick={() => onNavigate(action.id)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-surface-secondary/60 transition-colors text-left group"
                  >
                    <div className="h-9 w-9 rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105" style={{ backgroundColor: `${action.color}12` }}>
                      <Icon className="h-4 w-4" style={{ color: action.color }} strokeWidth={1.5} />
                    </div>
                    <span className="text-subhead text-ink flex-1">{action.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-ink-quaternary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2"
        >
          <GlassCard padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subhead font-bold text-ink">Recent Activity</h3>
              <button
                onClick={() => onNavigate(activityNavMap[recentActivity[0]?.type] ?? "dashboard")}
                className="text-caption font-semibold text-brand-dark hover:text-brand transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-1">
              {recentActivity.length === 0 && (
                <p className="text-caption text-ink-quaternary py-4 text-center">No recent activity yet. Add contacts or transactions to see them here.</p>
              )}
              {recentActivity.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => onNavigate(activity.navigateTo)}
                  className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-surface-secondary/60 transition-colors text-left"
                >
                  <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead text-ink truncate">{activity.title}</p>
                    <p className="text-caption text-ink-quaternary flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {activity.time}
                    </p>
                  </div>
                  {activity.badge && (
                    <Badge variant={activity.badge === "New" ? "success" : activity.badge === "Payment" ? "brand" : "info"} size="sm">
                      {activity.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Ecosystem Overview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-subhead font-bold text-ink">BirichiNex Ecosystem</h3>
              <p className="text-caption text-ink-tertiary mt-0.5">Platform capabilities at a glance</p>
            </div>
            <Badge variant="brand" size="md">{contacts.length + inventoryItems.length} Items</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Marketplace", color: "#007AFF", count: "22 Categories", view: "marketplace" as BirichiNexView },
              { label: "CRM", color: "#5856D6", count: `${contacts.length} Contacts`, view: "crm" as BirichiNexView },
              { label: "Inventory", color: "#FF9500", count: `${inventoryItems.length} Items`, view: "inventory" as BirichiNexView },
              { label: "Finance", color: "#00C7BE", count: formatPrice(transactions.filter(t => t.type === "income" && t.status === "completed").reduce((s, t) => s + t.amount.amount, 0), selectedCurrency), view: "finance" as BirichiNexView },
              { label: "AI Assistant", color: "#FF6482", count: "Always On", view: "ai" as BirichiNexView },
              { label: "Learning", color: "#0A84FF", count: `${Object.keys(courseProgress).length} Courses`, view: "learning" as BirichiNexView },
            ].map((cap, i) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onNavigate(cap.view)}
                className="p-3 rounded-[14px] bg-surface-secondary/60 hover:bg-surface-secondary transition-colors text-center group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-[12px] mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${cap.color}12` }}>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cap.color }} />
                </div>
                <p className="text-caption font-bold text-ink">{cap.label}</p>
                <p className="text-[10px] text-ink-quaternary mt-0.5">{cap.count}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
    </CursorSpotlight>
  );
}
