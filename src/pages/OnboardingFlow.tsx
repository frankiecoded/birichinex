import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ArrowLeft, Check, Rocket, TrendingUp,
  Globe, Building, Sparkles, Shield
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const STAGES = [
  {
    id: "start",
    icon: Rocket,
    title: "Start Your Journey",
    subtitle: "Silver Tier",
    description: "Begin your business with zero inventory options, marketplace access, and AI-powered guidance.",
    color: "#30D158",
    features: ["Marketplace Access", "AI Business Advisor", "Learning Academy", "Entrepreneur Hub"],
  },
  {
    id: "grow",
    icon: TrendingUp,
    title: "Grow Your Business",
    subtitle: "Gold Tier",
    description: "Scale operations with procurement, logistics, finance tools, and team collaboration.",
    color: "#FF9500",
    features: ["Everything in Silver", "Procurement", "Logistics", "Finance & Accounting", "Team Collaboration"],
  },
  {
    id: "scale",
    icon: Globe,
    title: "Scale Nationally",
    subtitle: "Platinum Tier",
    description: "Expand across borders with advanced integrations, recruitment, and media capabilities.",
    color: "#007AFF",
    features: ["Everything in Gold", "Recruitment", "Media Platform", "API Access", "Advanced AI"],
  },
  {
    id: "enterprise",
    icon: Building,
    title: "Enterprise Solution",
    subtitle: "Custom",
    description: "Tailored infrastructure for corporations, NGOs, and government organizations.",
    color: "#AF52DE",
    features: ["Everything in Platinum", "Custom Development", "Dedicated Infrastructure", "SLA Guarantees"],
  },
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    location: "",
    teamSize: "",
  });

  const isIntro = step === 0;
  const isSelectStage = step === 1;
  const isForm = step === 2;
  const isComplete = step === 3;

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-[18px] bg-ink flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-headline text-ink">
            {isIntro && "Welcome to BirichiNex™️"}
            {isSelectStage && "Where are you in your journey?"}
            {isForm && "Tell us about your business"}
            {isComplete && "You're all set!"}
          </h1>
          <p className="text-callout text-ink-tertiary mt-2">
            {isIntro && "Building the digital infrastructure for business."}
            {isSelectStage && "We'll customize your experience based on your stage."}
            {isForm && "This helps us personalize your dashboard."}
            {isComplete && "Welcome to the ecosystem."}
          </p>
        </div>

        <GlassCard padding="xl" className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isIntro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-brand" />
                  <span className="text-caption font-bold text-ink">BirichiNex™️ Verified Business ID</span>
                </div>
                <p className="text-callout text-ink-secondary max-w-md mx-auto">
                  Every business joining BirichiNex™️ receives a Verified Business ID. This becomes your trusted identity across the ecosystem — recognized by suppliers, customers, logistics partners, and financial institutions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  {["Trusted Identity", "Ecosystem Access", "Growth Path"].map((item) => (
                    <div key={item} className="p-3 bg-surface-secondary rounded-[12px]">
                      <Check className="h-4 w-4 text-success mx-auto mb-1" />
                      <p className="text-caption font-semibold text-ink text-center">{item}</p>
                    </div>
                  ))}
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)}>
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {isSelectStage && (
              <motion.div
                key="stage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {STAGES.map((stage) => (
                  <motion.button
                    key={stage.id}
                    onClick={() => { setSelectedStage(stage.id); setStep(2); }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-5 rounded-[16px] border transition-all text-left ${
                      selectedStage === stage.id
                        ? "border-brand bg-brand/5"
                        : "border-glass-border bg-surface hover:border-ink/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${stage.color}12` }}>
                        <stage.icon className="h-6 w-6" style={{ color: stage.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-subhead font-bold text-ink">{stage.title}</h3>
                          <Badge variant="brand" size="sm">{stage.subtitle}</Badge>
                        </div>
                        <p className="text-caption text-ink-tertiary">{stage.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => setStep(0)} icon={<ArrowLeft className="h-3.5 w-3.5" />}>
                  Back
                </Button>
              </motion.div>
            )}

            {isForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-subhead text-ink block mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g., Fatma Premium Fits"
                      className="w-full h-10 px-3.5 bg-surface border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                  <div>
                    <label className="text-subhead text-ink block mb-1.5">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full h-10 px-3.5 bg-surface border border-glass-border rounded-[12px] text-body text-ink focus:outline-none focus:border-brand/40"
                    >
                      <option value="">Select industry</option>
                      <option value="fashion">Fashion</option>
                      <option value="technology">Technology</option>
                      <option value="gemstones">Gemstones</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-subhead text-ink block mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full h-10 px-3.5 bg-surface border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-brand/40"
                      />
                    </div>
                    <div>
                      <label className="text-subhead text-ink block mb-1.5">Team Size</label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        className="w-full h-10 px-3.5 bg-surface border border-glass-border rounded-[12px] text-body text-ink focus:outline-none focus:border-brand/40"
                      >
                        <option value="">Select</option>
                        <option value="1">Just me</option>
                        <option value="2-5">2-5 people</option>
                        <option value="6-20">6-20 people</option>
                        <option value="20+">20+ people</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="h-3.5 w-3.5" />}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(3)}>
                    Create Business Profile <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {isComplete && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-title font-bold text-ink mb-2">Your BirichiNex™️ Business Profile is Ready</h3>
                  <p className="text-callout text-ink-tertiary">
                    Your Verified Business ID has been created. You now have access to the BirichiNex™️ ecosystem.
                  </p>
                </div>
                <div className="bg-surface-secondary rounded-[14px] p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-brand" />
                    <span className="text-caption font-bold text-ink">What's next?</span>
                  </div>
                  <ul className="space-y-1.5 text-caption text-ink-secondary">
                    <li>• Explore the Marketplace for sourcing opportunities</li>
                    <li>• Complete your first Learning Academy course</li>
                    <li>• Connect with the AI Business Advisor for guidance</li>
                    <li>• Set up your team in the Entrepreneur Hub</li>
                  </ul>
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={onComplete}>
                  Enter BirichiNex™️ OS <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? "w-6 bg-brand" : s < step ? "w-1.5 bg-brand/40" : "w-1.5 bg-ink-quaternary/30"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
