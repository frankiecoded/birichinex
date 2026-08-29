import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingBag, Heart, ChevronDown, ArrowRight,
  X, Globe, User, Home, Sparkles, Tag, Package, Star
} from "lucide-react";
import { Currency } from "../../types";

const SHOP_CATEGORIES = [
  { id: "fashion", label: "Fashion", icon: "👗", subcategories: ["Men's Fashion", "Women's Fashion", "Kids", "Sportswear", "Leather", "Accessories"] },
  { id: "technology", label: "Technology", icon: "💻", subcategories: ["Laptops", "Smartphones", "Audio", "Accessories", "Refurbished"] },
];

interface FloatingPillNavProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  cartCount: number;
  userName?: string;
  isSubscribed: boolean;
  onToggleMode: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  loyaltyPoints?: number;
}

export default function FloatingPillNav({
  selectedCurrency,
  onCurrencyChange,
  cartCount,
  userName = "Guest",
  isSubscribed,
  onToggleMode,
  onNavigate,
  currentView,
  loyaltyPoints = 0,
}: FloatingPillNavProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setExpanded(false);
    setActiveCategory(null);
    setSearchFocused(false);
  }, [currentView]);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        pillRef.current && !pillRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [expanded]);

  const handleNavigate = useCallback((view: string) => {
    onNavigate(view);
    setExpanded(false);
    setActiveCategory(null);
  }, [onNavigate]);

  const toggleCategory = (id: string) => {
    if (activeCategory === id) {
      setActiveCategory(null);
      setDropdownPos(null);
    } else {
      const btn = btnRefs.current[id];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownPos({ top: rect.top, left: rect.left });
      }
      setActiveCategory(id);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "fashion", label: "Fashion", icon: Tag, hasSub: true },
    { id: "technology", label: "Tech", icon: Sparkles, hasSub: true },
    { id: "deals", label: "Deals", icon: Heart },
    { id: "orders", label: "Orders", icon: Package },
    { id: "cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.button
            ref={pillRef}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setExpanded(true)}
            className="fixed z-[999] left-1/2 -translate-x-1/2 cursor-pointer group"
            style={{ bottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-brand/20 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-600" />
              <div className="relative flex items-center gap-3 h-[54px] px-6 rounded-full
                bg-white/70 backdrop-blur-2xl saturate-150 brightness-110 dark:bg-glass dark:brightness-100
                border border-white/60 dark:border-glass-border
                shadow-[0_2px_16px_rgba(0,0,0,0.1),0_8px_40px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.3)]
                group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.14),0_12px_56px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.4)]
                transition-shadow duration-400"
              >
                <div className="h-9 w-9 rounded-[10px] bg-night flex items-center justify-center shrink-0 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <span className="text-white font-bold text-sm relative z-10">B</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-[15px] font-bold text-ink tracking-tight">BirichiNex</span>
                  <span className="text-brand text-[10px] font-bold ml-px">™</span>
                </div>
                <div className="ml-0.5 h-6 w-6 rounded-full bg-surface-secondary/70 flex items-center justify-center group-hover:bg-surface-secondary transition-colors duration-200">
                  <ChevronDown className="h-3.5 w-3.5 text-ink-quaternary rotate-180 group-hover:text-ink transition-colors" />
                </div>
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1.5 -right-1.5 h-[22px] min-w-[22px] px-1.5 rounded-full bg-brand text-[10px] font-bold text-ink flex items-center justify-center shadow-[0_1px_6px_rgba(212,175,55,0.5)]"
                  >
                    {cartCount}
                  </motion.div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.1) 100%)",
                  mixBlendMode: "screen"
                }}
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-scrim/20 backdrop-blur-sm z-[998]"
              onClick={() => { setExpanded(false); setActiveCategory(null); }}
            />

            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[999] left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] max-w-[800px]"
              style={{ bottom: "max(28px, env(safe-area-inset-bottom, 28px))" }}
            >
              <div className="
                rounded-[28px]
                bg-white/65 backdrop-blur-3xl saturate-[180%] brightness-[1.08] dark:bg-glass dark:brightness-100
                border border-white/50 dark:border-glass-border
                shadow-[0_8px_64px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.3)]
              ">
                <div className="flex items-center gap-4 px-6 pt-5 pb-4">
                  <button onClick={() => handleNavigate("home")} className="flex items-center gap-2.5 shrink-0 group">
                    <div className="h-10 w-10 rounded-[11px] bg-night flex items-center justify-center group-hover:scale-105 transition-transform relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                      <span className="text-white font-bold text-base relative z-10">B</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-[15px] font-bold text-ink tracking-tight">BirichiNex</span>
                      <span className="text-brand ml-0.5 text-[10px] font-bold align-top">™</span>
                    </div>
                  </button>

                  <div className={`flex-1 flex items-center gap-2.5 h-12 px-4 rounded-[14px] border transition-all duration-300 ${
                    searchFocused
                      ? "bg-white/80 border-brand/25 dark:bg-glass dark:border-brand/40 shadow-[0_0_0_3px_rgba(212,175,55,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
                      : "bg-white/40 border-white/40 dark:bg-glass/60 dark:border-glass-border"
                  }`}>
                    <Search className="h-[18px] w-[18px] text-ink-quaternary shrink-0" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-quaternary focus:outline-none"
                    />
                    {searchValue && (
                      <button onClick={() => setSearchValue("")} className="text-ink-quaternary hover:text-ink transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => { setExpanded(false); setActiveCategory(null); }}
                    className="h-12 w-12 rounded-[14px] bg-white/40 border border-white/40 dark:bg-glass/60 dark:border-glass-border flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-white/60 dark:hover:bg-glass/80 transition-all duration-200 shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.08] to-transparent" />

                <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 overflow-x-auto scrollbar-hide">
                  {navItems.map((item) => {
                    const isActive = currentView === item.id || currentView.startsWith(`${item.id}:`);
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="relative shrink-0">
                        <button
                          ref={(el) => { btnRefs.current[item.id] = el; }}
                          onClick={() => {
                            if (item.hasSub) {
                              toggleCategory(item.id);
                            } else {
                              handleNavigate(item.id);
                            }
                          }}
                          className={`relative flex items-center gap-2 h-12 px-4 rounded-[14px] text-[15px] font-semibold transition-all duration-200 shrink-0 ${
                            isActive
                              ? "bg-emphasis text-on-emphasis shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                              : "text-ink-secondary hover:text-ink hover:bg-white/50 dark:hover:bg-glass/60"
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                          <span>{item.label}</span>
                          {item.hasSub && (
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeCategory === item.id ? "rotate-180" : ""}`} />
                          )}
                          {item.badge ? (
                            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-brand text-[10px] font-bold text-ink flex items-center justify-center">
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.08] to-transparent" />

                <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-5">
                  <div className="flex items-center gap-1 bg-white/40 p-1 rounded-[12px] border border-white/40 dark:bg-glass/60 dark:border-glass-border">
                    {(["KES", "TZS", "UGX", "USD"] as Currency[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => onCurrencyChange(curr)}
                        className={`px-3 py-1.5 rounded-[9px] text-[11px] font-bold tracking-wider transition-all duration-200 ${
                          selectedCurrency === curr
                            ? "bg-emphasis text-on-emphasis shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                            : "text-ink-tertiary hover:text-ink hover:bg-white/50 dark:hover:bg-glass/60"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWishlisted(!wishlisted)}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className={`relative h-11 w-11 rounded-[12px] border flex items-center justify-center transition-all duration-200 ${
                        wishlisted
                          ? "bg-brand/15 border-brand/40 text-brand"
                          : "bg-white/40 border-white/40 dark:bg-glass/60 dark:border-glass-border text-ink-secondary hover:text-ink hover:bg-white/60 dark:hover:bg-glass/80"
                      }`}
                    >
                      <Heart className={`h-[18px] w-[18px] ${wishlisted ? "fill-brand" : ""}`} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleNavigate("account")}
                      className="relative h-11 w-11 rounded-[12px] bg-emphasis flex items-center justify-center text-on-emphasis text-subhead font-bold hover:bg-emphasis/90 transition-colors overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                      <span className="relative z-10">{userName.charAt(0).toUpperCase()}</span>
                    </button>
                    {loyaltyPoints > 0 && (
                      <button
                        onClick={() => handleNavigate("account")}
                        className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-brand/10 border border-brand/20 hover:bg-brand/15 transition-colors"
                      >
                        <Star className="h-3 w-3 text-brand-dark" fill="currentColor" />
                        <span className="text-[11px] font-bold text-brand-dark">{loyaltyPoints.toLocaleString()}</span>
                      </button>
                    )}
                    {isSubscribed && (
                      <button
                        onClick={() => { onToggleMode(); setExpanded(false); }}
                        className="flex items-center gap-1.5 h-11 px-4 rounded-[12px] bg-brand/10 text-brand-dark text-[15px] font-semibold hover:bg-brand/20 transition-all duration-200 border border-brand/20 hover:border-brand/30"
                      >
                        <Globe className="h-4 w-4" strokeWidth={1.5} />
                        <span className="hidden sm:inline">Business</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          CATEGORY DROPDOWN — Fixed position, outside panel
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {expanded && activeCategory && dropdownPos && (
          <>
            <div
              className="fixed inset-0 z-[1000]"
              onClick={() => { setActiveCategory(null); setDropdownPos(null); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[1001] w-60 rounded-[20px]
                bg-white/80 backdrop-blur-3xl saturate-[180%] dark:bg-glass
                border border-white/50 dark:border-glass-border
                shadow-[0_12px_48px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]
                p-2"
              style={{ bottom: `${window.innerHeight - dropdownPos.top + 8}px`, left: `${Math.min(dropdownPos.left, window.innerWidth - 260)}px` }}
            >
              {SHOP_CATEGORIES.find(c => c.id === activeCategory)?.subcategories.map((sub, i) => (
                <motion.button
                  key={sub}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  onClick={() => handleNavigate(`category:${activeCategory}:${sub}`)}
                  className="w-full text-left px-3.5 py-2.5 rounded-[12px] text-[15px] text-ink-secondary hover:bg-white/60 dark:hover:bg-glass/80 hover:text-ink transition-all duration-150 group flex items-center justify-between"
                >
                  {sub}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
              <div className="mx-1 my-1 h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.08] to-transparent" />
              <button
                onClick={() => handleNavigate(`category:${activeCategory}`)}
                className="w-full text-left px-3.5 py-2.5 rounded-[12px] text-[15px] text-brand-dark font-semibold hover:bg-brand/8 transition-all duration-150 flex items-center gap-2"
              >
                View All {SHOP_CATEGORIES.find(c => c.id === activeCategory)?.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
