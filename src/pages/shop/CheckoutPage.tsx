import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Check, Lock, Truck, CreditCard,
  Smartphone, Building2, Banknote, ShoppingBag, Package, X, Wallet, Loader2, Award, AlertTriangle
} from "lucide-react";
import Button from "../../components/ui/Button";
import { formatPrice, calculateLoyaltyPoints } from "../../data/platform";
import { getCityPricing, resolveCityCoords } from "../../data/delivery";
import type { TrackedOrder } from "../../data/delivery";
import { Currency, CartItem } from "../../types";
import { useStore } from "../../store/useStore";
import MagneticButton from "../../components/three/MagneticButton";

interface CheckoutPageProps {
  cart: CartItem[];
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onRemoveFromCart: (index: number) => void;
}

const PAYMENT_METHODS = [
  { id: "wallet", label: "BirichiNex Wallet", icon: Wallet, desc: "Pay instantly with your wallet balance", badge: "Instant", badgeColor: "#d4af37" },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, desc: "Pay via M-Pesa STK Push", badge: "Instant", badgeColor: "#30D158" },
  { id: "airtel", label: "Airtel Money", icon: Smartphone, desc: "Pay via Airtel Money", badge: "Instant", badgeColor: "#30D158" },
  { id: "bank", label: "Bank Transfer", icon: Building2, desc: "Direct bank transfer", badge: "2-4 hrs", badgeColor: "#FF9500" },
  { id: "card", label: "Card Payment", icon: CreditCard, desc: "Visa / Mastercard", badge: "Secure", badgeColor: "#007AFF" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when order arrives", badge: "COD", badgeColor: "#AF52DE" },
];

const COUNTRIES = ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "DRC", "South Africa", "Other"];
const COD_CITIES = ["dar es salaam", "nairobi", "kampala"];

export default function CheckoutPage({ cart, selectedCurrency, onNavigate, onRemoveFromCart }: CheckoutPageProps) {
  const loyalty = useStore((s) => s.loyalty);
  const wallet = useStore((s) => s.wallet);
  const cartRedeem = useStore((s) => s.cartRedeem);
  const clearCartRedeem = useStore((s) => s.clearCartRedeem);
  const earnPointsFromPurchase = useStore((s) => s.earnPointsFromPurchase);
  const clearCart = useStore((s) => s.clearCart);
  const addOrder = useStore((s) => s.addOrder);
  const spendWalletFunds = useStore((s) => s.spendWalletFunds);
  const awardWalletCashback = useStore((s) => s.awardWalletCashback);
  const redeemLoyaltyPoints = useStore((s) => s.redeemLoyaltyPoints);
  const user = useStore((s) => s.user);
  const setPendingGuestRewards = useStore((s) => s.setPendingGuestRewards);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showAccountOffer, setShowAccountOffer] = useState(false);
  const [confirmation, setConfirmation] = useState<{ total: number; points: number; cashback: number; paymentLabel: string; method: string } | null>(null);

  const [shipping, setShipping] = useState({
    name: "", phone: "", email: "", address: "", city: "", country: "Tanzania", notes: "",
  });
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const unitCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  const shippingCost = subtotal > 500000 ? 0 : 25000;
  const redeemValue = cartRedeem?.value ?? 0;
  const total = Math.max(0, subtotal + shippingCost - redeemValue);
  const pointsOnOrder = calculateLoyaltyPoints(total, loyalty.currentTier);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const shippingValid = shipping.name && shipping.phone && shipping.email && shipping.address && shipping.city;

  const validatePayment = (): string | null => {
    switch (paymentMethod) {
      case "wallet":
        if (wallet.balance < total) return "Insufficient wallet balance. Top up in Payments first.";
        return null;
      case "mpesa": {
        const phone = (mpesaPhone || shipping.phone).replace(/\s/g, "");
        if (!/^\+?\d{9,15}$/.test(phone)) return "Enter a valid M-Pesa phone number.";
        return null;
      }
      case "airtel": {
        const phone = (airtelPhone || shipping.phone).replace(/\s/g, "");
        if (!/^\+?\d{9,15}$/.test(phone)) return "Enter a valid Airtel Money phone number.";
        return null;
      }
      case "card": {
        if (cardNumber.replace(/\D/g, "").length !== 16) return "Enter a valid 16-digit card number.";
        const m = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
        if (!m) return "Enter expiry as MM/YY.";
        const month = parseInt(m[1], 10);
        if (month < 1 || month > 12) return "Invalid expiry month.";
        const year = 2000 + parseInt(m[2], 10);
        if (new Date(year, month, 0, 23, 59, 59) < new Date()) return "Card has expired.";
        if (cardCvv.length < 3) return "Enter a valid CVV.";
        return null;
      }
      case "cod":
        if (!COD_CITIES.includes(shipping.city.trim().toLowerCase())) {
          return "Cash on Delivery is only available in Dar es Salaam, Nairobi, and Kampala.";
        }
        return null;
      default:
        return null;
    }
  };

  const handlePlaceOrder = () => {
    setPayError("");
    const err = validatePayment();
    if (err) {
      setPayError(err);
      return;
    }
    setProcessing(true);
    window.setTimeout(() => finalizeOrder(), 1100);
  };

  const finalizeOrder = () => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    const trackingNumber = `PM-TRK-${ymd}-${seq}`;
    const orderId = trackingNumber;

    const originCity = "Dar es Salaam";
    const originCountry = "Tanzania";
    const originCoords = resolveCityCoords(originCity, originCountry);
    const destCity = shipping.city.trim() || "Dar es Salaam";
    const destCountry = shipping.country.trim() || "Tanzania";
    const destPricing = getCityPricing(destCity, destCountry);
    const destCoords = destPricing
      ? { lat: destPricing.lat, lng: destPricing.lng, zone: destPricing.zones[0]?.name ?? destPricing.city }
      : { lat: resolveCityCoords(destCity, destCountry).lat, lng: resolveCityCoords(destCity, destCountry).lng, zone: "CBD" };

    const first = cart[0];
    const itemLabel = unitCount > 1 ? `${first.product.name} +${unitCount - 1} more` : first.product.name;

    if (paymentMethod === "wallet") {
      const ok = spendWalletFunds(total, `Order ${orderId} — ${itemLabel}`);
      if (!ok) {
        setProcessing(false);
        setPayError("Insufficient wallet balance. Top up in Payments first.");
        return;
      }
    }

    if (cartRedeem) {
      redeemLoyaltyPoints(cartRedeem.points, `Redeemed for order discount (${orderId})`);
    }
    const cashback = Math.floor(total * 0.01);
    if (user) {
      earnPointsFromPurchase(total);
      if (cashback > 0) {
        awardWalletCashback(cashback, `Order cashback (${orderId})`);
      }
    } else {
      // Guest purchase: the order is fully placed, but cashback + loyalty
      // points are held back and offered on the confirmation screen. They are
      // credited automatically when the shopper creates an account.
      setPendingGuestRewards({ total, orderId: trackingNumber });
      setShowAccountOffer(true);
    }

    const paymentLabel = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? "Wallet";

    const order: TrackedOrder = {
      id: `ord-${Date.now()}`,
      kind: "order",
      productName: itemLabel,
      productImage: "📦",
      quantity: unitCount,
      totalAmount: total,
      currency: selectedCurrency,
      status: "placed",
      originCity,
      originCountry,
      destinationCity: destCity,
      destinationCountry: destCountry,
      destinationZone: destCoords.zone,
      destinationLat: destCoords.lat,
      destinationLng: destCoords.lng,
      currentLat: originCoords.lat,
      currentLng: originCoords.lng,
      trackingNumber,
      carrier: "PortMetrics Express",
      createdAt: now.toISOString(),
      estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        { status: "placed", timestamp: now.toISOString(), location: originCity, lat: originCoords.lat, lng: originCoords.lng, note: "Order placed successfully" },
        { status: "confirmed", timestamp: new Date(now.getTime() + 15 * 60000).toISOString(), location: originCity, lat: originCoords.lat, lng: originCoords.lng, note: "Order confirmed — preparing your items" },
      ],
      customerName: shipping.name.trim() || "Valued Customer",
      customerPhone: shipping.phone.trim() || "",
    };
    addOrder(order);

    setOrderId(orderId);
    setConfirmation({ total, points: pointsOnOrder, cashback, paymentLabel, method: paymentMethod });
    clearCartRedeem();
    clearCart();
    setProcessing(false);
    setOrderPlaced(true);
    setStep(3);
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-20 text-center">
        <div className="h-20 w-20 rounded-[22px] bg-surface-secondary/80 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="h-8 w-8 text-ink-quaternary" strokeWidth={1.5} />
        </div>
        <p className="text-title text-ink mb-2">Your cart is empty</p>
        <p className="text-callout text-ink-tertiary mb-7">Add some items before checking out.</p>
        <MagneticButton strength={0.2}>
          <Button variant="primary" onClick={() => onNavigate("home")}>Start Shopping</Button>
        </MagneticButton>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Shipping" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-between">
        <div>
          <h1 className="text-headline text-ink tracking-tight">Checkout</h1>
          <p className="text-callout text-ink-tertiary mt-1">Complete your order</p>
        </div>
        {!orderPlaced && (
          <button onClick={() => onNavigate("cart")} className="flex items-center gap-1.5 text-subhead font-semibold text-brand-dark hover:text-brand transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Back to Cart</span>
          </button>
        )}
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => { if (s.num < step && !orderPlaced && !processing) setStep(s.num); }}
              className={`flex items-center gap-2 h-10 px-4 rounded-full transition-all duration-300 ${
                step === s.num
                  ? "bg-emphasis text-on-emphasis shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  : step > s.num
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-surface-secondary/60 text-ink-quaternary border border-glass-border"
              }`}
            >
              {step > s.num ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-caption font-bold">{s.num}</span>
              )}
              <span className="text-caption font-semibold hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-12 h-[2px] rounded-full transition-colors duration-300 ${step > s.num ? "bg-success/40" : "bg-surface-secondary"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="glass-material rounded-[20px] p-6 sm:p-8 border border-glass-border/30">
              <h2 className="text-title font-bold text-ink mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Full Name *</label>
                  <input type="text" required value={shipping.name} onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Phone Number *</label>
                  <input type="tel" required value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="+255 7XX XXX XXX" />
                </div>
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Email *</label>
                  <input type="email" required value={shipping.email} onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="john@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Delivery Address *</label>
                  <input type="text" required value={shipping.address} onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="Street address, building, apartment" />
                </div>
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">City *</label>
                  <input type="text" required value={shipping.city} onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="Dar es Salaam" />
                </div>
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Country *</label>
                  <select value={shipping.country} onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all appearance-none">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Delivery Notes</label>
                  <textarea value={shipping.notes} onChange={(e) => setShipping((s) => ({ ...s, notes: e.target.value }))} className="w-full h-20 px-4 py-3 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all resize-none" placeholder="Optional delivery instructions" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <MagneticButton strength={0.15}>
                  <Button variant="primary" size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" disabled={!shippingValid} onClick={() => setStep(2)}>
                    Continue to Payment
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-title font-bold text-ink mb-4">Payment Method</h2>
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const selected = paymentMethod === pm.id;
                  const insufficientWallet = pm.id === "wallet" && wallet.balance < total;
                  return (
                    <motion.button
                      key={pm.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setPaymentMethod(pm.id); setPayError(""); }}
                      className={`w-full text-left p-4 rounded-[16px] border transition-all duration-200 ${
                        selected
                          ? "bg-brand/5 border-brand/30 shadow-[0_0_0_1px_rgba(212,175,55,0.2)]"
                          : "bg-surface-secondary/40 border-glass-border/30 hover:border-glass-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${selected ? "bg-brand/15" : "bg-surface-secondary/60"}`}>
                          <Icon className="h-5 w-5" style={{ color: selected ? "#d4af37" : "#8e8e93" }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-subhead font-bold text-ink">{pm.label}</span>
                            <span className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold" style={{ backgroundColor: `${pm.badgeColor}15`, color: pm.badgeColor }}>{pm.badge}</span>
                          </div>
                          <p className="text-caption text-ink-tertiary mt-0.5">{pm.desc}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-brand bg-brand" : "border-ink-quaternary"}`}>
                          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {pm.id === "wallet" && (
                        <div className="mt-3 pt-3 border-t border-glass-border/30 flex items-center justify-between text-caption">
                          <span className="text-ink-secondary">Available balance</span>
                          <span className={`font-bold ${insufficientWallet ? "text-error" : "text-success"}`}>
                            {formatPrice(wallet.balance, selectedCurrency)}
                          </span>
                        </div>
                      )}

                      {/* Payment-specific inputs */}
                      {selected && pm.id !== "wallet" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="mt-4 pt-4 border-t border-glass-border/30">
                          {pm.id === "mpesa" && (
                            <div>
                              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">M-Pesa Phone Number</label>
                              <input type="tel" value={mpesaPhone || shipping.phone} onChange={(e) => setMpesaPhone(e.target.value)} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="+255 7XX XXX XXX" />
                              <p className="text-caption text-ink-quaternary mt-1.5">You'll receive an STK push prompt on your phone to confirm payment.</p>
                            </div>
                          )}
                          {pm.id === "airtel" && (
                            <div>
                              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Airtel Money Phone Number</label>
                              <input type="tel" value={airtelPhone || shipping.phone} onChange={(e) => setAirtelPhone(e.target.value)} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="+255 7XX XXX XXX" />
                              <p className="text-caption text-ink-quaternary mt-1.5">You'll receive a payment prompt on your phone.</p>
                            </div>
                          )}
                          {pm.id === "bank" && (
                            <div className="space-y-2.5">
                              <div className="grid grid-cols-1 gap-2 text-caption">
                                <div className="flex items-start gap-2 rounded-[10px] bg-surface-secondary/50 border border-glass-border p-3">
                                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                                  <p className="text-ink-secondary leading-relaxed">
                                    Pay by bank transfer to the account details listed on this shop's storefront, then your
                                    order is confirmed once the shop verifies the payment. The shop's bank details are shown
                                    on its contact page.
                                  </p>
                                </div>
                              </div>
                              <p className="text-caption text-ink-quaternary">Orders paid by transfer are verified before fulfilment.</p>
                            </div>
                          )}
                          {pm.id === "card" && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Card Number</label>
                                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="1234 5678 9012 3456" maxLength={19} />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Expiry</label>
                                  <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="MM/YY" maxLength={5} />
                                </div>
                                <div>
                                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">CVV</label>
                                  <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="***" maxLength={4} />
                                </div>
                              </div>
                              <p className="text-caption text-ink-quaternary">Your card details are encrypted and secure. We accept Visa and Mastercard.</p>
                            </div>
                          )}
                          {pm.id === "cod" && (
                            <p className="text-caption text-ink-quaternary">Available in Dar es Salaam, Nairobi, and Kampala only. Pay with cash when your order arrives.</p>
                          )}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                {payError && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-caption text-error bg-error/5 border border-error/20 rounded-[12px] px-4 py-3">
                    <X className="h-4 w-4 shrink-0" />
                    {payError}
                  </motion.div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <div className="glass-material rounded-[20px] p-5 sm:p-6 border border-glass-border/30 sticky top-20">
                  <h3 className="text-subhead font-bold text-ink mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item, i) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-[10px] bg-surface-secondary/60 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-caption font-semibold text-ink truncate">{item.product.name}</p>
                            <p className="text-[10px] text-ink-quaternary">{item.quantity} × {formatPrice(item.unitPrice.amount, selectedCurrency)}</p>
                          </div>
                          <button onClick={() => onRemoveFromCart(i)} className="text-ink-quaternary hover:text-error transition-colors ml-1 shrink-0" aria-label={`Remove ${item.product.name}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-caption font-bold text-ink shrink-0">{formatPrice(item.unitPrice.amount * item.quantity, selectedCurrency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass-divider mb-4" />
                  <div className="space-y-2.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-caption text-ink-secondary">Subtotal</span>
                      <span className="text-caption font-bold text-ink">{formatPrice(subtotal, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-caption text-ink-secondary">Shipping</span>
                      <span className="text-caption font-bold text-ink">{shippingCost === 0 ? "Free" : formatPrice(shippingCost, selectedCurrency)}</span>
                    </div>
                    {shippingCost === 0 && <p className="text-[10px] text-success font-semibold">Free shipping on orders over {formatPrice(500000, selectedCurrency)}!</p>}
                    {cartRedeem && (
                      <div className="flex justify-between text-success">
                        <span className="text-caption font-semibold">Points Discount</span>
                        <span className="text-caption font-bold">-{formatPrice(cartRedeem.value, selectedCurrency)}</span>
                      </div>
                    )}
                  </div>
                  <div className="glass-divider mb-4" />
                  <div className="flex justify-between mb-3">
                    <span className="text-subhead font-bold text-ink">Total</span>
                    <span className="text-headline font-bold text-ink tracking-tight">{formatPrice(total, selectedCurrency)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand mb-4">
                    <Award className="h-3 w-3" />
                    <span className="text-center">
                      {user ? (
                        <>You'll earn {pointsOnOrder} point{pointsOnOrder !== 1 ? "s" : ""} + {Math.floor(total * 0.01)} cashback on this order</>
                      ) : (
                        <>Earn {pointsOnOrder} point{pointsOnOrder !== 1 ? "s" : ""} + {Math.floor(total * 0.01)} cashback — claimable with a free account</>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" size="lg" onClick={() => setStep(1)} icon={<ArrowLeft className="h-4 w-4" />} disabled={processing}>Back</Button>
                    <MagneticButton strength={0.15} className="flex-1">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        onClick={handlePlaceOrder}
                        disabled={processing}
                      >
                        {processing ? "Processing Payment..." : "Place Order"}
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && confirmation && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="glass-material rounded-[20px] p-8 sm:p-12 border border-glass-border/30 text-center max-w-lg mx-auto">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }} className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }}>
                  <Check className="h-10 w-10 text-success" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-title font-bold text-ink mb-2">
                {confirmation.method === "wallet" ? "Payment Successful!" : "Order Placed Successfully!"}
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-callout text-ink-tertiary mb-6">
                Thank you for your order. We'll send you a confirmation shortly.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-material rounded-[14px] p-4 space-y-2 mb-6 text-left">
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Tracking Number</span><span className="text-caption font-bold text-ink font-mono">{orderId}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Payment</span><span className="text-caption font-bold text-ink">{confirmation.paymentLabel}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Amount Paid</span><span className="text-caption font-bold text-ink">{formatPrice(confirmation.total, selectedCurrency)}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Estimated Delivery</span><span className="text-caption font-bold text-ink">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Loyalty Points Earned</span><span className="text-caption font-bold text-brand">+{confirmation.points} pts</span></div>
                {confirmation.cashback > 0 && (
                  <div className="flex justify-between"><span className="text-caption text-ink-secondary">Wallet Cashback</span><span className="text-caption font-bold text-success">+{formatPrice(confirmation.cashback, selectedCurrency)}</span></div>
                )}
              </motion.div>
              {showAccountOffer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="rounded-[16px] border border-brand/25 bg-brand/5 p-4 mb-6 text-left"
                >
                  <p className="text-callout font-semibold text-ink mb-1">
                    Your order is safe — now keep it forever.
                  </p>
                  <p className="text-caption text-ink-secondary mb-3">
                    Create a free account to save this order to your history and claim{" "}
                    <span className="font-semibold text-brand">+{confirmation.points} pts</span>
                    {confirmation.cashback > 0 && (
                      <> and <span className="font-semibold text-success">+{formatPrice(confirmation.cashback, selectedCurrency)}</span> cashback</>
                    )}{" "}
                    waiting for you. No login needed to shop — only when you want the power of BirichiNex.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => useStore.getState().setAuthView("signup")}
                      icon={<Award className="h-3.5 w-3.5" />}
                    >
                      Create free account
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowAccountOffer(false)}>
                      Maybe later
                    </Button>
                  </div>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => onNavigate("home")}>Continue Shopping</Button>
                <Button variant="primary" fullWidth onClick={() => onNavigate("orders")}>Track My Order</Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
