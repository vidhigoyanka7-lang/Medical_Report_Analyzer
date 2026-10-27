import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon, MiniSparkline } from "../components/ui";
import api from "../services/api";

const QUICK_ACTIONS = [
  { icon: "spark",    label: "AI Explanation",    sub: "Get simple AI explanation",      link: "/assistant",      grad: "from-blue-500 to-blue-600" },
  { icon: "activity", label: "Abnormal Values",   sub: "Detect abnormal values",          link: "/analysis",       grad: "from-red-400 to-orange-500" },
  { icon: "doctor",   label: "Doctor Questions",  sub: "Generate questions for doctor",   link: "/doctor-summary", grad: "from-teal-500 to-emerald-600" },
  { icon: "compare",  label: "Compare Reports",   sub: "Compare with previous reports",   link: "/compare",        grad: "from-violet-500 to-purple-600" },
  { icon: "trend",    label: "Health Insights",   sub: "Trends & health score analysis",  link: "/analysis",       grad: "from-amber-400 to-orange-500" },
];

/* ─── Stat Card ───────────────────────────────────────────────── */
function StatCard({ s, delay }) {
  return (
    <div
      className="card p-5 card-hover animate-fadeUp"
      style={{ animationDelay: `${delay}ms` }}
      id={`stat-${s.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.iconBg} text-white shadow-md`}>
          <Icon n={s.icon} className="h-5 w-5" />
        </span>
        {s.trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${s.trendUp ? "text-emerald-600" : "text-red-500"}`}>
            {s.trendUp ? "↑" : "↓"} {s.trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-navy leading-none">
        {s.value}<span className="text-lg font-semibold text-slate-400">{s.suffix}</span>
      </p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
      <p className={`text-xs font-semibold mt-1 ${s.subColor}`}>{s.sub}</p>
      <div className="mt-3">
        <MiniSparkline data={s.data || [0,0,0,0,0,0,0]} color={s.sparkColor} width={100} height={32} />
      </div>
    </div>
  );
}

/* ─── Health Score Trend Chart (SVG-based) ────────────────────── */
function TrendChart() {
  // A health score is not calculated yet, so there is no real trend to draw.
  return (
    <div className="card p-5 animate-fadeUp" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Health Score Trend</h2>
      </div>
      <p className="text-sm text-slate-500">Available after sufficient report data</p>
      <Link to="/compare" className="mt-3 inline-block text-xs font-bold text-royal hover:underline">Compare your reports →</Link>
    </div>
  );
}

/* ─── Report Summary Donut ────────────────────────────────────── */
function ReportSummaryDonut({ total, normal, abnormal }) {
  const borderline = 0; // if we want to calculate this later
  const totalCount = total || 1; // avoid division by zero
  
  const pctNormal = Math.round((normal / totalCount) * 100) || 0;
  const pctAbnormal = Math.round((abnormal / totalCount) * 100) || 0;
  const pctBorderline = 0;

  const data = [
    { label: "Normal",     pct: pctNormal, color: "#059669" },
    { label: "Abnormal",   pct: pctAbnormal, color: "#ef4444" },
    { label: "Borderline", pct: pctBorderline, color: "#f59e0b" },
  ];

  const cx = 48, cy = 48, r = 36, sw = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="card p-5 animate-fadeUp" style={{ animationDelay: "300ms" }}>
      <h2 className="section-title mb-3">Report Summary</h2>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" aria-label="Report summary donut chart">
            {data.map((d) => {
              const dash = (d.pct / 100) * circ;
              const gap = circ - dash;
              const el = (
                <circle
                  key={d.label}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={sw}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              );
              offset += dash;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-extrabold text-navy">{total}</p>
            <p className="text-[9px] text-slate-400">Reports</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600 font-medium">{d.label}</span>
              <span className="ml-auto font-bold text-navy">{Math.round(d.pct * total / 100) || 0} ({d.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
      <Link to="/reports" className="mt-4 block text-center text-xs font-bold text-royal hover:underline">
        View Full Summary →
      </Link>
    </div>
  );
}

/* ─── Abnormal Values Panel ───────────────────────────────────── */
function AbnormalPanel({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="card p-5 animate-fadeUp" style={{ animationDelay: "250ms" }}>
        <h2 className="section-title mb-3">Abnormal Values</h2>
        <p className="text-sm text-slate-500">No results requiring attention</p>
      </div>
    );
  }

  return (
    <div className="card p-5 animate-fadeUp" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Abnormal Values</h2>
        <Link to="/analysis" className="text-xs font-bold text-royal hover:underline">View All</Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {results.map((v, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${v.status === 'HIGH' ? 'bg-orange-400' : 'bg-red-400'}`} />
            <span className="flex-1 text-sm font-medium text-navy">{v.test_name}</span>
            <span className="text-sm font-bold text-slate-700">{v.test_value} {v.unit}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              v.status === "NORMAL" ? "bg-emerald-100 text-emerald-700" :
              v.status === "HIGH"   ? "bg-red-100 text-red-600" :
                                      "bg-orange-100 text-orange-600"
            }`}>
              {v.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Reports ──────────────────────────────────────────── */
function RecentReportsSection({ reports }) {
  return (
    <div className="animate-fadeUp" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Recent Reports</h2>
        <Link to="/reports" className="text-sm font-bold text-royal hover:underline">View All</Link>
      </div>
      
      {reports && reports.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reports.map((r, k) => (
            <div
              key={r.report_id}
              className="card p-4 card-hover animate-fadeUp"
              style={{ animationDelay: `${400 + k * 60}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-500">
                  <Icon n="file" className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy truncate">{r.report_name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  r.processing_status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  r.processing_status === "failed" ? "bg-red-100 text-red-600" :
                  "bg-orange-100 text-orange-600"
                }`}>
                  {r.processing_status || "Pending"}
                </span>
                <div className="flex gap-1">
                  <Link to="/analysis" state={{ reportId: r.report_id }} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-royal transition">
                    <Icon n="eye" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center bg-slate-50 border border-dashed border-slate-200">
          <p className="text-slate-500 mb-2">No reports yet</p>
          <p className="text-xs text-slate-400 mb-4">Upload your first medical report to start tracking your health.</p>
          <Link to="/upload-report" className="btn-primary inline-flex text-xs py-2 px-4">Upload Report</Link>
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard Page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const [dragging, setDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name ? user.name.split(' ')[0] : 'User';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setUploadFile(f);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (loading) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="h-8 w-8 rounded-full border-4 border-royal/30 border-t-royal animate-spin inline-block mb-4" />
            <p className="text-slate-500 font-medium">Loading your health data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-red-50 p-6 rounded-2xl border border-red-100 max-w-sm">
            <Icon n="alert" className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium">Unable to load dashboard data. Please try again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate dynamic stats based on DB data
  const STATS = [
    {
      id: "health-score",
      label: "Health Score",
      value: dashboardData.healthScore !== null ? dashboardData.healthScore : "--",
      suffix: dashboardData.healthScore !== null ? "/100" : "",
      sub: dashboardData.healthScore !== null ? "Health Score" : "Not available yet",
      subColor: dashboardData.healthScore !== null ? "text-emerald-600" : "text-slate-400",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      icon: "heart",
      sparkColor: "#059669",
      data: [],
      trend: null,
      trendUp: true,
    },
    {
      id: "abnormal",
      label: "Abnormal Values",
      value: dashboardData.abnormalResults ?? 0,
      suffix: "",
      sub: dashboardData.totalReports === 0 ? "No results yet" : dashboardData.abnormalResults > 0 ? "Needs Attention" : "All in range",
      subColor: dashboardData.abnormalResults > 0 ? "text-orange-600" : "text-emerald-600",
      iconBg: "bg-gradient-to-br from-orange-400 to-red-500",
      icon: "alert",
      sparkColor: "#f97316",
      data: [],
      trend: null,
      trendUp: false,
    },
    {
      id: "ai-confidence",
      label: "Extraction Quality",
      value: dashboardData.aiConfidence !== null ? dashboardData.aiConfidence : "--",
      suffix: dashboardData.aiConfidence !== null ? "%" : "",
      sub: dashboardData.aiConfidence !== null ? "Reference ranges found" : "No analysis yet",
      subColor: dashboardData.aiConfidence !== null ? "text-violet-600" : "text-slate-400",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      icon: "brain",
      sparkColor: "#7c3aed",
      data: [],
      trend: null,
      trendUp: true,
    },
    {
      id: "reports-analyzed",
      label: "Reports Analyzed",
      value: dashboardData.totalReportsThisMonth ?? 0,
      suffix: "",
      sub: "This Month",
      subColor: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-400 to-sky-500",
      icon: "file",
      sparkColor: "#2563eb",
      data: [],
      trend: null,
      trendUp: true,
    },
  ];

  const hasReports = dashboardData.totalReports > 0;

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="flex flex-col gap-6">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1446D0] via-[#1E3A8A] to-[#4C1D95] p-6 sm:p-8 animate-fadeUp">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-40 bottom-0 h-32 w-32 rounded-full bg-violet-400/15 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/70 mb-1">Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {hasReports ? `${greeting}, ${userName}! 👋` : `Welcome to MediGuide AI, ${userName}! 👋`}
              </h1>
              <p className="mt-2 text-sm text-blue-100/70 max-w-sm">
                {hasReports 
                  ? "Let's understand your health reports with the power of AI." 
                  : "Complete your health profile or upload your first report to get started."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {!hasReports && (
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-royal hover:bg-blue-50 px-5 py-2.5 text-sm font-bold transition duration-200 hover:scale-[1.03] active:scale-[.97]"
                    id="hero-profile-btn"
                  >
                    <Icon n="user" className="h-4 w-4" />
                    Complete Health Profile
                  </Link>
                )}
              <Link
                to="/upload-report"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm ring-1 ring-white/30 px-5 py-2.5 text-sm font-bold text-white transition duration-200 hover:scale-[1.03] active:scale-[.97]"
                id="hero-upload-btn"
              >
                <Icon n="upload" className="h-4 w-4" />
                Upload New Report
              </Link>
              </div>
            </div>

            {/* Illustration — floating medical card */}
            <div className="hidden sm:block relative shrink-0 mr-4 animate-float">
              <div className="rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/25 p-4 w-44 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20 text-white">
                    <Icon n="file" className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="h-2 w-16 bg-white/50 rounded-full" />
                    <div className="h-1.5 w-10 bg-white/30 rounded-full mt-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 bg-white/10 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] text-white/70">Reports</span>
                  <span className="text-xs font-extrabold text-white">{dashboardData.totalReports}</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              {/* Plus decorations */}
              {[[-16, -8], [140, 50], [-8, 90]].map(([x, y], i) => (
                <span key={i} className="absolute text-white/20 text-2xl select-none" style={{ left: x, top: y }}>+</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s, k) => <StatCard key={s.id} s={s} delay={k * 60} />)}
        </div>

        {/* ── Quick Upload Drop Area ── */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed text-center transition-all duration-300 p-8
            ${dragging
              ? "border-violet bg-violet/5 shadow-inner animate-glow"
              : "border-royal/25 bg-gradient-to-br from-blue-50/80 to-violet/5 hover:border-royal hover:bg-blue-50"
            }`}
        >
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block opacity-60">
            <div className="flex flex-col items-center">
              <div className="rounded-xl bg-red-500/10 p-3">
                <Icon n="file" className="h-10 w-10 text-red-400" />
              </div>
              <span className="mt-1 text-xs font-bold text-red-400/70">PDF</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-royal to-violet text-white shadow-lg shadow-violet/30 animate-float">
              <Icon n="upload" className="h-7 w-7" />
            </span>
            <div>
              <p className="text-base font-bold text-navy">Drag & Drop PDF Report Here</p>
              <p className="text-xs text-slate-400 mt-1">Supports PDF only (Max 20MB)</p>
            </div>
            <label htmlFor="dashboard-upload" className="btn-primary cursor-pointer">
              <Icon n="file" className="h-4 w-4" />
              Browse Files
              <input
                id="dashboard-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) setUploadFile(f);
                }}
              />
            </label>
          </div>
          {uploadFile && (
            <div className="mt-4 flex items-center justify-center gap-2 animate-scaleIn">
              <Icon n="check" className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{uploadFile.name} selected</span>
              <Link to="/upload-report" state={{ file: uploadFile }} className="btn-primary text-xs py-1.5 px-3">
                Proceed
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((a, k) => (
              <Link key={a.label} to={a.link} className="card p-4 text-center card-hover animate-fadeUp flex flex-col items-center gap-2.5" style={{ animationDelay: `${k * 50}ms` }}>
                <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${a.grad} text-white shadow-md`}>
                  <Icon n={a.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-navy">{a.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1"><TrendChart /></div>
          <div className="lg:col-span-1"><AbnormalPanel results={dashboardData.attentionResults} /></div>
          <div className="lg:col-span-1">
            <ReportSummaryDonut 
              total={dashboardData.totalReports} 
              normal={dashboardData.normalResults} 
              abnormal={dashboardData.abnormalResults} 
            />
          </div>
        </div>

        {/* ── Recent Reports ── */}
        <RecentReportsSection reports={dashboardData.recentReports} />

      </div>
    </DashboardLayout>
  );
}
