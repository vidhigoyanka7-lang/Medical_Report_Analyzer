import { useState } from "react";
import { HeroSection } from "../components/HeroSection";
import { Link } from "react-router-dom";
import { Icon } from "../components/ui";

const FEATURES = [
  { icon: "spark",    title: "AI-Powered Analysis",    desc: "Get instant AI explanations of your medical reports in simple language." },
  { icon: "shield",   title: "Health Score",           desc: "Track your overall health score and improvement over time." },
  { icon: "activity", title: "Abnormal Detection",     desc: "Automatically detect and highlight abnormal values in your reports." },
  { icon: "pill",     title: "Medicine Information",   desc: "Get detailed information about medicines mentioned in your reports." },
  { icon: "doctor",   title: "Doctor Q&A",             desc: "Generate smart questions to ask your doctor based on your reports." },
  { icon: "compare",  title: "Report Comparison",      desc: "Compare reports over time to track your health progress." },
];

const DEMO_TABS = [
  { id: 'key-finding', label: 'Key finding', image: '/key-finding.png' },
  { id: 'terminology', label: 'Terminology', image: '/terminology.png' },
  { id: 'follow-up', label: 'Follow-up', image: '/follow-up.png' },
];

function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState(DEMO_TABS[0].id);

  return (
    <section className="mt-16 mb-16 sm:mt-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-navy sm:text-4xl">
          See How It Works
        </h2>
        <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
          Click on the tabs below to explore different features of our analysis report.
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-slate-100 pb-5 overflow-x-auto justify-center">
          {DEMO_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-navy to-royal text-white shadow-lg transform scale-105'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-navy hover:scale-105'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Images with transition */}
        <div className="mt-6 rounded-2xl bg-slate-50/50 p-2 sm:p-6 min-h-[300px] sm:min-h-[500px] flex items-center justify-center relative overflow-hidden">
           {DEMO_TABS.map((tab) => (
             <div 
               key={tab.id}
               className={`absolute inset-0 p-4 flex items-center justify-center transition-all duration-500 ease-in-out ${
                 activeTab === tab.id 
                   ? 'opacity-100 translate-x-0 z-10' 
                   : 'opacity-0 translate-x-12 pointer-events-none z-0'
               }`}
             >
                <img
                  src={tab.image}
                  alt={tab.label}
                  className="max-w-full max-h-[600px] object-contain rounded-xl shadow-md border border-slate-200/60"
                  onError={(e) => {
                     e.target.style.display = 'none';
                     if (e.target.nextSibling) {
                       e.target.nextSibling.style.display = 'flex';
                     }
                  }}
                />
                {/* Fallback if image doesn't exist */}
                <div className="hidden flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-300 rounded-xl w-full h-full max-w-2xl bg-white">
                   <Icon n="activity" className="w-12 h-12 mb-3 text-slate-300" />
                   <p className="mb-2">Image not found.</p>
                   <p className="text-sm">Please save your image as <b className="text-navy">{tab.image.replace('/', '')}</b> in the <code>frontend/public</code> folder.</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Simple top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-royal to-violet shadow text-white">
              <Icon n="activity" className="h-4 w-4" />
            </span>
            <span className="text-lg font-extrabold text-navy">
              MediGuide <span className="text-royal">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-navy">Login</Link>
            <Link to="/signup" className="btn-grad">Get Started →</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <HeroSection />

        {/* Interactive Image Demo */}
        <InteractiveDemo />

        {/* Features */}
        <section className="mt-12">
          <h2 className="mb-2 text-center text-3xl font-extrabold text-navy">
            Everything you need to understand your health
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-center text-sm text-slate-500">
            MediGuide AI combines advanced AI with medical knowledge to help you understand your health reports.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, k) => (
              <div
                key={f.title}
                className="card card-hover p-5 animate-fadeUp"
                style={{ animationDelay: `${k * 80}ms` }}
              >
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-royal">
                  <Icon n={f.icon} className="h-6 w-6" />
                </span>
                <h3 className="font-bold text-navy">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-gradient-to-r from-navy to-royal p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to understand your health?</h2>
          <p className="mt-2 text-blue-200">Join thousands of users who trust MediGuide AI.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/signup" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy hover:scale-[1.04] transition shadow-lg">
              Get Started Free
            </Link>
            <Link to="/dashboard" className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
              View Demo
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}