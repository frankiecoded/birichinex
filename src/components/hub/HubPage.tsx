import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { useStore } from "../../store/useStore";
import { NavItem } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import TiltCard from "../three/TiltCard";
import ParticleField from "../three/ParticleField";

interface HubPageProps {
  hub: NavItem;
  onNavigate: (view: BirichiNexView) => void;
  renderers: Record<string, () => ReactNode>;
  unframedTabs?: string[];
}

export default function HubPage({ hub, onNavigate, renderers, unframedTabs = [] }: HubPageProps) {
  const activeHubTab = useStore((s) => s.activeHubTab);
  const setActiveHubTab = useStore((s) => s.setActiveHubTab);
  const setCopilotOpen = useStore((s) => s.setCopilotOpen);

  const Icon = hub.icon;
  const tabId = hub.tabs.some((t) => t.id === activeHubTab) ? activeHubTab : null;
  const activeTab = hub.tabs.find((t) => t.id === tabId);

  return (
    <div className="relative min-h-full">
      {/* Animated aurora backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="aurora-bg" />
      </div>

      <div className="relative p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {tabId && activeTab ? (
          /* ─── Tab Content View ─────────────────────────────── */
          <>
            {/* Header row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveHubTab("")}
                  className="flex items-center gap-1 h-9 px-3 rounded-[12px] glass-material text-caption font-semibold text-ink-tertiary hover:text-ink transition-colors shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Overview
                </button>
                <motion.div
                  key={`tab-icon-${activeTab.id}`}
                  initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-11 w-11 rounded-[14px] glass-material flex items-center justify-center shrink-0"
                >
                  <activeTab.icon className="h-5 w-5 text-brand-dark" strokeWidth={2} />
                </motion.div>
                <div className="min-w-0">
                  <h1 className="text-[20px] font-bold text-gradient-brand tracking-tight leading-tight truncate">
                    {activeTab.label}
                  </h1>
                  <p className="text-caption text-ink-tertiary truncate">{activeTab.desc}</p>
                </div>
              </div>

              {hub.tabs.length > 1 && (
                <div className="flex gap-1 bg-surface-secondary/70 backdrop-blur-sm p-1 rounded-[14px] border border-glass-border overflow-x-auto scrollbar-hide max-w-full shrink-0">
                  {hub.tabs.map((t) => {
                    const active = t.id === tabId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveHubTab(t.id)}
                        className={`relative flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-colors ${
                          active ? "text-ink" : "text-ink-tertiary hover:text-ink-secondary"
                        }`}
                        title={t.desc}
                      >
                        {active && (
                          <motion.span
                            layoutId={`hub-tab-${hub.view}`}
                            className="absolute inset-0 bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-glass-border"
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          />
                        )}
                        <t.icon
                          className="relative z-10 h-3.5 w-3.5 shrink-0"
                          style={{ color: active ? "#aa7c11" : undefined }}
                          strokeWidth={active ? 2 : 1.6}
                        />
                        <span className="relative z-10">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Tab Content */}
            {unframedTabs.includes(tabId) ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tabId}
                  initial={{ opacity: 0, y: 14, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.995 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderers[tabId] ? renderers[tabId]() : null}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="content-frame p-5 lg:p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tabId}
                    initial={{ opacity: 0, y: 14, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.995 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {renderers[tabId] ? renderers[tabId]() : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </>
        ) : (
          /* ─── Hub Landing Overview ─────────────────────────── */
          <>
            {/* Hero */}
            <div className="relative">
              {/* 3D particle field */}
              <div className="absolute inset-0 opacity-60">
                <ParticleField particleCount={40} color="#d4af37" showGeometry />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.06, rotate: -4 }}
                      className="relative h-14 w-14 rounded-[18px] glass-material flex items-center justify-center"
                    >
                      <div className="absolute -inset-2 rounded-[22px] gold-glow opacity-70" />
                      <Icon className="relative h-6 w-6 text-brand-dark" strokeWidth={2} />
                    </motion.div>
                    <div>
                      <p className="text-overline font-bold uppercase tracking-[0.18em] text-brand-dark">
                        {hub.group === "daily" ? "Daily essentials" : hub.group === "operations" ? "Run the machine" : "Grow over time"}
                      </p>
                      <h1 className="text-headline text-gradient-brand tracking-tight leading-none gold-sweep pb-1">
                        {hub.label}
                      </h1>
                    </div>
                  </div>
                  <p className="text-callout text-ink-secondary max-w-lg leading-relaxed">{hub.desc}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCopilotOpen(true)}
                      className="flex items-center gap-2 h-10 px-4 rounded-[13px] glass-sheet text-subhead font-semibold text-ink hover:border-brand/40 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-brand-dark" />
                      Ask the copilot to walk you through
                    </motion.button>
                    <span className="text-caption text-ink-quaternary">Press ⌘K to jump anywhere</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tab tiles */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {hub.tabs.map((tab, i) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard>
                    <button
                      onClick={() => setActiveHubTab(tab.id)}
                      className="tab-tile shine-sweep w-full h-full text-left p-6 flex flex-col group"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="h-12 w-12 rounded-[15px] icon-tile flex items-center justify-center group-hover:scale-105 transition-transform">
                          <tab.icon className="h-5 w-5 text-brand-dark" strokeWidth={2} />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-surface-secondary/70 flex items-center justify-center transition-all duration-300 group-hover:bg-brand/15 group-hover:rotate-45">
                          <ArrowUpRight className="h-3.5 w-3.5 text-ink-tertiary group-hover:text-brand-dark transition-colors" />
                        </div>
                      </div>
                      <h3 className="text-[17px] font-bold text-ink tracking-tight mb-1">{tab.label}</h3>
                      <p className="text-caption text-ink-tertiary leading-relaxed">{tab.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Open {tab.label} <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
