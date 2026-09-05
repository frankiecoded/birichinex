import { useState, useRef, useEffect, MouseEvent } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight, Truck, Shield, RotateCcw, Sparkles, Bot,
  Star, ChevronRight, ShoppingBag, Zap, Award, TrendingUp,
  Headset, Wallet, Coins, LayoutDashboard, BarChart3, Package,
  Repeat, Store, GraduationCap, LineChart, PhoneCall, MessageCircle,
  CreditCard, MapPin, Globe, Check, BookOpen, Rocket, Users, Trophy
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../data/platform";
import { Currency, Product, BirichiNexView } from "../../types";
import { useStore } from "../../store/useStore";
import { postedInventoryToProducts } from "../../lib/inventoryListings";
import ParticleField from "../../components/three/ParticleField";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import MagneticButton from "../../components/three/MagneticButton";
import ParallaxSection from "../../components/three/ParallaxSection";
import TiltCard from "../../components/three/TiltCard";

interface ShopHomePageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
  onOpenAiSetup: () => void;
  onNavigateBusiness: (view: BirichiNexView) => void;
}

// Business tools showcased on the home page (each answers "how does it run my business?")
const BUSINESS_TOOLS: { view: BirichiNexView; icon: typeof LayoutDashboard; label: string; desc: string; color: string }[] = [
  { view: "crm", icon: Users, label: "CRM", desc: "Every customer, every call, one record.", color: "#007AFF" },
  { view: "inventory", icon: Package, label: "Inventory", desc: "Stock that tracks itself across sales.", color: "#FF9500" },
  { view: "finance", icon: LineChart, label: "Finance", desc: "Cash flow, invoices, and books in sync.", color: "#30D158" },
  { view: "analytics", icon: BarChart3, label: "Analytics", desc: "Know what sells — and what to stock next.", color: "#AF52DE" },
  { view: "procurement", icon: Store, label: "Procurement", desc: "Source wholesale and negotiate volume.", color: "#FF6482" },
  { view: "logistics", icon: Truck, label: "Logistics", desc: "Shipments tracked from hub to doorstep.", color: "#5856D6" },
  { view: "payments", icon: CreditCard, label: "Payments", desc: "Collect money from any payment method.", color: "#FF2D55" },
  { view: "dropshipping", icon: Repeat, label: "Dropshipping", desc: "Resell without holding a single unit.", color: "#5E5CE6" },
  { view: "ai-advisor", icon: Bot, label: "AI Advisor", desc: "A coach that knows your numbers.", color: "#d4af37" },
  { view: "learning", icon: GraduationCap, label: "Learning", desc: "Courses, frameworks, and founder routines.", color: "#00C7BE" },
];

const SHOPPER_PERKS = [
  { icon: Coins, text: "Earn loyalty points on every order — bronze to platinum" },
  { icon: Wallet, text: "A personal wallet to deposit, pay, and track spending" },
  { icon: MapPin, text: "Live order tracking with AI-powered delivery updates" },
  { icon: Zap, text: "Flash deals, wholesale bales, and member pricing" },
];

const BUSINESS_PERKS = [
  { icon: Headset, text: "Amani, your 24/7 AI sales agent that makes and takes calls" },
  { icon: LayoutDashboard, text: "CRM, inventory, finance, analytics — everything in one place" },
  { icon: MessageCircle, text: "Automatic order follow-ups, transcripts, and call recordings" },
  { icon: Rocket, text: "Switch freely between your shop profile and business dashboard" },
];

// Stock hero video (Wikimedia Commons, 720p VP9 — verified hotlinkable)
const HERO_VIDEO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cd/City_at_night.webm/City_at_night.webm.720p.vp9.webm";

function getFeaturedCategories(items: { id: string; category: string; stock: number }[]) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + item.stock);
  const palette = ["#FF6482", "#007AFF", "#30D158", "#AF52DE", "#FF9500", "#00C7BE", "#5856D6", "#FF2D55"];
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count], i) => ({
      id: label,
      label,
      subtitle: `${count} units in stock`,
      color: palette[i % palette.length],
      count: `${count} units`,
      gradient: "from-[#FF6482]/8 to-[#FF6482]/2",
    }));
}

function getTrustFeatures(selectedCurrency: Currency) {
  return [
    { icon: Truck, title: "Free Shipping", subtitle: `On orders over ${formatPrice(500000, selectedCurrency)}`, color: "#30D158" },
    { icon: Shield, title: "Own Catalog", subtitle: "Your inventory, your pricing", color: "#007AFF" },
    { icon: RotateCcw, title: "Easy Returns", subtitle: "30-day return policy", color: "#FF9500" },
    { icon: Sparkles, title: "AI-Powered", subtitle: "Smart sourcing advice", color: "#AF52DE" },
  ];
}

function ProductCard({ product, selectedCurrency, onNavigate, onAddToCart, index }: {
  product: Product;
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -8;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 8;
    setTransform(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`);
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setHovering(false);
  };

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
    "Mens Items": "#007AFF",
    "Ladies Items": "#FF6482",
    "Misc + Children Items": "#30D158",
    "Grade (B) Items": "#8E8E93",
    Laptops: "#007AFF",
    Smartphones: "#5856D6",
    Audio: "#FF375F",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="relative glass-material rounded-[20px] overflow-hidden h-full flex flex-col border border-glass-border/50 hover:border-glass-border transition-all duration-300">
          {/* Product Visual */}
          <div className="relative h-52 bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/80 flex items-center justify-center overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                onError={(e) => { (e.currentTarget.style.display = "none"); }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <>
                {/* Animated gradient background */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${categoryColors[product.category] || "#d4af37"}12 0%, transparent 60%)`,
                  }}
                />

                {/* Product icon */}
                <motion.div
                  className="h-16 w-16 rounded-[18px] flex items-center justify-center relative"
                  style={{ background: `${categoryColors[product.category] || "#d4af37"}12` }}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <ShoppingBag className="h-7 w-7" style={{ color: categoryColors[product.category] || "#d4af37" }} strokeWidth={1.5} />
                </motion.div>
              </>
            )}

            {/* Grade badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="brand" size="sm">{product.grade}</Badge>
            </div>

            {/* Quick add button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={hovering ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="absolute bottom-3 right-3 h-9 w-9 rounded-[10px] bg-emphasis/90 backdrop-blur-sm flex items-center justify-center text-on-emphasis shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>

            {/* Specular glare on hover */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                mixBlendMode: "screen",
              }}
            />
          </div>

          {/* Product Info */}
          <div className="p-5 flex flex-col flex-1">
            <p className="text-caption text-ink-tertiary mb-1">{product.category}</p>
            <h3 className="text-subhead font-bold text-ink mb-1.5 leading-tight group-hover:text-brand-dark transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-caption text-ink-tertiary line-clamp-2 mb-4 flex-1 leading-relaxed">
              {product.description}
            </p>

            <div className="glass-divider mb-3" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-title font-bold text-ink tracking-tight">
                  {formatPrice(product.price.amount, selectedCurrency)}
                </p>
                <p className="text-caption text-ink-quaternary">per unit</p>
              </div>
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

export default function ShopHomePage({ selectedCurrency, onNavigate, onAddToCart, onOpenAiSetup, onNavigateBusiness }: ShopHomePageProps) {
  const accountType = useStore((s) => s.user?.accountType ?? "shopper");
  const inventoryItems = useStore((s) => s.inventoryItems);
  const orders = useStore((s) => s.orders);
  const users = useStore((s) => s.users);
  const profile = useStore((s) => s.settings.profile);
  const liveListings = postedInventoryToProducts(inventoryItems);
  const featuredProducts = liveListings.slice(0, 4);
  const heroStats = [
    { label: "Products", value: String(liveListings.length), icon: ShoppingBag },
    { label: "Customers", value: String(Math.max(0, Object.keys(users).length)), icon: Shield },
    { label: "Orders", value: String(orders.length), icon: TrendingUp },
    { label: "Stock Units", value: inventoryItems.reduce((n, i) => n + i.stock, 0).toLocaleString(), icon: Award },
  ];
  const shopName = profile.company || profile.name || "Your Shop";
  const emptyInventory = inventoryItems.length === 0;
  const heroRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], isDesktop ? [0, 150] : [0, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], isDesktop ? [1, 0.95] : [1, 1]);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="space-y-10 lg:space-y-20">
      {/* ═══════════════════════════════════════════
          HERO — Manifesto + Large Video Background
          (Falls back to animated gold/particle scene)
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-ink via-[#1a1a2e] to-ink min-h-[92vh] flex items-center">
        {/* Fallback animated gold/particle backdrop — visible if video fails */}
        <div className="hidden md:block">
          <ParticleField particleCount={80} color="#d4af37" showGeometry={true} />
        </div>

        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[60px] animate-[orbFloat_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.08)_0%,transparent_70%)] blur-[60px] animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
        </div>

        {/* Large video background */}
        {!videoFailed && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
            tabIndex={-1}
          />
        )}

        {/* Legibility overlay — stronger once video is playing */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-60"}`}
          style={{ background: "linear-gradient(to bottom, rgba(10,10,18,0.86) 0%, rgba(10,10,18,0.55) 45%, rgba(10,10,18,0.85) 100%)" }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        {/* Manifesto Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-4 lg:px-8 py-24 lg:py-28 relative z-10 w-full"
        >
          <div className="max-w-3xl flex flex-col items-start">
            {/* Brand wordmark — perpetual shake */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <h2 className="text-[clamp(2.4rem,6vw,4.5rem)] font-black tracking-[-0.03em] leading-none select-none inline-flex items-baseline">
                {"BIRICHI".split("").map((letter, i) => (
                  <motion.span
                    key={`w-${i}`}
                    className="text-white inline-block"
                    animate={{
                      x: [0, -2.5, 3, -2, 2.5, -1, 1.5, 0, -2, 1.5, -1, 1, 0],
                      rotateZ: [0, -1.5, 1.5, -1, 1, -0.5, 0.5, -1.2, 1.2, -0.6, 0.6, 0, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: i * 0.1,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
                {"NEX".split("").map((letter, i) => (
                  <motion.span
                    key={`g-${i}`}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] inline-block"
                    animate={{
                      x: [0, 2.5, -3, 2, -2.5, 1, -1.5, 0, 2, -1.5, 1, -1, 0],
                      rotateZ: [0, 1.5, -1.5, 1, -1, 0.5, -0.5, 1.2, -1.2, 0.6, -0.6, 0, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: 0.7 + i * 0.1,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h2>
              <p className="text-caption text-zinc-400 mt-2 uppercase tracking-[0.22em]">Africa's Business Growth Ecosystem</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="brand" size="md" className="mb-8">
                <Sparkles className="h-3 w-3 mr-1.5 inline" />
                The BirichiNex Manifesto
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white mb-6 tracking-[-0.04em] leading-[1.05]"
            >
              What if one platform could help you build, run and grow your
              <br />
              <span className="text-gradient-brand">entire business?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-body text-zinc-400 mb-10 max-w-xl leading-relaxed"
            >
              Sell. Source. Manage. Learn. Connect. Grow. Powered by BNX AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton strength={0.2}>
                <Button
                  variant="brand"
                  size="lg"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={onOpenAiSetup}
                  className="shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.4)]"
                >
                  Get Started
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Bot className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={() => onNavigate("category:fashion")}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Explore the marketplace
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mt-10 lg:mt-14 pt-8 border-t border-white/[0.06]"
            >
              {heroStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  className="group"
                >
                  <p className="text-display font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-caption text-zinc-500 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-secondary to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          TRUST FEATURES — With Spotlight Effect
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getTrustFeatures(selectedCurrency).map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={5} className="h-full">
                  <div className="glass-material rounded-[18px] p-5 h-full border border-glass-border/30">
                    <div className="h-11 w-11 rounded-[13px] flex items-center justify-center mb-3.5" style={{ background: `${feature.color}10` }}>
                      <feature.icon className="h-5 w-5" style={{ color: feature.color }} strokeWidth={1.5} />
                    </div>
                    <p className="text-subhead font-bold text-ink mb-0.5">{feature.title}</p>
                    <p className="text-caption text-ink-tertiary">{feature.subtitle}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </CursorSpotlight>
      </section>

      {/* ═══════════════════════════════════════════
          OUR AI — On-Demand Discovery Entry
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <ParallaxSection offset={20} speed={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[24px] overflow-hidden glow-brand">
              <div className="glass-brand rounded-[24px] p-8 md:p-10 relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[60px]" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.08)_0%,transparent_70%)] blur-[40px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-brand" strokeWidth={1.5} />
                      <Badge variant="brand" size="sm">Our AI</Badge>
                    </div>
                    <h2 className="text-headline text-ink tracking-tight mb-2">Meet BirichiNex AI — your business advisor</h2>
                    <p className="text-callout text-ink-secondary max-w-lg leading-relaxed">
                      Not sure where to start? In plain, everyday language I'll first ask one simple question —
                      where you are on your journey — then build your Founder Profile, Business Profile, and
                      Business Health Dashboard with you.
                    </p>
                  </div>
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="brand"
                      size="lg"
                      icon={<Sparkles className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={onOpenAiSetup}
                      className="shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.4)]"
                    >
                      Talk to Our AI
                    </Button>
                  </MagneticButton>
                </div>

                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-[24px] pointer-events-none animated-gradient-border" style={{ padding: 0 }} />
              </div>
            </div>
          </motion.div>
        </ParallaxSection>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORY SECTIONS — Parallax (from your inventory)
          ═══════════════════════════════════════════ */}
      {getFeaturedCategories(inventoryItems).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8">
          <ParallaxSection offset={30} speed={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getFeaturedCategories(inventoryItems).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={6}>
                  <button
                    onClick={() => onNavigate(`category:${cat.id}`)}
                    className="w-full text-left group"
                  >
                    <div className={`glass-material rounded-[22px] p-5 md:p-8 h-full relative overflow-hidden border border-glass-border/30 hover:border-glass-border/60 transition-all duration-300`}>
                      {/* Background gradient orb */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${cat.color}, transparent)` }} />

                      <div className="relative z-10">
                        <Badge variant="default" size="sm" className="mb-4">{cat.count}</Badge>
                        <h2 className="text-headline text-ink tracking-tight mb-2">{cat.label}</h2>
                        <p className="text-callout text-ink-tertiary mb-7 leading-relaxed">{cat.subtitle}</p>
                        <div className="flex items-center gap-2 text-subhead font-semibold text-brand-dark group-hover:text-brand transition-colors duration-200">
                          Explore
                          <motion.span
                            className="inline-block"
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.span>
                        </div>
                      </div>

                      {/* Specular sheen on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)`,
                        mixBlendMode: "screen"
                      }} />
                    </div>
                  </button>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>
      </section>
      )}

      {/* ═══════════════════════════════════════════
          YOUR LIVE LISTINGS (posted from Inventory)
          ═══════════════════════════════════════════ */}
      {liveListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-headline text-ink tracking-tight"
              >
                Your Live Listings
              </motion.h2>
              <p className="text-callout text-ink-tertiary mt-1.5">Posted from your Inventory — live on the storefront</p>
            </div>
            <MagneticButton strength={0.15}>
              <button
                onClick={() => onNavigateBusiness("inventory")}
                className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors duration-200 group"
              >
                Manage Inventory
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </MagneticButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {liveListings.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedCurrency={selectedCurrency}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SHOP CATALOG — your own inventory, live
          ═══════════════════════════════════════════ */}
      {emptyInventory && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[24px] overflow-hidden glow-brand">
              <div className="glass-brand rounded-[24px] p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[60px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag className="h-5 w-5 text-brand" strokeWidth={1.5} />
                      <Badge variant="brand" size="sm">Your Catalog</Badge>
                    </div>
                    <h2 className="text-headline text-ink tracking-tight mb-2">Let's build {shopName}'s catalog</h2>
                    <p className="text-callout text-ink-secondary max-w-lg leading-relaxed">
                      Every listing here comes from your own inventory. Add your first product, post it to
                      the marketplace, and it appears live on your storefront — no dummy stock, ever.
                    </p>
                  </div>
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="brand"
                      size="lg"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => onNavigateBusiness("inventory")}
                      className="shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    >
                      Add your first product
                    </Button>
                  </MagneticButton>
                </div>
                <div className="absolute inset-0 rounded-[24px] pointer-events-none animated-gradient-border" style={{ padding: 0 }} />
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {!emptyInventory && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-headline text-ink tracking-tight"
              >
                Featured Products
              </motion.h2>
              <p className="text-callout text-ink-tertiary mt-1.5">Straight from {shopName}'s inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedCurrency={selectedCurrency}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          WHOLESALE BALES CTA — Parallax + Glow
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <ParallaxSection offset={20} speed={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[24px] overflow-hidden glow-brand">
              <div className="glass-brand rounded-[24px] p-8 md:p-10 relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[60px]" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[40px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-brand" strokeWidth={1.5} />
                      <Badge variant="brand" size="sm">Volume Pricing</Badge>
                    </div>
                    <h2 className="text-headline text-ink tracking-tight mb-2">Wholesale Bales</h2>
                    <p className="text-callout text-ink-secondary max-w-lg leading-relaxed">
                      Compressed fashion bales from 25kg to 70kg. Perfect for retailers, market traders, and distributors looking for volume pricing.
                    </p>
                  </div>
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => onNavigate("bales")}
                      className="shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    >
                      View Bales
                    </Button>
                  </MagneticButton>
                </div>

                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-[24px] pointer-events-none animated-gradient-border" style={{ padding: 0 }} />
              </div>
            </div>
          </motion.div>
        </ParallaxSection>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 01 — ONE ACCOUNT, TWO SIDES
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <Badge variant="brand" size="sm" className="mb-4">
            <Check className="h-3 w-3 mr-1.5 inline" />
            One account. Two sides.
          </Badge>
          <h2 className="text-headline text-ink tracking-tight mb-3">How does one platform handle your whole business?</h2>
          <p className="text-callout text-ink-tertiary max-w-2xl mx-auto leading-relaxed">
            Sign up once and choose your side — shopper or business. Shoppers earn loyalty points and
            carry a wallet. Business owners get all of that plus the full business dashboard, and switch
            between both in one tap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shopper side */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard intensity={4} className="h-full">
              <div className="glass-material rounded-[22px] p-7 md:p-8 h-full border border-glass-border/30 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,100,130,0.08)_0%,transparent_70%)] blur-[40px]" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ background: "rgba(255,100,130,0.1)" }}>
                    <ShoppingBag className="h-5 w-5 text-[#FF6482]" strokeWidth={1.5} />
                  </div>
                  <Badge variant="default" size="sm">Shopper</Badge>
                </div>
                <h3 className="text-subhead font-bold text-ink mb-3">Shop, earn, and pay like the giants.</h3>
                <ul className="space-y-3 mb-7">
                  {SHOPPER_PERKS.map((perk) => (
                    <li key={perk.text} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.1)" }}>
                        <perk.icon className="h-4 w-4 text-brand" strokeWidth={1.5} />
                      </div>
                      <span className="text-callout text-ink-secondary leading-relaxed">{perk.text}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="md" fullWidth onClick={() => onNavigate("account")}>
                  <Wallet className="h-4 w-4 mr-2" /> View my shopper profile
                </Button>
              </div>
            </TiltCard>
          </motion.div>

          {/* Business side */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard intensity={4} className="h-full">
              <div className="glass-brand rounded-[22px] p-7 md:p-8 h-full border border-brand/20 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] blur-[40px]" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ background: "rgba(212,175,55,0.14)" }}>
                    <Rocket className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <Badge variant="brand" size="sm">Business</Badge>
                </div>
                <h3 className="text-subhead font-bold text-ink mb-3">Everything in shopper — plus your entire business.</h3>
                <ul className="space-y-3 mb-7">
                  {BUSINESS_PERKS.map((perk) => (
                    <li key={perk.text} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.12)" }}>
                        <perk.icon className="h-4 w-4 text-brand" strokeWidth={1.5} />
                      </div>
                      <span className="text-callout text-ink-secondary leading-relaxed">{perk.text}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="brand" size="md" fullWidth onClick={onOpenAiSetup}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {accountType === "business" ? "Open my business dashboard" : "Start my business profile"}
                </Button>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 02 — AI SALES AGENT (AMANI)
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-ink via-[#1a1a2e] to-ink glow-brand">
            {/* Ambient orbs */}
            <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16)_0%,transparent_70%)] blur-[60px]" />
            <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.10)_0%,transparent_70%)] blur-[50px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-14">
              {/* Copy */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <Headset className="h-5 w-5 text-[#30D158]" strokeWidth={1.5} />
                  </div>
                  <Badge variant="brand" size="sm">
                    <PhoneCall className="h-3 w-3 mr-1.5 inline" />
                    Live · 24/7
                  </Badge>
                </div>
                <h2 className="text-headline text-white tracking-tight mb-4">
                  Who answers your customers
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]">while you sleep?</span>
                </h2>
                <p className="text-callout text-zinc-400 leading-relaxed mb-7 max-w-lg">
                  Meet Amani — your AI sales agent. She makes and takes calls, follows up on every order,
                  and works straight from your CRM with each customer's purchase history. Every call is
                  tracked, recorded, and transcribed, so you can listen back anytime.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {[
                    { value: "24/7", label: "Always on" },
                    { value: "100%", label: "Calls tracked" },
                    { value: "3×", label: "More follow-ups" },
                    { value: "0", label: "Missed orders" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-[14px] p-3 text-center">
                      <p className="text-title font-bold text-white tracking-tight">{s.value}</p>
                      <p className="text-caption text-zinc-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="brand"
                      size="lg"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => onNavigateBusiness("ai-agent")}
                      className="shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    >
                      Open the AI Call Center
                    </Button>
                  </MagneticButton>
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
                      onClick={onOpenAiSetup}
                    >
                      Talk to the advisor
                    </Button>
                  </MagneticButton>
                </div>
              </div>

              {/* Call insights panel */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md text-center px-6">
                  <div className="w-20 h-20 mx-auto rounded-[24px] bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center mb-5">
                    <Headset className="h-9 w-9 text-[#30D158]" strokeWidth={1.5} />
                  </div>
                  <p className="text-headline text-white font-bold tracking-tight mb-2">Every call, recorded.</p>
                  <p className="text-callout text-zinc-400 leading-relaxed mb-6">
                    When a customer calls you, Amani answers in your voice — places the order, updates your
                    CRM, and sends you the recording and transcript. Real calls, straight from your business.
                  </p>
                  <Badge variant="brand" size="sm">
                    <PhoneCall className="h-3 w-3 mr-1.5 inline" />
                    Go live in Settings → Call center
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 03 — LOYALTY & WALLET
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <Badge variant="brand" size="sm" className="mb-3">
              <Coins className="h-3 w-3 mr-1.5 inline" />
              Loyalty & Wallet
            </Badge>
            <h2 className="text-headline text-ink tracking-tight">How does money come back to you?</h2>
          </div>
          <MagneticButton strength={0.15}>
            <button
              onClick={() => onNavigate("account")}
              className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors duration-200 group"
            >
              My wallet
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </MagneticButton>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Coins, color: "#d4af37", title: "Loyalty points", desc: "Earn on every order. Bronze, silver, gold, platinum — each tier multiplies your points." },
            { icon: Wallet, color: "#30D158", title: "Personal wallet", desc: "Deposit, pay at checkout, and get cashback — all in one balance, like Amazon or Jumia." },
            { icon: Trophy, color: "#FF9500", title: "Member pricing", desc: "Loyalty tiers unlock member-only deals, free shipping, and early access drops." },
            { icon: LineChart, color: "#007AFF", title: "Points dashboard", desc: "Watch points grow, redeem instantly, and never lose track of what you've earned." },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={5} className="h-full">
                <div className="glass-material rounded-[18px] p-5 h-full border border-glass-border/30">
                  <div className="h-11 w-11 rounded-[13px] flex items-center justify-center mb-3.5" style={{ background: `${card.color}10` }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} strokeWidth={1.5} />
                  </div>
                  <p className="text-subhead font-bold text-ink mb-1">{card.title}</p>
                  <p className="text-caption text-ink-tertiary leading-relaxed">{card.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 04 — BUSINESS TOOLS GRID
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <Badge variant="brand" size="sm" className="mb-4">
            <LayoutDashboard className="h-3 w-3 mr-1.5 inline" />
            Business tools
          </Badge>
          <h2 className="text-headline text-ink tracking-tight mb-3">How does it actually run my business?</h2>
          <p className="text-callout text-ink-tertiary max-w-2xl mx-auto leading-relaxed">
            Ten tools, one dashboard, zero juggling. Every function your company needs — built in,
            synced, and ready to scale.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {BUSINESS_TOOLS.map((tool, i) => (
            <motion.div
              key={tool.view}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={4} className="h-full">
                <button
                  onClick={() => onNavigateBusiness(tool.view)}
                  className="w-full text-left group h-full"
                >
                  <div className="glass-material rounded-[18px] p-5 h-full border border-glass-border/30 hover:border-glass-border/70 transition-all duration-300">
                    <div className="h-11 w-11 rounded-[13px] flex items-center justify-center mb-3.5" style={{ background: `${tool.color}10` }}>
                      <tool.icon className="h-5 w-5" style={{ color: tool.color }} strokeWidth={1.5} />
                    </div>
                    <p className="text-subhead font-bold text-ink mb-0.5">{tool.label}</p>
                    <p className="text-caption text-ink-tertiary leading-relaxed">{tool.desc}</p>
                  </div>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 05 — SELL & MAKE MONEY
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <ParallaxSection offset={20} speed={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Store, title: "Sell in the marketplace", desc: "List your own products to customers across Africa — Amani handles the calls and orders.", cta: "Open marketplace", view: "marketplace" as BirichiNexView, color: "#007AFF" },
              { icon: Repeat, title: "Dropship without stock", desc: "Resell BirichiNex's catalog with no inventory. We ship, you profit on every order.", cta: "Start dropshipping", view: "dropshipping" as BirichiNexView, color: "#5E5CE6" },
              { icon: Package, title: "Wholesale & bales", desc: "Buy compressed bales and bulk stock at volume prices to resell at the market.", cta: "View bales", view: null, color: "#FF9500" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={6} className="h-full">
                  <div className="glass-material rounded-[22px] p-7 h-full border border-glass-border/30 relative overflow-hidden group">
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${card.color}, transparent)` }} />
                    <div className="h-12 w-12 rounded-[14px] flex items-center justify-center mb-5" style={{ background: `${card.color}10` }}>
                      <card.icon className="h-6 w-6" style={{ color: card.color }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-subhead font-bold text-ink mb-2">{card.title}</h3>
                    <p className="text-callout text-ink-tertiary leading-relaxed mb-6">{card.desc}</p>
                    <Button
                      variant={i === 0 ? "brand" : "secondary"}
                      size="md"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => (card.view ? onNavigateBusiness(card.view) : onNavigate("bales"))}
                    >
                      {card.cta}
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>
      </section>

      {/* ═══════════════════════════════════════════
          ANSWER 06 — LEARNING & COMMUNITY
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-headline text-ink tracking-tight"
            >
              How do I get better every day?
            </motion.h2>
            <p className="text-callout text-ink-tertiary mt-1.5">Courses, frameworks, and a community that grows with you</p>
          </div>
          <MagneticButton strength={0.15}>
            <button
              onClick={() => onNavigateBusiness("learning")}
              className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors duration-200 group"
            >
              Explore learning
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </MagneticButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: GraduationCap, title: "Courses", desc: "From first sale to first hire — learn at your pace.", view: "learning" as BirichiNexView },
            { icon: BookOpen, title: "Frameworks", desc: "Battle-tested playbooks for pricing, sales, and ops.", view: "frameworks" as BirichiNexView },
            { icon: Rocket, title: "Founder routines", desc: "Daily and weekly rituals that keep you consistent.", view: "routines" as BirichiNexView },
            { icon: Globe, title: "Community", desc: "Connect with founders and suppliers across 12 countries.", view: "community" as BirichiNexView },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={5} className="h-full">
                <button onClick={() => onNavigateBusiness(item.view)} className="w-full text-left group h-full">
                  <div className="glass-material rounded-[18px] p-5 h-full border border-glass-border/30 hover:border-glass-border/60 transition-all duration-300">
                    <div className="h-11 w-11 rounded-[13px] flex items-center justify-center mb-3.5" style={{ background: "rgba(212,175,55,0.1)" }}>
                      <item.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <p className="text-subhead font-bold text-ink mb-1">{item.title}</p>
                    <p className="text-caption text-ink-tertiary leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <ParallaxSection offset={20} speed={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-ink via-[#1a1a2e] to-ink glow-brand">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16)_0%,transparent_70%)] blur-[60px]" />
              <div className="relative z-10 text-center py-16 px-6 md:py-20">
                <h2 className="text-headline text-white tracking-tight mb-4">
                  Ready to build, run and grow your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]"> business?</span>
                </h2>
                <p className="text-callout text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10">
                  Sell. Source. Manage. Learn. Connect. Grow. — with loyalty points, a personal wallet,
                  and BNX AI guiding every move. One account, both sides.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="brand"
                      size="lg"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={onOpenAiSetup}
                      className="shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    >
                      Get Started
                    </Button>
                  </MagneticButton>
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<Bot className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => onNavigate("category:fashion")}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      Explore the marketplace
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </motion.div>
        </ParallaxSection>
      </section>
    </div>
  );
}
