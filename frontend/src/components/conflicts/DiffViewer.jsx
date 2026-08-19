import { AlertTriangle, Plus, Minus, Pencil } from "lucide-react";

const CHANGE_META = {
  added: { label: "Added", color: "#22c55e", Icon: Plus, tag: "success" },
  removed: { label: "Removed", color: "#ef4444", Icon: Minus, tag: "danger" },
  modified: { label: "Modified", color: "#f59e0b", Icon: Pencil, tag: "warning" },
  conflict: { label: "Conflict", color: "#ef4444", Icon: AlertTriangle, tag: "danger" },
};

export default function DiffViewer({ conflict }) {
  const meta = CHANGE_META[conflict.change_type] || CHANGE_META.modified;
  const { Icon } = meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: `${meta.color}1f`, color: meta.color }}
        >
          <Icon className="w-3.5 h-3.5" /> {meta.label}
        </span>
        {conflict.severity && (
          <span className="text-xs text-text-muted">Severity: {conflict.severity}</span>
        )}
      </div>

      <p className="text-sm font-medium text-text-primary">{conflict.obligation}</p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel
          title="Version 1 (Current)"
          text={conflict.text_a}
          deadline={conflict.deadline_a}
          tone={conflict.change_type === "added" ? "dim" : "removed"}
        />
        <Panel
          title="Version 2 (New)"
          text={conflict.text_b}
          deadline={conflict.deadline_b}
          tone={conflict.change_type === "removed" ? "dim" : "added"}
        />
      </div>

      {(conflict.deadline_a || conflict.deadline_b) && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border-primary bg-bg-tertiary/30 px-3 py-2 text-sm">
          <span className="text-text-muted">Deadline:</span>
          <span className={conflict.deadline_a ? "text-text-secondary line-through" : "text-text-disabled"}>
            {conflict.deadline_a || "—"}
          </span>
          <span className="text-text-muted">→</span>
          <span className="font-medium text-accent-success">{conflict.deadline_b || "—"}</span>
        </div>
      )}
    </div>
  );
}

function Panel({ title, text, deadline, tone }) {
  const styles = {
    added: "border-l-accent-success bg-accent-success/5",
    removed: "border-l-accent-danger bg-accent-danger/5",
    dim: "border-l-border-primary opacity-60",
  };
  return (
    <div className={`rounded-md border border-border-primary border-l-4 p-3 ${styles[tone]}`}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">{title}</p>
      <p
        className={`text-sm leading-relaxed text-text-secondary ${
          tone === "removed" ? "line-through decoration-accent-danger/70" : ""
        }`}
      >
        {text || <span className="italic text-text-disabled">No text</span>}
      </p>
    </div>
  );
}
