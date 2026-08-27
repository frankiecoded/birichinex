import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Zap,
  Package,
  Tag,
  TrendingDown,
  ArrowRight,
  ShoppingCart,
  Mail,
  Bell,
  Filter,
  Star,
  Flame,
  Gift,
  Percent,
  ChevronRight,
  Timer,
  AlertCircle,
  Check,
  X,
  Eye,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { PRODUCTS, TECH_PRODUCTS, formatPrice } from "../data/platform";
import { SEED_DEALS, Deal } from "../data/delivery";
import type { Product, Currency } from "../types";

interface DealsPageProps {
  onNavigate?: (view: string) => void;
}

const DEAL_FILTERS = [
  { id: "all", label: "All Deals", icon: Tag },
  { id: "flash", label: "Flash Sales", icon: Zap },
  { id: "daily", label: "Daily Deals", icon: Clock },
  { id: "bundle", label: "Bundle Deals", icon: Gift },
  { id: "seasonal", label: "Seasonal", icon: Star },
  { id: "clearance", label: "Clearance", icon: TrendingDown },
] as const;

const TAG_CONFIG: Record<
  Deal["tag"],
  { label: string; color: string; bgClass: string; icon: typeof Zap }
> = {
  flash: { label: "Flash", color: "#FF453A", bgClass: "bg-error/10 text-error", icon: Zap },
  daily: { label: "Daily", color: "#007AFF", bgClass: "bg-info/10 text-info", icon: Clock },
  bundle: { label: "Bundle", color: "#AF52DE", bgClass: "bg-[#AF52DE]/10 text-[#AF52DE]", icon: Gift },
  seasonal: { label: "Seasonal", color: "#FF9500", bgClass: "bg-warning/10 text-warning", icon: Star },
  clearance: { label: "Clearance", color: "#30D158", bgClass: "bg-success/10 text-success", icon: TrendingDown },
};

function findProduct(deal: Deal): Product | undefined {
  if (deal.productId) {
    return (
      PRODUCTS.find((p) => p.id === deal.productId) ||
      TECH_PRODUCTS.find((p) => p.id === deal.productId)
    );
  }
  return undefined;
}

function buildProductForDeal(deal: Deal): Product {
  const existing = findProduct(deal);
  if (existing) {
    return {
      ...existing,
      price: { amount: deal.dealPrice, currency: deal.currency as Currency },
      stock: Math.min(existing.stock, deal.maxClaims - deal.claimedCount),
    };
  }
  return {
    id: deal.id,
    name: deal.title,
    description: deal.description,
    category: deal.category,
    price: { amount: deal.dealPrice, currency: deal.currency as Currency },
    images: [],
    supplier: {
      id: "sup-birichi",
      name: "BirichiNex",
      verified: true,
      rating: 4.9,
      location: "East Africa",
    },
    grade: "A+",
    origin: "East Africa",
    specifications: {},
    stock: deal.maxClaims - deal.claimedCount,
    minOrder: 1,
    createdAt: new Date().toISOString(),
  };
}

// ─── Countdown Hook ─────────────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const end = new Date(targetDate).getTime();
      const diff = Math.max(0, end - now);
      if (diff === 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// ─── Countdown Display ──────────────────────────────────────────────────────

function CountdownTimer({
  targetDate,
  compact = false,
}: {
  targetDate: string;
  compact?: boolean;
}) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <span className="text-error font-semibold text-[13px]">
        Expired
      </span>
    );
  }

  const segments = [
    { value: days, label: "D" },
    { value: hours, label: "H" },
    { value: minutes, label: "M" },
    { value: seconds, label: "S" },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {segments.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-center justify-center w-[28px] h-[22px] rounded-[6px] bg-ink/8 text-[11px] font-bold tabular-nums text-ink"
          >
            {String(s.value).padStart(2, "0")}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {segments.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-[44px] h-[40px] rounded-[10px] bg-ink/5 backdrop-blur-sm text-[18px] font-bold tabular-nums text-ink">
              {String(s.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold text-ink-tertiary mt-0.5 uppercase tracking-wider">
              {s.label}
            </span>
          </div>
          {i < segments.length - 1 && (
            <span className="text-ink-quaternary font-bold text-[16px] mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function ClaimProgress({
  claimed,
  max,
}: {
  claimed: number;
  max: number;
}) {
  const pct = Math.min(100, (claimed / max) * 100);
  const isHigh = pct >= 75;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-ink-tertiary font-medium">
          {claimed} claimed
        </span>
        <span className="text-[11px] text-ink-tertiary font-medium">
          {max - claimed} left
        </span>
      </div>
      <div className="w-full h-[5px] rounded-full bg-ink/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className={`h-full rounded-full ${
            isHigh
              ? "bg-gradient-to-r from-[#FF453A] to-[#FF9500]"
              : "bg-gradient-to-r from-[#007AFF] to-[#5856D6]"
          }`}
        />
      </div>
      {isHigh && (
        <div className="flex items-center gap-1 mt-1">
          <Flame className="w-3 h-3 text-error" />
          <span className="text-[10px] font-semibold text-error">
            Selling fast!
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────

function Toast({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] glass-material rounded-[14px] px-5 py-3 flex items-center gap-3 shadow-lg border border-glass-border"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success/10">
            <Check className="w-4 h-4 text-success" />
          </div>
          <span className="text-[14px] font-medium text-ink">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-ink-tertiary hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Deal Card ──────────────────────────────────────────────────────────────

function DealCard({
  deal,
  selectedCurrency,
  onAddToCart,
  onNavigate,
  index,
}: {
  deal: Deal;
  selectedCurrency: Currency;
  onAddToCart: (product: Product) => void;
  onNavigate?: (view: string) => void;
  index: number;
}) {
  const [added, setAdded] = useState(false);
  const tagCfg = TAG_CONFIG[deal.tag];
  const TagIcon = tagCfg.icon;
  const savings = deal.originalPrice - deal.dealPrice;
  const showCountdown = deal.tag === "flash" || deal.tag === "daily";

  const handleGrab = useCallback(() => {
    const product = buildProductForDeal(deal);
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [deal, onAddToCart]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    >
      <TiltCard className="h-full" onClick={() => (deal.productId ? onNavigate?.(`product:${deal.productId}`) : handleGrab())}>
        <div className="glass-material rounded-[16px] border border-glass-border overflow-hidden h-full flex flex-col">
          {/* Image + Badge */}
          <div className="relative h-[160px] bg-gradient-to-br from-surface-secondary/60 to-surface-secondary/30 flex items-center justify-center overflow-hidden">
            <span className="text-[56px] select-none">{deal.image}</span>

            {/* Discount Badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 bg-error/90 backdrop-blur-sm text-white text-[12px] font-bold px-2.5 py-1 rounded-full">
                <Percent className="w-3 h-3" />
                {deal.discount}% OFF
              </div>
            </div>

            {/* Tag Badge */}
            <div className="absolute top-3 right-3">
              <div
                className={`flex items-center gap-1 ${tagCfg.bgClass} backdrop-blur-sm text-[11px] font-semibold px-2 py-1 rounded-full`}
              >
                <TagIcon className="w-3 h-3" />
                {tagCfg.label}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1 gap-3">
            {/* Title */}
            <h3 className="text-[15px] font-semibold text-ink leading-snug line-clamp-2 min-h-[40px]">
              {deal.title}
            </h3>

            {/* Price Section */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[20px] font-bold text-ink">
                  {formatPrice(deal.dealPrice, selectedCurrency, deal.currency as Currency)}
                </span>
                <span className="text-[13px] text-ink-tertiary line-through">
                  {formatPrice(deal.originalPrice, selectedCurrency, deal.currency as Currency)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-semibold text-success">
                  Save {formatPrice(savings, selectedCurrency, deal.currency as Currency)}
                </span>
              </div>
            </div>

            {/* Countdown for flash / daily */}
            {showCountdown && (
              <div className="flex items-center gap-2 bg-surface-secondary/40 rounded-[10px] px-3 py-2">
                <Timer className="w-3.5 h-3.5 text-ink-tertiary" />
                <span className="text-[11px] font-medium text-ink-tertiary mr-auto">Ends in</span>
                <CountdownTimer targetDate={deal.endsAt} compact />
              </div>
            )}

            {/* Progress */}
            <ClaimProgress claimed={deal.claimedCount} max={deal.maxClaims} />

            {/* Grab Button */}
            <MagneticButton className="mt-auto">
              <Button
                variant={added ? "brand" : "primary"}
                fullWidth
                size="md"
                icon={added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGrab();
                }}
              >
                {added ? "Added!" : "Grab Deal"}
              </Button>
            </MagneticButton>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─── Featured Deal Card (larger) ────────────────────────────────────────────

function FeaturedDealCard({
  deal,
  selectedCurrency,
  onAddToCart,
  onNavigate,
  rank,
}: {
  deal: Deal;
  selectedCurrency: Currency;
  onAddToCart: (product: Product) => void;
  onNavigate?: (view: string) => void;
  rank: number;
}) {
  const [added, setAdded] = useState(false);
  const tagCfg = TAG_CONFIG[deal.tag];
  const TagIcon = tagCfg.icon;
  const savings = deal.originalPrice - deal.dealPrice;

  const handleGrab = useCallback(() => {
    const product = buildProductForDeal(deal);
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [deal, onAddToCart]);

  const rankLabels = ["#1 Best Deal", "#2 Hot Deal", "#3 Top Pick"];
  const rankColors = ["from-[#FFD700] to-[#FFA500]", "from-[#C0C0C0] to-[#A0A0A0]", "from-[#CD7F32] to-[#8B4513]"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: rank * 0.12 }}
    >
      <TiltCard className="h-full" onClick={() => (deal.productId ? onNavigate?.(`product:${deal.productId}`) : handleGrab())}>
        <div className="glass-material-lg rounded-[20px] border border-glass-border overflow-hidden h-full flex flex-col relative">
          {/* Rank Badge */}
          <div className="absolute top-4 left-4 z-20">
            <div
              className={`flex items-center gap-1.5 bg-gradient-to-r ${rankColors[rank]} text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow-md`}
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              {rankLabels[rank]}
            </div>
          </div>

          {/* Image Area */}
          <div className="relative h-[200px] bg-gradient-to-br from-surface-secondary/80 to-surface-secondary/40 flex items-center justify-center overflow-hidden">
            <motion.span
              className="text-[80px] select-none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {deal.image}
            </motion.span>

            {/* Discount */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-error text-white text-[14px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                <Percent className="w-3.5 h-3.5" />
                {deal.discount}% OFF
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1 gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 ${tagCfg.bgClass} text-[11px] font-semibold px-2 py-0.5 rounded-full`}
              >
                <TagIcon className="w-3 h-3" />
                {tagCfg.label}
              </div>
              {deal.tag === "flash" && (
                <Badge variant="error" size="sm" dot>
                  Limited
                </Badge>
              )}
            </div>

            <h3 className="text-[17px] font-bold text-ink leading-snug">
              {deal.title}
            </h3>
            <p className="text-[13px] text-ink-secondary leading-relaxed line-clamp-2">
              {deal.description}
            </p>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-[26px] font-bold text-ink leading-none">
                {formatPrice(deal.dealPrice, selectedCurrency, deal.currency as Currency)}
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] text-ink-tertiary line-through">
                  {formatPrice(deal.originalPrice, selectedCurrency, deal.currency as Currency)}
                </span>
                <span className="text-[12px] font-semibold text-success">
                  Save {formatPrice(savings, selectedCurrency, deal.currency as Currency)}
                </span>
              </div>
            </div>

            <ClaimProgress claimed={deal.claimedCount} max={deal.maxClaims} />

            <MagneticButton className="mt-auto">
              <Button
                variant={added ? "brand" : "primary"}
                fullWidth
                size="lg"
                icon={added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGrab();
                }}
              >
                {added ? "Added to Cart!" : "Grab This Deal"}
              </Button>
            </MagneticButton>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─── Bundle Deal Card ───────────────────────────────────────────────────────

function BundleDealCard({
  deal,
  selectedCurrency,
  onAddToCart,
}: {
  deal: Deal;
  selectedCurrency: Currency;
  onAddToCart: (product: Product) => void;
}) {
  const [added, setAdded] = useState(false);
  const savings = deal.originalPrice - deal.dealPrice;

  const handleGrab = useCallback(() => {
    const product = buildProductForDeal(deal);
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [deal, onAddToCart]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard variant="elevated" hover className="h-full">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Left: Items Preview */}
          <div className="flex items-center justify-center w-full sm:w-[140px] h-[120px] sm:h-auto rounded-[14px] bg-gradient-to-br from-[#AF52DE]/8 to-[#AF52DE]/3 flex-shrink-0 relative overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="text-[40px]">{deal.image}</span>
              <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-[#AF52DE]/10 text-[#AF52DE]">
                <span className="text-[10px] font-bold">+</span>
              </div>
              <span className="text-[32px] opacity-60">📦</span>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="info" size="sm">
                Bundle
              </Badge>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-ink leading-snug">
              {deal.title}
            </h3>
            <p className="text-[13px] text-ink-secondary leading-relaxed">
              {deal.description}
            </p>

            <div className="flex items-end gap-3">
              <span className="text-[22px] font-bold text-ink">
                {formatPrice(deal.dealPrice, selectedCurrency, deal.currency as Currency)}
              </span>
              <span className="text-[14px] text-ink-tertiary line-through">
                {formatPrice(deal.originalPrice, selectedCurrency, deal.currency as Currency)}
              </span>
              <div className="flex items-center gap-1 bg-success/10 text-success text-[12px] font-bold px-2 py-0.5 rounded-full ml-auto">
                <TrendingDown className="w-3 h-3" />
                {deal.discount}% OFF
              </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-ink-tertiary">
              <Gift className="w-3.5 h-3.5" />
              <span>You save {formatPrice(savings, selectedCurrency, deal.currency as Currency)} on this bundle</span>
            </div>

            <ClaimProgress claimed={deal.claimedCount} max={deal.maxClaims} />

            <Button
              variant={added ? "brand" : "primary"}
              size="md"
              icon={added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              onClick={handleGrab}
              className="self-start"
            >
              {added ? "Added!" : "Grab Bundle"}
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Subscribe Section ──────────────────────────────────────────────────────

function DealAlertSubscribe() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard variant="brand" padding="xl" className="text-center">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand/10">
            <Bell className="w-7 h-7 text-brand-dark" />
          </div>
          <h3 className="text-[20px] font-bold text-ink">Never Miss a Deal</h3>
          <p className="text-[14px] text-ink-secondary leading-relaxed">
            Get notified about flash sales, exclusive bundles, and limited-time offers before anyone else.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-success/10 text-success text-[14px] font-semibold px-5 py-3 rounded-full"
              >
                <Check className="w-5 h-5" />
                You're subscribed! We'll notify you of new deals.
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <div className="flex-1 relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    className="w-full h-12 pl-10 pr-4 rounded-[12px] bg-surface-secondary/60 border border-glass-border text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all"
                  />
                </div>
                <MagneticButton>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Bell className="w-4 h-4" />}
                    onClick={handleSubscribe}
                    disabled={!email.trim()}
                  >
                    Subscribe
                  </Button>
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Main Deals Page ────────────────────────────────────────────────────────

export default function DealsPage({ onNavigate }: DealsPageProps) {
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const addToCart = useStore((s) => s.addToCart);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showDealsToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  // Close toast handler
  const closeToast = useCallback(() => setToastVisible(false), []);

  // Wrapped addToCart to show toast
  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      showDealsToast(`${product.name} added to cart!`);
    },
    [addToCart, showDealsToast]
  );

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (activeFilter === "all") return SEED_DEALS;
    return SEED_DEALS.filter((d) => d.tag === activeFilter);
  }, [activeFilter]);

  // Featured top 3 deals (highest discount)
  const featuredDeals = useMemo(
    () =>
      [...SEED_DEALS]
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 3),
    []
  );

  // Bundle deals
  const bundleDeals = useMemo(
    () => SEED_DEALS.filter((d) => d.tag === "bundle"),
    []
  );

  // Flash deal for hero (the one ending soonest)
  const heroDeal = useMemo(() => {
    const flash = SEED_DEALS.filter((d) => d.tag === "flash");
    if (flash.length === 0) return SEED_DEALS[0];
    return flash.reduce((a, b) =>
      new Date(a.endsAt).getTime() < new Date(b.endsAt).getTime() ? a : b
    );
  }, []);

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Toast message={toastMessage} visible={toastVisible} onClose={closeToast} />

      {/* ─── Hero / Flash Deals Banner ─────────────────────────────────── */}
      <CursorSpotlight className="relative overflow-hidden" spotlightColor="rgba(212,175,55,0.08)">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF453A]/6 via-surface-tertiary to-[#FFD60A]/4" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0yYjAgMCAyIDAgMiAyaC00YzAgMCAyIDAgMiAyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-14">
          {/* Flash Deal Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#FF453A] to-[#FF9500] text-white text-[13px] font-bold px-4 py-2 rounded-full shadow-lg">
              <Zap className="w-4 h-4 animate-pulse" />
              Flash Deals — Limited Time Only
            </div>
            <Badge variant="error" size="md" dot>
              Live
            </Badge>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left: Deal Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <h1 className="text-[28px] sm:text-[36px] font-bold text-ink leading-tight tracking-tight mb-3">
                {heroDeal.title}
              </h1>
              <p className="text-[15px] text-ink-secondary leading-relaxed mb-5 max-w-lg">
                {heroDeal.description}
              </p>

              <div className="flex items-end gap-4 mb-5">
                <span className="text-[36px] sm:text-[42px] font-bold text-ink leading-none">
                  {formatPrice(heroDeal.dealPrice, selectedCurrency, heroDeal.currency as Currency)}
                </span>
                <div className="flex flex-col">
                  <span className="text-[16px] text-ink-tertiary line-through">
                    {formatPrice(heroDeal.originalPrice, selectedCurrency, heroDeal.currency as Currency)}
                  </span>
                  <span className="text-[14px] font-bold text-success">
                    Save {heroDeal.discount}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    iconPosition="left"
                    onClick={() => {
                      handleAddToCart(buildProductForDeal(heroDeal));
                    }}
                  >
                    Grab This Deal
                  </Button>
                </MagneticButton>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Eye className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={() =>
                    heroDeal.productId
                      ? onNavigate?.(`product:${heroDeal.productId}`)
                      : handleAddToCart(buildProductForDeal(heroDeal))
                  }
                >
                  View Details
                </Button>
              </div>
            </motion.div>

            {/* Right: Countdown + Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="flex flex-col items-center gap-5"
            >
              <TiltCard className="glass-material rounded-[20px] border border-glass-border p-6">
                <motion.span
                  className="text-[80px] block mb-4 text-center select-none"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {heroDeal.image}
                </motion.span>
              </TiltCard>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-ink-tertiary">
                  <Timer className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Ends in</span>
                </div>
                <CountdownTimer targetDate={heroDeal.endsAt} />
              </div>

              <ClaimProgress claimed={heroDeal.claimedCount} max={heroDeal.maxClaims} />
            </motion.div>
          </div>
        </div>
      </CursorSpotlight>

      {/* ─── Filter Pills ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-surface-tertiary/80 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            <Filter className="w-4 h-4 text-ink-tertiary flex-shrink-0" />
            {DEAL_FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <motion.button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold
                    whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${
                      isActive
                        ? "bg-emphasis text-on-emphasis shadow-md"
                        : "bg-surface/60 text-ink-secondary border border-glass-border hover:bg-surface-secondary/60"
                    }
                  `}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-12">
        {/* ─── Today's Best Deals (Featured Top 3) ──────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-ink tracking-tight">
                Today's Best Deals
              </h2>
              <p className="text-[13px] text-ink-tertiary mt-1">
                Hand-picked top offers — grab before they're gone
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDeals.map((deal, i) => (
              <FeaturedDealCard
                key={deal.id}
                deal={deal}
                selectedCurrency={selectedCurrency}
                onAddToCart={handleAddToCart}
                onNavigate={onNavigate}
                rank={i}
              />
            ))}
          </div>
        </section>

        {/* ─── Bundle Deals ──────────────────────────────────────────── */}
        {bundleDeals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-[#AF52DE]" />
                  <h2 className="text-[22px] font-bold text-ink tracking-tight">
                    Bundle Deals
                  </h2>
                </div>
                <p className="text-[13px] text-ink-tertiary">
                  Combine & save — exclusive multi-item packages
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {bundleDeals.map((deal) => (
                <BundleDealCard
                  key={deal.id}
                  deal={deal}
                  selectedCurrency={selectedCurrency}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── All Deals Grid ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-ink tracking-tight">
                {activeFilter === "all"
                  ? "All Deals"
                  : DEAL_FILTERS.find((f) => f.id === activeFilter)?.label || "Deals"}
              </h2>
              <p className="text-[13px] text-ink-tertiary mt-1">
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredDeals.map((deal, i) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  selectedCurrency={selectedCurrency}
                  onAddToCart={handleAddToCart}
                  onNavigate={onNavigate}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredDeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <AlertCircle className="w-10 h-10 text-ink-quaternary" />
              <p className="text-[15px] text-ink-tertiary">
                No deals in this category right now.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveFilter("all")}
              >
                View All Deals
              </Button>
            </motion.div>
          )}
        </section>

        {/* ─── Deal Alert Subscribe ───────────────────────────────────── */}
        <DealAlertSubscribe />

        {/* ─── Bottom Spacer ──────────────────────────────────────────── */}
        <div className="h-8" />
      </div>
    </div>
  );
}
