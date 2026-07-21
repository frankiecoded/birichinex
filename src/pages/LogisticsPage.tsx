import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck, Package, Search, Plus, MapPin, Clock, Check, X, Eye, Edit3,
  Trash2, ArrowUpRight, Globe, Plane, Ship as ShipIcon, Box, AlertCircle,
  Send, Navigation,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";
import type { Currency } from "../types";

// ── Types ────────────────────────────────────────────────────────────────────

type ShipmentStatus = "pending" | "picked-up" | "in-transit" | "out-for-delivery" | "delivered";
type TabKey = "shipments" | "tracking" | "carriers" | "import-export" | "supply-chain";
type ImportExportType = "import" | "export";
type CustomsStatus = "pending" | "cleared" | "held" | "processing";

interface TimelineEvent {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  note: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  weight: number;
  weightUnit: "kg" | "lbs";
  cost: number;
  currency: Currency;
  status: ShipmentStatus;
  timeline: TimelineEvent[];
  description: string;
  createdAt: string;
  estimatedDelivery: string;
  type: ImportExportType;
  customsStatus: CustomsStatus;
  customsDocumentRef: string;
}

interface Carrier {
  id: string;
  name: string;
  logo: string;
  services: string[];
  baseRatePerKg: number;
  currency: Currency;
  estimatedDays: { domestic: string; international: string };
  coverage: string[];
  rating: number;
  active: boolean;
}

interface ShipmentForm {
  origin: string;
  destination: string;
  carrier: string;
  weight: string;
  cost: string;
  description: string;
  estimatedDelivery: string;
  type: ImportExportType;
  customsDocumentRef: string;
}

interface TrackingQuery {
  trackingNumber: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: ShipmentForm = {
  origin: "",
  destination: "",
  carrier: "",
  weight: "",
  cost: "",
  description: "",
  estimatedDelivery: "",
  type: "export",
  customsDocumentRef: "",
};

const EMPTY_TRACKING: TrackingQuery = { trackingNumber: "" };

const STATUS_META: Record<ShipmentStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "brand"; icon: typeof Truck }> = {
  pending: { label: "Pending", variant: "default", icon: Clock },
  "picked-up": { label: "Picked Up", variant: "info", icon: Package },
  "in-transit": { label: "In Transit", variant: "brand", icon: Truck },
  "out-for-delivery": { label: "Out for Delivery", variant: "warning", icon: Navigation },
  delivered: { label: "Delivered", variant: "success", icon: Check },
};

const CUSTOMS_META: Record<CustomsStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "brand" }> = {
  pending: { label: "Pending", variant: "default" },
  cleared: { label: "Cleared", variant: "success" },
  held: { label: "Held", variant: "error" },
  processing: { label: "Processing", variant: "info" },
};

const TABS: { key: TabKey; label: string; icon: typeof Truck }[] = [
  { key: "shipments", label: "Shipments", icon: Truck },
  { key: "tracking", label: "Tracking", icon: Navigation },
  { key: "carriers", label: "Carriers", icon: Globe },
  { key: "import-export", label: "Import / Export", icon: ShipIcon },
  { key: "supply-chain", label: "Supply Chain", icon: Box },
];

const STATUS_ORDER: ShipmentStatus[] = ["pending", "picked-up", "in-transit", "out-for-delivery", "delivered"];

// ── Sample Data ──────────────────────────────────────────────────────────────

function createSampleShipments(): Shipment[] {
  const now = Date.now();
  const day = 86400000;

  return [
    {
      id: "sh-001",
      trackingNumber: "PM-TRK-20260701-001",
      origin: "Dar es Salaam, Tanzania",
      destination: "Nairobi, Kenya",
      carrier: "DHL Express",
      weight: 245,
      weightUnit: "kg",
      cost: 850000,
      currency: "TZS",
      status: "delivered",
      description: "Men Cotton Shirts — 20 bales wholesale",
      type: "export",
      customsStatus: "cleared",
      customsDocumentRef: "EXP-2026-TZ-00412",
      estimatedDelivery: new Date(now - 2 * day).toISOString(),
      createdAt: new Date(now - 7 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 7 * day).toISOString(), location: "Dar es Salaam HQ", note: "Shipment created and awaiting pickup" },
        { status: "picked-up", timestamp: new Date(now - 6 * day).toISOString(), location: "Dar es Salaam Warehouse", note: "Collected by DHL Express driver" },
        { status: "in-transit", timestamp: new Date(now - 5 * day).toISOString(), location: "Dar es Salaam Port", note: "Departed origin country" },
        { status: "out-for-delivery", timestamp: new Date(now - 3 * day).toISOString(), location: "Nairobi Distribution Hub", note: "Package on delivery vehicle" },
        { status: "delivered", timestamp: new Date(now - 2 * day).toISOString(), location: "Nairobi CBD", note: "Delivered — signed by J. Mwangi" },
      ],
    },
    {
      id: "sh-002",
      trackingNumber: "PM-TRK-20260705-002",
      origin: "Milan, Italy",
      destination: "Dar es Salaam, Tanzania",
      carrier: "FedEx International",
      weight: 1200,
      weightUnit: "kg",
      cost: 4500000,
      currency: "TZS",
      status: "in-transit",
      description: "Leather Jackets & Sportswear — 30 bales",
      type: "import",
      customsStatus: "processing",
      customsDocumentRef: "IMP-2026-TZ-00891",
      estimatedDelivery: new Date(now + 4 * day).toISOString(),
      createdAt: new Date(now - 10 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 10 * day).toISOString(), location: "Milan Warehouse", note: "Order confirmed and packed" },
        { status: "picked-up", timestamp: new Date(now - 9 * day).toISOString(), location: "Milan FedEx Hub", note: "Package collected" },
        { status: "in-transit", timestamp: new Date(now - 6 * day).toISOString(), location: "Dubai Transit Hub", note: "In transit via Dubai" },
      ],
    },
    {
      id: "sh-003",
      trackingNumber: "PM-TRK-20260708-003",
      origin: "Dar es Salaam, Tanzania",
      destination: "Lagos, Nigeria",
      carrier: "UPS Worldwide",
      weight: 85,
      weightUnit: "kg",
      cost: 1200000,
      currency: "TZS",
      status: "picked-up",
      description: "MacBook Air M2 units — Tech export",
      type: "export",
      customsStatus: "cleared",
      customsDocumentRef: "EXP-2026-TZ-00428",
      estimatedDelivery: new Date(now + 8 * day).toISOString(),
      createdAt: new Date(now - 2 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 2 * day).toISOString(), location: "Dar es Salaam Tech Hub", note: "Shipment registered" },
        { status: "picked-up", timestamp: new Date(now - 1 * day).toISOString(), location: "Dar es Salaam Warehouse", note: "Collected by UPS driver" },
      ],
    },
    {
      id: "sh-004",
      trackingNumber: "PM-TRK-20260712-004",
      origin: "Amsterdam, Netherlands",
      destination: "Dar es Salaam, Tanzania",
      carrier: "DHL Express",
      weight: 320,
      weightUnit: "kg",
      cost: 2800000,
      currency: "TZS",
      status: "out-for-delivery",
      description: "Refurbished iPhone 14 Pro — 15 units",
      type: "import",
      customsStatus: "cleared",
      customsDocumentRef: "IMP-2026-TZ-00902",
      estimatedDelivery: new Date(now + 1 * day).toISOString(),
      createdAt: new Date(now - 5 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 5 * day).toISOString(), location: "Amsterdam Warehouse", note: "Package prepared" },
        { status: "picked-up", timestamp: new Date(now - 4 * day).toISOString(), location: "Amsterdam DHL Hub", note: "Collected for international shipping" },
        { status: "in-transit", timestamp: new Date(now - 3 * day).toISOString(), location: "Addis Ababa Transit", note: "Via Ethiopian Airlines cargo" },
        { status: "out-for-delivery", timestamp: new Date(now - 0 * day).toISOString(), location: "Dar es Salaam Distribution", note: "Out for final delivery" },
      ],
    },
    {
      id: "sh-005",
      trackingNumber: "PM-TRK-20260715-005",
      origin: "Dar es Salaam, Tanzania",
      destination: "Kampala, Uganda",
      carrier: "Tanzania Post",
      weight: 45,
      weightUnit: "kg",
      cost: 350000,
      currency: "TZS",
      status: "pending",
      description: "Ladies Handbags — Small batch retail",
      type: "export",
      customsStatus: "pending",
      customsDocumentRef: "EXP-2026-TZ-00435",
      estimatedDelivery: new Date(now + 6 * day).toISOString(),
      createdAt: new Date(now - 1 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 1 * day).toISOString(), location: "Dar es Salaam HQ", note: "Awaiting customs clearance and pickup" },
      ],
    },
    {
      id: "sh-006",
      trackingNumber: "PM-TRK-20260718-006",
      origin: "Guangzhou, China",
      destination: "Dar es Salaam, Tanzania",
      carrier: "Maersk Line",
      weight: 5000,
      weightUnit: "kg",
      cost: 12000000,
      currency: "TZS",
      status: "in-transit",
      description: "USB-C Hubs & Chargers — Container shipment",
      type: "import",
      customsStatus: "processing",
      customsDocumentRef: "IMP-2026-TZ-00910",
      estimatedDelivery: new Date(now + 18 * day).toISOString(),
      createdAt: new Date(now - 12 * day).toISOString(),
      timeline: [
        { status: "pending", timestamp: new Date(now - 12 * day).toISOString(), location: "Guangzhou Factory", note: "Order packed into container" },
        { status: "picked-up", timestamp: new Date(now - 11 * day).toISOString(), location: "Shenzhen Port", note: "Container loaded on vessel" },
        { status: "in-transit", timestamp: new Date(now - 8 * day).toISOString(), location: "Indian Ocean", note: "En route to Dar es Salaam Port" },
      ],
    },
  ];
}

function createSampleCarriers(): Carrier[] {
  return [
    {
      id: "c-001",
      name: "DHL Express",
      logo: "🟤",
      services: ["Express", "Economy", "Freight"],
      baseRatePerKg: 8500,
      currency: "TZS",
      estimatedDays: { domestic: "1-2 days", international: "3-7 days" },
      coverage: ["East Africa", "Europe", "Asia", "Americas", "Middle East"],
      rating: 4.8,
      active: true,
    },
    {
      id: "c-002",
      name: "FedEx International",
      logo: "🟣",
      services: ["Priority", "Standard", "Freight"],
      baseRatePerKg: 9200,
      currency: "TZS",
      estimatedDays: { domestic: "1-2 days", international: "4-8 days" },
      coverage: ["Global"],
      rating: 4.7,
      active: true,
    },
    {
      id: "c-003",
      name: "UPS Worldwide",
      logo: "🟤",
      services: ["Express", "Expedited", "Standard"],
      baseRatePerKg: 8800,
      currency: "TZS",
      estimatedDays: { domestic: "1-3 days", international: "3-9 days" },
      coverage: ["Global"],
      rating: 4.6,
      active: true,
    },
    {
      id: "c-004",
      name: "Tanzania Post",
      logo: "🔵",
      services: ["Standard", "Registered", "EMS"],
      baseRatePerKg: 3200,
      currency: "TZS",
      estimatedDays: { domestic: "2-5 days", international: "10-21 days" },
      coverage: ["Tanzania", "East Africa", "International (EMS)"],
      rating: 3.8,
      active: true,
    },
    {
      id: "c-005",
      name: "Maersk Line",
      logo: "🔵",
      services: ["Ocean Freight", "FCL", "LCL"],
      baseRatePerKg: 1200,
      currency: "TZS",
      estimatedDays: { domestic: "N/A", international: "14-35 days" },
      coverage: ["Global Ports"],
      rating: 4.5,
      active: true,
    },
    {
      id: "c-006",
      name: "Aramex",
      logo: "🟠",
      services: ["Express", "Economy", "Shop & Ship"],
      baseRatePerKg: 7500,
      currency: "TZS",
      estimatedDays: { domestic: "1-3 days", international: "5-10 days" },
      coverage: ["Middle East", "Africa", "Asia", "Europe"],
      rating: 4.4,
      active: true,
    },
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTrackingNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `PM-TRK-${ymd}-${seq}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function TimelineVisual({ shipment }: { shipment: Shipment }) {
  return (
    <div className="relative pl-6">
      {shipment.timeline.map((event, i) => {
        const meta = STATUS_META[event.status];
        const isLast = i === shipment.timeline.length - 1;
        const StatusIcon = meta.icon;
        return (
          <div key={i} className="relative pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-glass-border" />
            )}
            <div className="absolute left-0 top-0 h-[22px] w-[22px] rounded-full bg-surface-secondary/80 border-2 border-glass-border flex items-center justify-center z-10">
              <StatusIcon className="h-2.5 w-2.5 text-ink-secondary" strokeWidth={2} />
            </div>
            <div className="ml-5">
              <div className="flex items-center gap-2">
                <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                <span className="text-[11px] text-ink-quaternary">{formatDateTime(event.timestamp)}</span>
              </div>
              <p className="text-[13px] text-ink-secondary mt-1">{event.location}</p>
              <p className="text-[13px] text-ink-tertiary mt-0.5">{event.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SupplyChainPipeline() {
  const stages = [
    { label: "Source", icon: Globe, sub: "Suppliers", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Factory", icon: Box, sub: "Production", color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Warehouse", icon: Package, sub: "Storage", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Customs", icon: FileTextIcon, sub: "Clearance", color: "text-yellow-600", bg: "bg-yellow-500/10" },
    { label: "Transport", icon: Truck, sub: "Shipping", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Customer", icon: MapPin, sub: "Delivery", color: "text-brand", bg: "bg-brand/10" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
        {stages.map((stage, i) => {
          const StageIcon = stage.icon;
          return (
            <div key={stage.label} className="flex items-center gap-2 min-w-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-[14px] ${stage.bg} flex items-center justify-center`}>
                  <StageIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${stage.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-ink text-center">{stage.label}</p>
                <p className="text-[11px] text-ink-quaternary text-center">{stage.sub}</p>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="hidden sm:flex items-center text-ink-quaternary mt-[-16px]">
                  <div className="w-6 sm:w-10 h-px bg-glass-border" />
                  <ArrowUpRight className="h-3 w-3 -ml-0.5" strokeWidth={1.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileTextIcon(props: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function LogisticsPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);

  // State
  const [activeTab, setActiveTab] = useState<TabKey>("shipments");
  const [shipments, setShipments] = useState<Shipment[]>(createSampleShipments);
  const [carriers] = useState<Carrier[]>(createSampleCarriers);
  const [form, setForm] = useState<ShipmentForm>(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [trackingQuery, setTrackingQuery] = useState<TrackingQuery>(EMPTY_TRACKING);
  const [trackingResult, setTrackingResult] = useState<Shipment | null>(null);
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const [typeFilter, setTypeFilter] = useState<ImportExportType | "all">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Computed
  const filteredShipments = useMemo(() => {
    let list = shipments;
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [shipments, statusFilter, searchQuery]);

  const importExportShipments = useMemo(() => {
    let list = shipments;
    if (typeFilter !== "all") {
      list = list.filter((s) => s.type === typeFilter);
    }
    return list;
  }, [shipments, typeFilter]);

  const stats = useMemo(() => {
    const active = shipments.filter((s) => s.status !== "delivered").length;
    const delivered = shipments.filter((s) => {
      if (s.status !== "delivered") return false;
      const d = new Date(s.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalCost = shipments.reduce((sum, s) => sum + s.cost, 0);
    const avgDays = shipments.filter((s) => s.status === "delivered").length > 0
      ? Math.round(
          shipments
            .filter((s) => s.status === "delivered")
            .reduce((sum, s) => {
              const created = new Date(s.createdAt).getTime();
              const delivered = s.timeline.find((t) => t.status === "delivered");
              if (!delivered) return sum;
              return sum + (new Date(delivered.timestamp).getTime() - created) / 86400000;
            }, 0) / shipments.filter((s) => s.status === "delivered").length,
        )
      : 0;
    return [
      { label: "Active Shipments", value: String(active), icon: Truck },
      { label: "Delivered (Month)", value: String(delivered), icon: Check },
      { label: "Total Shipping Cost", value: formatPrice(totalCost, selectedCurrency), icon: ArrowUpRight },
      { label: "Avg Delivery Time", value: `${avgDays} days`, icon: Clock },
    ];
  }, [shipments, selectedCurrency]);

  // Handlers
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (shipment: Shipment) => {
    setForm({
      origin: shipment.origin,
      destination: shipment.destination,
      carrier: shipment.carrier,
      weight: String(shipment.weight),
      cost: String(shipment.cost),
      description: shipment.description,
      estimatedDelivery: shipment.estimatedDelivery.split("T")[0],
      type: shipment.type,
      customsDocumentRef: shipment.customsDocumentRef,
    });
    setEditingId(shipment.id);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin.trim() || !form.destination.trim() || !form.carrier.trim()) return;

    const weightNum = parseFloat(form.weight) || 0;
    const costNum = parseFloat(form.cost) || 0;
    const now = new Date().toISOString();

    if (editingId) {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                origin: form.origin.trim(),
                destination: form.destination.trim(),
                carrier: form.carrier.trim(),
                weight: weightNum,
                cost: costNum,
                description: form.description.trim(),
                estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery).toISOString() : s.estimatedDelivery,
                type: form.type,
                customsDocumentRef: form.customsDocumentRef.trim(),
              }
            : s,
        ),
      );
    } else {
      const trackingNumber = generateTrackingNumber();
      const newShipment: Shipment = {
        id: `sh-${crypto.randomUUID().slice(0, 8)}`,
        trackingNumber,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        carrier: form.carrier.trim(),
        weight: weightNum,
        weightUnit: "kg",
        cost: costNum,
        currency: selectedCurrency,
        status: "pending",
        description: form.description.trim() || "General shipment",
        type: form.type,
        customsStatus: "pending",
        customsDocumentRef: form.customsDocumentRef.trim() || `DOC-${Date.now()}`,
        estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: now,
        timeline: [
          { status: "pending", timestamp: now, location: form.origin.trim(), note: "Shipment created and awaiting pickup" },
        ],
      };
      setShipments((prev) => [newShipment, ...prev]);
    }

    resetForm();
    setModalOpen(false);
  };

  const advanceStatus = (id: string) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const currentIdx = STATUS_ORDER.indexOf(s.status);
        if (currentIdx >= STATUS_ORDER.length - 1) return s;
        const nextStatus = STATUS_ORDER[currentIdx + 1];
        const newEvent: TimelineEvent = {
          status: nextStatus,
          timestamp: new Date().toISOString(),
          location: s.destination,
          note: `Status updated to ${STATUS_META[nextStatus].label}`,
        };
        return { ...s, status: nextStatus, timeline: [...s.timeline, newEvent] };
      }),
    );
  };

  const deleteShipment = (id: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  const handleTrackingSearch = () => {
    const q = trackingQuery.trackingNumber.trim().toLowerCase();
    if (!q) return;
    const found = shipments.find((s) => s.trackingNumber.toLowerCase().includes(q));
    setTrackingResult(found || null);
  };

  const handleTrackingKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTrackingSearch();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(52,199,89,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-headline text-ink tracking-tight">
            <span className="text-gradient-brand">Logistics</span>
          </h1>
          <p className="text-callout text-ink-tertiary mt-1">
            Shipping, tracking, carriers, and supply chain management.
          </p>
        </div>
        <MagneticButton strength={0.2}>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            New Shipment
          </Button>
        </MagneticButton>
      </motion.div>

      {/* Stats */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(52,199,89,0.04)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={5}>
                  <GlassCard padding="md" hover>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                      <StatIcon className="h-4 w-4 text-success" strokeWidth={1.5} />
                    </div>
                    <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                  </GlassCard>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </CursorSpotlight>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="flex gap-1 p-1 bg-surface-secondary/40 backdrop-blur-sm rounded-[14px] border border-glass-border overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? "bg-surface shadow-sm text-ink"
                    : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-secondary/60"
                  }
                `}
              >
                <TabIcon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ─── SHIPMENTS TAB ─────────────────────────────────────────── */}
        {activeTab === "shipments" && (
          <motion.div
            key="shipments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-subhead font-bold text-ink">Shipments</h3>
                  <Badge variant="default" size="sm">{filteredShipments.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
                    <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
                    <input
                      placeholder="Search shipments..."
                      className="bg-transparent text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[180px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "all")}
                      className="h-9 px-3 pr-8 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border text-[13px] text-ink-secondary appearance-none cursor-pointer focus:outline-none"
                    >
                      <option value="all">All Status</option>
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-3 w-3 text-ink-quaternary" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4.5L6 7.5L9 4.5" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Tracking</th>
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Route</th>
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase hidden lg:table-cell">Carrier</th>
                      <th className="text-right text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase hidden lg:table-cell">Weight</th>
                      <th className="text-right text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Cost</th>
                      <th className="text-right text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Status</th>
                      <th className="w-[140px] px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[15px] text-ink-quaternary">
                          No shipments found
                        </td>
                      </tr>
                    )}
                    {filteredShipments.map((shipment, i) => (
                      <motion.tr
                        key={shipment.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                              {shipment.type === "import" ? (
                                <ShipIcon className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                              ) : (
                                <Plane className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-ink font-mono">{shipment.trackingNumber}</p>
                              <p className="text-[11px] text-ink-quaternary">{formatDate(shipment.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-ink-quaternary shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-ink-secondary truncate max-w-[120px]">{shipment.origin}</span>
                            <ArrowUpRight className="h-3 w-3 text-ink-quaternary shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-ink-secondary truncate max-w-[120px]">{shipment.destination}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-[13px] text-ink-secondary">{shipment.carrier}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                          <span className="text-[13px] text-ink-secondary">{shipment.weight} {shipment.weightUnit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-[13px] font-semibold text-ink">{formatPrice(shipment.cost, selectedCurrency)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant={STATUS_META[shipment.status].variant} size="sm" dot>
                            {STATUS_META[shipment.status].label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setDetailShipment(shipment)}
                              className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => openEditModal(shipment)}
                              className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-brand-dark hover:bg-brand/10 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            {shipment.status !== "delivered" && (
                              <button
                                onClick={() => advanceStatus(shipment.id)}
                                className="h-8 px-2.5 rounded-[8px] flex items-center gap-1 text-[13px] font-semibold text-success hover:bg-success/10 transition-colors"
                                title="Advance status"
                              >
                                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmId(shipment.id)}
                              className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-glass-border">
                {filteredShipments.length === 0 && (
                  <div className="px-5 py-12 text-center text-[15px] text-ink-quaternary">No shipments found</div>
                )}
                {filteredShipments.map((shipment, i) => (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-mono font-semibold text-ink">{shipment.trackingNumber}</p>
                      <Badge variant={STATUS_META[shipment.status].variant} size="sm" dot>
                        {STATUS_META[shipment.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
                      <MapPin className="h-3 w-3 text-ink-quaternary shrink-0" strokeWidth={1.5} />
                      {shipment.origin} → {shipment.destination}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-ink-tertiary">{shipment.carrier}</span>
                      <span className="text-[13px] font-semibold text-ink">{formatPrice(shipment.cost, selectedCurrency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailShipment(shipment)} className="h-8 px-3 rounded-[8px] flex items-center gap-1.5 text-[13px] font-semibold text-info hover:bg-info/10 transition-colors">
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> View
                      </button>
                      <button onClick={() => openEditModal(shipment)} className="h-8 px-3 rounded-[8px] flex items-center gap-1.5 text-[13px] font-semibold text-brand-dark hover:bg-brand/10 transition-colors">
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} /> Edit
                      </button>
                      {shipment.status !== "delivered" && (
                        <button onClick={() => advanceStatus(shipment.id)} className="h-8 px-3 rounded-[8px] flex items-center gap-1.5 text-[13px] font-semibold text-success hover:bg-success/10 transition-colors">
                          <Send className="h-3.5 w-3.5" strokeWidth={1.5} /> Next
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ─── TRACKING TAB ─────────────────────────────────────────── */}
        {activeTab === "tracking" && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <GlassCard padding="lg">
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="h-16 w-16 rounded-[18px] bg-success/10 flex items-center justify-center mx-auto">
                  <Navigation className="h-8 w-8 text-success" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-title font-bold text-ink">Track Shipment</h2>
                  <p className="text-[15px] text-ink-tertiary mt-1">Enter your tracking number to see real-time status and timeline.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 h-12 px-4 bg-surface-secondary/60 backdrop-blur-sm rounded-[12px] border border-glass-border">
                    <Search className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                    <input
                      placeholder="PM-TRK-XXXXXXXX-XXX"
                      className="bg-transparent text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none w-full font-mono"
                      value={trackingQuery.trackingNumber}
                      onChange={(e) => setTrackingQuery({ trackingNumber: e.target.value })}
                      onKeyDown={handleTrackingKeyDown}
                    />
                  </div>
                  <Button variant="primary" onClick={handleTrackingSearch}>Track</Button>
                </div>
              </div>
            </GlassCard>

            {trackingResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard padding="none">
                  <div className="p-5 border-b border-glass-border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-subhead font-bold text-ink font-mono">{trackingResult.trackingNumber}</p>
                          <Badge variant={STATUS_META[trackingResult.status].variant} size="md" dot>
                            {STATUS_META[trackingResult.status].label}
                          </Badge>
                        </div>
                        <p className="text-[13px] text-ink-tertiary mt-1">{trackingResult.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-ink-secondary">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.5} /> {trackingResult.origin}</span>
                        <span>→</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.5} /> {trackingResult.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-[13px] font-bold text-ink uppercase tracking-wider mb-4">Status Timeline</h4>
                    <TimelineVisual shipment={trackingResult} />
                  </div>
                  <div className="p-5 border-t border-glass-border grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Carrier</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{trackingResult.carrier}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Weight</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{trackingResult.weight} {trackingResult.weightUnit}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Cost</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{formatPrice(trackingResult.cost, selectedCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Est. Delivery</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{formatDate(trackingResult.estimatedDelivery)}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {trackingResult === null && trackingQuery.trackingNumber && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard padding="lg">
                  <div className="text-center space-y-3">
                    <AlertCircle className="h-10 w-10 text-warning mx-auto" strokeWidth={1.5} />
                    <p className="text-[15px] font-semibold text-ink">Shipment not found</p>
                    <p className="text-[13px] text-ink-tertiary">
                      No shipment matches "{trackingQuery.trackingNumber}". Please check the tracking number and try again.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── CARRIERS TAB ─────────────────────────────────────────── */}
        {activeTab === "carriers" && (
          <motion.div
            key="carriers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carriers.map((carrier, i) => (
                <motion.div
                  key={carrier.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <TiltCard intensity={6}>
                    <GlassCard padding="md" hover className="h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-[12px] bg-surface-secondary/80 flex items-center justify-center text-2xl">
                            {carrier.logo}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-ink">{carrier.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <div
                                  key={si}
                                  className={`h-1.5 w-1.5 rounded-full ${si < Math.round(carrier.rating) ? "bg-brand" : "bg-surface-secondary"}`}
                                />
                              ))}
                              <span className="text-[11px] text-ink-quaternary ml-1">{carrier.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={carrier.active ? "success" : "default"} size="sm">
                          {carrier.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold mb-1.5">Services</p>
                          <div className="flex flex-wrap gap-1.5">
                            {carrier.services.map((service) => (
                              <Badge key={service} variant="default" size="sm">{service}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="glass-divider" />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Base Rate</p>
                            <p className="text-[15px] font-bold text-ink mt-0.5">{formatPrice(carrier.baseRatePerKg, selectedCurrency)}<span className="text-[11px] text-ink-tertiary font-normal">/kg</span></p>
                          </div>
                          <div>
                            <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Domestic</p>
                            <p className="text-[15px] font-semibold text-ink mt-0.5">{carrier.estimatedDays.domestic}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">International</p>
                            <p className="text-[15px] font-semibold text-ink mt-0.5">{carrier.estimatedDays.international}</p>
                          </div>
                        </div>

                        <div className="glass-divider" />

                        <div>
                          <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold mb-1.5">Coverage</p>
                          <div className="flex flex-wrap gap-1.5">
                            {carrier.coverage.map((region) => (
                              <span key={region} className="text-[11px] text-ink-secondary bg-surface-secondary/60 px-2 py-0.5 rounded-full">{region}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── IMPORT / EXPORT TAB ───────────────────────────────────── */}
        {activeTab === "import-export" && (
          <motion.div
            key="import-export"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Imports", value: shipments.filter((s) => s.type === "import").length, icon: ShipIcon },
                { label: "Exports", value: shipments.filter((s) => s.type === "export").length, icon: Plane },
                { label: "Customs Cleared", value: shipments.filter((s) => s.customsStatus === "cleared").length, icon: Check },
                { label: "Customs Held", value: shipments.filter((s) => s.customsStatus === "held").length, icon: AlertCircle },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <GlassCard padding="md" hover>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                        <StatIcon className="h-4 w-4 text-info" strokeWidth={1.5} />
                      </div>
                      <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "import", "export"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`
                    px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200
                    ${typeFilter === f
                      ? "bg-ink text-white shadow-sm"
                      : "bg-surface-secondary/60 text-ink-secondary border border-glass-border hover:bg-surface-secondary"
                    }
                  `}
                >
                  {f === "all" ? "All" : f === "import" ? "Imports" : "Exports"}
                </button>
              ))}
            </div>

            {/* Table */}
            <GlassCard padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Type</th>
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Tracking</th>
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase hidden md:table-cell">Route</th>
                      <th className="text-left text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase hidden lg:table-cell">Customs Doc</th>
                      <th className="text-center text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Customs</th>
                      <th className="text-right text-[11px] text-ink-quaternary px-5 py-3 font-semibold tracking-wider uppercase">Status</th>
                      <th className="w-10 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {importExportShipments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[15px] text-ink-quaternary">No shipments found</td>
                      </tr>
                    )}
                    {importExportShipments.map((shipment, i) => (
                      <motion.tr
                        key={shipment.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <Badge variant={shipment.type === "import" ? "info" : "brand"} size="sm">
                            {shipment.type === "import" ? (
                              <span className="flex items-center gap-1"><ShipIcon className="h-3 w-3" strokeWidth={1.5} /> Import</span>
                            ) : (
                              <span className="flex items-center gap-1"><Plane className="h-3 w-3" strokeWidth={1.5} /> Export</span>
                            )}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-[13px] font-mono text-ink font-semibold">{shipment.trackingNumber}</p>
                          <p className="text-[11px] text-ink-quaternary">{shipment.carrier}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <p className="text-[13px] text-ink-secondary">{shipment.origin} → {shipment.destination}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <p className="text-[13px] text-ink-tertiary font-mono">{shipment.customsDocumentRef}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={CUSTOMS_META[shipment.customsStatus].variant} size="sm">
                            {CUSTOMS_META[shipment.customsStatus].label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant={STATUS_META[shipment.status].variant} size="sm">
                            {STATUS_META[shipment.status].label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setDetailShipment(shipment)}
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ─── SUPPLY CHAIN TAB ─────────────────────────────────────── */}
        {activeTab === "supply-chain" && (
          <motion.div
            key="supply-chain"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <GlassCard padding="lg">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-title font-bold text-ink">Supply Chain Pipeline</h2>
                  <p className="text-[15px] text-ink-tertiary">Visual flow from source to customer delivery</p>
                </div>
                <SupplyChainPipeline />
              </div>
            </GlassCard>

            {/* Active Shipments Pipeline */}
            <GlassCard padding="none">
              <div className="p-5 border-b border-glass-border">
                <h3 className="text-subhead font-bold text-ink">Active Pipeline</h3>
                <p className="text-[13px] text-ink-tertiary mt-0.5">Shipments currently moving through the supply chain</p>
              </div>
              <div className="divide-y divide-glass-border">
                {shipments.filter((s) => s.status !== "delivered").length === 0 && (
                  <div className="px-5 py-12 text-center text-[15px] text-ink-quaternary">
                    All shipments have been delivered
                  </div>
                )}
                {shipments
                  .filter((s) => s.status !== "delivered")
                  .map((shipment, i) => {
                    const currentIdx = STATUS_ORDER.indexOf(shipment.status);
                    const progress = ((currentIdx + 1) / STATUS_ORDER.length) * 100;
                    return (
                      <motion.div
                        key={shipment.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        className="p-5 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                              {shipment.type === "import" ? (
                                <ShipIcon className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                              ) : (
                                <Plane className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-ink font-mono">{shipment.trackingNumber}</p>
                              <p className="text-[11px] text-ink-tertiary">{shipment.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={STATUS_META[shipment.status].variant} size="sm" dot>
                              {STATUS_META[shipment.status].label}
                            </Badge>
                            <span className="text-[13px] text-ink-secondary font-semibold">
                              {formatPrice(shipment.cost, selectedCurrency)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-3 w-3 text-ink-quaternary shrink-0" strokeWidth={1.5} />
                          <span className="text-[13px] text-ink-secondary">{shipment.origin}</span>
                          <div className="flex-1 mx-2">
                            <div className="h-1.5 bg-surface-secondary/80 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full bg-success rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-[13px] text-ink-secondary">{shipment.destination}</span>
                          <MapPin className="h-3 w-3 text-ink-quaternary shrink-0" strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-ink-quaternary">
                          <span>{shipment.carrier}</span>
                          <span>Est. {formatDate(shipment.estimatedDelivery)} · {daysUntil(shipment.estimatedDelivery)} days left</span>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </GlassCard>

            {/* Completed Pipeline */}
            {shipments.filter((s) => s.status === "delivered").length > 0 && (
              <GlassCard padding="none">
                <div className="p-5 border-b border-glass-border">
                  <h3 className="text-subhead font-bold text-ink">Completed Deliveries</h3>
                </div>
                <div className="divide-y divide-glass-border">
                  {shipments
                    .filter((s) => s.status === "delivered")
                    .map((shipment, i) => (
                      <motion.div
                        key={shipment.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        className="p-5 flex items-center gap-4 hover:bg-surface-secondary/40 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-success" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-ink font-mono truncate">{shipment.trackingNumber}</p>
                          <p className="text-[11px] text-ink-tertiary truncate">{shipment.origin} → {shipment.destination} · {shipment.carrier}</p>
                        </div>
                        <span className="text-[13px] font-semibold text-ink shrink-0">{formatPrice(shipment.cost, selectedCurrency)}</span>
                      </motion.div>
                    ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CREATE / EDIT SHIPMENT MODAL ──────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">{editingId ? "Edit Shipment" : "New Shipment"}</h2>
                  <button
                    onClick={() => { setModalOpen(false); resetForm(); }}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Origin *</label>
                      <input
                        required
                        value={form.origin}
                        onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="e.g. Dar es Salaam, Tanzania"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Destination *</label>
                      <input
                        required
                        value={form.destination}
                        onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="e.g. Nairobi, Kenya"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Carrier *</label>
                      <select
                        required
                        value={form.carrier}
                        onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none"
                      >
                        <option value="">Select carrier</option>
                        {carriers.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Type</label>
                      <div className="flex gap-2 h-10">
                        {(["export", "import"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, type: t }))}
                            className={`flex-1 rounded-[10px] text-[13px] font-semibold border transition-all ${
                              form.type === t
                                ? "bg-ink text-white border-ink"
                                : "bg-surface-secondary/60 text-ink-secondary border-glass-border hover:bg-surface-secondary"
                            }`}
                          >
                            {t === "import" ? "Import" : "Export"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.weight}
                        onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Cost ({selectedCurrency})</label>
                      <input
                        type="number"
                        min="0"
                        value={form.cost}
                        onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="Shipment description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Est. Delivery</label>
                      <input
                        type="date"
                        value={form.estimatedDelivery}
                        onChange={(e) => setForm((f) => ({ ...f, estimatedDelivery: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-ink-secondary font-semibold block mb-1.5">Customs Doc Ref</label>
                      <input
                        value={form.customsDocumentRef}
                        onChange={(e) => setForm((f) => ({ ...f, customsDocumentRef: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Auto-generated"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => { setModalOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {editingId ? "Save Changes" : "Create Shipment"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SHIPMENT DETAIL MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {detailShipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDetailShipment(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-subhead font-bold text-ink">Shipment Details</h2>
                    <p className="text-[13px] text-ink-tertiary mt-0.5 font-mono">{detailShipment.trackingNumber}</p>
                  </div>
                  <button
                    onClick={() => setDetailShipment(null)}
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS_META[detailShipment.status].variant} size="md" dot>
                      {STATUS_META[detailShipment.status].label}
                    </Badge>
                    <Badge variant={detailShipment.type === "import" ? "info" : "brand"} size="md">
                      {detailShipment.type === "import" ? "Import" : "Export"}
                    </Badge>
                    <Badge variant={CUSTOMS_META[detailShipment.customsStatus].variant} size="md">
                      Customs: {CUSTOMS_META[detailShipment.customsStatus].label}
                    </Badge>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-3 p-4 bg-surface-secondary/40 rounded-[12px]">
                    <div className="text-center flex-1">
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Origin</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{detailShipment.origin}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Truck className="h-5 w-5 text-success" strokeWidth={1.5} />
                      <div className="w-16 h-px bg-glass-border" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Destination</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{detailShipment.destination}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Carrier</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{detailShipment.carrier}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Weight</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{detailShipment.weight} {detailShipment.weightUnit}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Cost</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{formatPrice(detailShipment.cost, selectedCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Created</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{formatDate(detailShipment.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Est. Delivery</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5">{formatDate(detailShipment.estimatedDelivery)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Customs Doc</p>
                      <p className="text-[15px] font-semibold text-ink mt-0.5 font-mono">{detailShipment.customsDocumentRef}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-quaternary uppercase tracking-wider font-semibold">Description</p>
                    <p className="text-[15px] text-ink mt-0.5">{detailShipment.description}</p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-[13px] font-bold text-ink uppercase tracking-wider mb-4">Timeline</h4>
                    <TimelineVisual shipment={detailShipment} />
                  </div>
                </div>

                {/* Actions */}
                {detailShipment.status !== "delivered" && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-glass-border">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => { setDetailShipment(null); openEditModal(detailShipment); }}
                      icon={<Edit3 className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        advanceStatus(detailShipment.id);
                        const updated = shipments.find((s) => s.id === detailShipment.id);
                        if (updated) {
                          const idx = STATUS_ORDER.indexOf(updated.status);
                          if (idx < STATUS_ORDER.length - 1) {
                            setDetailShipment({
                              ...updated,
                              status: STATUS_ORDER[idx + 1],
                              timeline: [
                                ...updated.timeline,
                                {
                                  status: STATUS_ORDER[idx + 1],
                                  timestamp: new Date().toISOString(),
                                  location: updated.destination,
                                  note: `Status updated to ${STATUS_META[STATUS_ORDER[idx + 1]].label}`,
                                },
                              ],
                            });
                          } else {
                            setDetailShipment({ ...updated, status: "delivered" });
                          }
                        }
                      }}
                      icon={<Send className="h-3.5 w-3.5" />}
                    >
                      Advance Status
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRM MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-error/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-error" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-subhead font-bold text-ink">Delete Shipment</h3>
                  <p className="text-[13px] text-ink-tertiary">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => deleteShipment(deleteConfirmId)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
