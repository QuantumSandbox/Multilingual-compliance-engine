import { useState, useEffect } from "react";
import { X, Copy, ExternalLink, FileText } from "lucide-react";
import { fetchCitation, fileUrl } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import Badge from "./ui/Badge.jsx";
import Spinner from "./ui/Spinner.jsx";

export default function CitationDrawer({ taskId, onClose }) {
  const toast = useToast();
  const [tab, setTab] = useState("original");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    setData(null);
    fetchCitation(taskId)
      .then(setData)
      .catch(() => toast("error", "Could not load citation."))
      .finally(() => setLoading(false));
  }, [taskId, toast]);

  const copy = () => {
    const text = tab === "original" ? data?.source_text : data?.source_text_en;
    if (text) {
      navigator.clipboard.writeText(text);
      toast("success", "Copied to clipboard.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border-primary bg-bg-secondary shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border-primary px-5 py-4">
          <h3 className="text-lg font-semibold text-text-primary">Source Citation</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !data ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size={26} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex items-center gap-2 rounded-md border border-border-primary bg-bg-tertiary/40 px-3 py-2.5">
              <FileText className="w-4 h-4 text-accent-primary-hover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{data.title}</p>
                <p className="text-xs text-text-muted">
                  Page {data.page || "—"} · Paragraph {data.paragraph || "—"}
                </p>
              </div>
            </div>

            <div className="mb-3 flex gap-2">
              {["original", "english"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    tab === t ? "bg-accent-primary/15 text-accent-primary-hover" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {t === "original" ? "Original" : "English"}
                </button>
              ))}
            </div>

            <blockquote className="rounded-md border-l-4 border-accent-primary bg-bg-tertiary/40 p-4 text-sm leading-relaxed text-text-secondary">
              {tab === "original" ? data.source_text : data.source_text_en}
            </blockquote>

            <div className="mt-4 flex gap-2">
              <button
                onClick={copy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border-hover bg-bg-tertiary px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <a
                href={fileUrl(data.doc_id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent-primary px-3 py-2 text-sm font-medium text-white hover:bg-accent-primary-hover"
              >
                <ExternalLink className="w-4 h-4" /> Open Document
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
