import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShoppingBag, Rocket, Check } from "lucide-react";
import Button from "../../components/ui/Button";
import BirichiNexLogo from "../../components/BirichiNexLogo";
import ParticleField from "../../components/three/ParticleField";
import MagneticButton from "../../components/three/MagneticButton";
import ExploreBack from "../../components/auth/ExploreBack";
import type { AccountType } from "../../types";

interface SignupPageProps {
  onSignup: (email: string, name: string, accountType: AccountType, password?: string) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

const ACCOUNT_OPTIONS: { type: AccountType; title: string; desc: string; icon: typeof ShoppingBag; accent: string }[] = [
  {
    type: "shopper",
    title: "Shopper",
    desc: "Shop the marketplace, earn loyalty points, and use a personal wallet.",
    icon: ShoppingBag,
    accent: "#FF6482",
  },
  {
    type: "business",
    title: "Business",
    desc: "Everything shoppers get, plus business tools, your dashboard, and AI sales.",
    icon: Rocket,
    accent: "#d4af37",
  },
];

export default function SignupPage({ onSignup, onSwitchToLogin, onBack, onNavigate }: SignupPageProps) {
  const [accountType, setAccountType] = useState<AccountType>("shopper");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignup(email, name, accountType, password);
    }, 800);
  };

  const openPolicy = (view: string) => {
    if (onNavigate) onNavigate(view);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a12] px-4 py-12">
      {/* 3D Particle Background */}
      <div className="fixed inset-0 hidden md:block">
        <ParticleField particleCount={70} color="#d4af37" showGeometry={true} />
      </div>

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[80px] animate-[orbFloat_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(48,209,88,0.08)_0%,transparent_70%)] blur-[80px] animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
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
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Continue exploring — no account required */}
        <ExploreBack onBack={onBack} />

        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <BirichiNexLogo size="lg" animate={true} />
        </motion.div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Card glow */}
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-b from-brand/10 via-transparent to-transparent opacity-60 blur-xl pointer-events-none" />

          <div className="relative glass-material rounded-[24px] p-8 sm:p-10 border border-white/[0.08] shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
            {/* Specular sheen */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)",
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <h1 className="text-[28px] font-bold text-ink text-center mb-1 tracking-[-0.02em]">Create your account</h1>
              <p className="text-[15px] text-ink-tertiary text-center mb-6">Choose your side of the ecosystem</p>
            </motion.div>

            {/* Account type selector */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="grid grid-cols-2 gap-3 mb-6 relative"
            >
              {ACCOUNT_OPTIONS.map((opt) => {
                const active = accountType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setAccountType(opt.type)}
                    className={`text-left rounded-[18px] p-4 border transition-all duration-300 group relative overflow-hidden ${
                      active
                        ? "border-brand/40 bg-brand/[0.07] shadow-[0_0_24px_rgba(212,175,55,0.12)]"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16]"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-[12px] flex items-center justify-center mb-3 transition-colors duration-300`}
                      style={{ background: active ? `${opt.accent}18` : "rgba(255,255,255,0.05)" }}
                    >
                      <opt.icon className="h-5 w-5" style={{ color: active ? opt.accent : "#9ca3af" }} strokeWidth={1.5} />
                    </div>
                    <p className={`text-[14px] font-bold mb-0.5 ${active ? "text-ink" : "text-ink-secondary"}`}>{opt.title}</p>
                    <p className="text-[12px] text-ink-tertiary leading-relaxed">{opt.desc}</p>
                    <div
                      className={`absolute top-3 right-3 h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                        active ? "border-brand bg-brand" : "border-white/[0.15]"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-[#0a0a12]" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-quaternary group-focus-within:text-brand transition-colors duration-200" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-[16px] text-[15px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 focus:bg-white/[0.06] transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.55 }}
              >
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-quaternary group-focus-within:text-brand transition-colors duration-200" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-[16px] text-[15px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 focus:bg-white/[0.06] transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-quaternary group-focus-within:text-brand transition-colors duration-200" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-[16px] text-[15px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 focus:bg-white/[0.06] transition-all duration-200"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-quaternary hover:text-ink-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.65 }}
              >
                <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-quaternary group-focus-within:text-brand transition-colors duration-200" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-[16px] text-[15px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 focus:bg-white/[0.06] transition-all duration-200"
                    placeholder="Re-enter password"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-error font-medium"
                >
                  {error}
                </motion.p>
              )}

              {/* Terms & Privacy consent */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreeTerms}
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-all duration-200 ${
                    agreeTerms ? "border-brand bg-brand" : "border-white/[0.15] bg-white/[0.03] hover:border-white/[0.25]"
                  }`}
                >
                  {agreeTerms && <Check className="h-3.5 w-3.5 text-[#0a0a12]" strokeWidth={3} />}
                </button>
                <p className="text-[12.5px] leading-relaxed text-ink-tertiary">
                  I agree to the{" "}
                  <button type="button" onClick={() => openPolicy("legal:terms")} className="font-semibold text-brand-dark hover:text-brand underline decoration-brand/30 underline-offset-2 transition-colors">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" onClick={() => openPolicy("legal:privacy")} className="font-semibold text-brand-dark hover:text-brand underline decoration-brand/30 underline-offset-2 transition-colors">
                    Privacy Policy
                  </button>.
                </p>
              </label>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="pt-1"
              >
                <MagneticButton strength={0.15} className="w-full">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                    className="!h-[52px] !rounded-[16px] !text-[15px] !font-bold shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  >
                    Create Account
                  </Button>
                </MagneticButton>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              className="mt-8 relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="bg-[rgba(15,15,25,0.8)] px-4 text-ink-quaternary">or</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-[14px] text-ink-tertiary">
                Already have an account?{" "}
                <button onClick={onSwitchToLogin} className="font-bold text-brand-dark hover:text-brand transition-colors">
                  Sign in
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="text-center mt-8 text-[12px] text-ink-quaternary/60"
        >
          Powered by BirichiNex™️
        </motion.p>
      </div>
    </div>
  );
}
