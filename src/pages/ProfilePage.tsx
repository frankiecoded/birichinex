import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  Clock,
  Award,
  Star,
  Edit3,
  Check,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Crown,
  CreditCard,
  Activity,
  Save,
  ShoppingBag,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { MEMBERSHIP_TIERS, LOYALTY_CONFIG, formatPrice } from "../data/platform";
import type { Currency, MembershipTier } from "../types";

interface ProfilePageProps {
  onNavigate?: (view: string) => void;
}

const TIER_COLORS: Record<string, { badge: "default" | "success" | "warning" | "info" | "brand"; label: string }> = {
  silver: { badge: "default", label: "Silver" },
  gold: { badge: "warning", label: "Gold" },
  platinum: { badge: "info", label: "Platinum" },
  enterprise: { badge: "brand", label: "Enterprise" },
};

const LOYALTY_TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

const LOYALTY_TIER_COLORS: Record<string, "default" | "success" | "warning" | "info"> = {
  bronze: "default",
  silver: "success",
  gold: "warning",
  platinum: "info",
};

const LANGUAGES = ["English", "Swahili", "French", "Arabic"];
const TIMEZONES = ["Africa/Dar_es_Salaam", "Africa/Nairobi", "Africa/Kampala", "Africa/Lagos", "Africa/Accra", "Africa/Johannesburg", "UTC"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY"];

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const user = useStore((s) => s.user);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const loyalty = useStore((s) => s.loyalty);
  const currentTier = useStore((s) => s.currentTier);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const logout = useStore((s) => s.logout);
  const users = useStore((s) => s.users);
  const sessions = useStore((s) => s.sessions);
  const revokeSession = useStore((s) => s.revokeSession);
  const notifications = useStore((s) => s.notifications);

  const activityFeed = useMemo(() => {
    const iconFor = (type: string) =>
      type === "payment"
        ? CreditCard
        : type === "order"
        ? ShoppingBag
        : type === "call"
        ? Phone
        : type === "lead"
        ? User
        : type === "system"
        ? Settings
        : Bell;
    const colorFor = (type: string) =>
      type === "payment"
        ? "text-success"
        : type === "call" || type === "lead"
        ? "text-info"
        : "text-ink-secondary";
    return [...notifications]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 12)
      .map((n) => ({
        id: n.id,
        icon: iconFor(n.type),
        color: colorFor(n.type),
        text: n.title,
        time: new Date(n.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      }));
  }, [notifications]);
  const changePassword = useStore((s) => s.changePassword);
  const enableTwoFactor = useStore((s) => s.enableTwoFactor);
  const disableTwoFactor = useStore((s) => s.disableTwoFactor);

  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences" | "subscription" | "activity" | "loyalty">("personal");
  const [profileForm, setProfileForm] = useState({
    name: settings.profile.name,
    email: settings.profile.email,
    phone: settings.profile.phone,
    company: settings.profile.company,
    address: settings.profile.address ?? "",
    city: settings.profile.city ?? "",
    country: settings.profile.country ?? "",
    role: settings.profile.role ?? "",
    businessRegNo: settings.profile.businessRegNo ?? "",
    taxId: settings.profile.taxId ?? "",
    industry: settings.profile.industry ?? "",
    employeeCount: settings.profile.employeeCount ?? "",
    website: settings.profile.website ?? "",
  });
  const [notifForm, setNotifForm] = useState({ ...settings.notifications });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFactorFlow, setTwoFactorFlow] = useState<"off" | "setup" | "disable">("off");
  const [twoFactorPin, setTwoFactorPin] = useState("");
  const [twoFactorPinConfirm, setTwoFactorPinConfirm] = useState("");
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showDateFormatDropdown, setShowDateFormatDropdown] = useState(false);

  const accountKey = user?.email.trim().toLowerCase();
  const account = accountKey ? users[accountKey] : undefined;
  const twoFactorEnabled = !!account?.twoFactorCode;

  const handleRevokeSession = (id: string) => {
    revokeSession(id);
    flashSaved("Session revoked");
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    const res = changePassword(passwordForm.current, passwordForm.newPass);
    if (!res.ok) {
      setPasswordError(res.error ?? "Unable to update password.");
      return;
    }
    setPasswordSuccess(true);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleEnableTwoFactor = () => {
    setTwoFactorMsg(null);
    if (!/^\d{6}$/.test(twoFactorPin.trim())) {
      setTwoFactorMsg({ ok: false, text: "Enter a 6-digit code." });
      return;
    }
    if (twoFactorPin.trim() !== twoFactorPinConfirm.trim()) {
      setTwoFactorMsg({ ok: false, text: "Codes don't match." });
      return;
    }
    const res = enableTwoFactor(twoFactorPin);
    setTwoFactorMsg(res.ok ? { ok: true, text: "Two-factor authentication enabled." } : { ok: false, text: res.error ?? "Unable to enable 2FA." });
    if (res.ok) {
      setTwoFactorFlow("off");
      setTwoFactorPin("");
      setTwoFactorPinConfirm("");
      flashSaved("Two-factor authentication enabled");
    }
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorMsg(null);
    const res = disableTwoFactor(twoFactorPin);
    setTwoFactorMsg(res.ok ? { ok: true, text: "Two-factor authentication disabled." } : { ok: false, text: res.error ?? "Unable to disable 2FA." });
    if (res.ok) {
      setTwoFactorFlow("off");
      setTwoFactorPin("");
      setTwoFactorPinConfirm("");
      flashSaved("Two-factor authentication disabled");
    }
  };

  const tierConfig = MEMBERSHIP_TIERS.find((t) => t.tier === currentTier);
  const loyaltyTierConfig = LOYALTY_CONFIG.tiers[loyalty.currentTier];
  const initials = profileForm.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const flashSaved = (message: string = "Changes saved") => {
    setSavedMessage(message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveProfile = () => {
    updateSettings({
      profile: {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        company: profileForm.company,
        city: profileForm.city,
        country: profileForm.country,
        address: profileForm.address,
        role: profileForm.role,
        businessRegNo: profileForm.businessRegNo,
        taxId: profileForm.taxId,
        industry: profileForm.industry,
        employeeCount: profileForm.employeeCount,
        website: profileForm.website,
      },
    });
    flashSaved("Profile updated");
  };

  const handleSaveNotifications = () => {
    updateSettings({ notifications: notifForm });
    flashSaved("Notification preferences saved");
  };

  const tabs = [
    { id: "personal" as const, label: "Personal Info", icon: User },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "preferences" as const, label: "Preferences", icon: Settings },
    { id: "subscription" as const, label: "Subscription", icon: CreditCard },
    { id: "activity" as const, label: "Activity", icon: Activity },
    { id: "loyalty" as const, label: "Loyalty", icon: Award },
  ];

  const inputClass =
    "w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-ink text-[15px] placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all";

  const labelClass = "text-[13px] font-semibold text-ink-secondary mb-1.5 block";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <CursorSpotlight spotlightSize={600} spotlightColor="rgba(212,175,55,0.03)">
        <div className="relative">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] blur-[40px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[32px] font-bold text-ink tracking-tight">
              <span className="text-gradient-brand">My Profile</span>
            </h1>
            <p className="text-[15px] text-ink-tertiary mt-1">
              Manage your account, security, and platform preferences.
            </p>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <TiltCard intensity={4}>
              <GlassCard variant="light" padding="lg" className="chromatic-edge">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="h-[88px] w-[88px] rounded-[22px] bg-gradient-to-br from-brand/30 via-brand/20 to-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_4px_24px_rgba(212,175,55,0.15)]">
                      <span className="text-[28px] font-bold text-brand-dark">{initials}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-white flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-[22px] font-bold text-ink">{profileForm.name}</h2>
                      <Badge
                        variant={TIER_COLORS[currentTier]?.badge ?? "default"}
                        size="md"
                        dot
                      >
                        <Crown className="h-3 w-3" />
                        {TIER_COLORS[currentTier]?.label ?? currentTier}
                      </Badge>
                    </div>
                    <p className="text-[15px] text-ink-secondary mt-0.5">{profileForm.email}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-[13px] text-ink-tertiary flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {profileForm.company}
                      </span>
                      {profileForm.phone && (
                        <span className="text-[13px] text-ink-tertiary flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {profileForm.phone}
                        </span>
                      )}
                      {profileForm.role && (
                        <span className="text-[13px] text-ink-tertiary flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {profileForm.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      {account?.createdAt && (
                        <span className="text-[12px] text-ink-quaternary flex items-center gap-1">
                          Member since {new Date(account.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                        </span>
                      )}
                      {account?.lastLogin && (
                        <span className="text-[12px] text-ink-quaternary flex items-center gap-1">
                          Last login {new Date(account.lastLogin).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <MagneticButton strength={0.15}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<LogOut className="h-4 w-4" />}
                        onClick={logout}
                      >
                        Sign Out
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        </div>
      </CursorSpotlight>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-brand/10 text-brand-dark border border-brand/20"
                  : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-secondary/40 border border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "personal" && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard padding="lg" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Personal Information</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Update your personal details and contact information.</p>
                </div>
                <Edit3 className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                  </label>
                  <input
                    className={inputClass}
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Company</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    className={inputClass}
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    className={inputClass}
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Role / Title</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    placeholder="e.g. Founder, CEO, Manager"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Business Registration No.</span>
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.businessRegNo}
                    onChange={(e) => setProfileForm({ ...profileForm, businessRegNo: e.target.value })}
                    placeholder="e.g. PVT-2026-00123"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tax ID / PIN</label>
                  <input
                    className={inputClass}
                    value={profileForm.taxId}
                    onChange={(e) => setProfileForm({ ...profileForm, taxId: e.target.value })}
                    placeholder="Tax identification number"
                  />
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <input
                    className={inputClass}
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    placeholder="e.g. Electronics, Fashion, Agriculture"
                  />
                </div>
                <div>
                  <label className={labelClass}>Team Size</label>
                  <input
                    className={inputClass}
                    value={profileForm.employeeCount}
                    onChange={(e) => setProfileForm({ ...profileForm, employeeCount: e.target.value })}
                    placeholder="e.g. 1-10, 11-50, 50+"
                  />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input
                    className={inputClass}
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <MagneticButton strength={0.12}>
                  <Button
                    variant="brand"
                    size="md"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </MagneticButton>
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      <Badge variant="success" size="md" dot>{savedMessage}</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Change Password</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Update your account password regularly for security.</p>
                </div>
                <Lock className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="space-y-3 max-w-md">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input
                      className={inputClass}
                      type={showCurrentPass ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-quaternary hover:text-ink-secondary transition-colors"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input
                      className={inputClass}
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-quaternary hover:text-ink-secondary transition-colors"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    className={inputClass}
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[13px] text-error font-medium"
                  >
                    {passwordError}
                  </motion.p>
                )}
                {passwordSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[13px] text-success font-medium"
                  >
                    Password updated successfully.
                  </motion.p>
                )}
              </AnimatePresence>

              <MagneticButton strength={0.12}>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Lock className="h-4 w-4" />}
                  onClick={handlePasswordChange}
                >
                  Update Password
                </Button>
              </MagneticButton>
            </GlassCard>

            {/* Two-Factor Authentication */}
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[12px] bg-surface-secondary/80 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-ink-secondary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-ink">Two-Factor Authentication</h3>
                    <p className="text-[13px] text-ink-tertiary">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorMsg(null);
                    setTwoFactorPin("");
                    setTwoFactorPinConfirm("");
                    setTwoFactorFlow(twoFactorEnabled ? "disable" : "setup");
                  }}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    twoFactorEnabled ? "bg-brand" : "bg-surface-secondary"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[13px] text-ink-tertiary">
                {twoFactorEnabled
                  ? "Two-factor authentication is enabled. You'll be prompted for a verification code on sign-in."
                  : "Protect your account with an additional verification step during sign-in."}
              </p>
              {twoFactorEnabled && (
                <Badge variant="success" size="md" dot>Active</Badge>
              )}
              {twoFactorFlow === "setup" && !twoFactorEnabled && (
                <div className="space-y-3 max-w-md">
                  <p className="text-[13px] text-ink-tertiary">Choose a 6-digit PIN you'll enter at sign-in.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className={inputClass}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={twoFactorPin}
                      onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit PIN"
                    />
                    <input
                      className={inputClass}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={twoFactorPinConfirm}
                      onChange={(e) => setTwoFactorPinConfirm(e.target.value.replace(/\D/g, ""))}
                      placeholder="Confirm PIN"
                    />
                  </div>
                  {twoFactorMsg && (
                    <p className={`text-[13px] font-medium ${twoFactorMsg.ok ? "text-success" : "text-error"}`}>{twoFactorMsg.text}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={handleEnableTwoFactor}>Activate 2FA</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setTwoFactorFlow("off"); setTwoFactorMsg(null); }}>Cancel</Button>
                  </div>
                </div>
              )}
              {twoFactorFlow === "disable" && twoFactorEnabled && (
                <div className="space-y-3 max-w-md">
                  <p className="text-[13px] text-ink-tertiary">Enter your 6-digit PIN to disable two-factor authentication.</p>
                  <input
                    className={inputClass}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorPin}
                    onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit PIN"
                  />
                  {twoFactorMsg && (
                    <p className={`text-[13px] font-medium ${twoFactorMsg.ok ? "text-success" : "text-error"}`}>{twoFactorMsg.text}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button variant="danger" size="sm" onClick={handleDisableTwoFactor}>Disable 2FA</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setTwoFactorFlow("off"); setTwoFactorMsg(null); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Active Sessions */}
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Active Sessions</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Devices currently signed into your account.</p>
                </div>
                <Clock className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-[13px] text-ink-tertiary">No active sessions.</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-[12px] bg-surface/50 border border-glass-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${session.current ? "bg-success" : "bg-ink-quaternary"}`} />
                        <div>
                          <p className="text-[15px] font-semibold text-ink">{session.device}</p>
                          <p className="text-[13px] text-ink-tertiary">
                            {session.location} ·{" "}
                            {(() => {
                              try {
                                return new Date(session.lastActive).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
                              } catch {
                                return session.lastActive;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      {session.current ? (
                        <Badge variant="success" size="sm">Current</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<X className="h-3.5 w-3.5" />}
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "preferences" && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Language & Region */}
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Language & Region</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Set your preferred language, timezone, and date format.</p>
                </div>
                <Globe className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Language */}
                <div className="relative">
                  <label className={labelClass}>Language</label>
                  <button
                    onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowTimezoneDropdown(false); setShowDateFormatDropdown(false); }}
                    className={`${inputClass} flex items-center justify-between text-left`}
                  >
                    <span>{language}</span>
                    <ChevronRight className="h-4 w-4 text-ink-quaternary rotate-90" />
                  </button>
                  <AnimatePresence>
                    {showLanguageDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 top-full left-0 right-0 mt-1 glass-material rounded-[12px] border border-glass-border shadow-lg overflow-hidden"
                      >
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => { setLanguage(lang); setShowLanguageDropdown(false); }}
                            className={`w-full text-left px-3 py-2.5 text-[15px] transition-colors ${
                              language === lang
                                ? "bg-brand/10 text-brand-dark font-semibold"
                                : "text-ink hover:bg-surface-secondary/60"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Timezone */}
                <div className="relative">
                  <label className={labelClass}>Timezone</label>
                  <button
                    onClick={() => { setShowTimezoneDropdown(!showTimezoneDropdown); setShowLanguageDropdown(false); setShowDateFormatDropdown(false); }}
                    className={`${inputClass} flex items-center justify-between text-left`}
                  >
                    <span className="truncate text-[13px]">{timezone}</span>
                    <ChevronRight className="h-4 w-4 text-ink-quaternary rotate-90 shrink-0" />
                  </button>
                  <AnimatePresence>
                    {showTimezoneDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 top-full left-0 right-0 mt-1 glass-material rounded-[12px] border border-glass-border shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                      >
                        {TIMEZONES.map((tz) => (
                          <button
                            key={tz}
                            onClick={() => { setTimezone(tz); setShowTimezoneDropdown(false); }}
                            className={`w-full text-left px-3 py-2.5 text-[13px] font-mono transition-colors ${
                              timezone === tz
                                ? "bg-brand/10 text-brand-dark font-semibold"
                                : "text-ink hover:bg-surface-secondary/60"
                            }`}
                          >
                            {tz}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date Format */}
                <div className="relative">
                  <label className={labelClass}>Date Format</label>
                  <button
                    onClick={() => { setShowDateFormatDropdown(!showDateFormatDropdown); setShowLanguageDropdown(false); setShowTimezoneDropdown(false); }}
                    className={`${inputClass} flex items-center justify-between text-left`}
                  >
                    <span>{dateFormat}</span>
                    <ChevronRight className="h-4 w-4 text-ink-quaternary rotate-90" />
                  </button>
                  <AnimatePresence>
                    {showDateFormatDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 top-full left-0 right-0 mt-1 glass-material rounded-[12px] border border-glass-border shadow-lg overflow-hidden"
                      >
                        {DATE_FORMATS.map((df) => (
                          <button
                            key={df}
                            onClick={() => { setDateFormat(df); setShowDateFormatDropdown(false); }}
                            className={`w-full text-left px-3 py-2.5 text-[15px] transition-colors ${
                              dateFormat === df
                                ? "bg-brand/10 text-brand-dark font-semibold"
                                : "text-ink hover:bg-surface-secondary/60"
                            }`}
                          >
                            {df}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </GlassCard>

            {/* Notification Preferences */}
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Notification Preferences</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Choose how you want to be notified.</p>
                </div>
                <Bell className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                {([
                  { key: "email" as const, label: "Email Notifications", desc: "Receive updates and alerts via email", icon: Mail },
                  { key: "push" as const, label: "Push Notifications", desc: "Browser and mobile push alerts", icon: Bell },
                  { key: "sms" as const, label: "SMS Notifications", desc: "Text message alerts for critical events", icon: Phone },
                ]).map((t) => (
                  <div key={t.key} className="flex items-center justify-between p-3 rounded-[12px] bg-surface/50 border border-glass-border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center">
                        <t.icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{t.label}</p>
                        <p className="text-[13px] text-ink-tertiary">{t.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifForm({ ...notifForm, [t.key]: !notifForm[t.key] })}
                      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                        notifForm[t.key] ? "bg-brand" : "bg-surface-secondary"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          notifForm[t.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <MagneticButton strength={0.12}>
                  <Button
                    variant="brand"
                    size="md"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSaveNotifications}
                  >
                    Save Preferences
                  </Button>
                </MagneticButton>
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      <Badge variant="success" size="md" dot>{savedMessage}</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "subscription" && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <TiltCard intensity={5}>
              <GlassCard variant="brand" padding="lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[16px] bg-brand/20 flex items-center justify-center">
                      <Crown className="h-7 w-7 text-brand-dark" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-bold text-ink">{tierConfig?.label ?? currentTier}</h3>
                        <Badge variant="brand" size="sm" dot>Current Plan</Badge>
                      </div>
                      <p className="text-[13px] text-ink-tertiary mt-0.5">
                        {tierConfig?.monthlyPrice !== null && tierConfig?.monthlyPrice !== undefined
                          ? `${formatPrice(tierConfig.monthlyPrice, selectedCurrency, "USD")}/month`
                          : "Custom Pricing"}
                      </p>
                    </div>
                  </div>
                  <MagneticButton strength={0.15}>
                    <Button
                      variant="primary"
                      size="md"
                      icon={<ChevronRight className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={() => onNavigate?.("membership")}
                    >
                      Manage Membership
                    </Button>
                  </MagneticButton>
                </div>
              </GlassCard>
            </TiltCard>

            {/* Plan Details */}
            <GlassCard padding="lg" className="space-y-4">
              <h3 className="text-[17px] font-bold text-ink">Plan Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-[12px] bg-surface/50 border border-glass-border">
                  <p className="text-[13px] text-ink-tertiary">Team Members</p>
                  <p className="text-[17px] font-bold text-ink mt-1">
                    {tierConfig?.maxTeamMembers === -1 ? "Unlimited" : tierConfig?.maxTeamMembers ?? 1}
                  </p>
                </div>
                <div className="p-3 rounded-[12px] bg-surface/50 border border-glass-border">
                  <p className="text-[13px] text-ink-tertiary">Storage</p>
                  <p className="text-[17px] font-bold text-ink mt-1">{tierConfig?.storageGB ?? 1}GB</p>
                </div>
                <div className="p-3 rounded-[12px] bg-surface/50 border border-glass-border">
                  <p className="text-[13px] text-ink-tertiary">Support Level</p>
                  <p className="text-[17px] font-bold text-ink mt-1 capitalize">{tierConfig?.supportLevel ?? "community"}</p>
                </div>
              </div>
            </GlassCard>

            {/* Upgrade Options */}
            <GlassCard padding="lg" className="space-y-4">
              <h3 className="text-[17px] font-bold text-ink">Upgrade Options</h3>
              <p className="text-[13px] text-ink-tertiary">Choose a plan that fits your business growth stage.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MEMBERSHIP_TIERS.filter((t) => t.tier !== currentTier).slice(0, 2).map((tier) => {
                  const isUpgrade = MEMBERSHIP_TIERS.findIndex((t) => t.tier === tier.tier) > MEMBERSHIP_TIERS.findIndex((t) => t.tier === currentTier);
                  return (
                    <div key={tier.tier} className="p-4 rounded-[14px] bg-surface/50 border border-glass-border flex flex-col justify-between">
                      <div>
                        <Badge variant={isUpgrade ? "brand" : "default"} size="sm" className="mb-2">
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </Badge>
                        <p className="text-[15px] font-bold text-ink">{tier.label}</p>
                        <p className="text-[13px] text-ink-tertiary mt-1">
                          {tier.monthlyPrice !== null
                            ? `${formatPrice(tier.monthlyPrice, selectedCurrency, "USD")}/month`
                            : "Custom Pricing"}
                        </p>
                      </div>
                      <MagneticButton strength={0.12} className="mt-3">
                        <Button
                          variant={tier.tier === "enterprise" ? "secondary" : isUpgrade ? "brand" : "secondary"}
                          size="sm"
                          fullWidth
                          onClick={() => onNavigate?.("membership")}
                        >
                          {tier.tier === "enterprise" ? "Contact Sales" : isUpgrade ? "Upgrade" : "Downgrade"}
                        </Button>
                      </MagneticButton>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">Recent Activity</h3>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">Your recent sign-ins, actions, and loyalty events.</p>
                </div>
                <Activity className="h-5 w-5 text-ink-quaternary" strokeWidth={1.5} />
              </div>

              <div className="space-y-1">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8 text-ink-tertiary text-caption">
                    No activity yet. Calls, orders, and payments will appear here.
                  </div>
                ) : (
                activityFeed.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="flex items-start gap-3 py-3 border-b border-glass-border last:border-0"
                  >
                    <div className={`h-8 w-8 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0 mt-0.5`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-ink">{item.text}</p>
                      <p className="text-[13px] text-ink-quaternary mt-0.5">{item.time}</p>
                    </div>
                  </motion.div>
                ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "loyalty" && (
          <motion.div
            key="loyalty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Points Balance */}
            <TiltCard intensity={5}>
              <GlassCard variant="brand" padding="lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-5 w-5 text-brand-dark" />
                      <h3 className="text-[17px] font-bold text-ink">Loyalty Points</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[36px] font-bold text-ink">{loyalty.points.toLocaleString()}</span>
                      <span className="text-[13px] text-ink-tertiary">points available</span>
                    </div>
                    <p className="text-[13px] text-ink-tertiary mt-1">
                      ≈ {formatPrice(loyalty.points * LOYALTY_CONFIG.pointsToKES, selectedCurrency)} value
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={LOYALTY_TIER_COLORS[loyalty.currentTier]} size="lg" dot>
                      {LOYALTY_TIER_LABELS[loyalty.currentTier]} Tier
                    </Badge>
                    <MagneticButton strength={0.12}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate?.("loyalty")}
                        icon={<ChevronRight className="h-4 w-4" />}
                        iconPosition="right"
                      >
                        View Loyalty Hub
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </TiltCard>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassCard padding="md" className="text-center">
                <p className="text-[13px] text-ink-tertiary">Total Earned</p>
                <p className="text-[20px] font-bold text-ink mt-1">{loyalty.totalEarned.toLocaleString()}</p>
              </GlassCard>
              <GlassCard padding="md" className="text-center">
                <p className="text-[13px] text-ink-tertiary">Total Redeemed</p>
                <p className="text-[20px] font-bold text-ink mt-1">{loyalty.totalRedeemed.toLocaleString()}</p>
              </GlassCard>
              <GlassCard padding="md" className="text-center">
                <p className="text-[13px] text-ink-tertiary">Earn Rate</p>
                <p className="text-[20px] font-bold text-brand-dark mt-1">{loyaltyTierConfig.multiplier}x</p>
              </GlassCard>
            </div>

            {/* How to Earn */}
            <GlassCard padding="lg" className="space-y-4">
              <h3 className="text-[17px] font-bold text-ink">How to Earn Points</h3>
              <div className="space-y-2">
                {[
                  { action: "Purchase on Marketplace", points: `${LOYALTY_CONFIG.pointsPer150KES} point per ${formatPrice(150, selectedCurrency)}`, icon: CreditCard },
                  { action: "Complete a Course", points: "50–200 bonus points", icon: Award },
                  { action: "Refer a Business", points: "500 points per referral", icon: User },
                  { action: "Write a Review", points: "25 points per review", icon: Star },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between p-3 rounded-[12px] bg-surface/50 border border-glass-border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-[8px] bg-brand/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-brand-dark" strokeWidth={1.5} />
                      </div>
                      <p className="text-[15px] font-semibold text-ink">{item.action}</p>
                    </div>
                    <p className="text-[13px] text-ink-secondary font-medium">{item.points}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Redemption History */}
            <GlassCard padding="lg" className="space-y-4">
              <h3 className="text-[17px] font-bold text-ink">Points History</h3>
              {loyalty.history.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-8 w-8 text-ink-quaternary mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[15px] text-ink-tertiary">No loyalty activity yet.</p>
                  <p className="text-[13px] text-ink-quaternary mt-1">Start shopping to earn points!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {loyalty.history.slice(0, 10).map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="flex items-center justify-between py-2.5 border-b border-glass-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-[8px] flex items-center justify-center ${
                          tx.type === "earn" ? "bg-success/10" : tx.type === "redeem" ? "bg-warning/10" : "bg-surface-secondary/80"
                        }`}>
                          {tx.type === "earn" ? (
                            <Star className="h-3.5 w-3.5 text-success" />
                          ) : tx.type === "redeem" ? (
                            <CreditCard className="h-3.5 w-3.5 text-warning" />
                          ) : (
                            <Award className="h-3.5 w-3.5 text-ink-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] text-ink">{tx.description}</p>
                          <p className="text-[12px] text-ink-quaternary">
                            {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[14px] font-bold ${tx.points >= 0 ? "text-success" : "text-warning"}`}>
                        {tx.points >= 0 ? "+" : ""}{tx.points.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away handler for dropdowns */}
      {(showLanguageDropdown || showTimezoneDropdown || showDateFormatDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setShowLanguageDropdown(false); setShowTimezoneDropdown(false); setShowDateFormatDropdown(false); }}
        />
      )}
    </div>
  );
}
