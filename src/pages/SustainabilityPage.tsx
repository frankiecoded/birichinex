import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Leaf, Recycle, ShoppingBag, Truck, HeartHandshake, Sprout, PackageCheck,
  Globe2, ArrowRight, ShieldCheck, Droplets, Users,
} from "lucide-react";
import TiltCard from "../components/ui/TiltCard";
import Reveal from "../components/ui/Reveal";

const IMG = {
  sunrise: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=80",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
  city: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1400&q=80",
};

const PILARS = [
  {
    icon: Leaf,
    title: "Planet",
    desc: "Refurbishment and circular sourcing keep products in use and waste out of landfills.",
    items: [
      { label: "Certified refurbished tech", pct: 90, note: "of refurb inventory is re-sold, not scrapped" },
      { label: "European-sorted fashion", pct: 70, note: "graded for condition, not incinerated" },
      { label: "E-waste responsibly retired", pct: 100, note: "safe recycling for non-rescuable units" },
    ],
  },
  {
    icon: Users,
    title: "People",
    desc: "Fair terms, transparent pricing and jobs that build skills across the region.",
    items: [
      { label: "Local-first hiring", pct: 100, note: "roles based in Kenya and the region" },
      { label: "Seller terms published", pct: 100, note: "clear fees, payouts and no hidden clauses" },
      { label: "Digital Academy access", pct: 100, note: "free learning for every seller" },
    ],
  },
  {
    icon: ShoppingBag,
    title: "Product",
    desc: "Fewer, better things. Durability over fast churn in everything we list.",
    items: [
      { label: "Quality grading", pct: 100, note: "every item inspected before listing" },
      { label: "Minimal packaging", pct: 80, note: "right-sized, recyclable parcels" },
      { label: "Repair-friendly tech", pct: 75, note: "replacement parts where possible" },
    ],
  },
];

const INITIATIVES = [
  {
    icon: Recycle,
    q: "Circular by design",
    a: "Refurbished devices and European-sorted fashion give quality goods a second life. We inspect, grade and certify, so circular doesn't mean lower quality.",
  },
  {
    icon: Truck,
    q: "Smarter, cleaner logistics",
    a: "Batched routes and consolidated shipments across Kenya cut empty miles and packages per delivery.",
  },
  {
    icon: PackageCheck,
    q: "Responsible packaging",
    a: "We ship in right-sized, recyclable and minimal packaging — working toward fully plastic-free parcels.",
  },
];

function HeroText({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function SustainabilityPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[58vh] min-h-[430px] overflow-hidden flex items-end">
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img src={IMG.sunrise} alt="A Kenyan sunrise" className="w-full h-[130%] object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-16">
          <HeroText delay={0.15}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-6">
              <Leaf className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
              Sustainability
            </span>
          </HeroText>
          <HeroText delay={0.25}>
            <h1 className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-3xl">
              Commerce that's good for the <span className="text-gradient-brand">planet</span> and its people.
            </h1>
          </HeroText>
          <HeroText delay={0.35}>
            <p className="text-callout text-white/70 leading-relaxed mt-4 max-w-xl">
              We believe economic growth and environmental care belong together. Here's how BirichiNex puts
              circularity and fairness at the centre of how we buy, ship and sell.
            </p>
          </HeroText>
        </motion.div>
      </section>

      {/* ─── PILLARS ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Our approach</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Three pillars, measured honestly.</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <TiltCard className="h-full" max={7}>
                <div className="h-full flex flex-col rounded-[24px] glass-material border border-glass-border/40 p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-brand/25 to-brand/5 border border-brand/20 flex items-center justify-center">
                      <p.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-title font-bold text-ink">{p.title}</h3>
                  </div>
                  <p className="text-callout text-ink-tertiary leading-relaxed mb-6">{p.desc}</p>
                  <div className="space-y-4 mt-auto">
                    {p.items.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-caption font-semibold text-ink-secondary">{item.label}</span>
                          <span className="text-caption font-bold text-brand">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-glass-border/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            className="h-full rounded-full bg-gradient-to-r from-brand-light via-brand to-brand-dark"
                          />
                        </div>
                        <p className="text-[10px] text-ink-quaternary mt-1">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── INITIATIVES ──────────────────────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">In practice</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">What this looks like on the ground.</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INITIATIVES.map((init, i) => (
              <Reveal key={init.q} delay={i * 0.1}>
                <div className="group relative h-full rounded-[22px] border border-glass-border/40 bg-surface-secondary/50 p-6 backdrop-blur">
                  <div className="h-11 w-11 rounded-[14px] bg-brand/10 border border-brand/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <init.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-subhead font-bold text-ink leading-snug">{init.q}</h3>
                  <p className="text-callout text-ink-tertiary leading-relaxed mt-2">{init.a}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="relative h-full rounded-[22px] overflow-hidden">
                <img src={IMG.retail} alt="Curated, durable goods" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-night/10" />
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <Sprout className="h-6 w-6 text-brand mb-3" strokeWidth={1.5} />
                  <h3 className="text-subhead font-bold text-white">Fewer, better things</h3>
                  <p className="text-caption text-white/70 leading-relaxed mt-1.5">Durability beats fast churn — for the planet and your wardrobe.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── IMAGERY + CTA ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <Reveal className="lg:order-2">
            <TiltCard max={5} lift={14} className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]">
              <img src={IMG.city} alt="A city we want to keep thriving" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-night/70 to-transparent h-24" />
            </TiltCard>
          </Reveal>
          <Reveal delay={0.12} className="lg:order-1">
            <div className="flex items-center gap-2 text-brand mb-4">
              <HeartHandshake className="h-5 w-5" strokeWidth={1.5} />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Accountability</p>
            </div>
            <h2 className="text-headline font-bold tracking-tight text-ink leading-tight">
              Transparency over promises.
            </h2>
            <p className="text-body text-ink-secondary leading-relaxed mt-4">
              We publish how goods are sourced, graded and shipped — and the rules that protect sellers, buyers
              and the environment. You'll find these commitments in our legal documents and seller terms, not
              just on this page.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button onClick={() => onNavigate("legal:seller")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Seller terms
              </button>
              <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] glass-material border border-glass-border/40 text-ink text-subhead font-semibold hover:border-brand/30 transition-colors">
                Questions? Contact us <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* bottom strip */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-14">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-caption text-ink-quaternary">
            <span className="flex items-center gap-2"><Droplets className="h-4 w-4 text-brand/70" strokeWidth={1.5} /> Responsible sourcing</span>
            <span className="flex items-center gap-2"><Recycle className="h-4 w-4 text-brand/70" strokeWidth={1.5} /> Circular products</span>
            <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-brand/70" strokeWidth={1.5} /> Local-first operations</span>
          </div>
        </Reveal>
      </section>
    </div>
  );
}