import { Link } from "react-router-dom";
import { Icon } from "./ui";

const REPORTS = [
  { id: "r1", name: "Blood Test Report",  date: "20 Jul, 2025", size: "2.4 MB", status: "Analyzed",   statusColor: "badge-green" },
  { id: "r2", name: "CBC Report",         date: "18 Jul, 2025", size: "1.8 MB", status: "Analyzed",   statusColor: "badge-green" },
  { id: "r3", name: "Lipid Profile",      date: "15 Jul, 2025", size: "1.6 MB", status: "Pending",    statusColor: "badge-orange" },
  { id: "r4", name: "Thyroid Report",     date: "10 Jul, 2025", size: "1.2 MB", status: "Analyzed",   statusColor: "badge-green" },
];

export default function RecentReports() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Recent Reports</h2>
        <Link to="/reports" className="text-sm font-semibold text-royal hover:underline underline-offset-2">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map((r, k) => (
          <div
            key={r.id}
            id={r.id}
            style={{ animationDelay: `${k * 80}ms` }}
            className="group card animate-fadeUp p-4 hover:-translate-y-1 hover:shadow-nav transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 transition duration-300 group-hover:scale-110">
                <Icon n="file" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy">{r.name}</p>
                <p className="text-xs text-slate-500">{r.date}</p>
                <p className="text-xs text-slate-400">{r.size}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <span className={`badge ${r.statusColor}`}>{r.status}</span>
              <div className="flex items-center gap-1.5">
                <Link
                  to="/reports"
                  className="grid h-7 w-7 place-items-center rounded-lg bg-sky text-royal hover:bg-royal hover:text-white transition duration-200"
                  aria-label={`View ${r.name}`}
                >
                  <Icon n="eye" className="h-3.5 w-3.5" />
                </Link>
                <button
                  className="grid h-7 w-7 place-items-center rounded-lg bg-sky text-slate-500 hover:bg-slate-100 transition duration-200"
                  aria-label={`Download ${r.name}`}
                >
                  <Icon n="download" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}