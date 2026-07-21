import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingCart, Filter, Star, MapPin, Shield, ArrowUpRight,
  ChevronDown, Grid3X3, List, X, Package
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { PRODUCTS, BALES, formatPrice } from "../data/platform";
import { Product, Currency, BirichiNexView } from "../types";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";

const CATEGORIES = [
  "All", "Men's Fashion", "Women's Fashion", "Kids", "Sportswear",
  "Leather", "Accessories", "Jackets"
];

interface MarketplacePageProps {
  onNavigate?: (view: BirichiNexView) => void;
}

export default function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const { selectedCurrency, addToCart, cart } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sourcingBale, setSourcingBale] = useState<typeof BALES[number] | null>(null);
  const [sourcingForm, setSourcingForm] = useState({ quantity: "1", name: "", phone: "", notes: "" });
  const [sourcingSent, setSourcingSent] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSourcingSubmit = () => {
    setSourcingSent(true);
    setTimeout(() => {
      setSourcingBale(null);
      setSourcingForm({ quantity: "1", name: "", phone: "", notes: "" });
      setSourcingSent(false);
    }, 2500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[60px] animate-[orbFloat_20s_ease-in-out_infinite]" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.05)_0%,transparent_70%)] blur-[60px] animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative z-10"
      >
        <div>
          <h1 className="text-headline text-gradient-brand tracking-tight">Marketplace</h1>
          <p className="text-callout text-ink-tertiary mt-1">
            22 professionally sorted fashion categories with European-grade pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini Cart Indicator */}
          {cartItemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <button
                onClick={() => onNavigate?.("payments")}
                className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 text-ink-secondary hover:text-ink flex items-center justify-center transition-all duration-200 border border-glass-border"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center"
              >
                {cartItemCount}
              </motion.span>
            </motion.div>
          )}
          <button
            onClick={() => setView("grid")}
            className={`h-9 w-9 rounded-[10px] flex items-center justify-center transition-all duration-200 ${view === "grid" ? "bg-ink text-white" : "bg-surface-secondary/80 text-ink-secondary hover:text-ink"}`}
          >
            <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`h-9 w-9 rounded-[10px] flex items-center justify-center transition-all duration-200 ${view === "list" ? "bg-ink text-white" : "bg-surface-secondary/80 text-ink-secondary hover:text-ink"}`}
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 h-11 px-4 bg-surface/72 backdrop-blur-md rounded-[14px] border border-glass-border transition-all focus-within:border-brand/30 focus-within:bg-surface/90">
          <Search className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products, categories, suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-quaternary focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-ink-quaternary hover:text-ink transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 h-9 rounded-full text-subhead font-semibold transition-all duration-200 ${
              category === cat
                ? "bg-ink text-white"
                : "bg-surface/72 text-ink-secondary hover:bg-surface-secondary/80 hover:text-ink border border-glass-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Products Grid */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
      <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-3"}>
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "grid" ? (
              <TiltCard intensity={8} className="h-full">
              <GlassCard padding="none" hover className="overflow-hidden h-full flex flex-col">
                {/* Product Image Placeholder */}
                <div className="relative h-44 bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/80 flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-1.5 relative z-10">
                    <div className="h-12 w-12 rounded-[14px] bg-brand/10 flex items-center justify-center mx-auto">
                      <ShoppingCart className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <p className="text-caption text-ink-quaternary font-medium">{product.category}</p>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="brand" size="sm">{product.grade}</Badge>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-subhead font-bold text-ink leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-caption text-ink-tertiary line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center gap-1.5 text-caption text-ink-tertiary mb-3">
                    <MapPin className="h-3 w-3 text-brand" strokeWidth={1.5} />
                    <span>{product.origin}</span>
                    {product.supplier.verified && (
                      <Shield className="h-3 w-3 text-success" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-title font-bold text-ink tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
                      <p className="text-caption text-ink-quaternary">per unit</p>
                    </div>
                    <MagneticButton strength={0.2}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<ShoppingCart className="h-3.5 w-3.5" />}
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
              </TiltCard>
            ) : (
              <TiltCard intensity={5}>
              <GlassCard padding="md" hover className="flex items-center gap-5 overflow-hidden">
                <div className="h-16 w-16 rounded-[14px] bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/80 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-subhead font-bold text-ink truncate">{product.name}</h3>
                    <Badge variant="brand" size="sm">{product.grade}</Badge>
                  </div>
                  <p className="text-caption text-ink-tertiary truncate">{product.description}</p>
                </div>
                <p className="text-title font-bold text-ink shrink-0 tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
                <MagneticButton strength={0.2}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ShoppingCart className="h-3.5 w-3.5" />}
                    onClick={() => addToCart(product)}
                  >
                    Add
                  </Button>
                </MagneticButton>
              </GlassCard>
              </TiltCard>
            )}
          </motion.div>
        ))}
      </div>
      </CursorSpotlight>

      {/* Bales Section */}
      <div className="pt-6">
        <div className="glass-divider mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6">
            <h2 className="text-title font-bold text-ink tracking-tight">Premium Compressed Bales</h2>
            <p className="text-callout text-ink-tertiary mt-1">Perfect for retail scaling, market stalls, and county wholesalers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {BALES.map((bale, i) => (
              <motion.div
                key={bale.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard padding="md" hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-subhead font-bold text-ink">{bale.name}</h3>
                    {bale.badge && <Badge variant="brand" size="sm">{bale.badge}</Badge>}
                  </div>
                  <div className="bg-surface-secondary/60 rounded-[12px] p-3 text-center mb-4">
                    <p className="text-title font-bold text-ink tracking-tight">{formatPrice(bale.priceTZS, selectedCurrency)}</p>
                    <p className="text-caption text-ink-quaternary mt-0.5">~{bale.estimatedPieces} pieces</p>
                  </div>
                  <div className="space-y-2 text-caption text-ink-secondary mb-4 flex-1">
                    <p><span className="font-semibold text-ink">Weight:</span> {bale.weight}</p>
                    <p><span className="font-semibold text-ink">Ideal For:</span> {bale.idealCustomer}</p>
                  </div>
                  <Button variant="primary" size="sm" fullWidth onClick={() => setSourcingBale(bale)}>
                    Source Bale
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-material-lg specular-sheen rounded-[24px] max-w-lg w-full overflow-hidden"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="brand" size="sm" className="mb-2">{selectedProduct.grade}</Badge>
                    <h2 className="text-title font-bold text-ink tracking-tight">{selectedProduct.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="h-8 w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-callout text-ink-secondary mb-4">{selectedProduct.description}</p>
                <div className="grid grid-cols-2 gap-3 text-caption mb-6">
                  {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                    <div key={key} className="bg-surface-secondary/60 rounded-[10px] p-3">
                      <p className="text-ink-quaternary uppercase text-[10px] font-bold">{key}</p>
                      <p className="text-ink font-semibold mt-0.5">{String(val)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-headline font-bold text-ink tracking-tight">{formatPrice(selectedProduct.price.amount, selectedCurrency)}</p>
                  <Button variant="primary" size="lg" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sourcing Request Modal */}
      <AnimatePresence>
        {sourcingBale && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={() => { if (!sourcingSent) { setSourcingBale(null); setSourcingForm({ quantity: "1", name: "", phone: "", notes: "" }); } }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-material-lg specular-sheen rounded-[24px] max-w-md w-full overflow-hidden"
            >
              <div className="p-7">
                {sourcingSent ? (
                  <div className="text-center py-6">
                    <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <Package className="h-7 w-7 text-success" strokeWidth={1.5} />
                    </div>
                    <p className="text-subhead font-bold text-ink">Sourcing Request Submitted!</p>
                    <p className="text-caption text-ink-tertiary mt-1">Our team will contact you within 24 hours to confirm your order.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="brand" size="sm" className="mb-2">Sourcing Request</Badge>
                        <h2 className="text-title font-bold text-ink tracking-tight">{sourcingBale.name}</h2>
                        <p className="text-caption text-ink-tertiary mt-0.5">{sourcingBale.weight} · ~{sourcingBale.estimatedPieces} pieces</p>
                      </div>
                      <button onClick={() => { setSourcingBale(null); setSourcingForm({ quantity: "1", name: "", phone: "", notes: "" }); }} className="h-8 w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-caption font-semibold text-ink-secondary block mb-1.5">Quantity (bales)</label>
                        <input
                          type="number"
                          min="1"
                          value={sourcingForm.quantity}
                          onChange={(e) => setSourcingForm((f) => ({ ...f, quantity: e.target.value }))}
                          className="w-full h-10 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-ink-secondary block mb-1.5">Your name</label>
                        <input
                          type="text"
                          value={sourcingForm.name}
                          onChange={(e) => setSourcingForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Frank Musau"
                          className="w-full h-10 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-ink-secondary block mb-1.5">Phone number</label>
                        <input
                          type="tel"
                          value={sourcingForm.phone}
                          onChange={(e) => setSourcingForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+255 700 000 000"
                          className="w-full h-10 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-ink-secondary block mb-1.5">Notes (optional)</label>
                        <textarea
                          value={sourcingForm.notes}
                          onChange={(e) => setSourcingForm((f) => ({ ...f, notes: e.target.value }))}
                          rows={2}
                          placeholder="Preferred delivery date, special requirements..."
                          className="w-full px-4 py-2.5 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                        />
                      </div>
                    </div>

                    <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={handleSourcingSubmit} disabled={!sourcingForm.name.trim() || !sourcingForm.phone.trim()}>
                      Submit Sourcing Request
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
