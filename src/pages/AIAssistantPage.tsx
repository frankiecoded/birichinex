import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles, Send, TrendingUp, ShoppingCart, BarChart3,
  Lightbulb, ArrowUpRight, Zap, MessageSquarePlus
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { AIMessage } from "../types";

const SUGGESTIONS = [
  "What are the best-selling categories this month?",
  "Help me calculate margins for a 45kg bale",
  "Recommend a sourcing strategy for new entrepreneurs",
  "What should I stock for the upcoming rainy season?",
];

const SYSTEM_WELCOME: AIMessage = {
  id: "welcome",
  role: "assistant",
  content: "Habari! I'm Amani, your BirichiNex AI Business Advisor. I can help you with sourcing strategy, margin calculations, market insights, and growth planning. What would you like to explore today?",
  timestamp: "",
  assistantType: "advisor",
};

function generateMockResponse(input: string): string {
  return `Great question about "${input.slice(0, 40)}${input.length > 40 ? "..." : ""}". Based on current Portmetals Africa market data, I'd recommend focusing on high-margin categories like Leather items (100-200% markup potential) and Handbags (90-160% markup). Would you like me to create a detailed sourcing plan?`;
}

export default function AIAssistantPage() {
  const { aiConversations, currentConversationId, addMessage, createConversation } = useStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => aiConversations.find((c) => c.id === currentConversationId) ?? null,
    [aiConversations, currentConversationId],
  );

  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const ensureConversation = (): string => {
    if (currentConversationId) return currentConversationId;
    return createConversation("advisor");
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    const convId = ensureConversation();
    const now = new Date().toISOString();

    addMessage(convId, {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      timestamp: now,
      assistantType: "advisor",
    });

    setTimeout(() => {
      addMessage(convId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateMockResponse(userMessage),
        timestamp: new Date().toISOString(),
        assistantType: "advisor",
      });
      setLoading(false);
    }, 1500);
  };

  const handleNewConversation = () => {
    createConversation("advisor");
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100dvh-3.5rem)] flex flex-col relative">
      {/* Ambient orb */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,56,95,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-[14px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] animate-[glowPulse_3s_ease-in-out_infinite] blur-[8px] opacity-50" />
            </div>
            <div>
              <h1 className="text-title font-bold text-ink tracking-tight"><span className="text-gradient-brand">AI Business Advisor</span></h1>
              <p className="text-caption text-ink-tertiary">Powered by BirichiNex Intelligence</p>
            </div>
          </div>
          <MagneticButton strength={0.15}>
            <button
              onClick={handleNewConversation}
              className="h-9 px-3 rounded-[10px] bg-surface-secondary/60 hover:bg-surface-secondary text-ink-secondary hover:text-ink flex items-center gap-2 text-caption font-semibold transition-colors border border-glass-border"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
              New Chat
            </button>
          </MagneticButton>
        </div>
      </motion.div>

      {/* AI Capability Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Sourcing", icon: ShoppingCart, color: "#007AFF" },
          { label: "Analytics", icon: BarChart3, color: "#30D158" },
          { label: "Strategy", icon: TrendingUp, color: "#FF9500" },
          { label: "Innovation", icon: Lightbulb, color: "#AF52DE" },
        ].map((cap, i) => (
          <motion.div
            key={cap.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard padding="sm" hover className="text-center">
              <div className="h-8 w-8 rounded-[10px] mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: `${cap.color}12` }}>
                <cap.icon className="h-4 w-4" style={{ color: cap.color }} strokeWidth={1.5} />
              </div>
              <p className="text-caption font-bold text-ink">{cap.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-material rounded-[20px] overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-start"
            >
              <div className="max-w-[75%] rounded-[18px] px-5 py-3.5 text-body leading-relaxed bg-surface-secondary/80 text-ink border border-glass-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-[6px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-caption font-bold">Amani</span>
                </div>
                {SYSTEM_WELCOME.content}
              </div>
            </motion.div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-[18px] px-5 py-3.5 text-body leading-relaxed ${
                  msg.role === "user"
                    ? "bg-ink text-white"
                    : "bg-surface-secondary/80 text-ink border border-glass-border"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-[6px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-caption font-bold">Amani</span>
                  </div>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-secondary/80 rounded-[18px] px-5 py-3.5 border border-glass-border">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-[6px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-quaternary animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-quaternary animate-pulse [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-quaternary animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 bg-surface-secondary/60 hover:bg-surface-secondary backdrop-blur-sm rounded-full text-caption text-ink-secondary hover:text-ink transition-colors border border-glass-border"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about prices, margins, sourcing strategy..."
              className="flex-1 h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
            />
            <MagneticButton strength={0.2}>
              <motion.button
                onClick={handleSend}
                whileTap={{ scale: 0.93 }}
                disabled={!input.trim() || loading}
                className="h-11 w-11 rounded-[12px] bg-ink text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </motion.button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
