import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "motion/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "brand";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-emphasis text-on-emphasis hover:bg-emphasis/90 active:bg-emphasis/80 shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
  secondary:
    "bg-surface/72 text-ink border border-glass-border hover:bg-surface active:bg-surface-secondary/80 backdrop-blur-md",
  ghost:
    "bg-transparent text-ink-secondary hover:bg-surface-secondary/60 active:bg-surface-secondary/80",
  danger:
    "bg-error text-white hover:bg-error/90 active:bg-error/80 shadow-[0_1px_2px_rgba(255,69,58,0.3)]",
  brand:
    "bg-brand text-ink hover:bg-brand-dark active:bg-brand-dark/90 shadow-[0_1px_2px_rgba(212,175,55,0.3)]",
};

const sizeClasses = {
  sm: "h-9 px-3 text-caption rounded-[10px] gap-1.5",
  md: "h-10 px-4 text-subhead rounded-[12px] gap-2",
  lg: "h-12 px-6 text-body rounded-[14px] gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.015 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        focus-ring
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon && iconPosition === "left" ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && icon && iconPosition === "right" ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
    </motion.button>
  );
}
