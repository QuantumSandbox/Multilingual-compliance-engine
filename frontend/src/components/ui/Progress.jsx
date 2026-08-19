const COLORS = {
  primary: "#6366f1",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
};

export default function Progress({
  value = 0,
  color = "primary",
  size = "md",
  className = "",
}) {
  const height = { sm: 8, md: 12, lg: 16 }[size] ?? 12;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full rounded-full bg-bg-tertiary overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${pct}%`,
          background: COLORS[color] ?? COLORS.primary,
        }}
      />
    </div>
  );
}
