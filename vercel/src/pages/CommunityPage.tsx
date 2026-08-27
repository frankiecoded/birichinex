import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Plus,
  Search,
  X,
  Check,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  Send,
  ThumbsUp,
  Share2,
  Bookmark,
  AlertCircle,
  Building2,
  Handshake,
  Megaphone,
  Star,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import Modal from "../components/ui/Modal";
import { useStore } from "../store/useStore";
import { BirichiNexView } from "../types";

// ── Local Types ──────────────────────────────────────────────────────────────

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorCompany: string;
  likes: number;
  likedByUser: boolean;
  bookmarkedByUser: boolean;
  comments: CommunityComment[];
  createdAt: string;
}

interface CommunityComment {
  id: string;
  content: string;
  author: string;
  authorCompany: string;
  likes: number;
  likedByUser: boolean;
  createdAt: string;
}

interface Partnership {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerCompany: string;
  target: string;
  targetCompany: string;
  category: string;
  status: "proposed" | "active" | "expired" | "declined";
  createdAt: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerCompany: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  rsvpCount: number;
  rsvpByUser: boolean;
  maxAttendees: number;
  createdAt: string;
}

interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  owner: string;
  rating: number;
  memberSince: string;
  specialties: string[];
  connected: boolean;
}

interface ConnectionRequest {
  id: string;
  from: string;
  fromCompany: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

// ── Seed Data ────────────────────────────────────────────────────────────────

const POST_CATEGORIES = [
  "General",
  "Imports & Trade",
  "Partnerships",
  "Regulations",
  "Events & Workshops",
  "Tech & Innovation",
  "Marketplace",
  "Logistics",
];

const EVENT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Webinar",
  "Meetup",
  "Networking",
  "Training",
];

const BUSINESS_CATEGORIES = [
  "All",
  "Importers",
  "Exporters",
  "Manufacturers",
  "Retailers",
  "Tech",
  "Logistics",
  "Services",
];

const STATUS_BADGE: Record<string, { variant: "success" | "warning" | "error" | "info" | "default" }> = {
  proposed: { variant: "warning" },
  active: { variant: "success" },
  expired: { variant: "default" },
  declined: { variant: "error" },
  upcoming: { variant: "info" },
  ongoing: { variant: "success" },
  completed: { variant: "default" },
  cancelled: { variant: "error" },
  pending: { variant: "warning" },
  accepted: { variant: "success" },
};

const TABS = [
  { id: "forums" as const, label: "Forums", icon: MessageCircle },
  { id: "partnerships" as const, label: "Partnerships", icon: Handshake },
  { id: "events" as const, label: "Events", icon: Calendar },
  { id: "directory" as const, label: "Directory", icon: Building2 },
  { id: "networking" as const, label: "Networking", icon: Users },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateId(): string {
  return `cx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Component ────────────────────────────────────────────────────────────────

type Tab = "forums" | "partnerships" | "events" | "directory" | "networking";

interface CommunityPageProps {
  onNavigate?: (view: BirichiNexView) => void;
}

export default function CommunityPage({ onNavigate }: CommunityPageProps) {
  const { settings, user } = useStore();

  const currentUserName = user?.name ?? settings.profile.name;
  const currentUserCompany = settings.profile.company;

  // ── Tab State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("forums");

  // ── Forum State ──────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("All");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("General");
  const [newPostTags, setNewPostTags] = useState("");
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [expandedPost, setExpandedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Partnership State ────────────────────────────────────────────────────
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [partnershipSearch, setPartnershipSearch] = useState("");
  const [partnershipStatusFilter, setPartnershipStatusFilter] = useState("all");
  const [showNewPartnershipModal, setShowNewPartnershipModal] = useState(false);
  const [newPartnership, setNewPartnership] = useState({
    title: "",
    description: "",
    target: "",
    targetCompany: "",
    category: "Distribution",
  });

  // ── Event State ──────────────────────────────────────────────────────────
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "Workshop",
    date: "",
    time: "",
    location: "",
    maxAttendees: 50,
  });

  // ── Directory State ──────────────────────────────────────────────────────
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState("All");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);

  // ── Networking State ─────────────────────────────────────────────────────
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);
  const [messageTarget, setMessageTarget] = useState<BusinessProfile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // ── Stats Computed ───────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      activeMembers: 156,
      postsThisWeek: posts.filter((p) => {
        const d = new Date(p.createdAt);
        const now = new Date();
        return now.getTime() - d.getTime() < 7 * 86400000;
      }).length,
      upcomingEvents: events.filter((e) => e.status === "upcoming").length,
      activePartnerships: partnerships.filter((p) => p.status === "active").length,
    }),
    [posts, events, partnerships],
  );

  // ── Forum Handlers ───────────────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !postSearch ||
        p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(postSearch.toLowerCase()));
      const matchesCategory =
        postCategoryFilter === "All" || p.category === postCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [posts, postSearch, postCategoryFilter]);

  const handleCreatePost = useCallback(() => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const post: CommunityPost = {
      id: generateId(),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: newPostCategory,
      tags: newPostTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      author: currentUserName,
      authorCompany: currentUserCompany,
      likes: 0,
      likedByUser: false,
      bookmarkedByUser: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("General");
    setNewPostTags("");
    setShowNewPostModal(false);
  }, [newPostTitle, newPostContent, newPostCategory, newPostTags, currentUserName, currentUserCompany]);

  const handleUpdatePost = useCallback(() => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              title: editingPost.title,
              content: editingPost.content,
              category: editingPost.category,
              tags: editingPost.tags,
            }
          : p,
      ),
    );
    setEditingPost(null);
  }, [editingPost]);

  const handleDeletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    if (expandedPost?.id === id) setExpandedPost(null);
  }, [expandedPost]);

  const handleLikePost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likedByUser: !p.likedByUser, likes: p.likedByUser ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }, []);

  const handleBookmarkPost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmarkedByUser: !p.bookmarkedByUser } : p)),
    );
  }, []);

  const handleAddComment = useCallback(
    (postId: string) => {
      if (!commentText.trim()) return;
      const comment: CommunityComment = {
        id: generateId(),
        content: commentText.trim(),
        author: currentUserName,
        authorCompany: currentUserCompany,
        likes: 0,
        likedByUser: false,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
        ),
      );
      setCommentText("");
    },
    [commentText, currentUserName, currentUserCompany],
  );

  const handleLikeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? { ...c, likedByUser: !c.likedByUser, likes: c.likedByUser ? c.likes - 1 : c.likes + 1 }
                  : c,
              ),
            }
          : p,
      ),
    );
  }, []);

  // ── Partnership Handlers ─────────────────────────────────────────────────
  const filteredPartnerships = useMemo(() => {
    return partnerships.filter((p) => {
      const matchesSearch =
        !partnershipSearch ||
        p.title.toLowerCase().includes(partnershipSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(partnershipSearch.toLowerCase());
      const matchesStatus =
        partnershipStatusFilter === "all" || p.status === partnershipStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [partnerships, partnershipSearch, partnershipStatusFilter]);

  const handleCreatePartnership = useCallback(() => {
    if (!newPartnership.title.trim() || !newPartnership.description.trim()) return;
    const pt: Partnership = {
      id: generateId(),
      title: newPartnership.title.trim(),
      description: newPartnership.description.trim(),
      proposer: currentUserName,
      proposerCompany: currentUserCompany,
      target: newPartnership.target.trim() || "Open Proposal",
      targetCompany: newPartnership.targetCompany.trim() || "Any Partner",
      category: newPartnership.category,
      status: "proposed",
      createdAt: new Date().toISOString(),
    };
    setPartnerships((prev) => [pt, ...prev]);
    setNewPartnership({ title: "", description: "", target: "", targetCompany: "", category: "Distribution" });
    setShowNewPartnershipModal(false);
  }, [newPartnership, currentUserName, currentUserCompany]);

  const handleUpdatePartnershipStatus = useCallback((id: string, status: Partnership["status"]) => {
    setPartnerships((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const handleDeletePartnership = useCallback((id: string) => {
    setPartnerships((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Event Handlers ───────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        !eventSearch ||
        e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
        e.description.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesStatus =
        eventStatusFilter === "all" || e.status === eventStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, eventSearch, eventStatusFilter]);

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) return;
    const evt: CommunityEvent = {
      id: generateId(),
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      category: newEvent.category,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location.trim() || "TBD",
      organizer: currentUserName,
      organizerCompany: currentUserCompany,
      status: "upcoming",
      rsvpCount: 0,
      rsvpByUser: false,
      maxAttendees: newEvent.maxAttendees,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [evt, ...prev]);
    setNewEvent({ title: "", description: "", category: "Workshop", date: "", time: "", location: "", maxAttendees: 50 });
    setShowNewEventModal(false);
  }, [newEvent, currentUserName, currentUserCompany]);

  const handleRSVP = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              rsvpByUser: !e.rsvpByUser,
              rsvpCount: e.rsvpByUser ? e.rsvpCount - 1 : e.rsvpCount + 1,
            }
          : e,
      ),
    );
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Directory Handlers ───────────────────────────────────────────────────
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        !businessSearch ||
        b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
        b.description.toLowerCase().includes(businessSearch.toLowerCase()) ||
        b.specialties.some((s) => s.toLowerCase().includes(businessSearch.toLowerCase()));
      const matchesCategory =
        businessCategoryFilter === "All" || b.category === businessCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [businesses, businessSearch, businessCategoryFilter]);

  // ── Networking Handlers ──────────────────────────────────────────────────
  const handleAcceptConnection = useCallback((id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted" as const } : c)),
    );
  }, []);

  const handleDeclineConnection = useCallback((id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "declined" as const } : c)),
    );
  }, []);

  const handleSharePost = useCallback((id: string) => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setSharedPostId(id);
    window.setTimeout(() => setSharedPostId((prev) => (prev === id ? null : prev)), 2000);
  }, []);

  const handleRequestConnection = useCallback((bizId: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === bizId ? { ...b, connected: true } : b)));
    setSelectedBusiness((prev) => (prev?.id === bizId ? { ...prev, connected: true } : prev));
  }, []);

  const handleDisconnect = useCallback((bizId: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === bizId ? { ...b, connected: false } : b)));
    setSelectedBusiness((prev) => (prev?.id === bizId ? { ...prev, connected: false } : prev));
  }, []);

  const handleMessageOpen = useCallback((biz: BusinessProfile) => {
    setMessageTarget(biz);
    setMessageText("");
    setMessageSent(false);
  }, []);

  const handleMessageClose = useCallback(() => {
    setMessageTarget(null);
    setMessageSent(false);
  }, []);

  const handleMessageSend = useCallback(() => {
    if (!messageText.trim()) return;
    setMessageSent(true);
  }, [messageText]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard variant="dark" padding="xl" className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[60px] pointer-events-none animate-[orbFloat_20s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.1)_0%,transparent_70%)] blur-[50px] pointer-events-none animate-[orbFloatInverse_25s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative z-10 max-w-3xl">
            <Badge variant="brand" size="md" className="mb-4">
              Community
            </Badge>
            <h1 className="text-headline text-white mb-3 tracking-tight text-gradient-brand">
              Connect. Collaborate. Grow Together.
            </h1>
            <p className="text-callout text-zinc-400 mb-6">
              Join a thriving network of businesses across East Africa. Share insights, form partnerships, attend events, and build the future of trade together.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { label: "Active Members", value: stats.activeMembers, icon: Users },
                { label: "Posts This Week", value: stats.postsThisWeek, icon: MessageCircle },
                { label: "Upcoming Events", value: stats.upcomingEvents, icon: Calendar },
                { label: "Active Partnerships", value: stats.activePartnerships, icon: Handshake },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-[10px] bg-white/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-white/70" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-title font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-zinc-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex gap-1 p-1 glass-material rounded-[14px] w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-white/90 text-ink dark:bg-emphasis dark:text-on-emphasis shadow-sm"
                    : "text-ink-tertiary hover:text-ink-secondary hover:bg-white/40 dark:hover:bg-glass/70"
                }
              `}
            >
              <tab.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FORUMS TAB                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "forums" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
              />
            </div>
            <select
              value={postCategoryFilter}
              onChange={(e) => setPostCategoryFilter(e.target.value)}
              className="h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[13px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="All">All Categories</option>
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <MagneticButton>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowNewPostModal(true)}
              >
                New Post
              </Button>
            </MagneticButton>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CursorSpotlight>
                    <GlassCard padding="lg" hover>
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                            <span className="text-brand-dark font-bold text-sm">
                              {post.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-ink">{post.author}</p>
                            <p className="text-[12px] text-ink-quaternary">
                              {post.authorCompany} · {timeAgo(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default" size="sm">
                          {post.category}
                        </Badge>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-[15px] font-bold text-ink mb-2">{post.title}</h3>
                      <p className="text-[15px] text-ink-secondary leading-relaxed mb-3">
                        {post.content}
                      </p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-surface-secondary/60 text-[11px] font-medium text-ink-tertiary rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="glass-divider mb-3" />

                      {/* Post Actions */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Heart className={`h-4 w-4 ${post.likedByUser ? "fill-error text-error" : ""}`} />}
                          onClick={() => handleLikePost(post.id)}
                          className={post.likedByUser ? "text-error" : "text-ink-tertiary"}
                        >
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MessageCircle className="h-4 w-4" />}
                          onClick={() => setExpandedPost(expandedPost?.id === post.id ? null : post)}
                          className="text-ink-tertiary"
                        >
                          {post.comments.length}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={sharedPostId === post.id ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                          onClick={() => handleSharePost(post.id)}
                          className={sharedPostId === post.id ? "text-success" : "text-ink-tertiary"}
                        >
                          {sharedPostId === post.id ? "Copied" : "Share"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Bookmark className={`h-4 w-4 ${post.bookmarkedByUser ? "fill-brand text-brand" : ""}`} />}
                          onClick={() => handleBookmarkPost(post.id)}
                          className={post.bookmarkedByUser ? "text-brand" : "text-ink-tertiary"}
                        >
                          {" "}
                        </Button>
                        {post.author === currentUserName && (
                          <>
                            <div className="flex-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit3 className="h-4 w-4" />}
                              onClick={() =>
                                setEditingPost({ ...post })
                              }
                              className="text-ink-quaternary hover:text-ink"
                            >
                              {" "}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleteConfirmId(post.id)}
                              className="text-ink-quaternary hover:text-error"
                            >
                              {" "}
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Expanded Comments Section */}
                      <AnimatePresence>
                        {expandedPost?.id === post.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 space-y-3">
                              <div className="glass-divider" />
                              <p className="text-[13px] font-semibold text-ink-secondary pt-2">
                                Comments ({post.comments.length})
                              </p>
                              {post.comments.map((cmt) => (
                                <div
                                  key={cmt.id}
                                  className="pl-4 border-l-2 border-glass-border"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[13px] font-bold text-ink">{cmt.author}</span>
                                    <span className="text-[11px] text-ink-quaternary">
                                      {cmt.authorCompany} · {timeAgo(cmt.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[14px] text-ink-secondary leading-relaxed">
                                    {cmt.content}
                                  </p>
                                  <button
                                    onClick={() => handleLikeComment(post.id, cmt.id)}
                                    className={`flex items-center gap-1 mt-1 text-[12px] font-medium transition-colors ${
                                      cmt.likedByUser ? "text-error" : "text-ink-quaternary hover:text-ink-tertiary"
                                    }`}
                                  >
                                    <ThumbsUp
                                      className={`h-3 w-3 ${cmt.likedByUser ? "fill-error" : ""}`}
                                    />
                                    {cmt.likes > 0 && cmt.likes}
                                  </button>
                                </div>
                              ))}
                              <div className="flex gap-2 pt-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  className="flex-1 h-10 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<Send className="h-4 w-4" />}
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!commentText.trim()}
                                >
                                  {" "}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </CursorSpotlight>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <GlassCard padding="xl" className="text-center">
                <MessageCircle className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[15px] font-semibold text-ink-secondary">No discussions found</p>
                <p className="text-[13px] text-ink-quaternary mt-1">
                  Try a different search or start a new discussion.
                </p>
              </GlassCard>
            )}
          </div>

          {/* New Post Modal */}
          <Modal isOpen={showNewPostModal} onClose={() => setShowNewPostModal(false)} title="Create Discussion" size="lg">
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Content</label>
                <textarea
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {POST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="import, textiles, tips"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" size="lg" onClick={handleCreatePost} disabled={!newPostTitle.trim() || !newPostContent.trim()}>
                  Post Discussion
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setShowNewPostModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>

          {/* Edit Post Modal */}
          <Modal isOpen={!!editingPost} onClose={() => setEditingPost(null)} title="Edit Discussion" size="lg">
            {editingPost && (
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Title</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Content</label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Category</label>
                    <select
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                      {POST_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editingPost.tags.join(", ")}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="lg" onClick={handleUpdatePost} disabled={!editingPost.title.trim() || !editingPost.content.trim()}>
                    Save Changes
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setEditingPost(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Delete Confirm */}
          <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Post" size="sm">
            <div className="text-center py-2">
              <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[15px] text-ink-secondary mb-4">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => deleteConfirmId && handleDeletePost(deleteConfirmId)}
                >
                  Delete
                </Button>
                <Button variant="secondary" size="md" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PARTNERSHIPS TAB                                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "partnerships" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search partnerships..."
                value={partnershipSearch}
                onChange={(e) => setPartnershipSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
              />
            </div>
            <select
              value={partnershipStatusFilter}
              onChange={(e) => setPartnershipStatusFilter(e.target.value)}
              className="h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[13px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="all">All Statuses</option>
              <option value="proposed">Proposed</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="declined">Declined</option>
            </select>
            <MagneticButton>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowNewPartnershipModal(true)}
              >
                Propose Partnership
              </Button>
            </MagneticButton>
          </div>

          {/* Partnership Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPartnerships.map((pt, i) => (
                <motion.div
                  key={pt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard>
                    <GlassCard padding="lg" className="h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-[10px] bg-brand/10 flex items-center justify-center shrink-0">
                            <Handshake className="h-5 w-5 text-brand-dark" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-ink">{pt.title}</h3>
                            <p className="text-[12px] text-ink-quaternary">{pt.category}</p>
                          </div>
                        </div>
                        <Badge variant={STATUS_BADGE[pt.status]?.variant ?? "default"} size="sm" dot>
                          {pt.status.charAt(0).toUpperCase() + pt.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-[14px] text-ink-secondary leading-relaxed mb-4 flex-1">
                        {pt.description}
                      </p>
                      <div className="glass-divider mb-3" />
                      <div className="flex items-center justify-between text-[12px] text-ink-tertiary">
                        <span>
                          <span className="font-semibold text-ink-secondary">{pt.proposer}</span> →{" "}
                          <span className="font-semibold text-ink-secondary">{pt.target}</span>
                        </span>
                        <span>{timeAgo(pt.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {pt.status === "proposed" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<Check className="h-3.5 w-3.5" />}
                              onClick={() => handleUpdatePartnershipStatus(pt.id, "active")}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<X className="h-3.5 w-3.5" />}
                              onClick={() => handleUpdatePartnershipStatus(pt.id, "declined")}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {pt.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Clock className="h-3.5 w-3.5" />}
                            onClick={() => handleUpdatePartnershipStatus(pt.id, "expired")}
                          >
                            Mark Expired
                          </Button>
                        )}
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => handleDeletePartnership(pt.id)}
                          className="text-ink-quaternary hover:text-error"
                        >
                          {" "}
                        </Button>
                      </div>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPartnerships.length === 0 && (
            <GlassCard padding="xl" className="text-center">
              <Handshake className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-ink-secondary">No partnerships found</p>
              <p className="text-[13px] text-ink-quaternary mt-1">
                Propose a new partnership to get started.
              </p>
            </GlassCard>
          )}

          {/* New Partnership Modal */}
          <Modal isOpen={showNewPartnershipModal} onClose={() => setShowNewPartnershipModal(false)} title="Propose Partnership" size="lg">
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Partnership title"
                  value={newPartnership.title}
                  onChange={(e) => setNewPartnership({ ...newPartnership, title: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Description</label>
                <textarea
                  placeholder="Describe the partnership proposal..."
                  value={newPartnership.description}
                  onChange={(e) => setNewPartnership({ ...newPartnership, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Target Partner</label>
                  <input
                    type="text"
                    placeholder="Partner name"
                    value={newPartnership.target}
                    onChange={(e) => setNewPartnership({ ...newPartnership, target: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Partner Company</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={newPartnership.targetCompany}
                    onChange={(e) => setNewPartnership({ ...newPartnership, targetCompany: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Category</label>
                <select
                  value={newPartnership.category}
                  onChange={(e) => setNewPartnership({ ...newPartnership, category: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {["Distribution", "Technology", "Services", "Logistics", "Marketing", "Manufacturing", "Retail"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreatePartnership}
                  disabled={!newPartnership.title.trim() || !newPartnership.description.trim()}
                >
                  Submit Proposal
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setShowNewPartnershipModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* EVENTS TAB                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "events" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
              />
            </div>
            <select
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
              className="h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[13px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <MagneticButton>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowNewEventModal(true)}
              >
                Create Event
              </Button>
            </MagneticButton>
          </div>

          {/* Event Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CursorSpotlight>
                    <GlassCard padding="lg" hover className="h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-[10px] bg-info/10 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-info" strokeWidth={1.5} />
                          </div>
                          <div>
                            <Badge variant="default" size="sm" className="mb-1">
                              {evt.category}
                            </Badge>
                            <h3 className="text-[15px] font-bold text-ink">{evt.title}</h3>
                          </div>
                        </div>
                        <Badge variant={STATUS_BADGE[evt.status]?.variant ?? "default"} size="sm" dot>
                          {evt.status.charAt(0).toUpperCase() + evt.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-[14px] text-ink-secondary leading-relaxed mb-3 flex-1">
                        {evt.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[13px] text-ink-tertiary">
                          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                          <span>
                            {formatDate(evt.date)} at {evt.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-ink-tertiary">
                          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                          <span>{evt.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-ink-tertiary">
                          <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                          <span>
                            {evt.rsvpCount}/{evt.maxAttendees} attending
                          </span>
                        </div>
                      </div>
                      {/* Capacity bar */}
                      <div className="w-full h-1.5 bg-surface-secondary/60 rounded-full mb-4 overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((evt.rsvpCount / evt.maxAttendees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="glass-divider mb-3" />
                      <div className="flex items-center gap-2">
                        {evt.status === "upcoming" && (
                          <MagneticButton>
                            <Button
                              variant={evt.rsvpByUser ? "secondary" : "primary"}
                              size="sm"
                              icon={evt.rsvpByUser ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              onClick={() => handleRSVP(evt.id)}
                            >
                              {evt.rsvpByUser ? "Going" : "RSVP"}
                            </Button>
                          </MagneticButton>
                        )}
                        <div className="flex-1" />
                        <span className="text-[12px] text-ink-quaternary">
                          by {evt.organizer}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="text-ink-quaternary hover:text-error"
                        >
                          {" "}
                        </Button>
                      </div>
                    </GlassCard>
                  </CursorSpotlight>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredEvents.length === 0 && (
            <GlassCard padding="xl" className="text-center">
              <Calendar className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-ink-secondary">No events found</p>
              <p className="text-[13px] text-ink-quaternary mt-1">
                Create a new event to bring the community together.
              </p>
            </GlassCard>
          )}

          {/* New Event Modal */}
          <Modal isOpen={showNewEventModal} onClose={() => setShowNewEventModal(false)} title="Create Event" size="lg">
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Event name"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Description</label>
                <textarea
                  placeholder="Describe the event..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Max Attendees</label>
                  <input
                    type="number"
                    min={1}
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: Number(e.target.value) || 50 })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink border border-glass-border focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink-secondary block mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="Venue or virtual link"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title.trim() || !newEvent.date || !newEvent.time}
                >
                  Create Event
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setShowNewEventModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* DIRECTORY TAB                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "directory" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search businesses..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/20 border border-glass-border"
              />
            </div>
            <div className="flex gap-1 p-1 glass-material rounded-[12px] overflow-x-auto">
              {BUSINESS_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBusinessCategoryFilter(cat)}
                  className={`
                    px-3 py-1.5 rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-200
                    ${
                      businessCategoryFilter === cat
                        ? "bg-white/90 text-ink shadow-sm"
                        : "text-ink-tertiary hover:text-ink-secondary hover:bg-white/40"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Business Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBusinesses.map((biz, i) => (
                <motion.div
                  key={biz.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard>
                    <GlassCard padding="lg" hover className="h-full flex flex-col" onClick={() => setSelectedBusiness(biz)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-night flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">{biz.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-ink truncate">{biz.name}</h3>
                          <p className="text-[12px] text-ink-quaternary">{biz.category}</p>
                        </div>
                      </div>
                      <p className="text-[13px] text-ink-secondary leading-relaxed mb-3 flex-1 line-clamp-3">
                        {biz.description}
                      </p>
                      <div className="flex items-center gap-3 text-[12px] text-ink-tertiary mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" strokeWidth={1.5} />
                          {biz.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-brand fill-brand" strokeWidth={1.5} />
                          {biz.rating}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {biz.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-surface-secondary/60 text-[10px] font-medium text-ink-tertiary rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="glass-divider mb-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-ink-quaternary">
                          Member since {new Date(biz.memberSince).getFullYear()}
                        </span>
                        {biz.connected ? (
                          <Badge variant="success" size="sm">
                            Connected
                          </Badge>
                        ) : (
                          <Button variant="secondary" size="sm">
                            View Profile
                          </Button>
                        )}
                      </div>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredBusinesses.length === 0 && (
            <GlassCard padding="xl" className="text-center">
              <Building2 className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-ink-secondary">No businesses found</p>
              <p className="text-[13px] text-ink-quaternary mt-1">
                Try a different search or category filter.
              </p>
            </GlassCard>
          )}

          {/* Business Profile Modal */}
          <Modal
            isOpen={!!selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            title={selectedBusiness?.name ?? ""}
            size="lg"
          >
            {selectedBusiness && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-night flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-2xl">{selectedBusiness.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-ink">{selectedBusiness.name}</h2>
                    <p className="text-[13px] text-ink-tertiary">{selectedBusiness.category} · {selectedBusiness.location}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="h-3.5 w-3.5 text-brand fill-brand" strokeWidth={1.5} />
                      <span className="text-[13px] font-bold text-ink">{selectedBusiness.rating}</span>
                      <span className="text-[12px] text-ink-quaternary">rating</span>
                    </div>
                  </div>
                </div>
                <p className="text-[15px] text-ink-secondary leading-relaxed">
                  {selectedBusiness.description}
                </p>
                <div>
                  <p className="text-[13px] font-semibold text-ink-secondary mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBusiness.specialties.map((s) => (
                      <Badge key={s} variant="default" size="md">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard padding="sm" variant="light">
                    <p className="text-[11px] text-ink-quaternary mb-1">Owner</p>
                    <p className="text-[14px] font-bold text-ink">{selectedBusiness.owner}</p>
                  </GlassCard>
                  <GlassCard padding="sm" variant="light">
                    <p className="text-[11px] text-ink-quaternary mb-1">Member Since</p>
                    <p className="text-[14px] font-bold text-ink">{formatDate(selectedBusiness.memberSince)}</p>
                  </GlassCard>
                </div>
                <div className="flex gap-3">
                  {selectedBusiness.connected ? (
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<Check className="h-4 w-4" />}
                      fullWidth
                      onClick={() => handleDisconnect(selectedBusiness.id)}
                    >
                      Connected
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<Users className="h-4 w-4" />}
                      fullWidth
                      onClick={() => handleRequestConnection(selectedBusiness.id)}
                    >
                      Request Connection
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="lg"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => handleMessageOpen(selectedBusiness)}
                  >
                    Message
                  </Button>
                </div>
                {selectedBusiness.connected && (
                  <p className="text-[12px] text-ink-quaternary text-center">
                    Click "Connected" to disconnect from this business.
                  </p>
                )}
              </div>
            )}
          </Modal>

          {/* Message Modal */}
          <Modal
            isOpen={!!messageTarget}
            onClose={handleMessageClose}
            title={`Message ${messageTarget?.name ?? ""}`}
            size="md"
          >
            {messageTarget && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-night flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">{messageTarget.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-ink">{messageTarget.name}</p>
                    <p className="text-[12px] text-ink-quaternary">{messageTarget.owner} · {messageTarget.location}</p>
                  </div>
                </div>
                {messageSent ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <Check className="h-6 w-6 text-success" strokeWidth={2} />
                    </div>
                    <p className="text-[15px] font-bold text-ink">Message sent</p>
                    <p className="text-[13px] text-ink-tertiary">
                      {messageTarget.name} will get back to you shortly.
                    </p>
                    <Button variant="secondary" size="md" onClick={handleMessageClose}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={`Write a message to ${messageTarget.owner}...`}
                      rows={4}
                      className="w-full p-3 rounded-[12px] bg-surface/50 border border-glass-border text-[14px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="brand"
                        size="md"
                        icon={<Send className="h-4 w-4" />}
                        onClick={handleMessageSend}
                        disabled={!messageText.trim()}
                      >
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* NETWORKING TAB                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "networking" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {/* Pending Requests */}
          <div>
            <h2 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-dark" strokeWidth={1.5} />
              Connection Requests
              {connections.filter((c) => c.status === "pending").length > 0 && (
                <Badge variant="warning" size="sm">
                  {connections.filter((c) => c.status === "pending").length} pending
                </Badge>
              )}
            </h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {connections.map((conn, i) => (
                  <motion.div
                    key={conn.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <GlassCard padding="md" hover>
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                          <span className="text-brand-dark font-bold text-lg">
                            {conn.from.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-[15px] font-bold text-ink">{conn.from}</h3>
                            <Badge
                              variant={STATUS_BADGE[conn.status]?.variant ?? "default"}
                              size="sm"
                              dot
                            >
                              {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-ink-quaternary mb-2">{conn.fromCompany} · {timeAgo(conn.createdAt)}</p>
                          <p className="text-[14px] text-ink-secondary leading-relaxed">
                            {conn.message}
                          </p>
                          {conn.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <MagneticButton>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<Check className="h-4 w-4" />}
                                  onClick={() => handleAcceptConnection(conn.id)}
                                >
                                  Accept
                                </Button>
                              </MagneticButton>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<X className="h-4 w-4" />}
                                onClick={() => handleDeclineConnection(conn.id)}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>

              {connections.length === 0 && (
                <GlassCard padding="xl" className="text-center">
                  <Users className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[15px] font-semibold text-ink-secondary">No connection requests</p>
                  <p className="text-[13px] text-ink-quaternary mt-1">
                    When someone wants to connect, you'll see their request here.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Network Overview */}
          <div>
            <h2 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-info" strokeWidth={1.5} />
              Your Network
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.filter((b) => b.connected).map((biz, i) => (
                <motion.div
                  key={biz.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GlassCard padding="md" hover className="text-center">
                    <div className="h-12 w-12 rounded-full bg-night mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{biz.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-ink">{biz.name}</h3>
                    <p className="text-[12px] text-ink-quaternary">{biz.owner} · {biz.location}</p>
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {biz.specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-surface-secondary/60 text-[10px] font-medium text-ink-tertiary rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      className="mt-3"
                      icon={<Send className="h-4 w-4" />}
                      onClick={() => handleMessageOpen(biz)}
                    >
                      Message
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}

              {businesses.filter((b) => b.connected).length === 0 && (
                <GlassCard padding="xl" className="text-center col-span-full">
                  <Globe className="h-10 w-10 text-ink-quaternary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[15px] font-semibold text-ink-secondary">No connections yet</p>
                  <p className="text-[13px] text-ink-quaternary mt-1">
                    Browse the directory and send connection requests to build your network.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
