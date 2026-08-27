import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowUpRight, CornerDownLeft, Sparkles } from "lucide-react";
import { useStore } from "../../store/useStore";
import { BirichiNexView } from "../../types";
import { NAV_ITEMS, NAV_GROUPS, NavGroup } from "../../../ai/src/navigation";

interface PaletteItem {
  view: string;
  label: string;
  group: NavGroup;
  groupLabel: string;
  desc: string;
  icon: any;
}

const GROUP_LABEL: Record<NavGroup, string> = NAV_GROUPS.reduce((acc, g) => ({ ...acc, [g.id]: g.label }), {} as Record<NavGroup, string>);

const ALL_ITEMS: PaletteItem[] = NAV_ITEMS.flatMap((hub) => {
  const items: PaletteItem[] = [
    { view: hub.view, label: hub.label, group: hub.group, groupLabel: GROUP_LABEL[hub.group], desc: hub.desc, icon: hub.icon },
  ];
  for (const tab of hub.tabs) {
    items.push({
      view: tab.id,
      label: tab.label,
      group: hub.group,
      groupLabel: GROUP_LABEL[hub.group],
      desc: tab.desc,
      icon: tab.icon,
    });
  }
  return items;
});

export default function CommandPalette({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const open = useStore((s) => s.commandOpen);
  const setOpen = useStore((s) => s.setCommandOpen);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useStore.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = ALL_ITEMS.filter((item) => {
      const haystack = `${item.label} ${item.desc} ${item.groupLabel} ${item.view}`.toLowerCase();
      return !q || haystack.includes(q);
    });
    if (!q) return base;
    return [...base].sort((a, b) => {
      const rank = (s: string) => (s.toLowerCase().startsWith(q) ? 0 : s.toLowerCase().includes(q) ? 1 : 2);
      return rank(a.label) - rank(b.label);
    });
  }, [query]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => setIndex((i) => Math.min(i, Math.max(0, results.length - 1))), [results.length]);

  useEffect(() => {
    if (open) {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [index, open]);

  const choose = (view: string) => {
    onNavigate(view as BirichiNexView);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-scrim backdrop-blur-[2px] z-[85]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[12vh] left-1/2 -translate-x-1/2 z-[90] w-[min(600px,calc(100vw-2rem))] glass-sheet rounded-[24px] overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 h-14 border-b border-glass-border/70">
              <Search className="h-4 w-4 text-ink-tertiary" strokeWidth={2} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
                  if (e.key === "Enter" && results[index]) choose(results[index].view);
                }}
                placeholder="Jump to anything…"
                className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-quaternary focus:outline-none"
              />
              <kbd className="text-[10px] text-ink-quaternary bg-surface-secondary/80 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-2 scrollbar-hide">
              {results.length === 0 && (
                <p className="px-5 py-8 text-center text-caption text-ink-tertiary">
                  Nothing found for “{query}” — try “sales”, “money” or “customers”.
                </p>
              )}
              {results.map((item, i) => (
                <button
                  key={item.view}
                  data-idx={i}
                  onClick={() => choose(item.view)}
                  onMouseEnter={() => setIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-[14px] text-left transition-colors ${i === index ? "bg-surface-secondary" : ""}`}
                >
                  <div className={`h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0 ${i === index ? "bg-emphasis text-on-emphasis" : "bg-surface-secondary text-ink-secondary"}`}>
                    <item.icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead font-semibold text-ink truncate">{item.label}</p>
                    <p className="text-caption text-ink-tertiary truncate">{item.desc}</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-secondary text-[10px] font-bold text-ink-tertiary">
                    {item.groupLabel}
                  </span>
                  {i === index && <ArrowUpRight className="h-3.5 w-3.5 text-ink-tertiary shrink-0" />}
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-5 h-10 border-t border-glass-border/70 text-[10px] text-ink-quaternary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-brand" />
                Ask the copilot for anything else — it can explain every page.
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> to open
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
