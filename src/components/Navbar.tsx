/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ShoppingBag, BookOpen, Cpu, ShieldCheck, HelpCircle, LogIn, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  selectedCurrency: "TZS" | "KES" | "USD";
  onCurrencyChange: (currency: "TZS" | "KES" | "USD") => void;
  user: { name: string } | null;
  onOpenCart: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  selectedCurrency,
  onCurrencyChange,
  user,
  onOpenCart,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Overview", icon: ShieldCheck },
    { id: "marketplace", label: "Wholesale Shop", icon: ShoppingBag },
    { id: "academy", label: "Growth Academy", icon: BookOpen },
    { id: "tech", label: "Refurbished Tech", icon: Cpu },
    { id: "contact", label: "Showrooms", icon: HelpCircle },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass-panel shadow-sm border-b border-zinc-200/60" : "bg-white/50 backdrop-blur-md border-b border-zinc-200/30"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            onClick={() => handleNavClick("home")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex cursor-pointer items-center space-x-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white shadow-lg shadow-amber-600/30">
              P
            </div>
            <div>
              <span className="font-sans text-sm font-semibold tracking-wider text-zinc-950">PORTMETALS</span>
              <span className="ml-1 text-xs font-bold tracking-widest text-amber-600">AFRICA</span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center space-x-1.5 px-3.5 h-9 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-950 text-white font-semibold shadow-md"
                      : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center bg-zinc-100/80 p-0.5 rounded-full border border-zinc-200/60">
              {(["TZS", "KES", "USD"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                    selectedCurrency === curr
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <motion.button
              onClick={onOpenCart}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-zinc-950"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            <motion.button
              onClick={() => handleNavClick("profile")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex h-9 items-center space-x-1.5 px-3.5 rounded-full border transition-all ${
                currentView === "profile"
                  ? "border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold"
                  : "border-zinc-200/80 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {user ? (
                <>
                  <User className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-medium max-w-[80px] truncate">{user.name}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Get Started</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <motion.button
              onClick={onOpenCart}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-zinc-950">
                  {cartCount}
                </span>
              )}
            </motion.button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-800 hover:bg-zinc-50"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl md:hidden overflow-hidden"
          >
            <div className="space-y-1.5 px-4 pt-2 pb-6">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}

              <div className="border-t border-zinc-100 my-3 pt-3 flex items-center justify-between px-3">
                <span className="text-[11px] font-semibold text-zinc-400">CURRENCY</span>
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-full border border-zinc-200">
                  {(["TZS", "KES", "USD"] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => onCurrencyChange(curr)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                        selectedCurrency === curr ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleNavClick("profile")}
                className="flex w-full items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-medium"
              >
                <User className="h-3.5 w-3.5" />
                <span>{user ? `${user.name}'s Dashboard` : "Get Started / Register"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
