import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Check, Lock, Truck, CreditCard,
  Smartphone, Building2, Banknote, ShoppingBag, Package, X
} from "lucide-react";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../data/platform";
import { Currency, Product } from "../../types";
import { useStore } from "../../store/useStore";
import MagneticButton from "../../components/three/MagneticButton";

interface CheckoutPageProps {
  cart: Product[];
  selectedCurrency: Currency;
  onNavigate: (view: string) => void;
  onRemoveFromCart: (index: number) => void;
}

const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, desc: "Pay via M-Pesa STK Push", badge: "Instant", badgeColor: "#30D158" },
  { id: "airtel", label: "Airtel Money", icon: Smartphone, desc: "Pay via Airtel Money", badge: "Instant", badgeColor: "#30D158" },
  { id: "bank", label: "Bank Transfer", icon: Building2, desc: "Direct bank transfer", badge: "2-4 hrs", badgeColor: "#FF9500" },
  { id: "card", label: "Card Payment", icon: CreditCard, desc: "Visa / Mastercard", badge: "Secure", badgeColor: "#007AFF" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when order arrives", badge: "COD", badgeColor: "#AF52DE" },
];

const COUNTRIES = ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "DRC", "South Africa", "Other"];

export default function CheckoutPage({ cart, selectedCurrency, onNavigate, onRemoveFromCart }: CheckoutPageProps) {
  const loyalty = useStore((s) => s.loyalty);
  const earnPointsFromPurchase = useStore((s) => s.earnPointsFromPurchase);
  const clearCart = useStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [shipping, setShipping] = useState({
    name: "", phone: "", email: "", address: "", city: "", country: "Tanzania", notes: "",
  });
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const subtotal = cart.reduce((sum, p) => sum + p.price.amount, 0);
  const shippingCost = subtotal > 500000 ? 0 : 25000;
  const total = subtotal + shippingCost;

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

  const handlePlaceOrder = () => {
    const id = `PM-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setOrderId(id);
    earnPointsFromPurchase(total);
    clearCart();
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
              onClick={() => { if (s.num < step && !orderPlaced) setStep(s.num); }}
              className={`flex items-center gap-2 h-10 px-4 rounded-full transition-all duration-300 ${
                step === s.num
                  ? "bg-ink text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
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
                  <input type="tel" required value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all" placeholder="+255 700 000 000" />
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
                  return (
                    <motion.button
                      key={pm.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(pm.id)}
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

                      {/* Payment-specific inputs */}
                      {selected && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="mt-4 pt-4 border-t border-glass-border/30">
                          {pm.id === "mpesa" && (
                            <div>
                              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">M-Pesa Phone Number</label>
                              <input type="tel" value={mpesaPhone || shipping.phone} onChange={(e) => setMpesaPhone(e.target.value)} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="+255 700 000 000" />
                              <p className="text-caption text-ink-quaternary mt-1.5">You'll receive an STK push prompt on your phone to confirm payment.</p>
                            </div>
                          )}
                          {pm.id === "airtel" && (
                            <div>
                              <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Airtel Money Phone Number</label>
                              <input type="tel" value={airtelPhone || shipping.phone} onChange={(e) => setAirtelPhone(e.target.value)} className="w-full h-11 px-4 bg-surface-secondary/60 border border-glass-border rounded-[12px] text-body text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="+255 700 000 000" />
                              <p className="text-caption text-ink-quaternary mt-1.5">You'll receive a payment prompt on your phone.</p>
                            </div>
                          )}
                          {pm.id === "bank" && (
                            <div className="space-y-2.5">
                              <div className="grid grid-cols-2 gap-3 text-caption">
                                <div><span className="text-ink-quaternary">Bank:</span> <span className="font-semibold text-ink ml-1">National Bank of Tanzania</span></div>
                                <div><span className="text-ink-quaternary">Account Name:</span> <span className="font-semibold text-ink ml-1">PortMetals Africa Ltd</span></div>
                                <div><span className="text-ink-quaternary">Account No:</span> <span className="font-semibold text-ink ml-1">0123456789</span></div>
                                <div><span className="text-ink-quaternary">Reference:</span> <span className="font-semibold text-ink ml-1">Your phone number</span></div>
                              </div>
                              <p className="text-caption text-ink-quaternary">Transfer will be verified within 2-4 hours. Your order will be processed after confirmation.</p>
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
              </div>

              {/* Order Summary */}
              <div>
                <div className="glass-material rounded-[20px] p-5 sm:p-6 border border-glass-border/30 sticky top-20">
                  <h3 className="text-subhead font-bold text-ink mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart.map((p, i) => (
                      <div key={`${p.id}-${i}`} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-[10px] bg-surface-secondary/60 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-ink-quaternary" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-caption font-semibold text-ink truncate">{p.name}</p>
                            <p className="text-[10px] text-ink-quaternary">{p.category}</p>
                          </div>
                        </div>
                        <span className="text-caption font-bold text-ink shrink-0">{formatPrice(p.price.amount, selectedCurrency)}</span>
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
                  </div>
                  <div className="glass-divider mb-4" />
                  <div className="flex justify-between mb-5">
                    <span className="text-subhead font-bold text-ink">Total</span>
                    <span className="text-headline font-bold text-ink tracking-tight">{formatPrice(total, selectedCurrency)}</span>
                  </div>
                  <p className="text-[10px] text-brand text-center mb-3">You'll earn ~{Math.floor(total / 100)} loyalty points on this order</p>
                  <div className="flex gap-3">
                    <Button variant="secondary" size="lg" onClick={() => setStep(1)} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
                    <MagneticButton strength={0.15} className="flex-1">
                      <Button variant="primary" size="lg" fullWidth icon={<Lock className="h-4 w-4" />} onClick={handlePlaceOrder}>
                        Place Order
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="glass-material rounded-[20px] p-8 sm:p-12 border border-glass-border/30 text-center max-w-lg mx-auto">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }} className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }}>
                  <Check className="h-10 w-10 text-success" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-title font-bold text-ink mb-2">Order Placed Successfully!</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-callout text-ink-tertiary mb-6">Thank you for your order. We'll send you a confirmation shortly.</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-material rounded-[14px] p-4 space-y-2 mb-6 text-left">
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Order Number</span><span className="text-caption font-bold text-ink">{orderId}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Payment</span><span className="text-caption font-bold text-ink capitalize">{PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Estimated Delivery</span><span className="text-caption font-bold text-ink">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                <div className="flex justify-between"><span className="text-caption text-ink-secondary">Loyalty Points Earned</span><span className="text-caption font-bold text-brand">~{Math.floor(total / 100)} pts</span></div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => onNavigate("home")}>Continue Shopping</Button>
                <Button variant="primary" fullWidth onClick={() => onNavigate("orders")}>View Orders</Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
