/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from "react";
import ScrollReveal from "../ui/ScrollReveal";

interface PageBannerProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  children?: ReactNode;
}

export default function PageBanner({ eyebrow, title, description, image, children }: PageBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-zinc-200/50 shadow-sm mb-10">
      <div className="absolute inset-0">
        <img src={image} alt="" className="w-full h-full object-cover" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/75 to-zinc-950/40" />
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center min-h-[220px]">
        <ScrollReveal className="space-y-3 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
            {eyebrow}
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">{title}</h1>
          <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
        </ScrollReveal>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </section>
  );
}
