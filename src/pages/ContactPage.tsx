import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Mail, PhoneCall, MapPin, ShieldQuestion, ArrowRight, ArrowUpRight, Send,
  CheckCircle2, MessageSquare, ChevronDown, Globe2, Building2, Clock, Lock,
} from "lucide-react";
import TiltCard from "../components/ui/TiltCard";

const IMG = {
  office: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80",
  doors: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=80",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    desc: "For help with an order, an account or anything in between.",
    value: "support@birichinex.com",
    href: "mailto:support@birichinex.com",
    tagline: "Replies within 24 hours",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp & chat",
    desc: "Quick questions? Reach our support team directly.",
    value: "+254 700 000 000",
    href: "#",
    tagline: "Monday–Saturday, 9am–6pm",
  },
  {
    icon: Building2,
    title: "Head office",
    desc: "BirichiNex Technologies Limited",
    value: "Nairobi, Kenya",
    href: "#",
    tagline: "By appointment",
  },
  {
    icon: Lock,
    title: "Privacy & data requests",
    desc: "Access, correction or account data questions.",
    value: "privacy@birichinex.com",
    href: "mailto:privacy@birichinex.com",
    tagline: "Handled confidentially",
  },
];

const FAQS = [
  {
    q: "How long does delivery take in Kenya?",
    a: "Orders are shipped within 24 hours of confirmation. Nairobi deliveries typically arrive in 1–3 business days and the rest of the country in 2–5 business days.",
  },
  {
    q: "What is your return policy?",
    a: "Items in original condition can be returned within 14 days of delivery for a store credit or exchange. Certified refurbished tech carries its own warranty terms.",
  },
  {
    q: "Can I sell on BirichiNex as a small business?",
    a: "Yes. Anyone can list products through the Seller Hub in the BirichiNex OS. The digital Seller Academy covers pricing, sourcing, photography and fulfilment.",
  },
  {
    q: "How do I update my personal information?",
    a: "You can update your profile any time from your account settings. For data requests under your privacy rights, email privacy@birichinex.com.",
  },
  {
    q: "Where can I read the platform's terms?",
    a: "Every policy — Terms of Service, Privacy, Cookies, AI Terms, Seller Terms and Marketplace Terms — is published in the Legal & Trust Centre in the footer of this page.",
  },
];

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "Order & delivery", subject: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number>(0);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const topics = ["Order & delivery", "Returns & refunds", "Account & billing", "Selling on BirichiNex", "AI & Amani assistant", "Press & partnerships", "Something else"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  const field =
    "w-full h-12 px-4 rounded-[14px] bg-surface-secondary border border-glass-border/50 text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all";

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[46vh] min-h-[380px] overflow-hidden flex items-end">
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img
            src={IMG.office}
            alt="BirichiNex support team"
            className="w-full h-[130%] object-cover"
            onError={(e) => { (e.currentTarget.style.display = "none"); }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/15" />

        <motion.div style={{ y: heroTextY }} className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-12">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/10 text-white/90 backdrop-blur border border-white/15 mb-5"
          >
            <PhoneCall className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
            Contact Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-display font-bold tracking-tight text-white leading-[1.04] max-w-2xl"
          >
            We're here for you, <span className="text-gradient-brand">real people included</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-callout text-white/70 leading-relaxed mt-4 max-w-lg"
          >
            Questions about an order, your account, selling, or Amani and our AI — reach out and a human team member will get back to you.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── CHANNELS ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_CHANNELS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <TiltCard className="h-full" max={9}>
                <a
                  href={c.href}
                  onClick={(e) => { if (c.href === "#") e.preventDefault(); }}
                  className="group flex flex-col h-full rounded-[22px] glass-material border border-glass-border/40 p-6 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-brand/25 to-brand/5 border border-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <c.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-ink-quaternary group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-subhead font-bold text-ink mb-1">{c.title}</h3>
                  <p className="text-caption text-ink-tertiary leading-relaxed mb-4">{c.desc}</p>
                  <p className="text-callout font-bold text-brand mt-auto">{c.value}</p>
                  <p className="text-caption text-ink-quaternary mt-1.5">{c.tagline}</p>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── FORM + ASIDE ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          {/* Form */}
          <Reveal>
            <div className="glass-material rounded-[26px] border border-glass-border/40 overflow-hidden">
              <div className="px-6 sm:px-10 py-8">
                <div className="flex items-center gap-2 text-brand mb-1">
                  <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Send a message</p>
                </div>
                <h2 className="text-headline font-bold tracking-tight text-ink leading-tight">How can we help?</h2>
                <p className="text-caption text-ink-tertiary mt-2 mb-8">
                  Tell us what's on your mind and we'll reply within one business day.
                </p>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-[20px] border border-brand/25 bg-brand/[0.06] p-8 text-center"
                    >
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(212,175,55,0.35)]">
                        <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={1.6} />
                      </div>
                      <h3 className="text-title font-bold text-ink mb-1">Message sent</h3>
                      <p className="text-caption text-ink-tertiary leading-relaxed max-w-sm mx-auto">
                        Thanks {form.name.split(" ")[0]}! We've received your note and will reply to <span className="text-brand font-semibold">{form.email}</span> within 24 hours.
                      </p>
                      <button
                        onClick={() => { setSent(false); setForm({ name: "", email: "", topic: topics[0], subject: "", message: "" }); }}
                        className="mt-5 text-caption font-semibold text-brand hover:text-brand-light transition-colors"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-caption font-semibold text-ink-secondary mb-1.5">Your name</label>
                          <input
                            className={field}
                            placeholder="Full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-caption font-semibold text-ink-secondary mb-1.5">Email</label>
                          <input
                            className={field}
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-caption font-semibold text-ink-secondary mb-1.5">Topic</label>
                        <select className={field} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-caption font-semibold text-ink-secondary mb-1.5">Subject</label>
                        <input
                          className={field}
                          placeholder="Brief summary"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-caption font-semibold text-ink-secondary mb-1.5">Message</label>
                        <textarea
                          className="w-full min-h-[140px] px-4 py-3 rounded-[14px] bg-surface-secondary border border-glass-border/50 text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all resize-y"
                          placeholder="How can we help?"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#aa7c11] text-white text-subhead font-bold shadow-lg shadow-[#d4af37]/25 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                              className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                            />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send message <Send className="h-4 w-4" strokeWidth={1.5} />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          {/* Aside */}
          <div className="space-y-5">
            <Reveal delay={0.1}>
              <div className="relative rounded-[24px] overflow-hidden">
                <img
                  src={IMG.doors}
                  alt="BirichiNex head office doors"
                  className="w-full h-56 object-cover"
                  onError={(e) => { (e.currentTarget.style.display = "none"); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Head office</p>
                  <p className="text-subhead font-bold text-white mt-1">BirichiNex Technologies Limited</p>
                  <p className="text-caption text-white/70 mt-0.5">Nairobi, Kenya</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="space-y-3">
                {[
                  { icon: Clock, label: "Support hours", value: "Mon–Sat, 9:00–18:00 EAT" },
                  { icon: Globe2, label: "Online", value: "birichinex.com" },
                  { icon: ShieldQuestion, label: "Data requests", value: "privacy@birichinex.com" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3.5 p-4 rounded-[16px] glass-material border border-glass-border/40">
                    <row.icon className="h-5 w-5 text-brand shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="text-caption text-ink-tertiary">{row.label}</p>
                      <p className="text-subhead font-semibold text-ink truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <TiltCard max={8}>
                <div className="rounded-[20px] bg-night text-white p-6 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
                  <MapPin className="h-6 w-6 text-brand mb-3" strokeWidth={1.5} />
                  <p className="text-title font-bold leading-tight">Visiting Kenya?</p>
                  <p className="text-caption text-white/60 leading-relaxed mt-2 mb-5">
                    We're headquartered in Nairobi and love meeting founders building the region's future.
                  </p>
                  <button
                    onClick={() => onNavigate("about")}
                    className="inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:text-brand-light transition-colors"
                  >
                    Learn about us <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 lg:px-8 pb-20">
        <Reveal className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand mb-3">Quick answers</p>
          <h2 className="text-headline font-bold tracking-tight text-ink">Frequently asked questions</h2>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={f.q} delay={i * 0.06}>
                <div className={`rounded-[18px] border transition-colors duration-200 ${open ? "border-brand/30 bg-brand/[0.04]" : "border-glass-border/40 bg-surface-secondary/60"}`}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-subhead font-semibold text-ink">{f.q}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                      <ChevronDown className="h-4 w-4 text-brand" strokeWidth={1.5} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-body text-ink-secondary leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="text-center mt-10">
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex items-center gap-2 text-caption font-semibold text-ink-tertiary hover:text-brand transition-colors"
          >
            Back to the marketplace <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </Reveal>
      </section>
    </div>
  );
}