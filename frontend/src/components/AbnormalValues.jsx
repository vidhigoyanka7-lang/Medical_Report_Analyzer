import { Link } from "react-router-dom";

const VALUES = [
  { name: "Hemoglobin",  value: "10.2 g/dL", status: "low",      dotColor: "#EF4444" },
  { name: "Cholesterol", value: "240 mg/dL",  status: "high",     dotColor: "#F97316" },
  { name: "Vitamin D",   value: "18 ng/mL",   status: "low",      dotColor: "#EAB308" },
  { name: "Calcium",     value: "9.5 mg/dL",  status: "normal",   dotColor: "#10B981" },
];

const STATUS_STYLE = {
  high:   "bg-orange-100 text-orange-600",
  low:    "bg-red-100 text-red-600",
  normal: "bg-emerald-100 text-emerald-700",
};

export default function AbnormalValues() {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-sm">Abnormal Values</h3>
        <span className="badge badge-red">3 flagged</span>
      </div>

      <ul className="flex-1 space-y-1">
        {VALUES.map((v) => (
          <li key={v.name} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: v.dotColor }}
              />
              <span className="text-sm font-medium text-slate-700">{v.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{v.value}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLE[v.status] ?? "bg-slate-100 text-slate-500"}`}>
                {v.status}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/health-insights"
        className="mt-4 text-center text-sm font-semibold text-royal hover:underline underline-offset-2 transition"
      >
        View All Abnormal Values →
      </Link>
    </div>
  );
}