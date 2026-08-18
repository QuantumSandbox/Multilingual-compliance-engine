import React, { useEffect, useState } from "react";
import API from "../api/client.js";
import {
  FileText,
  ListChecks,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Stat({ icon: I, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${accent}`}>
        <I size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

const COLORS = ["#3b6fe0", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/dashboard/stats").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <div className="p-10 text-slate-500">Loading dashboard…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Compliance Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat icon={FileText} label="Documents" value={stats.total_documents} accent="bg-indigo-100 text-indigo-600" />
        <Stat icon={ListChecks} label="Obligations" value={stats.total_obligations} accent="bg-blue-100 text-blue-600" />
        <Stat icon={Clock} label="Pending" value={stats.pending_tasks} accent="bg-amber-100 text-amber-600" />
        <Stat icon={CheckCircle2} label="Completed" value={stats.completed_tasks} accent="bg-green-100 text-green-600" />
        <Stat icon={CalendarClock} label="Upcoming ≤30d" value={stats.upcoming_deadlines} accent="bg-violet-100 text-violet-600" />
        <Stat icon={AlertTriangle} label="Conflicts" value={stats.conflicts} accent="bg-rose-100 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold mb-3">Obligations by Responsible Unit</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.by_unit}>
              <XAxis dataKey="unit" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b6fe0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold mb-3">Documents by Source Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.by_source_type} dataKey="count" nameKey="type" outerRadius={90} label>
                {stats.by_source_type.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">Upcoming Deadlines (next 30 days)</h2>
        {stats.upcoming.length === 0 ? (
          <div className="text-sm text-slate-400">No deadlines in the next 30 days.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Deadline</th>
                <th>Obligation</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming.map((u) => (
                <tr key={u.task_id} className="border-b">
                  <td className="py-2 font-mono text-brand-600">{u.deadline}</td>
                  <td>{u.obligation}</td>
                  <td className="text-slate-500">{u.responsible_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
