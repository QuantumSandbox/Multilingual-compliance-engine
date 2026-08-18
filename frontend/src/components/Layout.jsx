import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import {
  LayoutDashboard,
  ListChecks,
  AlertTriangle,
  FileText,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/conflicts", label: "Conflicts", icon: AlertTriangle },
  { to: "/documents", label: "Documents", icon: FileText },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleColor = {
    admin: "bg-rose-100 text-rose-700",
    officer: "bg-amber-100 text-amber-700",
    dept_head: "bg-sky-100 text-sky-700",
    viewer: "bg-slate-200 text-slate-600",
  }[user?.role] || "bg-slate-200 text-slate-600";

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="text-brand-500" />
          <div>
            <div className="font-semibold leading-tight">Compliance Engine</div>
            <div className="text-xs text-slate-400">Multilingual RegTech</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-brand-600 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="text-sm font-medium">{user?.full_name}</div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${roleColor}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-slate-400 hover:text-white"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
