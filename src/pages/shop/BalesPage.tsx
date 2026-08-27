import { motion } from "motion/react";
import {
  Package, Truck, Shield, Award, Layers, ArrowLeft, Sparkles
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import GlassCard from "../../components/ui/GlassCard";
import MagneticButton from "../../components/three/MagneticButton";
import CursorSpotlight from "../../components/three/CursorSpotlight";
import type { Currency, Product } from "../../types";

interface BalesPageProps {
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function BalesPage({ selectedCurrency, onNavigate }: BalesPageProps) {
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
              Once suppliers list bales on BirichiNex, they appear here — with full weight, piece
              estimate, and volume pricing. Buy in bulk and earn loyalty points on every order.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-tertiary">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-info" /> Door-to-door delivery</span>
            </div>
          </motion.div>
        </div>
      </CursorSpotlight>

      {/* ─── Bale Grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
              <Layers className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
            </div>
            <Badge variant="brand" size="sm" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1.5 inline" />
              Coming when suppliers join
            </Badge>
            <h2 className="text-headline text-ink tracking-tight mb-2">No bale suppliers yet</h2>
            <p className="text-callout text-ink-tertiary max-w-md mx-auto leading-relaxed mb-8">
              Wholesale bales appear here automatically once verified suppliers list them. In the
              meantime, your own inventory is ready to sell — post products to the marketplace from
              your Inventory page.
            </p>
            <MagneticButton strength={0.2}>
              <Button variant="brand" size="lg" onClick={() => onNavigate("home")}>
                Back to the storefront
              </Button>
            </MagneticButton>
          </motion.div>
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