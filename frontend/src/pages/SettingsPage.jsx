import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";

const SECTIONS_TEMPLATE = [
  {
    title: "Account",
    icon:  "user",
    items: [
      { id: "s-name",  label: "Full Name",        type: "text",  value: "{NAME}" },
      { id: "s-email", label: "Email Address",    type: "email", value: "{EMAIL}" },
      { id: "s-phone", label: "Phone Number",     type: "tel",   value: "+91 98765 43210" },
    ],
  },
  {
    title: "Notifications",
    icon:  "bell",
    items: [
      { id: "s-email-notif",  label: "Email Notifications",    type: "toggle", value: true  },
      { id: "s-push-notif",   label: "Push Notifications",     type: "toggle", value: true  },
      { id: "s-reminder-notif",label: "Reminder Alerts",       type: "toggle", value: true  },
      { id: "s-report-notif", label: "Report Ready Alerts",    type: "toggle", value: false },
    ],
  },
  {
    title: "Privacy",
    icon:  "shield",
    items: [
      { id: "s-data-sharing",   label: "Share data for improvements", type: "toggle", value: false },
      { id: "s-analytics",      label: "Analytics tracking",          type: "toggle", value: true  },
    ],
  },
];

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative h-6 w-11 rounded-full transition-all duration-200 ${checked ? "bg-royal" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{"name": "Guest", "email": ""}');

  const [settings, setSettings] = useState(() => {
    const defaultSettings = Object.fromEntries(SECTIONS_TEMPLATE.flatMap((s) => s.items.map((i) => [i.id, i.value])));
    defaultSettings["s-name"] = storedUser.name || "Guest";
    defaultSettings["s-email"] = storedUser.email || "";
    return defaultSettings;
  });

  const updateSetting = (id, val) => setSettings((s) => ({ ...s, [id]: val }));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account preferences</p>
        </div>

        {SECTIONS_TEMPLATE.map((section) => (
          <div key={section.title} className="card p-6">
            <h2 className="section-title mb-5 flex items-center gap-2">
              <Icon n={section.icon} className="h-5 w-5 text-royal" />
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy">{item.label}</p>
                  </div>
                  {item.type === "toggle" ? (
                    <ToggleSwitch
                      id={item.id}
                      checked={!!settings[item.id]}
                      onChange={(v) => updateSetting(item.id, v)}
                    />
                  ) : (
                    <input
                      id={item.id}
                      type={item.type}
                      defaultValue={item.value}
                      className="form-input max-w-xs text-right border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-royal/20"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div className="card p-6 border border-red-100">
          <h2 className="section-title mb-4 text-red-600 flex items-center gap-2">
            <Icon n="alert" className="h-5 w-5" />
            Danger Zone
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-red-50 p-4">
            <div>
              <p className="font-semibold text-red-700">Delete Account</p>
              <p className="text-xs text-red-500 mt-0.5">This action is permanent and cannot be undone.</p>
            </div>
            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition shrink-0">
              Delete Account
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <button className="btn-secondary">Cancel</button>
          <button className="btn-grad">
            <Icon n="check" className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
