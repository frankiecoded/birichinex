import { motion } from "motion/react";
import { ArrowRight, LogIn, Sparkles, Store, Users, GraduationCap } from "lucide-react";
import { Compass } from "lucide-react";
import BirichiNexLogo from "../components/BirichiNexLogo";
import ParticleField from "../components/three/ParticleField";

interface EntryPageProps {
  onExplore: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

const highlits = [
  { icon: Store, label: "Wholesale marketplace" },
  { icon: Compass, label: "Business growth OS" },
  { icon: Users, label: "Founder community" },
  { icon: GraduationCap, label: "Academy & mentorship" },
];

export default function EntryPage({ onExplore, onSignIn, onCreateAccount }: EntryPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a12] px-4 py-12 overflow-hidden">
      {/* 3D Particle Background */}
      <div className="fixed inset-0 hidden md:block">
        <ParticleField particleCount={70} color="#d4af37" showGeometry={true} />
      </div>

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[8%] right-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16)_0%,transparent_70%)] blur-[80px] animate-[orbFloat_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[8%] left-[8%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.08)_0%,transparent_70%)] blur-[80px] animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[min(600px,90vw)] w-[min(600px,90vw)] rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.06)_0%,transparent_70%)] blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <BirichiNexLogo size="xl" />
        </motion.div>

        {/* Value proposition */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(1.4rem,5vw,2.2rem)] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f0d060] via-[#d4af37] to-[#f0d060] leading-tight mb-4"
        >
          Build. Connect. Grow.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-[15px] sm:text-base text-white/70 max-w-md leading-relaxed mb-10"
        >
          Africa's wholesale marketplace, business growth OS, and founder community — in one place. No account needed to look around.
        </motion.p>

        {/* Feature hints */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {highlits.map((h) => (
            <span
              key={h.label}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-white/80 text-[13px] font-semibold"
            >
              <h.icon className="h-3.5 w-3.5 text-[#d4af37]" />
              {h.label}
            </span>
          ))}
        </motion.div>

        {/* Primary CTA — Explore */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center w-full gap-6"
        >
          <button
            onClick={onExplore}
            className="group relative w-full max-w-[360px] inline-flex items-center justify-center gap-2.5 px-8 py-[18px] rounded-[16px] bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] text-[#0a0a12] text-[16px] font-extrabold tracking-wide shadow-[0_10px_40px_rgba(212,175,55,0.35)] transition-all duration-300 hover:shadow-[0_14px_50px_rgba(212,175,55,0.5)] hover:brightness-110 active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Explore BirichiNex
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <p className="text-[13px] text-white/50 font-medium -mt-3 mb-2">
            No account required
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full max-w-[360px]">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-[12px] uppercase tracking-[0.2em] text-white/40 font-bold">or</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Member entry */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-white/60 font-medium">Already a member?</span>
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#d4af37] hover:text-[#f0d060] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
            <span className="text-white/30 text-[13px]">|</span>
            <button
              onClick={onCreateAccount}
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#d4af37] hover:text-[#f0d060] transition-colors"
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}