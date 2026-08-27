import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingCart, Filter, Star, MapPin, Shield, ArrowUpRight,
  ChevronDown, Grid3X3, List, X, Package
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { formatPrice } from "../data/platform";
import { getCityPricing, resolveCityCoords, getCitiesByCountry, COUNTRIES } from "../data/delivery";
import type { TrackedOrder } from "../data/delivery";
import { Product, Currency, BirichiNexView } from "../types";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { postedInventoryToProducts } from "../lib/inventoryListings";

interface MarketplacePageProps {
  onNavigate?: (view: BirichiNexView) => void;
}

export default function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const { selectedCurrency, addToCart, cart, removeFromCart, clearCart, addOrder, earnPointsFromPurchase, addNotification, user, wallet, spendWalletFunds } = useStore();
  const inventoryItems = useStore((s) => s.inventoryItems);
  const profile = useStore((s) => s.settings.profile);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [destCountry, setDestCountry] = useState("Kenya");
  const [destCity, setDestCity] = useState("Nairobi");
  const [destZone, setDestZone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cod">("wallet");
  const [checkoutError, setCheckoutError] = useState("");
  const [placing, setPlacing] = useState(false);

  const CATEGORIES = ["All", ...new Set(inventoryItems.map((i) => i.category))];
  const catalogProducts = postedInventoryToProducts(inventoryItems);

  const filtered = catalogProducts.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);

  const destPricing = getCityPricing(destCity, destCountry);
  const destCities = getCitiesByCountry(destCountry);
  const estWeightKg = cart.reduce((sum, item) => {
    const specWeight = parseFloat(String(item.product.specifications?.weight ?? "").replace(/[^\d.]/g, ""));
    const perUnit = Number.isFinite(specWeight) && specWeight > 0 ? Math.min(specWeight, 25) : 1;
    return sum + perUnit * item.quantity;
  }, 0);
  const deliveryCost = destPricing
    ? Math.round(destPricing.standardDelivery + (destPricing.zones[0]?.pricePerKg ?? 20) * Math.min(estWeightKg, 50))
    : 0;
  const orderTotal = cartSubtotal + deliveryCost;

  const handleDestCountryChange = (country: string) => {
    setDestCountry(country);
    const cities = getCitiesByCountry(country);
    const fallback = cities[0]?.city ?? "";
    setDestCity(fallback);
    setDestZone("");
    setCheckoutError("");
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError("");
    if (!destPricing) {
      setCheckoutError("Please select a valid delivery destination.");
      return;
    }
    if (paymentMethod === "wallet" && wallet.balance < orderTotal) {
      setCheckoutError(`Insufficient wallet balance (${formatPrice(wallet.balance, selectedCurrency)}). Top up or choose Cash on Delivery.`);
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      const now = new Date();
      const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
      const trackingNumber = `PM-TRK-${ymd}-${seq}`;
      const originCity = profile.city || "Market HQ";
      const originCountry = "Tanzania";
      const originCoords = resolveCityCoords(originCity, originCountry);
      const destCoords = destPricing
        ? { lat: destPricing.lat, lng: destPricing.lng, zone: destZone || (destPricing.zones[0]?.name ?? destPricing.city) }
        : { lat: resolveCityCoords(destCity, destCountry).lat, lng: resolveCityCoords(destCity, destCountry).lng, zone: "CBD" };

      if (paymentMethod === "wallet") {
        const spent = spendWalletFunds(orderTotal, `Marketplace order · ${destCity}`);
        if (!spent) {
          setPlacing(false);
          setCheckoutError("Wallet charge failed. Please top up and try again.");
          return;
        }
      }

      const first = cart[0];
      const order: TrackedOrder = {
        id: `ord-${Date.now()}`,
        kind: "order",
        productName: cart.length > 1 ? `${first.product.name} +${cart.length - 1} more` : first.product.name,
        productImage: "📦",
        quantity: cartItemCount,
        totalAmount: orderTotal,
        currency: selectedCurrency,
        status: "placed",
        originCity,
        originCountry,
        destinationCity: destPricing.city,
        destinationCountry: destPricing.country,
        destinationZone: destCoords.zone,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        currentLat: originCoords.lat,
        currentLng: originCoords.lng,
        trackingNumber,
        carrier: "BirichiNex Logistics",
        createdAt: now.toISOString(),
        estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          { status: "placed", timestamp: now.toISOString(), location: originCity, lat: originCoords.lat, lng: originCoords.lng, note: "Order placed successfully" },
          { status: "confirmed", timestamp: new Date(now.getTime() + 15 * 60000).toISOString(), location: originCity, lat: originCoords.lat, lng: originCoords.lng, note: "Order confirmed — preparing your items" },
        ],
        customerName: user?.name ?? "Storefront Buyer",
        customerPhone: "",
      };
      addOrder(order);
      earnPointsFromPurchase(orderTotal);
      addNotification({
        title: "Order placed",
        body: `${order.productName} (${formatPrice(orderTotal, selectedCurrency)}) is on its way. Track it in Orders.`,
        type: "order",
        actionView: "orders",
      });
      clearCart();
      setPlacing(false);
      setCartOpen(false);
      onNavigate?.("orders");
    }, 600);
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
            Live products from this shop's inventory — posted items appear here instantly.
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
                onClick={() => setCartOpen(true)}
                className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 text-ink-secondary hover:text-ink flex items-center justify-center transition-all duration-200 border border-glass-border"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-emphasis text-on-emphasis text-[10px] font-bold flex items-center justify-center"
              >
                {cartItemCount}
              </motion.span>
            </motion.div>
          )}
          <button
            onClick={() => setView("grid")}
            className={`h-9 w-9 rounded-[10px] flex items-center justify-center transition-all duration-200 ${view === "grid" ? "bg-emphasis text-on-emphasis" : "bg-surface-secondary/80 text-ink-secondary hover:text-ink"}`}
          >
            <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`h-9 w-9 rounded-[10px] flex items-center justify-center transition-all duration-200 ${view === "list" ? "bg-emphasis text-on-emphasis" : "bg-surface-secondary/80 text-ink-secondary hover:text-ink"}`}
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
                ? "bg-emphasis text-on-emphasis"
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
              <GlassCard padding="none" hover onClick={() => setSelectedProduct(product)} className="group overflow-hidden h-full flex flex-col">
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
                    <ArrowUpRight className="h-4 w-4 text-ink-quaternary shrink-0 mt-0.5 group-hover:text-brand transition-colors" strokeWidth={1.5} />
                  </div>
                  <p className="text-caption text-ink-tertiary line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center gap-1.5 text-caption text-ink-tertiary mb-3">
                    <MapPin className="h-3 w-3 text-brand" strokeWidth={1.5} />
                    <span>{product.origin}</span>
                    {product.supplier.verified && (
                      <Shield className="h-3 w-3 text-success" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div>
                      <p className="text-title font-bold text-ink tracking-tight">{formatPrice(product.price.amount, selectedCurrency)}</p>
                      <p className="text-caption text-ink-quaternary">per unit</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                        Details
                      </Button>
                      <MagneticButton strength={0.2}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<ShoppingCart className="h-3.5 w-3.5" />}
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        >
                          Add to Cart
                        </Button>
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
              </TiltCard>
            ) : (
              <TiltCard intensity={5}>
              <GlassCard padding="md" hover onClick={() => setSelectedProduct(product)} className="flex items-center gap-5 overflow-hidden">
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
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSelectedProduct(product)}>
                  Details
                </Button>
                <MagneticButton strength={0.2}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ShoppingCart className="h-3.5 w-3.5" />}
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  >
                    Add
                  </Button>
                </MagneticButton>
              </GlassCard>
              </TiltCard>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="h-14 w-14 rounded-[18px] bg-surface-secondary/70 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-ink-quaternary" strokeWidth={1.5} />
            </div>
            <p className="text-subhead font-bold text-ink">No products found</p>
            <p className="text-caption text-ink-tertiary mt-1">Try a different search or category.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-[11px] bg-emphasis text-on-emphasis text-caption font-semibold hover:bg-emphasis/90 transition-colors"
            >
              Clear filters <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      </CursorSpotlight>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-scrim backdrop-blur-md"
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


      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-scrim backdrop-blur-md"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-material-lg specular-sheen rounded-[24px] max-w-lg w-full overflow-hidden"
            >
              <div className="p-7">
                <>
                  <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-overline font-bold uppercase tracking-[0.15em] text-brand-dark">Your cart</p>
                        <h2 className="text-title font-bold text-ink tracking-tight">
                          {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
                        </h2>
                      </div>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="h-8 w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {cart.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="h-12 w-12 rounded-[16px] bg-surface-secondary/70 flex items-center justify-center mx-auto mb-3">
                          <ShoppingCart className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
                        </div>
                        <p className="text-callout text-ink-tertiary">Your cart is empty</p>
                        <p className="text-caption text-ink-quaternary mt-1">Add products to get started.</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                          {cart.map((item, i) => (
                            <div key={item.id} className="flex items-center gap-3 bg-surface-secondary/50 border border-glass-border rounded-[14px] p-3">
                              <div className="h-11 w-11 rounded-[12px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                                <ShoppingCart className="h-4 w-4 text-brand" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-caption font-bold text-ink truncate">{item.product.name}</p>
                                <p className="text-caption text-ink-quaternary mt-0.5">
                                  {item.quantity} × {formatPrice(item.unitPrice.amount, selectedCurrency)}
                                </p>
                              </div>
                              <p className="text-caption font-bold text-ink shrink-0">
                                {formatPrice(item.unitPrice.amount * item.quantity, selectedCurrency)}
                              </p>
                              <button
                                onClick={() => removeFromCart(i)}
                                className="h-7 w-7 rounded-full bg-surface/80 flex items-center justify-center text-ink-quaternary hover:text-error transition-colors shrink-0"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-glass-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-ink-tertiary">Deliver to</span>
                            <span className="text-caption font-semibold text-ink">{destCity}, {destCountry}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={destCountry}
                              onChange={(e) => handleDestCountryChange(e.target.value)}
                              className="h-10 px-2.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                            >
                              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select
                              value={destCity}
                              onChange={(e) => { setDestCity(e.target.value); setDestZone(""); setCheckoutError(""); }}
                              className="h-10 px-2.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                            >
                              {destCities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                            </select>
                          </div>
                          {destPricing && destPricing.zones.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-caption text-ink-tertiary">Delivery zone</span>
                              <select
                                value={destZone}
                                onChange={(e) => { setDestZone(e.target.value); setCheckoutError(""); }}
                                className="h-9 px-2.5 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 max-w-[160px]"
                              >
                                <option value="">Fastest</option>
                                {destPricing.zones.map((z) => <option key={z.id} value={z.name}>{z.name}</option>)}
                              </select>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-ink-tertiary">Subtotal</span>
                            <span className="text-caption font-bold text-ink">{formatPrice(cartSubtotal, selectedCurrency)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-ink-tertiary">Shipping</span>
                            <span className="text-caption font-semibold text-ink">{deliveryCost > 0 ? formatPrice(deliveryCost, selectedCurrency) : "Free"}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-glass-border pt-2">
                            <span className="text-caption font-bold text-ink">Total</span>
                            <span className="text-subhead font-bold text-ink">{formatPrice(orderTotal, selectedCurrency)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {([
                              { id: "wallet" as const, label: "Wallet", balance: wallet.balance },
                              { id: "cod" as const, label: "Cash on Delivery" },
                            ]).map((m) => (
                              <button
                                key={m.id}
                                onClick={() => { setPaymentMethod(m.id); setCheckoutError(""); }}
                                className={`flex-1 h-10 rounded-[10px] border text-[12px] font-semibold transition-colors ${
                                  paymentMethod === m.id
                                    ? "border-brand bg-brand/10 text-brand"
                                    : "border-glass-border text-ink-tertiary hover:text-ink-secondary"
                                }`}
                              >
                                {m.label}
                                {"balance" in m && m.balance !== undefined && ` · ${formatPrice(m.balance, selectedCurrency)}`}
                              </button>
                            ))}
                          </div>

                          {checkoutError && (
                            <p className="text-[12px] text-error">{checkoutError}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-5">
                          <Button variant="secondary" size="lg" fullWidth onClick={() => setCartOpen(false)}>
                            Keep browsing
                          </Button>
                          <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            icon={<Package className="h-4 w-4" />}
                            onClick={handleCartCheckout}
                            disabled={placing}
                          >
                            {placing ? "Placing order…" : paymentMethod === "wallet" ? `Pay ${formatPrice(orderTotal, selectedCurrency)}` : "Place Order"}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
