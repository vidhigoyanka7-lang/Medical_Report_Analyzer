import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/ui";
import api from "../services/api";

/* ─── Left panel illustration ─────────────────────────────────── */
function SignupIllustration() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 select-none">
      <div className="absolute top-10 right-10 h-20 w-20 rounded-full bg-violet-500/20 blur-2xl animate-float" />
      <div className="absolute bottom-16 left-8 h-14 w-14 rounded-full bg-blue-500/15 blur-xl animate-floatSlow" />

      {/* Health card illustration */}
      <div className="relative mb-8 animate-float">
        <div className="rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30 p-5 shadow-2xl w-56">
          <p className="text-[10px] text-blue-200/70 font-semibold uppercase tracking-wide mb-3">Your Health Profile</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            <div>
              <div className="h-2 w-20 bg-white/50 rounded-full" />
              <div className="h-1.5 w-14 bg-white/30 rounded-full mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[["Health Score", "92/100"], ["Reports", "12"], ["AI Confidence", "98%"], ["Abnormal", "3"]].map(([k,v]) => (
              <div key={k} className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-[9px] text-white/60">{k}</p>
                <p className="text-sm font-extrabold text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -top-5 -right-5 rounded-2xl bg-white/20 backdrop-blur px-3 py-2 ring-1 ring-white/30 animate-float" style={{ animationDelay: "0.8s" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-base">✅</span>
            <span className="text-[10px] font-bold text-white">Profile Created!</span>
          </div>
        </div>
      </div>

      <div className="relative text-center z-10 mt-4">
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

/* ─── SignupPage ──────────────────────────────────────────────── */
export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]     = useState(false);
  const [showCPw, setShowCPw]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn" aria-label="Sign up page">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-[44%] flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06094F] via-[#0B1570] to-[#1A0A6B]" />
        <svg className="absolute right-0 top-0 h-full w-16 text-white" preserveAspectRatio="none" viewBox="0 0 64 800" fill="currentColor" aria-hidden="true">
          <path d="M64 0L0 0L12 80L0 160L16 240L0 320L20 400L0 480L14 560L0 640L18 720L0 800L64 800Z" />
        </svg>
        <div className="relative z-10 flex flex-col h-full">
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
            <SignupIllustration />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 lg:px-16 overflow-y-auto">
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

          <h1 className="text-3xl font-extrabold text-navy">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500">Sign up to get started with MediGuide AI</p>

          {/* Tab switcher */}
          <div className="mt-6 flex rounded-xl bg-slate-100 p-1 w-full">
            <Link to="/login" className="flex-1 py-2 text-sm font-semibold text-slate-500 text-center hover:text-navy transition">
              Log In
            </Link>
            <div className="flex-1 py-2 rounded-lg bg-gradient-to-r from-royal to-violet text-white text-sm font-bold text-center shadow-md">
              Sign Up
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="user" className="h-4 w-4" />
                </span>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter your full name"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="email" className="h-4 w-4" />
                </span>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter your email"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="lock" className="h-4 w-4" />
                </span>
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Create a password"
                  className="form-input pl-10 pr-10"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon n="lock" className="h-4 w-4" />
                </span>
                <input
                  id="signup-confirm"
                  type={showCPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Re-enter your password"
                  className="form-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showCPw ? "Hide confirm password" : "Show confirm password"}
                >
                  <Icon n={showCPw ? "eyeOff" : "eye"} className="h-4 w-4" />
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

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-1"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>Sign Up →</>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-royal hover:underline" id="goto-login">
              Login
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <Icon n="shield" className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="text-[11px] text-slate-500">Your data is 100% secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}