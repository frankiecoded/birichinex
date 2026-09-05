import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Star, MapPin, Shield, ChevronRight,
  Truck, RotateCcw, CheckCircle, Plus, Minus, ArrowLeft,
  Share2, Heart, Package, Award, Sparkles, Loader2
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../data/platform";
import { Currency, Product } from "../../types";
import TiltCard from "../../components/three/TiltCard";
import MagneticButton from "../../components/three/MagneticButton";
import ParallaxSection from "../../components/three/ParallaxSection";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import { useStore } from "../../store/useStore";
import { postedInventoryToProducts } from "../../lib/inventoryListings";

interface ShopProductPageProps {
  productId: string;
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

// Interactive 3D Product Image Viewer
function ProductImageViewer({ product }: { product: Product }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [activeIdx, setActiveIdx] = useState(0);

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

  const color = categoryColors[product.category] || "#d4af37";
  const images = (product.images && product.images.length > 0 ? product.images : []).filter(Boolean);
  const activeImage = images[Math.min(activeIdx, Math.max(0, images.length - 1))] || "";

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -12;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 12;
    setTransform(`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`);
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="aspect-square rounded-[28px] flex items-center justify-center relative overflow-hidden border border-glass-border/30 cursor-crosshair"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, ${color}03 50%, transparent 100%)`,
          transform,
          transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-40 w-40 rounded-full blur-[80px]" style={{ background: `${color}15` }} />
          <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full blur-[60px]" style={{ background: `${color}10` }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(${color}30 1px, transparent 1px), linear-gradient(90deg, ${color}30 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />

        {/* Product Visual — image if available, else 3D floating icon */}
        {activeImage ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={product.name}
            onError={(e) => { (e.currentTarget.style.display = "none"); }}
            className="relative z-10 h-full w-full object-cover"
          />
        ) : (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="h-28 w-28 rounded-[24px] flex items-center justify-center relative" style={{ background: `${color}12` }}>
              <div className="absolute inset-0 rounded-[24px] border" style={{ borderColor: `${color}20` }} />
              <ShoppingBag className="h-12 w-12" style={{ color }} strokeWidth={1.2} />
            </div>
          </motion.div>
        )}

        {/* Grade badge */}
        <div className="absolute top-6 left-6">
          <Badge variant="brand" size="md">{product.grade}</Badge>
        </div>

        {/* Origin badge */}
        <div className="absolute top-6 right-6">
          <div className="glass-material rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-brand" strokeWidth={1.5} />
            <span className="text-caption font-semibold text-ink">{product.origin}</span>
          </div>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 glass-material rounded-full px-3 py-1">
            <span className="text-[11px] font-bold text-ink">{activeIdx + 1} / {images.length}</span>
          </div>
        )}

        {/* Specular glare */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[28px]"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            mixBlendMode: "screen",
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Edge highlight */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.3), inset 0 -1px 0 0 rgba(0,0,0,0.05)`
        }} />
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIdx(i)}
              className={`relative h-16 w-16 shrink-0 rounded-[12px] overflow-hidden border transition-all duration-200 ${
                i === activeIdx
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-glass-border/30 opacity-60 hover:opacity-100"
              }`}
              style={{ background: `${color}08` }}
            >
              <img
                src={src}
                alt={`${product.name} view ${i + 1}`}
                onError={(e) => { (e.currentTarget.style.display = "none"); }}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Interactive Spec Card
function SpecCard({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="glass-material rounded-[14px] p-4 border border-glass-border/30 hover:border-glass-border/60 transition-all duration-200">
        <p className="text-[10px] text-ink-quaternary uppercase font-bold tracking-[0.08em] mb-1">{label}</p>
        <p className="text-subhead font-semibold text-ink group-hover:text-brand-dark transition-colors duration-200">{value}</p>
      </div>
    </motion.div>
  );
}

export default function ShopProductPage({ productId, selectedCurrency, onNavigate, onAddToCart }: ShopProductPageProps) {
  const inventoryItems = useStore((s) => s.inventoryItems);
  const allProducts = postedInventoryToProducts(inventoryItems);
  const product = allProducts.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!product) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: product.name, category: product.category, specs: product.specifications }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to generate description");
      const text = String(data?.description ?? "").trim();
      if (!text) throw new Error("Empty description returned");
      setAiDescription(text);
    } catch (err: any) {
      setAiError(err?.message || "Unable to generate description");
    } finally {
      setAiLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 text-center">
        <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-4">
          <Package className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
        </div>
        <p className="text-title text-ink mb-2">Product not found</p>
        <p className="text-callout text-ink-tertiary mb-6">This product may no longer be available.</p>
        <Button variant="primary" onClick={() => onNavigate("home")}>Back to Home</Button>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 lg:space-y-14">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 text-caption text-ink-tertiary"
      >
        <button onClick={() => onNavigate("home")} className="hover:text-ink transition-colors">Home</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-semibold">{product.name}</span>
      </motion.div>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16">
        {/* Product Image — Interactive 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductImageViewer product={product} />
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold mb-2">{product.category}</p>
            <h1 className="text-headline text-ink tracking-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-brand fill-brand" />
                <span className="text-subhead font-bold text-ink">{product.supplier.rating}</span>
              </div>
              <span className="text-caption text-ink-quaternary">·</span>
              <div className="flex items-center gap-1.5 text-caption text-ink-tertiary">
                <MapPin className="h-3 w-3 text-brand" strokeWidth={1.5} />
                {product.origin}
              </div>
              {product.supplier.verified && (
                <div className="flex items-center gap-1 text-caption text-success">
                  <Shield className="h-3 w-3" strokeWidth={1.5} />
                  Verified
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={aiDescription ?? "default"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
                  <p className="text-caption font-bold text-ink-secondary uppercase tracking-wide">AI-generated description</p>
                </div>
                {!aiDescription && (
                  <Badge variant="brand" size="sm" dot>Pre-written by AI</Badge>
                )}
              </div>
              <p className="text-body text-ink-secondary leading-relaxed">{aiDescription ?? product.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand-dark hover:text-brand transition-colors disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.5} />
                  Regenerate description with AI
                </>
              )}
            </button>
            {aiError && <span className="text-caption text-error">{aiError}</span>}
          </div>

          <div className="glass-divider" />

          {/* Price */}
          <div className="flex items-end gap-3">
            <p className="text-headline font-bold text-ink tracking-tight">
              {formatPrice(product.price.amount, selectedCurrency)}
            </p>
            <p className="text-caption text-ink-quaternary mb-1">per unit · Min order: {product.minOrder} units</p>
          </div>

          {/* Specifications */}
          <div>
            <p className="text-subhead font-bold text-ink mb-3">Specifications</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.specifications).map(([key, val], i) => (
                <SpecCard key={key} label={key} value={val} index={i} />
              ))}
            </div>
          </div>

          <div className="glass-divider" />

          {/* Quantity + Actions */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <p className="text-subhead font-bold text-ink">Quantity</p>
              <div className="flex items-center gap-0 glass-material rounded-[12px] border border-glass-border/30 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-secondary/60 transition-all duration-150"
                >
                  <Minus className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="h-10 w-12 flex items-center justify-center text-subhead font-bold text-ink border-x border-glass-border/30">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-secondary/60 transition-all duration-150"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <MagneticButton strength={0.15} className="flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ShoppingBag className="h-4 w-4" />}
                  onClick={() => onAddToCart(product)}
                  fullWidth
                  className="shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                >
                  Add to Cart
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.15} className="flex-1">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-glass-border/50"
                  onClick={() => { onAddToCart(product); onNavigate("checkout"); }}
                >
                  Buy Now
                </Button>
              </MagneticButton>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-3">
              <MagneticButton strength={0.2}>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`h-10 w-10 rounded-[11px] flex items-center justify-center border transition-all duration-200 ${
                    isWishlisted
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-surface-secondary/50 border-glass-border/50 text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-brand" : ""}`} strokeWidth={1.5} />
                </button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <button className="h-10 w-10 rounded-[11px] bg-surface-secondary/50 border border-glass-border/50 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors duration-200">
                  <Share2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </MagneticButton>
            </div>
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Shipping", sub: `Orders ${formatPrice(500000, selectedCurrency)}+` },
              { icon: RotateCcw, label: "30-Day Returns", sub: "Easy process" },
              { icon: Award, label: "Verified Quality", sub: "Grade certified" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                className="glass-material rounded-[14px] p-3.5 text-center border border-glass-border/20"
              >
                <f.icon className="h-4 w-4 text-brand mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-[10px] sm:text-[11px] font-bold text-ink">{f.label}</p>
                <p className="text-[10px] text-ink-quaternary mt-0.5">{f.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Supplier Info */}
      <CursorSpotlight spotlightSize={400} spotlightColor="rgba(212,175,55,0.03)">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-material rounded-[20px] p-4 sm:p-7 border border-glass-border/30">
            <h3 className="text-subhead font-bold text-ink mb-5">Supplier Information</h3>
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-[14px] bg-night flex items-center justify-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <span className="text-white font-bold text-lg relative z-10">{product.supplier.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-subhead font-bold text-ink">{product.supplier.name}</p>
                  {product.supplier.verified && <Shield className="h-4 w-4 text-success" strokeWidth={1.5} />}
                </div>
                <p className="text-caption text-ink-tertiary mt-0.5">
                  {product.supplier.location} · {product.supplier.rating} rating
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </CursorSpotlight>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <ParallaxSection offset={20} speed={0.2}>
            <h2 className="text-headline text-ink tracking-tight mb-7">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard intensity={8}>
                    <button
                      onClick={() => onNavigate(`product:${p.id}`)}
                      className="w-full text-left"
                    >
                      <div className="glass-material rounded-[18px] overflow-hidden h-full flex flex-col border border-glass-border/30 hover:border-glass-border/60 transition-all duration-200">
                        <div className="h-36 bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/80 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-brand" strokeWidth={1.5} />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-subhead font-bold text-ink mb-1">{p.name}</h3>
                          <p className="text-caption text-ink-tertiary line-clamp-1 mb-2 flex-1">{p.description}</p>
                          <p className="text-subhead font-bold text-ink tracking-tight">{formatPrice(p.price.amount, selectedCurrency)}</p>
                        </div>
                      </div>
                    </button>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </ParallaxSection>
        </section>
      )}
    </div>
  );
}
