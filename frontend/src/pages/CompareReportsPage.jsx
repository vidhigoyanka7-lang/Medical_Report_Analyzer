import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_COLOR = { NORMAL: "#059669", LOW: "#dc2626", HIGH: "#ea580c", UNKNOWN: "#94a3b8" };
const STATUS_TEXT = { NORMAL: "text-emerald-700", LOW: "text-red-600", HIGH: "text-orange-600", UNKNOWN: "text-slate-500" };

// Direction of change from the first selected report to the last one.
// A change smaller than 2% is shown as "Stable". This is only about the number, not a diagnosis.
function getDirection(first, last) {
  const diff = last - first;
  const base = Math.abs(first) || 1;
  if (Math.abs(diff) / base < 0.02) return "stable";
  return diff > 0 ? "up" : "down";
}

const DIRECTION_INFO = {
  up:     { label: "Upward",   arrow: "↑", cls: "bg-blue-50 text-blue-700" },
  down:   { label: "Downward", arrow: "↓", cls: "bg-violet-50 text-violet-700" },
  stable: { label: "Stable",   arrow: "→", cls: "bg-slate-100 text-slate-600" },
};

function DirectionBadge({ direction }) {
  const d = DIRECTION_INFO[direction];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${d.cls}`}>
      {d.arrow} {d.label}
    </span>
  );
}

// How far a value is outside the reference range (0 = inside the range).
const distanceOutside = (v, min, max) =>
  min !== null && v < min ? min - v : max !== null && v > max ? v - max : 0;

const rangeText = (t) =>
  t.reference_min !== null && t.reference_max !== null ? `${t.reference_min}–${t.reference_max}`
  : t.reference_max !== null ? `< ${t.reference_max}`
  : t.reference_min !== null ? `> ${t.reference_min}` : "not on report";

/* ─── Line chart (plain SVG) ──────────────────────────────────── */
// One point per selected report. The green band is the reference range from the report.
function TrendLineChart({ points, refMin, refMax }) {
  const w = 320, h = 150, padL = 46, padR = 14, padT = 16, padB = 30;
  const values = points.map((p) => p.value);
  const lows = [...values, ...(refMin !== null ? [refMin] : [])];
  const highs = [...values, ...(refMax !== null ? [refMax] : [])];
  let min = Math.min(...lows), max = Math.max(...highs);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.1; max += span * 0.1;

  const x = (i) => padL + (points.length === 1 ? 0 : (i * (w - padL - padR)) / (points.length - 1));
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");

  const bandTop = refMax !== null ? y(refMax) : padT;
  const bandBottom = refMin !== null ? y(refMin) : h - padB;
  const hasBand = refMin !== null || refMax !== null;
  const fmt = (v) => (Math.abs(v) >= 1000 ? Math.round(v).toString() : Number(v.toFixed(2)).toString());

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Trend chart">
      {hasBand && <rect x={padL} y={bandTop} width={w - padL - padR} height={Math.max(bandBottom - bandTop, 1)} fill="#10b981" opacity="0.12" />}
      {[0, 0.5, 1].map((f) => {
        const v = min + (max - min) * (1 - f);
        const yy = padT + f * (h - padT - padB);
        return (
          <g key={f}>
            <line x1={padL} x2={w - padR} y1={yy} y2={yy} stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{fmt(v)}</text>
          </g>
        );
      })}
      {points.length > 1 && <path d={path} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((p, i) => (
        <g key={p.report_id}>
          <circle cx={x(i)} cy={y(p.value)} r="5" fill="#fff" stroke={STATUS_COLOR[p.status] || STATUS_COLOR.UNKNOWN} strokeWidth="3" />
          <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#07145C">{fmt(p.value)}</text>
          <text x={x(i)} y={h - 10} textAnchor="middle" fontSize="9" fill="#64748b">{p.shortDate}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function CompareReportsPage() {
  const [reports, setReports] = useState([]);
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState([]); // report ids
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [repRes, trendRes] = await Promise.all([api.get("/reports"), api.get("/reports/trends")]);
        // Only reports that finished processing and have values can be compared.
        const usable = repRes.data.data
          .filter((r) => r.processing_status === "completed" && Number(r.result_count) > 0)
          .sort((a, b) => String(a.report_date).localeCompare(String(b.report_date)) || a.report_id - b.report_id);
        setReports(usable);
        setTrends(trendRes.data.data);
        setSelected(usable.slice(-3).map((r) => r.report_id)); // start with the 3 newest
      } catch (err) {
        console.error(err);
        setError("Unable to load your reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  // Selected reports, oldest -> newest
  const chosen = useMemo(() => reports.filter((r) => selected.includes(r.report_id)), [reports, selected]);

  // One row per test that appears in at least 2 of the selected reports
  const rows = useMemo(() => {
    if (chosen.length < 2) return [];
    const out = [];
    trends.forEach((t) => {
      const points = chosen
        .map((r) => {
          const h = t.history.find((x) => x.report_id === r.report_id);
          return h ? { report_id: r.report_id, value: h.value, status: h.status, shortDate: fmtDate(r.report_date).replace(/ \d{4}$/, "") } : null;
        })
        .filter(Boolean);
      if (points.length < 2) return;
      const first = points[0].value, last = points[points.length - 1].value;
      out.push({
        name: t.test_name, unit: t.unit || "", refMin: t.reference_min, refMax: t.reference_max, range: rangeText(t),
        points, diff: last - first, direction: getDirection(first, last),
        before: distanceOutside(first, t.reference_min, t.reference_max),
        after: distanceOutside(last, t.reference_min, t.reference_max),
        latestStatus: points[points.length - 1].status,
      });
    });
    // tests that are LOW/HIGH in the newest report first
    const rank = (r) => (r.latestStatus === "LOW" || r.latestStatus === "HIGH" ? 0 : r.latestStatus === "UNKNOWN" ? 1 : 2);
    return out.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }, [trends, chosen]);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Compare Reports">
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 rounded-full border-4 border-royal/30 border-t-royal animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const summary = [
    { label: "Moved toward range", count: rows.filter((r) => r.after < r.before).length, icon: "check", c1: "bg-emerald-50 border-emerald-100", c2: "text-emerald-700", c3: "bg-emerald-100 text-emerald-600" },
    { label: "Moved away from range", count: rows.filter((r) => r.after > r.before).length, icon: "trend", c1: "bg-red-50 border-red-100", c2: "text-red-600", c3: "bg-red-100 text-red-500" },
    { label: "No change in range position", count: rows.filter((r) => r.after === r.before).length, icon: "activity", c1: "bg-slate-50 border-slate-100", c2: "text-slate-600", c3: "bg-slate-200 text-slate-500" },
  ];

  return (
    <DashboardLayout pageTitle="Compare Reports">
      <div className="flex flex-col gap-6 animate-fadeIn pb-10">

        <div>
          <h1 className="text-2xl font-extrabold text-navy">Compare Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Select two or more reports to see how each value changes over time</p>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700 font-medium">{error}</div>}

        {/* Report picker */}
        <div className="card p-6 border-t-4 border-t-royal">
          {reports.length < 2 ? (
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">You need at least 2 analysed reports to compare.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Choose reports ({selected.length} selected)
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(reports.map((r) => r.report_id))} className="text-xs font-bold text-royal hover:underline">Select all</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={() => setSelected([])} className="text-xs font-bold text-slate-500 hover:underline">Clear</button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((r) => {
                  const on = selected.includes(r.report_id);
                  return (
                    <button
                      key={r.report_id}
                      type="button"
                      onClick={() => toggle(r.report_id)}
                      aria-pressed={on}
                      className={`text-left rounded-2xl border-2 p-4 transition ${on ? "border-royal bg-blue-50/60 shadow-sm" : "border-slate-100 bg-white hover:border-royal/30"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${on ? "bg-royal border-royal text-white" : "border-slate-300"}`}>
                          {on && <Icon n="check" className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-navy truncate">{r.report_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{fmtDate(r.report_date)} · {r.report_type || "Report"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.result_count} values</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selected.length < 2 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 p-3 text-sm text-orange-700 font-medium">
                  <Icon n="alert" className="h-4 w-4 shrink-0" />
                  Please select at least two reports to compare.
                </div>
              )}
            </>
          )}
        </div>

        {chosen.length >= 2 && rows.length === 0 && (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No common parameters found between the selected reports.</p>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex flex-col gap-6 animate-fadeUp">

            {/* Summary blocks (first selected report -> last) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {summary.map((s) => (
                <div key={s.label} className={`rounded-3xl border ${s.c1} p-6 flex flex-col items-center justify-center`}>
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${s.c3} mb-3`}><Icon n={s.icon} className="h-5 w-5" /></span>
                  <p className={`text-4xl font-extrabold ${s.c2}`}>{s.count}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 text-center">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trend graphs */}
            <div>
              <h2 className="section-title mb-1">Trend graphs</h2>
              <p className="text-xs text-slate-500 mb-4">
                Each graph shows one value across your selected reports, oldest to newest. The green band is the reference range printed on the report.
                Direction compares the first and last selected report.
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((r) => (
                  <div key={r.name} className="card p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="font-extrabold text-navy truncate">{r.name}</p>
                        <p className="text-[11px] text-slate-400">Range: {r.range} {r.unit}</p>
                      </div>
                      <DirectionBadge direction={r.direction} />
                    </div>
                    <TrendLineChart points={r.points} refMin={r.refMin} refMax={r.refMax} />
                  </div>
                ))}
              </div>
            </div>

            {/* Table with one column per report */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-sm font-bold text-navy">Detailed Parameter Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white">
                      <th className="py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wide">Parameter</th>
                      {chosen.map((r) => (
                        <th key={r.report_id} className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-center whitespace-nowrap">
                          <span className="block text-slate-600 normal-case max-w-[120px] truncate mx-auto">{r.report_name}</span>
                          <span className="block font-semibold normal-case text-[10px]">{fmtDate(r.report_date)}</span>
                        </th>
                      ))}
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">Change</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">Trend</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.name} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="py-4 px-5 font-extrabold text-navy">{r.name}</td>
                        {chosen.map((rep) => {
                          const p = r.points.find((x) => x.report_id === rep.report_id);
                          return (
                            <td key={rep.report_id} className="py-4 px-4 text-center">
                              {p ? (
                                <span className={`font-bold ${STATUS_TEXT[p.status] || ""}`}>
                                  {p.value} <span className="text-[10px] font-medium text-slate-400">{r.unit}</span>
                                </span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                          );
                        })}
                        <td className="py-4 px-4 text-center font-bold text-slate-600">{r.diff > 0 ? "+" : ""}{Number(r.diff.toFixed(2))}</td>
                        <td className="py-4 px-4 text-center"><DirectionBadge direction={r.direction} /></td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{r.range} {r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-100">
                Colours show each value's status against the report's own reference range (green normal, red low, orange high, grey unknown).
                A trend describes how the number moved; it is not a diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
