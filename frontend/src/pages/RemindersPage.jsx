import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";

const INITIAL_REMINDERS = [
  { id: 1, title: "Take Atorvastatin 10mg",   time: "08:00 PM", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], active: true,  type: "medicine" },
  { id: 2, title: "Take Vitamin D3 2000 IU",   time: "09:00 AM", days: ["Mon","Wed","Fri"],                       active: true,  type: "medicine" },
  { id: 3, title: "Cholesterol Retest",         time: "10:00 AM", days: ["Fri"],                                   active: false, type: "test"     },
  { id: 4, title: "Doctor Appointment",         time: "11:00 AM", days: ["Mon"],                                   active: true,  type: "appointment" },
];

const TYPE_ICONS = { medicine: "pill", test: "activity", appointment: "doctor" };
const TYPE_COLORS = { medicine: "text-blue-600 bg-blue-100", test: "text-violet text-violet-100 bg-violet-100", appointment: "text-emerald-600 bg-emerald-100" };

export default function RemindersPage() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);

  const toggle = (id) =>
    setReminders((r) => r.map((rem) => rem.id === id ? { ...rem, active: !rem.active } : rem));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Reminders</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your medicine and appointment reminders</p>
          </div>
          <button className="btn-grad">
            <Icon n="plus" className="h-4 w-4" />
            Add Reminder
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",   value: reminders.length,                             color: "text-navy" },
            { label: "Active",  value: reminders.filter((r) => r.active).length,     color: "text-emerald-600" },
            { label: "Paused",  value: reminders.filter((r) => !r.active).length,    color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reminders list */}
        <div className="flex flex-col gap-3">
          {reminders.map((r, k) => {
            const [iconColor, iconBg] = TYPE_COLORS[r.type]?.split(" ") ?? ["text-slate-500", "bg-slate-100"];
            return (
              <div
                key={r.id}
                className={`card p-4 flex items-center gap-4 animate-fadeUp transition-all duration-200 ${!r.active ? "opacity-60" : ""}`}
                style={{ animationDelay: `${k * 70}ms` }}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
                  <Icon n={TYPE_ICONS[r.type]} className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Icon n="clock" className="h-3 w-3" />
                      {r.time}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{r.days.join(", ")}</span>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggle(r.id)}
                  id={`reminder-toggle-${r.id}`}
                  className={`relative h-6 w-11 rounded-full transition-all duration-200 ${r.active ? "bg-emerald-500" : "bg-slate-300"}`}
                  aria-label={r.active ? "Disable reminder" : "Enable reminder"}
                  aria-checked={r.active}
                  role="switch"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${r.active ? "translate-x-5" : ""}`}
                  />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition" aria-label="Delete reminder">
                  <Icon n="x" className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add reminder form */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Add New Reminder</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="reminder-title">Reminder Title</label>
              <input id="reminder-title" className="form-input" placeholder="e.g., Take Ferrous Sulfate" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="reminder-time">Time</label>
              <input id="reminder-time" type="time" className="form-input" defaultValue="08:00" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn-grad">
              <Icon n="plus" className="h-4 w-4" />
              Add Reminder
            </button>
            <button className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
