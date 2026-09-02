import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, ArrowUp, Scale, Lock, Cookie, Bot,
  Store, ShoppingBag, FileText, Check, ShieldCheck, Landmark, Globe2,
} from "lucide-react";
import type { LegalBlock, LegalPageDef } from "./policies";
import { LEGAL_NAV_ORDER, LEGAL_COMPANY } from "./policies";

const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  terms: Scale,
  privacy: Lock,
  cookies: Cookie,
  ai: Bot,
  seller: Store,
  marketplace: ShoppingBag,
};

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" } as never}
      className={`[transform-style:preserve-3d] ${className}`}
    >
      <div style={{ transform: "translateZ(46px)" }}>{children}</div>
    </motion.div>
  );
}

export default function LegalDocumentPage({
  page,
  onNavigate,
}: {
  page: LegalPageDef;
  onNavigate: (view: string) => void;
}) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });

  const articleRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const idx = targets.indexOf(visible[0].target as HTMLElement);
          if (idx >= 0) setActiveIdx(idx);
        }
      },
      { rootMargin: "-18% 0px -60% 0px", threshold: [0, 0.15, 0.4] },
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [page.id]);

  const Icon = PAGE_ICONS[page.id] || FileText;
  const currentIdx = LEGAL_NAV_ORDER.findIndex((p) => p.id === page.id);
  const prev = currentIdx > 0 ? LEGAL_NAV_ORDER[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < LEGAL_NAV_ORDER.length - 1 ? LEGAL_NAV_ORDER[currentIdx + 1] : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const main = document.querySelector("main");
    if (main) main.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (idx: number) => {
    const el = articleRef.current?.querySelector<HTMLElement>(`[data-section="${idx}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveIdx(idx);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6 lg:pt-10 pb-12 relative">
      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand via-brand-light to-brand z-50 origin-left"
        style={{ scaleX: progress }}
      />

      {/* Ambient accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 right-0 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.05)_0%,transparent_70%)] blur-[90px]" />
      </div>

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate("home")}
        className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-tertiary hover:text-ink transition-colors mb-8 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.5} />
        Back to shopping
      </motion.button>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center mb-14">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-brand/10 text-brand border border-brand/20 mb-5"
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
            Legal & Trust Centre
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display font-bold tracking-tight text-ink leading-[1.04]"
          >
            <span className="text-gradient-brand">{page.title}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="text-callout text-ink-tertiary leading-relaxed mt-4 max-w-xl"
          >
            {page.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="flex flex-wrap gap-2.5 mt-6"
          >
            {[
              { label: "Company", value: LEGAL_COMPANY.company },
              { label: "Country", value: LEGAL_COMPANY.country },
              { label: "Effective", value: page.effective },
              { label: "Updated", value: page.updated },
            ].map((chip) => (
              <div key={chip.label} className="px-3.5 py-2 rounded-[14px] glass-material border border-glass-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary">{chip.label}</p>
                <p className="text-caption font-semibold text-ink">{chip.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 3D document emblem */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="hidden lg:flex justify-center"
        >
          <TiltCard>
            <div className="relative w-[300px]">
              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-brand/25 via-transparent to-blue-400/10 blur-2xl opacity-70" />
              <div className="relative aspect-[4/5] w-[280px] rounded-[26px] glass-material border border-glass-border/50 overflow-hidden shadow-[0_30px_80px_-20px_rgba(212,175,55,0.35)]">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary/0 via-surface-secondary/40 to-brand/5" />
                <div className="relative h-full flex flex-col p-6">
                  <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center shadow-[0_8px_20px_rgba(212,175,55,0.35)] mb-5">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                  </div>
                  <p className="text-callout font-bold text-ink tracking-tight mb-1">{page.title}</p>
                  <p className="text-[11px] text-ink-tertiary mb-4">{LEGAL_COMPANY.company} · Kenya</p>
                  <div className="space-y-2.5 flex-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-ink-tertiary">
                        <Check className="h-3 w-3 text-brand shrink-0" strokeWidth={2} />
                        <span className="h-1.5 flex-1 rounded-full bg-glass-border/50" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-glass-border/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary">Version 1.0</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Effective {page.effective}</span>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Body: sticky TOC + document */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* TOC */}
        <aside className="hidden lg:block sticky top-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-material rounded-[18px] border border-glass-border/40 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary px-1 mb-3">On this page</p>
            <nav className="space-y-1">
              {page.sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => jumpTo(i)}
                  className={`w-full text-left text-caption font-semibold px-2.5 py-2 rounded-[9px] transition-colors duration-200 flex items-center gap-2 ${
                    activeIdx === i ? "bg-brand/10 text-brand" : "text-ink-tertiary hover:text-ink hover:bg-surface-secondary/60"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full transition-colors ${activeIdx === i ? "bg-brand" : "bg-ink-quaternary"}`} />
                  <span className="truncate">{s.heading || `Section ${i + 1}`}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        </aside>

        {/* Document */}
        <div ref={articleRef} className="min-w-0">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-material rounded-[24px] border border-glass-border/40 overflow-hidden"
          >
            <div className="px-6 sm:px-10 lg:px-12 py-10 lg:py-12">
              {page.sections.map((section, i) => (
                <section
                  key={i}
                  data-section={i}
                  className="scroll-mt-24 border-b border-glass-border/30 last:border-0 py-7 first:pt-0 last:pb-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {section.heading && (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-ink-quaternary font-bold text-callout">{String(i + 1).padStart(2, "0")}</span>
                        <h2 className="text-title font-bold text-ink tracking-tight">{section.heading}</h2>
                      </div>
                    )}
                    <div className="space-y-3.5">
                      {section.blocks.map((block, bi) =>
                        block.kind === "p" ? (
                          <p key={bi} className="text-body leading-relaxed text-ink-secondary whitespace-pre-line">{block.text}</p>
                        ) : (
                          <ul key={bi} className="space-y-2 pl-1">
                            {block.items.map((item, ii) => (
                              <li key={ii} className="flex items-start gap-2.5 text-body leading-relaxed text-ink-secondary">
                                <span className="mt-[9px] h-[5px] w-[5px] rounded-full bg-brand shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ),
                      )}
                    </div>
                  </motion.div>
                </section>
              ))}
            </div>
          </motion.article>

          {/* Prev / Next */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {prev && (
              <button
                onClick={() => onNavigate(prev.route)}
                className="group flex items-center gap-3 glass-material rounded-[16px] border border-glass-border/40 p-4 text-left hover:border-brand/30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-ink-quaternary group-hover:text-brand transition-colors" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary">Previous</p>
                  <p className="text-caption font-bold text-ink truncate">{prev.title}</p>
                </div>
              </button>
            )}
            {next && (
              <button
                onClick={() => onNavigate(next.route)}
                className="group flex items-center justify-end gap-3 glass-material rounded-[16px] border border-glass-border/40 p-4 text-right hover:border-brand/30 transition-colors sm:text-left"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary">Next</p>
                  <p className="text-caption font-bold text-ink truncate">{next.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-quaternary group-hover:text-brand transition-colors shrink-0" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Back to top */}
          <div className="flex justify-center mt-8">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-caption font-semibold text-ink-tertiary hover:text-brand transition-colors"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
              Back to top
            </button>
          </div>
        </div>
      </div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        className="mt-14 rounded-[20px] border border-glass-border/40 bg-surface-secondary/50 p-6 sm:p-8 text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center shadow-[0_6px_16px_rgba(212,175,55,0.3)]">
            <Globe2 className="h-4 w-4 text-white" strokeWidth={1.6} />
          </div>
          <span className="text-subhead font-bold text-ink tracking-tight">BirichiNex<span className="text-gradient-brand ml-0.5">Trust</span></span>
        </div>
        <p className="text-caption text-ink-tertiary leading-relaxed max-w-2xl mx-auto">
          {LEGAL_COMPANY.platform} · {LEGAL_COMPANY.website} · {LEGAL_COMPANY.company}, {LEGAL_COMPANY.country}.
          The current version and effective date are always published on this page.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-[11px] font-semibold text-ink-quaternary">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> Kept current</span>
          <span className="flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> Governed by the laws of Kenya</span>
          <AnimatePresence />
        </div>
      </motion.div>
    </div>
  );
}