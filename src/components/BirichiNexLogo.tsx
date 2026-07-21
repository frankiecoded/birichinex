import { motion } from "motion/react";

interface BirichiNexLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { text: "text-2xl", spacing: "gap-1" },
  md: { text: "text-4xl", spacing: "gap-1.5" },
  lg: { text: "text-6xl", spacing: "gap-2" },
  xl: { text: "text-[clamp(2.5rem,8vw,5.5rem)]", spacing: "gap-2" },
};

export default function BirichiNexLogo({ size = "lg", animate = true, className = "" }: BirichiNexLogoProps) {
  const s = sizeMap[size];

  const letterVariants = (delay: number, dir: number) => ({
    animate: animate
      ? {
          x: [0, dir * 2.5, dir * -3, dir * 2, dir * -2.5, dir * 1, dir * -1.5, 0, dir * 2, dir * -1.5, dir * 1, dir * -1, 0],
          rotateZ: [0, dir * 1.5, dir * -1.5, dir * 1, dir * -1, dir * 0.5, dir * -0.5, dir * 1.2, dir * -1.2, dir * 0.6, dir * -0.6, 0, 0],
        }
      : undefined,
    transition: animate
      ? {
          duration: 2.2,
          delay,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatDelay: 3,
        }
      : undefined,
  });

  return (
    <div className={`inline-flex items-baseline font-black tracking-[-0.03em] leading-none select-none ${s.text} ${s.spacing} ${className}`}>
      {"BIRICHI".split("").map((letter, i) => (
        <motion.span
          key={`bn-w-${i}`}
          className="text-white inline-block"
          {...letterVariants(i * 0.1, i % 2 === 0 ? -1 : 1)}
        >
          {letter}
        </motion.span>
      ))}
      {"NEX".split("").map((letter, i) => (
        <motion.span
          key={`bn-g-${i}`}
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] inline-block"
          {...letterVariants(0.7 + i * 0.1, i % 2 === 0 ? 1 : -1)}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
