import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, Search, Phone, Mail, MapPin,
  ArrowUpRight, Filter, MoreHorizontal, Trash2, X,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";

const STATUS_STYLES = {
  active: { variant: "success" as const, label: "Active" },
  lead: { variant: "info" as const, label: "Lead" },
  inactive: { variant: "default" as const, label: "Inactive" },
};

const FILTER_OPTIONS = ["all", "active", "lead", "inactive"] as const;

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

const EMPTY_FORM: ContactForm = { name: "", email: "", phone: "", company: "", role: "" };

export default function CRMPage() {
  const contacts = useStore((s) => s.contacts);
  const addContact = useStore((s) => s.addContact);
  const deleteContact = useStore((s) => s.deleteContact);
  const searchQuery = useStore((s) => s.contactSearchQuery);
  const setSearchQuery = useStore((s) => s.setContactSearchQuery);
  const filter = useStore((s) => s.contactFilter);
  const setFilter = useStore((s) => s.setContactFilter);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== "all") {
      list = list.filter((c) => c.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }
    return list;
  }, [contacts, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const active = contacts.filter((c) => c.status === "active").length;
    const leads = contacts.filter((c) => c.status === "lead").length;
    const thisMonth = contacts.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return [
      { label: "Total Contacts", value: String(total) },
      { label: "Active Customers", value: String(active) },
      { label: "Leads", value: String(leads) },
      { label: "This Month", value: `+${thisMonth}` },
    ];
  }, [contacts]);

  const cycleFilter = () => {
    const idx = FILTER_OPTIONS.indexOf(filter as (typeof FILTER_OPTIONS)[number]);
    setFilter(FILTER_OPTIONS[(idx + 1) % FILTER_OPTIONS.length]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addContact({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      status: "lead",
      tags: [],
      notes: "",
      createdAt: new Date().toISOString(),
      lastContactAt: new Date().toISOString(),
    });
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-headline text-ink tracking-tight"><span className="text-gradient-brand">Customer Relationship Manager</span></h1>
          <p className="text-callout text-ink-tertiary mt-1">
            Manage your contacts, track leads, and grow your customer relationships.
          </p>
        </div>
        <MagneticButton strength={0.2}>
          <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Add Contact
          </Button>
        </MagneticButton>
      </motion.div>

      {/* Stats */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={5}>
                <GlassCard padding="md" hover>
                  <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      {/* Contact List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="none">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-subhead font-bold text-ink">Contacts</h3>
              <Badge variant="default" size="sm">{filtered.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
                <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                <input
                  placeholder="Search..."
                  className="bg-transparent text-caption text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[160px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={cycleFilter}
                className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center text-ink-secondary border border-glass-border hover:text-ink transition-colors"
              >
                <Filter className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-glass-border">
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-callout text-ink-quaternary">No contacts found</p>
              </div>
            )}
            {filtered.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-ink flex items-center justify-center shrink-0">
                  <span className="text-white text-caption font-bold">{contact.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-subhead font-bold text-ink truncate">{contact.name}</p>
                    <Badge variant={STATUS_STYLES[contact.status].variant} size="sm">
                      {STATUS_STYLES[contact.status].label}
                    </Badge>
                  </div>
                  <p className="text-caption text-ink-tertiary truncate">{contact.company} · {contact.role}</p>
                </div>
                <div className="hidden md:block text-right shrink-0">
                  <p className="text-caption text-ink-secondary">{contact.email}</p>
                  <p className="text-[10px] text-ink-quaternary">{contact.phone}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`tel:${contact.phone}`}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </a>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">Add Contact</h2>
                  <button onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="+255 ..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Company</label>
                      <input
                        value={form.company}
                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Company"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Role</label>
                      <input
                        value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Role"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Add Contact
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
