import DashboardLayout from "../components/DashboardLayout";
import HealthTrend from "../components/HealthTrend";
import AbnormalValues from "../components/AbnormalValues";
import ReportSummary from "../components/ReportSummary";
import { Icon } from "../components/ui";

const INSIGHTS = [
  { icon: "heart",    label: "Heart Health",    score: 88, color: "text-red-500",    bg: "bg-red-100",    bar: "bg-red-400"    },
  { icon: "activity", label: "Blood Health",    score: 72, color: "text-royal",      bg: "bg-blue-100",   bar: "bg-royal"      },
  { icon: "shield",   title: "Immunity",        score: 81, color: "text-emerald-600",bg: "bg-emerald-100",bar: "bg-emerald-500" },
  { icon: "trend",    label: "Metabolism",      score: 76, color: "text-violet",     bg: "bg-violet-100", bar: "bg-violet"     },
];

const TIPS = [
  { icon: "check",    text: "Increase iron-rich foods to address low hemoglobin"         },
  { icon: "check",    text: "Reduce saturated fats to lower cholesterol levels"          },
  { icon: "check",    text: "Get 15-30 minutes of sun exposure for Vitamin D"           },
  { icon: "check",    text: "Stay hydrated — drink at least 8 glasses of water daily"   },
  { icon: "check",    text: "Exercise 30 minutes, 5 days a week for heart health"       },
];

export default function HealthInsightsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Health Insights</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered analysis of your health trends and patterns</p>
        </div>

        {/* Health dimension scores */}
        <section>
          <h2 className="section-title mb-4">Health Dimensions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INSIGHTS.map((item, k) => (
              <div key={item.label} className="card p-5 animate-fadeUp" style={{ animationDelay: `${k * 80}ms` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.bg} ${item.color}`}>
                    <Icon n={item.icon} className="h-5 w-5" />
                  </span>
                  <p className="font-bold text-navy text-sm">{item.label}</p>
                </div>
                <p className={`text-3xl font-extrabold ${item.color}`}>{item.score}<span className="text-slate-400 text-lg">/100</span></p>
                {/* Progress bar */}
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.bar} transition-all duration-1000`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HealthTrend />
          <AbnormalValues />
          <ReportSummary />
        </section>

        {/* Health tips */}
        <section className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Icon n="spark" className="h-5 w-5 text-amber-500" />
            AI Health Recommendations
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPS.map((tip, k) => (
              <div key={k} className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white mt-0.5">
                  <Icon n={tip.icon} className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm text-slate-700 leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            ⚠️ These are general health tips. Always consult your doctor before making health decisions.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
