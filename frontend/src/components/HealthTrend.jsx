const VALS = [62, 70, 66, 78, 82, 88, 92];
const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const Y_TICKS = [25, 50, 75, 100];

export default function HealthTrend() {
  const W = 320, H = 150, PADL = 28, PADR = 12, PADT = 10, PADB = 24;
  const CW = W - PADL - PADR;
  const CH = H - PADT - PADB;

  const x = (i) => PADL + (i / (VALS.length - 1)) * CW;
  const y = (v) => PADT + CH - ((v - 20) / 80) * CH;

  const pts = VALS.map((v, i) => [x(i), y(v)]);

  // Smooth cubic bezier path
  const linePath = pts.reduce((a, [px, py], k) => {
    if (!k) return `M${px},${py}`;
    const [qx, qy] = pts[k - 1];
    const cx = (qx + px) / 2;
    return `${a} C${cx},${qy} ${cx},${py} ${px},${py}`;
  }, "");

  const areaPath = `${linePath} L${x(VALS.length - 1)},${H - PADB} L${x(0)},${H - PADB}Z`;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="section-title text-sm">Health Score Trend</h3>
        <span className="badge badge-blue">+30 pts</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Last 7 months • Sample data</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Health score trend from 62 to 92 over 7 months"
      >
        <defs>
          <linearGradient id="trend-line" x1="0" x2="1">
            <stop offset="0" stopColor="#2563EB" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7C3AED" stopOpacity=".18" />
            <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {Y_TICKS.map((t) => (
          <g key={t}>
            <line x1={PADL} x2={W - PADR} y1={y(t)} y2={y(t)} stroke="#E2E8F0" strokeDasharray="3 4" />
            <text x={PADL - 4} y={y(t) + 3} textAnchor="end" fontSize="8" fill="#94A3B8">{t}</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#trend-fill)" className="animate-fadeIn" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#trend-line)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          className="animate-draw"
        />

        {/* Data points */}
        {pts.map(([px, py], k) => (
          <g key={k}>
            <circle cx={px} cy={py} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2" className="animate-fadeIn" style={{ animationDelay: `${0.4 + k * 0.15}s` }} />
            {/* Value label on last point */}
            {k === pts.length - 1 && (
              <text x={px} y={py - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#07145C">92</text>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {LABELS.map((m, k) => (
          <text key={m} x={x(k)} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748B">{m}</text>
        ))}
      </svg>
    </div>
  );
}