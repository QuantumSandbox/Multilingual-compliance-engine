import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-accent-primary text-white hover:bg-accent-primary-hover hover:shadow-glow-primary active:bg-accent-primary-muted",
  secondary:
    "bg-bg-tertiary text-text-primary hover:bg-bg-hover active:bg-bg-tertiary",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
  danger: "bg-accent-danger text-white hover:bg-red-400 active:bg-accent-danger-muted",
  outline:
    "bg-transparent text-text-secondary border border-border-hover hover:bg-bg-tertiary",
  link: "bg-transparent text-accent-primary-hover hover:text-accent-primary underline-offset-4 hover:underline",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-base gap-2",
  lg: "h-12 px-6 text-lg gap-2.5",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
        VARIANTS[variant]
      } ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
