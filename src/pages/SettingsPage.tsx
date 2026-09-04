import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings as SettingsIcon, User, Shield, Bell, Globe, Palette,
  Key, CreditCard, ChevronRight, ChevronDown, Save, Copy, Check,
  MessageSquare, Phone, Mail as MailIcon, Eye, EyeOff,
  ShieldCheck, ShieldOff, AlertCircle, CheckCircle2, RefreshCw,
  Trash2, MonitorSmartphone, Plus, Webhook as WebhookIcon
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import CloudStorageCard from "../components/shell/CloudStorageCard";
import { useStore } from "../store/useStore";
import { MEMBERSHIP_TIERS, formatPrice, CURRENCY_NAMES } from "../data/platform";
import type { Currency, MembershipTier } from "../types";

const TIER_LABELS: Record<string, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  enterprise: "Enterprise",
};

const CURRENCY_OPTIONS = Object.keys(CURRENCY_NAMES) as Currency[];

export default function SettingsPage({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const updateUser = useStore((s) => s.updateUser);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const setCurrency = useStore((s) => s.setCurrency);
  const currentTier = useStore((s) => s.currentTier);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ ...settings.profile });
  const [notifForm, setNotifForm] = useState({ ...settings.notifications });

  // Keep local forms in sync when settings change (e.g. cloud sync hydration).
  useEffect(() => {
    setProfileForm({ ...settings.profile });
  }, [settings.profile]);

  useEffect(() => {
    setNotifForm({ ...settings.notifications });
  }, [settings.notifications]);

  const toggle = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleSaveProfile = () => {
    updateSettings({ profile: profileForm });
    // Keep the signed-in identity (header, AI agents, shop account) in sync.
    if (profileForm.name) updateUser({ name: profileForm.name });
    if (profileForm.email) updateUser({ email: profileForm.email });
    flashSaved("profile");
  };

  const handleSaveNotifications = () => {
    updateSettings({ notifications: notifForm });
    flashSaved("notifications");
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    updateSettings({ theme });
  };

  const flashSaved = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection((s) => (s === section ? null : s)), 2000);
  };

  const sections = [
    { id: "profile", icon: User, label: "Profile", description: "Your personal and business information", badge: null },
    { id: "notifications", icon: Bell, label: "Notifications", description: "Email, push, and in-app alerts", badge: null },
    { id: "security", icon: Shield, label: "Security & Privacy", description: "Password, MFA, and privacy settings", badge: null },
    { id: "billing", icon: CreditCard, label: "Billing & Membership", description: "Subscription, invoices, and payment methods", badge: TIER_LABELS[currentTier] },
    { id: "appearance", icon: Palette, label: "Appearance", description: "Theme, currency, and display preferences", badge: null },
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
                            saved={savedSection === "profile"}
                          />
                        )}
                        {section.id === "notifications" && (
                          <NotificationSection
                            form={notifForm}
                            onChange={setNotifForm}
                            onSave={handleSaveNotifications}
                            saved={savedSection === "notifications"}
                          />
                        )}
                        {section.id === "security" && <SecuritySection />}
                        {section.id === "billing" && <BillingSection currentTier={currentTier} selectedCurrency={selectedCurrency} onNavigate={onNavigate} />}
                        {section.id === "appearance" && (
                          <AppearanceSection
                            theme={settings.theme}
                            onThemeChange={handleThemeChange}
                            selectedCurrency={selectedCurrency}
                            onCurrencyChange={setCurrency}
                          />
                        )}
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
  const addNotification = useStore((s) => s.addNotification);
  const [tested, setTested] = useState<string | null>(null);

  const toggles = [
    { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email", icon: MailIcon },
    { key: "push" as const, label: "Push Notifications", desc: "Browser and mobile push alerts", icon: Bell },
    { key: "sms" as const, label: "SMS Notifications", desc: "Text message alerts for critical events", icon: Phone },
  ];

  const sendTest = (key: string, label: string) => {
    addNotification({ title: `Test ${label}`, body: `This is a test ${key} notification from your settings.`, type: "system" });
    setTested(key);
    setTimeout(() => setTested((k) => (k === key ? null : k)), 2000);
  };

  return (
    <>
      <p className="text-title font-bold text-ink">Notifications</p>
      <div className="space-y-4">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center">
                <t.icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-ink">{t.label}</p>
                <p className="text-caption text-ink-tertiary">{t.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button type="button" size="sm" variant="ghost" onClick={() => sendTest(t.key, t.label)}>
                {tested === t.key ? "Sent" : "Test"}
              </Button>
              <button
                type="button"
                onClick={() => onChange({ ...form, [t.key]: !form[t.key] })}
                aria-pressed={form[t.key]}
                aria-label={`Toggle ${t.label}`}
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
  const user = useStore((s) => s.user);
  const users = useStore((s) => s.users);
  const changePassword = useStore((s) => s.changePassword);
  const enableTwoFactor = useStore((s) => s.enableTwoFactor);
  const disableTwoFactor = useStore((s) => s.disableTwoFactor);
  const rotateRecoveryCodes = useStore((s) => s.rotateRecoveryCodes);
  const loginHistory = useStore((s) => s.loginHistory);
  const sessions = useStore((s) => s.sessions);
  const revokeSession = useStore((s) => s.revokeSession);
  const logout = useStore((s) => s.logout);

  const account = user ? users[user.email.trim().toLowerCase()] : undefined;
  const twoFactorEnabled = !!account?.twoFactorCode;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [setupStage, setSetupStage] = useState<"off" | "enter" | "codes">("off");
  const [setupCode, setSetupCode] = useState("");
  const [confirmSetupCode, setConfirmSetupCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [twoFaMsg, setTwoFaMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableCode, setShowDisableCode] = useState(false);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ ok: false, text: "Fill in all password fields." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "New passwords don't match." });
      return;
    }
    setPasswordBusy(true);
    setTimeout(() => {
      const res = changePassword(currentPassword, newPassword);
      setPasswordBusy(false);
      setPasswordMsg(res.ok ? { ok: true, text: "Password updated successfully." } : { ok: false, text: res.error ?? "Unable to update password." });
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    }, 400);
  };

  const handleEnableTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaMsg(null);
    if (!/^\d{6}$/.test(setupCode.trim())) {
      setTwoFaMsg({ ok: false, text: "Enter a 6-digit code." });
      return;
    }
    if (setupCode.trim() !== confirmSetupCode.trim()) {
      setTwoFaMsg({ ok: false, text: "Codes don't match." });
      return;
    }
    const res = enableTwoFactor(setupCode);
    if (!res.ok) {
      setTwoFaMsg({ ok: false, text: res.error ?? "Unable to enable two-factor authentication." });
      return;
    }
    setRecoveryCodes(res.recoveryCodes ?? []);
    setSetupStage("codes");
  };

  const handleDisableTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaMsg(null);
    const res = disableTwoFactor(disableCode);
    setTwoFaMsg(res.ok ? { ok: true, text: "Two-factor authentication is now off." } : { ok: false, text: res.error ?? "Unable to disable two-factor authentication." });
    if (res.ok) {
      setDisableCode("");
      setShowDisableCode(false);
      setSetupStage("off");
    }
  };

  const handleRotateCodes = () => {
    setRecoveryCodes(rotateRecoveryCodes());
    setSetupStage("codes");
  };

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      // clipboard unavailable — ignore
    }
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1600);
  };

  const formatTime = (t: string) => {
    try {
      return new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return t;
    }
  };

  const statusColor = (status: "success" | "failed") =>
    status === "success" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10";

  return (
    <>
      <p className="text-title font-bold text-ink">Security & Privacy</p>

      <GlassCard padding="md" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-subhead font-bold text-ink">Change Password</p>
            <p className="text-caption text-ink-tertiary">Update your account password</p>
          </div>
          {account?.password ? (
            <Badge variant="brand" size="sm" dot>Set</Badge>
          ) : (
            <Badge variant="default" size="sm">Not set</Badge>
          )}
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full h-[44px] pl-9 pr-10 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full h-[44px] pl-9 pr-3 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-[44px] pl-9 pr-3 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1.5 text-caption font-semibold text-ink-tertiary hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
              {showPassword ? "Hide" : "Show"}
            </button>
            {passwordMsg && (
              <span className={`text-caption font-semibold flex items-center gap-1 ${passwordMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {passwordMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> : <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {passwordMsg.text}
              </span>
            )}
            <Button type="submit" size="sm" variant="primary" loading={passwordBusy}>Update Password</Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard padding="md" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-subhead font-bold text-ink">Two-Factor Authentication</p>
            <p className="text-caption text-ink-tertiary">Add an extra layer of security to your account</p>
          </div>
          {twoFactorEnabled ? (
            <Badge variant="brand" size="sm" dot>Enabled</Badge>
          ) : (
            <Badge variant="default" size="sm">Off</Badge>
          )}
        </div>

        {!twoFactorEnabled && setupStage === "off" && (
          <Button type="button" size="sm" variant="brand" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setSetupStage("enter")}>
            Enable 2FA
          </Button>
        )}

        {!twoFactorEnabled && setupStage === "enter" && (
          <form onSubmit={handleEnableTwoFactor} className="space-y-3">
            <p className="text-caption text-ink-tertiary">
              Choose a 6-digit PIN you'll enter at sign-in. Store it somewhere safe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit PIN"
                className="w-full h-[44px] px-3 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] tracking-[0.3em] text-center text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={confirmSetupCode}
                onChange={(e) => setConfirmSetupCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Confirm PIN"
                className="w-full h-[44px] px-3 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] tracking-[0.3em] text-center text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
            </div>
            {twoFaMsg && (
              <span className={`text-caption font-semibold flex items-center gap-1 ${twoFaMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {twoFaMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> : <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {twoFaMsg.text}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary">Activate 2FA</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setSetupStage("off"); setTwoFaMsg(null); }}>Cancel</Button>
            </div>
          </form>
        )}

        {!twoFactorEnabled && setupStage === "codes" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
              <p className="text-caption font-semibold text-emerald-400">Two-factor authentication is enabled</p>
            </div>
            <p className="text-caption text-ink-tertiary">
              Save these recovery codes somewhere safe. Each one can be used once if you lose your PIN.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recoveryCodes.map((code) => (
                <div key={code} className="flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] bg-surface/60 border border-white/[0.06]">
                  <span className="text-caption font-mono font-semibold text-ink">{code}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(code)}
                    className="text-ink-quaternary hover:text-brand transition-colors"
                  >
                    {copiedText === code ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="primary" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => handleCopy(recoveryCodes.join("\n"))}>
                {copiedText === recoveryCodes.join("\n") ? "Copied" : "Copy all codes"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSetupStage("off")}>Done</Button>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <form onSubmit={handleDisableTwoFactor} className="space-y-3">
            {setupStage === "codes" && (
              <div className="space-y-3">
                <p className="text-caption text-ink-tertiary">You can rotate your recovery codes at any time.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recoveryCodes.map((code) => (
                    <div key={code} className="flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] bg-surface/60 border border-white/[0.06]">
                      <span className="text-caption font-mono font-semibold text-ink">{code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(code)}
                        className="text-ink-quaternary hover:text-brand transition-colors"
                      >
                        {copiedText === code ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="primary" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => handleCopy(recoveryCodes.join("\n"))}>
                    {copiedText === recoveryCodes.join("\n") ? "Copied" : "Copy all codes"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSetupStage("off")}>Close</Button>
                </div>
              </div>
            )}
            {setupStage === "off" && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button type="button" size="sm" variant="brand" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={handleRotateCodes}>
                    Show recovery codes
                  </Button>
                  <Button type="button" size="sm" variant="ghost" icon={<ShieldOff className="h-3.5 w-3.5" />} onClick={() => setShowDisableCode(true)}>
                    Disable 2FA
                  </Button>
                </div>
                {showDisableCode && (
                  <div className="space-y-3">
                    <p className="text-caption text-ink-tertiary">Enter your 6-digit PIN to disable two-factor authentication.</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className="w-full max-w-[180px] h-[44px] px-3 bg-surface/60 border border-white/[0.06] rounded-[12px] text-[13px] tracking-[0.3em] text-center text-ink placeholder:text-ink-quaternary/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                      />
                      <Button type="submit" size="sm" variant="danger">Disable</Button>
                    </div>
                  </div>
                )}
                {twoFaMsg && (
                  <span className={`text-caption font-semibold flex items-center gap-1 ${twoFaMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {twoFaMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> : <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    {twoFaMsg.text}
                  </span>
                )}
              </>
            )}
          </form>
        )}
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <div>
          <p className="text-subhead font-bold text-ink">Login History</p>
          <p className="text-caption text-ink-tertiary">Recent sign-in activity on your account</p>
        </div>
        {loginHistory.length === 0 ? (
          <p className="text-caption text-ink-quaternary">No sign-ins recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {loginHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-surface/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${statusColor(entry.status)}`}>
                    {entry.status === "success" ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> : <AlertCircle className="h-4 w-4" strokeWidth={1.5} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-caption font-semibold text-ink truncate">{entry.device}</p>
                    <p className="text-[11px] text-ink-tertiary truncate">{entry.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-ink-tertiary">{formatTime(entry.time)}</p>
                  <p className={`text-[11px] font-bold uppercase tracking-wide ${entry.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                    {entry.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <div>
          <p className="text-subhead font-bold text-ink">Active Sessions</p>
          <p className="text-caption text-ink-tertiary">Devices currently signed into your account</p>
        </div>
        {sessions.length === 0 ? (
          <p className="text-caption text-ink-quaternary">No active sessions.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-surface/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <MonitorSmartphone className="h-4 w-4 text-brand" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-caption font-semibold text-ink truncate">{session.device}</p>
                      {session.current && <Badge variant="brand" size="sm" dot>This device</Badge>}
                    </div>
                    <p className="text-[11px] text-ink-tertiary truncate">
                      {session.location} · Last active {formatTime(session.lastActive)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    revokeSession(session.id);
                    if (session.current) logout();
                  }}
                  className="flex items-center gap-1.5 text-caption font-semibold text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </>
  );
}

function BillingSection({ currentTier, selectedCurrency, onNavigate }: { currentTier: string; selectedCurrency: Currency; onNavigate?: (view: string) => void }) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.tier === currentTier);
  const subscription = useStore((s) => s.subscription);
  const cancelSubscription = useStore((s) => s.cancelSubscription);
  const setAutoRenew = useStore((s) => s.setAutoRenew);
  const payoutBank = useStore((s) => s.settings.payoutBank);
  const savePayoutBank = useStore((s) => s.savePayoutBank);
  const addNotification = useStore((s) => s.addNotification);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountName: payoutBank?.accountName ?? "",
    accountBank: payoutBank?.accountBank ?? "",
    accountNumber: payoutBank?.accountNumber ?? "",
    country: payoutBank?.country ?? "TZ",
    destinationBranchCode: payoutBank?.destinationBranchCode ?? "",
  });

  const isActive =
    subscription.status === "active" &&
    (!subscription.expiresAt || new Date(subscription.expiresAt).getTime() > Date.now());

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
    } catch {
      return iso;
    }
  };

  const handleSaveBank = () => {
    if (!bankForm.accountName.trim() || !bankForm.accountBank.trim() || !bankForm.accountNumber.trim()) {
      addNotification({ title: "Incomplete details", body: "Beneficiary name, bank code and account number are required.", type: "system" });
      return;
    }
    savePayoutBank({
      accountName: bankForm.accountName.trim(),
      accountBank: bankForm.accountBank.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      country: bankForm.country,
      destinationBranchCode: bankForm.destinationBranchCode.trim() || undefined,
    });
    setBankSaved(true);
    addNotification({ title: "Payout account saved", body: "Withdrawals from your business wallet will use this bank account.", type: "system" });
    setTimeout(() => setBankSaved(false), 2500);
  };

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
          <Badge variant={isActive ? "brand" : subscription.status === "cancelled" ? "default" : "default"} size="md" dot>
            {isActive ? "Active" : subscription.status === "cancelled" ? "Cancelled" : "No subscription"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-caption text-ink-tertiary">
          <span>{tier?.maxTeamMembers === -1 ? "Unlimited" : tier?.maxTeamMembers} team members</span>
          <span>·</span>
          <span>{tier?.storageGB}GB storage</span>
          <span>·</span>
          <span className="capitalize">{tier?.supportLevel} support</span>
        </div>
        {subscription.status !== "none" && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-[10px] bg-surface/50">
              <p className="text-[11px] text-ink-tertiary font-semibold uppercase tracking-wide">Started</p>
              <p className="text-subhead font-semibold text-ink">{formatDate(subscription.startedAt)}</p>
            </div>
            <div className="p-3 rounded-[10px] bg-surface/50">
              <p className="text-[11px] text-ink-tertiary font-semibold uppercase tracking-wide">{isActive ? "Renews on" : "Expired"}</p>
              <p className="text-subhead font-semibold text-ink">{subscription.expiresAt ? formatDate(subscription.expiresAt) : "Never — free plan"}</p>
            </div>
          </div>
        )}
        {isActive && (
          <div className="flex items-center justify-between p-3 rounded-[10px] bg-surface/50">
            <div>
              <p className="text-caption font-semibold text-ink">Auto-renew</p>
              <p className="text-[11px] text-ink-tertiary">Billed via Flutterwave · {subscription.billingPeriod} plan</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={subscription.autoRenew !== false}
              onClick={() => setAutoRenew(subscription.autoRenew !== false ? false : true)}
              className={`relative h-6 w-11 rounded-full transition-colors ${subscription.autoRenew !== false ? "bg-brand" : "bg-surface-secondary"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${subscription.autoRenew !== false ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        )}
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <div>
          <p className="text-subhead font-bold text-ink">Payment Method</p>
          <p className="text-caption text-ink-tertiary">Subscriptions are charged in USD and settle to the owner's bank via Flutterwave</p>
        </div>
        <div className="flex items-center justify-between p-3 rounded-[12px] bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-brand/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-caption font-semibold text-ink">
                {isActive ? `Card / M-Pesa · ${subscription.billingPeriod} billing` : "No active subscription"}
              </p>
              <p className="text-[11px] text-ink-tertiary">Pay securely on the Membership page</p>
            </div>
          </div>
          <Badge variant="info" size="sm">Flutterwave</Badge>
        </div>
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <div>
          <p className="text-subhead font-bold text-ink">Payout Bank Account</p>
          <p className="text-caption text-ink-tertiary">Business-wallet withdrawals (dropshipping + subscription revenue) are paid to this account</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Beneficiary name</label>
            <input
              className="w-full h-10 px-3.5 bg-surface/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={bankForm.accountName}
              onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
              placeholder="e.g. Frank Musau"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Bank code</label>
            <input
              className="w-full h-10 px-3.5 bg-surface/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={bankForm.accountBank}
              onChange={(e) => setBankForm({ ...bankForm, accountBank: e.target.value })}
              placeholder="e.g. NMB"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Account number</label>
            <input
              className="w-full h-10 px-3.5 bg-surface/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              placeholder="e.g. 1234567890"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Country</label>
              <select
                className="w-full h-10 px-3 bg-surface/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={bankForm.country}
                onChange={(e) => setBankForm({ ...bankForm, country: e.target.value })}
              >
                <option value="TZ">Tanzania</option>
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Branch code</label>
              <input
                className="w-full h-10 px-3.5 bg-surface/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={bankForm.destinationBranchCode}
                onChange={(e) => setBankForm({ ...bankForm, destinationBranchCode: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" size="sm" variant="brand" icon={<Save className="h-3.5 w-3.5" />} onClick={handleSaveBank}>
            {bankSaved ? "Saved" : "Save payout account"}
          </Button>
        </div>
      </GlassCard>

      {subscription.status !== "none" && (
        <GlassCard padding="md" className="space-y-3">
          <p className="text-subhead font-bold text-ink">Subscription Management</p>
          {isActive ? (
            confirmCancel ? (
              <div className="space-y-2">
                <p className="text-caption text-ink-tertiary">Your membership will be cancelled at the end of the billing period.</p>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="danger" onClick={cancelSubscription}>Confirm cancellation</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>Keep my plan</Button>
                </div>
              </div>
            ) : (
              <Button type="button" size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirmCancel(true)}>
                Cancel subscription
              </Button>
            )
          ) : (
            <Button type="button" size="sm" variant="brand" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => onNavigate?.("membership")}>
              Reactivate membership
            </Button>
          )}
        </GlassCard>
      )}

      <p className="text-caption text-ink-tertiary">
        Upgrade or change plans on the{" "}
        <button
          type="button"
          onClick={() => onNavigate?.("membership")}
          className="text-brand font-semibold cursor-pointer hover:underline"
        >
          Membership page
        </button>
        .
      </p>
    </>
  );
}

function AppearanceSection({
  theme,
  onThemeChange,
  selectedCurrency,
  onCurrencyChange,
}: {
  theme: "light" | "dark" | "system";
  onThemeChange: (t: "light" | "dark" | "system") => void;
  selectedCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
}) {
  const options: { value: "light" | "dark" | "system"; label: string; desc: string }[] = [
    { value: "light", label: "Light", desc: "Bright, clean surfaces" },
    { value: "dark", label: "Dark", desc: "Easy on the eyes at night" },
    { value: "system", label: "System", desc: "Follow your device setting" },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-title font-bold text-ink">Appearance</p>
        <Badge variant="success" size="sm" dot>Live</Badge>
      </div>
      <div className="space-y-3">
        <p className="text-caption font-semibold text-ink-secondary">Theme</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onThemeChange(opt.value)}
              className={`p-3 rounded-[12px] cursor-pointer transition-colors text-left ${
                theme === opt.value ? "bg-brand/10 border border-brand/30" : "bg-surface/50 border border-transparent hover:bg-surface-secondary/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${theme === opt.value ? "border-brand" : "border-ink-quaternary"}`}>
                  {theme === opt.value && <span className="h-2 w-2 rounded-full bg-brand" />}
                </span>
                <span className="h-6 w-10 rounded-[8px] border border-glass-border overflow-hidden flex">
                  <span className={`flex-1 ${opt.value === "light" ? "bg-white" : "bg-[#2c2c2e]"}`} />
                  <span className={`flex-1 ${opt.value === "light" ? "bg-[#f5f5f7]" : "bg-[#1c1c1e]"}`} />
                </span>
              </div>
              <p className="text-subhead font-semibold text-ink">{opt.label}</p>
              <p className="text-caption text-ink-tertiary">{opt.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-caption text-ink-tertiary">Your theme applies instantly and syncs across devices.</p>

        <p className="text-caption font-semibold text-ink-secondary pt-2">Preferred Currency</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURRENCY_OPTIONS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onCurrencyChange(code)}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] text-left transition-colors ${
                selectedCurrency === code
                  ? "bg-brand/10 border border-brand/30"
                  : "bg-surface/50 border border-transparent hover:bg-surface-secondary/60"
              }`}
            >
              <span className="text-caption font-semibold text-ink">{code}</span>
              <span className="text-caption text-ink-tertiary truncate">{CURRENCY_NAMES[code]}</span>
            </button>
          ))}
        </div>
        <p className="text-caption text-ink-tertiary">Prices across the app are converted to your preferred currency.</p>
      </div>
    </>
  );
}

function IntegrationsSection() {
  const apiKey = useStore((s) => s.apiKey);
  const rotateApiKey = useStore((s) => s.rotateApiKey);
  const webhooks = useStore((s) => s.webhooks);
  const addWebhook = useStore((s) => s.addWebhook);
  const removeWebhook = useStore((s) => s.removeWebhook);
  const testWebhook = useStore((s) => s.testWebhook);
  const addNotification = useStore((s) => s.addNotification);

  const [copied, setCopied] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const EVENT_OPTIONS = [
    { key: "order.created", label: "Order created" },
    { key: "payment.received", label: "Payment received" },
    { key: "shipment.updated", label: "Shipment updated" },
    { key: "inventory.low", label: "Low inventory" },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(apiKey);
      } else {
        const ta = document.createElement("textarea");
        ta.value = apiKey;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      // clipboard unavailable — ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleRotate = () => {
    const key = rotateApiKey();
    addNotification({ title: "API key rotated", body: "A new live API key was generated.", type: "system" });
    setConfirmRotate(false);
    try {
      if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(key);
    } catch {
      // clipboard unavailable — ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    if (!name.trim()) {
      setFormMsg({ ok: false, text: "Give your webhook a name." });
      return;
    }
    let parsed: string;
    try {
      parsed = new URL(url.trim()).toString();
    } catch {
      setFormMsg({ ok: false, text: "Enter a valid webhook URL (https://...)." });
      return;
    }
    if (parsed.startsWith("http://")) {
      setFormMsg({ ok: false, text: "Webhooks must use HTTPS." });
      return;
    }
    if (events.length === 0) {
      setFormMsg({ ok: false, text: "Select at least one event." });
      return;
    }
    addWebhook({ name: name.trim(), url: parsed, events });
    addNotification({ title: "Webhook added", body: `${name.trim()} is now receiving ${events.length} event(s).`, type: "system" });
    setName("");
    setUrl("");
    setEvents([]);
    setShowNew(false);
  };

  const toggleEvent = (key: string) => {
    setEvents((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const formatTime = (t?: string) => {
    if (!t) return "Never";
    try {
      return new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return t;
    }
  };

  return (
    <>
      <p className="text-title font-bold text-ink">API & Integrations</p>

      <GlassCard padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-subhead font-semibold text-ink">Live API Key</p>
            <p className="text-caption text-ink-tertiary">Use this key to authenticate API requests</p>
          </div>
          <Badge variant="success" size="sm" dot>Active</Badge>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-caption text-ink-secondary font-mono bg-surface-secondary/60 rounded-[8px] px-3 py-2 truncate">{apiKey}</code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy API key"
            className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-success" strokeWidth={1.5} /> : <Copy className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {confirmRotate ? (
            <>
              <p className="text-caption text-ink-tertiary">Rotate the key? Existing integrations using it will break.</p>
              <Button type="button" size="sm" variant="danger" onClick={handleRotate}>Yes, rotate</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRotate(false)}>Cancel</Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="ghost" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => setConfirmRotate(true)}>
              Rotate key
            </Button>
          )}
        </div>
        <p className="text-caption text-ink-tertiary">
          Base URL: <code className="font-mono text-ink-secondary">https://birichinex.com/api/v1</code>
        </p>
      </GlassCard>

      <GlassCard padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-subhead font-bold text-ink">Webhooks</p>
            <p className="text-caption text-ink-tertiary">Forward events to your own servers</p>
          </div>
          {!showNew && (
            <Button type="button" size="sm" variant="brand" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => { setShowNew(true); setFormMsg(null); }}>
              New webhook
            </Button>
          )}
        </div>

        {showNew && (
          <form onSubmit={handleCreate} className="space-y-3 p-4 rounded-[12px] bg-surface/50 border border-glass-border">
            <div>
              <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Order notifications"
                className="w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
              />
            </div>
            <div>
              <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Endpoint URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
              />
            </div>
            <div>
              <label className="text-caption font-semibold text-ink-secondary mb-1.5 block">Events</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EVENT_OPTIONS.map((ev) => (
                  <button
                    key={ev.key}
                    type="button"
                    onClick={() => toggleEvent(ev.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-left transition-colors ${
                      events.includes(ev.key) ? "bg-brand/10 border border-brand/30" : "bg-surface/60 border border-transparent hover:bg-surface-secondary/60"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors ${events.includes(ev.key) ? "border-brand bg-brand" : "border-ink-quaternary"}`}
                    >
                      {events.includes(ev.key) && <Check className="h-3 w-3 text-ink" strokeWidth={2.5} />}
                    </span>
                    <span className="text-caption font-semibold text-ink">{ev.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {formMsg && (
              <span className={`text-caption font-semibold flex items-center gap-1 ${formMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {formMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> : <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {formMsg.text}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" icon={<Plus className="h-3.5 w-3.5" />}>Create webhook</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {webhooks.length === 0 ? (
          <p className="text-caption text-ink-quaternary">No webhooks configured yet. Create one to start receiving events.</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-surface/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      hook.lastStatus === "success" ? "bg-emerald-500/10 text-emerald-400" : hook.lastStatus === "failed" ? "bg-red-500/10 text-red-400" : "bg-brand/10 text-brand"
                    }`}
                  >
                    {hook.lastStatus === "success" ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                    ) : hook.lastStatus === "failed" ? (
                      <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <WebhookIcon className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-caption font-semibold text-ink truncate">{hook.name}</p>
                      <Badge variant={hook.lastStatus === "success" ? "success" : hook.lastStatus === "failed" ? "error" : "default"} size="sm">
                        {hook.lastStatus === "success" ? "Healthy" : hook.lastStatus === "failed" ? "Failing" : "Idle"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-ink-tertiary truncate">{hook.url}</p>
                    <p className="text-[11px] text-ink-quaternary">
                      {hook.events.length} event(s) · Last ping {formatTime(hook.lastPing)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button type="button" size="sm" variant="ghost" onClick={() => testWebhook(hook.id)}>
                    Test
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => {
                      removeWebhook(hook.id);
                      addNotification({ title: "Webhook removed", body: `${hook.name} was deleted.`, type: "system" });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </>
  );
}

function SupportSection() {
  return (
    <>
      <p className="text-title font-bold text-ink">Support</p>
      <div className="space-y-3">
        <CloudStorageCard />
        <a
          href="https://docs.birichinex.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-[12px] bg-surface/50 hover:bg-surface-secondary/60 transition-colors"
        >
          <p className="text-subhead font-semibold text-ink">Help Center</p>
          <p className="text-caption text-ink-tertiary">Browse documentation and FAQs at docs.birichinex.com</p>
        </a>
        <a
          href="mailto:support@birichinex.com"
          className="block p-3 rounded-[12px] bg-surface/50 hover:bg-surface-secondary/60 transition-colors"
        >
          <p className="text-subhead font-semibold text-ink">Email Support</p>
          <p className="text-caption text-ink-tertiary">support@birichinex.com</p>
        </a>
        <div className="block p-3 rounded-[12px] bg-surface/50">
          <p className="text-subhead font-semibold text-ink">Phone</p>
          <p className="text-caption text-ink-tertiary">Your BirichiNex account manager — set once a contact line is published</p>
        </div>
      </div>
    </>
  );
}
