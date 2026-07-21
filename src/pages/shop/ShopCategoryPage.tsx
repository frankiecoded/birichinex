import { useState, useRef, MouseEvent } from "react";
import { motion } from "motion/react";
import {
  Search, ShoppingBag, Star, MapPin, Shield, X, Grid3X3, List, ChevronRight
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import { PRODUCTS, TECH_PRODUCTS, formatPrice } from "../../data/platform";
import { Currency, Product } from "../../types";
import TiltCard from "../../components/three/TiltCard";
import CursorSpotlight from "../../components/three/CursorSpotlight";

interface ShopCategoryPageProps {
  categoryPath: string;
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

// Interactive Product Card for Category Grid
function CategoryProductCard({ product, selectedCurrency, onNavigate, onAddToCart, index, viewMode }: {
  product: Product;
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
  index: number;
  viewMode: "grid" | "list";
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

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

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -6;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 6;
    setTransform(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`);
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setHovering(false);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => onNavigate(`product:${product.id}`)}
          className="w-full text-left"
        >
          <div className="glass-material rounded-[16px] p-5 flex items-center gap-5 border border-glass-border/30 hover:border-glass-border/60 transition-all duration-200 group">
            <div className="h-16 w-16 rounded-[14px] flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: `${color}10` }}>
              <ShoppingBag className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                mixBlendMode: "screen"
              }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-subhead font-bold text-ink truncate group-hover:text-brand-dark transition-colors">{product.name}</h3>
                <Badge variant="brand" size="sm">{product.grade}</Badge>
              </div>
              <p className="text-caption text-ink-tertiary truncate">{product.description}</p>
            </div>
            <p className="text-title font-bold text-ink shrink-0 tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onNavigate(`product:${product.id}`)}
        className="cursor-pointer group"
        style={{ transform, transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)", transformStyle: "preserve-3d" }}
      >
        <div className="glass-material rounded-[20px] overflow-hidden h-full flex flex-col border border-glass-border/30 hover:border-glass-border/60 transition-all duration-300">
          {/* Product Visual */}
          <div className="relative h-48 bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/80 flex items-center justify-center overflow-hidden">
            <motion.div
              className="h-14 w-14 rounded-[16px] flex items-center justify-center"
              style={{ background: `${color}10` }}
              whileHover={{ scale: 1.1, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <ShoppingBag className="h-6 w-6" style={{ color }} strokeWidth={1.5} />
            </motion.div>

            <div className="absolute top-3 right-3">
              <Badge variant="brand" size="sm">{product.grade}</Badge>
            </div>

            {/* Quick add */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={hovering ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="absolute bottom-3 right-3 h-9 w-9 rounded-[10px] bg-ink/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>

            {/* Specular glare */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
              mixBlendMode: "screen"
            }} />
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1">
            <p className="text-caption text-ink-tertiary mb-1">{product.category}</p>
            <h3 className="text-subhead font-bold text-ink mb-1 leading-tight group-hover:text-brand-dark transition-colors duration-200">{product.name}</h3>
            <p className="text-caption text-ink-tertiary line-clamp-2 mb-3 flex-1 leading-relaxed">{product.description}</p>
            <div className="flex items-center gap-1.5 text-caption text-ink-tertiary mb-3">
              <MapPin className="h-3 w-3 text-brand" strokeWidth={1.5} />
              <span>{product.origin}</span>
              {product.supplier.verified && <Shield className="h-3 w-3 text-success" strokeWidth={1.5} />}
            </div>

            <div className="glass-divider mb-3" />

            <div className="flex items-end justify-between">
              <p className="text-title font-bold text-ink tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-brand fill-brand" />
                <span className="text-caption font-bold text-ink">{product.supplier.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopCategoryPage({ categoryPath, selectedCurrency, onNavigate, onAddToCart }: ShopCategoryPageProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const parts = categoryPath.split(":");
  const ecosystemId = parts[1];
  const subcategory = parts[2];

  const allProducts = ecosystemId === "technology" ? TECH_PRODUCTS : PRODUCTS;
  const ecosystemLabel = ecosystemId === "technology" ? "Technology" : "Fashion";

  const filtered = allProducts.filter((p) => {
    const matchesSub = !subcategory || p.category === subcategory;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesSub && matchesSearch;
  });

  const categories = [...new Set(allProducts.map((p) => p.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 text-caption text-ink-tertiary"
      >
        <button onClick={() => onNavigate("home")} className="hover:text-ink transition-colors">Home</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-semibold">{ecosystemLabel}</span>
        {subcategory && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink font-semibold">{subcategory}</span>
          </>
        )}
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-headline text-ink tracking-tight">
          {subcategory || ecosystemLabel}
        </h1>
        <p className="text-callout text-ink-tertiary mt-1.5">
          {filtered.length} products · Premium European-grade quality
        </p>
      </motion.div>

      {/* Subcategory Pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        <button
          onClick={() => onNavigate(`category:${ecosystemId}`)}
          className={`shrink-0 px-4 h-9 rounded-full text-subhead font-semibold transition-all duration-200 ${
            !subcategory
              ? "bg-ink text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              : "bg-surface/72 text-ink-secondary hover:bg-surface-secondary/80 border border-glass-border/60"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onNavigate(`category:${ecosystemId}:${cat}`)}
            className={`shrink-0 px-4 h-9 rounded-full text-subhead font-semibold transition-all duration-200 ${
              subcategory === cat
                ? "bg-ink text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                : "bg-surface/72 text-ink-secondary hover:bg-surface-secondary/80 border border-glass-border/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 h-11 px-4 bg-surface/72 backdrop-blur-md rounded-[14px] border border-glass-border/50 transition-all focus-within:border-brand/30 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.06)]"
      >
        <Search className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-quaternary focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-ink-quaternary hover:text-ink transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-caption text-ink-tertiary font-semibold">{filtered.length} products</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView("grid")}
            className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-all ${view === "grid" ? "bg-ink text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" : "bg-surface-secondary/80 text-ink-secondary hover:bg-surface-secondary"}`}
          >
            <Grid3X3 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-all ${view === "list" ? "bg-ink text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" : "bg-surface-secondary/80 text-ink-secondary hover:bg-surface-secondary"}`}
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Products */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
          </div>
          <p className="text-title text-ink mb-2">No products found</p>
          <p className="text-callout text-ink-quaternary">Try adjusting your search or filters</p>
        </div>
      ) : (
        <CursorSpotlight spotlightSize={600} spotlightColor="rgba(212,175,55,0.03)">
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-3"}>
            {filtered.map((product, i) => (
              <CategoryProductCard
                key={product.id}
                product={product}
                selectedCurrency={selectedCurrency}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
                index={i}
                viewMode={view}
              />
            ))}
          </div>
        </CursorSpotlight>
      )}
    </div>
  );
}
