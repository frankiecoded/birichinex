import { ReactNode } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
  capability: string;
}

export default function PlaceholderPage({ title, description, icon, capability }: PlaceholderPageProps) {
  const Icon = (Icons as any)[icon] || Icons.Construction;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-6"
      >
        <div className="h-20 w-20 rounded-[24px] bg-surface-secondary flex items-center justify-center mx-auto">
          <Icon className="h-10 w-10 text-ink-quaternary" />
        </div>
        <div>
          <h1 className="text-headline text-ink">{title}</h1>
          <p className="text-callout text-ink-tertiary mt-2 max-w-md mx-auto">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/8 rounded-full">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <span className="text-caption font-semibold text-brand-dark">Coming soon in BirichiNex™️ OS</span>
        </div>
        <p className="text-caption text-ink-quaternary">Capability: {capability}</p>
      </motion.div>
    </div>
  );
}
