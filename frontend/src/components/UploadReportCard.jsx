import { useRef, useState } from "react";
import { Icon } from "./ui";

export default function UploadReportCard() {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [dragging, setDragging] = useState(false);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErr("Only PDF files are accepted.");
      setFile(null);
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErr("File size exceeds 20 MB limit.");
      setFile(null);
      return;
    }
    setErr("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const sizeKb = file ? (file.size / 1024).toFixed(0) : "";

  return (
    <section
      id="upload-section"
      className={`
        relative overflow-hidden rounded-3xl border-2 border-dashed px-6 py-10 text-center
        transition-all duration-300 cursor-pointer
        ${dragging
          ? "border-violet bg-violet/5 shadow-inner scale-[1.01]"
          : file
          ? "border-emerald-400 bg-emerald-50"
          : "border-royal/30 bg-sky hover:border-royal hover:bg-blue-50"
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !file && ref.current.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload PDF report"
      onKeyDown={(e) => e.key === "Enter" && ref.current.click()}
    >
      {/* Decorative bg */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-royal/5 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-violet/5 blur-2xl" />

      {file ? (
        /* Success state */
        <div className="relative z-10 animate-scaleIn">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Icon n="check" className="h-8 w-8" />
          </div>
          <p className="text-lg font-extrabold text-emerald-700">File Selected!</p>
          <p className="mt-1 text-sm text-slate-600 font-medium truncate max-w-xs mx-auto">{file.name}</p>
          <p className="text-xs text-slate-500 mt-1">{sizeKb} KB · PDF</p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setErr(""); }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Remove
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="btn-grad"
              id="analyze-report-btn"
            >
              <Icon n="spark" className="h-4 w-4" />
              Analyze with AI
            </button>
          </div>
        </div>
      ) : (
        /* Upload state */
        <div className="relative z-10">
          {/* Upload icon */}
          <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-md text-royal transition duration-300 ${dragging ? "scale-110 text-violet" : "hover:scale-105"}`}>
            <Icon n="upload" className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-extrabold text-navy">
            {dragging ? "Drop your PDF here!" : "Drag & Drop PDF Report Here"}
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
            or click to browse your files
          </p>

          {/* Browse button */}
          <button
            id="browse-files-btn"
            onClick={(e) => { e.stopPropagation(); ref.current.click(); }}
            className="btn-grad mt-5"
          >
            <Icon n="file" className="h-4 w-4" />
            Browse Files
          </button>

          <p className="mt-3 text-xs text-slate-400">Supports PDF only (Max 20MB)</p>

          {/* PDF icon decoration */}
          <div className="pointer-events-none absolute right-6 top-4 hidden sm:flex flex-col items-center gap-2 opacity-40">
            <div className="h-16 w-12 rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center">
              <span className="text-xs font-extrabold text-red-400">PDF</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {err && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600 animate-fadeIn">
          ⚠️ {err}
        </p>
      )}

      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => pick(e.target.files[0])}
      />
    </section>
  );
}