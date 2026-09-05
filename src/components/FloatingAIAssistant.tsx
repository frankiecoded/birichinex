import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2, ShieldCheck, UserPlus, Boxes } from "lucide-react";
import { useStore } from "../store/useStore";
import { useDraggableFloat, useViewport } from "../lib/useDraggableFloat";
import { chatFree } from "../../ai/src/api-client";
import type { ChatMessage } from "../../ai/src/api-client";

interface WidgetMsg {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const QUICK_CHIPS = [
  "What is BirichiNex?",
  "How do I shop and pay?",
  "How does delivery work?",
  "What do the plans unlock?",
  "Can AI really call my customers?",
];

let msgSeq = 1;
const nextId = () => msgSeq++;

export default function FloatingAIAssistant() {
  const user = useStore((s) => s.user);
  const subscription = useStore((s) => s.subscription);
  const hasPaidPlan = subscription.status === "active" && ["silver", "gold", "platinum"].includes(subscription.plan);

  const { pos, dragging, onPointerDown, onClick } = useDraggableFloat();
  const { w: vw, h: vh, bottomInset } = useViewport();
  const cornerBottom = 24 + bottomInset;
  const btnTop = pos ? pos.top : Math.max(0, vh - cornerBottom - 56);
  const btnLeft = pos ? pos.left : Math.max(0, vw - 24 - 56);
  const spaceUp = Math.max(0, btnTop - 16);
  const spaceDown = Math.max(0, vh - bottomInset - btnTop - 56 - 16);
  const openUp = spaceUp >= spaceDown;
  const panelW = Math.min(380, Math.max(200, vw - 32));
  const panelLeft = Math.min(Math.max(8, btnLeft + 56 - panelW), Math.max(8, vw - panelW - 8));
  const panelHeight = Math.max(160, Math.min(560, openUp ? spaceUp : spaceDown));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMsg[]>([
    { id: nextId(), role: "assistant", content: "Mambo! I'm Amani, your free BirichiNex assistant. Ask me anything about shopping, delivery, the plans, or how to grow your business — I'll point you to the fastest path." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasReply, setHasReply] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput("");
    const userMsg: WidgetMsg = { id: nextId(), role: "user", content: text };
    const replyId = nextId();
    setMessages((prev) => [...prev, userMsg, { id: replyId, role: "assistant", content: "" }]);
    setBusy(true);

    const history: ChatMessage[] = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    chatFree(text, history, (delta) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, content: m.content + delta } : m)),
      );
    })
      .then((res) => {
        const fallback = res.content || "I could not fetch an answer right now. Please try again in a moment.";
        setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: fallback } : m)));
        setHasReply(true);
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId
              ? { ...m, content: "I could not fetch an answer right now. Please try again in a moment." }
              : m,
          ),
        );
        setHasReply(true);
      })
      .finally(() => setBusy(false));
  };

  const openSignup = () => useStore.getState().setAuthView("signup");

  return (
    <div
      className="fixed z-[60] select-none"
      style={{ left: pos?.left, top: pos?.top, right: pos ? "auto" : "1.5rem", bottom: pos ? "auto" : `${cornerBottom}px` }}
    >
      {/* Launcher */}
      <button
        onClick={onClick(() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 60);
        })}
        onPointerDown={onPointerDown}
        aria-label="Ask Amani"
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-white shadow-xl shadow-black/20 transition-transform hover:scale-105 active:scale-95 touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <Sparkles className="h-6 w-6" strokeWidth={2} />}
        {!open && hasReply && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-surface-secondary bg-surface shadow-2xl shadow-black/25 ${
              openUp ? "bottom-[calc(100%+16px)]" : "top-[calc(100%+16px)]"
            }`}
            style={{ height: panelHeight, maxHeight: panelHeight, left: panelLeft }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-surface-secondary/60 bg-surface-secondary/50 px-4 py-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-white">
                <Sparkles className="h-5 w-5" strokeWidth={2} />
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-callout font-semibold text-ink">Amani — Free Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-ink-tertiary">
                  <ShieldCheck className="h-3 w-3" /> Instant answers, no login needed for shopping
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-surface-secondary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-brand px-3.5 py-2 text-[13px] leading-relaxed text-white">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-surface-secondary/60 bg-surface-secondary/60 px-3.5 py-2 text-[13px] leading-relaxed text-ink">
                      {m.content}
                      {busy && !m.content && (
                        <span className="inline-flex items-center gap-1.5 text-ink-tertiary">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Quick chips */}
            {messages.filter((m) => m.role === "user").length < 2 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {QUICK_CHIPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full border border-brand/25 bg-brand/5 px-3 py-1.5 text-[11px] font-medium text-brand transition-colors hover:bg-brand/10"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Footer / upsell */}
            <div className="border-t border-surface-secondary/60 px-4 py-2.5">
              {!user ? (
                <button
                  onClick={openSignup}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-brand to-brand-light px-3 py-2.5 text-[12px] font-semibold text-white transition-transform hover:scale-[0.99] active:scale-[0.98]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create a free account — unlock Amani's full power for your business
                </button>
              ) : !hasPaidPlan ? (
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-tertiary">
                  <Boxes className="h-3.5 w-3.5" />
                  Deep business AI (sales calls, follow-ups, dropshipping) unlocks on a Silver+ tier.
                </p>
              ) : (
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-tertiary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Full Amani (sales agent, follow-ups) lives in the Sales Agent tab.
                </p>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-surface-secondary/60 px-3 py-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask Amani anything…"
                className="min-w-0 flex-1 rounded-full border border-surface-secondary bg-surface-secondary/50 px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-tertiary focus:border-brand/50 focus:outline-none"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity disabled:opacity-40"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}