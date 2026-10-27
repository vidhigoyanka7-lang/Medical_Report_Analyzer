import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./ui";

/* ── Demo conversation data ─────────────────────────── */
const SUGGESTED = [
  "What does high cholesterol mean?",
  "Explain my blood report",
  "What should I ask my doctor?",
];

const DEMO_RESPONSES = {
  "What does high cholesterol mean?":
    "High cholesterol means that you have higher levels of cholesterol in your blood than normal. It can increase the risk of heart disease and other health problems. You should follow a healthy diet, exercise regularly, and consult your doctor.",
  "Explain my blood report":
    "Your blood report shows some important markers. Hemoglobin is slightly low (10.2 g/dL) indicating mild anemia. Cholesterol is elevated at 240 mg/dL. Vitamin D is low at 18 ng/mL. Calcium is within normal range. I recommend discussing these with your doctor.",
  "What should I ask my doctor?":
    "Based on your report, ask your doctor about: 1) Treatment for low hemoglobin, 2) Cholesterol management plan, 3) Vitamin D supplementation dose, 4) Follow-up timeline for abnormal values, and 5) Any lifestyle modifications recommended.",
};

const DEFAULT_RESPONSE =
  "Based on your uploaded report, I can see some areas that need attention. Please consult your healthcare provider for a proper diagnosis and treatment plan. Remember, I provide educational information only.";

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistantCard() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi Arjun! I'm your AI Health Assistant. Ask me anything about your report or health.",
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text) => {
    const q = text || input;
    if (!q.trim()) return;
    const now = new Date();
    const userMsg = { role: "user", text: q, time: formatTime(now) };
    const aiReply = {
      role: "ai",
      text: DEMO_RESPONSES[q] || DEFAULT_RESPONSE,
      time: formatTime(new Date(now.getTime() + 60000)),
    };
    setMessages((m) => [...m, userMsg, aiReply]);
    setInput("");
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      {/* Left — chat panel */}
      <div className="card flex flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-royal to-violet text-white">
              <Icon n="spark" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy">AI Health Assistant</p>
              <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <Link to="/assistant" className="text-xs font-semibold text-royal hover:underline">
            View All Chats →
          </Link>
        </div>

        {/* Suggested questions */}
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-royal/20 bg-sky px-3 py-1.5 text-[11px] font-semibold text-royal hover:bg-royal hover:text-white transition duration-200"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 flex-1 max-h-48 overflow-y-auto pr-1 mb-3">
          {messages.map((m, k) => (
            <div key={k} className={`flex items-end gap-2 animate-fadeUp ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "ai" && (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal to-violet text-white mb-0.5">
                  <Icon n="spark" className="h-3.5 w-3.5" />
                </span>
              )}
              <div className={`max-w-[80%] ${m.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"}`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.role === "ai" ? "text-slate-400" : "text-blue-200"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-canvas p-1.5 focus-within:border-royal focus-within:ring-2 focus-within:ring-royal/10 transition"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your report..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            id="ai-chat-input"
          />
          <button
            type="submit"
            id="ai-chat-send"
            className="btn-grad shrink-0 px-3 py-2"
            aria-label="Send message"
          >
            <Icon n="send" className="h-4 w-4" />
            <span className="hidden min-[480px]:inline">Send</span>
          </button>
        </form>
      </div>

      {/* Right — Medicine Info panel */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title text-sm">Medicine Information</h3>
          <Link to="/medicines" className="text-xs font-semibold text-royal hover:underline">
            View Full Details →
          </Link>
        </div>

        {/* Medicine card */}
        <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-500">
                <Icon n="pill" className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-navy text-sm">Atorvastatin 10mg</p>
                <span className="badge badge-blue text-[10px]">Prescription</span>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {[
              { icon: "check",    label: "Uses",         text: "Lowers high cholesterol and reduces risk of heart disease" },
              { icon: "clock",    label: "Dosage",       text: "Once daily, or as directed by doctor" },
              { icon: "alert",    label: "Side Effects", text: "Nausea, headache, stomach pain" },
              { icon: "activity", label: "Interactions", text: "May interact with other medicines" },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white text-royal shadow-sm mt-0.5">
                  <Icon n={item.icon} className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-navy">{item.label}</p>
                  <p className="text-xs text-slate-600 leading-snug">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-[10px] text-amber-700 leading-relaxed">
          ⚠️ This is educational information and not a substitute for medical advice.
        </p>
      </div>
    </section>
  );
}