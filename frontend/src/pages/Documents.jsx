import { useEffect, useState, useMemo } from "react";
import { FileText, Search, GitCompare, RefreshCw, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchDocuments, compareDocument, fileUrl } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import UploadZone from "../components/documents/UploadZone.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Button from "../components/ui/Button.jsx";

const STATUS_VARIANT = {
  active: "success",
  archived: "default",
  expired: "danger",
};

const LANG = { en: "English", hi: "Hindi", or: "Odia" };

export default function Documents() {
  const toast = useToast();
  const [docs, setDocs] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [comparing, setComparing] = useState(null);
  const PER = 6;

  const load = () => {
    fetchDocuments()
      .then(setDocs)
      .catch(() => toast("error", "Failed to load documents."));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!docs) return [];
    return docs.filter((d) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.source_dept.toLowerCase().includes(q) ||
        d.doc_id.toLowerCase().includes(q);
      const matchT = typeFilter === "all" || d.source_type === typeFilter;
      return matchQ && matchT;
    });
  }, [docs, query, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice((page - 1) * PER, page * PER);

  const onCompare = async (docId) => {
    setComparing(docId);
    try {
      const res = await compareDocument(docId);
      toast(
        res.length ? "info" : "success",
        res.length
          ? `${res.length} version change(s) detected.`
          : "No version changes detected."
      );
    } catch {
      toast("error", "Comparison failed.");
    } finally {
      setComparing(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Upload regulatory files and track version changes"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      />

      <UploadZone onUploaded={load} />

      <Card padding="none">
        <div className="flex flex-col gap-3 border-b border-border-primary p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search documents..."
              className="input-base w-full pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="input-base w-full sm:w-48"
          >
            <option value="all" className="bg-bg-secondary">All Types</option>
            <option value="circular" className="bg-bg-secondary">Circular</option>
            <option value="accreditation" className="bg-bg-secondary">Accreditation</option>
            <option value="procurement" className="bg-bg-secondary">Procurement</option>
            <option value="policy" className="bg-bg-secondary">Policy</option>
          </select>
        </div>

        {docs === null ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">No documents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-primary text-xs uppercase text-text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Lang</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((d) => (
                  <tr
                    key={d.doc_id}
                    className="border-b border-border-primary transition-colors hover:bg-bg-tertiary/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0 text-text-muted" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text-primary">{d.title}</p>
                          <p className="text-xs text-text-muted">
                            {d.version} · {d.source_dept || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">{d.source_type}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{LANG[d.language] || d.language}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[d.status] || "default"}>{d.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCompare(d.doc_id)}
                          disabled={comparing === d.doc_id}
                          title="Compare versions"
                        >
                          {comparing === d.doc_id ? (
                            <Spinner size={14} />
                          ) : (
                            <GitCompare className="w-4 h-4" />
                          )}
                        </Button>
                        <a
                          href={fileUrl(d.doc_id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {docs && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 border-t border-border-primary p-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 rounded-md text-sm transition-colors ${
                  page === i + 1
                    ? "bg-accent-primary text-white"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
