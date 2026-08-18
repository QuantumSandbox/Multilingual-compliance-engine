import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { ShieldCheck } from "lucide-react";

const DEMO = [
  { u: "admin", p: "admin123", label: "Administrator (full access)" },
  { u: "hod_finance", p: "hod123", label: "Finance Dept Head (scoped)" },
  { u: "hod_cse", p: "hod123", label: "CSE Dept Head (no finance tasks)" },
  { u: "viewer", p: "viewer123", label: "Viewer (read-only, no sensitive)" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid username or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-brand-500" size={28} />
          <h1 className="text-xl font-bold">Regulatory Compliance Engine</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Sign in to extract, trace and monitor regulatory obligations.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button
            disabled={busy}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-6 border-t pt-4">
          <div className="text-xs font-semibold text-slate-500 mb-2">Demo accounts</div>
          <div className="grid grid-cols-1 gap-1">
            {DEMO.map((d) => (
              <button
                key={d.u}
                onClick={() => {
                  setUsername(d.u);
                  setPassword(d.p);
                }}
                className="text-left text-xs px-2 py-1 rounded hover:bg-slate-100"
              >
                <span className="font-mono">{d.u} / {d.p}</span> — {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
