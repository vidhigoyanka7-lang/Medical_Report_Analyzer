import React from "react";

/* ── Torn Paper Edge Divider ─────────────────────────────────────────── */
export function TornPaperDivider() {
  return (
    <div className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none z-20 hidden lg:block overflow-hidden">
      <svg
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        className="w-full h-full text-white fill-current drop-shadow-[-4px_0_6px_rgba(0,0,0,0.25)]"
      >
        <path d="M40 0 L15 30 L30 70 L8 120 L28 170 L10 230 L32 290 L12 350 L35 410 L15 470 L30 530 L8 590 L28 650 L10 710 L32 770 L12 830 L35 890 L15 950 L40 1000 Z" />
      </svg>
    </div>
  );
}

/* ── 3D Doctor Character ──────────────────────────────────────────────── */
export function DoctorCharacter3D() {
  return (
    <div className="w-48 h-72 md:w-56 md:h-80 relative flex items-center justify-center drop-shadow-2xl animate-float">
      <svg viewBox="0 0 240 340" className="w-full h-full" fill="none">
        <defs>
          {/* Gradients */}
          <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD3B5" />
            <stop offset="100%" stopColor="#F5B28B" />
          </linearGradient>
          <linearGradient id="hair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A3825" />
            <stop offset="100%" stopColor="#361F13" />
          </linearGradient>
          <linearGradient id="coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="pants" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="shirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="tie" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="shoe" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#5C2E0B" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="120" cy="325" rx="75" ry="10" fill="#000000" opacity="0.18" />

        {/* Left Shoe */}
        <path d="M72 300 Q65 310 60 318 Q58 322 75 324 Q95 324 92 312 Q90 302 72 300 Z" fill="url(#shoe)" filter="url(#shadow)" />
        {/* Right Shoe */}
        <path d="M148 300 Q145 312 145 324 Q165 324 178 318 Q182 310 168 300 Z" fill="url(#shoe)" filter="url(#shadow)" />

        {/* Pants */}
        <path d="M80 200 L72 305 L92 305 L116 215 L124 215 L148 305 L168 305 L160 200 Z" fill="url(#pants)" />

        {/* Inner Shirt & Tie */}
        <path d="M102 115 L138 115 L132 205 L108 205 Z" fill="url(#shirt)" />
        <polygon points="120,125 127,132 123,190 117,190 113,132" fill="url(#tie)" />

        {/* White Doctor Coat */}
        <path d="M80 115 C70 140 65 190 68 250 C78 252 105 248 108 210 L106 130 Z" fill="url(#coat)" filter="url(#shadow)" />
        <path d="M160 115 C170 140 175 190 172 250 C162 252 135 248 132 210 L134 130 Z" fill="url(#coat)" filter="url(#shadow)" />

        {/* Arms */}
        {/* Left Arm & Hand */}
        <path d="M78 118 Q55 155 68 195 Q78 190 82 175 Q75 145 86 122 Z" fill="url(#coat)" />
        <circle cx="68" cy="195" r="10" fill="url(#skin)" />

        {/* Right Arm & Hand */}
        <path d="M162 118 Q185 155 172 195 Q162 190 158 175 Q165 145 154 122 Z" fill="url(#coat)" />
        <circle cx="172" cy="195" r="10" fill="url(#skin)" />

        {/* Neck */}
        <rect x="110" y="98" width="20" height="20" rx="6" fill="url(#skin)" />

        {/* Head */}
        <ellipse cx="120" cy="72" rx="36" ry="40" fill="url(#skin)" filter="url(#shadow)" />

        {/* Ears */}
        <circle cx="84" cy="72" r="7" fill="url(#skin)" />
        <circle cx="156" cy="72" r="7" fill="url(#skin)" />

        {/* Hair */}
        <path d="M84 65 C84 35 110 30 120 30 C140 30 156 40 156 65 C150 50 138 42 120 42 C102 42 90 50 84 65 Z" fill="url(#hair)" />

        {/* Eyes */}
        <ellipse cx="106" cy="68" rx="4" ry="5" fill="#1E293B" />
        <ellipse cx="134" cy="68" rx="4" ry="5" fill="#1E293B" />
        <circle cx="107.5" cy="66.5" r="1.5" fill="#FFFFFF" />
        <circle cx="135.5" cy="66.5" r="1.5" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M100 58 Q107 55 112 59" stroke="#361F13" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M128 59 Q133 55 140 58" stroke="#361F13" strokeWidth="2.5" strokeLinecap="round" />

        {/* Nose & Smile */}
        <path d="M120 70 L118 76 L122 76" stroke="#E29578" strokeWidth="2" strokeLinecap="round" />
        <path d="M110 84 Q120 94 130 84" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Stethoscope */}
        <path d="M96 112 C96 155 144 155 144 112" stroke="#334155" strokeWidth="4" fill="none" />
        <path d="M120 148 L120 162" stroke="#334155" strokeWidth="4" />
        <circle cx="120" cy="166" r="8" fill="#94A3B8" stroke="#334155" strokeWidth="2" />
        <circle cx="120" cy="166" r="4" fill="#38BDF8" />
      </svg>
    </div>
  );
}

/* ── 3D Floating Medical Report Banner Illustration ───────────────────── */
export function MedicalReport3DCard() {
  return (
    <div className="relative w-64 h-56 flex items-center justify-center my-4 drop-shadow-xl">
      {/* Background glow ring */}
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />

      <svg viewBox="0 0 280 240" className="w-full h-full" fill="none">
        {/* Orbital Ring */}
        <ellipse cx="140" cy="130" rx="110" ry="40" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        <ellipse cx="140" cy="130" rx="125" ry="48" stroke="#A78BFA" strokeWidth="1.5" opacity="0.4" />

        {/* Floating Mini Pulse Card */}
        <g transform="translate(195, 60)" className="animate-float">
          <rect width="42" height="34" rx="10" fill="url(#violetGrad)" />
          <path d="M8 17 L15 17 L19 8 L24 24 L28 14 L31 17 L36 17" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Heartbeat Circle Badge */}
        <g transform="translate(35, 140)" className="animate-floatSlow">
          <circle cx="20" cy="20" r="18" fill="#3B82F6" />
          <path d="M8 20 L13 20 L16 13 L20 27 L23 18 L25 20 L30 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Main Document Card */}
        <g transform="translate(65, 30)">
          <defs>
            <linearGradient id="docBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EEF2FF" />
            </linearGradient>
            <linearGradient id="blueHeader" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>

          {/* Card Body */}
          <rect width="135" height="165" rx="16" fill="url(#docBg)" stroke="#C7D2FE" strokeWidth="2" />

          {/* Document Header Icon */}
          <rect x="16" y="16" width="28" height="28" rx="8" fill="url(#blueHeader)" />
          {/* Plus inside header */}
          <path d="M30 22 V38 M22 30 H38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          {/* Header Lines */}
          <rect x="52" y="20" width="60" height="7" rx="3.5" fill="#94A3B8" />
          <rect x="52" y="32" width="40" height="5" rx="2.5" fill="#CBD5E1" />

          {/* Divider */}
          <line x1="16" y1="56" x2="119" y2="56" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Content Lines */}
          <rect x="16" y="68" width="85" height="6" rx="3" fill="#64748B" />
          <rect x="16" y="80" width="103" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="16" y="90" width="75" height="5" rx="2.5" fill="#CBD5E1" />

          <rect x="16" y="106" width="95" height="6" rx="3" fill="#64748B" />
          <rect x="16" y="118" width="60" height="5" rx="2.5" fill="#CBD5E1" />

          <rect x="16" y="136" width="70" height="12" rx="6" fill="#DBEAFE" />
          <rect x="24" y="140" width="40" height="4" rx="2" fill="#2563EB" />
        </g>

        {/* Shield with Plus Badge floating bottom right */}
        <g transform="translate(160, 135)" className="animate-float">
          <path d="M22 2 C35 2 44 10 44 24 C44 38 22 48 22 48 C22 48 0 38 0 24 C0 10 9 2 22 2 Z" fill="url(#blueHeader)" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M22 14 V32 M13 23 H31" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* Sparkles */}
        <path d="M60 20 L62 26 L68 28 L62 30 L60 36 L58 30 L52 28 L58 26 Z" fill="#FBBF24" />
        <path d="M220 120 L221 124 L225 125 L221 126 L220 130 L219 126 L215 125 L219 124 Z" fill="#60A5FA" />
      </svg>
    </div>
  );
}

/* ── 3D Healthcare Clipboard Badge (Bottom Right of Auth pages) ─────────── */
export function HealthcareClipboard3D() {
  return (
    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-6 w-40 h-40 md:w-52 md:h-52 pointer-events-none z-10 drop-shadow-xl animate-floatSlow">
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
          <linearGradient id="clipHeader" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Main Clipboard */}
        <g transform="translate(60, 40) rotate(-6)">
          <rect width="105" height="135" rx="14" fill="url(#boardBg)" stroke="#93C5FD" strokeWidth="2.5" />
          {/* Top Clip */}
          <rect x="32" y="-10" width="41" height="18" rx="6" fill="#94A3B8" />
          <rect x="38" y="-6" width="29" height="10" rx="4" fill="#CBD5E1" />

          {/* Text Title */}
          <text x="16" y="24" fill="#1E40AF" fontSize="9" fontWeight="800" letterSpacing="0.8">
            HEALTHCARE
          </text>
          <line x1="16" y1="29" x2="89" y2="29" stroke="#DBEAFE" strokeWidth="1.5" />

          {/* Checklist Items */}
          {[38, 56, 74, 92].map((y, idx) => (
            <g key={idx} transform={`translate(16, ${y})`}>
              <rect width="12" height="12" rx="3" fill="#3B82F6" />
              <path d="M3 6 L5 9 L9 3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="18" y1="6" x2="68" y2="6" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* Stethoscope wrapping around left */}
        <path
          d="M 30 160 C 20 120 40 80 75 70"
          stroke="#64748B"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="28" cy="162" r="7" fill="#94A3B8" stroke="#475569" strokeWidth="2" />

        {/* 3D Heart (Right side) */}
        <g transform="translate(145, 95) scale(0.9)">
          <path
            d="M 20 6 C 12 -4 0 3 0 16 C 0 28 20 40 20 40 C 20 40 40 28 40 16 C 40 3 28 -4 20 6 Z"
            fill="url(#heartGrad)"
            filter="drop-shadow(0 4px 6px rgba(239, 68, 68, 0.4))"
          />
        </g>

        {/* Pill / Capsule (Bottom) */}
        <g transform="translate(125, 155) rotate(-25)">
          <rect width="28" height="14" rx="7" fill="#EF4444" />
          <path d="M14 0 H21 A7 7 0 0 1 28 7 A7 7 0 0 1 21 14 H14 Z" fill="#FFFFFF" />
        </g>

        {/* Shield Cross (Bottom Right) */}
        <g transform="translate(150, 135) scale(0.75)">
          <path d="M18 2 C28 2 34 8 34 18 C34 28 18 36 18 36 C18 36 2 28 2 18 C2 8 8 2 18 2 Z" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M18 10 V26 M10 18 H26" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
