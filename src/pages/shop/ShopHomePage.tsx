import { useState, useEffect, useRef, MouseEvent, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  ArrowRight, Truck, Shield, RotateCcw, Sparkles,
  Star, ChevronRight, ShoppingBag, Zap, Award, TrendingUp
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { PRODUCTS, TECH_PRODUCTS, formatPrice } from "../../data/platform";
import { Currency, Product } from "../../types";
import ParticleField from "../../components/three/ParticleField";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import MagneticButton from "../../components/three/MagneticButton";
import ParallaxSection from "../../components/three/ParallaxSection";
import TiltCard from "../../components/three/TiltCard";

interface ShopHomePageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

const FEATURED_CATEGORIES = [
  { id: "fashion", label: "Fashion", subtitle: "European-sorted premium fashion", color: "#FF6482", count: "200+ items", gradient: "from-[#FF6482]/8 to-[#FF6482]/2" },
  { id: "technology", label: "Technology", subtitle: "Certified refurbished tech", color: "#007AFF", count: "80+ items", gradient: "from-[#007AFF]/8 to-[#007AFF]/2" },
];

function getTrustFeatures(selectedCurrency: Currency) {
  return [
    { icon: Truck, title: "Free Shipping", subtitle: `On orders over ${formatPrice(500000, selectedCurrency)}`, color: "#30D158" },
    { icon: Shield, title: "Verified Suppliers", subtitle: "EU-sourced quality", color: "#007AFF" },
    { icon: RotateCcw, title: "Easy Returns", subtitle: "30-day return policy", color: "#FF9500" },
    { icon: Sparkles, title: "AI-Powered", subtitle: "Smart sourcing advice", color: "#AF52DE" },
  ];
}

const STATS = [
  { label: "Products", value: "2,400+", icon: ShoppingBag },
  { label: "Suppliers", value: "180+", icon: Shield },
  { label: "Countries", value: "12", icon: TrendingUp },
  { label: "Orders Fulfilled", value: "50K+", icon: Award },
];

// Interactive Product Card with 3D tilt
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
              className="absolute bottom-3 right-3 h-9 w-9 rounded-[10px] bg-ink/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
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

type IntroPhase = "falling" | "shaking" | "transitioning" | "done";

const INTRO_CHARS = "BIRICHINEX".split("");
const GOLD_START = 7;

export default function ShopHomePage({ selectedCurrency, onNavigate, onAddToCart }: ShopHomePageProps) {
  const featuredProducts = PRODUCTS.slice(0, 4);
  const techProducts = TECH_PRODUCTS.slice(0, 4);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const [introPhase, setIntroPhase] = useState<IntroPhase>("falling");

  const letterStyles = useMemo(() => INTRO_CHARS.map((_, i) => ({
    fallDelay: 0.2 + i * 0.08,
    shakeDelay: i * 0.07,
    startRotate: (i % 2 === 0 ? -1 : 1) * (8 + (i % 3) * 3),
  })), []);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("shaking"), 1500);
    const t2 = setTimeout(() => setIntroPhase("transitioning"), 2800);
    const t3 = setTimeout(() => setIntroPhase("done"), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="space-y-10 lg:space-y-20">
      {/* ═══════════════════════════════════════════
          INTRO SPLASH OVERLAY
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {introPhase !== "done" && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Dark backdrop */}
            <div
              className="absolute inset-0 bg-[#0a0a12]"
              style={{ backdropFilter: "blur(40px) saturate(150%)" }}
            />

            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full opacity-30"
              style={{
                background: "radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />

            {/* Centered letter row — aligned to hero section center (~42vh) */}
            <div className="absolute top-[42vh] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center px-4">
              {INTRO_CHARS.map((char, i) => {
                const isGold = i >= GOLD_START;
                const { fallDelay, shakeDelay, startRotate } = letterStyles[i];
                const dir = i % 2 === 0 ? -1 : 1;

                return (
                  <motion.span
                    key={`intro-${i}`}
                    className={`inline-block font-black select-none ${
                      isGold
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]"
                        : "text-white"
                    }`}
                    style={{
                      fontSize: "clamp(2.5rem, 8vw, 7rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      textShadow: isGold
                        ? "0 0 40px rgba(212,175,55,0.4)"
                        : "0 0 40px rgba(255,255,255,0.15)",
                    }}
                    initial={{ y: "-90vh", opacity: 0, rotateZ: startRotate, scale: 1.2 }}
                    animate={
                      introPhase === "falling"
                        ? { y: 0, opacity: 1, rotateZ: 0, scale: 1 }
                        : introPhase === "shaking"
                        ? {
                            y: 0,
                            opacity: 1,
                            rotateZ: 0,
                            scale: 1,
                            x: [0, dir * 3, dir * -2.5, dir * 2, dir * -1.5, dir * 0.8, 0],
                          }
                        : introPhase === "transitioning"
                        ? { y: 0, opacity: 0, rotateZ: 0, scale: 1 }
                        : { y: 0, opacity: 1, rotateZ: 0, scale: 1 }
                    }
                    transition={{
                      y: { duration: 0.55, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.3, delay: fallDelay },
                      rotateZ: { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                      scale: { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                      x: introPhase === "shaking"
                        ? { duration: 0.9, delay: shakeDelay, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 }
                        : { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                    }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>

            {/* Transition flash */}
            {introPhase === "transitioning" && (
              <motion.div
                className="absolute inset-0 bg-white pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ═══════════════════════════════════════════
          HERO SECTION — 3D Scene + Particle Field
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-ink via-[#1a1a2e] to-ink min-h-[85vh] flex items-center">
        {/* 3D Particle Background */}
        <div className="hidden md:block">
          <ParticleField particleCount={80} color="#d4af37" showGeometry={true} />
        </div>

        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[60px] animate-[orbFloat_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.08)_0%,transparent_70%)] blur-[60px] animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[min(500px,80vw)] w-[min(500px,80vw)] rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.06)_0%,transparent_70%)] blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        {/* Hero Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28 relative z-10 w-full"
        >
          <div className="max-w-3xl flex flex-col items-start">
            {/* BIRICHINEX Logo — perpetual shake after intro */}
            <AnimatePresence>
              {introPhase === "done" && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, scale: 0.8, y: -20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-[-0.03em] leading-none select-none inline-flex items-baseline">
                    {"BIRICHI".split("").map((letter, i) => (
                      <motion.span
                        key={`hero-w-${i}`}
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
                        key={`hero-g-${i}`}
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
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={introPhase === "done" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="brand" size="md" className="mb-8">
                <Sparkles className="h-3 w-3 mr-1.5 inline" />
                New Season Collection
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={introPhase === "done" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white mb-6 tracking-[-0.04em] leading-[1.05]"
            >
              Premium Fashion.
              <br />
              <span className="text-gradient-brand">European Grade.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={introPhase === "done" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-body text-zinc-400 mb-10 max-w-xl leading-relaxed"
            >
              Professionally sorted, ethically sourced fashion from European hubs.
              From premium cotton shirts to genuine leather — quality you can trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={introPhase === "done" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton strength={0.2}>
                <Button
                  variant="brand"
                  size="lg"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={() => onNavigate("category:fashion")}
                  className="shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.4)]"
                >
                  Shop Fashion
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => onNavigate("category:technology")}
                >
                  Explore Tech
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
              {STATS.map((stat, i) => (
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
          CATEGORY SECTIONS — Parallax
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <ParallaxSection offset={30} speed={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_CATEGORIES.map((cat, i) => (
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

      {/* ═══════════════════════════════════════════
          FEATURED FASHION PRODUCTS
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
              Featured Fashion
            </motion.h2>
            <p className="text-callout text-ink-tertiary mt-1.5">Hand-picked by our sourcing team</p>
          </div>
          <MagneticButton strength={0.15}>
            <button
              onClick={() => onNavigate("category:fashion")}
              className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors duration-200 group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </MagneticButton>
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

      {/* ═══════════════════════════════════════════
          FEATURED TECHNOLOGY PRODUCTS
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <CursorSpotlight spotlightSize={600} spotlightColor="rgba(0,122,255,0.03)">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-headline text-ink tracking-tight"
              >
                Certified Refurbished Tech
              </motion.h2>
              <p className="text-callout text-ink-tertiary mt-1.5">EU-quality certified, warranty included</p>
            </div>
            <MagneticButton strength={0.15}>
              <button
                onClick={() => onNavigate("category:technology")}
                className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors duration-200 group"
              >
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </MagneticButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {techProducts.map((product, i) => (
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
        </CursorSpotlight>
      </section>

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
    </div>
  );
}
