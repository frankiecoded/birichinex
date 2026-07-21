import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Store, Users, Package, ShoppingCart, Truck,
  CreditCard, TrendingUp, FileText, Sparkles, BarChart3, Zap,
  Rocket, GraduationCap, UserPlus, Globe, Shield, MessageSquare,
  Plug, Play, Settings, ChevronLeft, ChevronRight, Menu, X,
  Search, Bell, ShoppingBag, ArrowUpRight, Send, Award, User
} from "lucide-react";
import { BirichiNexView, Currency } from "../../types";

const CAPABILITY_ICONS: Record<string, any> = {
  dashboard: LayoutDashboard,
  marketplace: Store,
  crm: Users,
  inventory: Package,
  procurement: ShoppingCart,
  logistics: Truck,
  payments: CreditCard,
  finance: TrendingUp,
  documents: FileText,
  ai: Sparkles,
  analytics: BarChart3,
  automation: Zap,
  "entrepreneur-hub": Rocket,
  learning: GraduationCap,
  recruitment: UserPlus,
  community: Globe,
  "identity-access": Shield,
  collaboration: MessageSquare,
  integrations: Plug,
  media: Play,
  settings: Settings,
  membership: Shield,
  dropshipping: Send,
  loyalty: Award,
  profile: User,
  "ai-advisor": Sparkles,
};

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard" as BirichiNexView, label: "Dashboard" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "marketplace" as BirichiNexView, label: "Marketplace" },
      { id: "dropshipping" as BirichiNexView, label: "Dropshipping" },
      { id: "inventory" as BirichiNexView, label: "Inventory" },
      { id: "procurement" as BirichiNexView, label: "Procurement" },
      { id: "logistics" as BirichiNexView, label: "Logistics" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "crm" as BirichiNexView, label: "CRM" },
      { id: "payments" as BirichiNexView, label: "Payments" },
      { id: "finance" as BirichiNexView, label: "Finance" },
      { id: "documents" as BirichiNexView, label: "Documents" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "ai" as BirichiNexView, label: "AI Assistant" },
      { id: "analytics" as BirichiNexView, label: "Analytics" },
      { id: "automation" as BirichiNexView, label: "Automation" },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "entrepreneur-hub" as BirichiNexView, label: "Entrepreneur Hub" },
      { id: "learning" as BirichiNexView, label: "Learning Academy" },
      { id: "loyalty" as BirichiNexView, label: "Loyalty Points" },
      { id: "community" as BirichiNexView, label: "Community" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "ai-advisor" as BirichiNexView, label: "AI Advisor" },
      { id: "profile" as BirichiNexView, label: "Profile" },
      { id: "settings" as BirichiNexView, label: "Settings" },
      { id: "membership" as BirichiNexView, label: "Membership" },
    ],
  },
];

interface NavigationShellProps {
  currentView: BirichiNexView;
  onNavigate: (view: BirichiNexView) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onToggleMode: () => void;
  userName?: string;
  cartCount?: number;
  onOpenCart?: () => void;
  children: React.ReactNode;
}

export default function NavigationShell({
  currentView,
  onNavigate,
  selectedCurrency,
  onCurrencyChange,
  onToggleMode,
  userName = "Frank",
  cartCount = 0,
  onOpenCart,
  children,
}: NavigationShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      {/* Ambient Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb-gold -top-40 -right-40 opacity-60" />
        <div className="ambient-orb-blue top-1/3 -left-32 opacity-40" />
        <div className="ambient-orb-green bottom-20 right-1/4 opacity-30" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30"
      >
        <div className="glass-sidebar h-full rounded-r-[20px] overflow-hidden flex flex-col">
          {/* Logo */}
          <div className="h-14 flex items-center px-4">
            <motion.div
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
              onClick={() => onNavigate("dashboard")}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-8 w-8 rounded-[10px] bg-ink flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-subhead font-bold text-ink tracking-tight">BirichiNex</span>
                    <span className="text-subhead font-bold text-brand ml-0.5">OS</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="glass-divider mx-3" />

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-3">
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-overline text-ink-quaternary px-3 mb-1.5"
                    >
                      {section.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = CAPABILITY_ICONS[item.id] || LayoutDashboard;
                    const isActive = currentView === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`
                          w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px]
                          text-subhead transition-all duration-200
                          ${isActive
                            ? "bg-ink text-white"
                            : "text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink"
                          }
                          ${collapsed ? "justify-center" : ""}
                        `}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="glass-divider mx-3" />

          {/* Sidebar Footer */}
          <div className="p-2 space-y-1">
            {/* Back to Shop */}
            <motion.button
              onClick={onToggleMode}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-subhead font-semibold bg-brand/10 text-brand-dark hover:bg-brand/20 border border-brand/15 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && (
                <span className="flex items-center gap-1">
                  Shop
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </span>
              )}
            </motion.button>
            <motion.button
              onClick={() => onNavigate("settings")}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-subhead text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink transition-colors ${collapsed ? "justify-center" : ""}`}
            >
              <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>Settings</span>}
            </motion.button>
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-subhead text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink transition-colors ${collapsed ? "justify-center" : ""}`}
            >
              {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
              {!collapsed && <span>Collapse</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink/40 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[min(280px,85vw)] glass-sidebar z-50 lg:hidden flex flex-col rounded-r-[20px]"
            >
              <div className="h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-[10px] bg-ink flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="text-subhead font-bold text-ink tracking-tight">BirichiNex<span className="text-brand ml-0.5">OS</span></span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-11 w-11 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="glass-divider mx-3" />

              <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.label} className="mb-3">
                    <p className="text-overline text-ink-quaternary px-3 mb-1.5">{section.label}</p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = CAPABILITY_ICONS[item.id] || LayoutDashboard;
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-subhead transition-colors ${isActive ? "bg-ink text-white" : "text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink"}`}
                          >
                            <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Mobile sidebar footer */}
              <div className="p-3 border-t border-glass-border/30">
                <button
                  onClick={onToggleMode}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-[12px] bg-brand/10 text-brand-dark text-subhead font-semibold hover:bg-brand/20 transition-all duration-200 border border-brand/15"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                  Back to Shop
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 lg:transition-[margin] lg:duration-300 ${collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"}`}
      >
        {/* Top Bar - Liquid Glass */}
        <header
          className={`
            sticky top-0 z-20 h-14 flex items-center justify-between px-4 lg:px-6
            transition-all duration-300
            ${scrolled
              ? "glass-material-lg border-b border-glass-border"
              : "glass-material border-b border-glass-border"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 h-11 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border max-w-[256px] w-full transition-all focus-within:border-brand/30 focus-within:bg-surface/80">
              <Search className="h-3.5 w-3.5 text-ink-quaternary" />
              <input
                type="text"
                placeholder="Search capabilities..."
                className="flex-1 bg-transparent text-subhead text-ink placeholder:text-ink-quaternary focus:outline-none"
              />
              <kbd className="text-[10px] text-ink-quaternary bg-surface-tertiary/80 px-1.5 py-0.5 rounded font-mono">&#8984;K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="hidden sm:flex items-center bg-surface-secondary/60 backdrop-blur-sm p-0.5 rounded-[10px] border border-glass-border">
              {(["TZS", "KES", "UGX", "USD"] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2 py-1 rounded-[8px] text-[10px] font-bold tracking-wider transition-all duration-200 ${
                    selectedCurrency === curr
                      ? "bg-ink text-white"
                      : "text-ink-tertiary hover:text-ink"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {onOpenCart && (
              <motion.button
                onClick={onOpenCart}
                whileTap={{ scale: 0.93 }}
                className="relative h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary border border-glass-border hover:text-ink transition-colors"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-brand text-[9px] font-bold text-ink flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.93 }}
              className="relative h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary border border-glass-border hover:text-ink transition-colors"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-error" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onNavigate("profile")}
              className="h-11 w-11 rounded-[10px] bg-ink flex items-center justify-center text-white text-caption font-bold hover:bg-ink/85 transition-colors cursor-pointer"
              title="My Profile"
            >
              {userName.charAt(0).toUpperCase()}
            </motion.button>

            {/* Back to Shop — Top Bar */}
            <motion.button
              onClick={onToggleMode}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-1.5 h-11 px-3.5 rounded-[10px] bg-brand/10 text-brand-dark text-subhead font-semibold hover:bg-brand/20 transition-all duration-200 border border-brand/15 hover:border-brand/25"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
              Shop
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
