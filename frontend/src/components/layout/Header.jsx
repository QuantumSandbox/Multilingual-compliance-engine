import { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Header({ onMenuClick }) {
  const { user, stats } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => notifRef.current && !notifRef.current.contains(e.target) && setShowNotif(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const conflicts = stats?.conflicts ?? 0;
  const overdue = stats?.overdue_tasks ?? 0;
  const upcoming = stats?.upcoming_deadlines ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border-primary bg-bg-secondary/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search documents, tasks..."
          className="input-base w-full pl-9"
          aria-label="Global search"
        />
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotif((s) => !s)}
          aria-label="Notifications"
          className="relative rounded-md p-2 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
        >
          <Bell className="w-5 h-5" />
          {conflicts + overdue > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-danger px-1 text-[10px] font-semibold text-white">
              {conflicts + overdue}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border-primary bg-bg-secondary p-2 shadow-xl animate-slide-down">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase text-text-muted">
              Notifications
            </p>
            <ul className="space-y-1">
              <li className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
                {conflicts} unresolved conflict{conflicts === 1 ? "" : "s"}
              </li>
              <li className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
                {overdue} overdue task{overdue === 1 ? "" : "s"}
              </li>
              <li className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
                {upcoming} deadline{upcoming === 1 ? "" : "s"} in next 30 days
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-right sm:block">
          <span className="block text-sm font-medium text-text-primary">{user?.full_name}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </div>
    </header>
  );
}
