/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { CATEGORY_IMAGES } from "../../assets/images";
import ScrollReveal, { StaggerContainer, StaggerItem } from "../ui/ScrollReveal";
import TiltCard from "../ui/TiltCard";

interface CategoryShowcaseProps {
  onSelectCategory: (category: string) => void;
  onNavigateMarketplace: () => void;
}

const DISPLAY_CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  "Kids",
  "Sportswear",
  "Jackets",
  "Handbags",
  "Leather",
  "T-Shirts",
] as const;

export default function CategoryShowcase({ onSelectCategory, onNavigateMarketplace }: CategoryShowcaseProps) {
  return (
    <section className="py-20 px-4 md:px-12 bg-[#f5f5f7] border-b border-zinc-200/60">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-amber-600 uppercase">Shop By Category</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Professionally Sorted. <span className="text-gradient-brand">Retail Ready.</span>
          </h2>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Every category is photographed, graded, and priced transparently. Select a sector to explore wholesale lots with expected resale potential.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DISPLAY_CATEGORIES.map((cat) => {
            const meta = CATEGORY_IMAGES[cat];
            return (
              <StaggerItem key={cat}>
                <TiltCard intensity={8}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      onNavigateMarketplace();
                    }}
                    className="card-shine w-full text-left group relative rounded-[24px] overflow-hidden bg-white border border-zinc-200/60 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-shadow duration-500"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img
                        src={meta.image}
                        alt={cat}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 image-overlay-gradient" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                        <h3 className="font-bold text-lg text-white tracking-tight">{cat}</h3>
                        <p className="text-[11px] text-white/75 line-clamp-2 leading-relaxed">{meta.description}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-white">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Bale: {meta.baleSize}</span>
                        <span className="text-emerald-600 font-semibold">{meta.resale.split("—")[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">{meta.customer.split(",")[0]}</span>
                        <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <ScrollReveal delay={0.2} className="text-center mt-10">
          <motion.button
            onClick={onNavigateMarketplace}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-zinc-950 text-white rounded-full font-semibold text-xs tracking-wider uppercase shadow-lg shadow-zinc-950/20"
          >
            <span>View Full Wholesale Catalog</span>
            <ArrowRight className="h-4 w-4 text-amber-500" />
          </motion.button>
        </ScrollReveal>
      </div>
    </section>
  );
}
