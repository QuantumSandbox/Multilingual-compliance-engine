import { useEffect, useState, useMemo } from "react";
import { Clock, FileText, GitBranch } from "lucide-react";
import { fetchDocuments } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";

export default function Timeline() {
  const toast = useToast();
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    fetchDocuments()
      .then(setDocs)
      .catch(() => toast("error", "Failed to load documents."));
  }, []);

  const families = useMemo(() => {
    if (!docs) return [];
    const map = new Map();
    for (const d of docs) {
      const key = d.family_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    return [...map.entries()].map(([fid, items]) => ({
      fid,
      title: items[0].title,
      versions: items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    }));
  }, [docs]);

  if (docs === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (families.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Timeline" subtitle="Version history per document family" />
        <p className="text-sm text-text-muted">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Timeline" subtitle="Version history per document family" />

      {families.map((fam) => (
        <Card key={fam.fid}>
          <div className="mb-5 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-accent-primary-hover" />
            <h2 className="text-lg font-semibold text-text-primary">{fam.title}</h2>
            <Badge variant="default">{fam.versions.length} versions</Badge>
          </div>

          <div className="flex flex-col gap-0 md:flex-row md:items-start md:gap-0">
            {fam.versions.map((v, i) => {
              const isLast = i === fam.versions.length - 1;
              const additions = v.chunk_count;
              return (
                <div key={v.doc_id} className="flex flex-1 gap-3 md:flex-col">
                  <div className="flex flex-col items-center md:flex-row">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        i === fam.versions.length - 1
                          ? "border-accent-primary bg-accent-primary"
                          : "border-border-hover bg-bg-tertiary"
                      }`}
                    />
                    {!isLast && (
                      <span className="h-12 w-0.5 bg-border-primary md:h-0.5 md:w-full" />
                    )}
                  </div>
                  <div className="pb-6 md:pb-0 md:pl-4 md:pr-8">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                      <FileText className="w-3.5 h-3.5 text-text-muted" />
                      {v.version}
                      {i === fam.versions.length - 1 && (
                        <Badge variant="primary">Current</Badge>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Date(v.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 rounded-md border border-border-primary bg-bg-tertiary/30 p-2.5">
                      <p className="text-xs text-text-secondary">
                        {additions} clause{additions === 1 ? "" : "s"} indexed
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <Badge variant="info">{v.language}</Badge>
                        <Badge variant="default" className="capitalize">{v.source_type}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
