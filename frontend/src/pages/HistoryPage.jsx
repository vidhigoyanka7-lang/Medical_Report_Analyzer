import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";

const HISTORY = [
  { id: "h1", name: "Blood Test Report",  date: "20 Jul, 2025", score: 92, status: "Excellent",   color: "text-emerald-600", bg: "bg-emerald-100" },
  { id: "h2", name: "CBC Report",         date: "18 Jul, 2025", score: 88, status: "Good",        color: "text-blue-600",    bg: "bg-blue-100"    },
  { id: "h3", name: "Lipid Profile",      date: "15 Jul, 2025", score: 74, status: "Fair",        color: "text-orange-600",  bg: "bg-orange-100"  },
  { id: "h4", name: "Thyroid Report",     date: "10 Jul, 2025", score: 85, status: "Good",        color: "text-blue-600",    bg: "bg-blue-100"    },
  { id: "h5", name: "Vitamin Panel",      date: "05 Jul, 2025", score: 70, status: "Fair",        color: "text-orange-600",  bg: "bg-orange-100"  },
  { id: "h6", name: "Urine Analysis",     date: "01 Jul, 2025", score: 95, status: "Excellent",   color: "text-emerald-600", bg: "bg-emerald-100" },
];

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Report History</h1>
          <p className="text-sm text-slate-500 mt-1">All your past medical reports and AI analysis</p>
        </div>

        {/* Timeline */}
        <section className="card p-6">
          <h2 className="section-title mb-5">Analysis Timeline</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
            <div className="flex flex-col gap-5">
              {HISTORY.map((h, k) => (
                <div
                  key={h.id}
                  className="flex items-start gap-4 animate-fadeUp"
                  style={{ animationDelay: `${k * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${h.bg} ${h.color}`}>
                    <Icon n="file" className="h-5 w-5" />
                  </span>

                  {/* Content */}
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 hover:border-royal hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-navy">{h.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{h.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-extrabold ${h.color}`}>{h.score}</p>
                        <p className={`text-xs font-semibold ${h.color}`}>{h.status}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${h.color.replace("text-", "bg-")} transition-all duration-1000`}
                        style={{ width: `${h.score}%` }}
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="rounded-lg bg-sky px-3 py-1.5 text-xs font-semibold text-royal hover:bg-royal hover:text-white transition flex items-center gap-1">
                        <Icon n="eye" className="h-3 w-3" /> View
                      </button>
                      <button className="rounded-lg bg-sky px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1">
                        <Icon n="download" className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
