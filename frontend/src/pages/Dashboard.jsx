import { useEffect, useState } from "react";
import {
  FileText,
  AlertTriangle,
  Clock,
  GitMerge,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchStats } from "../api/client.js";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ICON_BG = {
  primary: "bg-accent-primary/10 text-accent-primary-hover",
  danger: "bg-accent-danger/10 text-accent-danger",
  warning: "bg-accent-warning/10 text-accent-warning",
  info: "bg-accent-info/10 text-accent-info",
};

function StatCard({ icon: Icon, label, value, trend, trendUp, accent, delay }) {
  return (
    <Card
      hover
      className="animate-stagger-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${ICON_BG[accent]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trendUp ? "text-accent-success" : "text-accent-danger"
            }`}
          >
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </Card>
  );
}

function daysLeft(deadline) {
  const d = new Date(deadline).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { stats, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(!stats);

  useEffect(() => {
    if (!stats) setLocalLoading(true);
  }, [stats]);

  if (localLoading && !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        <Spinner size={28} />
      </div>
    );
  }

  const statusData = [
    { name: "Pending", value: stats.pending_tasks, color: "#94a3b8" },
    { name: "In Progress", value: stats.in_progress_tasks, color: "#6366f1" },
    { name: "Completed", value: stats.completed_tasks, color: "#22c55e" },
    { name: "Overdue", value: stats.overdue_tasks, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Illustrative 30-day compliance trend derived from current distribution.
  const total =
    stats.pending_tasks + stats.in_progress_tasks + stats.completed_tasks + stats.overdue_tasks || 1;
  const trend = Array.from({ length: 8 }).map((_, i) => ({
    day: `D-${7 - i}`,
    completed: Math.round((stats.completed_tasks / total) * (20 + i * 4)),
    open: Math.round((stats.pending_tasks / total) * (40 - i * 3)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Compliance overview across all tracked obligations"
        actions={
          <Link
            to="/documents"
            className="inline-flex h-10 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white transition-colors hover:bg-accent-primary-hover"
          >
            + New Upload
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} accent="primary" label="Total Obligations" value={stats.total_obligations} trend="12%" trendUp />
        <StatCard icon={AlertTriangle} accent="danger" label="Overdue Tasks" value={stats.overdue_tasks} trend="5%" trendUp={false} delay={60} />
        <StatCard icon={Clock} accent="warning" label="Upcoming Deadlines" value={stats.upcoming_deadlines} trend="3%" trendUp delay={120} />
        <StatCard icon={GitMerge} accent="info" label="Conflicts Detected" value={stats.conflicts} trend="2" trendUp delay={180} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Task Status Distribution</h2>
          <div className="flex items-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#f8fafc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2">
              {statusData.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-medium text-text-primary">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Compliance Trend</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#f8fafc",
                  }}
                />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-text-muted">Completed obligations — last 30 days (illustrative)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-success/15 text-accent-success">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-text-secondary">{stats.total_obligations} obligations extracted</p>
                <p className="text-xs text-text-muted">Document processing pipeline</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-danger/15 text-accent-danger">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-text-secondary">{stats.conflicts} conflicts detected</p>
                <p className="text-xs text-text-muted">Awaiting resolution</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-warning/15 text-accent-warning">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-text-secondary">{stats.overdue_tasks} tasks overdue</p>
                <p className="text-xs text-text-muted">Requires attention</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Upcoming Deadlines</h2>
            <Badge variant="warning">{stats.upcoming_deadlines} in 30d</Badge>
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="text-sm text-text-muted">No upcoming deadlines in the next 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {stats.upcoming.slice(0, 5).map((u) => {
                const left = daysLeft(u.deadline);
                return (
                  <li
                    key={u.task_id}
                    className="flex items-center justify-between rounded-md border border-border-primary bg-bg-tertiary/30 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{u.obligation}</p>
                      <p className="text-xs text-text-muted">{u.responsible_unit || "Unassigned"}</p>
                    </div>
                    <Badge variant={left <= 7 ? "danger" : "warning"}>{left}d left</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
