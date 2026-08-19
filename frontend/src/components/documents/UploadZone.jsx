import { useRef, useState } from "react";
import { UploadCloud, FileUp, Loader2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { uploadDocument } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";

const SOURCE_TYPES = ["circular", "accreditation", "procurement", "policy"];

export default function UploadZone({ onUploaded }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    title: "",
    source_type: "circular",
    source_dept: "",
    version: "v1",
    family_id: "",
    sensitive: false,
  });

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setMeta((m) => ({ ...m, title: m.title || f.name.replace(/\.[^.]+$/, "") }));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setMeta((m) => ({ ...m, title: m.title || f.name.replace(/\.[^.]+$/, "") }));
    }
  };

  const submit = async () => {
    if (!file || !meta.title) {
      toast("warning", "Choose a file and provide a title.");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", meta.title);
    fd.append("source_type", meta.source_type);
    fd.append("source_dept", meta.source_dept);
    fd.append("version", meta.version);
    fd.append("family_id", meta.family_id);
    fd.append("sensitive", meta.sensitive ? "true" : "false");
    try {
      const res = await uploadDocument(fd);
      toast("success", `Processed: ${res.tasks_created} obligations extracted (${res.processed_with})`);
      setFile(null);
      setMeta({ title: "", source_type: "circular", source_dept: "", version: "v1", family_id: "", sensitive: false });
      onUploaded?.();
    } catch (err) {
      toast("error", err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-150 ${
          dragging
            ? "scale-[1.02] border-accent-primary bg-bg-tertiary shadow-glow-primary"
            : "border-border-hover bg-bg-primary hover:border-accent-primary hover:bg-bg-tertiary/50"
        }`}
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary-hover">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="text-base font-medium text-text-primary">
          {file ? file.name : "Drag & drop or click to upload"}
        </p>
        <p className="mt-1 text-sm text-text-muted">PDF, DOCX, TXT — multilingual supported</p>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={pick} />
      </div>

      {file && (
        <div className="mt-4 space-y-3 animate-slide-down">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            />
            <Input
              label="Source Department"
              placeholder="e.g. Finance"
              value={meta.source_dept}
              onChange={(e) => setMeta((m) => ({ ...m, source_dept: e.target.value }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Source Type</label>
              <select
                value={meta.source_type}
                onChange={(e) => setMeta((m) => ({ ...m, source_type: e.target.value }))}
                className="input-base"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-bg-secondary">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Version / Family</label>
              <div className="flex gap-2">
                <input
                  value={meta.version}
                  onChange={(e) => setMeta((m) => ({ ...m, version: e.target.value }))}
                  className="input-base w-20"
                  placeholder="v1"
                />
                <input
                  value={meta.family_id}
                  onChange={(e) => setMeta((m) => ({ ...m, family_id: e.target.value }))}
                  className="input-base flex-1"
                  placeholder="Family ID (for version compare)"
                />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={meta.sensitive}
              onChange={(e) => setMeta((m) => ({ ...m, sensitive: e.target.checked }))}
              className="h-4 w-4 rounded border-border-hover bg-bg-tertiary accent-accent-danger"
            />
            Mark as sensitive (restricted to non-viewer roles)
          </label>
          <Button onClick={submit} loading={uploading} className="w-full sm:w-auto">
            <FileUp className="w-4 h-4" /> {uploading ? "Processing..." : "Process Document"}
          </Button>
        </div>
      )}
    </div>
  );
}
