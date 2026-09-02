import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Store, PanelsTopLeft, Sparkles, ArrowRight, ShieldCheck, HeartHandshake,
  Lightbulb, TrendingUp, Compass, Users, Rocket, Globe2, PhoneCall, Layers,
} from "lucide-react";
import TiltCard from "../components/ui/TiltCard";

const IMG = {
  city: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=2000&q=80",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
  code: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  vision: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80",
};

function Img({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" onError={(e) => { (e.currentTarget.style.display = "none"); }} className={`object-cover ${className}`} />;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PILLARS = [
  { icon: Store, title: "Marketplace", desc: "Premium European-sorted fashion and certified refurbished technology, curated for East Africa." },
  { icon: PanelsTopLeft, title: "Business Operating System", desc: "CRM, inventory, orders, finance, procurement and logistics in one connected workspace." },
  { icon: Sparkles, title: "BNX AI & Amani", desc: "An advisory intelligence layer — from business health to priorities — and a voice-ready assistant that serves customers." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Trust", desc: "Fairness, transparency and security are the foundation of every transaction." },
  { icon: HeartHandshake, title: "Entrepreneurship", desc: "We exist to help founders build and grow resilient businesses." },
  { icon: Lightbulb, title: "Intelligence", desc: "AI and data that sharpen decisions without replacing human judgment." },
  { icon: TrendingUp, title: "Scale", desc: "Every tool is built to grow with you, from a first order to a thriving brand." },
];

const STAGES = [
  { step: "01", icon: Compass, title: "Blueprint", desc: "Connecting the journeys of the East African entrepreneur into one intentional system." },
  { step: "02", icon: Layers, title: "Build", desc: "Marketplace, business tools and advisory AI designed as a single ecosystem." },
  { step: "03", icon: Rocket, title: "Launch", desc: "BNX AI, Amani, the Academy and the commerce rails come online together." },
  { step: "04", icon: Globe2, title: "Scale", desc: "Serving a growing community of buyers, sellers and builders across Kenya and beyond." },
];

export default function AboutPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[62vh] min-h-[480px] overflow-hidden flex items-end">
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <Img src={IMG.city} alt="Nairobi skyline" className="w-full h-[130%]" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-6"
          >
            <HeartHandshake className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
            About BirichiNex
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-3xl"
          >
            The operating system for the <span className="text-gradient-brand">East African entrepreneur</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-callout text-white/70 leading-relaxed mt-4 max-w-xl"
          >
            BirichiNex Technologies Limited is building one connected ecosystem — marketplace, business tools and
            AI — that gives founders in Kenya and beyond the tools they deserve.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 mt-7"
          >
            <button
              onClick={() => onNavigate("home")}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/30 active:scale-[0.98] transition-transform"
            >
              Explore the marketplace <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 backdrop-blur border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors"
            >
              Contact us
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-8 w-[1.5px] bg-gradient-to-b from-brand to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ─── MISSION ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-brand/20 via-transparent to-blue-400/10 blur-2xl opacity-60" />
              <TiltCard className="relative rounded-[26px] overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.4)]" max={6} lift={16}>
                <Img src={IMG.team} alt="A team building BirichiNex" className="aspect-[4/3] w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-subhead font-bold text-white">One platform, every tool</p>
                    <p className="text-caption text-white/60">Marketplace · OS · AI</p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-4">Our purpose</p>
              <h2 className="text-headline font-bold tracking-tight text-ink leading-tight">
                We believe every entrepreneur deserves <span className="text-gradient-brand">world-class tools</span>.
              </h2>
              <p className="text-body text-ink-secondary leading-relaxed mt-5">
                Too often, growing businesses in East Africa stitch together disconnected apps, spreadsheets and
                manual work just to run a store. BirichiNex was designed differently — a single, intelligent
                ecosystem where a seller can list products, manage customers, watch their money, learn continuously
                and let an AI assistant help them grow, all from one place.
              </p>
              <p className="text-body text-ink-secondary leading-relaxed mt-4">
                And for buyers, it means a curated marketplace of quality fashion and certified refurbished
                technology — with the trust, shipping and support a modern shopping experience should have.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-3 mt-7">
                {["Kenya · HQ", "BirichiNex.com", "BirichiNex Technologies Limited"].map((chip) => (
                  <span key={chip} className="px-3.5 py-2 rounded-full text-caption font-semibold glass-material border border-glass-border/40 text-ink-secondary">
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── PILLARS ──────────────────────────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">What we build</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">Three pillars. One ecosystem.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.12}>
                <TiltCard className="h-full">
                  <div className="h-full group relative rounded-[24px] glass-material border border-glass-border/40 p-7 overflow-hidden">
                    <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
                    <div className="relative h-11 w-11 rounded-[14px] bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center mb-5">
                      <p.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-title font-bold text-ink mb-2">{p.title}</h3>
                    <p className="text-callout text-ink-tertiary leading-relaxed">{p.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <TiltCard className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]" max={5} lift={14}>
              <Img src={IMG.retail} alt="Curated marketplace fashion" className="aspect-[16/10] w-full" />
            </TiltCard>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-brand flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
              <Store className="h-4 w-4" strokeWidth={1.6} /> Marketplace
            </p>
            <h3 className="text-headline font-bold tracking-tight text-ink leading-tight">Shopping curated for the region.</h3>
            <p className="text-body text-ink-secondary leading-relaxed mt-4">
              Premium European-sorted fashion and certified refurbished technology, with transparent pricing,
              local currency support and tracking from checkout to door.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal className="lg:order-2">
            <TiltCard className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]" max={5} lift={14}>
              <Img src={IMG.code} alt="Software powering BirichiNex AI" className="aspect-[16/10] w-full" />
            </TiltCard>
          </Reveal>
          <Reveal delay={0.12} className="lg:order-1">
            <p className="text-brand flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
              <Sparkles className="h-4 w-4" strokeWidth={1.6} /> Intelligence
            </p>
            <h3 className="text-headline font-bold tracking-tight text-ink leading-tight">AI that works like a trusted partner.</h3>
            <p className="text-body text-ink-secondary leading-relaxed mt-4">
              BNX AI reads your actual business picture to surface health, priorities and action plans. Amani turns
              that into a voice-capable assistant that follows up, sells and serves on your behalf.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── VALUES ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 lg:pb-24">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">What we stand for</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Values baked into the platform.</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <TiltCard className="h-full" max={10}>
                <div className="h-full rounded-[20px] border border-glass-border/40 bg-surface-secondary/50 p-6 backdrop-blur">
                  <div className="flex items-center justify-between mb-5">
                    <v.icon className="h-6 w-6 text-brand" strokeWidth={1.5} />
                    <span className="text-[10px] font-bold text-ink-quaternary">0{i + 1}</span>
                  </div>
                  <h3 className="text-subhead font-bold text-ink mb-1.5">{v.title}</h3>
                  <p className="text-caption text-ink-tertiary leading-relaxed">{v.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── JOURNEY ──────────────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.05] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">The journey</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">Built in stages, always forward.</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAGES.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.12}>
                <div className="relative h-full rounded-[22px] glass-material border border-glass-border/40 p-6 pt-8 overflow-hidden">
                  <span className="absolute top-4 right-6 text-[10px] font-bold text-ink-quaternary">{s.step}</span>
                  <div className="h-10 w-10 rounded-[12px] bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    <s.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-subhead font-bold text-ink mb-1.5">{s.title}</h3>
                  <p className="text-caption text-ink-tertiary leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VISION ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mb-20 rounded-none">
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal>
            <div className="relative rounded-[28px] overflow-hidden h-[420px] flex items-end">
              <Img src={IMG.vision} alt="The horizon BirichiNex is building toward" className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/30 to-transparent" />
              <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
                <Globe2 className="h-6 w-6 text-brand mb-4" strokeWidth={1.5} />
                <h2 className="text-headline font-bold tracking-tight text-white leading-tight">
                  A future where every African founder runs their business like a modern company.
                </h2>
                <p className="text-body text-white/70 leading-relaxed mt-3">
                  From the first sale to the hundredth employee — we are building the rails that make growth
                  possible at every step.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => onNavigate("home")}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform"
                  >
                    <PhoneCall className="h-4 w-4" strokeWidth={1.5} /> Start shopping
                  </button>
                  <button
                    onClick={() => onNavigate("contact")}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors"
                  >
                    Talk to us <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* bottom brand strip */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-caption text-ink-quaternary">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-[8px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">B</span>
              </div>
              <span>BirichiNex Technologies Limited · Kenya</span>
            </div>
            <Users className="h-4 w-4 text-brand/60" strokeWidth={1.5} />
            <span>Built for founders, by people who build.</span>
          </div>
        </Reveal>
      </section>
    </div>
  );
}