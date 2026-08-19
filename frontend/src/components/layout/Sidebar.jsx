import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  AlertTriangle,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Badge from "../ui/Badge.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/conflicts", label: "Conflicts", icon: AlertTriangle },
  { to: "/timeline", label: "Timeline", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
];

function RoleBadge({ role }) {
  const map = {
    admin: "danger",
    officer: "primary",
    dept_head: "warning",
    viewer: "info",
  };
  return <Badge variant={map[role] || "default"}>{role.replace("_", " ")}</Badge>;
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.full_name || user?.username || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const content = (
    <div className="flex h-full flex-col bg-bg-secondary border-r border-border-primary">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-primary">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary-hover">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-text-primary">RegTrack</span>
          <span className="text-xs text-text-muted">Compliance Engine</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
        <a className="nav-link cursor-pointer" href="#" onClick={(e) => e.preventDefault()}>
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span>Help</span>
        </a>
      </nav>

      <div className="border-t border-border-primary p-3 space-y-3">
        <div className="flex items-center gap-3 rounded-md bg-bg-tertiary/50 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary/20 text-sm font-semibold text-accent-primary-hover">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.full_name || user?.username}
            </p>
            <div className="mt-0.5">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full text-text-muted hover:text-accent-danger"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-60 shrink-0">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-64 animate-slide-in-right">{content}</div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}
