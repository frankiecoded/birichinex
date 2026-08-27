import { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "brand";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  default: "bg-surface-secondary/80 text-ink-secondary backdrop-blur-sm",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  brand: "bg-brand/10 text-brand-dark",
};

const dotColors = {
  default: "bg-ink-quaternary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  brand: "bg-brand",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
  lg: "px-3 py-1.5 text-caption",
};

export default function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-semibold tracking-wide
        rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
