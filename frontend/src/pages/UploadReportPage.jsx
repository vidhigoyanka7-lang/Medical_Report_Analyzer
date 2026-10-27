import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_MB = 20;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const REPORT_TYPES = [
  "Blood Test (CBC)", "Lipid Profile", "Thyroid Panel",
  "Liver Function", "Kidney Function", "Vitamin Panel",
  "Urine Analysis", "X-Ray Report", "MRI Report",
];

export default function UploadReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // A file chosen on the Dashboard is passed along so the user does not pick it twice.
  const [file, setFile]       = useState(location.state?.file || null);
  const [error, setError]     = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]  = useState(0);

  const validate = (f) => {
    if (!ACCEPTED.includes(f.type)) {
      setError("Please upload a PDF, JPG, or PNG file.");
      return false;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${MAX_MB} MB.`);
      return false;
    }
    return true;
  };

  const handleFile = useCallback((f) => {
    setError("");
    if (!f || !validate(f)) return;
    setFile(f);
    setProgress(0);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onBrowse    = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };

  const handleAnalyze = async () => {
    if (!file || uploading) return;
    
    const formData = new FormData();
    formData.append("report", file);
    formData.append("reportName", file.name);

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const response = await api.post('/reports/upload', formData, {
        timeout: 120000, // the upload itself; processing continues in the background
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      // We can pass the report ID to the analysis page if needed
      // navigate(`/analysis/${response.data.reportId}`);
      navigate("/analysis", { state: { reportId: response.data.reportId } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload and process report.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Upload Report">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fadeIn">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Upload Medical Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your latest report and let MediGuide AI explain your health in simple language.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-8 py-14 text-center cursor-pointer transition-all duration-300
            ${dragging
              ? "border-violet bg-violet/5 shadow-inner animate-glow"
              : "border-royal/30 bg-gradient-to-br from-blue-50/80 to-violet/5 hover:border-royal hover:bg-blue-50/80"
            }`}
          role="region"
          aria-label="File upload drop area"
        >
          {/* Decorative dots */}
          <div className="pointer-events-none absolute top-4 right-4 h-16 w-16 rounded-full bg-royal/5 blur-xl" />
          <div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 rounded-full bg-violet/10 blur-lg" />

          <span className={`grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-royal to-violet text-white shadow-xl shadow-violet/30 ${dragging ? "scale-110" : ""} transition-transform duration-300`}>
            <Icon n="upload" className="h-10 w-10" aria-hidden="true" />
          </span>

          <div>
            <p className="text-lg font-extrabold text-navy">
              {dragging ? "Drop it here!" : "Drag & Drop your report here"}
            </p>
            <p className="text-sm text-slate-400 mt-1">or</p>
          </div>

          <label
            htmlFor="file-upload"
            className="btn-primary cursor-pointer text-base px-7 py-3"
            id="browse-files-label"
          >
            <Icon n="file" className="h-5 w-5" />
            Browse Files
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onBrowse}
              aria-label="Choose a medical report file"
            />
          </label>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            {["PDF", "JPG", "PNG"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold">
                <Icon n="file" className="h-3.5 w-3.5 text-slate-300" />{t}
              </span>
            ))}
            <span className="text-slate-300">·</span>
            <span>Max {MAX_MB} MB</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 animate-scaleIn" role="alert">
            <Icon n="alert" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* File selected */}
        {file && (
          <div className="card p-5 animate-scaleIn">
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <Icon n="check" className="h-4 w-4 text-emerald-500" />
              File Selected
            </h2>

            <div className="flex items-center gap-4">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-md ${file.type === "application/pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-royal"}`}>
                <Icon n={file.type === "application/pdf" ? "file" : "eye"} className="h-7 w-7" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {file.type === "application/pdf" ? "PDF Document" : "Image File"} · {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setError(""); setProgress(0); }}
                className="rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                aria-label="Remove file"
                id="remove-file-btn"
              >
                <Icon n="x" className="h-5 w-5" />
              </button>
            </div>

            {/* Upload progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-600">
                  {uploading ? "Uploading & extracting text..." : progress === 100 ? "Ready to analyze" : "Ready to upload"}
                </span>
                <span className={`font-bold ${uploading ? "text-royal" : "text-emerald-600"}`}>{progress}%</span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress < 100
                      ? "bg-gradient-to-r from-royal to-violet"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Image preview */}
            {file.type !== "application/pdf" && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 max-h-52 bg-slate-50">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Report preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={uploading}
              className="btn-primary w-full mt-5 text-base py-3.5"
              id="analyze-report-btn"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Icon n="spark" className="h-5 w-5" />
                  Analyze Report with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Supported Types */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
            <Icon n="info" className="h-4 w-4 text-royal" aria-hidden="true" />
            Supported Report Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-royal hover:text-royal hover:bg-blue-50 transition"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3" role="note">
          <Icon n="shield" className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700">
            <strong>Your privacy is protected.</strong> Your report data is processed securely and is never shared.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
