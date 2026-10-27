import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "./ui";

/* ─── Sidebar navigation — exactly 8 items matching requirements ── */
const NAV = [
  { to: "/dashboard",      label: "Dashboard",        icon: "home"    },
  { to: "/upload-report",  label: "Upload Report",    icon: "upload"  },
  { to: "/reports",        label: "My Reports",       icon: "file"    },
  { to: "/compare",        label: "Compare Reports",  icon: "compare" },
  { to: "/assistant",      label: "AI Assistant",     icon: "chat"    },
  { to: "/doctor-summary", label: "Doctor Summary",   icon: "doctor"  },
  { to: "/profile",        label: "Health Profile",   icon: "user"    },
];

/* ─── Logo ────────────────────────────────────────────────────── */
function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 px-1 mb-8 group" aria-label="MediGuide AI Home">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] shadow-lg shadow-violet/40 transition duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4m0 0v4m0-4h4m-4 0H8" />
        </svg>
      </span>
      <div>
        <span className="block text-[17px] font-extrabold tracking-tight leading-none text-white">
          MediGuide <span className="text-[#93C5FD]">AI</span>
        </span>
        <span className="block text-[10px] text-blue-200/60 mt-0.5 tracking-wide">Your health, our priority</span>
      </div>
    </Link>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col
          bg-[#080F3C] px-4 py-6 text-white
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 shadow-2xl
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-600/20 blur-2xl" />
        <div className="pointer-events-none absolute bottom-24 -left-8 h-28 w-28 rounded-full bg-violet-600/15 blur-xl" />

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden rounded-lg p-1.5 text-blue-200 hover:bg-white/10 transition"
          aria-label="Close sidebar"
        >
          <Icon n="x" className="h-5 w-5" />
        </button>

        <Logo />

        {/* Navigation */}
        <nav className="relative z-10 flex flex-col gap-1 flex-1 overflow-y-auto" aria-label="Main navigation">
          {NAV.map((item, k) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium w-full
                 transition-all duration-200 animate-slideRight
                 ${isActive
                   ? "bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-violet/30"
                   : "text-blue-200/60 hover:bg-white/10 hover:text-white"
                 }`
              }
              style={{ animationDelay: `${k * 35}ms` }}
              aria-label={item.label}
            >
              <Icon n={item.icon} className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Assistant Help Card */}
        <div className="relative z-10 mt-4 rounded-2xl bg-gradient-to-br from-[#1E3A8A]/60 to-[#4C1D95]/40 p-4 ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="grid h-7 w-7 animate-float place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md">
              <Icon n="chat" className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold">Need Help?</span>
          </div>
          <p className="text-[11px] text-blue-200/70 mb-3 leading-snug">Chat with our AI Health Assistant</p>
          <Link
            to="/assistant"
            onClick={onClose}
            className="block rounded-xl bg-white py-2 text-center text-xs font-bold text-navy hover:bg-blue-50 transition duration-200"
          >
            Start Chat 💬
          </Link>
        </div>
      </aside>
    </>
  );
}

/* ─── Top Navbar ──────────────────────────────────────────────── */
function TopNavbar({ onMenu }) {
  const [showProfile, setShowProfile] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: "Guest", email: "" };
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "G";

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 py-3 sm:px-6" role="banner">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenu}
        className="rounded-xl p-2 text-navy hover:bg-slate-100 lg:hidden transition"
        aria-label="Open navigation"
        id="sidebar-toggle"
      >
        <Icon n="menu" className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-lg">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-royal focus-within:bg-white focus-within:ring-2 focus-within:ring-royal/10 transition">
          <Icon n="search" className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search reports, parameters, symptoms..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search"
            onKeyDown={(e) => {
              // Enter searches the report list by name
              if (e.key === "Enter" && e.target.value.trim()) navigate(`/reports?search=${encodeURIComponent(e.target.value.trim())}`);
            }}
          />
        </label>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Icon n="bell" className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden="true" />
        </button>

        {/* Theme toggle placeholder */}
        <button
          className="hidden sm:flex rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition"
          aria-label="Toggle theme"
        >
          <Icon n="moon" className="h-5 w-5" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-slate-100 transition"
            aria-label="User menu"
            aria-expanded={showProfile}
            id="profile-btn"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-royal to-violet text-xs font-bold text-white shadow-md">
              {initial}
            </span>
            <div className="hidden text-left sm:block leading-tight">
              <span className="block text-xs font-bold text-navy">{user.name}</span>
              <span className="block text-[10px] font-semibold text-amber-600">⭐ Premium</span>
            </div>
            <Icon n="chevron" className={`h-3.5 w-3.5 text-slate-400 transition duration-200 ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl animate-slideDown z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-navy">{user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy transition"
              >
                <Icon n="user" className="h-4 w-4 text-slate-400" />
                Health Profile
              </Link>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { setShowProfile(false); localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <Icon n="x" className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200/70">
      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-8">
        <p className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-center text-[11px] text-amber-700 leading-relaxed">
          ⚠️ MediGuide AI provides informational insights and does <strong>not replace</strong> professional medical advice. Always consult a qualified healthcare professional.
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">© 2025 MediGuide AI · Your health, our priority</p>
      </div>
    </footer>
  );
}

/* ─── DashboardLayout — main export ───────────────────────────── */
export default function DashboardLayout({ children, pageTitle }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F0F4FF] animate-fadeIn">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 lg:pl-[230px]">
        <TopNavbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6" role="main" aria-label={pageTitle || "Page content"}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}