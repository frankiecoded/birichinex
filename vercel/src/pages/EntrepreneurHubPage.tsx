import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Rocket, TrendingUp, Users, Globe, ArrowUpRight, Star,
  Target, Lightbulb, Handshake, DollarSign, X, Send
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { BirichiNexView } from "../types";

interface EntrepreneurHubPageProps {
  onNavigate?: (view: BirichiNexView) => void;
}

const OPPORTUNITIES = [
  {
    id: "1",
    title: "Dropshipping Launchpad",
    description: "Start selling with zero inventory. Access Portmetals Africa's complete catalog and sell to your network.",
    fullDescription: "Our Dropshipping Launchpad removes the biggest barrier to entry: upfront inventory costs. You get access to our entire catalog of 22+ professionally sorted fashion categories, real-time stock levels, and automated order fulfillment. We handle warehousing, packing, and shipping while you focus on sales and customer relationships. Includes a free onboarding session and marketing toolkit.",
    category: "Zero Inventory",
    potential: "Up to 40% commission per sale",
    icon: Rocket,
    color: "#30D158",
  },
  {
    id: "2",
    title: "Wholesale Distribution",
    description: "Become a regional distributor for European-sorted fashion bales across East Africa.",
    fullDescription: "As a Wholesale Distribution partner, you'll secure exclusive regional rights to distribute our European-sorted fashion bales. This program includes volume-based pricing tiers (starting at 50 bales), dedicated account management, logistics support, and co-branded marketing materials. Our distributors typically achieve 150%+ markup margins and serve market stalls, mini-shops, and county-level retailers.",
    category: "Distribution",
    potential: "Up to 150% markup margins",
    icon: Globe,
    color: "#007AFF",
  },
  {
    id: "3",
    title: "Fashion Boutique Starter",
    description: "Access curated starter packs, business training, and mentorship to launch your boutique.",
    fullDescription: "The Fashion Boutique Starter program is designed for aspiring retail entrepreneurs. You receive a curated starter pack (200+ pieces across trending categories), a 4-week business training course covering inventory management, pricing strategy, and visual merchandising, plus 3 months of 1-on-1 mentorship from an experienced boutique owner. Break-even typically occurs within 30 days.",
    category: "Retail",
    potential: "Break-even in 30 days",
    icon: Star,
    color: "#AF52DE",
  },
  {
    id: "4",
    title: "Tech Reseller Program",
    description: "Sell certified refurbished technology with warranty support and EU-standard quality.",
    fullDescription: "Join our Tech Reseller Program to sell certified refurbished MacBooks, iPads, iPhones, and accessories. Every device passes a 32-point quality inspection, comes with a 6-month warranty, and is priced 40-60% below retail. You get access to real-time inventory, marketing assets, and a dedicated Slack channel for support. Margins of up to 80% on devices.",
    category: "Technology",
    potential: "Up to 80% margin on devices",
    icon: Target,
    color: "#FF9500",
  },
];

const MENTORS = [
  { name: "Grace Mwangi", expertise: "Fashion Retail", location: "Nairobi", rating: 4.9 },
  { name: "David Ochieng", expertise: "Supply Chain", location: "Mombasa", rating: 4.8 },
  { name: "Amina Hassan", expertise: "Digital Marketing", location: "Dar es Salaam", rating: 4.7 },
];

export default function EntrepreneurHubPage({ onNavigate }: EntrepreneurHubPageProps) {
  const { settings } = useStore();
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof OPPORTUNITIES[number] | null>(null);
  const [connectingMentor, setConnectingMentor] = useState<typeof MENTORS[number] | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [connectSent, setConnectSent] = useState(false);
  const opportunitiesRef = useRef<HTMLDivElement>(null);

  const scrollToOpportunities = () => {
    opportunitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConnect = () => {
    setConnectSent(true);
    setTimeout(() => {
      setConnectingMentor(null);
      setConnectMessage("");
      setConnectSent(false);
    }, 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard variant="dark" padding="xl" className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[60px] pointer-events-none animate-[orbFloat_20s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.1)_0%,transparent_70%)] blur-[50px] pointer-events-none animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative z-10 max-w-2xl">
            <Badge variant="brand" size="md" className="mb-4">Entrepreneur Hub</Badge>
            <h1 className="text-headline text-white mb-3 tracking-tight text-gradient-brand">
              Build Your Business. Access Opportunities. Scale Without Limits.
            </h1>
            <p className="text-callout text-zinc-400 mb-6">
              Whether you're starting from zero or scaling an existing business, the Entrepreneur Hub gives you access to products, mentorship, funding, and the tools you need to grow.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticButton>
                <Button variant="brand" size="lg" className="glow-brand" onClick={scrollToOpportunities}>Explore Opportunities</Button>
              </MagneticButton>
              <MagneticButton>
                <Button variant="secondary" size="lg" className="bg-white/10 border-white/10 text-white hover:bg-white/20" onClick={() => onNavigate?.("community")}>
                  Join Community
                </Button>
              </MagneticButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Opportunity Cards */}
      <CursorSpotlight className="rounded-2xl">
        <div ref={opportunitiesRef}>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-title font-bold text-ink mb-5 tracking-tight"
          >
            Growth Opportunities
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OPPORTUNITIES.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard>
                <GlassCard padding="lg" hover className="h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${opp.color}12` }}>
                      <opp.icon className="h-6 w-6" style={{ color: opp.color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <Badge variant="default" size="sm" className="mb-1">{opp.category}</Badge>
                      <h3 className="text-subhead font-bold text-ink">{opp.title}</h3>
                    </div>
                  </div>
                  <p className="text-callout text-ink-secondary mb-4 flex-1">{opp.description}</p>
                  <div className="glass-divider mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                      <span className="text-caption font-bold text-ink">{opp.potential}</span>
                    </div>
                    <Button variant="ghost" size="sm" icon={<ArrowUpRight className="h-3.5 w-3.5" />} iconPosition="right" onClick={() => setSelectedOpportunity(opp)}>
                      Learn More
                    </Button>
                  </div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      {/* Mentorship Section */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-title font-bold text-ink mb-5 tracking-tight"
        >
          Mentor Network
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MENTORS.map((mentor, i) => (
            <motion.div
              key={mentor.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard padding="md" hover className="text-center">
                <div className="h-14 w-14 rounded-full bg-night mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{mentor.name.charAt(0)}</span>
                </div>
                <h3 className="text-subhead font-bold text-ink">{mentor.name}</h3>
                <p className="text-caption text-ink-tertiary">{mentor.expertise}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Star className="h-3 w-3 text-brand fill-brand" strokeWidth={1.5} />
                  <span className="text-caption font-bold text-ink">{mentor.rating}</span>
                  <span className="text-caption text-ink-quaternary">· {mentor.location}</span>
                </div>
                <Button variant="secondary" size="sm" fullWidth className="mt-4" onClick={() => { setConnectingMentor(mentor); setConnectMessage(`Hi ${mentor.name.split(" ")[0]}, I'm ${settings.profile.name} from ${settings.profile.company}. I'd love to connect and learn from your expertise in ${mentor.expertise}.`); }}>
                  Connect
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opportunity Detail Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-scrim backdrop-blur-md" onClick={() => setSelectedOpportunity(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-material-lg specular-sheen rounded-[24px] max-w-lg w-full overflow-hidden"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-[14px] flex items-center justify-center" style={{ backgroundColor: `${selectedOpportunity.color}12` }}>
                      <selectedOpportunity.icon className="h-6 w-6" style={{ color: selectedOpportunity.color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <Badge variant="default" size="sm" className="mb-1">{selectedOpportunity.category}</Badge>
                      <h2 className="text-title font-bold text-ink tracking-tight">{selectedOpportunity.title}</h2>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOpportunity(null)} className="h-8 w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-callout text-ink-secondary mb-4 leading-relaxed">{selectedOpportunity.fullDescription}</p>
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-4 w-4 text-success" strokeWidth={1.5} />
                  <span className="text-subhead font-bold text-ink">{selectedOpportunity.potential}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="primary" size="lg" className="flex-1" onClick={() => { setSelectedOpportunity(null); onNavigate?.("entrepreneur-hub"); }}>
                    Get Started
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setSelectedOpportunity(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mentor Connect Modal */}
      <AnimatePresence>
        {connectingMentor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-scrim backdrop-blur-md" onClick={() => { if (!connectSent) { setConnectingMentor(null); setConnectMessage(""); } }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-material-lg specular-sheen rounded-[24px] max-w-md w-full overflow-hidden"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-night flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{connectingMentor.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-title font-bold text-ink tracking-tight">{connectingMentor.name}</h2>
                      <p className="text-caption text-ink-tertiary">{connectingMentor.expertise} · {connectingMentor.location}</p>
                    </div>
                  </div>
                  {!connectSent && (
                    <button onClick={() => { setConnectingMentor(null); setConnectMessage(""); }} className="h-8 w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-ink transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {connectSent ? (
                  <div className="text-center py-6">
                    <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <Handshake className="h-7 w-7 text-success" strokeWidth={1.5} />
                    </div>
                    <p className="text-subhead font-bold text-ink">Connection Request Sent!</p>
                    <p className="text-caption text-ink-tertiary mt-1">{connectingMentor.name} will be notified.</p>
                  </div>
                ) : (
                  <>
                    <label className="text-caption font-semibold text-ink-secondary block mb-2">Your message</label>
                    <textarea
                      value={connectMessage}
                      onChange={(e) => setConnectMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                    />
                    <Button variant="primary" size="lg" fullWidth className="mt-4" icon={<Send className="h-4 w-4" />} onClick={handleConnect} disabled={!connectMessage.trim()}>
                      Send Connection Request
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
