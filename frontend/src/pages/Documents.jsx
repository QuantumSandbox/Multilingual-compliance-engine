import React, { useEffect, useState, useRef } from "react";
import API from "../api/client.js";
import { UploadCloud, FileText, Languages, History } from "lucide-react";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    source_type: "circular",
    source_dept: "",
    version: "v1",
    family_id: "",
    sensitive: false,
    retention_days: 1825,
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const load = () => API.get("/documents").then((r) => setDocs(r.data));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg("Select a file first.");
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    try {
      const res = await API.post("/documents/upload", fd);
      setMsg(
        `Processed "${res.data.title}" -> ${res.data.tasks_created} obligations (method: ${res.data.processed_with}). Conflicts recomputed.`
      );
      setForm({ ...form, title: "", family_id: "" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setBusy(false);
    }
  };

  const families = {};
  docs.forEach((d) => {
    (families[d.family_id] = families[d.family_id] || []).push(d);
  });
  Object.values(families).forEach((arr) =>
    arr.sort((a, b) => a.version.localeCompare(b.version))
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:col-span-1">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <UploadCloud size={18} className="text-brand-500" /> Upload & Ingest
          </h2>
          <form onSubmit={submit} className="space-y-3 text-sm">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-xs"
            />
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-2 py-1"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.source_type}
                onChange={(e) => setForm({ ...form, source_type: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="circular">Circular</option>
                <option value="accreditation">Accreditation</option>
                <option value="procurement">Procurement</option>
                <option value="policy">Policy</option>
              </select>
              <input
                placeholder="Source dept"
                value={form.source_dept}
                onChange={(e) => setForm({ ...form, source_dept: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Version (v1)"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <input
                placeholder="Family ID (same = compare)"
                value={form.family_id}
                onChange={(e) => setForm({ ...form, family_id: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Retention days"
                value={form.retention_days}
                onChange={(e) => setForm({ ...form, retention_days: +e.target.value })}
                className="border rounded px-2 py-1"
              />
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.sensitive}
                  onChange={(e) => setForm({ ...form, sensitive: e.target.checked })}
                />
                Sensitive (RBAC)
              </label>
            </div>
            <button
              disabled={busy}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg disabled:opacity-60"
            >
              {busy ? "Processing…" : "Upload & Extract"}
            </button>
            {msg && <div className="text-xs text-slate-600 mt-1">{msg}</div>}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <History size={18} className="text-brand-500" /> Version Timeline
            </h2>
            {Object.entries(families).map(([fam, arr]) => (
              <div key={fam} className="mb-4">
                <div className="text-xs text-slate-400 mb-1">Family: {fam}</div>
                <div className="flex flex-wrap gap-2">
                  {arr.map((d) => (
                    <div
                      key={d.doc_id}
                      className="border rounded-lg px-3 py-2 text-sm bg-slate-50"
                    >
                      <div className="font-medium">{d.version}</div>
                      <div className="text-xs text-slate-500">{d.title}</div>
                      <div className="text-slate-400 text-[10px]">
                        {d.chunk_count} chunks · {d.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <FileText size={18} className="text-brand-500" /> All Documents
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Title</th>
                  <th>Version</th>
                  <th>Lang</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Chunks</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.doc_id} className="border-b">
                    <td className="py-2">{d.title}</td>
                    <td>{d.version}</td>
                    <td className="flex items-center gap-1">
                      <Languages size={13} className="text-slate-400" />
                      {d.original_language}
                    </td>
                    <td className="text-slate-500">{d.source_type}</td>
                    <td className="text-slate-500">{d.status}</td>
                    <td className="text-slate-500">{d.chunk_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
