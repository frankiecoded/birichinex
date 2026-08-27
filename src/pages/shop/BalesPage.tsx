import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package, Check, ArrowLeft, Truck, Shield, Scale, Layers, BadgeCheck, Award, Sparkles
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import GlassCard from "../../components/ui/GlassCard";
import TiltCard from "../../components/three/TiltCard";
import MagneticButton from "../../components/three/MagneticButton";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import { BALES, formatPrice } from "../../data/platform";
import type { Currency, Product } from "../../types";

interface BalesPageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

const SUPPLIER = {
  id: "sup-birichi",
  name: "BirichiNex Wholesale",
  verified: true,
  rating: 4.9,
  location: "Dar es Salaam, Tanzania",
};

function baleToProduct(bale: (typeof BALES)[number]): Product {
  return {
    id: bale.id,
    name: bale.name,
    description: `${bale.weight} compressed fashion bale — approx. ${bale.estimatedPieces} pieces. Ideal for ${bale.idealCustomer}.`,
    category: "Wholesale Bales",
    price: { amount: bale.priceTZS, currency: "TZS" },
    images: [],
    supplier: SUPPLIER,
    grade: "A+",
    origin: "Europe",
    specifications: {
      "Weight": bale.weight,
      "Est. pieces": String(bale.estimatedPieces),
      "Best for": bale.idealCustomer,
      "Sourcing": "European fashion mix — Grade A+",
    },
    stock: 24,
    minOrder: 1,
    createdAt: new Date().toISOString(),
  };
}

export default function BalesPage({ selectedCurrency, onNavigate, onAddToCart }: BalesPageProps) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = useCallback(
    (bale: (typeof BALES)[number]) => {
      onAddToCart(baleToProduct(bale));
      setAddedId(bale.id);
      setTimeout(() => setAddedId(null), 1600);
    },
    [onAddToCart],
  );

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
            <Badge variant="success" size="md" dot>
              In Stock
            </Badge>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <h1 className="text-[28px] sm:text-[40px] font-bold text-ink leading-tight tracking-tight mb-3">
                Premium Compressed Fashion Bales
              </h1>
              <p className="text-[15px] text-ink-secondary leading-relaxed mb-6">
                Sourced European-grade fashion bales from 25kg to 70kg. Perfect for retailers, market
                traders, and distributors looking for volume pricing with verified quality.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-tertiary">
                <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-success" /> Verified quality — Grade A+</span>
                <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-brand" /> Weights 25–70kg</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-info" /> Door-to-door delivery</span>
              </div>
            </motion.div>
          </div>
        </div>
      </CursorSpotlight>

      {/* ─── Bale Grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BALES.map((bale, i) => {
            const perKg = Math.round(bale.priceTZS / parseInt(bale.weight, 10));
            const added = addedId === bale.id;
            return (
              <motion.div
                key={bale.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              >
                <TiltCard className="h-full">
                  <GlassCard padding="lg" hover className="h-full">
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-[#8B5E3C]/15 to-[#FF9500]/10 flex items-center justify-center">
                          <Layers className="h-6 w-6 text-[#8B5E3C]" strokeWidth={1.5} />
                        </div>
                        {bale.badge && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-ink text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            {bale.badge}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-[17px] font-bold text-ink">{bale.name}</h3>
                        <p className="text-[13px] text-ink-tertiary mt-1">{bale.idealCustomer}</p>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[22px] font-bold text-ink tracking-tight">
                            {formatPrice(bale.priceTZS, selectedCurrency)}
                          </p>
                          <p className="text-[12px] text-ink-tertiary">
                            ≈ {formatPrice(perKg, selectedCurrency)}/kg
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="brand" size="sm">{bale.weight}</Badge>
                          <p className="text-[11px] text-ink-tertiary mt-1">
                            ~{bale.estimatedPieces} pcs
                          </p>
                        </div>
                      </div>

                      <MagneticButton className="mt-auto">
                        <Button
                          variant={added ? "brand" : "primary"}
                          fullWidth
                          size="lg"
                          icon={added ? <Check className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          onClick={() => handleAdd(bale)}
                        >
                          {added ? "Added to Cart!" : "Add to Cart"}
                        </Button>
                      </MagneticButton>
                    </div>
                  </GlassCard>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Trust / Info Strip ───────────────────────────────────────────── */}
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
