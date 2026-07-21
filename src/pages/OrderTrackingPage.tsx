import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, MapPin, Clock, Search, ChevronRight, ChevronLeft, Copy, Check,
  Truck, Phone, User, ArrowRight, DollarSign, Calculator, Globe, X, Eye,
  RotateCcw, Navigation, Filter, AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../data/platform';
import {
  ALL_CITIES, COUNTRIES, getNairobiZones, getCitiesByCountry,
  getCrossBorderRoute, CROSS_BORDER_ROUTES, CityPricing, DeliveryZone,
} from '../data/delivery';
import type { TrackedOrder, TrackingStatus } from '../data/delivery';

const STATUS_COLORS: Record<TrackingStatus, string> = {
  placed: '#8E8E93',
  confirmed: '#007AFF',
  processing: '#FF9500',
  picked_up: '#AF52DE',
  in_transit: '#00C7BE',
  out_for_delivery: '#30D158',
  delivered: '#34C759',
  cancelled: '#FF3B30',
  returned: '#FF3B30',
};

const STATUS_LABELS: Record<TrackingStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

const STATUS_ICONS: Record<TrackingStatus, string> = {
  placed: '📋', confirmed: '✅', processing: '⚙️', picked_up: '📦',
  in_transit: '🚚', out_for_delivery: '🛵', delivered: '🎉', cancelled: '❌', returned: '↩️',
};

function createMarkerIcon(color: string, isAnimated: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${isAnimated ? 28 : 18}px;height:${isAnimated ? 28 : 18}px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 ${isAnimated ? '14' : '6'}px ${color};${isAnimated ? 'animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;' : ''}"></div>`,
    iconSize: [isAnimated ? 28 : 18, isAnimated ? 28 : 18],
    iconAnchor: [isAnimated ? 14 : 9, isAnimated ? 14 : 9],
  });
}

function createDestIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;background:#FF3B30;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #FF3B30;display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createOriginIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;background:#007AFF;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #007AFF;display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FlyToOrder({ order }: { order: TrackedOrder | null }) {
  const map = useMap();
  useEffect(() => {
    if (order) {
      map.flyTo([order.currentLat, order.currentLng], 6, { duration: 1.5 });
    }
  }, [order, map]);
  return null;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(targetDate).getTime();
      const diff = Math.max(0, end - now);
      if (diff === 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function OrderCountdown({ date }: { date: string }) {
  const t = useCountdown(date);
  if (t.expired) return <span className="text-[12px] font-semibold text-[#34C759]">Arrived</span>;
  return (
    <span className="text-[12px] font-mono font-semibold text-ink-secondary tabular-nums">
      {t.days > 0 && `${t.days}d `}{String(t.hours).padStart(2,'0')}:{String(t.minutes).padStart(2,'0')}:{String(t.seconds).padStart(2,'0')}
    </span>
  );
}

function TimelineStep({ event, isLast, index }: { event: { status: TrackingStatus; timestamp: string; location: string; note: string }; isLast: boolean; index: number }) {
  const color = STATUS_COLORS[event.status];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex gap-3"
    >
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] flex-shrink-0"
          style={{ background: `${color}20`, border: `2px solid ${color}` }}
        >
          {STATUS_ICONS[event.status]}
        </div>
        {!isLast && <div className="w-px h-8 bg-glass-border mt-1" />}
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink">{STATUS_LABELS[event.status]}</p>
        <p className="text-[12px] text-ink-tertiary mt-0.5">{event.note}</p>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="h-3 w-3 text-ink-quaternary" />
          <span className="text-[11px] text-ink-quaternary">{event.location}</span>
          <span className="text-[11px] text-ink-quaternary">•</span>
          <span className="text-[11px] text-ink-quaternary">{new Date(event.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function OrderTrackingPage({ onNavigate }: Props) {
  const orders = useStore((s) => s.orders);
  const selectedCurrency = useStore((s) => s.selectedCurrency);

  const [selectedOrder, setSelectedOrder] = useState<TrackedOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrackingStatus | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'pricing'>('tracking');

  const [calcOriginCountry, setCalcOriginCountry] = useState('Kenya');
  const [calcOriginCity, setCalcOriginCity] = useState('Nairobi');
  const [calcDestCountry, setCalcDestCountry] = useState('Kenya');
  const [calcDestCity, setCalcDestCity] = useState('Nairobi');
  const [calcWeight, setCalcWeight] = useState('5');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = searchQuery === '' ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    inTransit: orders.filter((o) => ['in_transit', 'out_for_delivery'].includes(o.status)).length,
  }), [orders]);

  const handleSelectOrder = useCallback((order: TrackedOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  }, []);

  const handleCopyTracking = useCallback((num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const calcOriginCities = useMemo(() => getCitiesByCountry(calcOriginCountry), [calcOriginCountry]);
  const calcDestCities = useMemo(() => getCitiesByCountry(calcDestCountry), [calcDestCountry]);
  const crossBorder = useMemo(() => {
    if (calcOriginCountry === calcDestCountry) return null;
    return getCrossBorderRoute(calcOriginCountry, calcDestCountry);
  }, [calcOriginCountry, calcDestCountry]);
  const calcDeliveryCost = useMemo(() => {
    const weight = parseFloat(calcWeight) || 0;
    const originCity = calcOriginCities.find((c) => c.city === calcOriginCity);
    const destCity = calcDestCities.find((c) => c.city === calcDestCity);
    if (!originCity || !destCity) return 0;
    if (crossBorder) {
      return crossBorder.basePrice + crossBorder.pricePerKg * weight;
    }
    return destCity.standardDelivery + (weight * 200);
  }, [calcOriginCity, calcDestCity, calcWeight, calcOriginCities, calcDestCities, crossBorder]);

  const nairobiZones = useMemo(() => getNairobiZones(), []);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      <style>{`@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}`}</style>

      {/* ─── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] flex gap-2">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
            activeTab === 'tracking'
              ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/30'
              : 'glass-material text-ink-secondary hover:text-ink border border-glass-border'
          }`}
        >
          <Navigation className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Live Tracking
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
            activeTab === 'pricing'
              ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/30'
              : 'glass-material text-ink-secondary hover:text-ink border border-glass-border'
          }`}
        >
          <DollarSign className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Delivery Pricing
        </button>
      </div>

      {activeTab === 'tracking' ? (
        <div className="flex h-full">
          {/* ─── Order List Sidebar ─────────────────────────────────────────── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="h-full z-[1000] relative flex-shrink-0 overflow-hidden border-r border-glass-border"
              >
                <div className="w-[360px] h-full bg-surface/95 backdrop-blur-2xl flex flex-col">
                  {/* Stats */}
                  <div className="p-4 border-b border-glass-border">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: 'Total', value: stats.total, color: '#007AFF' },
                        { label: 'Active', value: stats.active, color: '#FF9500' },
                        { label: 'In Transit', value: stats.inTransit, color: '#00C7BE' },
                        { label: 'Delivered', value: stats.delivered, color: '#34C759' },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-2 rounded-[10px] bg-surface-secondary/60">
                          <div className="text-[18px] font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-ink-quaternary font-medium">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quaternary" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search orders..."
                        className="w-full h-10 pl-9 pr-4 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink placeholder:text-ink-quaternary outline-none focus:border-[#007AFF]/50 transition-colors"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {(['all', 'placed', 'confirmed', 'processing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                            statusFilter === s
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-surface-secondary/60 text-ink-tertiary hover:text-ink border border-glass-border'
                          }`}
                        >
                          {s === 'all' ? 'All' : STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredOrders.length === 0 ? (
                      <div className="p-8 text-center">
                        <Package className="h-10 w-10 text-ink-quaternary mx-auto mb-3" />
                        <p className="text-[13px] text-ink-tertiary">No orders found</p>
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <motion.button
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 border-b border-glass-border text-left hover:bg-surface-secondary/40 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-[#007AFF]/5 border-l-2 border-l-[#007AFF]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-[10px] bg-surface-secondary/60 flex items-center justify-center text-[20px] flex-shrink-0">
                              {order.productImage}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-ink truncate">{order.productName}</p>
                              <p className="text-[11px] text-ink-quaternary mt-0.5">{order.trackingNumber}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                                  style={{ background: STATUS_COLORS[order.status] }}
                                >
                                  {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[11px] text-ink-quaternary flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {order.destinationCity}
                                </span>
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <OrderCountdown date={order.estimatedDelivery} />
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-ink-quaternary flex-shrink-0 mt-1" />
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-[1050] w-6 h-12 glass-material border border-glass-border rounded-r-[8px] flex items-center justify-center hover:bg-surface-secondary/60 transition-colors"
            style={{ left: sidebarOpen ? 360 : 0 }}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4 text-ink-secondary" /> : <ChevronRight className="h-4 w-4 text-ink-secondary" />}
          </button>

          {/* ─── Map ───────────────────────────────────────────────────────── */}
          <div className="flex-1 relative">
            <MapContainer
              center={[-2, 37]}
              zoom={5}
              className="w-full h-full"
              style={{ background: '#0a0a0a' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <FlyToOrder order={selectedOrder} />

              {filteredOrders.map((order) => (
                <Marker
                  key={order.id}
                  position={[order.currentLat, order.currentLng]}
                  icon={createMarkerIcon(STATUS_COLORS[order.status], !['delivered', 'cancelled'].includes(order.status))}
                  eventHandlers={{ click: () => handleSelectOrder(order) }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <p className="font-semibold text-[13px]">{order.productName}</p>
                      <p className="text-[11px] text-gray-500">{order.trackingNumber}</p>
                      <p className="text-[11px] mt-1" style={{ color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedOrder && (
                <>
                  <Marker position={[selectedOrder.destinationLat, selectedOrder.destinationLng]} icon={createDestIcon()}>
                    <Popup><span className="text-[12px] font-semibold">Destination: {selectedOrder.destinationCity}</span></Popup>
                  </Marker>
                  {selectedOrder.events.length > 0 && (
                    <Marker
                      position={[selectedOrder.events[0].lat, selectedOrder.events[0].lng]}
                      icon={createOriginIcon()}
                    >
                      <Popup><span className="text-[12px] font-semibold">Origin: {selectedOrder.originCity}</span></Popup>
                    </Marker>
                  )}
                  <Polyline
                    positions={selectedOrder.events.map((e) => [e.lat, e.lng] as [number, number])}
                    pathOptions={{ color: STATUS_COLORS[selectedOrder.status], weight: 3, opacity: 0.7, dashArray: '8 8' }}
                  />
                  <Polyline
                    positions={[
                      [selectedOrder.events[selectedOrder.events.length - 1].lat, selectedOrder.events[selectedOrder.events.length - 1].lng],
                      [selectedOrder.destinationLat, selectedOrder.destinationLng],
                    ]}
                    pathOptions={{ color: '#FF3B30', weight: 2, opacity: 0.4, dashArray: '4 8' }}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* ─── Detail Panel ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {detailOpen && selectedOrder && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 bottom-0 w-[380px] z-[1050] bg-surface/95 backdrop-blur-2xl border-l border-glass-border overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-glass-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-[10px] bg-surface-secondary/60 flex items-center justify-center text-[20px]">
                        {selectedOrder.productImage}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-ink">{selectedOrder.productName}</p>
                        <p className="text-[11px] text-ink-quaternary">{selectedOrder.id.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetailOpen(false)}
                      className="w-8 h-8 rounded-full bg-surface-secondary/60 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                    >
                      <X className="h-4 w-4 text-ink-secondary" />
                    </button>
                  </div>

                  {/* Status Bar */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                    style={{ background: `${STATUS_COLORS[selectedOrder.status]}15` }}
                  >
                    <span className="text-[18px]">{STATUS_ICONS[selectedOrder.status]}</span>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: STATUS_COLORS[selectedOrder.status] }}>
                        {STATUS_LABELS[selectedOrder.status]}
                      </p>
                      {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                        <p className="text-[11px] text-ink-quaternary">
                          ETA: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto">
                      {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                        <OrderCountdown date={selectedOrder.estimatedDelivery} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Product Info */}
                  <div className="p-3 rounded-[12px] bg-surface-secondary/40 border border-glass-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] text-ink-tertiary">Quantity</span>
                      <span className="text-[13px] font-semibold text-ink">{selectedOrder.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] text-ink-tertiary">Total Amount</span>
                      <span className="text-[15px] font-bold text-ink">{formatPrice(selectedOrder.totalAmount, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-ink-tertiary">Carrier</span>
                      <span className="text-[13px] font-semibold text-ink">{selectedOrder.carrier}</span>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  <div className="p-3 rounded-[12px] bg-surface-secondary/40 border border-glass-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-ink-quaternary mb-0.5">Tracking Number</p>
                        <p className="text-[13px] font-mono font-semibold text-ink">{selectedOrder.trackingNumber}</p>
                      </div>
                      <button
                        onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                        className="w-8 h-8 rounded-[8px] bg-surface-secondary/60 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                      >
                        {copied ? <Check className="h-4 w-4 text-[#34C759]" /> : <Copy className="h-4 w-4 text-ink-secondary" />}
                      </button>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="p-3 rounded-[12px] bg-surface-secondary/40 border border-glass-border">
                    <p className="text-[11px] text-ink-quaternary mb-2">Route</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-center">
                        <MapPin className="h-4 w-4 text-[#007AFF] mx-auto mb-1" />
                        <p className="text-[12px] font-semibold text-ink">{selectedOrder.originCity}</p>
                        <p className="text-[10px] text-ink-quaternary">{selectedOrder.originCountry}</p>
                      </div>
                      <div className="flex items-center gap-1 text-ink-quaternary">
                        <div className="w-8 h-px bg-ink-quaternary/30" />
                        <Truck className="h-4 w-4" />
                        <div className="w-8 h-px bg-ink-quaternary/30" />
                      </div>
                      <div className="flex-1 text-center">
                        <MapPin className="h-4 w-4 text-[#FF3B30] mx-auto mb-1" />
                        <p className="text-[12px] font-semibold text-ink">{selectedOrder.destinationCity}</p>
                        <p className="text-[10px] text-ink-quaternary">{selectedOrder.destinationZone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="p-3 rounded-[12px] bg-surface-secondary/40 border border-glass-border">
                    <p className="text-[11px] text-ink-quaternary mb-2">Customer</p>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-ink-quaternary" />
                      <span className="text-[13px] text-ink">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-ink-quaternary" />
                      <span className="text-[13px] text-ink">{selectedOrder.customerPhone}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="text-[13px] font-bold text-ink mb-3">Tracking Timeline</p>
                    <div className="space-y-0">
                      {[...selectedOrder.events].reverse().map((event, i) => (
                        <TimelineStep
                          key={i}
                          event={event as { status: TrackingStatus; timestamp: string; location: string; lat: number; lng: number; note: string }}
                          isLast={i === selectedOrder.events.length - 1}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* ─── PRICING TAB ────────────────────────────────────────────────── */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1">Delivery Pricing</h1>
              <p className="text-[15px] text-ink-tertiary mb-8">Fair and transparent pricing across East Africa</p>
            </motion.div>

            {/* Price Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-material rounded-[16px] border border-glass-border p-6 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-[#007AFF]" />
                <h2 className="text-[17px] font-bold text-ink">Price Calculator</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-[11px] text-ink-quaternary font-semibold mb-1 block">Origin Country</label>
                  <select
                    value={calcOriginCountry}
                    onChange={(e) => { setCalcOriginCountry(e.target.value); setCalcOriginCity(getCitiesByCountry(e.target.value)[0]?.city || ''); }}
                    className="w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink outline-none"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-ink-quaternary font-semibold mb-1 block">Origin City</label>
                  <select
                    value={calcOriginCity}
                    onChange={(e) => setCalcOriginCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink outline-none"
                  >
                    {calcOriginCities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-ink-quaternary font-semibold mb-1 block">Destination Country</label>
                  <select
                    value={calcDestCountry}
                    onChange={(e) => { setCalcDestCountry(e.target.value); setCalcDestCity(getCitiesByCountry(e.target.value)[0]?.city || ''); }}
                    className="w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink outline-none"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-ink-quaternary font-semibold mb-1 block">Destination City</label>
                  <select
                    value={calcDestCity}
                    onChange={(e) => setCalcDestCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink outline-none"
                  >
                    {calcDestCities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-ink-quaternary font-semibold mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    min="0.5"
                    step="0.5"
                    className="w-full h-10 px-3 rounded-[10px] bg-surface-secondary/60 border border-glass-border text-[13px] text-ink outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 rounded-[12px] bg-[#007AFF]/5 border border-[#007AFF]/20 flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-ink-quaternary">Estimated Delivery Cost</p>
                  {crossBorder && (
                    <p className="text-[11px] text-ink-quaternary mt-0.5">Cross-border via {crossBorder.carrier} • ~{crossBorder.estimatedDays} days</p>
                  )}
                  {!crossBorder && (
                    <p className="text-[11px] text-ink-quaternary mt-0.5">Standard delivery within {calcOriginCountry}</p>
                  )}
                </div>
                <p className="text-[24px] font-bold text-[#007AFF]">{formatPrice(calcDeliveryCost, selectedCurrency)}</p>
              </div>
            </motion.div>

            {/* Nairobi Zones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FF9500]" />
                Nairobi Delivery Zones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {nairobiZones.map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="glass-material rounded-[14px] border border-glass-border p-4 hover:border-[#007AFF]/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: zone.color }} />
                      <span className="text-[13px] font-bold text-ink">{zone.name}</span>
                      {zone.sameDay && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#30D158]/10 text-[#30D158] text-[9px] font-bold">SAME DAY</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Base Price</span>
                        <span className="text-[12px] font-semibold text-ink">{formatPrice(zone.basePrice, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Per kg</span>
                        <span className="text-[12px] font-semibold text-ink">{formatPrice(zone.pricePerKg, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Per km</span>
                        <span className="text-[12px] font-semibold text-ink">{formatPrice(zone.pricePerKm, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-glass-border">
                        <span className="text-[11px] text-ink-quaternary">Est. Time</span>
                        <span className="text-[12px] font-semibold text-ink">{zone.estimatedMinutes} min</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Country Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#5856D6]" />
                Country & City Pricing
              </h2>
              {COUNTRIES.map((country) => {
                const cities = getCitiesByCountry(country);
                if (cities.length === 0) return null;
                return (
                  <div key={country} className="mb-6">
                    <h3 className="text-[15px] font-bold text-ink mb-3 flex items-center gap-2">
                      <span className="text-[20px]">{country === 'Kenya' ? '🇰🇪' : country === 'Tanzania' ? '🇹🇿' : country === 'Uganda' ? '🇺🇬' : '🇷🇼'}</span>
                      {country}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-glass-border">
                            <th className="text-left py-2 px-3 text-[11px] text-ink-quaternary font-semibold">City</th>
                            <th className="text-right py-2 px-3 text-[11px] text-ink-quaternary font-semibold">Standard</th>
                            <th className="text-right py-2 px-3 text-[11px] text-ink-quaternary font-semibold">Express</th>
                            <th className="text-center py-2 px-3 text-[11px] text-ink-quaternary font-semibold">Same Day</th>
                            <th className="text-right py-2 px-3 text-[11px] text-ink-quaternary font-semibold">Zones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cities.map((city) => (
                            <tr key={city.city} className="border-b border-glass-border/50 hover:bg-surface-secondary/30 transition-colors">
                              <td className="py-2.5 px-3 text-[13px] font-semibold text-ink">{city.city}</td>
                              <td className="py-2.5 px-3 text-[13px] text-ink text-right font-semibold">{formatPrice(city.standardDelivery, selectedCurrency)}</td>
                              <td className="py-2.5 px-3 text-[13px] text-[#FF9500] text-right font-semibold">{formatPrice(city.expressDelivery, selectedCurrency)}</td>
                              <td className="py-2.5 px-3 text-center">
                                {city.sameDayAvailable ? (
                                  <span className="px-2 py-0.5 rounded-full bg-[#30D158]/10 text-[#30D158] text-[10px] font-bold">YES</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-surface-secondary/60 text-ink-quaternary text-[10px] font-bold">NO</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-[12px] text-ink-secondary text-right">{city.zones.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Cross-Border Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-[#FF6482]" />
                Cross-Border Routes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CROSS_BORDER_ROUTES.map((route, i) => (
                  <motion.div
                    key={`${route.from}-${route.to}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="glass-material rounded-[14px] border border-glass-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-3 text-[18px]">
                      <span>{route.from === 'Kenya' ? '🇰🇪' : route.from === 'Tanzania' ? '🇹🇿' : route.from === 'Uganda' ? '🇺🇬' : '🇷🇼'}</span>
                      <ArrowRight className="h-4 w-4 text-ink-quaternary" />
                      <span>{route.to === 'Kenya' ? '🇰🇪' : route.to === 'Tanzania' ? '🇹🇿' : route.to === 'Uganda' ? '🇺🇬' : '🇷🇼'}</span>
                    </div>
                    <p className="text-[13px] font-bold text-ink mb-1">{route.from} → {route.to}</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Base Price</span>
                        <span className="text-[12px] font-semibold text-ink">{formatPrice(route.basePrice, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Per kg</span>
                        <span className="text-[12px] font-semibold text-ink">{formatPrice(route.pricePerKg, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-glass-border">
                        <span className="text-[11px] text-ink-quaternary">Est. Days</span>
                        <span className="text-[12px] font-semibold text-ink">{route.estimatedDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-ink-quaternary">Carrier</span>
                        <span className="text-[11px] font-semibold text-[#007AFF]">{route.carrier}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
