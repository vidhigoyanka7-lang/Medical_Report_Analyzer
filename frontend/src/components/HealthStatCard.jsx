import { CountUp, MiniSparkline } from "./ui";

const STATS = [
  {
    id: "health-score",
    label: "Health Score",
    value: 92,
    suffix: "",
    sub: "/100",
    status: "Excellent",
    statusColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    sparkData: [72, 75, 68, 80, 85, 88, 92],
    sparkColor: "#10B981",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />
      </svg>
    ),
  },
  {
    id: "abnormal-values",
    label: "Abnormal Values",
    value: 3,
    suffix: "",
    sub: "",
    status: "Needs Attention",
    statusColor: "text-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    sparkData: [2, 5, 3, 4, 6, 4, 3],
    sparkColor: "#EF4444",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 8v5m0 3h.01M10.3 4l-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z" />
      </svg>
    ),
  },
  {
    id: "ai-confidence",
    label: "AI Confidence",
    value: 98,
    suffix: "%",
    sub: "",
    status: "Very High",
    statusColor: "text-violet-600",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    sparkData: [85, 88, 90, 92, 94, 96, 98],
    sparkColor: "#7C3AED",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </svg>
    ),
  },
  {
    id: "reports-analyzed",
    label: "Reports Analyzed",
    value: 12,
    suffix: "",
    sub: "",
    status: "This Month",
    statusColor: "text-royal",
    iconBg: "bg-blue-100",
    iconColor: "text-royal",
    sparkData: [3, 5, 7, 8, 9, 11, 12],
    sparkColor: "#2563EB",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M7 3h7l5 5v13H7zM14 3v5h5" />
      </svg>
    ),
  },
];

function StatCard({ stat, delay }) {
  return (
    <div
      id={stat.id}
      className="card p-5 animate-fadeUp hover:-translate-y-1 hover:shadow-nav transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-navy">
              <CountUp to={stat.value} />
              {stat.suffix}
            </span>
            {stat.sub && <span className="text-sm text-slate-400 font-medium">{stat.sub}</span>}
          </div>
          <span className={`mt-1 text-xs font-semibold ${stat.statusColor}`}>
            {stat.status}
          </span>
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${stat.iconBg} ${stat.iconColor}`}>
          {stat.icon}
        </span>
      </div>
      <div className="mt-3 flex justify-end">
        <MiniSparkline data={stat.sparkData} color={stat.sparkColor} />
      </div>
    </div>
  );
}

export default function HealthStats() {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map((s, k) => (
        <StatCard key={s.id} stat={s} delay={k * 80} />
      ))}
    </section>
  );
}