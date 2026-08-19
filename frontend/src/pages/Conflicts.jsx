import { useEffect, useState } from "react";
import { GitMerge, Check, ChevronRight } from "lucide-react";
import { fetchConflicts, resolveConflict } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Button from "../components/ui/Button.jsx";
import DiffViewer from "../components/conflicts/DiffViewer.jsx";

const CHANGE_VARIANT = {
  added: "success",
  removed: "danger",
  modified: "warning",
  conflict: "danger",
};

export default function Conflicts() {
  const toast = useToast();
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState(null);
  const [selected, setSelected] = useState(null);
  const canResolve = user?.role === "admin" || user?.role === "officer";

  const load = () => {
    fetchConflicts()
      .then((c) => {
        setConflicts(c);
        setSelected((s) => s ?? c[0]?.conflict_id ?? null);
      })
      .catch(() => toast("error", "Failed to load conflicts."));
  };
  useEffect(load, []);

  const onResolve = async (id) => {
    try {
      await resolveConflict(id);
      toast("success", "Conflict resolved.");
      load();
    } catch {
      toast("error", "Could not resolve conflict.");
    }
  };

  if (conflicts === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const open = conflicts.find((c) => c.conflict_id === selected);
  const unresolved = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conflicts"
        subtitle="Version changes and cross-document inconsistencies"
        actions={<Badge variant={unresolved ? "danger" : "success"}>{unresolved} open</Badge>}
      />

      {conflicts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border-primary bg-bg-secondary p-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-success/10 text-accent-success">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-text-primary">No conflicts detected.</p>
          <p className="mt-1 text-sm text-text-muted">
            Upload a new version of a document to run comparison.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <div className="space-y-2">
            {conflicts.map((c) => (
              <button
                key={c.conflict_id}
                onClick={() => setSelected(c.conflict_id)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selected === c.conflict_id
                    ? "border-accent-primary bg-accent-primary/5"
                    : "border-border-primary bg-bg-secondary hover:border-border-hover"
                }`}
              >
                <GitMerge className="mt-0.5 w-4 h-4 shrink-0 text-text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{c.obligation}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={CHANGE_VARIANT[c.change_type] || "default"}>{c.change_type}</Badge>
                    {c.resolved && <Badge variant="success">resolved</Badge>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 self-center text-text-muted" />
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border-primary bg-bg-secondary p-5">
            {open ? (
              <>
                <DiffViewer conflict={open} />
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-border-primary pt-4">
                  {open.resolved ? (
                    <Badge variant="success">Resolved</Badge>
                  ) : canResolve ? (
                    <Button onClick={() => onResolve(open.conflict_id)}>
                      <Check className="w-4 h-4" /> Accept & Resolve
                    </Button>
                  ) : (
                    <span className="text-xs text-text-muted">Admin/Officer can resolve.</span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-text-muted">Select a conflict to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
