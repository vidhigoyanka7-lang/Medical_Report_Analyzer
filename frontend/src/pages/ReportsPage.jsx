import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon, Modal } from "../components/ui";
import api from "../services/api";

function StatusBadge({ status }) {
  if (status === "NORMAL") return <span className="badge bg-emerald-100 text-emerald-700"><Icon n="check" className="h-3.5 w-3.5 mr-1" />Normal</span>;
  if (status === "LOW")    return <span className="badge bg-red-100 text-red-700"><Icon n="alert" className="h-3.5 w-3.5 mr-1" />Abnormal</span>;
  if (status === "FAILED") return <span className="badge bg-red-100 text-red-700"><Icon n="alert" className="h-3.5 w-3.5 mr-1" />Failed</span>;
  if (status === "PROCESSING") return <span className="badge bg-slate-100 text-slate-600">Processing</span>;
  if (status === "HIGH")   return <span className="badge bg-orange-100 text-orange-700"><Icon n="alert" className="h-3.5 w-3.5 mr-1" />Attention</span>;
  return null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports');
        // Map backend fields to frontend expected fields
        const mapped = res.data.data.map(r => ({
          id: r.report_id,
          name: r.report_name,
          date: new Date(r.uploaded_at).toLocaleDateString(),
          type: r.mime_type?.includes('pdf') ? 'PDF' : 'Image',
          size: r.processing_status,
          // LOW/HIGH counts come from lab_results (computed by the backend)
          status: r.processing_status === "failed" ? "FAILED"
                : r.processing_status !== "completed" ? "PROCESSING"
                : Number(r.abnormal_count) > 0 ? "HIGH" : "NORMAL"
        }));
        setReports(mapped);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || 
                        (filter === "abnormal" && r.status === "HIGH") ||
                        (filter === "normal" && r.status === "NORMAL");
    return matchSearch && matchFilter;
  });

  const confirmDelete = async () => {
    try {
      await api.delete(`/reports/${deleteId}`);
      setReports((r) => r.filter((rep) => rep.id !== deleteId));
    } catch (err) {
      console.error("Failed to delete report", err);
    }
    setDeleteId(null);
  };

  return (
    <DashboardLayout pageTitle="Reports History">
      <div className="flex flex-col gap-6 animate-fadeIn pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">My Reports</h1>
            <p className="text-sm text-slate-500 mt-1">All your uploaded medical reports</p>
          </div>
          <Link to="/upload-report" className="btn-primary shadow-lg shadow-violet/30 py-3">
            <Icon n="upload" className="h-4 w-4" />Upload New Report
          </Link>
        </div>

        {/* Controls */}
        <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
          <label className="flex-1 flex items-center gap-3 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 focus-within:border-royal focus-within:ring-2 focus-within:ring-royal/20 transition">
            <Icon n="search" className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by name..."
              className="bg-transparent w-full text-sm outline-none placeholder:text-slate-400 font-medium text-navy"
            />
          </label>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
            {[
              { id: "all", label: "All Reports" },
              { id: "normal", label: "Normal" },
              { id: "abnormal", label: "Needs Attention" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === f.id ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card py-20 flex flex-col items-center justify-center text-center">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-50 text-slate-300 mb-4">
              <Icon n="file" className="h-10 w-10" />
            </span>
            <p className="text-xl font-bold text-navy">No reports found</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              {search ? "Try adjusting your search or filters." : "You haven't uploaded any medical reports yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, k) => (
              <div key={r.id} className="card p-5 card-hover flex flex-col animate-scaleIn" style={{ animationDelay: `${k * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${r.type === "PDF" ? "bg-red-50 text-red-500" : "bg-blue-50 text-royal"}`}>
                    <Icon n={r.type === "PDF" ? "file" : "eye"} className="h-6 w-6" />
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                
                <h3 className="font-extrabold text-navy text-lg truncate mb-1">{r.name}</h3>
                <p className="text-xs font-medium text-slate-400 mb-5">{r.date} · {r.size} · {r.type}</p>
                
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link to="/analysis" state={{ reportId: r.id }} className="btn-secondary py-2 text-xs w-full">
                    View Analysis
                  </Link>
                  <button 
                    onClick={() => setDeleteId(r.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-white text-red-500 font-bold text-xs py-2 hover:bg-red-50 transition"
                  >
                    <Icon n="x" className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Report">
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Are you sure you want to delete this report? This action cannot be undone and will remove it from your analysis history.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 py-3">Cancel</button>
            <button onClick={confirmDelete} className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 flex-1 py-3">
              Delete Report
            </button>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
