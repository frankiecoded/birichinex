import { ReactNode } from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: ReactNode;
  variant?: "light" | "dark" | "brand" | "elevated";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  light: "glass-material chromatic-edge",
  dark: "glass-dark-material rim-highlight-dark",
  brand: "glass-brand",
  elevated: "glass-material-lg specular-sheen",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
  xl: "p-6 sm:p-9",
};

export default function GlassCard({
  children,
  variant = "light",
  padding = "md",
  hover = false,
  className = "",
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -3, scale: 1.005 }
          : undefined
      }
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${onClick ? "cursor-pointer" : ""}
        rounded-[20px]
        relative overflow-hidden
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
