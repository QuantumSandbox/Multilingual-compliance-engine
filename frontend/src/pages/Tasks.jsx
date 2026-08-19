import { useEffect, useState, useMemo } from "react";
import { Search, Plus, CheckSquare } from "lucide-react";
import { fetchTasks, updateTask } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TaskCard from "../components/tasks/TaskCard.jsx";
import CitationDrawer from "../components/CitationDrawer.jsx";

const COLUMNS = [
  { key: "pending", label: "Pending", accent: "text-text-muted" },
  { key: "in_progress", label: "In Progress", accent: "text-accent-primary-hover" },
  { key: "completed", label: "Completed", accent: "text-accent-success" },
  { key: "overdue", label: "Overdue", accent: "text-accent-danger" },
];

export default function Tasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState(null);
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("");
  const [citationId, setCitationId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const load = () => {
    fetchTasks()
      .then(setTasks)
      .catch(() => toast("error", "Failed to load tasks."));
  };
  useEffect(load, []);

  const units = useMemo(() => {
    if (!tasks) return [];
    return [...new Set(tasks.map((t) => t.responsible_unit).filter(Boolean))].sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        (!q || t.obligation.toLowerCase().includes(q)) &&
        (!unit || t.responsible_unit === unit)
    );
  }, [tasks, query, unit]);

  const byStatus = (status) => filtered.filter((t) => t.status === status);

  const onDrop = async (status) => {
    setDragOver(null);
    if (!dragId) return;
    const task = tasks.find((t) => t.task_id === dragId);
    if (!task || task.status === status) return;
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.task_id === dragId ? { ...t, status } : t)));
    try {
      await updateTask(dragId, { status });
      toast("success", `Moved to ${status.replace("_", " ")}.`);
    } catch {
      setTasks(prev);
      toast("error", "Failed to update task.");
    }
    setDragId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Extracted obligations as traceable compliance tasks"
        actions={
          <button className="inline-flex h-10 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="input-base w-full pl-9"
          />
        </div>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-base w-full sm:w-56">
          <option value="" className="bg-bg-secondary">All Departments</option>
          {units.map((u) => (
            <option key={u} value={u} className="bg-bg-secondary">{u}</option>
          ))}
        </select>
      </div>

      {tasks === null ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = byStatus(col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.key);
                }}
                onDragLeave={() => setDragOver((d) => (d === col.key ? null : d))}
                onDrop={() => onDrop(col.key)}
                className={`flex flex-col rounded-lg border bg-bg-secondary/50 transition-colors ${
                  dragOver === col.key ? "border-accent-primary" : "border-border-primary"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border-primary px-3 py-2.5">
                  <h3 className={`text-sm font-semibold ${col.accent}`}>{col.label}</h3>
                  <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-secondary">
                    {items.length}
                  </span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-3 p-3">
                  {items.map((t) => (
                    <div
                      key={t.task_id}
                      draggable
                      onDragStart={() => setDragId(t.task_id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard task={t} onOpenCitation={setCitationId} />
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="py-6 text-center text-xs text-text-muted">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {citationId && <CitationDrawer taskId={citationId} onClose={() => setCitationId(null)} />}
    </div>
  );
}
