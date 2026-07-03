/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import HeroScene3D from "../3d/HeroScene3D";
import ScrollReveal from "../ui/ScrollReveal";
import AnimatedCounter from "../ui/AnimatedCounter";
import { IMAGES } from "../../assets/images";

interface HomeHeroProps {
  onShopWholesale: () => void;
  onAcademy: () => void;
  onShowroom: () => void;
}

export default function HomeHero({ onShopWholesale, onAcademy, onShowroom }: HomeHeroProps) {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-center overflow-hidden hero-gradient border-b border-zinc-200/60">
      <HeroScene3D className="opacity-40 md:opacity-60 pointer-events-none" />

      {/* Background fashion image layer */}
      <div className="absolute inset-0 -z-10">
        <img
          src={IMAGES.hero.main}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] mix-blend-multiply"
          aria-hidden
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <ScrollReveal direction="up" delay={0.1}>
              <motion.div
                className="inline-flex items-center space-x-2 glass-panel px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.15em] text-amber-800 uppercase"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Africa&apos;s Leading Wholesale Ecosystem</span>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 leading-[1.02]">
                Building Africa&apos;s Next Generation of{" "}
                <span className="text-gradient-brand">Fashion Entrepreneurs</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Quality sorted fashion. Affordable technology. Business training. Reliable supply. Everything you need to start and grow your business — from Europe to Africa.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3.5 pt-2">
                <motion.button
                  onClick={onShopWholesale}
                  whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-950 text-white rounded-full font-semibold text-xs tracking-wider uppercase shadow-xl flex items-center justify-center space-x-2 group"
                >
                  <span>Shop Wholesale</span>
                  <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  onClick={onAcademy}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-4 glass-panel text-zinc-800 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  <span>Business Academy</span>
                </motion.button>

                <motion.button
                  onClick={onShowroom}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent text-zinc-600 rounded-full border border-zinc-300 font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 hover:bg-white/50"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Visit Showroom</span>
                </motion.button>
              </div>
            </ScrollReveal>
          </div>

          {/* Hero visual panel */}
          <ScrollReveal direction="left" delay={0.3} className="hidden lg:block">
            <div className="relative">
              <motion.div
                className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-zinc-900/20 border border-white/60"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={IMAGES.warehouse.sorting}
                  alt="Portmetals Africa warehouse sorting facility"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 image-overlay-gradient" />
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">Mombasa Warehouse</p>
                  <p className="text-xl font-bold text-white">Always Ready Stock. Fast Delivery.</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 glass-panel rounded-2xl p-4 shadow-xl"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">From Europe to Africa</p>
                <p className="text-sm font-bold text-zinc-900">Quality You Can Trust</p>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>

        {/* Impact stats */}
        <ScrollReveal delay={0.5} className="mt-20 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: 100, suffix: "%", label: "Sorted Guarantee", sub: "No random mixed bales" },
              { value: 5000, suffix: "+", label: "Businesses Supported", sub: "Across East Africa" },
              { value: 22, suffix: "", label: "Premium Categories", sub: "European grade standards" },
              { value: 12, suffix: " Mo", label: "Tech Warranty", sub: "Certified refurbished gear" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-panel rounded-[20px] p-6 text-center hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-extrabold text-zinc-900">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.5} />
                </p>
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mt-2">{stat.label}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
