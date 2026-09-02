import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Handshake, Truck, Shirt, Cpu, Landmark, GraduationCap, Users, ArrowRight,
  ArrowUpRight, Star, Sparkles, Mail, Wifi,
} from "lucide-react";
import TiltCard from "../components/ui/TiltCard";
import Reveal from "../components/ui/Reveal";

const IMG = {
  meeting: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
  code: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
};

const PROGRAMS = [
  {
    icon: Truck,
    tag: "Logistics",
    title: "Delivery & fulfilment partners",
    desc: "Carriers and last-mile providers moving orders reliably across Kenya. We route, batch and consolidate for them.",
  },
  {
    icon: Shirt,
    tag: "Sourcing",
    title: "European fashion suppliers",
    desc: "Premium-sorted clothing partners feeding the marketplace with graded, durable, on-trend stock.",
  },
  {
    icon: Cpu,
    tag: "Certification",
    title: "Refurb tech certifiers",
    desc: "Workshops that test, repair and certify devices — powering our certified refurbished range.",
  },
  {
    icon: Landmark,
    tag: "Payments",
    title: "Payment & fintech providers",
    desc: "Gateways enabling local currency, cards, mobile money and fast payouts for sellers.",
  },
  {
    icon: GraduationCap,
    tag: "Learning",
    title: "Academy & business educators",
    desc: "Chambers, mentors and educators helping us train founders through the BirichiNex Academy.",
  },
  {
    icon: Users,
    tag: "Growth",
    title: "Affiliates & creators",
    desc: "Creators, influencers and communities telling the BirichiNex story and earning from real impact.",
  },
];

const BENEFITS = [
  { icon: Star, title: "Reach", desc: "Access a growing community of buyers and sellers across East Africa." },
  { icon: Wifi, title: "Simple integration", desc: "Clean APIs and a partner dashboard to plug in fast and stay in control." },
  { icon: Sparkles, title: "Grow together", desc: "Transparent economics, fair terms and a team that treats partners as allies." },
];

function HeroText({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function PartnersPage({ onNavigate }: { onNavigate: (view: string) => void }) {
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
          <img src={IMG.meeting} alt="A partner meeting" className="w-full h-[130%] object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/10" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-16">
          <HeroText delay={0.15}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-6">
              <Handshake className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
              Partners
            </span>
          </HeroText>
          <HeroText delay={0.25}>
            <h1 className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-3xl">
              Grow with us. <span className="text-gradient-brand">Win together.</span>
            </h1>
          </HeroText>
          <HeroText delay={0.35}>
            <p className="text-callout text-white/70 leading-relaxed mt-4 max-w-xl">
              From logistics to payments, sourcing to education — we partner with the best teams moving commerce
              in East Africa, and build mutual growth into every agreement.
            </p>
          </HeroText>
          <HeroText delay={0.45}>
            <div className="flex flex-wrap gap-3 mt-7">
              <a href="mailto:partners@birichinex.com" className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/30 active:scale-[0.98] transition-transform">
                Become a partner <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
              </a>
              <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 backdrop-blur border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors">
                Talk to us
              </button>
            </div>
          </HeroText>
        </motion.div>
      </section>

      {/* ─── PROGRAMS ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Programmes</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Six ways to partner with BirichiNex.</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <TiltCard className="h-full" max={8}>
                <div className="h-full group relative rounded-[22px] glass-material border border-glass-border/40 p-6 overflow-hidden">
                  <div className="absolute -top-14 -right-14 h-36 w-36 rounded-full bg-brand/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-brand/25 to-brand/5 border border-brand/20 flex items-center justify-center">
                      <p.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">{p.tag}</span>
                  </div>
                  <h3 className="text-subhead font-bold text-ink mb-2">{p.title}</h3>
                  <p className="text-callout text-ink-tertiary leading-relaxed">{p.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Why partner</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">Built for lasting partnerships.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.1}>
                <TiltCard className="h-full" max={10}>
                  <div className="h-full rounded-[20px] border border-glass-border/40 bg-surface-secondary/50 p-6 backdrop-blur">
                    <div className="h-11 w-11 rounded-[14px] bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                      <b.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-subhead font-bold text-ink mb-1.5">{b.title}</h3>
                    <p className="text-caption text-ink-tertiary leading-relaxed">{b.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMAGERY STRIP ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal>
            <TiltCard max={5} lift={14} className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]">
              <img src={IMG.team} alt="Partners collaborating" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
            </TiltCard>
          </Reveal>
          <Reveal delay={0.12}>
            <TiltCard max={5} lift={14} className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]">
              <img src={IMG.code} alt="Partner integrations being built" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">
        <Reveal>
          <div className="relative rounded-[28px] overflow-hidden bg-night text-white p-8 sm:p-12 text-center">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand/15 blur-[90px]" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-[90px]" />
            <div className="relative z-10">
              <Mail className="h-7 w-7 text-brand mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-headline font-bold tracking-tight leading-tight">Ready to build with us?</h2>
              <p className="text-callout text-white/60 leading-relaxed mt-3 max-w-xl mx-auto">
                Tell us about your company, your network and what you'd love to do together. We reply to every
                serious note.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-7">
                <a href="mailto:partners@birichinex.com" className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform">
                  partners@birichinex.com <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors">
                  Or contact the team <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}