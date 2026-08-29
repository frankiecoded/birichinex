import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, PhoneOff, AudioLines, ShieldCheck, Loader2 } from "lucide-react";
import type { AIAgentConfig } from "../../types";
import { createResampler16, float32ToPcm16, pcm16Base64Decode, pcm16Base64Encode, pcm16ToFloat32 } from "../../lib/live-audio";

type VoiceStatus = "idle" | "connecting" | "open" | "ending" | "error" | "closed";

interface LiveLine {
  id: number;
  role: "agent" | "user";
  text: string;
}

interface LiveVoiceCallProps {
  agent: AIAgentConfig;
  business: string;
  userName: string;
}

interface VoiceServerMessage {
  type?: string;
  role?: "agent" | "customer";
  text?: string;
  partial?: boolean;
  data?: string;
  state?: string;
  message?: string;
}

export default function LiveVoiceCall({ agent, business, userName }: LiveVoiceCallProps) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [statusText, setStatusText] = useState("Test the live voice assistant — it hears you and speaks back in real time.");
  const [transcript, setTranscript] = useState<LiveLine[]>([]);
  const [partialAgent, setPartialAgent] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const resamplerRef = useRef<{ (input: Int16Array): Int16Array; reset(): void } | null>(null);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextLineIdRef = useRef(1);
  const speakingTimerRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const aliveRef = useRef(true);

  const wsUrl = (() => {
    const proto = typeof location !== "undefined" && location.protocol === "https:" ? "wss" : "ws";
    const host = typeof location !== "undefined" ? location.host : "localhost";
    const qs = new URLSearchParams({
      business,
      agent: agent.name,
      customer: userName || "Business Owner",
      tone: agent.tone,
      language: agent.language,
      voice: agent.voice,
      objective: agent.callObjective,
      human: agent.humanTouch ? "true" : "false",
      repeat: agent.repeatOrders ? "true" : "false",
    }).toString();
    return `${proto}://${host}/api/agent-live?${qs}`;
  })();

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushAgentText = useCallback((text: string, partial: boolean) => {
    if (!aliveRef.current) return;
    if (!partial) {
      setTranscript((prev) => [...prev, { id: nextLineIdRef.current++, role: "agent", text }]);
      setPartialAgent("");
    } else {
      setPartialAgent(text);
    }
  }, []);

  const handleServerMessage = useCallback(
    (raw: string) => {
      if (!aliveRef.current) return;
      let msg: VoiceServerMessage;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      switch (msg.type) {
        case "audio": {
          if (!msg.data) return;
          try {
            const samples = pcm16Base64Decode(msg.data);
            const ctx = playCtxRef.current as AudioContext | null;
            if (!ctx || samples.length === 0) return;
            const f32 = pcm16ToFloat32(samples);
            const buffer = ctx.createBuffer(1, f32.length, 16000);
            buffer.copyToChannel(f32, 0);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.connect(ctx.destination);
            if (nextPlayTimeRef.current < ctx.currentTime + 0.06) {
              nextPlayTimeRef.current = ctx.currentTime + 0.06;
            }
            src.start(nextPlayTimeRef.current);
            nextPlayTimeRef.current += f32.length / 16000;
            activeSourcesRef.current.push(src);
            src.onended = () => {
              const i = activeSourcesRef.current.indexOf(src);
              if (i >= 0) activeSourcesRef.current.splice(i, 1);
            };
            setSpeaking(true);
            if (speakingTimerRef.current) window.clearTimeout(speakingTimerRef.current);
            speakingTimerRef.current = window.setTimeout(() => setSpeaking(false), 600);
          } catch {
            /* ignore malformed audio */
          }
          break;
        }
        case "text":
          if (msg.role === "agent" && msg.text) {
            pushAgentText(msg.text, Boolean(msg.partial));
          }
          break;
        case "interrupt":
          for (const src of activeSourcesRef.current.splice(0)) src.stop();
          setSpeaking(false);
          break;
        case "status":
          if (msg.state === "open") {
            setStatus("open");
            setMicActive(true);
            setStatusText(`Connected — talking with ${agent.name}. Tap the red button to end.`);
          } else if (msg.state === "connecting") {
            setStatusText(msg.message || "Connecting…");
          } else if (msg.state === "closed") {
            setStatus("closed");
            setMicActive(false);
            setStatusText(msg.message || "Conversation ended.");
            teardownMedia();
          } else if (msg.state === "ending") {
            setStatus("ending");
          }
          break;
        case "error":
          setStatus("error");
          setMicActive(false);
          setStatusText(msg.message || "Voice connection failed. Try again.");
          teardownMedia();
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushAgentText, agent.name],
  );

  const requestToken = async (): Promise<string> => {
    const resp = await fetch("/api/agent-live/token", { method: "POST" });
    if (!resp.ok) throw new Error("Voice server is not configured.");
    const data = await resp.json();
    if (!data?.token) throw new Error("No voice session token returned.");
    return data.token;
  };

  const teardownMedia = () => {
    try {
      const script = scriptNodeRef.current;
      if (script) script.disconnect();
    } catch { /* noop */ }
    scriptNodeRef.current = null;
    try {
      const src = sourceNodeRef.current;
      if (src) src.disconnect();
    } catch { /* noop */ }
    sourceNodeRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      if (micCtxRef.current && micCtxRef.current.state !== "closed") micCtxRef.current.close();
    } catch { /* noop */ }
    micCtxRef.current = null;
    setMicActive(false);
    resamplerRef.current = null;
  };

  const startMicrophone = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    if (!aliveRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = stream;

    let micCtx: AudioContext;
    try {
      micCtx = new AudioContext({ sampleRate: 16000 });
    } catch {
      micCtx = new AudioContext();
    }
    micCtxRef.current = micCtx;
    const micRate = micCtx.sampleRate || 16000;
    resamplerRef.current = micRate === 16000 ? null : createResampler16(micRate, 16000);

    const source = micCtx.createMediaStreamSource(stream);
    sourceNodeRef.current = source;
    const script = micCtx.createScriptProcessor(1024, 1, 1);
    scriptNodeRef.current = script;
    const gain = micCtx.createGain();
    gain.gain.value = 0;
    gainNodeRef.current = gain;

    script.onaudioprocess = (e) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0);
      if (input.length === 0) return;
      let samples = float32ToPcm16(input);
      if (resamplerRef.current) samples = resamplerRef.current(samples);
      if (samples.length === 0) return;
      ws.send(JSON.stringify({ type: "audio", data: pcm16Base64Encode(samples) }));
    };

    source.connect(script);
    script.connect(gain);
    gain.connect(micCtx.destination);
  };

  const startCall = async () => {
    if (status === "connecting" || status === "open") return;
    setTranscript([]);
    setPartialAgent("");
    setStatus("connecting");
    setStatusText("Connecting to voice assistant…");

    try {
      const token = await requestToken();
      if (!aliveRef.current) return;

      let playCtx: AudioContext;
      try {
        playCtx = new AudioContext();
      } catch {
        playCtx = new AudioContext();
      }
      playCtxRef.current = playCtx;
      nextPlayTimeRef.current = 0;

      const ws = new WebSocket(`${wsUrl}&token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!aliveRef.current) return;
        ws.send(JSON.stringify({ type: "start" }));
        void startMicrophone().catch(() => {
          if (aliveRef.current) setStatusText("Connected, but no microphone access — turn on mic permission to talk.");
        });
      };
      ws.onmessage = (ev) => handleServerMessage(String(ev.data));
      ws.onclose = () => {
        if (!aliveRef.current) return;
        setStatus("closed");
        setMicActive(false);
        setStatusText("Voice session ended.");
        teardownMedia();
      };
      ws.onerror = () => {
        if (!aliveRef.current) return;
        setStatus("error");
        setMicActive(false);
        setStatusText("Voice connection failed. Check your connection and try again.");
      };
    } catch (err) {
      if (!aliveRef.current) return;
      setStatus("error");
      setMicActive(false);
      setStatusText(err instanceof Error ? err.message : "Could not start the voice conversation.");
    }
  };

  const endCall = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "stop" }));
      } catch { /* noop */ }
      ws.close();
    }
    wsRef.current = null;
    teardownMedia();
    for (const src of activeSourcesRef.current.splice(0)) {
      try { src.stop(); } catch { /* noop */ }
    }
    try {
      if (playCtxRef.current && playCtxRef.current.state !== "closed") playCtxRef.current.close();
    } catch { /* noop */ }
    playCtxRef.current = null;
    if (speakingTimerRef.current) window.clearTimeout(speakingTimerRef.current);
    setSpeaking(false);
    if (aliveRef.current) {
      setStatus("idle");
      setMicActive(false);
      setStatusText("Say what you need — order updates, sales questions, targets. Amani answers by voice.");
      setPartialAgent("");
    }
  };

  const active = status === "connecting" || status === "open" || status === "ending";
  const lineCount = transcript.length + (partialAgent ? 1 : 0);

  return (
    <div className="glass-material rounded-[22px] border border-glass-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border/30">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#30D158] to-[#0B6623] flex items-center justify-center">
            <AudioLines className="h-5 w-5 text-white" strokeWidth={1.5} />
            {speaking && (
              <span className="absolute inset-0 rounded-full border-2 border-[#30D158] animate-ping" />
            )}
          </div>
          <div>
            <p className="text-subhead font-bold text-ink">Talk with {agent.name}</p>
            <p className="text-caption text-ink-tertiary flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
              Live Gemini voice · end-to-end
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
            status === "open"
              ? "bg-[#30D158]/10 text-[#30D158]"
              : status === "error"
                ? "bg-[#FF453A]/10 text-[#FF453A]"
                : status === "idle"
                  ? "bg-ink-quaternary/10 text-ink-secondary"
                  : "bg-[#FF9500]/10 text-[#FF9500]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "open" ? "bg-[#30D158] animate-pulse" : status === "error" ? "bg-[#FF453A]" : status === "connecting" || status === "ending" ? "bg-[#FF9500] animate-pulse" : "bg-ink-quaternary"
            }`}
          />
          {status === "open" ? "Live" : status === "connecting" ? "Connecting" : status === "ending" ? "Ending" : status === "error" ? "Failed" : status === "closed" ? "Ended" : "Ready"}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {/* Status / transcript area */}
        {lineCount === 0 ? (
          <div className="min-h-[140px] flex flex-col items-center justify-center text-center px-4 py-6 rounded-[16px] bg-surface-secondary/40 border border-glass-border/30">
            {status === "connecting" ? (
              <Loader2 className="h-7 w-7 text-brand animate-spin mb-3" strokeWidth={1.5} />
            ) : (
              <Mic className="h-7 w-7 text-ink-quaternary mb-3" strokeWidth={1.5} />
            )}
            <p className="text-caption text-ink-tertiary leading-relaxed max-w-sm">{statusText}</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {transcript.map((line) => (
              <div key={line.id} className={`flex ${line.role === "agent" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed ${
                    line.role === "agent"
                      ? "bg-surface-secondary/80 text-ink-secondary border border-glass-border/40"
                      : "bg-brand/10 text-ink border border-brand/15"
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-quaternary mb-0.5">
                    {line.role === "agent" ? agent.name : "You"}
                  </span>
                  {line.text}
                </div>
              </div>
            ))}
            {partialAgent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed bg-surface-secondary/50 text-ink-tertiary border border-glass-border/40 italic">
                  {agent.name} is speaking…
                  <span className="block text-sm mt-0.5 not-italic">{partialAgent}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mic indicator */}
        {active && (
          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-semibold">
            {micActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#30D158] animate-pulse" />
                <span className="text-ink-secondary">Microphone on — {agent.name} can hear you</span>
              </>
            ) : (
              <span className="text-ink-tertiary">Waiting for microphone access…</span>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex mt-5">
          {!active ? (
            <button
              onClick={() => void startCall()}
              className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-[16px] bg-gradient-to-br from-[#30D158] to-[#0B6623] text-white text-subhead font-bold shadow-lg shadow-[#30D158]/25 active:scale-[0.98] transition-transform"
            >
              <Mic className="h-5 w-5" strokeWidth={2} />
              Talk to {agent.name} now
            </button>
          ) : (
            <button
              onClick={endCall}
              className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-[16px] bg-[#FF453A] text-white text-subhead font-bold shadow-lg shadow-[#FF453A]/25 active:scale-[0.98] transition-transform"
            >
              <PhoneOff className="h-5 w-5" strokeWidth={2} />
              {status === "ending" ? "Ending…" : "End call"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}