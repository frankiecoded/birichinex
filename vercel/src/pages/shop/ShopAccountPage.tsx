import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Phone, MapPin, Star, Award, ChevronRight,
  Package, Settings, LogOut, Shield, Crown, Gift, ArrowRight,
  Copy, Check, ShoppingBag, CreditCard, TrendingUp, Zap
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import TiltCard from "../../components/three/TiltCard";
import MagneticButton from "../../components/three/MagneticButton";
import { useStore } from "../../store/useStore";
import { LOYALTY_CONFIG, formatPrice, MEMBERSHIP_TIERS } from "../../data/platform";
import type { Currency } from "../../types";

interface ShopAccountPageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
}

const LOYALTY_TIERS = [
  { key: "bronze", label: "Bronze", min: 0, color: "from-amber-700 to-amber-900", accent: "text-amber-700", ring: "ring-amber-700/20" },
  { key: "silver", label: "Silver", min: 500000, color: "from-gray-400 to-gray-600", accent: "text-gray-500", ring: "ring-gray-400/20" },
  { key: "gold", label: "Gold", min: 2000000, color: "from-yellow-500 to-amber-500", accent: "text-yellow-600", ring: "ring-yellow-500/20" },
  { key: "platinum", label: "Platinum", min: 5000000, color: "from-violet-400 to-purple-600", accent: "text-violet-600", ring: "ring-violet-400/20" },
];

export default function ShopAccountPage({ selectedCurrency, onNavigate }: ShopAccountPageProps) {
  const user = useStore((s) => s.user);
  const loyalty = useStore((s) => s.loyalty);
  const currentTier = useStore((s) => s.currentTier);
  const orders = useStore((s) => s.orders);
  const logout = useStore((s) => s.logout);

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const redeemLoyaltyPoints = useStore((s) => s.redeemLoyaltyPoints);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "G";

  const currentLoyaltyTier = LOYALTY_TIERS.find((t) => t.key === loyalty.currentTier) ?? LOYALTY_TIERS[0];
  const nextLoyaltyTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentLoyaltyTier) + 1];
  const tierProgress = nextLoyaltyTier
    ? Math.min(100, (loyalty.totalEarned / nextLoyaltyTier.min) * 100)
    : 100;

  const recentOrders = orders.slice(0, 3);
  const membershipConfig = MEMBERSHIP_TIERS.find((t) => t.tier === currentTier);

  const handleRedeem = () => {
    const pts = parseInt(redeemAmount, 10);
    if (isNaN(pts) || pts <= 0) return;
    const success = redeemLoyaltyPoints(pts, `Redeemed ${pts} points from shop`);
    if (success) {
      setRedeemSuccess(true);
      setRedeemAmount("");
      setTimeout(() => { setRedeemSuccess(false); setRedeemOpen(false); }, 2000);
    }
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const inputClass =
    "w-full h-11 px-4 rounded-[12px] bg-white/60 dark:bg-glass border border-black/[0.06] dark:border-white/[0.08] text-ink text-[15px] placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-all";

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Banner */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.06] via-transparent to-violet-500/[0.03]" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[50px]" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] blur-[40px]" />

          <div className="relative px-5 pt-8 pb-6 max-w-2xl mx-auto">
            {/* Avatar + Name */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4"
            >
              <div className="relative shrink-0">
                <div className="h-[72px] w-[72px] rounded-[20px] bg-gradient-to-br from-brand/30 via-brand/20 to-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,55,0.15)]">
                  <span className="text-[24px] font-bold text-brand-dark">{initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-[22px] font-bold text-ink tracking-tight">{user?.name || "Guest"}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[14px] text-ink-tertiary truncate">{user?.email}</p>
                  <button onClick={handleCopyEmail} className="text-ink-quaternary hover:text-ink transition-colors">
                    {copiedEmail ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="brand" size="sm" dot>
                    <Crown className="h-3 w-3" />
                    {membershipConfig?.label ?? currentTier}
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </CursorSpotlight>

      <div className="px-5 max-w-2xl mx-auto space-y-5 -mt-1">
        {/* Loyalty Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard intensity={4}>
            <div className="relative overflow-hidden rounded-[20px] border border-brand/15 bg-gradient-to-br from-brand/[0.08] via-white/70 to-violet-500/[0.04] p-5">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand/10 blur-[30px]" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-500/[0.06] blur-[24px]" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-[10px] bg-brand/15 flex items-center justify-center">
                      <Star className="h-4.5 w-4.5 text-brand-dark" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[13px] text-ink-tertiary font-medium">Loyalty Points</p>
                      <p className={`text-[11px] font-semibold ${currentLoyaltyTier.accent}`}>
                        {currentLoyaltyTier.label} Tier
                      </p>
                    </div>
                  </div>
                  <MagneticButton strength={0.12}>
                    <Button
                      variant="brand"
                      size="sm"
                      icon={<Gift className="h-3.5 w-3.5" />}
                      onClick={() => setRedeemOpen(true)}
                    >
                      Redeem
                    </Button>
                  </MagneticButton>
                </div>

                {/* Points Display */}
                <div className="flex items-baseline gap-2 mb-3">
                  <motion.span
                    key={loyalty.points}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[36px] font-bold text-ink tracking-tight"
                  >
                    {loyalty.points.toLocaleString()}
                  </motion.span>
                  <span className="text-[13px] text-ink-tertiary">pts</span>
                </div>

                <p className="text-[12px] text-ink-quaternary mb-4">
                  ≈ {formatPrice(loyalty.points * LOYALTY_CONFIG.pointsToKES, selectedCurrency)} value
                </p>

                {/* Tier Progress */}
                {nextLoyaltyTier && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-ink-quaternary mb-1.5">
                      <span>{currentLoyaltyTier.label}</span>
                      <span>{nextLoyaltyTier.label}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tierProgress}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark"
                      />
                    </div>
                    <p className="text-[11px] text-ink-quaternary mt-1">
                      {(nextLoyaltyTier.min - loyalty.totalEarned).toLocaleString()} pts to {nextLoyaltyTier.label}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: "Earned", value: loyalty.totalEarned.toLocaleString(), icon: TrendingUp },
                    { label: "Redeemed", value: loyalty.totalRedeemed.toLocaleString(), icon: Gift },
                    { label: "Rate", value: `${LOYALTY_CONFIG.tiers[loyalty.currentTier]?.multiplier ?? 1}x`, icon: Zap },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-[10px] bg-white/50 dark:bg-glass/70 border border-black/[0.03] dark:border-glass-border">
                      <stat.icon className="h-3.5 w-3.5 text-ink-quaternary mx-auto mb-1" strokeWidth={1.5} />
                      <p className="text-[15px] font-bold text-ink">{stat.value}</p>
                      <p className="text-[10px] text-ink-quaternary">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[18px] bg-white/70 dark:bg-glass backdrop-blur-xl border border-black/[0.04] dark:border-glass-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-[9px] bg-blue-500/[0.08] flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-bold text-ink">Recent Orders</h3>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="text-[13px] text-brand-dark font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 pb-5 text-center">
              <ShoppingBag className="h-8 w-8 text-ink-quaternary mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[14px] text-ink-tertiary">No orders yet</p>
              <p className="text-[12px] text-ink-quaternary mt-0.5">Start shopping to see orders here</p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => onNavigate("orders")}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-black/[0.01] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      order.status === "delivered" ? "bg-green-500" :
                      order.status === "in_transit" ? "bg-blue-500" :
                      order.status === "returned" ? "bg-red-500" :
                      "bg-amber-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{order.trackingNumber}</p>
                      <p className="text-[12px] text-ink-quaternary truncate">{order.originCity}, {order.originCountry} → {order.destinationCity}, {order.destinationCountry}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[13px] font-medium text-ink capitalize">{order.status.replace("_", " ")}</p>
                    <p className="text-[11px] text-ink-quaternary">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: "Deals", subtitle: "Flash sales & bundles", icon: Award, color: "from-rose-500/[0.08] to-pink-500/[0.04]", iconColor: "text-rose-500", view: "deals" },
            { label: "Settings", subtitle: "Preferences & security", icon: Settings, color: "from-gray-500/[0.08] to-gray-400/[0.04]", iconColor: "text-gray-500", view: "settings" },
          ].map((action) => (
            <button
              key={action.view}
              onClick={() => onNavigate(action.view)}
              className={`relative overflow-hidden rounded-[16px] bg-gradient-to-br ${action.color} border border-black/[0.03] dark:border-white/[0.08] p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform`}
            >
              <action.icon className={`h-5 w-5 ${action.iconColor} mb-2`} strokeWidth={1.5} />
              <p className="text-[14px] font-bold text-ink">{action.label}</p>
              <p className="text-[12px] text-ink-quaternary mt-0.5">{action.subtitle}</p>
            </button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagneticButton strength={0.1}>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              icon={<LogOut className="h-4 w-4" />}
              onClick={logout}
              className="text-ink-tertiary hover:text-red-500"
            >
              Sign Out
            </Button>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Redeem Modal */}
      <AnimatePresence>
        {redeemOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-scrim backdrop-blur-md z-50"
              onClick={() => setRedeemOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-50 rounded-[24px] bg-white/90 dark:bg-glass backdrop-blur-3xl border border-white/60 dark:border-glass-border shadow-[0_24px_80px_rgba(0,0,0,0.2)] p-6"
            >
              <div className="text-center mb-5">
                <div className="h-12 w-12 rounded-[14px] bg-brand/15 flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-brand-dark" />
                </div>
                <h3 className="text-[18px] font-bold text-ink">Redeem Points</h3>
                <p className="text-[13px] text-ink-tertiary mt-1">
                  Available: <span className="font-semibold text-ink">{loyalty.points.toLocaleString()} pts</span>
                </p>
              </div>

              {redeemSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-[15px] font-semibold text-ink">Points Redeemed!</p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-[13px] font-semibold text-ink-secondary mb-1.5 block">Points to redeem</label>
                    <input
                      type="number"
                      min={1}
                      max={loyalty.points}
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      placeholder="Enter points"
                      className={inputClass}
                    />
                    {redeemAmount && parseInt(redeemAmount, 10) > 0 && (
                      <p className="text-[12px] text-ink-quaternary mt-1">
                        ≈ {formatPrice(parseInt(redeemAmount, 10) * LOYALTY_CONFIG.pointsToKES, selectedCurrency)} value
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="md"
                      fullWidth
                      onClick={() => setRedeemOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="brand"
                      size="md"
                      fullWidth
                      icon={<Gift className="h-4 w-4" />}
                      onClick={handleRedeem}
                      disabled={!redeemAmount || parseInt(redeemAmount, 10) <= 0 || parseInt(redeemAmount, 10) > loyalty.points}
                    >
                      Redeem
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
