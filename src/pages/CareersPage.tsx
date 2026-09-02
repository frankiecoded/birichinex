import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  ArrowRight, ArrowUpRight, Briefcase, HeartHandshake, Layers, MapPin, Rocket,
  ShieldCheck, Sparkles, GitBranch, Clock, GraduationCap, Laptop, Wifi, Coffee,
} from "lucide-react";
import TiltCard from "../components/ui/TiltCard";
import Reveal from "../components/ui/Reveal";

const IMG = {
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
  plan: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
};

const WHY = [
  { icon: Rocket, title: "Meaningful work", desc: "Every feature ships to real founders building real businesses across East Africa." },
  { icon: Layers, title: "Ownership & autonomy", desc: "Tight pods, high trust and the freedom to move fast without layers of approval." },
  { icon: GitBranch, title: "Learn every day", desc: "New products, new models, new frameworks — growth is part of the job description." },
  { icon: HeartHandshake, title: "People-first culture", desc: "Flexible hours, honest feedback and a team that genuinely cares." },
];

const PERKS = [
  { icon: Laptop, label: "Remote-friendly, Kenya-based roles" },
  { icon: Clock, label: "Flexible working hours" },
  { icon: GraduationCap, label: "Learning & certification budget" },
  { icon: Coffee, label: "Nairobi HQ hub with office perks" },
  { icon: Wifi, label: "Home office set-up allowance" },
  { icon: ShieldCheck, label: "Comprehensive health cover" },
];

const ROLES = [
  { title: "Senior Product Engineer", type: "Full-time", place: "Nairobi / Remote Kenya", tag: "Engineering", desc: "Own features end-to-end across the marketplace, the OS and our AI layer. React, TypeScript and modern edge deployment." },
  { title: "AI & Automation Engineer", type: "Full-time", place: "Nairobi / Remote Kenya", tag: "AI", desc: "Build and improve BNX AI and Amani — from voice-powered assistants to business-health intelligence." },
  { title: "Marketplace Operations Lead", type: "Full-time", place: "Nairobi", tag: "Operations", desc: "Run catalog quality, fulfilment SLAs and seller onboarding so every order lands flawlessly." },
  { title: "Customer Experience Specialist", type: "Full-time", place: "Nairobi", tag: "CX", desc: "Be the human voice behind support, returns and order tracking — and train Amani to sound like the team." },
  { title: "Fashion & Refurb Trust Buyer", type: "Full-time", place: "Nairobi / EU", tag: "Sourcing", desc: "Source premium European-sorted fashion and certified refurbished technology with ruthless quality checks." },
  { title: "Marketing & Community Lead", type: "Full-time", place: "Nairobi", tag: "Growth", desc: "Grow the BirichiNex community, run campaigns and turn sellers and buyers into champions." },
];

function HeroText({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function CareersPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const rolesRef = useRef<HTMLDivElement | null>(null);
  const [applied, setApplied] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string>("All");
  const tags = ["All", ...Array.from(new Set(ROLES.map((r) => r.tag)))];
  const visibleRoles = activeTag === "All" ? ROLES : ROLES.filter((r) => r.tag === activeTag);

  const scrollToRoles = () => rolesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const apply = (i: number) => {
    setApplied(i);
    window.open(`mailto:careers@birichinex.com?subject=${encodeURIComponent(`Application: ${ROLES[i].title}`)}`, "_self");
    setTimeout(() => setApplied(null), 3500);
  };

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[62vh] min-h-[480px] overflow-hidden flex items-end">
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img src={IMG.team} alt="The BirichiNex team" className="w-full h-[130%] object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-16">
          <HeroText delay={0.15}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-6">
              <Briefcase className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
              Careers at BirichiNex
            </span>
          </HeroText>
          <HeroText delay={0.25}>
            <h1 className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-3xl">
              Build the future of <span className="text-gradient-brand">African commerce</span>.
            </h1>
          </HeroText>
          <HeroText delay={0.35}>
            <p className="text-callout text-white/70 leading-relaxed mt-4 max-w-xl">
              Join a small, senior team shaping a marketplace, a business operating system and an AI that speaks
              your customer's language — from a base in Nairobi, serving the whole region.
            </p>
          </HeroText>
          <HeroText delay={0.45}>
            <div className="flex flex-wrap gap-3 mt-7">
              <button onClick={scrollToRoles} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/30 active:scale-[0.98] transition-transform">
                View open roles <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
              </button>
              <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 backdrop-blur border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors">
                Talk to us
              </button>
            </div>
          </HeroText>
        </motion.div>
      </section>

      {/* ─── WHY ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Why BirichiNex</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Work that means something.</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.1}>
              <TiltCard className="h-full" max={10}>
                <div className="h-full rounded-[20px] border border-glass-border/40 bg-surface-secondary/50 p-6 backdrop-blur">
                  <div className="h-11 w-11 rounded-[14px] bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                    <w.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-subhead font-bold text-ink mb-1.5">{w.title}</h3>
                  <p className="text-caption text-ink-tertiary leading-relaxed">{w.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── OPEN ROLES ───────────────────────────────────────────────────── */}
      <section ref={rolesRef} className="relative py-12 scroll-mt-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Open roles</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">Find your seat at the table.</h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`px-4 py-2 rounded-full text-caption font-semibold border transition-colors ${
                    activeTag === t ? "bg-brand/15 border-brand/40 text-brand" : "border-glass-border/40 text-ink-tertiary hover:text-ink hover:border-glass-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {visibleRoles.map((r, i) => (
                <motion.div
                  key={r.title}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard className="h-full" max={7}>
                    <div className="h-full flex flex-col rounded-[22px] glass-material border border-glass-border/40 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">{r.tag}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary">{r.type}</span>
                      </div>
                      <h3 className="text-subhead font-bold text-ink leading-snug">{r.title}</h3>
                      <p className="flex items-center gap-1.5 text-caption text-ink-tertiary mt-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand/70" strokeWidth={1.5} /> {r.place}
                      </p>
                      <p className="text-callout text-ink-tertiary leading-relaxed mt-3 mb-6">{r.desc}</p>
                      <button
                        onClick={() => apply(i)}
                        className="mt-auto inline-flex items-center justify-center gap-2 h-10 rounded-[12px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-md shadow-[#d4af37]/20 active:scale-[0.98] transition-transform"
                      >
                        {applied === i ? "Drafting email…" : "Apply now"} <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <Reveal className="text-center mt-10">
            <p className="text-caption text-ink-tertiary">
              Don't see your role? We're always looking for great people — and we hire through{" "}
              <span className="text-brand font-semibold">careers@birichinex.com</span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── CULTURE IMAGERY ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal>
            <TiltCard max={5} lift={14} className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]">
              <img src={IMG.office} alt="The BirichiNex studio" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
            </TiltCard>
          </Reveal>
          <Reveal delay={0.12}>
            <TiltCard max={5} lift={14} className="rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]">
              <img src={IMG.plan} alt="Planning sessions at BirichiNex" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ─── PERKS ────────────────────────────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Perks</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">Set up to do your best work.</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map((p, i) => (
              <Reveal key={p.label} delay={i * 0.07}>
                <div className="flex items-center gap-3.5 p-4 rounded-[16px] glass-material border border-glass-border/40">
                  <div className="h-10 w-10 rounded-[12px] bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                    <p.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <p className="text-subhead font-semibold text-ink">{p.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <Reveal>
          <div className="relative rounded-[28px] overflow-hidden bg-night text-white p-8 sm:p-12 text-center">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand/15 blur-[90px]" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-[90px]" />
            <div className="relative z-10">
              <Sparkles className="h-7 w-7 text-brand mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-headline font-bold tracking-tight leading-tight">
                Let's build something people actually use.
              </h2>
              <p className="text-callout text-white/60 leading-relaxed mt-3 max-w-xl mx-auto">
                Send your portfolio, your GitHub, a product you love — anything that shows how you think.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-7">
                <a href="mailto:careers@birichinex.com" className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform">
                  careers@birichinex.com <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <button onClick={() => onNavigate("about")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-white/10 border border-white/20 text-white text-subhead font-semibold hover:bg-white/15 transition-colors">
                  Learn about us <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}