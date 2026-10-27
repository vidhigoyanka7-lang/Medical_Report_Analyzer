import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";
import Markdown from "../components/Markdown";

/* ── Processing steps ────────────────────────────────────────── */
const STEPS = [
  { label: "Uploading Report",           icon: "upload"   },
  { label: "Extracting Information",     icon: "scan"     },
  { label: "Analyzing Medical Values",   icon: "activity" },
  { label: "Detecting Abnormal Values",  icon: "alert"    },
  { label: "Generating Report Summary",  icon: "spark"    },
];

function StatusBadge({ status }) {
  if (status === "NORMAL") return <span className="badge bg-emerald-100 text-emerald-700">NORMAL</span>;
  if (status === "LOW")    return <span className="badge bg-red-100 text-red-700">LOW</span>;
  if (status === "HIGH")   return <span className="badge bg-orange-100 text-orange-700">HIGH</span>;
  return <span className="badge bg-slate-100 text-slate-700">{status}</span>;
}

function ParameterCard({ p }) {
  const [open, setOpen] = useState(false);
  const border = p.status === "HIGH" ? "border-orange-200 bg-orange-50/30"
               : p.status === "LOW"  ? "border-red-200 bg-red-50/30"
               : "border-slate-100 bg-white";

  return (
    <div className={`rounded-2xl border ${border} p-5 transition-all duration-300 hover:shadow-card`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-base font-bold text-navy">{p.test_name}</p>
        <StatusBadge status={p.status} />
      </div>
      
      <div className="flex items-end gap-2 mb-1">
        <p className="text-3xl font-extrabold text-navy leading-none">{p.test_value}</p>
        <p className="text-sm font-semibold text-slate-500 pb-0.5">{p.unit}</p>
      </div>
      
      <p className="text-xs text-slate-400 mb-4">
        Normal Range: <span className="font-semibold text-slate-600">{
          p.reference_min !== null && p.reference_max !== null ? `${p.reference_min}-${p.reference_max} ${p.unit || ""}`
          : p.reference_max !== null ? `< ${p.reference_max} ${p.unit || ""}`
          : p.reference_min !== null ? `> ${p.reference_min} ${p.unit || ""}`
          : "not readable on the report"}</span>
      </p>

      {open && (
        <div className="mb-4 rounded-xl bg-blue-50/80 p-4 border border-blue-100 animate-fadeUp">
          <p className="text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
            <Icon n="spark" className="h-3.5 w-3.5 text-royal" />
            Simple Explanation
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {`Your report shows ${p.test_name} of ${p.test_value} ${p.unit || ""}`.trim()}
            {p.reference_min !== null || p.reference_max !== null
              ? ` (reference on the report: ${p.reference_min ?? "–"} to ${p.reference_max ?? "–"}), which is marked ${p.status}.`
              : ". No reference range was found on the report."}
            {p.info ? ` ${p.info.text}` : ""}
          </p>
          {p.info && (
            <a href={p.info.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-bold text-royal hover:underline">
              Source: {p.info.title} (MedlinePlus)
            </a>
          )}
          
          <Link to={`/parameter/${encodeURIComponent(p.test_name)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-royal hover:underline">
            View details & trend <Icon n="chevronRight" className="h-3 w-3" />
          </Link>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full py-2 rounded-xl text-xs font-bold transition duration-200 ${
          open ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white border border-slate-200 text-royal hover:bg-blue-50 hover:border-royal/30"
        }`}
        aria-expanded={open}
      >
        {open ? "Hide explanation" : "What does this mean?"}
      </button>
    </div>
  );
}

/* ── Processing screen ───────────────────────────────────────── */
function ProcessingScreen({ onDone }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  const progress = Math.round((step / STEPS.length) * 100);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10 text-center animate-fadeIn shadow-2xl">
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping2" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-royal to-violet flex items-center justify-center text-white shadow-lg shadow-violet/40 z-10">
              <Icon n="spark" className="h-10 w-10 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-navy">Analyzing Report</h1>
          <p className="text-sm text-slate-500 mt-2 mb-8">MediGuide AI is processing your document...</p>

          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Progress</span>
              <span className="text-royal">{progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-royal to-violet transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-4 text-left">
            {STEPS.map((s, i) => {
              const done    = i < step;
              const active  = i === step;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-all duration-300
                    ${done ? "bg-emerald-100 text-emerald-600" : active ? "bg-blue-100 text-royal animate-bounce" : "bg-slate-100 text-slate-300"}`}>
                    <Icon n={done ? "check" : s.icon} className="h-4 w-4" />
                  </span>
                  <span className={`text-sm font-bold ${done ? "text-emerald-700" : active ? "text-navy" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Report result screen ────────────────────────────────────── */
function ReportResult({ reportData }) {
  const [tab, setTab] = useState("all");
  const [sortKey, setSortKey] = useState("abnormal");
  
  const parameters = reportData.labResults || [];
  const abnormal = parameters.filter((p) => p.status === "LOW" || p.status === "HIGH");
  const normal   = parameters.filter((p) => p.status === "NORMAL");
  const filtered = tab === "all" ? parameters : tab === "abnormal" ? abnormal : normal;

  // Custom sorter: the user picks how the parameter cards are ordered.
  // Default "Abnormal first" puts LOW/HIGH results on top, then unreadable ones, then normal.
  const SORT_OPTIONS = [
    { key: "abnormal",        label: "Abnormal first",          order: ["LOW", "HIGH", "UNKNOWN", "NORMAL"] },
    { key: "normal",          label: "Normal first",            order: ["NORMAL", "UNKNOWN", "LOW", "HIGH"] },
    { key: "high-normal-low", label: "High → Normal → Low",     order: ["HIGH", "NORMAL", "LOW", "UNKNOWN"] },
    { key: "low-normal-high", label: "Low → Normal → High",     order: ["LOW", "NORMAL", "HIGH", "UNKNOWN"] },
    { key: "az",              label: "Name (A–Z)",              order: null },
  ];
  const sorter = SORT_OPTIONS.find((o) => o.key === sortKey) || SORT_OPTIONS[0];
  const shown = [...filtered].sort((a, b) => {
    if (!sorter.order) return a.test_name.localeCompare(b.test_name);
    const diff = sorter.order.indexOf(a.status) - sorter.order.indexOf(b.status);
    return diff !== 0 ? diff : a.test_name.localeCompare(b.test_name); // same status: A-Z
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <DashboardLayout pageTitle="Report Analysis">
      <div className="flex flex-col gap-6 animate-fadeIn pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Report Analysis</h1>
            <p className="text-sm text-slate-500 mt-1">Your results explained in simple language</p>
          </div>
          <div className="flex gap-3">
            <Link to="/doctor-summary" className="btn-secondary">
              <Icon n="doctor" className="h-4 w-4" />Doctor Summary
            </Link>
            <Link to="/assistant" className="btn-primary">
              <Icon n="chat" className="h-4 w-4" />Ask AI
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="flex flex-col gap-6">
            
            {/* AI Summary (middle of the page) */}
            <div className="card p-6 border-2 border-royal/20 bg-blue-50/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-royal to-violet text-white shadow-md">
                  <Icon n="spark" className="h-4 w-4" />
                </span>
                <h2 className="font-bold text-navy">AI Summary</h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {reportData.summary
                  ? <Markdown text={reportData.summary} />
                  : <p>{reportData.summaryError || "No summary available for this report."}</p>}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-px">
              <div className="flex gap-6" role="tablist">
                {[
                  { key: "all",      label: "All Parameters", count: parameters.length },
                  { key: "abnormal", label: "Abnormal",       count: abnormal.length, color: "text-red-500" },
                  { key: "normal",   label: "Normal",         count: normal.length, color: "text-emerald-500" },
                ].map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative pb-3 text-sm font-bold transition-colors ${
                      tab === t.key ? "text-navy" : "text-slate-500 hover:text-navy"
                    }`}
                  >
                    {t.label} <span className={`ml-1 text-xs ${t.color || "text-slate-400"}`}>({t.count})</span>
                    {tab === t.key && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-royal rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 pb-2 text-xs font-bold text-slate-500">
                Sort by
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/20"
                  aria-label="Sort parameters"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </label>
            </div>

            {/* Parameters Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((p, i) => <ParameterCard key={i} p={p} />)}
              {shown.length === 0 && (
                <div className="col-span-2 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500">No parameters found for this category.</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar content */}
          <div className="flex flex-col gap-6">
            
            {/* Patient Info */}
            <div className="card p-5 bg-gradient-to-b from-slate-50 to-white">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Patient Details</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-royal to-violet text-white font-bold text-lg shadow-md">
                  {user.name ? user.name[0] : "U"}
                </span>
                <div>
                  <p className="font-extrabold text-navy text-lg leading-tight">{user.name || "User"}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">MediGuide Patient</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Report Status</p>
                <p className="font-bold text-navy capitalize">{reportData.report?.processingStatus || "—"}</p>
                <p className="text-xs font-medium text-slate-500 mt-3 mb-1">Date</p>
                <p className="font-bold text-navy">{reportData.report?.reportDate ? new Date(reportData.report.reportDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
              </div>
            </div>

            
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function AnalysisPage() {
  const [processed, setProcessed] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        let reportId = location.state?.reportId;

        if (!reportId) {
          // If no report ID was passed, fetch the most recent one
          const reportsRes = await api.get('/reports');
          if (reportsRes.data.data.length > 0) {
            reportId = reportsRes.data.data[0].report_id;
          } else {
            setError("No reports found. Please upload a report first.");
            return;
          }
        }

        // Uploads are processed in the background (OCR can take a minute),
        // so ask the server every 2 seconds until it is finished.
        let waited = false;
        for (;;) {
          const detail = await api.get(`/reports/${reportId}`);
          const status = detail.data.data.processing_status;
          if (cancelled) return;
          if (status === "failed") {
            setError(detail.data.data.processing_error || "This report could not be read.");
            return;
          }
          if (status === "completed") break;
          waited = true; // a fresh upload: keep showing the progress screen
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Fetch the lab results and summary for this report
        const summaryRes = await api.get(`/ai/summary/${reportId}`, { timeout: 90000 });
        if (!cancelled) {
          setReportData(summaryRes.data);
          if (!waited) setProcessed(true); // already analysed earlier: show it straight away
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch report analysis. Please try again.");
      }
    };

    let cancelled = false;
    fetchLatestReport();
    return () => { cancelled = true; };
  }, [location.state]);

  if (error) {
    return (
      <DashboardLayout pageTitle="Analysis">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
          <div className="p-6 bg-red-50 rounded-3xl w-full">
             <Icon n="alert" className="h-10 w-10 text-red-500 mx-auto mb-4" />
             <p className="text-red-600 font-bold mb-2">Analysis Error</p>
             <p className="text-sm text-red-700 mb-6">{error}</p>
             <button onClick={() => navigate('/upload-report')} className="btn-primary w-full">
               Upload a New Report
             </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show processing screen until data arrives and animation completes
  return processed && reportData
    ? <ReportResult reportData={reportData} />
    : <ProcessingScreen onDone={() => {
        // Only mark as done if data has actually loaded
        if (reportData) setProcessed(true);
      }} />;
}
