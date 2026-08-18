import React, { useEffect, useState } from "react";
import API from "../api/client.js";
import { AlertTriangle, Check } from "lucide-react";

const KIND_LABEL = {
  version_change: "Version Change",
  cross_document: "Cross-Document",
};
const CHANGE_COLOR = {
  conflict: "bg-rose-100 text-rose-700 border-rose-300",
  modified: "bg-amber-100 text-amber-700 border-amber-300",
  added: "bg-green-100 text-green-700 border-green-300",
  removed: "bg-slate-100 text-slate-600 border-slate-300",
};

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);

  const load = () => API.get("/conflicts").then((r) => setConflicts(r.data));
  useEffect(load, []);

  const resolve = (id) => API.post(`/conflicts/${id}/resolve`).then(load);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <AlertTriangle className="text-rose-500" /> Conflict & Change Detection
      </h1>

      <div className="space-y-4">
        {conflicts.length === 0 && (
          <div className="text-slate-400">No conflicts detected.</div>
        )}
        {conflicts.map((c) => (
          <div key={c.conflict_id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs border ${
                    CHANGE_COLOR[c.change_type] || "bg-slate-100"
                  }`}
                >
                  {c.change_type}
                </span>
                <span className="text-xs text-slate-500">
                  {KIND_LABEL[c.kind] || c.kind}
                </span>
                <span className="text-xs text-slate-400">· severity: {c.severity}</span>
              </div>
              {!c.resolved ? (
                <button
                  onClick={() => resolve(c.conflict_id)}
                  className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  <Check size={14} className="inline" /> Resolve
                </button>
              ) : (
                <span className="text-sm text-green-600">Resolved</span>
              )}
            </div>

            <div className="text-sm font-medium mb-2">{c.obligation}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="text-xs text-slate-500 mb-1">
                  {c.kind === "version_change" ? "Previous" : "Document A"} ·{" "}
                  {c.doc_a} · p{c.page_a}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {c.text_a || <span className="text-slate-400">— (not present)</span>}
                </div>
                {c.deadline_a && (
                  <div className="text-xs text-slate-500 mt-2">
                    Deadline: <span className="font-mono">{c.deadline_a}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-brand-50">
                <div className="text-xs text-slate-500 mb-1">
                  {c.kind === "version_change" ? "Updated" : "Document B"} ·{" "}
                  {c.doc_b} · p{c.page_b}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {c.text_b || <span className="text-slate-400">— (not present)</span>}
                </div>
                {c.deadline_b && (
                  <div className="text-xs text-slate-500 mt-2">
                    Deadline: <span className="font-mono">{c.deadline_b}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
