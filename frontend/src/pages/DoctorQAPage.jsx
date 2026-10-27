import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";

const QUESTIONS = [
  {
    category: "Cholesterol",
    color:    "bg-orange-100 text-orange-600",
    questions: [
      "What is my LDL target, and am I close to it?",
      "Should I start statins or can I manage with diet alone?",
      "How often should I retest my cholesterol?",
    ],
  },
  {
    category: "Anemia / Hemoglobin",
    color:    "bg-red-100 text-red-600",
    questions: [
      "What's causing my low hemoglobin level?",
      "Do I need iron supplements or dietary changes?",
      "When should I expect my hemoglobin to improve?",
    ],
  },
  {
    category: "Vitamin D",
    color:    "bg-yellow-100 text-yellow-700",
    questions: [
      "What dose of Vitamin D3 should I take daily?",
      "Is my low Vitamin D linked to my fatigue?",
      "How soon will Vitamin D levels normalize with supplements?",
    ],
  },
  {
    category: "General",
    color:    "bg-blue-100 text-royal",
    questions: [
      "Are any of my values dangerous and need immediate attention?",
      "What lifestyle changes are most important for me right now?",
      "Should I see any specialists based on my report?",
    ],
  },
];

export default function DoctorQAPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Doctor Q&A</h1>
          <p className="text-sm text-slate-500 mt-1">AI-generated questions to ask your doctor based on your reports</p>
        </div>

        {/* Info banner */}
        <div className="rounded-2xl bg-gradient-to-r from-royal/10 to-violet/10 border border-royal/20 p-5 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-royal/10 text-royal mt-0.5">
            <Icon n="spark" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-navy">How to use these questions</p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              These questions are automatically generated based on your latest blood test report. Take this list to your next doctor's appointment for a more productive consultation.
            </p>
          </div>
        </div>

        {/* Question categories */}
        <div className="grid gap-5 md:grid-cols-2">
          {QUESTIONS.map((cat, k) => (
            <div key={cat.category} className="card p-5 animate-fadeUp" style={{ animationDelay: `${k * 80}ms` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${cat.color}`}>
                  <Icon n="question" className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-navy">{cat.category}</h3>
                <span className="ml-auto badge badge-blue">{cat.questions.length} questions</span>
              </div>
              <ol className="flex flex-col gap-3">
                {cat.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-snug">{q}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Print/copy section */}
        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-navy">Ready for your appointment?</p>
            <p className="text-sm text-slate-500 mt-0.5">Save or print these questions to take with you</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary">
              <Icon n="download" className="h-4 w-4" />
              Export PDF
            </button>
            <button className="btn-grad">
              <Icon n="spark" className="h-4 w-4" />
              Generate More
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 text-center">
          ⚠️ These questions are AI-generated based on your report data. They are for educational purposes and to facilitate better communication with your healthcare provider.
        </p>
      </div>
    </DashboardLayout>
  );
}
