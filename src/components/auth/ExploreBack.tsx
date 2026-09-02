import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

/**
 * Visible escape hatch on the auth screens — returning a guest to the
 * marketplace without registering ("Explore BirichiNex — No account required").
 */
export default function ExploreBack({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-7"
    >
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-ink text-[14px] font-semibold hover:border-brand/40 hover:bg-brand/[0.06] transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4 text-brand group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
        Continue exploring BirichiNex
      </button>
    </motion.div>
  );
}