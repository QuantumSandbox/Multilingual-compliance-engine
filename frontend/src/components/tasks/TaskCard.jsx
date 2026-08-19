import { Eye, MoreVertical } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Progress from "../ui/Progress.jsx";

const PRIORITY = {
  high: { color: "#ef4444", label: "High" },
  medium: { color: "#f59e0b", label: "Medium" },
  low: { color: "#22c55e", label: "Low" },
};

export function priorityOf(task) {
  if (task.status === "overdue") return "high";
  if (task.deadline) {
    const days = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000);
    if (days < 0) return "high";
    if (days <= 7) return "medium";
  }
  return "low";
}

export default function TaskCard({ task, onOpenCitation }) {
  const prio = priorityOf(task);
  const borderColor = PRIORITY[prio].color;
  const days = task.deadline
    ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-border-primary bg-bg-secondary p-3.5 transition-all duration-150 hover:border-border-hover"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <p className="mb-2 pr-6 text-sm font-medium leading-snug text-text-primary">{task.obligation}</p>

      {task.deadline && (
        <p className="mb-2 text-xs text-text-muted">
          Due: {new Date(task.deadline).toLocaleDateString()} (
          {days < 0 ? `${-days}d overdue` : `${days}d left`})
        </p>
      )}

      <div className="mb-2 flex flex-wrap gap-1.5">
        {task.responsible_unit && <Badge variant="primary">{task.responsible_unit}</Badge>}
        <Badge variant="default">{task.extraction_method}</Badge>
        <Badge variant={prio === "high" ? "danger" : prio === "medium" ? "warning" : "success"}>
          {PRIORITY[prio].label}
        </Badge>
      </div>

      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
          <span>Confidence</span>
          <span className="text-text-secondary">{Math.round(task.confidence * 100)}%</span>
        </div>
        <Progress value={task.confidence * 100} size="sm" color="primary" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary/15 text-xs font-semibold text-accent-primary-hover">
          {(task.responsible_unit || "NA").slice(0, 2).toUpperCase()}
        </div>
        <button
          onClick={() => onOpenCitation(task.task_id)}
          aria-label="View citation"
          className="rounded-md p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-bg-tertiary hover:text-text-primary group-hover:opacity-100"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
