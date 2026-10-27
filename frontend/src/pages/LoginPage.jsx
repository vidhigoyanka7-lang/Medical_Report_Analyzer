import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/ui";
import api from "../services/api";

/* ─── Medical Illustration SVG (left panel) ───────────────────── */
function MedicalIllustration() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 select-none">
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl animate-float" />
      <div className="absolute bottom-20 right-8 h-14 w-14 rounded-full bg-violet-500/20 blur-xl animate-floatSlow" />

      {/* Report card illustration */}
      <div className="relative mb-8 animate-float" style={{ animationDelay: "0s" }}>
        {/* Main report card */}
        <div className="rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30 p-5 shadow-2xl w-52">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-full bg-white/30 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 14l-3-3m0 0l3-3m-3 3h8" />
              </svg>
            </div>
            <div>
              <div className="h-2 w-20 bg-white/50 rounded-full" />
              <div className="h-1.5 w-14 bg-white/30 rounded-full mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            {[["Hemoglobin", "10.2", "LOW"], ["Cholesterol", "240", "HIGH"], ["Vitamin D", "18", "LOW"]].map(([name, val, status]) => (
              <div key={name} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-1.5">
                <span className="text-[10px] text-white/80 font-medium">{name}</span>
                <span className="text-[10px] font-bold text-white">{val}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${status === "LOW" || status === "HIGH" ? "bg-red-400/80 text-white" : "bg-emerald-400/80 text-white"}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating AI badge */}
        <div className="absolute -top-5 -right-6 rounded-2xl bg-white/20 backdrop-blur px-3 py-2 ring-1 ring-white/30 animate-float" style={{ animationDelay: "1.2s" }}>
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white">AI Analysis</span>
          </div>
          <p className="text-[9px] text-white/70 mt-0.5">98% Confidence</p>
        </div>

        {/* Health score badge */}
        <div className="absolute -bottom-4 -left-5 rounded-2xl bg-white/20 backdrop-blur px-3 py-2 ring-1 ring-white/30 animate-float" style={{ animationDelay: "0.6s" }}>
          <p className="text-[9px] text-white/70">Health Score</p>
          <p className="text-lg font-extrabold text-white leading-none">92<span className="text-xs font-normal">/100</span></p>
        </div>
      </div>

      {/* Text */}
      <div className="relative text-center mt-4 z-10">
        <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
          AI-Powered<br />
          Health Insights<br />
          <span className="text-white">For </span>
          <span className="bg-gradient-to-r from-[#93C5FD] to-[#C4B5FD] bg-clip-text text-transparent">A Better You</span>
        </h2>
        <p className="text-sm text-blue-100/70 leading-relaxed max-w-xs">
          Upload your medical reports and get AI-powered insights, health scores, medicine information and expert recommendations.
        </p>
      </div>

      {/* Trust badges */}
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-2.5 w-full max-w-xs">
        {[
          { icon: "shield", label: "100% Secure", sub: "Your data is encrypted" },
          { icon: "spark",  label: "AI Powered",  sub: "Advanced AI analysis" },
          { icon: "heart",  label: "Your Health",  sub: "Secure & Private" },
          { icon: "doctor", label: "Doctor Ready", sub: "Share with your doctor" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/20">
            <Icon n={b.icon} className="h-4 w-4 text-blue-200 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-white">{b.label}</p>
              <p className="text-[9px] text-blue-200/60">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LoginPage ───────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn" aria-label="Login page">
      {/* ── Left — branding ── */}
      <div className="relative hidden lg:flex lg:w-[44%] flex-col overflow-hidden">
        {/* Deep navy gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#06094F] via-[#0B1570] to-[#1A0A6B]" />
        {/* Jagged right edge */}
        <svg className="absolute right-0 top-0 h-full w-16 text-white" preserveAspectRatio="none" viewBox="0 0 64 800" fill="currentColor" aria-hidden="true">
          <path d="M64 0L0 0L12 80L0 160L16 240L0 320L20 400L0 480L14 560L0 640L18 720L0 800L64 800Z" />
        </svg>
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo top */}
          <div className="px-8 pt-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4m0 0v4m0-4h4m-4 0H8"/>
              </svg>
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-tight text-white leading-none">MediGuide <span className="text-[#93C5FD]">AI</span></span>
              <span className="block text-[10px] text-blue-200/60 tracking-wide">Your health, our priority</span>
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <MedicalIllustration />
          </div>
        </div>
      </div>

      {/* ── Right — login form ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-md animate-fadeUp">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-royal to-violet text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4m0 0v4m0-4h4m-4 0H8"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold text-navy">MediGuide <span className="text-royal">AI</span></span>
          </div>

          <h1 className="text-3xl font-extrabold text-navy leading-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500">Log in to your account to continue</p>

          {/* Tab switcher */}
          <div className="mt-6 flex rounded-xl bg-slate-100 p-1 w-full">
            <div className="flex-1 py-2 rounded-lg bg-gradient-to-r from-royal to-violet text-white text-sm font-bold text-center shadow-md">
              Log In
            </div>
            <Link to="/signup" className="flex-1 py-2 text-sm font-semibold text-slate-500 text-center hover:text-navy transition">
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="email" className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter your email..."
                  className="form-input pl-10"
                  aria-label="Email address"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="lock" className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter your password"
                  className="form-input pl-10 pr-10"
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <Icon n={showPw ? "eyeOff" : "eye"} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5" role="alert">
                <Icon n="alert" className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-1"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Logging in...
                </>
              ) : (
                <>Log in →</>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-royal hover:underline" id="goto-signup">
              Sign Up
            </Link>
          </p>

          {/* Security note */}
          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <Icon n="shield" className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="text-[11px] text-slate-500">Your data is 100% secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}