import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Search,
  ShoppingCart,
  Truck,
  Check,
  X,
  Star,
  Filter,
  ArrowUpRight,
  Clock,
  DollarSign,
  Percent,
  Eye,
  Box,
  Tag,
  AlertCircle,
  CheckCircle2,
  Store,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { DROPSHIP_TIERS, formatPrice } from "../data/platform";
import { useStore } from "../store/useStore";
import type { DropshippingTier, DropshipOrderStatus, DropshipProduct } from "../types";

const TIER_ORDER: DropshippingTier[] = ["starter", "growth", "pro", "enterprise"];

const STATUS_STYLES: Record<string, { variant: "info" | "brand" | "warning" | "success" | "default" | "error"; label: string }> = {
  placed: { variant: "info", label: "Placed" },
  confirmed: { variant: "brand", label: "Confirmed" },
  sourcing: { variant: "warning", label: "Sourcing" },
  "quality-check": { variant: "warning", label: "Quality Check" },
  packed: { variant: "brand", label: "Packed" },
  shipped: { variant: "success", label: "Shipped" },
  "in-transit": { variant: "success", label: "In Transit" },
  delivered: { variant: "success", label: "Delivered" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
  refunded: { variant: "error", label: "Refunded" },
};

const ORDER_FILTER_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ORDER_FILTER_MAP: Record<string, DropshipOrderStatus[]> = {
  active: ["placed", "confirmed", "sourcing", "quality-check", "packed", "shipped", "in-transit"],
  completed: ["delivered", "completed"],
  cancelled: ["cancelled", "refunded"],
};

const ALL_CATEGORIES: string[] = [];

export default function DropshippingPage() {
  const dropshipSubscription = useStore((s) => s.dropshipSubscription);
  const subscribeDropship = useStore((s) => s.subscribeDropship);
  const dropshipOrders = useStore((s) => s.dropshipOrders);
  const placeDropshipOrder = useStore((s) => s.placeDropshipOrder);
  const updateDropshipOrderStatus = useStore((s) => s.updateDropshipOrderStatus);
  const cancelDropshipOrder = useStore((s) => s.cancelDropshipOrder);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const addToCart = useStore((s) => s.addToCart);
  const addToInventoryFromDropship = useStore((s) => s.addToInventoryFromDropship);
  const creditWalletRevenue = useStore((s) => s.creditWalletRevenue);
  const addNotification = useStore((s) => s.addNotification);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [subscribeModal, setSubscribeModal] = useState<DropshippingTier | null>(null);
  const [orderDetailModal, setOrderDetailModal] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<DropshipProduct | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<"deliver" | "store">("deliver");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  const currentTierConfig = useMemo(
    () => DROPSHIP_TIERS.find((t) => t.tier === dropshipSubscription.tier) ?? DROPSHIP_TIERS[0],
    [dropshipSubscription.tier]
  );

  const filteredProducts = useMemo(() => {
    return [] as DropshipProduct[];
  }, [searchQuery, categoryFilter]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return dropshipOrders;
    const statuses = ORDER_FILTER_MAP[orderStatusFilter];
    if (!statuses) return dropshipOrders;
    return dropshipOrders.filter((o) => statuses.includes(o.status));
  }, [dropshipOrders, orderStatusFilter]);

  const stats = useMemo(() => {
    const totalOrders = dropshipOrders.length;
    const totalRevenue = dropshipOrders.reduce((sum, o) => sum + o.total.amount, 0);
    const activeProducts = 0;
    const discount = currentTierConfig.discount;
    return { totalOrders, totalRevenue, activeProducts, discount };
  }, [dropshipOrders, currentTierConfig]);

  const handleSubscribe = (tier: DropshippingTier) => {
    subscribeDropship(tier);
    setSubscribeModal(null);
  };

  const handleAddToDropship = (product: DropshipProduct) => {
    const retailProduct = {
      id: product.sourceProductId,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.retailPrice,
      images: product.images,
      supplier: { id: "sup-dropship", name: "BirichiNex Supplier Network", verified: true, rating: 4.8, location: "" },
      grade: product.grade,
      origin: product.origin,
      specifications: {},
      stock: product.stock,
      minOrder: 1,
      createdAt: new Date().toISOString(),
    };
    addToCart(retailProduct);
  };

  const handlePlaceOrder = (product: DropshipProduct) => {
    const qty = checkoutQuantity;
    const totalAmount = product.dropshipPrice.amount * qty;
    placeDropshipOrder({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.dropshipPrice,
      total: { amount: totalAmount, currency: product.dropshipPrice.currency },
      status: fulfillmentType === "store" ? "completed" : "placed",
      fulfillmentType,
      customerName: fulfillmentType === "store" ? "Store Inventory" : customerName,
      customerAddress: fulfillmentType === "store" ? "Stored in warehouse" : customerAddress,
      estimatedDelivery: new Date(Date.now() + currentTierConfig.deliveryDays * 24 * 60 * 60 * 1000).toISOString(),
      notes: fulfillmentType === "store" ? "Added to inventory for marketplace listing" : "",
    });
    if (fulfillmentType === "store") {
      addToInventoryFromDropship(
        product.id,
        product.name,
        product.category,
        qty,
        product.dropshipPrice,
        "BirichiNex Dropship",
      );
    } else {
      // Customer sale — the retail price minus drop cost accrues to the
      // business wallet as earnings (withdrawable to the owner's bank).
      creditWalletRevenue(
        totalAmount,
        `${qty} × ${product.name} — dropship sale`,
      );
      addNotification({
        title: "Sale revenue added",
        body: `${totalAmount.toLocaleString("en-US")} TZS credited to your business wallet.`,
        type: "system",
        actionView: "payments",
      });
    }
    setCheckoutModal(null);
    setFulfillmentType("deliver");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCheckoutQuantity(1);
  };

  const getDropshipPrice = (retailAmount: number) => {
    return Math.round(retailAmount * (1 - currentTierConfig.discount / 100));
  };

  const selectedOrder = orderDetailModal ? dropshipOrders.find((o) => o.id === orderDetailModal) : null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.03)">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center max-w-2xl mx-auto"
        >
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(48,209,88,0.12)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
          <h1 className="text-headline text-gradient-brand">Dropshipping Hub</h1>
          <p className="text-callout text-ink-tertiary mt-2">
            Source from the BirichiNex supplier network at discounted prices and start selling instantly
          </p>
          <div className="mt-3">
            <Badge variant="brand" size="md" dot>
              {currentTierConfig.label} Tier
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <GlassCard variant="brand" padding="lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[14px] bg-brand/15 flex items-center justify-center">
                  <Package className="h-6 w-6 text-brand-dark" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-subhead font-bold text-ink">Current Subscription</h3>
                    <Badge variant="success" size="sm" dot>Active</Badge>
                  </div>
                  <p className="text-caption text-ink-tertiary mt-0.5">
                    {currentTierConfig.label} · {currentTierConfig.discount}% discount · {currentTierConfig.deliveryDays}-day delivery
                  </p>
                  <p className="text-caption text-ink-quaternary mt-0.5">
                    Expires {new Date(dropshipSubscription.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dropshipSubscription.tier !== "enterprise" && (
                  <MagneticButton>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowUpRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => {
                        const nextIndex = TIER_ORDER.indexOf(dropshipSubscription.tier) + 1;
                        if (nextIndex < TIER_ORDER.length) {
                          setSubscribeModal(TIER_ORDER[nextIndex]);
                        }
                      }}
                    >
                      Upgrade Plan
                    </Button>
                  </MagneticButton>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {currentTierConfig.features.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-caption text-ink-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="text-title font-bold text-ink mb-1">Subscription Tiers</h2>
            <p className="text-caption text-ink-tertiary mb-5">Choose the plan that fits your selling volume</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DROPSHIP_TIERS.map((tier, i) => {
              const isActive = tier.tier === dropshipSubscription.tier;
              const tierIndex = TIER_ORDER.indexOf(tier.tier);
              const currentIndex = TIER_ORDER.indexOf(dropshipSubscription.tier);
              const isUpgrade = tierIndex > currentIndex;
              const isDowngrade = tierIndex < currentIndex;
              const isPopular = tier.tier === "growth";

              return (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <TiltCard intensity={isPopular ? 10 : 6}>
                    <GlassCard
                      padding="none"
                      hover
                      className={`h-full flex flex-col ${
                        isPopular
                          ? "animated-gradient-border glow-brand relative overflow-hidden"
                          : ""
                      } ${isActive ? "ring-2 ring-brand/40" : ""}`}
                    >
                      {isPopular && (
                        <>
                          <div className="bg-brand text-ink text-center py-1.5 text-caption font-bold">
                            Best Value
                          </div>
                          <div className="absolute inset-0 pointer-events-none" style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)",
                            mixBlendMode: "screen",
                            opacity: 0,
                            transition: "opacity 0.5s ease",
                          }} />
                        </>
                      )}
                      <div className="p-6 flex flex-col flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          {isActive ? (
                            <Badge variant="brand" size="md" dot>
                              <Check className="h-3 w-3" /> Current Plan
                            </Badge>
                          ) : (
                            <Badge variant={tier.tier === "enterprise" ? "default" : "brand"} size="md" dot>
                              {tier.tier.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-title font-bold text-ink mb-1">{tier.label}</h3>
                        <p className="text-caption text-ink-tertiary mb-4">{tier.description}</p>

                        <div className="mb-5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-headline font-bold text-ink">
                              {formatPrice(tier.monthlyPrice, selectedCurrency)}
                            </span>
                            <span className="text-caption text-ink-quaternary">/month</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="success" size="sm">
                              <Percent className="h-3 w-3" /> {tier.discount}% off
                            </Badge>
                            <Badge variant="info" size="sm">
                              <Clock className="h-3 w-3" /> {tier.deliveryDays}d delivery
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2.5 mb-6 flex-1">
                          {tier.features.slice(0, 6).map((feature) => (
                            <div key={feature} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                              <span className="text-caption text-ink-secondary">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <MagneticButton strength={0.15} className="w-full">
                          {isActive ? (
                            <Button variant="brand" fullWidth size="lg" disabled>
                              Current Plan
                            </Button>
                          ) : isDowngrade ? (
                            <Button variant="secondary" fullWidth size="lg" onClick={() => setSubscribeModal(tier.tier)}>
                              Downgrade
                            </Button>
                          ) : tier.tier === "enterprise" ? (
                            <Button
                              variant="primary"
                              fullWidth
                              size="lg"
                              icon={<ArrowUpRight className="h-4 w-4" />}
                              iconPosition="right"
                              onClick={() => setSubscribeModal(tier.tier)}
                            >
                              Contact Sales
                            </Button>
                          ) : (
                            <Button
                              variant={isPopular ? "brand" : "primary"}
                              fullWidth
                              size="lg"
                              onClick={() => setSubscribeModal(tier.tier)}
                            >
                              {isUpgrade ? "Upgrade" : "Subscribe"}
                            </Button>
                          )}
                        </MagneticButton>
                      </div>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-title font-bold text-ink mb-1">Product Catalog</h2>
          <p className="text-caption text-ink-tertiary mb-5">Products you can dropship appear here once suppliers list them</p>

          <GlassCard padding="lg">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-ink-quaternary/40 mx-auto mb-3" strokeWidth={1} />
              <p className="text-subhead font-bold text-ink">Catalog coming soon</p>
              <p className="text-caption text-ink-tertiary mt-1 max-w-sm mx-auto leading-relaxed">
                When suppliers publish products on BirichiNex, they land here with wholesale pricing,
                discount bands, and stock counts — ready to add to your store or buy to keep in stock.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-title font-bold text-ink mb-1">Dropship Orders</h2>
          <p className="text-caption text-ink-tertiary mb-5">Track and manage your dropshipping orders</p>

          <GlassCard padding="lg">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {ORDER_FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOrderStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-[10px] text-caption font-semibold whitespace-nowrap transition-all ${
                    orderStatusFilter === tab.key
                      ? "bg-brand text-ink shadow-sm"
                      : "bg-surface-secondary/60 text-ink-tertiary hover:bg-surface-secondary"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className="ml-1.5 opacity-60">
                      {tab.key === "all"
                        ? dropshipOrders.length
                        : tab.key === "active"
                        ? dropshipOrders.filter((o) => ORDER_FILTER_MAP.active?.includes(o.status)).length
                        : tab.key === "completed"
                        ? dropshipOrders.filter((o) => ORDER_FILTER_MAP.completed?.includes(o.status)).length
                        : dropshipOrders.filter((o) => ORDER_FILTER_MAP.cancelled?.includes(o.status)).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <Truck className="h-12 w-12 text-ink-quaternary/40 mx-auto mb-3" strokeWidth={1} />
                <p className="text-subhead text-ink-tertiary">No orders yet</p>
                <p className="text-caption text-ink-quaternary mt-1">Place your first dropship order from the catalog above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusStyle = STATUS_STYLES[order.status] ?? { variant: "default" as const, label: order.status };

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[14px] bg-surface-secondary/40 hover:bg-surface-secondary/60 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-subhead font-bold text-ink truncate">{order.productName}</h4>
                          <Badge variant={statusStyle.variant} size="sm" dot>
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-caption text-ink-tertiary">
                          <span>Qty: {order.quantity}</span>
                          <span className="text-ink-quaternary">·</span>
                          <span className="font-semibold text-ink">{formatPrice(order.total.amount, selectedCurrency)}</span>
                          <span className="text-ink-quaternary">·</span>
                          <span>{order.customerName}</span>
                        </div>
                        {order.trackingNumber && (
                          <p className="text-caption text-info mt-1 font-mono">Tracking: {order.trackingNumber}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setOrderDetailModal(order.id)}
                        >
                          View
                        </Button>
                        {order.status === "placed" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateDropshipOrderStatus(order.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateDropshipOrderStatus(order.id, "shipped")}
                          >
                            Ship
                          </Button>
                        )}
                        {["placed", "confirmed"].includes(order.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelDropshipOrder(order.id)}
                          >
                            <X className="h-3.5 w-3.5 text-error" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "#007AFF" },
            { label: "Total Revenue", value: formatPrice(stats.totalRevenue, selectedCurrency), icon: DollarSign, color: "#30D158" },
            { label: "Active Products", value: stats.activeProducts.toString(), icon: Box, color: "#FF9500" },
            { label: "Current Discount", value: `${stats.discount}%`, icon: Percent, color: "#AF52DE" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <TiltCard>
                <GlassCard padding="md" hover>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                      <p className="text-title font-bold text-ink tracking-tight">{stat.value}</p>
                    </div>
                    <div className="h-9 w-9 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                      <stat.icon className="h-4 w-4" style={{ color: stat.color }} strokeWidth={2} />
                    </div>
                  </div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      <AnimatePresence>
        {subscribeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm"
            onClick={() => setSubscribeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-4"
            >
              <GlassCard padding="lg" className="space-y-5">
                {(() => {
                  const modalTier = DROPSHIP_TIERS.find((t) => t.tier === subscribeModal);
                  const isDowngradeModal = TIER_ORDER.indexOf(subscribeModal) < TIER_ORDER.indexOf(dropshipSubscription.tier);
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-title font-bold text-ink">
                          {subscribeModal === "enterprise"
                            ? "Contact Sales"
                            : isDowngradeModal
                              ? `Downgrade to ${modalTier?.label}`
                              : `Upgrade to ${modalTier?.label}`}
                        </p>
                        <button
                          onClick={() => setSubscribeModal(null)}
                          className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                        >
                          <X className="h-4 w-4 text-ink-secondary" />
                        </button>
                      </div>
                      <p className="text-callout text-ink-secondary">
                        {subscribeModal === "enterprise"
                          ? "Enterprise offers custom pricing, dedicated support, and white-glove service. Let's discuss your needs."
                          : isDowngradeModal
                            ? `Downgrade to ${modalTier?.label}? You'll move from ${currentTierConfig.label} to ${modalTier?.label} with ${modalTier?.discount}% discount. Some features may no longer be available.`
                            : `Subscribe to ${modalTier?.label} and enjoy ${modalTier?.discount}% discount with ${modalTier?.deliveryDays}-day delivery.`}
                      </p>
                      <div className="p-3 rounded-[10px] bg-surface-secondary/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-caption text-ink-tertiary">Monthly Price</span>
                          <span className="text-subhead font-bold text-ink">
                            {formatPrice(modalTier?.monthlyPrice ?? 0, selectedCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-caption text-ink-tertiary">Discount</span>
                          <span className="text-subhead font-bold text-success">
                            {modalTier?.discount}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-caption text-ink-tertiary">Delivery</span>
                          <span className="text-subhead font-bold text-info">
                            {modalTier?.deliveryDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setSubscribeModal(null)}>
                          Cancel
                        </Button>
                        <Button
                          variant={isDowngradeModal ? "secondary" : "brand"}
                          fullWidth
                          onClick={() => handleSubscribe(subscribeModal)}
                        >
                          {subscribeModal === "enterprise" ? "Request Quote" : isDowngradeModal ? "Confirm Downgrade" : "Confirm Subscription"}
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm"
            onClick={() => setOrderDetailModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <GlassCard padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-title font-bold text-ink">Order Details</p>
                  <button
                    onClick={() => setOrderDetailModal(null)}
                    className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                  >
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Order ID</span>
                    <span className="text-subhead font-semibold text-ink font-mono">{selectedOrder.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Product</span>
                    <span className="text-subhead font-semibold text-ink">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Quantity</span>
                    <span className="text-subhead font-semibold text-ink">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Unit Price</span>
                    <span className="text-subhead font-semibold text-ink">{formatPrice(selectedOrder.unitPrice.amount, selectedCurrency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Total</span>
                    <span className="text-title font-bold text-ink">{formatPrice(selectedOrder.total.amount, selectedCurrency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Status</span>
                    <Badge variant={STATUS_STYLES[selectedOrder.status]?.variant ?? "default"} size="md" dot>
                      {STATUS_STYLES[selectedOrder.status]?.label ?? selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Customer</span>
                    <span className="text-subhead font-semibold text-ink">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Address</span>
                    <span className="text-subhead text-ink text-right max-w-[200px]">{selectedOrder.customerAddress}</span>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-ink-tertiary">Tracking</span>
                      <span className="text-subhead font-semibold text-info font-mono">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Estimated Delivery</span>
                    <span className="text-subhead text-ink">
                      {new Date(selectedOrder.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-ink-tertiary">Placed</span>
                    <span className="text-subhead text-ink">
                      {new Date(selectedOrder.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex items-start justify-between">
                      <span className="text-caption text-ink-tertiary">Notes</span>
                      <span className="text-subhead text-ink text-right max-w-[200px]">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setOrderDetailModal(null)}>
                    Close
                  </Button>
                  {selectedOrder.status === "placed" && (
                    <>
                      <Button
                        variant="brand"
                        fullWidth
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => {
                          updateDropshipOrderStatus(selectedOrder.id, "confirmed");
                          setOrderDetailModal(null);
                        }}
                      >
                        Confirm
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "confirmed" && (
                    <Button
                      variant="brand"
                      fullWidth
                      icon={<Truck className="h-4 w-4" />}
                      onClick={() => {
                        updateDropshipOrderStatus(selectedOrder.id, "shipped");
                        setOrderDetailModal(null);
                      }}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {selectedOrder.status === "shipped" && (
                    <Button
                      variant="brand"
                      fullWidth
                      icon={<Check className="h-4 w-4" />}
                      onClick={() => {
                        updateDropshipOrderStatus(selectedOrder.id, "delivered");
                        setOrderDetailModal(null);
                      }}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          CHECKOUT MODAL — Fulfillment Type Selection
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {checkoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm p-4"
            onClick={() => setCheckoutModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-title font-bold text-ink">Checkout</p>
                  <button
                    onClick={() => setCheckoutModal(null)}
                    className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                  >
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>

                {/* Product summary */}
                <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-secondary/40">
                  <div className="h-12 w-12 rounded-[10px] bg-surface-secondary/60 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead font-bold text-ink truncate">{checkoutModal.name}</p>
                    <p className="text-caption text-ink-tertiary">{checkoutModal.category} · {checkoutModal.origin}</p>
                  </div>
                  <span className="text-subhead font-bold text-ink shrink-0">{formatPrice(checkoutModal.dropshipPrice.amount, selectedCurrency)}</span>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCheckoutQuantity(Math.max(1, checkoutQuantity - 1))}
                      className="h-10 w-10 rounded-[10px] bg-surface-secondary/60 border border-glass-border flex items-center justify-center text-ink hover:bg-surface-secondary transition-colors"
                    >
                      −
                    </button>
                    <span className="text-subhead font-bold text-ink w-12 text-center">{checkoutQuantity}</span>
                    <button
                      onClick={() => setCheckoutQuantity(checkoutQuantity + 1)}
                      className="h-10 w-10 rounded-[10px] bg-surface-secondary/60 border border-glass-border flex items-center justify-center text-ink hover:bg-surface-secondary transition-colors"
                    >
                      +
                    </button>
                    <span className="text-caption text-ink-tertiary ml-auto">
                      Total: <span className="font-bold text-ink">{formatPrice(checkoutModal.dropshipPrice.amount * checkoutQuantity, selectedCurrency)}</span>
                    </span>
                  </div>
                </div>

                {/* Fulfillment Type */}
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-2">Fulfillment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFulfillmentType("deliver")}
                      className={`p-3 rounded-[14px] border text-left transition-all duration-200 ${
                        fulfillmentType === "deliver"
                          ? "bg-brand/5 border-brand/30 shadow-[0_0_0_1px_rgba(212,175,55,0.2)]"
                          : "bg-surface-secondary/40 border-glass-border/30 hover:border-glass-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-4 w-4" style={{ color: fulfillmentType === "deliver" ? "#d4af37" : "#8e8e93" }} strokeWidth={1.5} />
                        <span className="text-caption font-bold text-ink">Deliver</span>
                      </div>
                      <p className="text-[11px] text-ink-tertiary">Ship directly to customer</p>
                    </button>
                    <button
                      onClick={() => setFulfillmentType("store")}
                      className={`p-3 rounded-[14px] border text-left transition-all duration-200 ${
                        fulfillmentType === "store"
                          ? "bg-brand/5 border-brand/30 shadow-[0_0_0_1px_rgba(212,175,55,0.2)]"
                          : "bg-surface-secondary/40 border-glass-border/30 hover:border-glass-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="h-4 w-4" style={{ color: fulfillmentType === "store" ? "#d4af37" : "#8e8e93" }} strokeWidth={1.5} />
                        <span className="text-caption font-bold text-ink">Store</span>
                      </div>
                      <p className="text-[11px] text-ink-tertiary">Add to inventory</p>
                    </button>
                  </div>
                </div>

                {/* Customer info (deliver only) */}
                {fulfillmentType === "deliver" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Customer Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full h-10 pl-10 pr-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                          placeholder="Customer full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full h-10 pl-10 pr-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                          placeholder="+255 700 000 000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                        <textarea
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full h-16 pl-10 pr-3 py-2 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                          placeholder="Full delivery address"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {fulfillmentType === "store" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-[12px] bg-success/5 border border-success/10"
                  >
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 text-success shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-caption font-bold text-ink">Store in Inventory</p>
                        <p className="text-[11px] text-ink-tertiary mt-0.5">
                          {checkoutQuantity} units will be added to your inventory. You can then post them to the marketplace for sale.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setCheckoutModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    fullWidth
                    disabled={fulfillmentType === "deliver" && (!customerName || !customerAddress)}
                    onClick={() => handlePlaceOrder(checkoutModal)}
                  >
                    {fulfillmentType === "store" ? "Add to Inventory" : "Place Order"}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
