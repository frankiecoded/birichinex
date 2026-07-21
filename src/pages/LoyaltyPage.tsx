import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, Gift, ArrowUpRight, ArrowDownRight, Sparkles,
  ShoppingCart, Layers, Award, ChevronRight, Coins,
  Crown, Trophy, Medal, Zap, Info,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { LOYALTY_CONFIG, formatPrice } from "../data/platform";

type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

const TIER_ORDER: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];

const TIER_META: Record<LoyaltyTier, {
  label: string;
  icon: typeof Crown;
  color: string;
  bg: string;
  benefits: string[];
}> = {
  bronze: {
    label: "Bronze",
    icon: Medal,
    color: "#CD7F32",
    bg: "rgba(205,127,50,0.1)",
    benefits: ["1x point multiplier", "Basic earn rate", "Standard support"],
  },
  silver: {
    label: "Silver",
    icon: Trophy,
    color: "#C0C0C0",
    bg: "rgba(192,192,192,0.1)",
    benefits: ["1.5x point multiplier", "50% bonus earnings", "Priority support"],
  },
  gold: {
    label: "Gold",
    icon: Crown,
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
    benefits: ["2x point multiplier", "Double earn rate", "Dedicated support"],
  },
  platinum: {
    label: "Platinum",
    icon: Sparkles,
    color: "#E5E4E2",
    bg: "rgba(229,228,226,0.12)",
    benefits: ["3x point multiplier", "Triple earn rate", "White-glove service"],
  },
};

export default function LoyaltyPage() {
  const loyalty = useStore((s) => s.loyalty);
  const addLoyaltyPoints = useStore((s) => s.addLoyaltyPoints);
  const redeemLoyaltyPoints = useStore((s) => s.redeemLoyaltyPoints);
  const earnPointsFromPurchase = useStore((s) => s.earnPointsFromPurchase);
  const selectedCurrency = useStore((s) => s.selectedCurrency);

  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const currentTierIndex = TIER_ORDER.indexOf(loyalty.currentTier);
  const currentTierMeta = TIER_META[loyalty.currentTier];
  const CurrentTierIcon = currentTierMeta.icon;

  const tierProgress = useMemo(() => {
    const nextTierIndex = currentTierIndex + 1;
    if (nextTierIndex >= TIER_ORDER.length) {
      return { percentage: 100, nextTier: null, remaining: 0 };
    }
    const nextTier = TIER_ORDER[nextTierIndex];
    const nextThreshold = LOYALTY_CONFIG.tiers[nextTier].minSpend;
    const currentThreshold = LOYALTY_CONFIG.tiers[loyalty.currentTier].minSpend;
    const range = nextThreshold - currentThreshold;
    const progress = loyalty.totalEarned - currentThreshold;
    const percentage = Math.min(100, Math.max(0, (progress / range) * 100));
    return { percentage, nextTier, remaining: Math.max(0, nextThreshold - loyalty.totalEarned) };
  }, [loyalty.currentTier, loyalty.totalEarned, currentTierIndex]);

  const tierMultiplier = LOYALTY_CONFIG.tiers[loyalty.currentTier].multiplier;
  const earnRate = LOYALTY_CONFIG.pointsPer150KES * tierMultiplier;
  const pointsValueKES = loyalty.points * LOYALTY_CONFIG.pointsToKES;

  const redeemParsed = useMemo(() => {
    const num = parseInt(redeemAmount, 10);
    if (isNaN(num) || num <= 0) return 0;
    return num;
  }, [redeemAmount]);

  const handleRedeem = () => {
    setRedeemError("");
    setRedeemSuccess(false);
    const pts = parseInt(redeemAmount, 10);
    if (!pts || pts <= 0) {
      setRedeemError("Enter a valid number of points.");
      return;
    }
    if (pts > loyalty.points) {
      setRedeemError("Insufficient points balance.");
      return;
    }
    const ok = redeemLoyaltyPoints(pts, `Redeemed ${pts} points for discount`);
    if (ok) {
      setRedeemSuccess(true);
      setRedeemAmount("");
      setTimeout(() => setRedeemSuccess(false), 3000);
    } else {
      setRedeemError("Redemption failed. Please try again.");
    }
  };

  const howItWorks = [
    {
      icon: ShoppingCart,
      title: "Shop",
      description: "Earn 1 point for every 100 KES spent on purchases.",
      color: "#007AFF",
    },
    {
      icon: Layers,
      title: "Accumulate",
      description: "Points stack with tier multipliers for accelerated rewards.",
      color: "#30D158",
    },
    {
      icon: Gift,
      title: "Redeem",
      description: "Use points for instant discounts — 1 point equals 1 KES.",
      color: "#FF9500",
    },
  ];

  return (
    <CursorSpotlight className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(48,209,88,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-headline text-gradient-brand tracking-tight">Loyalty Points</h1>
            <p className="text-callout text-ink-tertiary mt-1">
              Earn points on every purchase. Redeem for instant discounts.
            </p>
          </div>
          <Badge variant="brand" size="md" dot>
            <CurrentTierIcon className="h-3 w-3" />
            {currentTierMeta.label} Tier
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg" className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-[14px] flex items-center justify-center" style={{ backgroundColor: currentTierMeta.bg }}>
                <Coins className="h-6 w-6" style={{ color: currentTierMeta.color }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-title font-bold text-ink"
                  >
                    {loyalty.points.toLocaleString()}
                  </motion.span>
                  <span className="text-caption text-ink-quaternary">points</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-subhead font-bold text-ink">{formatPrice(pointsValueKES, selectedCurrency)}</span>
              <span className="text-caption text-ink-quaternary">equivalent value</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-caption text-ink-tertiary font-semibold mb-1">Current Tier</p>
                <p className="text-subhead font-bold text-ink">{currentTierMeta.label}</p>
              </div>
              <div>
                <p className="text-caption text-ink-tertiary font-semibold mb-1">Earn Rate</p>
                <p className="text-subhead font-bold text-ink">{earnRate} pts / 100 KES</p>
              </div>
              <div>
                <p className="text-caption text-ink-tertiary font-semibold mb-1">Multiplier</p>
                <p className="text-subhead font-bold text-ink">{tierMultiplier}x</p>
              </div>
            </div>
            {tierProgress.nextTier && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption text-ink-tertiary font-semibold">
                    Progress to {TIER_META[tierProgress.nextTier].label}
                  </p>
                  <p className="text-caption text-ink-quaternary">
                    {formatPrice(tierProgress.remaining, selectedCurrency)} remaining
                  </p>
                </div>
                <div className="h-2 bg-surface-secondary/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tierProgress.percentage}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: currentTierMeta.color }}
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Points", value: loyalty.points.toLocaleString(), icon: Coins, color: "#007AFF" },
          { label: "Total Earned", value: loyalty.totalEarned.toLocaleString(), icon: ArrowUpRight, color: "#30D158" },
          { label: "Total Redeemed", value: loyalty.totalRedeemed.toLocaleString(), icon: ArrowDownRight, color: "#FF9500" },
          { label: "Current Tier", value: currentTierMeta.label, icon: Award, color: currentTierMeta.color },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard>
              <GlassCard padding="lg" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-headline font-bold text-ink mt-1 tracking-tight">{item.value}</p>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-subhead font-bold text-ink mb-4">How It Works</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {howItWorks.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="lg" className="h-full">
              <div className="h-12 w-12 rounded-[14px] flex items-center justify-center mb-4" style={{ backgroundColor: `${item.color}12` }}>
                <item.icon className="h-6 w-6" style={{ color: item.color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-subhead font-bold text-ink mb-2">{item.title}</h3>
              <p className="text-caption text-ink-tertiary leading-relaxed">{item.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-subhead font-bold text-ink mb-4">Tier Benefits</h2>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TIER_ORDER.map((tier, i) => {
          const meta = TIER_META[tier];
          const TierIcon = meta.icon;
          const isActive = tier === loyalty.currentTier;
          const tierConfig = LOYALTY_CONFIG.tiers[tier];

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={isActive ? 8 : 4}>
                <GlassCard
                  padding="none"
                  hover
                  className={`h-full flex flex-col ${isActive ? "ring-2 ring-brand/40" : ""}`}
                >
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: meta.bg }}>
                        <TierIcon className="h-5 w-5" style={{ color: meta.color }} strokeWidth={1.5} />
                      </div>
                      {isActive && (
                        <Badge variant="brand" size="sm" dot>Current</Badge>
                      )}
                    </div>
                    <h3 className="text-subhead font-bold text-ink mb-1">{meta.label}</h3>
                    <p className="text-caption text-ink-quaternary mb-3">
                      Min spend: {formatPrice(tierConfig.minSpend, selectedCurrency)}
                    </p>
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-headline font-bold text-ink">{tierConfig.multiplier}x</span>
                        <span className="text-caption text-ink-quaternary">multiplier</span>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      {meta.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-start gap-2">
                          <Zap className="h-3 w-3 shrink-0 mt-0.5" style={{ color: meta.color }} />
                          <span className="text-caption text-ink-secondary">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="none">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-subhead font-bold text-ink">Points History</h3>
              <Badge variant="default" size="sm">{loyalty.history.length}</Badge>
            </div>
          </div>
          <div className="divide-y divide-glass-border">
            {loyalty.history.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Coins className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1} />
                <p className="text-callout text-ink-quaternary mb-1">No transactions yet</p>
                <p className="text-caption text-ink-quaternary">Start earning points with your first purchase.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {loyalty.history.map((tx, i) => {
                const isPositive = tx.type === "earn" || tx.type === "bonus";
                const badgeVariant = tx.type === "earn" ? "success" : tx.type === "redeem" ? "warning" : tx.type === "bonus" ? "brand" : "default";
                const badgeLabel = tx.type === "earn" ? "Earned" : tx.type === "redeem" ? "Redeemed" : tx.type === "bonus" ? "Bonus" : "Expired";

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center ${isPositive ? "bg-success/10" : "bg-warning/10"}`}>
                      {isPositive
                        ? <ArrowUpRight className="h-5 w-5 text-success" strokeWidth={1.5} />
                        : <ArrowDownRight className="h-5 w-5 text-warning" strokeWidth={1.5} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subhead text-ink truncate">{tx.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant} size="sm">{badgeLabel}</Badge>
                        <span className="text-ink-quaternary text-[10px]">·</span>
                        <p className="text-caption text-ink-quaternary">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-subhead font-bold shrink-0 tracking-tight ${isPositive ? "text-success" : "text-warning"}`}>
                      {isPositive ? "+" : ""}{tx.points.toLocaleString()} pts
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {loyalty.history.length > 0 && (
            <div className="px-5 py-3 border-t border-glass-border flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
              <p className="text-caption text-ink-quaternary">Points never expire within your tier.</p>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-[12px] flex items-center justify-center bg-brand/10">
              <Gift className="h-5 w-5 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-subhead font-bold text-ink">Redeem Points</h3>
              <p className="text-caption text-ink-tertiary">Convert points to instant purchase discounts</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Points to Redeem</label>
              <input
                type="number"
                min="1"
                max={loyalty.points}
                value={redeemAmount}
                onChange={(e) => {
                  setRedeemAmount(e.target.value);
                  setRedeemError("");
                  setRedeemSuccess(false);
                }}
                className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-subhead text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                placeholder="Enter points amount"
              />
            </div>
            {redeemParsed > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-secondary/40 rounded-[12px] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption text-ink-tertiary">Points to redeem</span>
                  <span className="text-caption font-semibold text-ink">{redeemParsed.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-ink-tertiary">Equivalent value</span>
                  <span className="text-caption font-semibold text-ink">{formatPrice(redeemParsed * LOYALTY_CONFIG.pointsToKES, selectedCurrency)}</span>
                </div>
                <div className="h-px bg-glass-border" />
                <div className="flex items-center justify-between">
                  <span className="text-caption text-ink-tertiary">Remaining balance</span>
                  <span className="text-caption font-semibold text-ink">
                    {(loyalty.points - redeemParsed).toLocaleString()} pts
                  </span>
                </div>
              </motion.div>
            )}
            {redeemError && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-caption text-error font-medium"
              >
                {redeemError}
              </motion.p>
            )}
            {redeemSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-caption text-success font-medium"
              >
                Points redeemed successfully!
              </motion.p>
            )}
            <MagneticButton className="w-full">
              <Button
                variant="brand"
                fullWidth
                size="lg"
                icon={<ChevronRight className="h-4 w-4" />}
                iconPosition="right"
                onClick={handleRedeem}
                disabled={!redeemParsed || redeemParsed <= 0 || redeemParsed > loyalty.points}
              >
                Redeem Now
              </Button>
            </MagneticButton>
          </div>
        </GlassCard>
      </motion.div>
    </CursorSpotlight>
  );
}
