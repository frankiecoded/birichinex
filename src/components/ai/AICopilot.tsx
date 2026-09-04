import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, X, ArrowUpRight, HelpCircle, Compass, Bot, ArrowRight, Mic, Volume2, AudioLines, Check, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { BirichiNexView } from "../../types";
import { getViewLabel } from "../../../ai/src/navigation";
import { PAGE_KNOWLEDGE, respondToQuery, viewChips, CopilotAction } from "../../../ai/src/knowledge";
import { buildAttention, buildBNXBriefing, BNXBriefing, BNXState } from "../../../ai/src/bnxi";
import { AgentCommand, classifyAgentCommand, clarificationFor } from "../../../ai/src/agent";
import { ExecutionResult, buildAgentContext, executeAgentCommand, undoExecution, UndoAction } from "../../lib/agent-execute";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  actions?: CopilotAction[];
  kind?: "text" | "confirm" | "result";
  command?: AgentCommand;
  result?: ExecutionResult;
}

interface AICopilotProps {
  onNavigate: (view: BirichiNexView) => void;
}

const speechSupported =
  typeof window !== "undefined" &&
  !!(window as any).SpeechRecognition ||
  !!(window as any).webkitSpeechRecognition;

const NAV_INTENT = /^(open|go to|take me to|show me|switch to|navigate to|let'?s (go|head) to)\b/i;

// High-quality, natural female voices — ranked by preference.
const FEMALE_VOICE_HINTS = [
  "samantha",
  "aria",
  "jenny",
  "google uk english female",
  "google us english",
  "victoria",
  "zira",
  "hazel",
  "allison",
  "ava",
  "sara",
  "susan",
  "natasha",
  "karen",
  "moira",
  "tessa",
  "libby",
];

const YES_RE = /^(yes|yeah|yep|yup|sure|ok|okay|do it|go ahead|confirm|proceed|please|correct|alright|sawa|ndio)\b/i;
const NO_RE = /^(no|nope|nah|cancel|stop|don'?t|not now|skip|never mind|hapa|la)\b/i;

let voiceCache: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  if (!voiceCache || voiceCache.length === 0) {
    voiceCache = window.speechSynthesis.getVoices();
    if (voiceCache.length === 0) {
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        voiceCache = window.speechSynthesis.getVoices();
      });
    }
  }
  return voiceCache;
}

function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /^en(-|_)?/i.test(v.lang));
  const hint = (name: string) =>
    FEMALE_VOICE_HINTS.findIndex((h) => name.toLowerCase().includes(h));
  const ranked = [...english].sort(
    (a, b) =>
      (hint(b.name) === -1 ? 999 : hint(b.name)) -
      (hint(a.name) === -1 ? 999 : hint(a.name)),
  );
  return ranked.find((v) => hint(v.name) !== -1) ?? ranked[0] ?? voices[0] ?? null;
}

// Turn written reply text into natural, everyday spoken language.
function toSpokenText(text: string): string {
  let t = text
    .replace(/[•●·▪→—–·:·]/g, " ")
    .replace(/[#*_`~>|]/g, " ")
    .replace(/https?:\/\/\S+/g, "the link")
    .replace(/\bpm-[a-z]{2,3}-\d{4}-\d{3,}\b/gi, "your tracking code")
    .replace(/\b(?:com|net|org)\b/g, "")
    .replace(/\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

let ttsAudio: HTMLAudioElement | null = null;

// Speak via the server's Gemini TTS (Google AI Studio, free tier — the same
// neural voices Gemini uses) when configured, falling back to the browser's
// speech synthesizer.
async function speakText(text: string) {
  const clean = toSpokenText(text);
  if (!clean) return;
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  if (ttsAudio) {
    ttsAudio.pause();
    ttsAudio = null;
  }

  try {
    const res = await fetch("/api/ai/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const url = URL.createObjectURL(
          new Blob([bytes.buffer], { type: data.format || "audio/mpeg" }),
        );
        const audio = new Audio(url);
        ttsAudio = audio;
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
        return;
      }
    }
  } catch {
    // Fall through to browser speech synthesis.
  }

  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = 0.96;
  u.pitch = 1.05;
  const voice = pickFemaleVoice(loadVoices());
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

export default function AICopilot({ onNavigate }: AICopilotProps) {
  const open = useStore((s) => s.copilotOpen);
  const setOpen = useStore((s) => s.setCopilotOpen);
  const copilotPrompt = useStore((s) => s.copilotPrompt);
  const setCopilotPrompt = useStore((s) => s.setCopilotPrompt);
  const copilotNonce = useStore((s) => s.copilotNonce);
  const guideActive = useStore((s) => s.guideActive);
  const currentView = useStore((s) => s.currentView);
  const startGuide = useStore((s) => s.startGuide);
  const settings = useStore((s) => s.settings);
  const audit = useStore((s) => s.audit);
  const contacts = useStore((s) => s.contacts);
  const transactions = useStore((s) => s.transactions);
  const inventoryItems = useStore((s) => s.getUserInventory());
  const courseProgress = useStore((s) => s.courseProgress);
  const agentCalls = useStore((s) => s.agentCalls);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const subscription = useStore((s) => s.subscription);
  const orders = useStore((s) => s.orders);
  const shipments = useStore((s) => s.shipments);
  const wallet = useStore((s) => s.wallet);
  const dropshipOrders = useStore((s) => s.dropshipOrders);
  const loyalty = useStore((s) => s.loyalty);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<AgentCommand | null>(null);
  const [doneIds, setDoneIds] = useState<Record<string, boolean>>({});
  const [wakeEnabled, setWakeEnabled] = useState(() => {
    try {
      return localStorage.getItem("bnx.assistant") !== "off";
    } catch {
      return true;
    }
  });
  const [assistantActive, setAssistantActive] = useState(false);
  const [assistantListening, setAssistantListening] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [briefing, setBriefing] = useState<BNXBriefing | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const assistantRecognitionRef = useRef<any>(null);
  const skipGreetingRef = useRef(false);
  const wakeFailedRef = useRef(false);
  const answeredRef = useRef(false);
  const mountedRef = useRef(true);
  const wakeEnabledRef = useRef(wakeEnabled);
  const assistantActiveRef = useRef(assistantActive);
  const pendingCommandRef = useRef<AgentCommand | null>(null);
  const yesNoModeRef = useRef(false);

  useEffect(() => {
    pendingCommandRef.current = pendingCommand;
  }, [pendingCommand]);

  useEffect(() => {
    wakeEnabledRef.current = wakeEnabled;
  }, [wakeEnabled]);

  useEffect(() => {
    assistantActiveRef.current = assistantActive;
  }, [assistantActive]);

  useEffect(() => {
    try {
      localStorage.setItem("bnx.assistant", wakeEnabled ? "on" : "off");
    } catch {
      /* noop */
    }
    if (wakeEnabled) {
      wakeFailedRef.current = false;
      startWakeListening();
    } else {
      endAssistantSession();
      stopWakeListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeEnabled]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      recognitionRef.current?.stop?.();
      wakeRecognitionRef.current?.stop?.();
      assistantRecognitionRef.current?.stop?.();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pageLabel = getViewLabel(currentView);
  const pageKnowledge = PAGE_KNOWLEDGE[currentView];

  const bnx = useMemo<BNXState | null>(
    () => ({
      userName: settings.profile.name || "founder",
      businessName: audit?.businessProfile.name || settings.profile.company || "your business",
      audit: null,
      wallet: { balance: wallet.balance },
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        status: t.status,
        date: t.date,
      })),
      inventory: inventoryItems.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        stock: i.stock,
        minStock: i.minStock,
        price: i.price,
        status: i.status,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        productName: o.productName,
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
      dropshipOrders: dropshipOrders.map((d) => ({
        id: d.id,
        productName: d.productName,
        quantity: d.quantity,
        total: d.total,
        status: d.status,
        placedAt: d.placedAt,
      })),
      agentCalls: agentCalls.map((c) => ({
        id: c.id,
        outcome: c.outcome,
        status: c.status,
        createdAt: c.createdAt,
      })),
      loyalty: { points: loyalty.points },
      contacts: contacts.length,
      subscription: { status: subscription.status, plan: subscription.plan },
    }),
    [settings, audit, wallet, transactions, inventoryItems, orders, dropshipOrders, agentCalls, loyalty, contacts, subscription],
  );

  const attentionCount = useMemo(() => (bnx ? buildAttention(bnx).length : 0), [bnx]);

  const ctx = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount.amount, 0);
    const activeCourses = Object.values(courseProgress).filter((c) => c.started && !c.completed).length;
    return {
      currentView,
      userName: settings.profile.name || "founder",
      businessName: audit?.businessProfile.name || settings.profile.company || "your business",
      audit,
      contactsCount: contacts.length,
      revenue,
      inventoryCount: inventoryItems.length,
      agentCalls: agentCalls.length,
      activeCourses,
      currency: selectedCurrency,
      hasSubscription: subscription.status === "active",
      trackedItems: [
        ...orders.map((o) => ({
          kind: "order" as const,
          trackingNumber: o.trackingNumber,
          status: o.status,
          title: o.productName,
          originCity: o.originCity,
          destinationCity: o.destinationCity,
          carrier: o.carrier,
          estimatedDelivery: o.estimatedDelivery,
        })),
        ...shipments.map((s) => ({
          kind: "shipment" as const,
          trackingNumber: s.trackingNumber,
          status: s.status,
          title: s.title,
          originCity: s.originCity,
          destinationCity: s.destinationCity,
          carrier: s.carrier,
          estimatedDelivery: s.estimatedDelivery,
        })),
      ],
      bnx,
    };
  }, [transactions, courseProgress, settings, audit, contacts, inventoryItems, agentCalls, selectedCurrency, subscription, currentView, orders, shipments, bnx]);

  // Speaks only when summoned (opening the copilot) or when replying to the user.
  useEffect(() => {
    if (open && messages.length === 0) {
      const firstName = ctx.userName.split(" ")[0];
      const opener: Message = {
        id: "opener",
        role: "ai",
        text: pageKnowledge
          ? `Karibu, ${firstName}. I'm your BirichiNex copilot. Right now you're on ${pageLabel} — ${pageKnowledge.explain} Ask me anything, or tap a suggestion below.`
          : `Karibu, ${firstName}. I'm your BirichiNex copilot. Ask me anything about ${pageLabel}, or tap a suggestion below.`,
        actions: pageKnowledge ? pageKnowledge.actions.slice(0, 3) : [],
      };
      setMessages([opener]);
      if (assistantActive && !skipGreetingRef.current) speakText(opener.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        setInput(transcript);
        setTimeout(() => send(transcript), 350);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  // ==========================================================
  // "Hey BNX" wake-word voice assistant (Siri-style)
  // Silence by default — only talks after the wake word fires.
  // ==========================================================
  const detectWakeWord = (phrase: string): boolean => {
    const norm = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (!norm) return false;
    const head = norm.split(" ").slice(0, 4).join(" ");
    if (/^(hey |hi |ok |okay |ello |hello |yo )?(b\s*n\s*x|b\s*e\s*n\s*x|bexi|binx|benix|benex|bineks|biness|birichinex|birichine)\b/i.test(head)) {
      return true;
    }
    return /(^|\s)(hey ?bnx|ok ?bnx|okay ?bnx|b ?n ?x)\b/i.test(norm);
  };

  const startWakeListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (wakeRecognitionRef.current || assistantActiveRef.current) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let phrase = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        phrase += e.results[i][0].transcript;
      }
      if (detectWakeWord(phrase)) onWakeWord();
    };
    rec.onend = () => {
      wakeRecognitionRef.current = null;
      if (wakeEnabledRef.current && !assistantActiveRef.current && !wakeFailedRef.current && mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current && wakeEnabledRef.current && !assistantActiveRef.current) startWakeListening();
        }, 300);
      }
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") wakeFailedRef.current = true;
      wakeRecognitionRef.current = null;
    };
    try {
      rec.start();
      wakeRecognitionRef.current = rec;
    } catch {
      wakeRecognitionRef.current = null;
    }
  };

  const stopWakeListening = () => {
    wakeRecognitionRef.current?.stop?.();
    wakeRecognitionRef.current = null;
  };

  const onWakeWord = () => {
    if (!mountedRef.current || !wakeEnabledRef.current || assistantActiveRef.current) return;
    assistantActiveRef.current = true;
    stopWakeListening();
    const firstName = ctx.userName.split(" ")[0];
    const greeting = `Yes, ${firstName}? I'm listening. What can I help you with?`;
    const b = bnx ? buildBNXBriefing(bnx) : null;
    const brief = b?.next ? ` Before you ask — ${b.summary}` : "";
    setAssistantActive(true);
    setBriefing(b);
    setShowOverlay(true);
    setOverlayText(greeting + brief);
    setMessages([{ id: crypto.randomUUID(), role: "ai", text: greeting + brief }]);
    setOpen(true);
    skipGreetingRef.current = true;
    speakText(greeting + brief).then(() => {
      if (mountedRef.current && assistantActiveRef.current) {
        answeredRef.current = false;
        startQuestionListening();
      }
    });
  };

  const startQuestionListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (assistantRecognitionRef.current) assistantRecognitionRef.current.stop?.();
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    answeredRef.current = false;
    setAssistantListening(true);
    rec.onresult = (e: any) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final.trim()) {
        answeredRef.current = true;
        stopQuestionListening();
        setAssistantListening(false);
        const phrase = final.trim();
        if (yesNoModeRef.current && pendingCommandRef.current) {
          yesNoModeRef.current = false;
          if (YES_RE.test(phrase)) {
            applyConfirmed();
          } else if (NO_RE.test(phrase)) {
            cancelPendingCommand();
          } else {
            handleAssistantCommand(phrase);
          }
        } else {
          handleAssistantCommand(phrase);
        }
      }
    };
    rec.onend = () => {
      assistantRecognitionRef.current = null;
      setAssistantListening(false);
      if (answeredRef.current) {
        answeredRef.current = false;
        return;
      }
      if (assistantActiveRef.current && mountedRef.current) {
        assistantActiveRef.current = false;
        setAssistantActive(false);
        if (wakeEnabledRef.current) startWakeListening();
      }
    };
    rec.onerror = () => {
      assistantRecognitionRef.current = null;
      setAssistantListening(false);
      if (assistantActiveRef.current) {
        assistantActiveRef.current = false;
        setAssistantActive(false);
      }
      if (wakeEnabledRef.current) startWakeListening();
    };
    try {
      rec.start();
      assistantRecognitionRef.current = rec;
    } catch {
      assistantRecognitionRef.current = null;
      setAssistantListening(false);
      if (wakeEnabledRef.current) startWakeListening();
    }
  };

  const stopQuestionListening = () => {
    assistantRecognitionRef.current?.stop?.();
    assistantRecognitionRef.current = null;
  };

  const handleAssistantCommand = (text: string) => {
    if (/^(stop|exit|quit|cancel|goodbye|good bye|bye|that'?s all|never mind|nevermind|enough|end|stop listening)$/i.test(text.trim())) {
      const bye = "Alright, I'm here whenever you need me.";
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", text },
        { id: crypto.randomUUID(), role: "ai", text: bye },
      ]);
      speakText(bye);
      endAssistantSession();
      return;
    }
    send(text, { speak: true });
  };

  const endAssistantSession = () => {
    assistantActiveRef.current = false;
    setAssistantActive(false);
    setAssistantListening(false);
    setShowOverlay(false);
    setBriefing(null);
    yesNoModeRef.current = false;
    stopQuestionListening();
    if (wakeEnabledRef.current && mountedRef.current) startWakeListening();
  };

  // Closing the panel while the assistant is talking → return to quiet wake listening.
  useEffect(() => {
    if (!open && assistantActiveRef.current) endAssistantSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // ==========================================================
  // BNX Agent loop — classify → clarify/confirm → execute → report
  // ==========================================================

  const finishCommand = async (cmd: AgentCommand) => {
    setTyping(true);
    const result = await executeAgentCommand(cmd);
    setTyping(false);
    if (!mountedRef.current) return;
    const id = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id, role: "ai", text: result.title, kind: "result", result },
    ]);
    if (result.view && cmd.intent === "navigate") {
      setTimeout(() => onNavigate(result.view as BirichiNexView), 600);
    }
    if (assistantActiveRef.current && mountedRef.current) {
      const spoken = result.ok
        ? `${result.title}. ${result.detail}`
        : `Sorry, ${result.title}. ${result.detail}`;
      setOverlayText(result.ok ? result.title : `Sorry, ${result.title}`);
      speakText(spoken).then(() => {
        if (mountedRef.current && assistantActiveRef.current) {
          answeredRef.current = false;
          startQuestionListening();
        }
      });
    }
  };

  const askConfirmation = (cmd: AgentCommand) => {
    setPendingCommand(cmd);
    const id = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id, role: "ai", text: "Confirm before I do this.", kind: "confirm", command: cmd },
    ]);
    if (assistantActiveRef.current) {
      yesNoModeRef.current = true;
      const question = `Should I ${cmd.summary.toLowerCase().replace(/\.$/, "")}? Just say yes or no.`;
      setOverlayText(`Should I ${cmd.summary.toLowerCase().replace(/\.$/, "")}?`);
      speakText(question).then(() => {
        if (mountedRef.current && assistantActiveRef.current && pendingCommandRef.current) {
          answeredRef.current = false;
          startQuestionListening();
        }
      });
    }
  };

  const applyConfirmed = () => {
    const cmd = pendingCommandRef.current;
    setPendingCommand(null);
    if (cmd) void finishCommand(cmd);
  };

  const cancelPendingCommand = () => {
    const cmd = pendingCommandRef.current;
    setPendingCommand(null);
    yesNoModeRef.current = false;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "ai", text: "No problem — I've cancelled that. What else can I do?" },
    ]);
    if (assistantActiveRef.current) {
      const msg = cmd ? `Okay, I cancelled the ${cmd.label.toLowerCase()}.` : "Okay, cancelled.";
      setOverlayText(msg);
      speakText(msg).then(() => {
        if (mountedRef.current && assistantActiveRef.current) {
          answeredRef.current = false;
          startQuestionListening();
        }
      });
    }
  };

  const handleUndo = (undo: UndoAction, msgId: string) => {
    undoExecution(undo);
    setDoneIds((d) => ({ ...d, [msgId]: true }));
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "ai", text: `Reverted — ${undo.label}. Nothing was lost.` },
    ]);
  };

  const send = (raw: string, opts?: { speak?: boolean }) => {
    const text = raw.trim();
    if (!text || typing) return;

    // A confirmation is waiting — a typed yes/no resolves it.
    if (pendingCommandRef.current) {
      if (YES_RE.test(text)) {
        setInput("");
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
        applyConfirmed();
        return;
      }
      if (NO_RE.test(text)) {
        setInput("");
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
        cancelPendingCommand();
        return;
      }
    }

    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);

    const agentCtx = buildAgentContext();
    const cmd = classifyAgentCommand(text, agentCtx);

    if (cmd.intent !== "answer") {
      // Actionable command → clarify, confirm, or execute.
      if (cmd.missing.length > 0) {
        const question = clarificationFor(cmd, agentCtx);
        setTyping(true);
        const delay = 550 + Math.min(text.length * 8, 400);
        setTimeout(() => {
          setTyping(false);
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: question }]);
          if (opts?.speak || assistantActiveRef.current) {
            speakText(question).then(() => {
              if (mountedRef.current && assistantActiveRef.current) {
                answeredRef.current = false;
                startQuestionListening();
              }
            });
          }
        }, delay);
        return;
      }
      if (cmd.needsConfirmation) {
        setTyping(true);
        const delay = 550 + Math.min(text.length * 8, 400);
        setTimeout(() => {
          setTyping(false);
          askConfirmation(cmd);
        }, delay);
        return;
      }
      setTyping(true);
      setTimeout(() => {
        if (mountedRef.current) void finishCommand(cmd);
      }, 450);
      return;
    }

    // Q&A path.
    setTyping(true);
    const reply = respondToQuery(text, ctx);
    const delay = 750 + Math.min(text.length * 12, 500);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "ai", text: reply.text, actions: reply.actions },
      ]);
      setTyping(false);
      if (opts?.speak) {
        if (assistantActiveRef.current) setOverlayText(reply.text);
        speakText(reply.text).then(() => {
          if (mountedRef.current && assistantActiveRef.current) {
            answeredRef.current = false;
            startQuestionListening();
          }
        });
      }
      if (NAV_INTENT.test(text) && reply.actions && reply.actions.length > 0) {
        setTimeout(() => onNavigate(reply.actions[0].view), 900);
      }
    }, delay);
  };

  const runAction = (action: CopilotAction) => {
    onNavigate(action.view);
  };

  const runChip = (chip: string) => send(chip);

  // External prompt (from Dashboard briefing buttons, etc.) → opens copilot and asks it.
  useEffect(() => {
    if (!copilotPrompt) return;
    setOpen(true);
    skipGreetingRef.current = true;
    const q = copilotPrompt;
    setCopilotPrompt(null);
    const t = setTimeout(() => send(q), 140);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copilotPrompt, copilotNonce]);

  return (
    <>
      {/* Floating Orb */}
      <div className={`fixed bottom-5 right-5 ${guideActive ? "z-[96]" : "z-40"}`}>
        <div className="relative">
          <AnimatePresence>
            {open && (
              <motion.div
                key="copilot-panel"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[72px] right-0 w-[min(420px,calc(100vw-2.5rem))] glass-sheet rounded-[28px] overflow-hidden flex flex-col"
                style={{ height: "min(600px, calc(100vh - 7.5rem))" }}
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-3 border-b border-glass-border/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8">
                        <div className="absolute inset-0 rounded-full copilot-orb" />
                        <div className="absolute inset-0 rounded-full bg-brand/40 blur-[10px] opacity-60" />
                        <div className="relative h-full w-full flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div>
                        <p className="text-subhead font-bold text-ink leading-none">BirichiNex Copilot</p>
                        <p className="text-[10px] text-ink-tertiary mt-1 flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full inline-block ${
                              wakeEnabled ? (assistantActive ? "bg-red-500 animate-pulse" : "bg-success") : "bg-ink-quaternary"
                            }`}
                          />
                          {wakeEnabled
                            ? assistantActive
                              ? "Listening — say 'stop' to exit"
                              : "Hey BNX on · say 'BNX' to talk"
                            : "Helping you with " + pageLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors"
                      aria-label="Close copilot"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => send("Explain this page")}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-brand/10 border border-brand/15 text-[11px] font-semibold text-brand-dark hover:bg-brand/15 transition-colors"
                    >
                      <HelpCircle className="h-3 w-3" strokeWidth={2} />
                      Explain this page
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        startGuide();
                      }}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-emphasis text-on-emphasis text-[11px] font-semibold hover:bg-emphasis/90 transition-colors"
                    >
                      <Compass className="h-3 w-3" strokeWidth={2} />
                      Take the tour
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[85%] px-4 py-2.5 rounded-[18px] rounded-br-[6px] bg-emphasis text-on-emphasis text-callout leading-snug">
                          {m.text}
                        </div>
                      </motion.div>
                    ) : m.kind === "confirm" ? (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className="relative h-7 w-7 rounded-full shrink-0 mt-0.5">
                          <div className="absolute inset-0 rounded-full copilot-orb" />
                          <div className="relative h-full w-full flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="max-w-[85%] flex-1">
                          <div className="px-4 py-3 rounded-[18px] rounded-tl-[6px] bg-brand/10 border border-brand/25">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-brand-dark" strokeWidth={2.2} />
                              <p className="text-[11px] font-bold text-brand-dark uppercase tracking-wide">
                                {m.command?.label}
                              </p>
                            </div>
                            <p className="text-callout text-ink leading-snug mt-1.5">{m.command?.summary}</p>
                            <p className="text-[10px] text-ink-tertiary mt-1.5">
                              {m.command?.needsConfirmation
                                ? "This action is real — confirm to proceed, or say 'no' to cancel."
                                : "Ready to go."}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={applyConfirmed}
                                disabled={pendingCommand === null}
                                className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-emphasis text-on-emphasis text-[11px] font-bold hover:bg-emphasis/90 disabled:opacity-40 transition-all"
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Yes, do it
                              </button>
                              <button
                                onClick={cancelPendingCommand}
                                disabled={pendingCommand === null}
                                className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-surface-secondary border border-glass-border text-[11px] font-bold text-ink-tertiary hover:text-ink hover:border-brand/30 disabled:opacity-40 transition-all"
                              >
                                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                                No, cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : m.kind === "result" ? (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className="relative h-7 w-7 rounded-full shrink-0 mt-0.5">
                          <div className="absolute inset-0 rounded-full copilot-orb" />
                          <div className="relative h-full w-full flex items-center justify-center">
                            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
                          </div>
                        </div>
                        <div className="max-w-[85%] flex-1">
                          <div className="px-4 py-3 rounded-[18px] rounded-tl-[6px] bg-surface/70 border border-glass-border">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full shrink-0 ${m.result?.ok ? "bg-success" : "bg-red-500"}`}
                              />
                              <p className="text-callout font-bold text-ink leading-snug">{m.result?.title}</p>
                            </div>
                            <p className="text-callout text-ink-tertiary leading-snug mt-1.5">{m.result?.detail}</p>
                            {m.result?.followUp && (
                              <button
                                onClick={() => runChip(m.result!.followUp!.text)}
                                className="group flex items-center gap-1.5 mt-3 px-3 h-8 rounded-full bg-brand/10 border border-brand/15 text-[11px] font-semibold text-brand-dark hover:bg-brand/20 transition-colors"
                              >
                                {m.result.followUp.label}
                                <ArrowRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                            {m.result?.undo && !doneIds[m.id] && (
                              <button
                                onClick={() => m.result?.undo && handleUndo(m.result.undo, m.id)}
                                className="flex items-center gap-1.5 mt-2 px-3 h-8 rounded-full bg-surface-secondary border border-glass-border text-[11px] font-semibold text-ink-tertiary hover:text-red-500 hover:border-red-300 transition-colors"
                              >
                                <RotateCcw className="h-3 w-3" strokeWidth={2.2} />
                                {m.result.undo.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className="relative h-7 w-7 rounded-full shrink-0 mt-0.5">
                          <div className="absolute inset-0 rounded-full copilot-orb" />
                          <div className="relative h-full w-full flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="max-w-[85%]">
                          <div className="copilot-reply-in px-4 py-2.5 rounded-[18px] rounded-tl-[6px] bg-surface/70 border border-glass-border text-callout text-ink leading-snug">
                            {m.text}
                          </div>
                          {speechSupported && (
                            <button
                              onClick={() => speakText(m.text)}
                              className="flex items-center gap-1 mt-1.5 pl-1 text-[10px] font-semibold text-ink-tertiary hover:text-brand-dark transition-colors"
                              aria-label="Read reply aloud"
                            >
                              <Volume2 className="h-3 w-3" strokeWidth={2} />
                              Listen
                            </button>
                          )}
                          {m.actions && m.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.actions.map((a, i) => (
                                <button
                                  key={`${a.view}-${i}`}
                                  onClick={() => runAction(a)}
                                  className="group flex items-center gap-1.5 px-3 h-8 rounded-full bg-brand/10 border border-brand/15 text-[11px] font-semibold text-brand-dark hover:bg-brand/20 transition-colors"
                                >
                                  {a.label}
                                  <ArrowRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ),
                  )}
                  {typing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5">
                      <div className="relative h-7 w-7 rounded-full shrink-0 mt-0.5">
                        <div className="absolute inset-0 rounded-full copilot-orb" />
                        <div className="relative h-full w-full flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="px-4 py-2.5 rounded-[18px] rounded-tl-[6px] bg-surface/70 border border-glass-border">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Suggestion chips */}
                {!typing && (
                  <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {viewChips(currentView).map((chip) => (
                      <button
                        key={chip}
                        onClick={() => runChip(chip)}
                        className="shrink-0 px-3 h-7 rounded-full bg-surface-secondary/80 border border-glass-border text-[11px] font-semibold text-ink-tertiary hover:text-ink hover:border-brand/30 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Assistant session banner */}
                {(assistantActive || assistantListening) && (
                  <div className="px-4 pt-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-brand/10 border border-brand/20">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          assistantListening ? "bg-red-500 animate-pulse" : "bg-success"
                        }`}
                      />
                      <p className="text-[11px] font-semibold text-ink flex-1 leading-tight">
                        {assistantListening
                          ? pendingCommand
                            ? "Listening for yes or no"
                            : "Listening — speak your question"
                          : "Hey BNX is awake — ask me anything"}
                      </p>
                      <button
                        onClick={endAssistantSession}
                        className="text-[10px] font-bold text-ink-tertiary hover:text-ink transition-colors"
                      >
                        End
                      </button>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="px-4 py-3 border-t border-glass-border/70">
                  <div className="flex items-center gap-2 bg-surface-secondary/70 rounded-[14px] border border-glass-border focus-within:border-brand/40 transition-colors px-3">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send(input)}
                      placeholder="Ask or speak…"
                      className="flex-1 h-10 bg-transparent text-callout text-ink placeholder:text-ink-quaternary focus:outline-none"
                    />
                    {speechSupported && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={listening ? stopListening : startListening}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                          listening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-surface-secondary text-ink-tertiary hover:text-ink"
                        }`}
                        aria-label={listening ? "Stop listening" : "Speak to the copilot"}
                        title={listening ? "Stop listening" : "Speak to the copilot"}
                      >
                        <Mic className="h-3 w-3" strokeWidth={2.2} />
                      </motion.button>
                    )}
                    {speechSupported && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setWakeEnabled((v) => !v)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                          wakeEnabled
                            ? "bg-gradient-to-br from-brand to-brand-light text-white shadow-[0_0_12px_rgba(212,175,55,0.45)]"
                            : "bg-surface-secondary text-ink-quaternary hover:text-ink"
                        }`}
                        aria-label={wakeEnabled ? "Turn Hey BNX assistant off" : "Turn Hey BNX assistant on"}
                        title={wakeEnabled ? "Hey BNX on — say 'BNX' to talk" : "Hey BNX off — say 'BNX' to talk"}
                      >
                        <AudioLines className="h-3 w-3" strokeWidth={2.2} />
                      </motion.button>
                    )}
                    {!speechSupported && (
                      <span
                        className="h-7 w-7 rounded-full bg-surface-secondary flex items-center justify-center text-ink-quaternary opacity-50"
                        title="Voice assistant needs speech recognition (Chrome/Edge)"
                      >
                        <AudioLines className="h-3 w-3" strokeWidth={2.2} />
                      </span>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => send(input)}
                      disabled={!input.trim() || typing}
                      className="h-7 w-7 rounded-full bg-emphasis flex items-center justify-center text-on-emphasis disabled:opacity-30 transition-opacity"
                      aria-label="Send"
                    >
                      <Send className="h-3 w-3" strokeWidth={2.2} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orb button */}
          <motion.button
            id="guide-copilot"
            onClick={() => setOpen(!open)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Open AI copilot"
            className="relative h-14 w-14 rounded-full focus-ring"
          >
            <span className="absolute inset-0 rounded-full copilot-orb-ring" />
            <span className="absolute inset-0 rounded-full copilot-orb" />
            {attentionCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white leading-none">
                {attentionCount}
              </span>
            ) : assistantActive ? (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-surface animate-pulse" />
            ) : wakeEnabled ? (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand border-2 border-surface flex items-center justify-center">
                <AudioLines className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-surface" />
            )}
            <span className="relative h-full w-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white drop-shadow-md" strokeWidth={2.4} />
            </span>
          </motion.button>
        </div>
      </div>

      {/* Siri-style fullscreen wake overlay */}
      <AnimatePresence>
        {showOverlay && assistantActive && (
          <motion.div
            key="siri-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="siri-overlay"
            onClick={endAssistantSession}
            role="dialog"
            aria-modal="true"
            aria-label="Hey BNX assistant"
          >
            {/* Orb stage */}
            <div className="siri-orb-stage" onClick={(e) => e.stopPropagation()}>
              <span className="siri-ring" />
              <span className="siri-ring" />
              <span className="siri-ring" />
              <div className={`siri-orb ${assistantListening ? "listening" : ""}`}>
                <span className="absolute inset-0 rounded-full flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white drop-shadow-md" strokeWidth={2.4} />
                </span>
              </div>
            </div>

            {/* Status + spoken text */}
            <div className="text-center max-w-xl mt-10" onClick={(e) => e.stopPropagation()}>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-light/90">
                {assistantListening ? "Listening" : "Hey BNX"}
              </p>
              <p className="text-subhead font-semibold text-white/95 leading-relaxed mt-4 min-h-[3.5rem]">
                {overlayText || "I'm here — ask me anything."}
              </p>
              {assistantListening && (
                <div className="siri-waveform mt-5 justify-center">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} />
                  ))}
                </div>
              )}
              {!assistantListening && briefing?.next && (
                <button
                  onClick={() => {
                    onNavigate(briefing.next!.view);
                    endAssistantSession();
                  }}
                  className="group flex items-center gap-1.5 mx-auto mt-6 px-4 h-9 rounded-full bg-white/10 border border-white/20 text-callout font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  {briefing.next.chip}
                  <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Close */}
            <button
              onClick={endAssistantSession}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 h-11 rounded-full bg-white/10 border border-white/15 text-callout font-semibold text-white/90 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
