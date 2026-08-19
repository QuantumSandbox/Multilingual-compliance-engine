export default function Spinner({ size = 20, className = "" }) {
  return (
    <span
      className={`inline-block rounded-full animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        border: "3px solid #334155",
        borderTopColor: "#6366f1",
      }}
      role="status"
      aria-label="Loading"
    />
  );
}
