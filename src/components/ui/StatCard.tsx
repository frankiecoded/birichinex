import { motion } from "motion/react";
import * as Icons from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  className = "",
}: StatCardProps) {
  const IconComponent = icon ? (Icons as any)[icon] : null;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        glass-material rounded-[18px] p-5
        flex flex-col justify-between
        relative overflow-hidden
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{label}</p>
          <p className="text-headline text-ink font-bold tracking-tight">{value}</p>
        </div>
        {IconComponent && (
          <div className="h-10 w-10 rounded-[14px] bg-brand/8 flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-brand" strokeWidth={1.5} />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <span
            className={`text-caption font-bold ${
              trend === "up" ? "text-success" : trend === "down" ? "text-error" : "text-ink-tertiary"
            }`}
          >
            {trend === "up" ? "+" : ""}{change}%
          </span>
          <span className="text-caption text-ink-quaternary">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
