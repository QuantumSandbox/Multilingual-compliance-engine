export const BADGE_VARIANTS = {
  default: "bg-bg-tertiary text-text-secondary",
  primary: "bg-accent-primary/20 text-accent-primary-hover",
  success: "bg-accent-success/20 text-accent-success",
  warning: "bg-accent-warning/20 text-accent-warning",
  danger: "bg-accent-danger/20 text-accent-danger",
  info: "bg-accent-info/20 text-accent-info",
};

export default function Badge({ variant = "default", className = "", children }) {
  return <span className={`badge ${BADGE_VARIANTS[variant]} ${className}`}>{children}</span>;
}
