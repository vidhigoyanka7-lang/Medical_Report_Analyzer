import { Link } from "react-router-dom";
import { Icon } from "./ui";

const ACTIONS = [
  {
    id: "qa-ai-explanation",
    title: "AI Explanation",
    desc: "Get simple AI explanation of your report",
    icon: "spark",
    to: "/upload-report",
    iconBg: "bg-blue-100",
    iconColor: "text-royal",
    hoverBg: "hover:bg-blue-50",
    badge: null,
  },
  {
    id: "qa-abnormal-values",
    title: "Abnormal Values",
    desc: "Detect abnormal values and get insights",
    icon: "alert",
    to: "/health-insights",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    hoverBg: "hover:bg-red-50",
    badge: "3",
  },
  {
    id: "qa-doctor-questions",
    title: "Doctor Questions",
    desc: "Generate questions to ask your doctor",
    icon: "question",
    to: "/doctor-qa",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    hoverBg: "hover:bg-teal-50",
    badge: null,
  },
  {
    id: "qa-medicine-info",
    title: "Medicine Info",
    desc: "Information about medicines and their uses",
    icon: "pill",
    to: "/medicines",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    hoverBg: "hover:bg-emerald-50",
    badge: null,
  },
  {
    id: "qa-health-insights",
    title: "Health Insights",
    desc: "Trends, charts & health score analysis",
    icon: "activity",
    to: "/health-insights",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    hoverBg: "hover:bg-violet-50",
    badge: null,
  },
  {
    id: "qa-compare-reports",
    title: "Compare Reports",
    desc: "Compare with previous reports",
    icon: "compare",
    to: "/compare-reports",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    hoverBg: "hover:bg-orange-50",
    badge: null,
  },
];

export default function QuickActions() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Quick Actions</h2>
        <span className="text-xs text-slate-500">6 tools available</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {ACTIONS.map((a, k) => (
          <Link
            key={a.id}
            id={a.id}
            to={a.to}
            style={{ animationDelay: `${k * 70}ms` }}
            className={`group card animate-fadeUp p-4 relative overflow-hidden hover:-translate-y-1.5 hover:shadow-nav transition-all duration-300 ${a.hoverBg}`}
          >
            {/* Badge */}
            {a.badge && (
              <span className="absolute right-3 top-3 h-5 w-5 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {a.badge}
              </span>
            )}

            {/* Icon */}
            <span className={`mb-3 grid h-12 w-12 place-items-center rounded-xl ${a.iconBg} ${a.iconColor} transition duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon n={a.icon} className="h-6 w-6" />
            </span>

            <p className="text-sm font-bold text-navy leading-snug">{a.title}</p>
            <p className="mt-1 text-xs leading-snug text-slate-500">{a.desc}</p>

            {/* Hover arrow */}
            <span className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition duration-200">
              <Icon n="arrowRight" className="h-4 w-4 text-slate-400" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}