import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Menu, X, Search, Bell, ShoppingBag,
  ArrowUpRight, Check, Sparkles, Settings,
} from "lucide-react";
import { BirichiNexView, Currency } from "../../types";
import { useStore } from "../../store/useStore";
import { NAV_GROUPS, NAV_ITEMS, getNavItem, getGroupForView, getGroupHint, getGroupLabel, getHubForView, getHubTitle } from "../../../ai/src/navigation";
import AICopilot from "../ai/AICopilot";
import GuideTour from "../ai/GuideTour";
import CommandPalette from "../ai/CommandPalette";
import UpgradeReminder from "./UpgradeReminder";

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
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useStore((s) => s.notifications);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const setCopilotOpen = useStore((s) => s.setCopilotOpen);
  const setCommandOpen = useStore((s) => s.setCommandOpen);
  const activeHubTab = useStore((s) => s.activeHubTab);
  const guideCompleted = useStore((s) => s.guideCompleted);
  const startGuide = useStore((s) => s.startGuide);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const hubTitle = getHubTitle(currentView, activeHubTab);
  const currentGroup = getGroupForView(currentView);
  const currentGroupHint = getGroupHint(currentGroup);
  const activeHubMap = getHubForView(currentView);
  const ActiveHubIcon = activeHubMap ? getNavItem(activeHubMap.view)?.icon : null;

  const isItemActive = (view: BirichiNexView) => currentView === view || getHubForView(currentView)?.view === view;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  // Lock the page while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const root = document.querySelector("main");
      const prev = root?.style.overflow ?? "";
      if (root) root.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        if (root) root.style.overflow = prev;
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!guideCompleted) {
      const t = setTimeout(() => startGuide(), 650);
      return () => clearTimeout(t);
    }
  }, [guideCompleted, startGuide]);

  const renderNavItem = (view: BirichiNexView, label: string, Icon: any, active: boolean, collapsedMode: boolean) => (
    <motion.button
      key={view}
      onClick={() => onNavigate(view)}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full flex items-center gap-2.5 px-3 h-10 rounded-[13px]
        text-subhead transition-colors duration-200
        ${active ? "text-white" : "text-ink-secondary hover:bg-surface-secondary/70 hover:text-ink"}
        ${collapsedMode ? "justify-center" : ""}
      `}
      title={collapsedMode ? label : undefined}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-[13px] nav-pill-active"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <Icon
        className={`relative z-10 h-[18px] w-[18px] shrink-0 ${active ? "drop-shadow" : ""}`}
        strokeWidth={active ? 2.2 : 1.6}
      />
      <AnimatePresence mode="wait">
        {!collapsedMode && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 overflow-hidden whitespace-nowrap font-semibold"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

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
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30 p-3"
      >
        <div className="glass-sidebar h-full rounded-[28px] overflow-hidden flex flex-col">
          {/* Logo */}
          <div className="h-[68px] flex items-center px-4">
            <motion.div
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
              onClick={() => onNavigate("dashboard")}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                whileHover={{ rotate: -6, scale: 1.05 }}
                className="h-9 w-9 rounded-[12px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(212,175,55,0.45)]"
              >
                <span className="text-white font-bold text-[15px] tracking-tight drop-shadow-sm">B</span>
              </motion.div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-[15px] font-bold text-ink tracking-tight">BirichiNex</span>
                    <span className="text-[15px] font-bold text-gradient-brand ml-0.5">OS</span>
                    <span className="block text-[10px] text-ink-quaternary font-medium tracking-wide mt-0.5">
                      Your business, simplified
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="glass-divider mx-4" />

          {/* Navigation Items */}
          <nav id="guide-nav" className="flex-1 overflow-y-auto py-4 px-2.5 scrollbar-hide">
            {NAV_GROUPS.map((group) => {
              const items = NAV_ITEMS.filter((i) => i.group === group.id);
              if (items.length === 0) return null;
              return (
                <div key={group.id} className="mb-4">
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5 px-3 mb-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#f3e5ab] to-[#aa7c11]" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-quaternary">
                          {group.label}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-1">
                    {items.map((item) =>
                      renderNavItem(item.view, item.label, item.icon, isItemActive(item.view), collapsed),
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="glass-divider mx-4" />

          {/* Sidebar Footer */}
          <div className="p-2.5 space-y-1">
            <motion.button
              onClick={onToggleMode}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[11px] text-subhead font-semibold bg-brand/10 text-brand-dark hover:bg-brand/20 border border-brand/15 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
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
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[11px] text-subhead text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink transition-colors ${collapsed ? "justify-center" : ""}`}
            >
              <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>Settings</span>}
            </motion.button>
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[11px] text-subhead text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink transition-colors ${collapsed ? "justify-center" : ""}`}
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
              className="fixed inset-0 bg-scrim backdrop-blur-md z-40 lg:hidden"
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
                  <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center shadow-[0_4px_12px_rgba(212,175,55,0.4)]">
                    <span className="text-white font-bold text-sm drop-shadow-sm">B</span>
                  </div>
                  <span className="text-subhead font-bold text-ink tracking-tight">BirichiNex<span className="text-gradient-brand ml-0.5">OS</span></span>
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
                {NAV_GROUPS.map((group) => {
                  const items = NAV_ITEMS.filter((i) => i.group === group.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.id} className="mb-3">
                      <p className="text-overline text-ink-quaternary px-3 mb-1.5">{group.label}</p>
                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <button
                            key={item.view}
                            onClick={() => onNavigate(item.view)}
                            className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[11px] text-subhead transition-colors ${isItemActive(item.view) ? "bg-emphasis text-on-emphasis" : "text-ink-secondary hover:bg-surface-secondary/60 hover:text-ink"}`}
                          >
                            <item.icon className="h-4 w-4 shrink-0" strokeWidth={isItemActive(item.view) ? 2 : 1.5} />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>

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
        className={`flex-1 flex flex-col min-w-0 lg:transition-[margin] lg:duration-300 ${collapsed ? "lg:ml-[92px]" : "lg:ml-[264px]"}`}
      >
        {/* Top Bar - Liquid Glass */}
        <header
          className={`
            sticky top-0 z-20 h-14 flex items-center justify-between px-4 lg:px-6 gap-3
            transition-all duration-300
            ${scrolled ? "glass-material-lg border-b border-glass-border" : "glass-material border-b border-glass-border"}
          `}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5 min-w-0">
              {ActiveHubIcon && (
                <motion.div
                  key={`top-${currentView}-${activeHubTab ?? "root"}`}
                  initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-9 w-9 rounded-[12px] glass-material flex items-center justify-center shrink-0"
                >
                  <ActiveHubIcon className="h-4 w-4 text-brand-dark" strokeWidth={2} />
                </motion.div>
              )}
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-ink leading-tight truncate">{hubTitle.title}</p>
                <p className="text-[10px] text-ink-tertiary leading-tight truncate">
                  {getGroupLabel(currentGroup)} · {currentGroupHint}
                </p>
              </div>
            </div>
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 px-3 bg-surface-secondary/70 backdrop-blur-sm rounded-[11px] border border-glass-border text-ink-tertiary hover:text-ink hover:border-brand/30 transition-all w-[200px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left text-caption truncate">Jump to anything…</span>
              <kbd className="text-[10px] text-ink-quaternary bg-surface-tertiary/80 px-1.5 py-0.5 rounded font-mono shrink-0">&#8984;K</kbd>
            </button>
            <button
              onClick={() => setCommandOpen(true)}
              className="md:hidden h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary border border-glass-border hover:text-ink transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="hidden sm:flex items-center bg-surface-secondary/60 backdrop-blur-sm p-0.5 rounded-[10px] border border-glass-border">
              {(["KES", "TZS", "UGX", "USD"] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2 py-1 rounded-[8px] text-[10px] font-bold tracking-wider transition-all duration-200 ${
                    selectedCurrency === curr ? "bg-emphasis text-on-emphasis" : "text-ink-tertiary hover:text-ink"
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

            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                onClick={() => setNotifOpen((o) => !o)}
                whileTap={{ scale: 0.93 }}
                className="relative h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary border border-glass-border hover:text-ink transition-colors"
              >
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-2rem))] glass-sheet rounded-[16px] border border-glass-border overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
                        <p className="text-subhead font-bold text-ink">Notifications</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="flex items-center gap-1 text-[11px] font-semibold text-brand-dark hover:text-brand px-2 py-1 rounded-[8px] hover:bg-brand/10 transition-colors"
                          >
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                        {recentNotifications.length === 0 ? (
                          <div className="px-4 py-10 text-center">
                            <p className="text-caption text-ink-quaternary">No notifications yet</p>
                          </div>
                        ) : (
                          recentNotifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.actionView) onNavigate(n.actionView);
                                setNotifOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 border-b border-glass-border last:border-b-0 transition-colors hover:bg-surface-secondary/60 ${n.read ? "opacity-70" : ""}`}
                            >
                              <div className="flex items-start gap-2.5">
                                {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand shrink-0" />}
                                <div className="min-w-0">
                                  <p className="text-subhead font-semibold text-ink leading-snug">{n.title}</p>
                                  <p className="text-caption text-ink-tertiary mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                                  <p className="text-[10px] text-ink-quaternary mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* AI Copilot Quick Access */}
            <motion.button
              onClick={() => setCopilotOpen(true)}
              whileTap={{ scale: 0.93 }}
              className="relative h-11 w-11 rounded-[10px] bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center border border-glass-border hover:border-brand/40 transition-colors"
              title="Ask the AI copilot"
            >
              <span className="absolute inset-0 rounded-[10px] copilot-orb opacity-90" />
              <span className="relative flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white drop-shadow" strokeWidth={2.2} />
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onNavigate("profile")}
              className="h-11 w-11 rounded-[10px] bg-emphasis flex items-center justify-center text-on-emphasis text-caption font-bold hover:bg-emphasis/85 transition-colors cursor-pointer"
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

      {/* AI layer — available everywhere in the dashboard */}
      <AICopilot onNavigate={onNavigate} />
      <GuideTour />
      <CommandPalette onNavigate={onNavigate} />
      <UpgradeReminder onNavigate={onNavigate} />
    </div>
  );
}
