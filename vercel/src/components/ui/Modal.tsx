import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-scrim backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`
              relative w-full ${sizeClasses[size]}
              glass-material-lg specular-sheen
              rounded-[24px]
              overflow-hidden
            `}
          >
            {(title || description) && (
              <div className="px-4 sm:px-7 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {title && <h2 className="text-title text-ink">{title}</h2>}
                    {description && <p className="text-callout text-ink-tertiary">{description}</p>}
                  </div>
                  <button
                    onClick={onClose}
                    className="h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors focus-ring shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 glass-divider" />
              </div>
            )}
            <div className="px-4 sm:px-7 pb-7 pt-3 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
