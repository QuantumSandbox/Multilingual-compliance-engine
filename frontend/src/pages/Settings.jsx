import { useState } from "react";
import { User, Shield, Bell, Users, FileText, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "team", label: "Team", icon: Users },
  { key: "documents", label: "Documents", icon: FileText },
];

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const initials = (user?.full_name || user?.username || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <Card padding="none" className="h-fit">
          <nav className="p-2">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setSaved(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? "border-l-2 border-accent-primary bg-accent-primary/10 text-accent-primary-hover"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </Card>

        <Card>
          {tab === "profile" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-text-primary">Profile Settings</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/20 text-xl font-semibold text-accent-primary-hover">
                  {initials}
                </div>
                <Button variant="secondary" size="sm">Change Photo</Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full Name" defaultValue={user?.full_name} />
                <Input label="Email" defaultValue={`${user?.username}@institution.gov`} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Department</label>
                  <select className="input-base">
                    <option className="bg-bg-secondary">Academic Affairs</option>
                    <option className="bg-bg-secondary">Finance</option>
                    <option className="bg-bg-secondary">Administration</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Role</label>
                  <div className="flex h-[42px] items-center">
                    <Badge variant="primary" className="capitalize">{user?.role.replace("_", " ")}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSaved(true)}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
              {saved && <p className="text-sm text-accent-success">Preferences saved (local).</p>}
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-text-primary">Security</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" className="h-4 w-4 rounded border-border-hover bg-bg-tertiary accent-accent-primary" />
                Enable two-factor authentication
              </label>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
              {["Deadline reminders", "Conflict alerts", "Weekly digest"].map((n) => (
                <label key={n} className="flex items-center justify-between rounded-md border border-border-primary px-4 py-3 text-sm text-text-secondary">
                  {n}
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border-hover bg-bg-tertiary accent-accent-primary" />
                </label>
              ))}
            </div>
          )}

          {tab === "team" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-text-primary">Team</h2>
              <p className="text-sm text-text-muted">
                Role-based access is enforced via JWT. Current role:
                <Badge variant="primary" className="ml-2 capitalize">{user?.role.replace("_", " ")}</Badge>
              </p>
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
              <label className="flex items-center justify-between rounded-md border border-border-primary px-4 py-3 text-sm text-text-secondary">
                Auto-archive expired documents
                <input type="checkbox" className="h-4 w-4 rounded border-border-hover bg-bg-tertiary accent-accent-primary" />
              </label>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
