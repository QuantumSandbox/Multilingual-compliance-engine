import React, { useEffect, useState } from "react";
import API from "../api/client.js";
import CitationDrawer from "../components/CitationDrawer.jsx";
import { Quote, Filter } from "lucide-react";

const COLUMNS = [
  { key: "pending", label: "Pending", color: "bg-amber-400" },
  { key: "in_progress", label: "In Progress", color: "bg-sky-400" },
  { key: "completed", label: "Completed", color: "bg-green-400" },
];

function isOverdue(t) {
  return t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
}

function TaskCard({ t, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer"
    >
      <div className="text-sm">{t.obligation}</div>
      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>{t.responsible_unit || "—"}</span>
        <span className={t.deadline ? "font-mono" : ""}>
          {t.deadline || "no deadline"}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {t.extraction_method} · {Math.round((t.confidence || 0) * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="text-brand-500 hover:text-brand-700"
          title="View source citation"
        >
          <Quote size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [active, setActive] = useState(null);
  const [unitFilter, setUnitFilter] = useState("");

  const load = () => {
    API.get("/tasks", { params: unitFilter ? { unit: unitFilter } : {} }).then((r) =>
      setTasks(r.data)
    );
  };
  useEffect(load, [unitFilter]);

  const columns = COLUMNS.map((c) => ({
    ...c,
    items: tasks.filter((t) => t.status === c.key),
  }));
  const overdue = tasks.filter(isOverdue);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Compliance Tasks</h1>
        <div className="flex items-center gap-2 text-sm">
          <Filter size={16} className="text-slate-400" />
          <input
            placeholder="Filter by unit…"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="bg-slate-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="text-xs text-slate-400 ml-auto">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((t) => (
                <TaskCard key={t.task_id} t={t} onClick={() => setActive(t.task_id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
        <h2 className="font-semibold text-rose-700 mb-2">Overdue ({overdue.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {overdue.map((t) => (
            <TaskCard key={t.task_id} t={t} onClick={() => setActive(t.task_id)} />
          ))}
        </div>
      </div>

      <CitationDrawer taskId={active} onClose={() => setActive(null)} />
    </div>
  );
}
