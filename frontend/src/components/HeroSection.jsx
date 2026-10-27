import { Link } from "react-router-dom";
import { Icon } from "./ui";

/* ──────────────────────────────────────────
   Medical Report SVG Illustration
   ────────────────────────────────────────── */
function ReportIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] h-[220px] sm:h-[260px] select-none">
      {/* Glow blob */}
      <div className="absolute inset-8 rounded-full bg-blue-400/25 blur-3xl" />

      {/* Main document card */}
      <div className="absolute left-[10%] top-[5%] w-[130px] sm:w-[150px] h-[170px] sm:h-[195px] bg-white rounded-2xl shadow-2xl rotate-[-7deg] p-4 animate-float">
        <div className="w-8 h-8 bg-gradient-to-br from-royal to-violet rounded-lg flex items-center justify-center mb-3">
          <Icon n="activity" className="h-4 w-4 text-white" />
        </div>
        <div className="space-y-2">
          {[100, 75, 90, 60, 80].map((w, i) => (
            <div key={i} className={`h-2 rounded-full ${i % 2 === 0 ? "bg-blue-100" : "bg-slate-100"}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Mini chart */}
        <svg viewBox="0 0 80 30" className="w-full mt-3" fill="none">
          <polyline
            points="0,25 15,18 30,22 45,10 60,14 80,5"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Badge: AI Score */}
      <div className="absolute right-[5%] top-[8%] animate-floatSlow [animation-delay:.8s]">
        <div className="rounded-2xl bg-white p-3 shadow-xl border border-slate-100">
          <p className="text-[10px] font-bold text-navy flex items-center gap-1">
            <Icon n="spark" className="h-3 w-3 text-amber-500" /> AI Score
          </p>
          <p className="text-2xl font-extrabold text-royal mt-0.5">92</p>
          <p className="text-[9px] text-emerald-600 font-semibold">Excellent ↑</p>
        </div>
      </div>

      {/* Badge: Shield */}
      <div className="absolute right-[8%] bottom-[8%] grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-royal to-violet text-white shadow-lg animate-float [animation-delay:1.2s]">
        <Icon n="shield" className="h-6 w-6" />
      </div>

      {/* Badge: AI Insight */}
      <div className="absolute left-[5%] bottom-[10%] animate-floatSlow [animation-delay:.4s]">
        <div className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-violet shadow-lg border border-violet/20">
          ✦ AI Insight Ready
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Hero Section (for / landing)
   ────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#12308F] to-royal p-8 text-white shadow-2xl shadow-navy/20 sm:p-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet/35 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-royal/30 blur-2xl" />
      <div className="relative grid items-center gap-10 md:grid-cols-2">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
            <Icon n="spark" className="h-3.5 w-3.5 text-amber-300" />
            AI-powered healthcare platform
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            MediGuide <span className="text-blue-300">AI</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-blue-200">Your health, our priority</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-100/90 sm:text-base">
            Upload your medical reports and understand your health with AI-powered insights, simple explanations and personalized recommendations.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/upload-report"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy shadow-lg transition duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(255,255,255,.4)]"
            >
              <Icon n="upload" className="h-4 w-4 text-royal" />
              Upload Medical Report
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-white/25 transition hover:bg-white/10"
            >
              Explore Dashboard →
            </Link>
          </div>
        </div>
        <ReportIllustration />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   Welcome Card (dashboard hero)
   ────────────────────────────────────────── */
export function WelcomeCard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const emoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07145C] via-[#1B2EA0] to-royal p-6 text-white shadow-2xl sm:p-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />

      <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="animate-fadeUp">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            {greeting}, Arjun! {emoji}
          </h2>
          <p className="mt-2 text-sm text-blue-200/90">
            Let's analyze your health reports with the power of AI
          </p>
          <Link
            to="/upload-report"
            id="hero-upload-btn"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition duration-300 hover:bg-white hover:text-navy"
          >
            <Icon n="upload" className="h-4 w-4" />
            Upload New Report
          </Link>
        </div>

        {/* Floating report card */}
        <div className="hidden sm:block pointer-events-none">
          <div className="relative h-40 w-52 rotate-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur animate-float">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-royal text-white">
                <Icon n="file" className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold">Blood Report</span>
            </div>
            {[85, 60, 75].map((w, i) => (
              <div key={i} className="mb-2 h-2 rounded-full bg-white/30" style={{ width: `${w}%` }} />
            ))}
            <div className="absolute -right-4 -top-4 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg">
              <Icon n="shield" className="h-5 w-5 text-violet" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}