/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, MapPin, Phone, Mail, FileText, Shield, Landmark } from "lucide-react";
import { motion } from "motion/react";
import { IMAGES } from "../assets/images";
import ScrollReveal from "./ui/ScrollReveal";

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNav = (view: string) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-zinc-950 text-zinc-400 border-t border-zinc-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={IMAGES.warehouse.mombasa} alt="" className="w-full h-full object-cover" aria-hidden />
        <div className="absolute inset-0 bg-zinc-950/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          <div className="md:col-span-1.5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white">
                P
              </div>
              <span className="font-sans text-sm font-semibold tracking-wider text-white">PORTMETALS AFRICA</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Building Businesses. Creating Jobs. Transforming Africa. Africa&apos;s leading wholesale ecosystem for fashion entrepreneurship.
            </p>
            <p className="text-[11px] text-amber-500/80 font-mono tracking-wider">
              From Europe to Africa. Quality You Can Trust.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Solutions</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { id: "marketplace", label: "Wholesale Marketplace" },
                { id: "academy", label: "Business Growth Academy" },
                { id: "tech", label: "Refurbished Tech Store" },
                { id: "profile", label: "Entrepreneur Hub" },
              ].map((link) => (
                <li key={link.id}>
                  <motion.button
                    onClick={() => handleNav(link.id)}
                    whileHover={{ x: 4, color: "#f59e0b" }}
                    className="hover:text-amber-500 transition-colors text-left"
                  >
                    {link.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Showrooms & Hubs</h4>
            <ul className="space-y-3 text-xs text-zinc-400">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Mombasa Showroom & Warehouse</p>
                  <p className="text-[11px] text-zinc-500">Mombasa-Malindi Highway, Shanzu</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Nairobi Consultation Suite</p>
                  <p className="text-[11px] text-zinc-500">Galana Road, Kilimani, Nairobi</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Contact & Hours</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>Mon - Sat: 8:00 AM - 5:30 PM</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                <span>+254 700 000 000 / +255 700 000 000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                <span>info@portmetalsafrica.com</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <div className="relative z-10 mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500">
          <p>© {currentYear} Portmetals Africa General Supplies & Services. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {[
              { id: "legal-terms", icon: FileText, label: "Terms of Service" },
              { id: "legal-privacy", icon: Shield, label: "Privacy Policy" },
              { id: "legal-cookie", icon: Landmark, label: "Cookie Policy" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="hover:text-zinc-300 transition-colors flex items-center space-x-1"
              >
                <link.icon className="h-3 w-3" />
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
