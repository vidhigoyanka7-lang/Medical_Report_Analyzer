import { Link } from "react-router-dom";

const SEGMENTS = [
  { label: "Normal",     count: 7,  pct: 58, color: "#10B981" },
  { label: "Abnormal",   count: 3,  pct: 25, color: "#EF4444" },
  { label: "Borderline", count: 2,  pct: 17, color: "#F97316" },
];

const TOTAL = 12;
const R = 40;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function ReportSummary() {
  let offset = 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-sm">Report Summary</h3>
        <span className="badge badge-blue">{TOTAL} Reports</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut chart */}
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
            {/* Track */}
            <circle cx="50" cy="50" r={R} fill="none" stroke="#F1F5F9" strokeWidth="14" />
            {/* Segments */}
            {SEGMENTS.map((s) => {
              const len = (s.count / TOTAL) * CIRCUMFERENCE;
              const el = (
                <circle
                  key={s.label}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${len - 2} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="animate-fadeIn"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 grid place-content-center text-center">
            <span className="text-2xl font-extrabold text-navy">{TOTAL}</span>
            <span className="text-[10px] text-slate-500 leading-tight">Reports</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex-1 space-y-2">
          {SEGMENTS.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="flex-1 text-slate-600">{s.label}</span>
              <span className="font-bold text-navy">{s.count}</span>
              <span className="text-slate-400 text-xs">({s.pct}%)</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/reports"
        className="mt-4 block text-center text-sm font-semibold text-royal hover:underline underline-offset-2 transition"
      >
        View Full Summary →
      </Link>
    </div>
  );
}