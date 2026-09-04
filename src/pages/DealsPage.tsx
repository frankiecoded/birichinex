import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Clock, Gift, Star, TrendingDown, ArrowRight, Flame, BadgePercent, PackageCheck } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import CursorSpotlight from "../components/three/CursorSpotlight";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";
import { postedInventoryToProducts } from "../lib/inventoryListings";
import type { Product } from "../types";
import type { BirichiNexView, Currency } from "../types";

interface DealsPageProps {
  onNavigate?: (view: string | BirichiNexView) => void;
}

type DealKind = "flash" | "daily" | "bundle" | "seasonal" | "clearance";

interface Deal {
  kind: DealKind;
  product: Product;
  discountPct: number;
  originalPrice: number;
  dealPrice: number;
  endsAt?: Date;
  label: string;
}

const DEAL_KINDS: { id: DealKind; label: string; icon: typeof Zap; color: string; blurb: string }[] = [
  { id: "flash", label: "Flash Sales", icon: Zap, color: "#FF453A", blurb: "Deep discounts, gone in hours" },
  { id: "daily", label: "Daily Deals", icon: Clock, color: "#007AFF", blurb: "Fresh markdowns every day" },
  { id: "bundle", label: "Bundle Deals", icon: Gift, color: "#AF52DE", blurb: "Buy together, save big" },
  { id: "seasonal", label: "Seasonal", icon: Star, color: "#FF9500", blurb: "Limited seasonal selection" },
  { id: "clearance", label: "Clearance", icon: TrendingDown, color: "#30D158", blurb: "Last stock, best prices" },
];

function hashCode(str: string): number {
  let h = 7;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(items: T[], seed: string, count: number): T[] {
  const h = hashCode(seed);
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    out.push(pool.splice((h + i * 7) % pool.length, 1)[0]);
  }
  return out;
}

function useCountdown(target: Date | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: diff === 0,
  };
}

function Countdown({ target, color }: { target: Date; color: string }) {
  const t = useCountdown(target);
  if (t.expired) return <span className="text-[11px] font-bold text-success">LIVE NOW</span>;
  const cells = [
    { v: t.hours, l: "hrs" },
    { v: t.minutes, l: "min" },
    { v: t.seconds, l: "sec" },
  ];
  return (
    <div className="flex items-center gap-1">
      {t.days > 0 && (
        <div className="flex items-center gap-1">
          <span className="min-w-[34px] text-center rounded-[6px] px-1 py-1 text-[12px] font-bold tabular-nums text-white" style={{ background: color }}>{t.days}</span>
          <span className="text-[9px] text-ink-quaternary font-semibold">d</span>
        </div>
      )}
      {cells.map((c) => (
        <div key={c.l} className="flex items-center gap-1">
          <span className="min-w-[34px] text-center rounded-[6px] px-1 py-1 text-[12px] font-bold tabular-nums text-white" style={{ background: color }}>{String(c.v).padStart(2, "0")}</span>
          <span className="text-[9px] text-ink-quaternary font-semibold">{c.l}</span>
        </div>
      ))}
    </div>
  );
}

function DealCard({ deal, currency, onShop, index }: { deal: Deal; currency: Currency; onShop: () => void; index: number }) {
  const kindMeta = DEAL_KINDS.find((k) => k.id === deal.kind);
  const color = kindMeta?.color ?? "#FF453A";
  const primary = deal.product.images[0];
  const saved = Math.max(0, deal.originalPrice - deal.dealPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="glass-material rounded-[20px] overflow-hidden border border-glass-border/40 hover:border-glass-border/80 transition-all duration-300 group">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary/70">
          {primary ? (
            <img
              src={primary}
              alt={deal.product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageCheck className="h-10 w-10 text-ink-quaternary" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="brand" size="sm" className="shadow-lg">-{deal.discountPct}%</Badge>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-full text-white shadow-lg" style={{ background: color }}>{deal.label}</span>
          </div>
          {deal.endsAt && (
            <div className="absolute bottom-3 right-3">
              <Countdown target={deal.endsAt} color={color} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary mb-1">
            {deal.product.category} · {deal.product.origin}
          </p>
          <h3 className="text-[15px] font-bold text-ink leading-snug truncate mb-2.5">{deal.product.name}</h3>
          <div className="flex items-end justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-quaternary line-through">{formatPrice(deal.originalPrice, currency)}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-success bg-success/10">SAVE {formatPrice(saved, currency)}</span>
              </div>
              <p className="text-[20px] font-bold text-ink tracking-tight" style={{ color }}>
                {formatPrice(deal.dealPrice, currency)}
              </p>
            </div>
            {deal.product.stock > 0 && (
              <span className="text-[10px] text-ink-tertiary">{deal.product.stock} in stock</span>
            )}
          </div>
          <MagneticButton strength={0.15}>
            <Button
              variant="brand"
              fullWidth
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              onClick={onShop}
            >
              Shop the deal
            </Button>
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

export default function DealsPage({ onNavigate }: DealsPageProps) {
  const inventoryItems = useStore((s) => s.inventoryItems);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const [active, setActive] = useState<DealKind | "all">("all");

  const deals = useMemo<Deal[]>(() => {
    const products = postedInventoryToProducts(inventoryItems).filter((p) => p.stock > 0);
    if (products.length === 0) return [];

    const seed = new Date().toISOString().slice(0, 10);
    const flashPick = pick(products, `${seed}-flash`, 3);
    const dailyPool = products.filter((p) => !flashPick.includes(p));
    const dailyPick = pick(dailyPool, `${seed}-daily`, 4);
    const clearancePool = [...products]
      .sort((a, b) => (a.stock / (a.specifications?.["Min Stock"] ? parseInt(String(a.specifications["Min Stock"]), 10) || 1 : 1)) - (b.stock / (b.specifications?.["Min Stock"] ? parseInt(String(b.specifications["Min Stock"]), 10) || 1 : 1)));
    const clearancePick = pick(clearancePool, `${seed}-clearance`, 4);
    const seasonalPick = pick(products.filter((p) => !flashPick.includes(p) && !dailyPick.includes(p)), `${seed}-seasonal`, 4);

    const now = Date.now();
    const minutesOffset = hashCode(seed) % 240;
    const flashEnds = new Date(now + (3 * 60 + minutesOffset) * 60000);
    const dailyEnds = new Date(now + (16 + minutesOffset) * 3600000);
    const seasonalEnds = new Date(now + (3 * 24 + Math.floor(hashCode(`${seed}-sea`) % 48)) * 3600000);

    const withDiscount = (product: Product, pct: number): { originalPrice: number; dealPrice: number } => {
      const originalPrice = product.price.amount;
      const dealPrice = Math.max(1, Math.round((originalPrice * (100 - pct)) / 100));
      return { originalPrice, dealPrice };
    };

    const out: Deal[] = [];

    flashPick.forEach((product, i) => {
      const pct = [30, 35, 40][i] ?? 30;
      out.push({ kind: "flash", product, discountPct: pct, ...withDiscount(product, pct), endsAt: flashEnds, label: "FLASH" });
    });
    dailyPick.forEach((product, i) => {
      const pct = [12, 15, 18, 20][i] ?? 15;
      out.push({ kind: "daily", product, discountPct: pct, ...withDiscount(product, pct), endsAt: dailyEnds, label: "DAILY" });
    });
    seasonalPick.forEach((product, i) => {
      const pct = [15, 20, 25, 20][i] ?? 18;
      out.push({ kind: "seasonal", product, discountPct: pct, ...withDiscount(product, pct), endsAt: seasonalEnds, label: "SEASONAL" });
    });
    clearancePick.forEach((product, i) => {
      const pct = [45, 50, 45, 55][i] ?? 45;
      out.push({ kind: "clearance", product, discountPct: pct, ...withDiscount(product, pct), label: "CLEARANCE" });
    });

    // Bundle deals — pair a premium tech item with a fashion/accessory item.
    const techItems = products.filter((p) => ["Laptops", "Desktops", "Smartphones", "Audio", "Accessories"].includes(p.category));
    const softItems = products.filter((p) => !["Laptops", "Desktops", "Smartphones", "Audio", "Accessories", "Storage"].includes(p.category));
    const techSeeds = pick(techItems, `${seed}-bundle-tech`, 3);
    const softSeeds = pick(softItems, `${seed}-bundle-soft`, 2);
    const bundleSeeds = [...techSeeds, ...softSeeds].slice(0, 3);
    bundleSeeds.forEach((product, i) => {
      const pct = [10, 12, 15][i] ?? 12;
      const originalPrice = product.price.amount;
      const dealPrice = Math.max(1, Math.round((originalPrice * (100 - pct)) / 100));
      out.push({
        kind: "bundle",
        product,
        discountPct: pct,
        originalPrice,
        dealPrice,
        label: "BUNDLE +2",
      });
    });

    return out;
  }, [inventoryItems]);

  const hero = deals.find((d) => d.kind === "flash") ?? deals[0];
  const visible = active === "all" ? deals : deals.filter((d) => d.kind === active);

  const shop = (deal: Deal) => onNavigate?.(`product:${deal.product.id}` as string);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,69,58,0.07)_0%,transparent_70%)] blur-[60px] animate-[orbFloat_20s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.05)_0%,transparent_70%)] blur-[60px] animate-[orbFloatInverse_26s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative z-10"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-brand" strokeWidth={1.5} />
            <h1 className="text-headline text-gradient-brand tracking-tight">Deals</h1>
          </div>
          <p className="text-callout text-ink-tertiary mt-1">
            Live deals generated from real inventory — flash markdowns, daily drops and clearance runs from Portmetals Africa.
          </p>
        </div>
        <Badge variant="brand" size="sm" className="shrink-0">{deals.length} live deals</Badge>
      </motion.div>

      {/* Deal kinds — filter pills */}
      <div className="relative z-10 flex flex-wrap gap-2.5">
        <button
          onClick={() => setActive("all")}
          className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
            active === "all"
              ? "bg-brand text-white shadow-lg shadow-brand/25"
              : "glass-material text-ink-secondary hover:text-ink border border-glass-border"
          }`}
        >
          All Deals
        </button>
        {DEAL_KINDS.map((k) => {
          const count = deals.filter((d) => d.kind === k.id).length;
          const isActive = active === k.id;
          return (
            <button
              key={k.id}
              onClick={() => setActive(k.id)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
                isActive ? "text-white shadow-lg" : "glass-material text-ink-secondary hover:text-ink border border-glass-border"
              }`}
              style={isActive ? { background: k.color, boxShadow: `0 10px 24px ${k.color}33` } : undefined}
            >
              <k.icon className="h-3.5 w-3.5" />
              {k.label}
              <span className={`text-[10px] font-bold ${isActive ? "text-white/80" : "text-ink-quaternary"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {deals.length > 0 ? (
        <>
          {/* Today's top deal — hero */}
          {hero && active === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[24px] glass-material border border-glass-border/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative min-h-[220px] md:min-h-[300px] overflow-hidden">
                  {hero.product.images[0] && (
                    <img
                      src={hero.product.images[0]}
                      alt={hero.product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge variant="brand" size="sm" className="shadow-lg flex items-center gap-1">
                      <BadgePercent className="h-3 w-3" /> -{hero.discountPct}%
                    </Badge>
                  </div>
                </div>
                <div className="p-6 md:p-9 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-[#FF453A]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF453A]">Today's top deal</span>
                  </div>
                  <h2 className="text-headline text-ink tracking-tight mb-2">{hero.product.name}</h2>
                  <p className="text-callout text-ink-tertiary mb-5">
                    {hero.product.category} · {hero.product.origin} · {hero.product.supplier?.name}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[15px] text-ink-quaternary line-through">{formatPrice(hero.originalPrice, selectedCurrency)}</span>
                    <span className="text-[26px] font-bold text-ink tracking-tight">{formatPrice(hero.dealPrice, selectedCurrency)}</span>
                  </div>
                  {hero.endsAt && (
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[11px] text-ink-tertiary font-semibold">Ends in</span>
                      <Countdown target={hero.endsAt} color="#FF453A" />
                    </div>
                  )}
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="brand"
                      size="lg"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => shop(hero)}
                    >
                      Grab this deal
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Deal grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {visible.map((deal, i) => (
                <DealCard key={deal.product.id} deal={deal} currency={selectedCurrency} index={i} onShop={() => shop(deal)} />
              ))}
            </motion.div>
          </AnimatePresence>

          <CursorSpotlight spotlightSize={600} spotlightColor="rgba(212,175,55,0.03)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Real stock", desc: "Deals come straight from live marketplace inventory — no fabricated listings." },
                { title: "Countdowns", desc: "Flash and daily deals run on timers your shoppers can see." },
                { title: "Loyalty friendly", desc: "Deal purchases still earn loyalty points." },
              ].map((f) => (
                <GlassCard key={f.title} padding="md" hover>
                  <p className="text-[14px] font-bold text-ink">{f.title}</p>
                  <p className="text-[12px] text-ink-tertiary mt-0.5 leading-relaxed">{f.desc}</p>
                </GlassCard>
              ))}
            </div>
          </CursorSpotlight>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-material rounded-[24px] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,69,58,0.08)_0%,transparent_70%)] blur-[50px]" />
            <div className="relative z-10 max-w-xl mx-auto">
              <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
                <Zap className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
              </div>
              <Badge variant="brand" size="sm" className="mb-4">No live deals</Badge>
              <h2 className="text-headline text-ink tracking-tight mb-2">Deals go live here</h2>
              <p className="text-callout text-ink-tertiary max-w-md mx-auto leading-relaxed mb-8">
                No in-stock marketplace products yet. Once shops list live inventory, promotional deals appear here automatically.
              </p>
              <MagneticButton strength={0.2}>
                <Button variant="brand" size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" onClick={() => onNavigate?.("home" as BirichiNexView)}>
                  Back to the storefront
                </Button>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}