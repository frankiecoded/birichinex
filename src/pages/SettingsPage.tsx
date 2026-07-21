import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings as SettingsIcon, User, Shield, Bell, Globe, Palette,
  Key, CreditCard, ChevronRight, ChevronDown, Save, Copy, Check,
  MessageSquare, Phone, Mail as MailIcon
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import { useStore } from "../store/useStore";
import { MEMBERSHIP_TIERS, formatPrice } from "../data/platform";
import type { Currency } from "../types";

const TIER_LABELS: Record<string, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  enterprise: "Enterprise",
};

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const currentTier = useStore((s) => s.currentTier);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [profileForm, setProfileForm] = useState({ ...settings.profile });
  const [notifForm, setNotifForm] = useState({ ...settings.notifications });
  const [themeForm, setThemeForm] = useState(settings.theme);

  const toggle = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleSaveProfile = () => {
    updateSettings({ profile: profileForm });
    flashSaved();
  };

  const handleSaveNotifications = () => {
    updateSettings({ notifications: notifForm });
    flashSaved();
  };

  const handleSaveAppearance = () => {
    updateSettings({ theme: themeForm });
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText("bnc_live_sk_••••••••••••••••");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const sections = [
    { id: "profile", icon: User, label: "Profile", description: "Your personal and business information", badge: null },
    { id: "notifications", icon: Bell, label: "Notifications", description: "Email, push, and in-app alerts", badge: null },
    { id: "security", icon: Shield, label: "Security & Privacy", description: "Password, MFA, and privacy settings", badge: null },
    { id: "billing", icon: CreditCard, label: "Billing & Membership", description: "Subscription, invoices, and payment methods", badge: TIER_LABELS[currentTier] },
    { id: "appearance", icon: Palette, label: "Appearance", description: "Theme, language, and display preferences", badge: null },
    { id: "api", icon: Key, label: "API & Integrations", description: "API keys, webhooks, and third-party connections", badge: null },
    { id: "support", icon: MessageSquare, label: "Support", description: "Help center, contact, and documentation", badge: null },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-headline text-ink tracking-tight">
          <span className="text-gradient-brand">Settings</span>
        </h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Manage your account, security, and platform preferences.
        </p>
      </motion.div>

      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                padding="md"
                hover
                className="cursor-pointer"
                onClick={() => toggle(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[12px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                    <section.icon className="h-5 w-5 text-ink-secondary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead font-bold text-ink">{section.label}</p>
                    <p className="text-caption text-ink-tertiary">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {section.badge && <Badge variant="brand" size="sm">{section.badge}</Badge>}
                    {expandedSection === section.id ? (
                      <ChevronDown className="h-4 w-4 text-ink-quaternary transition-transform" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              </GlassCard>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-2">
                      <GlassCard padding="lg" className="space-y-6">
                        {section.id === "profile" && (
                          <ProfileSection
                            form={profileForm}
                            onChange={setProfileForm}
                            onSave={handleSaveProfile}
                            saved={saved}
                          />
                        )}
                        {section.id === "notifications" && (
                          <NotificationSection
                            form={notifForm}
                            onChange={setNotifForm}
                            onSave={handleSaveNotifications}
                            saved={saved}
                          />
                        )}
                        {section.id === "security" && <SecuritySection />}
                        {section.id === "billing" && <BillingSection currentTier={currentTier} selectedCurrency={selectedCurrency} />}
                        {section.id === "appearance" && (
                          <AppearanceSection
                            theme={themeForm}
                            onChange={setThemeForm}
                            onSave={handleSaveAppearance}
                            saved={saved}
                          />
                        )}
                        {section.id === "api" && <ApiKeySection copied={copiedKey} onCopy={handleCopyKey} />}
                        {section.id === "support" && <SupportSection />}
                      </GlassCard>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>
    </div>
  );
}

function ProfileSection({
  form,
  onChange,
  onSave,
  saved,
}: {
  form: { name: string; email: string; phone: string; company: string };
  onChange: (f: { name: string; email: string; phone: string; company: string }) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const inputClass =
    "w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all";

  return (
    <>
      <p className="text-title font-bold text-ink">Profile</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Full Name</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Email</label>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Phone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Company</label>
          <input
            className={inputClass}
            value={form.company}
            onChange={(e) => onChange({ ...form, company: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="brand" size="md" icon={<Save className="h-4 w-4" />} onClick={onSave}>
          Save Profile
        </Button>
        {saved && <Badge variant="success" size="sm">Saved</Badge>}
      </div>
    </>
  );
}

function NotificationSection({
  form,
  onChange,
  onSave,
  saved,
}: {
  form: { email: boolean; push: boolean; sms: boolean };
  onChange: (f: { email: boolean; push: boolean; sms: boolean }) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const toggles = [
    { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email", icon: MailIcon },
    { key: "push" as const, label: "Push Notifications", desc: "Browser and mobile push alerts", icon: Bell },
    { key: "sms" as const, label: "SMS Notifications", desc: "Text message alerts for critical events", icon: Phone },
  ];

  return (
    <>
      <p className="text-title font-bold text-ink">Notifications</p>
      <div className="space-y-4">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center">
                <t.icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-ink">{t.label}</p>
                <p className="text-caption text-ink-tertiary">{t.desc}</p>
              </div>
            </div>
            <button
              onClick={() => onChange({ ...form, [t.key]: !form[t.key] })}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                form[t.key] ? "bg-brand" : "bg-surface-secondary"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form[t.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="brand" size="md" icon={<Save className="h-4 w-4" />} onClick={onSave}>
          Save Notifications
        </Button>
        {saved && <Badge variant="success" size="sm">Saved</Badge>}
      </div>
    </>
  );
}

function SecuritySection() {
  const features = [
    { label: "Change Password", desc: "Update your account password", status: "Coming Soon" },
    { label: "Two-Factor Authentication", desc: "Add an extra layer of security", status: "Coming Soon" },
    { label: "Login History", desc: "View recent login activity", status: "Coming Soon" },
    { label: "Active Sessions", desc: "Manage devices signed into your account", status: "Coming Soon" },
  ];

  return (
    <>
      <p className="text-title font-bold text-ink">Security & Privacy</p>
      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.label} className="flex items-center justify-between p-3 rounded-[12px] bg-surface/50">
            <div>
              <p className="text-subhead font-semibold text-ink">{f.label}</p>
              <p className="text-caption text-ink-tertiary">{f.desc}</p>
            </div>
            <Badge variant="default" size="sm">{f.status}</Badge>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingSection({ currentTier, selectedCurrency }: { currentTier: string; selectedCurrency: Currency }) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.tier === currentTier);

  return (
    <>
      <p className="text-title font-bold text-ink">Billing & Membership</p>
      <GlassCard padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-subhead font-bold text-ink">{tier?.label ?? currentTier}</p>
            <p className="text-caption text-ink-tertiary">
              {tier?.monthlyPrice !== null && tier?.monthlyPrice !== undefined
                ? `${formatPrice(tier.monthlyPrice, selectedCurrency, "USD")}/month`
                : "Custom pricing"}
            </p>
          </div>
          <Badge variant="brand" size="md" dot>Current</Badge>
        </div>
        <div className="flex items-center gap-4 text-caption text-ink-tertiary">
          <span>{tier?.maxTeamMembers === -1 ? "Unlimited" : tier?.maxTeamMembers} team members</span>
          <span>·</span>
          <span>{tier?.storageGB}GB storage</span>
          <span>·</span>
          <span className="capitalize">{tier?.supportLevel} support</span>
        </div>
      </GlassCard>
      <p className="text-caption text-ink-tertiary">
        Manage subscription and view invoices on the{" "}
        <span className="text-brand font-semibold cursor-pointer hover:underline">Membership page</span>.
      </p>
    </>
  );
}

function AppearanceSection({
  theme,
  onChange,
  onSave,
  saved,
}: {
  theme: "light" | "dark" | "system";
  onChange: (t: "light" | "dark" | "system") => void;
  onSave: () => void;
  saved: boolean;
}) {
  const options: { value: "light" | "dark" | "system"; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <>
      <p className="text-title font-bold text-ink">Appearance</p>
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3 rounded-[12px] cursor-pointer transition-colors ${
              theme === opt.value ? "bg-brand/10 border border-brand/30" : "bg-surface/50 border border-transparent hover:bg-surface-secondary/60"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                theme === opt.value ? "border-brand" : "border-ink-quaternary"
              }`}
            >
              {theme === opt.value && <span className="h-2 w-2 rounded-full bg-brand" />}
            </span>
            <span className="text-subhead font-semibold text-ink">{opt.label}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="brand" size="md" icon={<Save className="h-4 w-4" />} onClick={onSave}>
          Save Appearance
        </Button>
        {saved && <Badge variant="success" size="sm">Saved</Badge>}
      </div>
    </>
  );
}

function ApiKeySection({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <>
      <p className="text-title font-bold text-ink">API & Integrations</p>
      <div className="space-y-4">
        <div className="p-3 rounded-[12px] bg-surface/50 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-subhead font-semibold text-ink">Live API Key</p>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-caption text-ink-secondary font-mono bg-surface-secondary/60 rounded-[8px] px-3 py-2">
              bnc_live_sk_••••••••••••••••
            </code>
            <button
              onClick={onCopy}
              className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" strokeWidth={1.5} />
              ) : (
                <Copy className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
        <p className="text-caption text-ink-tertiary">
          Webhooks, third-party integrations, and advanced API configuration coming soon.
        </p>
      </div>
    </>
  );
}

function SupportSection() {
  return (
    <>
      <p className="text-title font-bold text-ink">Support</p>
      <div className="space-y-3">
        <div className="p-3 rounded-[12px] bg-surface/50">
          <p className="text-subhead font-semibold text-ink">Help Center</p>
          <p className="text-caption text-ink-tertiary">Browse documentation and FAQs at docs.birichinex.com</p>
        </div>
        <div className="p-3 rounded-[12px] bg-surface/50">
          <p className="text-subhead font-semibold text-ink">Email Support</p>
          <p className="text-caption text-ink-tertiary">support@portmetals.co.tz</p>
        </div>
        <div className="p-3 rounded-[12px] bg-surface/50">
          <p className="text-subhead font-semibold text-ink">Phone</p>
          <p className="text-caption text-ink-tertiary">+255 700 000 000</p>
        </div>
      </div>
    </>
  );
}
