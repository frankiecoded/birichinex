import { useState, useRef, MouseEvent } from "react";
import { motion } from "motion/react";
import {
  Package, Truck, Shield, Award, Layers, ArrowLeft, Plus, Minus, ShoppingCart
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import GlassCard from "../../components/ui/GlassCard";
import MagneticButton from "../../components/three/MagneticButton";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import { formatPrice } from "../../data/platform";
import type { Currency, Product } from "../../types";
import { useStore } from "../../store/useStore";
import { postedInventoryToProducts } from "../../lib/inventoryListings";

interface BalesPageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

// ── Tier Card ──────────────────────────────────────────────────────────────

function TierCard({ product, selectedCurrency, onAddToCart, index }: {
  product: Product;
  selectedCurrency: Currency;
  onAddToCart: (p: Product) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [qty, setQty] = useState(1);

  const weight = product.specifications?.Weight ?? product.name.replace(/[^\d]+/g, "").trim();
  const pieces = product.specifications?.["Est. Pieces"] ?? "";
  const bestFor = product.specifications?.["Best For"] ?? "";
  const usdPrice = product.specifications?.["USD Price"] ?? "";

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTransform(`perspective(1000px) rotateX(${((e.clientY - cy) / (rect.height / 2)) * -6}deg) rotateY(${((e.clientX - cx) / (rect.width / 2)) * 6}deg) scale3d(1.015,1.015,1.015)`);
    setGlarePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)"); setHovering(false); }}
        style={{ transform, transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)", transformStyle: "preserve-3d" }}
        className="relative glass-material rounded-[22px] overflow-hidden border border-glass-border/40 hover:border-brand/30 transition-all duration-300 flex flex-col"
      >
        {/* Tier visual */}
        <div className="relative h-44 bg-gradient-to-br from-[#8B5E3C]/10 via-surface-secondary/80 to-[#FF9500]/8 flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
          ) : (
            <div className="h-16 w-16 rounded-[18px] bg-[#8B5E3C]/8 flex items-center justify-center">
              <Layers className="h-7 w-7 text-[#8B5E3C]" strokeWidth={1.5} />
            </div>
          )}

          {/* Weight badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="brand" size="sm">{weight}</Badge>
          </div>

          {/* USD price badge */}
          {usdPrice && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-ink/70 text-white backdrop-blur-sm">
                {usdPrice} USD
              </span>
            </div>
          )}

          {/* Glare */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: hovering ? 1 : 0,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              mixBlendMode: "screen"
            }}
          />
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-[15px] font-bold text-ink leading-snug tracking-tight mb-1.5">
            {product.name}
          </h3>

          {/* Quick specs */}
          <div className="space-y-1.5 mb-4">
            {pieces && (
              <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                <span className="font-medium">Pieces:</span> <span>{pieces}</span>
              </div>
            )}
            {bestFor && (
              <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                <span className="font-medium">Best for:</span> <span className="truncate">{bestFor}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-3">
              <p className="text-title font-bold text-ink tracking-tight">
                {formatPrice(product.price.amount, selectedCurrency)}
              </p>
              <p className="text-[11px] text-ink-tertiary">per bale</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 5 ? "bg-success" : "bg-warning"}`} />
              <span className="text-[11px] text-ink-tertiary">{product.stock} bales in stock</span>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0 glass-material rounded-[10px] border border-glass-border/30 overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-8 w-8 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-secondary/60 transition-all duration-150">
                  <Minus className="h-3 w-3" strokeWidth={2} />
                </button>
                <span className="h-8 w-8 flex items-center justify-center text-subhead font-semibold text-ink tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-8 w-8 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-secondary/60 transition-all duration-150">
                  <Plus className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>

              <button
                onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
                className="flex-1 h-9 rounded-[10px] bg-brand text-white text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-brand-dark active:scale-[0.97] transition-all duration-150 shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
              >
                <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-[22px] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, transparent 30%, transparent 70%, rgba(212,175,55,0.1) 100%)", mixBlendMode: "screen" }} />
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BalesPage({ selectedCurrency, onNavigate, onAddToCart }: BalesPageProps) {
  const inventoryItems = useStore((s) => s.marketplaceItems());
  const allProducts = postedInventoryToProducts(inventoryItems);
  const tiers = allProducts.filter((p) => p.category === "Wholesale Bales");

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <CursorSpotlight className="relative overflow-hidden" spotlightColor="rgba(212,175,55,0.07)">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5E3C]/8 via-surface-tertiary to-[#FF9500]/4" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#8B5E3C] to-[#FF9500] text-white text-[13px] font-bold px-4 py-2 rounded-full shadow-lg">
              <Package className="w-4 h-4" />
              Wholesale Bales — Volume Pricing
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <h1 className="text-[28px] sm:text-[40px] font-bold text-ink leading-tight tracking-tight mb-3">
              Wholesale Bales
            </h1>
            <p className="text-[15px] text-ink-secondary leading-relaxed mb-6">
              Compressed fashion bales sorted, graded and baled in Europe — the volume division of
              the Portmetals supply chain. Every bale is real inventory from our container lots, ready
              for East African retailers, market traders and distributors.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-tertiary">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-info" /> Door-to-door delivery</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-info" /> Verified sourcing</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-info" /> Loyalty points on every order</span>
            </div>
          </motion.div>
        </div>
      </CursorSpotlight>

      {/* ─── Tier Grid ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        {tiers.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-headline text-ink tracking-tight">Volume Pricing</h2>
              <p className="text-callout text-ink-tertiary mt-1.5">
                Choose the weight tier that fits your operation — every bale is real, posted inventory
                with live stock and in-cart checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tiers.map((tier, i) => (
                <TierCard key={tier.id} product={tier} selectedCurrency={selectedCurrency} onAddToCart={onAddToCart} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
              <Layers className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
            </div>
            <Badge variant="brand" size="sm" className="mb-4">Loading…</Badge>
            <h2 className="text-headline text-ink tracking-tight mb-2">Bales loading</h2>
            <p className="text-callout text-ink-tertiary max-w-md mx-auto leading-relaxed mb-8">
              The wholesale bale catalogue is being seeded. If tiers haven't appeared after the
              next page load, check that the migration has run.
            </p>
          </div>
        )}

        {/* ─── Trust / Info Strip ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {[
            { icon: Truck, title: "Door-to-door delivery", desc: "Delivered across East Africa with full tracking." },
            { icon: Shield, title: "Buyer protection", desc: "Verified sourcing, quality checks, and easy returns." },
            { icon: Award, title: "Loyalty rewards", desc: "Earn loyalty points on every wholesale purchase." },
          ].map((item) => (
            <GlassCard key={item.title} padding="md" hover>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-brand/8 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-ink">{item.title}</p>
                  <p className="text-[12px] text-ink-tertiary mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <MagneticButton strength={0.15} className="mt-10">
          <button
            onClick={() => onNavigate("cart")}
            className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Review Cart & Checkout
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
