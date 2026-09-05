import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
  Truck, Shield, Lock, Package, Sparkles, Award, X
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatPrice, calculateLoyaltyPoints } from "../../data/platform";
import { Currency, CartItem } from "../../types";
import { useStore } from "../../store/useStore";
import MagneticButton from "../../components/three/MagneticButton";
import CursorSpotlight from "../../components/three/CursorSpotlight";

interface ShopCartPageProps {
  cart: CartItem[];
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onRemoveFromCart: (index: number) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export default function ShopCartPage({ cart, selectedCurrency, onNavigate, onRemoveFromCart, onUpdateQuantity }: ShopCartPageProps) {
  const loyalty = useStore((s) => s.loyalty);
  const cartRedeem = useStore((s) => s.cartRedeem);
  const setCartRedeem = useStore((s) => s.setCartRedeem);

  const [redeemInput, setRedeemInput] = useState("");
  const [redeemError, setRedeemError] = useState("");

  const unitCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 25000;

  const maxRedeemable = Math.min(loyalty.points, Math.floor(subtotal * 0.3));
  const total = subtotal + shipping - (cartRedeem?.value ?? 0);

  const handleRedeem = () => {
    setRedeemError("");
    const points = parseInt(redeemInput, 10) || 0;
    if (points <= 0) {
      setRedeemError("Enter a valid number of points");
      return;
    }
    if (points > loyalty.points) {
      setRedeemError("Insufficient points");
      return;
    }
    if (points > Math.floor(subtotal * 0.3)) {
      setRedeemError("Maximum 30% of order total can be redeemed");
      return;
    }
    setCartRedeem({ points, value: points });
    setRedeemInput("");
  };

  const handleClearRedeem = () => {
    setCartRedeem(null);
    setRedeemError("");
  };

  const pointsOnOrder = calculateLoyaltyPoints(total, loyalty.currentTier);

  const categoryColors: Record<string, string> = {
    "Men's Fashion": "#007AFF",
    "Women's Fashion": "#FF6482",
    "Leather": "#8B5E3C",
    Accessories: "#AF52DE",
    Kids: "#30D158",
    Sportswear: "#FF9500",
    "T-Shirts": "#FF2D55",
    Jackets: "#5E5CE6",
    Handbags: "#00C7BE",
    "Wholesale Bales": "#FF9500",
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
          <p className="text-callout text-ink-tertiary mt-1">
            {unitCount} item{unitCount !== 1 ? "s" : ""} in your cart
          </p>
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
              {cart.map((item, i) => {
                const color = categoryColors[item.product.category] || "#d4af37";
                const lineTotal = item.unitPrice.amount * item.quantity;
                return (
                  <motion.div
                    key={item.id}
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
                          <h3 className="text-subhead font-bold text-ink truncate">{item.product.name}</h3>
                          <Badge variant="brand" size="sm">{item.product.grade}</Badge>
                        </div>
                        <p className="text-caption text-ink-tertiary">{item.product.category} · {item.product.origin}</p>

                        {/* Quantity Editor */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <div className="flex items-center border border-glass-border rounded-full bg-surface-secondary/60 overflow-hidden">
                            <button
                              onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, item.quantity - 1) : onRemoveFromCart(i)}
                              className="h-8 w-8 flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-caption font-bold text-ink tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-caption text-ink-quaternary">
                            {formatPrice(item.unitPrice.amount, selectedCurrency)} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <p className="text-subhead font-bold text-ink tracking-tight">{formatPrice(lineTotal, selectedCurrency)}</p>
                        <button
                          onClick={() => onRemoveFromCart(i)}
                          className="text-caption text-error/70 hover:text-error flex items-center gap-1 transition-colors duration-200"
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
                      {cartRedeem ? (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-caption font-semibold text-success">
                              {cartRedeem.points} pts applied
                            </p>
                            <p className="text-[10px] text-ink-tertiary">Applied at checkout</p>
                          </div>
                          <Button variant="ghost" size="sm" icon={<X className="h-3 w-3" />} onClick={handleClearRedeem}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={maxRedeemable}
                              value={redeemInput}
                              onChange={(e) => { setRedeemInput(e.target.value); setRedeemError(""); }}
                              placeholder={`Max ${maxRedeemable}`}
                              className="flex-1 h-9 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                            />
                            <Button variant="secondary" size="sm" onClick={handleRedeem}>
                              Redeem
                            </Button>
                          </div>
                          {redeemError && <p className="text-caption text-error mt-1.5">{redeemError}</p>}
                        </>
                      )}
                      <p className="text-[10px] text-ink-quaternary mt-1.5">1 point = {formatPrice(1, selectedCurrency)} · Max 30% of order</p>
                    </div>
                  )}

                  {cartRedeem && (
                    <div className="flex items-center justify-between text-success">
                      <span className="text-caption font-semibold">Points Discount</span>
                      <span className="text-subhead font-bold">-{formatPrice(cartRedeem.value, selectedCurrency)}</span>
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
                  <span>Earn {pointsOnOrder} point{pointsOnOrder !== 1 ? "s" : ""} on this order</span>
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
