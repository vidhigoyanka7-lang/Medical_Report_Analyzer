import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon, MiniSparkline } from "../components/ui";
import api from "../services/api";

export default function ParameterPage() {
  const { id } = useParams(); // Using the test_name as the ID
  const [param, setParam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await api.get('/reports/trends');
        const trends = response.data.data;
        const found = trends.find(t => t.test_name.toLowerCase() === id.toLowerCase());
        
        if (found) {
          // Process data for UI
          const history = found.history.map(h => h.value);
          const historyDates = found.history.map(h => new Date(h.date).toLocaleDateString());
          
          const latest = found.history[found.history.length - 1];
          const color = latest.status === "LOW" ? "red" : latest.status === "HIGH" ? "orange" : "emerald";

          setParam({
            name: found.test_name,
            value: latest.value,
            range: found.reference_min !== null && found.reference_max !== null ? `${found.reference_min}–${found.reference_max}`
              : found.reference_max !== null ? `< ${found.reference_max}`
              : found.reference_min !== null ? `> ${found.reference_min}` : "not on report",
            unit: found.unit,
            status: latest.status,
            explanation: `Your ${found.test_name} level is currently ${latest.value} ${found.unit || ""}.${found.info ? " " + found.info.text : ""}`,
            possibleMeaning: `Based on your recent reports, this value is marked as ${latest.status}.`,
            history: history,
            historyFull: found.history,
            historyDates: historyDates,
            sparkData: history,
            color: color
          });
        }
      } catch (err) {
        console.error("Failed to load parameter trend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Parameter...">
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 rounded-full border-4 border-royal/30 border-t-royal animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!param) {
    return (
      <DashboardLayout pageTitle="Parameter Details">
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-300 mb-6">
            <Icon n="info" className="h-10 w-10" />
          </span>
          <h1 className="text-2xl font-extrabold text-navy">Parameter Not Found</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            We couldn't find the details for this parameter in your report history.
          </p>
          <Link to="/analysis" className="btn-primary mt-6">
            <Icon n="chevronLeft" className="h-4 w-4" /> Back to Analysis
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isBad = param.status !== "NORMAL";
  const badgeCls = isBad
    ? (param.color === "red" ? "bg-red-100 text-red-700 border-red-200" : "bg-orange-100 text-orange-700 border-orange-200")
    : "bg-emerald-100 text-emerald-700 border-emerald-200";
  const sparkHex = param.color === "red" ? "#dc2626" : param.color === "orange" ? "#ea580c" : "#059669";

  return (
    <DashboardLayout pageTitle={param.name}>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-fadeIn pb-10">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link to="/analysis" className="hover:text-royal transition flex items-center gap-1">
            <Icon n="chevronLeft" className="h-4 w-4" /> Report Analysis
          </Link>
          <Icon n="chevronRight" className="h-3 w-3" />
          <span className="text-navy">{param.name}</span>
        </nav>

        {/* Header card */}
        <div className={`card p-6 sm:p-8 border-2 ${isBad ? (param.color==="red" ? "border-red-200 bg-red-50/30" : "border-orange-200 bg-orange-50/30") : "border-emerald-200 bg-emerald-50/30"}`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-extrabold text-navy">{param.name}</h1>
                <span className={`badge border px-3 py-1 text-xs ${badgeCls}`}>
                  <Icon n={isBad ? "alert" : "check"} className="h-3.5 w-3.5" /> {param.status}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-extrabold text-navy leading-none">{param.value}</p>
                <p className="text-lg font-bold text-slate-500 pb-1">{param.unit}</p>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-3">
                Normal Range: <span className="font-bold text-navy">{param.range} {param.unit}</span>
              </p>
            </div>
            
            {param.sparkData.length > 1 && (
              <div className="shrink-0 w-full sm:w-auto bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 text-center">Recent Trend</p>
                <MiniSparkline data={param.sparkData} color={sparkHex} width={120} height={40} />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Explanation */}
          <div className="card p-6 border-l-4 border-royal">
            <div className="flex items-center gap-2 mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-royal">
                <Icon n="info" className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-navy">What is this?</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {param.explanation}
            </p>
          </div>

          {/* Possible meaning */}
          <div className="card p-6 border-l-4 border-violet">
            <div className="flex items-center gap-2 mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet/10 text-violet">
                <Icon n="question" className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-navy">What does this mean?</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {param.possibleMeaning}
            </p>
          </div>
        </div>

        {/* History Details */}
        <div className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Icon n="history" className="h-5 w-5 text-royal" />
            Detailed History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Date</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Result</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {param.historyFull.map((h, idx) => {
                  const stat = h.status;
                  const bCls = stat === "LOW" ? "bg-red-100 text-red-700" : stat === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700";
                  
                  return (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-navy">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 font-extrabold text-navy">{h.value} <span className="text-xs font-medium text-slate-400">{param.unit}</span></td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bCls}`}>
                          {stat}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link to="/assistant" className="btn-grad flex-1 py-3.5 text-base shadow-lg shadow-violet/30">
            <Icon n="chat" className="h-5 w-5" />Ask AI about {param.name}
          </Link>
          <Link to="/analysis" className="btn-secondary flex-1 py-3.5 text-base">
            <Icon n="file" className="h-5 w-5" />View Full Report
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
