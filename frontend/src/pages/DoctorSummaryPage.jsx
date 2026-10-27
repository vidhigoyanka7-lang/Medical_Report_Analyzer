import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";

const rangeText = (r) =>
  r.reference_min !== null && r.reference_max !== null ? `${r.reference_min}–${r.reference_max}`
  : r.reference_max !== null ? `< ${r.reference_max}`
  : r.reference_min !== null ? `> ${r.reference_min}` : "not shown";

// Builds the summary from the user's latest report. Everything here is plain
// rules on stored values (no AI, no diagnosis).
function buildSummary(report, labResults, trends, userName, profile) {
  const abnormal = labResults.filter((r) => r.status === "LOW" || r.status === "HIGH");

  const trendRows = trends
    .filter((t) => t.history.length >= 2)
    .map((t) => {
      const prev = t.history[t.history.length - 2].value;
      const curr = t.history[t.history.length - 1].value;
      return { name: t.test_name, prev, curr, trend: curr < prev ? "down" : "up" };
    });

  return {
    // From the saved Health Profile ("—" when the user has not filled it in)
    patient: {
      name: userName,
      age: profile.personal.dob ? Math.floor((Date.now() - new Date(profile.personal.dob)) / 31557600000) : "—",
      gender: profile.personal.gender || "—",
      height: profile.personal.height ? `${profile.personal.height} cm` : "—",
      weight: profile.personal.weight ? `${profile.personal.weight} kg` : "—",
    },
    reportName: report.report_name,
    reportDate: new Date(report.report_date).toLocaleDateString(),
    abnormalParams: abnormal.map((r) => ({
      name: r.test_name, value: r.test_value, unit: r.unit || "", range: rangeText(r), status: r.status,
    })),
    trends: trendRows,
    findings: abnormal.map((r) => `${r.test_name} is ${r.status === "LOW" ? "below" : "above"} the reference range shown on the report`),
    questions: abnormal.map((r) => `My ${r.test_name} is ${r.test_value} ${r.unit || ""} (${r.status.toLowerCase()}). What could this mean for me, and should it be re-checked?`),
  };
}

function Message({ children }) {
  return (
    <DashboardLayout pageTitle="Doctor Summary">
      <div className="max-w-4xl mx-auto card p-10 text-center text-slate-500 font-medium">{children}</div>
    </DashboardLayout>
  );
}

export default function DoctorSummaryPage() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{"name": "Guest"}');
  const [summaryData, setSummaryData] = useState(null);
  const [state, setState] = useState("loading"); // loading | empty | error | ready

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.get('/reports');
        const latest = list.data.data.find((r) => r.processing_status === "completed");
        if (!latest) { setState("empty"); return; }
        const [detail, trends, profile] = await Promise.all([
          api.get(`/reports/${latest.report_id}`),
          api.get('/reports/trends'),
          api.get('/profile'),
        ]);
        const d = detail.data.data;
        setSummaryData(buildSummary(d, d.labResults, trends.data.data, storedUser.name || "Guest", profile.data.data));
        setState("ready");
      } catch (err) {
        console.error(err);
        setState("error");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") return <Message>Loading your summary...</Message>;
  if (state === "empty") return <Message>No analysed reports yet. Upload a report to generate a doctor summary.</Message>;
  if (state === "error") return <Message>Unable to load the summary. Please try again.</Message>;

  return (
    <DashboardLayout pageTitle="Doctor Summary">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fadeIn pb-10">
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Doctor Summary</h1>
            <p className="text-sm text-slate-500 mt-1">A concise summary prepared for your doctor</p>
          </div>
          <button onClick={() => window.print()} className="btn-primary shadow-lg shadow-violet/30 py-3">
            <Icon n="download" className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>

        {/* Print wrapper */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between border-b-2 border-slate-100 pb-6 mb-6 gap-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-royal to-violet text-white shadow-md">
                <Icon n="file" className="h-8 w-8" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold text-navy leading-none mb-2">Patient Summary</h2>
                <p className="text-sm font-bold text-slate-500">{summaryData.reportName} · {summaryData.reportDate}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div><span className="text-[10px] font-bold text-slate-400 uppercase">Patient</span><p className="text-sm font-bold text-navy">{summaryData.patient.name}</p></div>
              <div><span className="text-[10px] font-bold text-slate-400 uppercase">Age/Sex</span><p className="text-sm font-bold text-navy">{summaryData.patient.age} / {summaryData.patient.gender}</p></div>
              <div><span className="text-[10px] font-bold text-slate-400 uppercase">Height</span><p className="text-sm font-bold text-navy">{summaryData.patient.height}</p></div>
              <div><span className="text-[10px] font-bold text-slate-400 uppercase">Weight</span><p className="text-sm font-bold text-navy">{summaryData.patient.weight}</p></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Col */}
            <div className="flex flex-col gap-8">
              
              <section>
                <h3 className="text-sm font-bold text-royal uppercase tracking-wider border-l-4 border-royal pl-3 mb-4">Important Findings</h3>
                <ul className="flex flex-col gap-3">
                  {summaryData.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-50 text-royal font-bold text-[10px] mt-0.5">{i+1}</span>
                      <p className="text-sm font-bold text-slate-700">{f}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-4 border-orange-500 pl-3 mb-4">Abnormal Parameters</h3>
                <div className="flex flex-col gap-3">
                  {summaryData.abnormalParams.map(p => (
                    <div key={p.name} className={`flex items-center justify-between rounded-xl p-3 border ${p.status === "LOW" ? "bg-red-50/50 border-red-100" : "bg-orange-50/50 border-orange-100"}`}>
                      <div>
                        <p className="text-sm font-extrabold text-navy">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">Range: {p.range} {p.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-extrabold leading-none ${p.status === "LOW" ? "text-red-600" : "text-orange-600"}`}>{p.value} <span className="text-xs">{p.unit}</span></p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm inline-block mt-1 text-white ${p.status === "LOW" ? "bg-red-500" : "bg-orange-500"}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Col */}
            <div className="flex flex-col gap-8">

              <section>
                <h3 className="text-sm font-bold text-violet uppercase tracking-wider border-l-4 border-violet pl-3 mb-4">Recent Trends</h3>
                <div className="flex flex-col gap-3">
                  {summaryData.trends.map(t => (
                    <div key={t.name} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-sm font-bold text-navy">{t.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">{t.prev}</span>
                        <Icon n="arrowRight" className="h-4 w-4 text-slate-300" />
                        <span className="text-sm font-extrabold text-navy">{t.curr}</span>
                        <Icon n="trend" className={`h-4 w-4 ${t.trend === "down" ? "text-red-500" : "text-orange-500"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-l-4 border-emerald-500 pl-3 mb-4">Questions for Doctor</h3>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                  <ul className="flex flex-col gap-4">
                    {summaryData.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] mt-0.5">{i+1}</span>
                        <p className="text-sm font-bold text-slate-700 leading-snug">{q}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

            </div>

          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400">Generated by MediGuide AI · Not a replacement for professional medical diagnosis</p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
