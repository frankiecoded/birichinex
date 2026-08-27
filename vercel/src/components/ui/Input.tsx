import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-subhead text-ink block">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-quaternary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full h-11 sm:h-10 px-3.5 text-body text-ink
              bg-surface/80 backdrop-blur-sm
              border border-glass-border
              rounded-[12px]
              placeholder:text-ink-quaternary
              focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10
              focus:bg-surface
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${error ? "border-error/40 focus:border-error/40 focus:ring-error/10" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-caption text-ink-tertiary">{hint}</p>
        )}
        {error && (
          <p className="text-caption text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
