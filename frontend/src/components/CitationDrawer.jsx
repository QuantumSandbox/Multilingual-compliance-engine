import React, { useEffect, useState } from "react";
import API from "../api/client.js";
import { X, Quote, FileText } from "lucide-react";

export default function CitationDrawer({ taskId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("original");

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    API.get(`/citations/${taskId}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (!taskId) return null;

  const fileUrl = data ? `/api/citations/file/${data.doc_id}` : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-xl overflow-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Quote className="text-brand-500" /> Source Citation
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-black">
            <X />
          </button>
        </div>

        {loading && <div className="p-6 text-slate-500">Loading citation…</div>}
        {!loading && !data && (
          <div className="p-6 text-rose-600">Citation unavailable.</div>
        )}

        {data && (
          <div className="p-5 space-y-4">
            <div>
              <div className="text-sm text-slate-500">{data.title}</div>
              <div className="text-xs text-slate-400 mt-1">
                Page {data.page || "—"}
                {data.paragraph ? ` · Paragraph ${data.paragraph}` : ""} ·{" "}
                {data.file_type.toUpperCase()}
              </div>
            </div>

            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setTab("original")}
                className={`px-3 py-1 rounded ${
                  tab === "original" ? "bg-brand-600 text-white" : "bg-slate-100"
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setTab("en")}
                className={`px-3 py-1 rounded ${
                  tab === "en" ? "bg-brand-600 text-white" : "bg-slate-100"
                }`}
              >
                English
              </button>
            </div>

            <blockquote className="border-l-4 border-brand-500 bg-brand-50 p-3 rounded text-sm">
              {tab === "original" ? data.source_text : data.source_text_en}
            </blockquote>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={16} /> Source document
              </div>
              {fileUrl ? (
                <iframe
                  title="source"
                  src={`${fileUrl}${data.file_type === "pdf" ? `#page=${data.page || 1}` : ""}`}
                  className="w-full h-[60vh] border rounded-lg"
                />
              ) : (
                <div className="text-xs text-slate-400">Preview not available.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
