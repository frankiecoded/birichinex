import { motion } from "motion/react";
import { Zap, Clock, Tag, Gift, Star, TrendingDown, ArrowRight } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import CursorSpotlight from "../components/three/CursorSpotlight";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import type { BirichiNexView } from "../types";

interface DealsPageProps {
  onNavigate?: (view: string | BirichiNexView) => void;
}

const DEAL_KINDS = [
  { id: "flash", label: "Flash Sales", icon: Zap, color: "#FF453A" },
  { id: "daily", label: "Daily Deals", icon: Clock, color: "#007AFF" },
  { id: "bundle", label: "Bundle Deals", icon: Gift, color: "#AF52DE" },
  { id: "seasonal", label: "Seasonal", icon: Star, color: "#FF9500" },
  { id: "clearance", label: "Clearance", icon: TrendingDown, color: "#30D158" },
];

export default function DealsPage({ onNavigate }: DealsPageProps) {
  const inventoryItems = useStore((s) => s.inventoryItems);
  const orders = useStore((s) => s.orders);

  const dealCandidates = inventoryItems.filter((item) => item.stock > 0).length;
  const hasActivity = orders.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,69,58,0.06)_0%,transparent_70%)] blur-[60px] animate-[orbFloat_20s_ease-in-out_infinite]" />
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
            <Tag className="h-5 w-5 text-brand" strokeWidth={1.5} />
            <h1 className="text-headline text-gradient-brand tracking-tight">Deals</h1>
          </div>
          <p className="text-callout text-ink-tertiary mt-1">
            Flash sales, daily deals, and clearance runs created by {dealCandidates > 0 ? "your shop" : "shops on BirichiNex"}.
          </p>
        </div>
      </motion.div>

      {/* Deal kinds */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {DEAL_KINDS.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="md" hover>
              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center mb-3" style={{ background: `${k.color}10` }}>
                <k.icon className="h-5 w-5" style={{ color: k.color }} strokeWidth={1.5} />
              </div>
              <p className="text-subhead font-bold text-ink">{k.label}</p>
              <p className="text-caption text-ink-tertiary mt-0.5">Created by shops, live in seconds</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glass-material rounded-[24px] p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,69,58,0.08)_0%,transparent_70%)] blur-[50px]" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="h-16 w-16 rounded-[18px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
              <Zap className="h-7 w-7 text-ink-quaternary" strokeWidth={1.5} />
            </div>
            <Badge variant="brand" size="sm" className="mb-4">No live deals</Badge>
            <h2 className="text-headline text-ink tracking-tight mb-2">
              Deals go live here
            </h2>
            <p className="text-callout text-ink-tertiary max-w-md mx-auto leading-relaxed mb-8">
              Every deal on this page is created from real inventory — flash discounts, daily markdowns,
              and clearance runs. {hasActivity
                ? "Create your first deal from the business dashboard."
                : "Once you list products and drive orders, promotional deals become available from the business dashboard."}
            </p>
            <MagneticButton strength={0.2}>
              <Button
                variant="brand"
                size="lg"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
                onClick={() => onNavigate?.("home" as BirichiNexView)}
              >
                Back to the storefront
              </Button>
            </MagneticButton>
          </div>
        </div>
      </motion.div>

      <CursorSpotlight spotlightSize={600} spotlightColor="rgba(212,175,55,0.03)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Real stock", desc: "Deals deduct from your live inventory automatically." },
            { title: "Countdowns", desc: "Flash deals run on timers your shoppers can see." },
            { title: "Loyalty friendly", desc: "Deal purchases still earn loyalty points." },
          ].map((f) => (
            <GlassCard key={f.title} padding="md" hover>
              <p className="text-[14px] font-bold text-ink">{f.title}</p>
              <p className="text-[12px] text-ink-tertiary mt-0.5 leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </CursorSpotlight>
    </div>
  );
}