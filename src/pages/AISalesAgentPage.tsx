import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headset, PhoneIncoming, PhoneOutgoing, Play, Pause, FileText, Mail,
  Bell, Settings2, Plus, Trash2, Sparkles, Repeat, Clock, Mic, Check,
  ChevronDown, Inbox, MessageSquare, BadgeCheck, AudioLines, Languages, Target, Volume2, Square
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useStore } from "../store/useStore";
import {
  simulateAgentCall,
  buildCallNotification,
  buildCallEmail,
  buildFollowUpReminderEmail,
  buildCallScript,
  SimContact,
  SimOrder,
  CustomerContext,
} from "../../ai/src/sales-agent";
import { AgentCall, AgentCallOutcome, AgentCallObjective, AgentLanguage, AgentVoiceId, TranscriptLine } from "../types";

const VOICES: { id: AgentVoiceId; label: string; gemini: string; gender: "Female" | "Male"; desc: string }[] = [
  { id: "kore", label: "Kore", gemini: "Kore", gender: "Female", desc: "Warm, clear — the default secretary" },
  { id: "aria", label: "Aria", gemini: "Aria", gender: "Female", desc: "Bright and natural" },
  { id: "leda", label: "Leda", gemini: "Leda", gender: "Female", desc: "Calm and composed" },
  { id: "aoede", label: "Aoede", gemini: "Aoede", gender: "Female", desc: "Melodic and friendly" },
  { id: "puck", label: "Puck", gemini: "Puck", gender: "Male", desc: "Light and upbeat" },
  { id: "zephyr", label: "Zephyr", gemini: "Zephyr", gender: "Male", desc: "Smooth and relaxed" },
  { id: "charon", label: "Charon", gemini: "Charon", gender: "Male", desc: "Deep and steady" },
  { id: "fenrir", label: "Fenrir", gemini: "Fenrir", gender: "Male", desc: "Bold and confident" },
];

const OBJECTIVES: { id: AgentCallObjective; label: string; desc: string }[] = [
  { id: "inform", label: "Give updates", desc: "Order status & tracking" },
  { id: "close-sale", label: "Close sales", desc: "Pitch & take orders on the call" },
  { id: "schedule-followup", label: "Book callbacks", desc: "Set up a human callback" },
  { id: "collect-details", label: "Collect details", desc: "Confirm addresses & preferences" },
  { id: "survey", label: "Ask feedback", desc: "Quick satisfaction survey" },
];

const LANGUAGES: { id: AgentLanguage; label: string; hint: string }[] = [
  { id: "en", label: "English", hint: "Pure English" },
  { id: "sw", label: "Kiswahili", hint: "Swahili pleasantries" },
  { id: "mixed", label: "Mixed", hint: "EN + SW naturally mixed" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-brand" : "bg-surface-secondary"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

const OUTCOME_COLORS: Record<AgentCallOutcome, string> = {
  "order-placed": "#30D158",
  "order-repeated": "#d4af37",
  "order-status": "#007AFF",
  "query-answered": "#30D158",
  "callback-requested": "#FF9500",
  voicemail: "#AF52DE",
  "no-answer": "#8E8E93",
  unresolved: "#FF453A",
};

const TYPE_LABELS: Record<AgentCall["type"], string> = {
  inbound: "Inbound",
  "outbound-followup": "Follow-up",
  "outbound-sales": "Sales",
  "outbound-cart-recovery": "Cart recovery",
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AISalesAgentPage() {
  const aiAgent = useStore((s) => s.aiAgent);
  const updateAiAgent = useStore((s) => s.updateAiAgent);
  const agentCalls = useStore((s) => s.agentCalls);
  const logAgentCall = useStore((s) => s.logAgentCall);
  const contacts = useStore((s) => s.contacts);
  const orders = useStore((s) => s.orders);
  const dropshipOrders = useStore((s) => s.dropshipOrders);
  const notifications = useStore((s) => s.notifications);
  const addNotification = useStore((s) => s.addNotification);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const emails = useStore((s) => s.emails);
  const logEmail = useStore((s) => s.logEmail);
  const markEmailRead = useStore((s) => s.markEmailRead);
  const user = useStore((s) => s.user);
  const addWalletFunds = useStore((s) => s.addWalletFunds);
  const addLoyaltyPoints = useStore((s) => s.addLoyaltyPoints);

  const [tab, setTab] = useState<"live" | "inbox" | "voice">("live");
  const [busy, setBusy] = useState<"inbound" | "followups" | null>(null);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState(0);
  const [openingPhraseDraft, setOpeningPhraseDraft] = useState("");
  const [closingPhraseDraft, setClosingPhraseDraft] = useState("");
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortPreviewRef = useRef(false);
  const [inboxTab, setInboxTab] = useState<"notifications" | "emails">("notifications");
  const [connection, setConnection] = useState<"conversational" | "live" | "simulated" | "checking">("checking");
  const [fromNumber, setFromNumber] = useState<string | null>(null);

  const ownerEmail = user?.email ?? "owner@birichinex.com";
  const ownerName = user?.name ?? "Business Owner";

  // ── Live calling connection status ───────────────────────────────────────
  useEffect(() => {
    fetch("/api/agent-call/mode")
      .then((r) => r.json())
      .then((d) => {
        if (d?.mode === "conversational") setConnection("conversational");
        else setConnection(d?.mode === "live" ? "live" : "simulated");
        setFromNumber(d?.fromNumber ?? null);
      })
      .catch(() => setConnection("simulated"));
  }, []);

  // ── Playback animation ─────────────────────────────────────────────────────
  const playingCall = playingId ? agentCalls.find((c) => c.id === playingId) : null;
  useEffect(() => {
    if (!playingCall) return;
    if (activeLine >= playingCall.transcript.length) {
      setPlayingId(null);
      setActiveLine(0);
      return;
    }
    const t = setTimeout(() => setActiveLine((l) => l + 1), 850);
    return () => clearTimeout(t);
  }, [playingCall, activeLine]);

  const todayCalls = agentCalls.filter(
    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString(),
  );
  const answeredToday = todayCalls.filter((c) => c.status === "completed").length;
  const ordersToday = todayCalls.filter((c) => c.outcome === "order-placed" || c.outcome === "order-repeated").length;
  const hoursSaved = Math.round(todayCalls.reduce((acc, c) => acc + c.durationSec, 0) / 360);

  const completedCalls = agentCalls.filter((c) => c.status === "completed");

  // ── Core simulation helpers ────────────────────────────────────────────────
  const recordCall = (call: Omit<AgentCall, "id" | "createdAt">) => {
    logAgentCall(call);
    const full = { ...call, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    addNotification(buildCallNotification(full));
    if (aiAgent.sendOwnerEmails) logEmail(buildCallEmail(full, ownerEmail, aiAgent.name));
    if (call.outcome === "order-placed" || call.outcome === "order-repeated") {
      addWalletFunds(2500, `Cashback — ${call.customerName} placed an order via Amani`);
      addLoyaltyPoints(120, `AI sales bonus — ${call.customerName}'s order`, call.orderId);
    }
    return full;
  };

  // ── Live dial + simulation fallback ──────────────────────────────────────
  const dialCall = async (
    type: AgentCall["type"],
    contact: SimContact,
    customer: CustomerContext,
    order?: SimOrder,
  ): Promise<Omit<AgentCall, "id" | "createdAt">> => {
    try {
      const resp = await fetch("/api/agent-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          contact,
          order,
          config: {
            ...aiAgent,
            business: "BirichiNex",
          },
        }),
      });
      const data = await resp.json();
      if (data?.mode === "live" || data?.mode === "conversational") {
        const script: TranscriptLine[] = Array.isArray(data.transcript)
          ? data.transcript
          : [{ speaker: "agent", text: `${aiAgent.name} is calling ${contact.name} now.` }];
        const liveConversation = data?.mode === "conversational";
        return {
          customerId: contact.id,
          customerName: contact.name,
          customerPhone: contact.phone,
          type,
          status: "completed",
          outcome: type === "outbound-sales" ? "callback-requested" : "order-status",
          durationSec: 0,
          transcript: [
            ...script,
            {
              speaker: "customer",
              text: liveConversation
                ? `(live AI conversation — ${contact.phone} is ringing now)`
                : `(live call — ${contact.phone} is ringing now)`,
            },
          ],
          orderId: order?.id,
          summary: liveConversation
            ? `Live AI conversation via Twilio + Gemini — ${contact.name} (${contact.phone}). SID ${data.callSid}.`
            : `Live call placed via Twilio — ${contact.name} (${contact.phone}). SID ${data.callSid}.`,
        };
      }
    } catch (err) {
      console.error("Live call failed, falling back to simulation:", err);
    }
    return simulateAgentCall(aiAgent, contact, customer, type, order);
  };

  const pickOrder = () => {
    const active = orders.find((o) => o.status !== "delivered") ?? orders[0];
    return active;
  };

  const handleInbound = async () => {
    if (busy) return;
    setBusy("inbound");
    await new Promise((r) => setTimeout(r, 600));
    const pool = contacts.filter((c) => c.status === "active");
    const contact: SimContact = pool[Math.floor(Math.random() * pool.length)] ?? {
      id: "cnt-guest",
      name: "A Guest Customer",
      phone: "+255 700 000 000",
    };
    const order = pickOrder();
    const pastOrders = completedCalls.filter((c) => c.customerName === contact.name).length;
    const customer: CustomerContext = {
      name: contact.name,
      orderCount: pastOrders + 1,
      lifetimeSpend: 120000,
      openOrderId: order?.id,
    };
    const type = connection === "live" || connection === "conversational" ? "outbound-sales" : "inbound";
    const call = await dialCall(
      type,
      contact,
      customer,
      order
        ? { id: order.id, productName: order.productName, status: order.status, customerName: contact.name }
        : undefined,
    );
    recordCall(call);
    setBusy(null);
  };

  const handleFollowUps = async () => {
    if (busy) return;
    setBusy("followups");
    await new Promise((r) => setTimeout(r, 700));
    const pending = orders.filter((o) => o.status !== "delivered").slice(0, 3);
    if (pending.length > 0) logEmail(buildFollowUpReminderEmail(ownerEmail, pending.length));
    for (const order of pending) {
      const contact: SimContact = {
        id: `order-${order.id}`,
        name: order.customerName,
        phone: order.customerPhone || "+255 700 000 000",
      };
      const customer: CustomerContext = {
        name: contact.name,
        orderCount: 1,
        lifetimeSpend: 0,
        openOrderId: order.id,
      };
      const call = await dialCall(
        "outbound-followup",
        contact,
        customer,
        { id: order.id, productName: order.productName, status: order.status, customerName: contact.name },
      );
      recordCall(call);
      await new Promise((r) => setTimeout(r, 350));
    }
    setBusy(null);
  };

  const handleRepeat = async (call: AgentCall) => {
    const contact: SimContact = { id: call.customerId, name: call.customerName, phone: call.customerPhone };
    const customer: CustomerContext = {
      name: call.customerName,
      orderCount: 2,
      lifetimeSpend: 250000,
      openOrderId: call.orderId,
    };
    const repeatCall = await dialCall(
      "inbound",
      contact,
      customer,
      call.orderId ? { id: call.orderId } : undefined,
    );
    recordCall({ ...repeatCall, outcome: "order-repeated", type: "inbound" });
  };

  // ── Derived lists ──────────────────────────────────────────────────────────
  const stats = useMemo(
    () => [
      { label: "Calls today", value: String(todayCalls.length), color: "#007AFF" },
      { label: "Answered", value: String(answeredToday), color: "#30D158" },
      { label: "Orders via AI", value: String(ordersToday), color: "#d4af37" },
      { label: "Hours saved", value: String(hoursSaved), color: "#AF52DE" },
    ],
    [todayCalls.length, answeredToday, ordersToday, hoursSaved],
  );

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadEmails = emails.filter((e) => !e.read).length;

  // ── Call preview (test-drive the agent before you dial) ────────────────────
  const previewContact: SimContact = { id: "preview", name: "Grace Mwangi", phone: "+254 700 000 000" };
  const previewCustomer: CustomerContext = { name: "Grace Mwangi", orderCount: 2, lifetimeSpend: 250000 };
  const previewOrder: SimOrder = { id: "BNX-1042", productName: "Ladies denim jeans", status: "in transit" };
  const previewScript = useMemo(
    () => buildCallScript(aiAgent, previewContact, previewCustomer, "outbound-followup", previewOrder),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aiAgent.name, aiAgent.tone, aiAgent.language, aiAgent.openingPhrases, aiAgent.closingPhrases, aiAgent.callObjective, aiAgent.humanTouch, aiAgent.repeatOrders],
  );

  const playPreview = async () => {
    if (previewPlaying) {
      abortPreviewRef.current = true;
      previewAudioRef.current?.pause?.();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      setPreviewPlaying(false);
      return;
    }
    abortPreviewRef.current = false;
    setPreviewPlaying(true);
    for (const line of previewScript.transcript) {
      if (line.speaker !== "agent" || abortPreviewRef.current) continue;
      try {
        const res = await fetch("/api/ai/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: line.text,
            voice: VOICES.find((v) => v.id === aiAgent.voice)?.gemini || "Kore",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.audioBase64) {
            const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
            const audio = new Audio(URL.createObjectURL(new Blob([bytes.buffer], { type: data.format || "audio/wav" })));
            previewAudioRef.current = audio;
            await new Promise<void>((resolve) => {
              audio.onended = () => resolve();
              audio.onerror = () => resolve();
              audio.onpause = () => resolve();
              audio.play().catch(() => resolve());
            });
            previewAudioRef.current = null;
            continue;
          }
        }
      } catch {
        /* fall through to browser TTS */
      }
      if (abortPreviewRef.current) break;
      if (typeof window === "undefined" || !window.speechSynthesis) continue;
      const utter = new SpeechSynthesisUtterance(line.text);
      window.speechSynthesis.speak(utter);
      await new Promise<void>((resolve) => {
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
      });
      if (abortPreviewRef.current) break;
    }
    setPreviewPlaying(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto relative">
      {/* Ambient orb */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-[14px] bg-gradient-to-br from-[#30D158] to-[#0B6623] flex items-center justify-center">
              <Headset className="h-5 w-5 text-white" strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#30D158] border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-title font-bold text-ink tracking-tight">
                <span className="text-gradient-brand">AI Sales Agent</span>
              </h1>
              <p className="text-caption text-ink-tertiary flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-[#30D158]" strokeWidth={1.5} />
                {connection === "live" || connection === "conversational"
                  ? connection === "conversational"
                    ? `${aiAgent.name} is live — real AI conversation calls, dialing from ${fromNumber}`
                    : `${aiAgent.name} is live on Twilio — dialing from ${fromNumber}`
                  : connection === "checking"
                    ? "Checking call connection…"
                    : `${aiAgent.name} is ready — simulation mode (add Twilio keys for live calls)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connection === "live" || connection === "conversational" ? "brand" : "default"} size="sm">
              <PhoneOutgoing className="h-3 w-3 mr-1.5 inline" />
              {connection === "conversational" ? "AI conversation" : connection === "live" ? "Live calling" : "Simulation"}
            </Badge>
            <Badge variant="brand" size="sm">
              <Mic className="h-3 w-3 mr-1.5 inline" />
              Recorder {aiAgent.recordCalls ? "ON" : "OFF"}
            </Badge>
            <Badge variant="default" size="sm">
              <Bell className="h-3 w-3 mr-1.5 inline" />
              {unreadNotifications} unread
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 bg-surface-secondary/50 p-1 rounded-[14px] w-fit border border-glass-border/50">
          {(
            [
              { key: "live", label: "Call Center", icon: PhoneIncoming },
              { key: "inbox", label: "Owner Inbox", icon: Inbox },
              { key: "voice", label: "Agent Voice", icon: Settings2 },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-caption font-semibold transition-all duration-200 ${
                tab === t.key ? "bg-surface text-ink shadow-sm" : "text-ink-tertiary hover:text-ink-secondary"
              }`}
            >
              <t.icon className="h-4 w-4" strokeWidth={1.5} />
              {t.label}
              {t.key === "inbox" && unreadNotifications + unreadEmails > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifications + unreadEmails}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ LIVE TAB ═══ */}
      {tab === "live" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="glass-material rounded-[18px] p-5 border border-glass-border/30">
                  <p className="text-display font-bold text-ink tracking-tight" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-caption text-ink-tertiary mt-1">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-[14px] bg-[#30D158]/10 flex items-center justify-center shrink-0">
                  <Mic className="h-6 w-6 text-[#30D158]" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-subhead font-bold text-ink mb-1">Drive {aiAgent.name} now</h2>
                  <p className="text-caption text-ink-tertiary max-w-lg leading-relaxed">
                    {connection === "live"
                      ? "Place a real outbound call or launch automated order follow-ups. Every call is logged, transcribed, and emailed to you — and synced to your CRM."
                      : "Simulate a real call, or launch automated order follow-ups. Every call is logged, transcribed, and emailed to you — and synced to your CRM."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="brand" size="md" onClick={handleInbound} loading={busy === "inbound"}>
                  <PhoneIncoming className="h-4 w-4 mr-2" />
                  {connection === "live" ? "Call a customer now" : "Simulate inbound call"}
                </Button>
                <Button variant="secondary" size="md" onClick={handleFollowUps} loading={busy === "followups"}>
                  <PhoneOutgoing className="h-4 w-4 mr-2" /> Run order follow-ups
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Call feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-subhead font-bold text-ink">Live call history</h2>
                <p className="text-caption text-ink-tertiary mt-0.5">Every call, recorded and transcribed</p>
              </div>
              <p className="text-caption text-ink-quaternary">{agentCalls.length} total</p>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {agentCalls.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-material rounded-[18px] p-10 text-center border border-glass-border/30"
                  >
                    <Headset className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1} />
                    <p className="text-callout text-ink-tertiary">
                      No calls yet. Hit "{connection === "live" ? "Call a customer now" : "Simulate inbound call"}" to get started.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {agentCalls.map((call, i) => {
                const expanded = expandedCall === call.id;
                const playing = playingId === call.id;
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                    className="glass-material rounded-[18px] border border-glass-border/30 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setExpandedCall(expanded ? null : call.id);
                        setPlayingId(null);
                        setActiveLine(0);
                      }}
                      className="w-full flex items-center gap-4 p-4 text-left group"
                    >
                      <div
                        className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0"
                        style={{ background: call.type === "inbound" ? "rgba(0,122,255,0.1)" : "rgba(212,175,55,0.1)" }}
                      >
                        {call.type === "inbound"
                          ? <PhoneIncoming className="h-4.5 w-4.5 text-[#007AFF]" strokeWidth={1.5} />
                          : <PhoneOutgoing className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-subhead font-bold text-ink truncate">{call.customerName}</p>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ color: OUTCOME_COLORS[call.outcome], background: `${OUTCOME_COLORS[call.outcome]}14` }}
                          >
                            {call.outcome.replace(/-/g, " ")}
                          </span>
                        </div>
                        <p className="text-caption text-ink-tertiary mt-0.5 truncate">
                          {TYPE_LABELS[call.type]} · {call.status} · {timeAgo(call.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-caption text-ink-quaternary flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {formatDuration(call.durationSec)}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-ink-quaternary transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          strokeWidth={1.5}
                        />
                      </div>
                    </button>

                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-glass-border/40"
                      >
                        <div className="p-4">
                          <p className="text-caption text-ink-tertiary mb-4 leading-relaxed">{call.summary}</p>

                          {/* Playback bar */}
                          <div className="flex items-center gap-3 mb-4">
                            <button
                              onClick={() => {
                                if (playing) {
                                  setPlayingId(null);
                                  setActiveLine(0);
                                } else {
                                  setPlayingId(call.id);
                                  setActiveLine(0);
                                }
                              }}
                              className="h-9 w-9 rounded-full bg-[#30D158] flex items-center justify-center text-white shadow-md shadow-[#30D158]/30"
                            >
                              {playing ? <Pause className="h-4 w-4" strokeWidth={2} /> : <Play className="h-4 w-4 ml-0.5" strokeWidth={2} />}
                            </button>
                            <div className="flex-1 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                              <div
                                className="h-full bg-[#30D158] transition-all duration-300"
                                style={{
                                  width: call.transcript.length
                                    ? `${(Math.min(activeLine, call.transcript.length) / call.transcript.length) * 100}%`
                                    : "0%",
                                }}
                              />
                            </div>
                            <span className="text-caption text-ink-quaternary font-mono">
                              {formatDuration(playing ? Math.round((activeLine / Math.max(call.transcript.length, 1)) * call.durationSec) : call.durationSec)}
                            </span>
                          </div>

                          {/* Transcript */}
                          <div className="space-y-2.5 mb-4">
                            {call.transcript.map((line, li) => {
                              const visible = !playing || li <= activeLine;
                              return (
                                <motion.div
                                  key={li}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: visible ? 1 : 0.22 }}
                                  transition={{ duration: 0.25 }}
                                  className={`flex ${line.speaker === "agent" ? "justify-start" : "justify-end"}`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed ${
                                      line.speaker === "agent"
                                        ? "bg-surface-secondary/80 text-ink-secondary border border-glass-border/40"
                                        : "bg-brand/10 text-ink border border-brand/15"
                                    }`}
                                  >
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-quaternary mb-0.5">
                                      {line.speaker === "agent" ? aiAgent.name : call.customerName}
                                    </span>
                                    {line.text}
                                  </div>
                                </motion.div>
                              );
                            })}
                            {call.transcript.length === 0 && (
                              <p className="text-caption text-ink-tertiary text-center py-3">No answer — no transcript recorded.</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {call.outcome === "order-repeated" && (
                              <Badge variant="brand" size="sm">
                                <Repeat className="h-3 w-3 mr-1.5 inline" />
                                Repeat order placed
                              </Badge>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => handleRepeat(call)}>
                              <Repeat className="h-3.5 w-3.5 mr-2" /> Repeat this purchase
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                addNotification(buildCallNotification(call));
                                if (aiAgent.sendOwnerEmails) logEmail(buildCallEmail(call, ownerEmail, aiAgent.name));
                              }}
                            >
                              <Mail className="h-3.5 w-3.5 mr-2" /> Resend transcript
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ INBOX TAB ═══ */}
      {tab === "inbox" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-surface-secondary/50 p-1 rounded-[12px] w-fit border border-glass-border/50">
              {(
                [
                  { key: "notifications", label: `Site notifications (${unreadNotifications})`, icon: Bell },
                  { key: "emails", label: `Owner emails (${unreadEmails})`, icon: Mail },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setInboxTab(t.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[9px] text-caption font-semibold transition-all duration-200 ${
                    inboxTab === t.key ? "bg-surface text-ink shadow-sm" : "text-ink-tertiary hover:text-ink-secondary"
                  }`}
                >
                  <t.icon className="h-4 w-4" strokeWidth={1.5} />
                  {t.label}
                </button>
              ))}
            </div>
            {inboxTab === "notifications" && unreadNotifications > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                <Check className="h-3.5 w-3.5 mr-2" /> Mark all read
              </Button>
            )}
          </div>

          {inboxTab === "notifications" && (
            <div className="space-y-3">
              {notifications.length === 0 && (
                <div className="glass-material rounded-[18px] p-10 text-center border border-glass-border/30">
                  <Bell className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1} />
                  <p className="text-callout text-ink-tertiary">No notifications yet.</p>
                </div>
              )}
              {notifications.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                  onClick={() => markNotificationRead(n.id)}
                  className={`w-full text-left glass-material rounded-[16px] p-4 border transition-colors duration-200 ${
                    n.read ? "border-glass-border/30 opacity-70" : "border-brand/25"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ background: n.type === "call" ? "rgba(48,209,88,0.1)" : n.type === "order" ? "rgba(212,175,55,0.1)" : "rgba(0,122,255,0.1)" }}
                    >
                      {n.type === "call" ? <Headset className="h-4 w-4 text-[#30D158]" strokeWidth={1.5} /> : <Bell className="h-4 w-4 text-brand" strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-subhead font-semibold text-ink">{n.title}</p>
                        <span className="text-caption text-ink-quaternary shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-caption text-ink-tertiary mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {inboxTab === "emails" && (
            <div className="space-y-3">
              {emails.length === 0 && (
                <div className="glass-material rounded-[18px] p-10 text-center border border-glass-border/30">
                  <Mail className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1} />
                  <p className="text-callout text-ink-tertiary">No owner emails yet.</p>
                </div>
              )}
              {emails.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                  className={`glass-material rounded-[16px] border transition-colors duration-200 ${
                    e.read ? "border-glass-border/30" : "border-brand/25"
                  }`}
                >
                  <button
                    onClick={() => markEmailRead(e.id)}
                    className="w-full text-left p-4 flex items-start gap-3"
                  >
                    <div className="h-9 w-9 rounded-[10px] bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-[#007AFF]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-subhead font-semibold ${e.read ? "text-ink-secondary" : "text-ink"}`}>{e.subject}</p>
                        <span className="text-caption text-ink-quaternary shrink-0">{timeAgo(e.createdAt)}</span>
                      </div>
                      <p className="text-caption text-ink-tertiary mt-0.5">To: {e.to} · {e.kind.replace(/-/g, " ")}</p>
                    </div>
                    {!e.read && <span className="h-2 w-2 rounded-full bg-[#007AFF] shrink-0 mt-1.5" />}
                  </button>
                  <div className="px-4 pb-4 pt-0">
                    <pre className="text-caption text-ink-tertiary leading-relaxed whitespace-pre-wrap font-sans bg-surface-secondary/60 rounded-[12px] p-3.5 border border-glass-border/30 max-h-56 overflow-y-auto">
                      {e.body}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VOICE TAB ═══ */}
      {tab === "voice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live calling connection */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30 lg:col-span-2"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-[12px] bg-[#30D158]/10 flex items-center justify-center shrink-0">
                  <PhoneOutgoing className="h-5 w-5 text-[#30D158]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-subhead font-bold text-ink">Live calling</h2>
                    {connection === "live" ? (
                      <Badge variant="brand" size="sm">Connected</Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        {connection === "checking" ? "Checking…" : "Simulation"}
                      </Badge>
                    )}
                  </div>
                  {connection === "live" ? (
                    <p className="text-caption text-ink-tertiary leading-relaxed">
                      Calls dial for real through the Twilio Voice API, from {fromNumber}. Customers can
                      press 1 to repeat an order or 2 to request a call back — every outcome is logged and
                      emailed to you.
                    </p>
                  ) : (
                    <p className="text-caption text-ink-tertiary leading-relaxed max-w-2xl">
                      Real dialing is one config away. Add these to <span className="font-mono text-ink-secondary">.env</span>{" "}
                      and restart: <span className="font-mono text-ink-secondary">TWILIO_ACCOUNT_SID</span>,{" "}
                      <span className="font-mono text-ink-secondary">TWILIO_AUTH_TOKEN</span>,{" "}
                      <span className="font-mono text-ink-secondary">TWILIO_PHONE_NUMBER</span> (E.164), and a public{" "}
                      <span className="font-mono text-ink-secondary">TWILIO_TWIML_BASE_URL</span> (e.g. your ngrok or
                      deployed URL). Point your Twilio number at <span className="font-mono text-ink-secondary">/api/twilio/inbound</span>{" "}
                      to answer inbound calls too. Until then, calls run as a full simulation.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={aiAgent.recordCalls ? "brand" : "default"} size="sm">
                  <Mic className="h-3 w-3 mr-1.5 inline" />
                  {aiAgent.recordCalls ? "Recording ON" : "Recording OFF"}
                </Badge>
                <Badge variant="default" size="sm">
                  <Bell className="h-3 w-3 mr-1.5 inline" />
                  {aiAgent.sendOwnerEmails ? "Email transcripts" : "No email"}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-[12px] bg-[#30D158]/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#30D158]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-subhead font-bold text-ink">How {aiAgent.name} talks</h2>
                <p className="text-caption text-ink-tertiary">Personality, voice, language and what she aims to achieve</p>
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Agent name</label>
              <input
                value={aiAgent.name}
                onChange={(e) => updateAiAgent({ name: e.target.value })}
                className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-subhead text-ink focus:outline-none focus:border-brand/40"
              />
            </div>

            {/* Tone */}
            <div className="mb-5">
              <label className="text-caption text-ink-secondary font-semibold block mb-2">Tone of voice</label>
              <div className="flex flex-wrap gap-2">
                {(["friendly", "professional", "warm", "confident"] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updateAiAgent({ tone })}
                    className={`px-4 py-2 rounded-[10px] text-caption font-semibold capitalize transition-all duration-200 border ${
                      aiAgent.tone === tone
                        ? "bg-brand/10 border-brand/40 text-brand-dark"
                        : "bg-surface-secondary/60 border-glass-border text-ink-tertiary hover:text-ink"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="mb-5">
              <label className="text-caption text-ink-secondary font-semibold block mb-2">
                <Languages className="h-3.5 w-3.5 mr-1.5 inline" strokeWidth={1.5} />
                Language
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => updateAiAgent({ language: lang.id })}
                    className={`px-4 py-2 rounded-[10px] text-caption font-semibold transition-all duration-200 border ${
                      aiAgent.language === lang.id
                        ? "bg-brand/10 border-brand/40 text-brand-dark"
                        : "bg-surface-secondary/60 border-glass-border text-ink-tertiary hover:text-ink"
                    }`}
                  >
                    {lang.label}
                    <span className="block text-[10px] font-normal text-ink-quaternary mt-0.5">{lang.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice picker */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-caption text-ink-secondary font-semibold">
                  <AudioLines className="h-3.5 w-3.5 mr-1.5 inline" strokeWidth={1.5} />
                  Agent voice
                </label>
                <button
                  onClick={playPreview}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface-secondary/60 border border-glass-border text-[11px] font-semibold text-ink-secondary hover:text-ink transition-colors"
                  title="Hear this voice"
                >
                  {previewPlaying ? <Square className="h-3 w-3" strokeWidth={2} /> : <Play className="h-3 w-3" strokeWidth={2} />}
                  {previewPlaying ? "Stop" : "Preview voice"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["Female", "Male"] as const).map((gender) => (
                  <div key={gender}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-quaternary mb-1.5">{gender} voices</p>
                    <div className="space-y-1.5">
                      {VOICES.filter((v) => v.gender === gender).map((v) => (
                        <button
                          key={v.id}
                          onClick={() => updateAiAgent({ voice: v.id })}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] text-caption transition-all duration-200 border ${
                            aiAgent.voice === v.id
                              ? "bg-brand/10 border-brand/40"
                              : "bg-surface-secondary/60 border-glass-border hover:border-brand/25"
                          }`}
                        >
                          <span className="text-left">
                            <span className={`block font-bold ${aiAgent.voice === v.id ? "text-brand-dark" : "text-ink"}`}>{v.label}</span>
                            <span className="block text-[10px] text-ink-quaternary leading-tight">{v.desc}</span>
                          </span>
                          {aiAgent.voice === v.id && <Volume2 className="h-3.5 w-3.5 text-brand shrink-0" strokeWidth={2} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call objective */}
            <div className="mb-5">
              <label className="text-caption text-ink-secondary font-semibold block mb-2">
                <Target className="h-3.5 w-3.5 mr-1.5 inline" strokeWidth={1.5} />
                What a call should do
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {OBJECTIVES.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => updateAiAgent({ callObjective: obj.id })}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-left transition-all duration-200 border ${
                      aiAgent.callObjective === obj.id
                        ? "bg-brand/10 border-brand/40"
                        : "bg-surface-secondary/60 border-glass-border hover:border-brand/25"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${aiAgent.callObjective === obj.id ? "bg-brand" : "bg-ink-quaternary"}`} />
                    <span className="flex-1">
                      <span className={`block text-caption font-bold capitalize ${aiAgent.callObjective === obj.id ? "text-brand-dark" : "text-ink"}`}>{obj.label}</span>
                      <span className="block text-[10px] text-ink-quaternary">{obj.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Human touch */}
            <div className="flex items-center justify-between gap-4 px-3.5 py-3 rounded-[12px] bg-surface-secondary/60 border border-glass-border/40">
              <div>
                <p className="text-subhead font-semibold text-ink">Human touch</p>
                <p className="text-caption text-ink-tertiary mt-0.5">Natural fillers like "just a moment", "let me check that" and easy acknowledgments</p>
              </div>
              <Toggle on={aiAgent.humanTouch} onToggle={() => updateAiAgent({ humanTouch: !aiAgent.humanTouch })} />
            </div>
          </motion.div>

          {/* Scripts & phrases */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-[12px] bg-[#007AFF]/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#007AFF]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-subhead font-bold text-ink">What she says</h2>
                <p className="text-caption text-ink-tertiary">Write her opening and closing lines — it's what customers hear</p>
              </div>
            </div>

            {/* Opening phrases */}
            <div className="mb-5">
              <label className="text-caption text-ink-secondary font-semibold block mb-2">
                Opening phrases <span className="text-ink-quaternary font-normal">(use {"{customer}"}, {"{agent}"}, {"{business}"}, {"{order}"})</span>
              </label>
              <div className="space-y-2 mb-3">
                {aiAgent.openingPhrases.map((phrase, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-secondary/60 border border-glass-border rounded-[12px] px-3.5 py-2.5 text-caption text-ink-secondary leading-relaxed">
                      {phrase}
                    </div>
                    <button
                      onClick={() => updateAiAgent({ openingPhrases: aiAgent.openingPhrases.filter((_, idx) => idx !== i) })}
                      className="h-8 w-8 rounded-[9px] bg-surface-secondary/60 hover:bg-error/10 text-ink-quaternary hover:text-error flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                {aiAgent.openingPhrases.length === 0 && (
                  <p className="text-caption text-ink-quaternary">No custom openers — she'll use her default greeting for the selected objective.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={openingPhraseDraft}
                  onChange={(e) => setOpeningPhraseDraft(e.target.value)}
                  placeholder="Add a new opening phrase…"
                  className="flex-1 h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-caption text-ink focus:outline-none focus:border-brand/40"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    if (!openingPhraseDraft.trim()) return;
                    updateAiAgent({ openingPhrases: [...aiAgent.openingPhrases, openingPhraseDraft.trim()] });
                    setOpeningPhraseDraft("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Closing phrases */}
            <div>
              <label className="text-caption text-ink-secondary font-semibold block mb-2">
                Closing phrases <span className="text-ink-quaternary font-normal">(use {"{customer}"}, {"{agent}"}, {"{business}"})</span>
              </label>
              <div className="space-y-2 mb-3">
                {aiAgent.closingPhrases.map((phrase, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-secondary/60 border border-glass-border rounded-[12px] px-3.5 py-2.5 text-caption text-ink-secondary leading-relaxed">
                      {phrase}
                    </div>
                    <button
                      onClick={() => updateAiAgent({ closingPhrases: aiAgent.closingPhrases.filter((_, idx) => idx !== i) })}
                      className="h-8 w-8 rounded-[9px] bg-surface-secondary/60 hover:bg-error/10 text-ink-quaternary hover:text-error flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                {aiAgent.closingPhrases.length === 0 && (
                  <p className="text-caption text-ink-quaternary">No custom closers — she'll sign off with a warm goodbye matching her tone.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={closingPhraseDraft}
                  onChange={(e) => setClosingPhraseDraft(e.target.value)}
                  placeholder="Add a new closing phrase…"
                  className="flex-1 h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-caption text-ink focus:outline-none focus:border-brand/40"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    if (!closingPhraseDraft.trim()) return;
                    updateAiAgent({ closingPhrases: [...aiAgent.closingPhrases, closingPhraseDraft.trim()] });
                    setClosingPhraseDraft("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Call preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30 lg:col-span-2"
          >
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-[#d4af37]/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-subhead font-bold text-ink">Hear her before you dial</h2>
                  <p className="text-caption text-ink-tertiary">
                    A live preview of a follow-up call to Grace Mwangi, rebuilt from your settings instantly
                  </p>
                </div>
              </div>
              <Button variant="brand" size="sm" onClick={playPreview} icon={previewPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}>
                {previewPlaying ? "Stop preview" : "Play the call"}
              </Button>
            </div>
            <div className="rounded-[14px] border border-glass-border/40 bg-surface-secondary/40 p-4 max-h-72 overflow-y-auto space-y-2.5">
              {previewScript.transcript.map((line, li) => (
                <div key={li} className={`flex ${line.speaker === "agent" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-[12px] px-3.5 py-2 text-[13px] leading-relaxed ${
                      line.speaker === "agent"
                        ? "bg-surface-secondary/80 text-ink-secondary border border-glass-border/40"
                        : "bg-brand/10 text-ink border border-brand/15"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-quaternary mb-0.5">
                      {line.speaker === "agent" ? aiAgent.name : "Grace Mwangi"}
                    </span>
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-glass-border/40">
              <p className="text-caption text-ink-tertiary flex items-center gap-2">
                <AudioLines className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
                {VOICES.find((v) => v.id === aiAgent.voice)?.label} · {aiAgent.tone} ·{" "}
                {LANGUAGES.find((l) => l.id === aiAgent.language)?.label} ·{" "}
                {OBJECTIVES.find((o) => o.id === aiAgent.callObjective)?.label}
              </p>
              <Badge variant="brand" size="sm">Live preview</Badge>
            </div>
          </motion.div>

          {/* Automation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-[12px] bg-[#d4af37]/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-brand" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-subhead font-bold text-ink">Automation & policy</h2>
                <p className="text-caption text-ink-tertiary">Everything runs on its own — you just supervise</p>
              </div>
            </div>

            <div className="space-y-4">
              {(
                [
                  { key: "answerCalls", label: "Answer calls 24/7", desc: "Inbound and outbound calls are picked up automatically." },
                  { key: "autoFollowUp", label: "Auto order follow-ups", desc: `Dial customers ${aiAgent.followUpHours}h after an order is placed.` },
                  { key: "recordCalls", label: "Record & transcribe calls", desc: "Save every call so you can listen back anytime." },
                  { key: "sendOwnerEmails", label: "Email me every call", desc: `Send transcripts to ${ownerEmail} automatically.` },
                  { key: "repeatOrders", label: "Offer repeat orders", desc: "Remind returning customers and re-place their last order." },
                ] as const
              ).map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-subhead font-semibold text-ink">{t.label}</p>
                    <p className="text-caption text-ink-tertiary mt-0.5">{t.desc}</p>
                  </div>
                  <Toggle
                    on={Boolean(aiAgent[t.key])}
                    onToggle={() => updateAiAgent({ [t.key]: !aiAgent[t.key] } as Partial<typeof aiAgent>)}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-glass-border/40">
                <div>
                  <p className="text-subhead font-semibold text-ink">Working hours</p>
                  <p className="text-caption text-ink-tertiary mt-0.5">Only call outside these hours if auto follow-ups are off</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={aiAgent.workingHours.start}
                    onChange={(e) => updateAiAgent({ workingHours: { ...aiAgent.workingHours, start: e.target.value } })}
                    className="h-10 px-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none"
                  />
                  <span className="text-caption text-ink-quaternary">–</span>
                  <input
                    type="time"
                    value={aiAgent.workingHours.end}
                    onChange={(e) => updateAiAgent({ workingHours: { ...aiAgent.workingHours, end: e.target.value } })}
                    className="h-10 px-2 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-glass-border/40">
                <div>
                  <p className="text-subhead font-semibold text-ink">Always-on hours</p>
                  <p className="text-caption text-ink-tertiary mt-0.5">Wrap around the clock regardless of the window above</p>
                </div>
                <Toggle
                  on={aiAgent.workingHours.enabled}
                  onToggle={() => updateAiAgent({ workingHours: { ...aiAgent.workingHours, enabled: !aiAgent.workingHours.enabled } })}
                />
              </div>
            </div>
          </motion.div>

          {/* Knowledge rules */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-material rounded-[20px] p-6 border border-glass-border/30"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-[12px] bg-[#007AFF]/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#007AFF]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-subhead font-bold text-ink">Conversation guardrails</h2>
                <p className="text-caption text-ink-tertiary">Rules {aiAgent.name} always follows on a call</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiAgent.knowledge.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface-secondary/60 border border-glass-border/40 rounded-[14px] p-4">
                  <Check className="h-4 w-4 text-[#30D158] mt-0.5 shrink-0" strokeWidth={2} />
                  <p className="text-caption text-ink-secondary leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-glass-border/40">
              <p className="text-caption text-ink-tertiary flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
                {aiAgent.name} pulls each customer's purchase history and CRM record before every call.
              </p>
              <Badge variant="brand" size="sm">CRM-synced</Badge>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
