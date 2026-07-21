import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
  Truck, Shield, Lock, Package, Sparkles, Award
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../data/platform";
import { Currency, Product } from "../../types";
import { useStore } from "../../store/useStore";
import MagneticButton from "../../components/three/MagneticButton";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import ParallaxSection from "../../components/three/ParallaxSection";

interface ShopCartPageProps {
  cart: Product[];
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onRemoveFromCart: (index: number) => void;
}

export default function ShopCartPage({ cart, selectedCurrency, onNavigate, onRemoveFromCart }: ShopCartPageProps) {
  const loyalty = useStore((s) => s.loyalty);
  const redeemLoyaltyPoints = useStore((s) => s.redeemLoyaltyPoints);

  const [redeemInput, setRedeemInput] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const subtotal = cart.reduce((sum, p) => sum + p.price.amount, 0);
  const shipping = subtotal > 500000 ? 0 : 25000;

  const maxRedeemable = Math.min(loyalty.points, Math.floor(subtotal * 0.3)); // max 30% of subtotal
  const redeemPoints = Math.min(parseInt(redeemInput) || 0, maxRedeemable);
  const redeemValue = redeemPoints; // 1 point = 1 TZS

  const total = subtotal + shipping - redeemValue;

  const handleRedeem = () => {
    setRedeemError("");
    setRedeemSuccess(false);
    if (redeemPoints <= 0) {
      setRedeemError("Enter a valid number of points");
      return;
    }
    if (redeemPoints > loyalty.points) {
      setRedeemError("Insufficient points");
      return;
    }
    if (redeemPoints > subtotal * 0.3) {
      setRedeemError("Maximum 30% of order total can be redeemed");
      return;
    }
    const success = redeemLoyaltyPoints(redeemPoints, `Redeemed for cart discount`);
    if (success) {
      setRedeemSuccess(true);
      setRedeemInput("");
    } else {
      setRedeemError("Failed to redeem points");
    }
  };

  const categoryColors: Record<string, string> = {
    "Men's Fashion": "#007AFF",
    "Women's Fashion": "#FF6482",
    "Leather": "#8B5E3C",
    Accessories: "#AF52DE",
    Kids: "#30D158",
    Sportswear: "#FF9500",
    Laptops: "#007AFF",
    Smartphones: "#5856D6",
    Audio: "#FF375F",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-headline text-ink tracking-tight">Shopping Cart</h1>
          <p className="text-callout text-ink-tertiary mt-1">{cart.length} items</p>
        </div>
        <MagneticButton strength={0.15}>
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Continue Shopping</span>
          </button>
        </MagneticButton>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <div className="h-20 w-20 rounded-[22px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="h-8 w-8 text-ink-quaternary" strokeWidth={1.5} />
          </div>
          <p className="text-title text-ink mb-2">Your cart is empty</p>
          <p className="text-callout text-ink-tertiary mb-7">Browse our collection and add items to get started.</p>
          <MagneticButton strength={0.2}>
            <Button variant="primary" onClick={() => onNavigate("home")}>Start Shopping</Button>
          </MagneticButton>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cart.map((product, i) => {
                const color = categoryColors[product.category] || "#d4af37";
                return (
                  <motion.div
                    key={`${product.id}-${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    layout
                  >
                    <div className="glass-material rounded-[18px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 border border-glass-border/30 hover:border-glass-border/60 transition-all duration-200 group">
                      <div className="h-20 w-20 rounded-[16px] flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: `${color}10` }}>
                        <ShoppingBag className="h-6 w-6" style={{ color }} strokeWidth={1.5} />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                          mixBlendMode: "screen"
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-subhead font-bold text-ink truncate">{product.name}</h3>
                          <Badge variant="brand" size="sm">{product.grade}</Badge>
                        </div>
                        <p className="text-caption text-ink-tertiary">{product.category} · {product.origin}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-subhead font-bold text-ink tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
                        <button
                          onClick={() => onRemoveFromCart(i)}
                          className="text-caption text-error/70 hover:text-error flex items-center gap-1 mt-1.5 transition-colors duration-200"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <CursorSpotlight spotlightSize={300} spotlightColor="rgba(212,175,55,0.04)">
              <div className="glass-material rounded-[22px] p-4 sm:p-7 border border-glass-border/30 sticky top-20">
                <h3 className="text-subhead font-bold text-ink mb-5">Order Summary</h3>

                <div className="space-y-3.5 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-secondary">Subtotal</span>
                    <span className="text-subhead font-bold text-ink">{formatPrice(subtotal, selectedCurrency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-secondary">Shipping</span>
                    <span className="text-subhead font-bold text-ink">
                      {shipping === 0 ? "Free" : formatPrice(shipping, selectedCurrency)}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="flex items-center gap-1.5 text-caption text-success font-semibold">
                      <Sparkles className="h-3 w-3" />
                      Free shipping unlocked!
                    </div>
                  )}

                  {/* Loyalty Points */}
                  {loyalty.points > 0 && (
                    <div className="p-3 rounded-[12px] bg-brand/5 border border-brand/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-brand" />
                        <span className="text-caption font-semibold text-ink">Loyalty Points</span>
                        <Badge variant="brand" size="sm">{loyalty.points} pts</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={maxRedeemable}
                          value={redeemInput}
                          onChange={(e) => { setRedeemInput(e.target.value); setRedeemError(""); setRedeemSuccess(false); }}
                          placeholder={`Max ${maxRedeemable}`}
                          className="flex-1 h-9 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                        <Button variant="secondary" size="sm" onClick={handleRedeem}>
                          Redeem
                        </Button>
                      </div>
                      {redeemError && <p className="text-caption text-error mt-1.5">{redeemError}</p>}
                      {redeemSuccess && <p className="text-caption text-success mt-1.5">Points redeemed!</p>}
                      <p className="text-[10px] text-ink-quaternary mt-1.5">1 point = {formatPrice(1, selectedCurrency)} · Max 30% of order</p>
                    </div>
                  )}

                  {redeemValue > 0 && (
                    <div className="flex items-center justify-between text-success">
                      <span className="text-caption font-semibold">Points Discount</span>
                      <span className="text-subhead font-bold">-{formatPrice(redeemValue, selectedCurrency)}</span>
                    </div>
                  )}
                </div>

                <div className="glass-divider mb-5" />

                <div className="flex items-center justify-between mb-6">
                  <span className="text-subhead font-bold text-ink">Total</span>
                  <span className="text-headline font-bold text-ink tracking-tight">{formatPrice(total, selectedCurrency)}</span>
                </div>

                <MagneticButton strength={0.15}>
                  <Button variant="primary" size="lg" fullWidth icon={<Lock className="h-4 w-4" />}
                    onClick={() => onNavigate("checkout")}>
                    Secure Checkout
                  </Button>
                </MagneticButton>

                <div className="flex items-center justify-center gap-1.5 text-caption text-brand mt-3">
                  <Award className="h-3 w-3" />
                  <span>Earn ~{Math.floor(total / 100)} points on this order</span>
                </div>

                {/* Trust Signals */}
                <div className="mt-6 space-y-2.5">
                  {[
                    { icon: Truck, text: `Free shipping on orders over ${formatPrice(500000, selectedCurrency)}` },
                    { icon: Shield, text: "Buyer protection guaranteed" },
                    { icon: Lock, text: "Secure 256-bit SSL encryption" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-surface-secondary/60 flex items-center justify-center">
                        <item.icon className="h-2.5 w-2.5 text-ink-quaternary" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-ink-quaternary">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CursorSpotlight>
          </motion.div>
        </div>
      )}
    </div>
  );
}
