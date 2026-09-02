import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Newspaper, Megaphone, FileText, Palette, Mail, CalendarDays, Eye } from "lucide-react";
import TiltCard from "../components/ui/TiltCard";
import Reveal from "../components/ui/Reveal";

const IMG = {
  night: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1800&q=80",
  docs: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
};

const ANNOUNCEMENTS = [
  {
    date: "30 Aug 2026",
    tag: "Launch",
    icon: Megaphone,
    title: "BirichiNex opens its doors — one ecosystem for East African commerce",
    excerpt: "Marketplace, Business OS and advisory AI go live together, with a new Legal & Trust Centre framing how we earn and protect trust.",
    read: "4 min",
  },
  {
    date: "30 Aug 2026",
    tag: "AI",
    icon: Eye,
    title: "Amani — a voice-capable assistant — joins the platform",
    excerpt: "Amani answers, follows up and sells on behalf of sellers, with a live voice experience built on real-time AI.",
    read: "3 min",
  },
  {
    date: "30 Aug 2026",
    tag: "Product",
    icon: FileText,
    title: "The BirichiNex OS: CRM, inventory, orders, finance in one workspace",
    excerpt: "A connected operating system replaces the spreadsheet maze — designed for the region's way of doing business.",
    read: "5 min",
  },
  {
    date: "30 Aug 2026",
    tag: "Community",
    icon: Newspaper,
    title: "The BirichiNex Academy and community open for every seller",
    excerpt: "Free learning paths, frameworks and a community for founders building with BirichiNex every day.",
    read: "2 min",
  },
];

const KIT = [
  { icon: Palette, title: "Brand", desc: "Logo in light and dark, the BirichiNex wordmark and our gold palette." },
  { icon: FileText, title: "Style guide", desc: "Typography, spacing and tone — how to represent BirichiNex consistently." },
  { icon: Megaphone, title: "Fact sheet", desc: "Company facts, mission and pillar overview for editors and analysts." },
];

function HeroText({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function PressPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [openStory, setOpenStory] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[58vh] min-h-[430px] overflow-hidden flex items-end">
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img src={IMG.night} alt="Nairobi at night" className="w-full h-[130%] object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/10" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-16">
          <HeroText delay={0.15}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-6">
              <Newspaper className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
              Newsroom · Press
            </span>
          </HeroText>
          <HeroText delay={0.25}>
            <h1 className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-3xl">
              News, launches and <span className="text-gradient-brand">what we're building</span>.
            </h1>
          </HeroText>
          <HeroText delay={0.35}>
            <p className="text-callout text-white/70 leading-relaxed mt-4 max-w-xl">
              Official announcements from BirichiNex Technologies Limited — products, milestones and the
              people behind them. For media and PR enquiries, reach <span className="text-white font-semibold">press@birichinex.com</span>.
            </p>
          </HeroText>
        </motion.div>
      </section>

      {/* ─── ANNOUNCEMENTS ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Announcements</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Latest from BirichiNex.</h2>
        </Reveal>

        <div className="space-y-4">
          {ANNOUNCEMENTS.map((a, i) => {
            const open = openStory === i;
            return (
              <Reveal key={a.title} delay={i * 0.07}>
                <div className={`rounded-[22px] border transition-colors duration-200 overflow-hidden ${open ? "border-brand/30 bg-brand/[0.03]" : "border-glass-border/40 bg-surface-secondary/60"}`}>
                  <button
                    onClick={() => setOpenStory(open ? null : i)}
                    className="w-full flex items-center justify-between gap-5 px-5 sm:px-7 py-5 text-left"
                  >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                      <div className="hidden sm:flex h-12 w-12 shrink-0 rounded-[14px] bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 items-center justify-center">
                        <a.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{a.tag}</span>
                          <span className="text-[10px] font-semibold text-ink-quaternary">{a.date}</span>
                          <span className="text-[10px] font-semibold text-ink-quaternary">{a.read} read</span>
                        </div>
                        <h3 className="text-subhead font-bold text-ink leading-snug mt-1">{a.title}</h3>
                      </div>
                    </div>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                      <ArrowUpRight className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-7 pb-6">
                          <p className="text-body text-ink-secondary leading-relaxed max-w-3xl">{a.excerpt}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => onNavigate(a.tag === "Launch" ? "about" : "contact")} className="inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:text-brand-light transition-colors">
                              {a.tag === "Launch" ? "More about us" : "Get in touch"} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="inline-flex items-center gap-1.5 text-caption text-ink-quaternary">
                              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} /> {a.date}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ─── PRESS KIT ────────────────────────────────────────────────────── */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Media resources</p>
            <h2 className="text-headline font-bold tracking-tight text-ink">The BirichiNex press kit.</h2>
            <p className="text-callout text-ink-tertiary leading-relaxed mt-3 max-w-xl mx-auto">
              Everything journalists and creators need to write about us accurately — and beautifully.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {KIT.map((k, i) => (
              <Reveal key={k.title} delay={i * 0.1}>
                <TiltCard className="h-full" max={9}>
                  <div className="h-full rounded-[20px] border border-glass-border/40 bg-surface-secondary/50 p-6">
                    <div className="h-11 w-11 rounded-[14px] bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                      <k.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-subhead font-bold text-ink mb-1.5">{k.title}</h3>
                    <p className="text-caption text-ink-tertiary leading-relaxed">{k.desc}</p>
                    <button onClick={() => window.open("mailto:press@birichinex.com?subject=Press kit request", "_self")} className="mt-4 inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:text-brand-light transition-colors">
                      Request access <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
            {/* Logo strip */}
            <Reveal delay={0.3}>
              <TiltCard className="h-full" max={9}>
                <div className="h-full rounded-[20px] bg-night text-white p-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand/20 blur-3xl" />
                  <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center mb-5 shadow-[0_8px_20px_rgba(212,175,55,0.3)]">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <h3 className="text-subhead font-bold mb-1">BirichiNex logo</h3>
                  <p className="text-caption text-white/60 leading-relaxed">Gold on night, or on white — both included.</p>
                  <button onClick={() => onNavigate("about")} className="mt-4 inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:text-brand-light transition-colors">
                    See the brand in context <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── PRESS CONTACT ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-brand/20 via-transparent to-blue-400/10 blur-2xl opacity-60" />
              <TiltCard className="relative rounded-[24px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]" max={5} lift={14}>
                <img src={IMG.docs} alt="Preparing a BirichiNex announcement" className="aspect-[16/10] w-full object-cover" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-subhead font-bold text-white">Written by the team, for the community.</p>
                  <p className="text-caption text-white/70">No hosted journalism — only official, factual announcements.</p>
                </div>
              </TiltCard>
            </div>
            <Reveal delay={0.12}>
              <Mail className="h-7 w-7 text-brand mb-4" strokeWidth={1.5} />
              <h2 className="text-headline font-bold tracking-tight text-ink leading-tight">Work with us in the newsroom.</h2>
              <p className="text-body text-ink-secondary leading-relaxed mt-4">
                Interviewing us, covering African startups, or partnering on content? We're happy to help with
                facts, quotes and imagery.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href="mailto:press@birichinex.com" className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform">
                  press@birichinex.com <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] glass-material border border-glass-border/40 text-ink text-subhead font-semibold hover:border-brand/30 transition-colors">
                  Other enquiries
                </button>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </section>
    </div>
  );
}