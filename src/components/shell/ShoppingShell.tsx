import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Currency } from "../../types";
import { formatPrice } from "../../data/platform";
import FloatingPillNav from "./FloatingPillNav";

interface ShoppingShellProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  cartCount: number;
  userName?: string;
  isSubscribed: boolean;
  onToggleMode: () => void;
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
  loyaltyPoints?: number;
}

export default function ShoppingShell({
  selectedCurrency,
  onCurrencyChange,
  cartCount,
  userName = "Guest",
  isSubscribed,
  onToggleMode,
  children,
  onNavigate,
  currentView,
  loyaltyPoints = 0,
}: ShoppingShellProps) {
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Auto-dismiss announcement after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setDismissedBanner(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface-secondary relative">
      {/* Ambient Background Orbs — Always Visible */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.07)_0%,transparent_70%)] blur-[100px] animate-[orbFloat_25s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.05)_0%,transparent_70%)] blur-[100px] animate-[orbFloatInverse_30s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.04)_0%,transparent_70%)] blur-[80px] animate-[orbFloat_35s_ease-in-out_infinite]" />
      </div>

      {/* Top Announcement Bar — Auto-dismisses */}
      <AnimatePresence>
        {!dismissedBanner && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-ink text-white text-center py-2 px-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_8s_ease-in-out_infinite] bg-[length:200%_100%]" />
            <p className="text-caption font-semibold tracking-wide relative z-10">
              Free shipping on orders over {formatPrice(500000, selectedCurrency)} · Premium European-sorted fashion · Certified refurbished tech
            </p>
            <button
              onClick={() => setDismissedBanner(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content — Padding for pill at bottom */}
      <main className="min-h-screen relative z-10 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer — Premium Dark Glass */}
      <footer className="relative z-10">
        <div className="glass-divider mx-8" />
        <div className="bg-ink/[0.97] text-white backdrop-blur-sm pb-28">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              <div>
                <h4 className="text-subhead font-bold mb-5 text-white/90">Shop</h4>
                <div className="space-y-2.5">
                  {["Fashion", "Technology", "New Arrivals", "Best Sellers", "Deals"].map((item) => (
                    <button key={item} className="block text-caption text-zinc-400 hover:text-white transition-colors duration-200">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-subhead font-bold mb-5 text-white/90">Support</h4>
                <div className="space-y-2.5">
                  {["Help Center", "Shipping Info", "Returns", "Track Order", "Contact Us"].map((item) => (
                    <button key={item} className="block text-caption text-zinc-400 hover:text-white transition-colors duration-200">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-subhead font-bold mb-5 text-white/90">Company</h4>
                <div className="space-y-2.5">
                  {["About Us", "Careers", "Press", "Sustainability", "Partners"].map((item) => (
                    <button key={item} className="block text-caption text-zinc-400 hover:text-white transition-colors duration-200">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-subhead font-bold mb-5 text-white/90">Business</h4>
                <div className="space-y-2.5">
                  <p className="text-caption text-zinc-400 leading-relaxed">Grow your business with BirichiNex™️ OS.</p>
                  <button
                    onClick={onToggleMode}
                    className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand hover:text-brand-light transition-colors duration-200 mt-2"
                  >
                    Learn More <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-divider bg-white/5 mb-8" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-[8px] bg-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <span className="text-white font-bold text-xs relative z-10">B</span>
                </div>
                <span className="text-caption text-zinc-400">
                  Powered by BirichiNex™️
                </span>
              </div>
              <p className="text-caption text-zinc-500">
                &copy; 2026 BirichiNex™️. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════
          FLOATING PILL NAVIGATION
          ═══════════════════════════════════════════════ */}
      <FloatingPillNav
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
        cartCount={cartCount}
        userName={userName}
        isSubscribed={isSubscribed}
        onToggleMode={onToggleMode}
        onNavigate={onNavigate}
        currentView={currentView}
        loyaltyPoints={loyaltyPoints}
      />
    </div>
  );
}
