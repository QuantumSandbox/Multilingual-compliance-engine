import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

const DEMO = [
  { username: "admin", password: "admin123", label: "Admin" },
  { username: "officer", password: "officer123", label: "Officer" },
  { username: "hod_finance", password: "hod123", label: "Dept Head" },
  { username: "viewer", password: "viewer123", label: "Viewer" },
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(username, password);
      toast("success", `Welcome back, ${u.full_name}`);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.18), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-primary/15 text-accent-primary-hover shadow-glow-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to continue to RegTrack</p>
        </div>

        <form
          onSubmit={submit}
          className="card space-y-4 rounded-xl border-border-primary bg-bg-secondary/95 backdrop-blur"
        >
          <Input
            id="username"
            label="Username"
            placeholder="you@institution.gov"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
            autoComplete="username"
          />
          <div className="relative">
            <Input
              id="password"
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-9 text-text-muted hover:text-text-primary"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="rounded-md bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border-hover bg-bg-tertiary accent-accent-primary"
              />
              Remember me
            </label>
            <a className="text-sm text-accent-primary-hover hover:text-accent-primary" href="#">
              Forgot password?
            </a>
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="flex items-center gap-3 py-1 text-xs text-text-disabled">
            <span className="h-px flex-1 bg-border-primary" />
            or continue with
            <span className="h-px flex-1 bg-border-primary" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Google", "GitHub", "SSO"].map((p) => (
              <button
                key={p}
                type="button"
                disabled
                className="flex h-10 items-center justify-center rounded-md border border-border-primary bg-bg-tertiary text-xs text-text-muted opacity-60"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <a className="font-medium text-accent-primary-hover hover:text-accent-primary" href="#">
              Sign up
            </a>
          </p>
        </form>

        <div className="mt-6 rounded-lg border border-border-primary bg-bg-secondary/60 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.username}
                type="button"
                onClick={() => fill(d.username, d.password)}
                className="rounded-md border border-border-primary bg-bg-tertiary/50 px-2 py-1.5 text-left text-xs text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <span className="font-medium">{d.label}</span>
                <span className="block text-text-disabled">{d.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
