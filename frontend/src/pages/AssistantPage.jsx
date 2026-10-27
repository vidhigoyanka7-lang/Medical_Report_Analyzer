import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";
import Markdown from "../components/Markdown";

const SUGGESTED = [
  "Explain my blood report in simple language",
  "What does high cholesterol mean?",
  "Which values are abnormal?",
  "What should I ask my doctor?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! 👋 I'm your AI Medical Assistant.\n\nI can help explain your medical reports in simple language, tell you about abnormal values, and help you prepare questions for your doctor.\n\nWhat would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (txt) => {
    const q = (txt || input).trim();
    if (!q) return;
    
    setMessages(m => [...m, { role: "user", text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput("");
    setLoading(true);

    try {
      // Send the last few messages so follow-up questions ("why?") make sense.
      const history = messages.slice(-6).map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text.split("\n\n**Sources**")[0], // do not send the source list back
      }));
      const response = await api.post('/ai/ask', { question: q, history }, { timeout: 90000 });
      let ans = response.data.answer || "I'm sorry, I couldn't get an answer.";
      const sources = response.data.sources || [];
      if (sources.length > 0) {
        ans += "\n\n**Sources**\n" + sources.map((s) => `- [${s.number}] [${s.title}](${s.url}) - ${s.source}`).join("\n");
      }
      
      setMessages(m => [...m, { role: "ai", text: ans, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Sorry, I'm having trouble connecting to the medical AI service right now. Please try again later.";
      setMessages(m => [...m, { role: "ai", text: errorMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="AI Assistant">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto h-[calc(100vh-140px)] min-h-[600px] animate-fadeIn">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between bg-gradient-to-r from-[#1446D0] via-[#1E3A8A] to-[#4C1D95] p-5 sm:p-6 rounded-3xl text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur shadow-inner">
              <Icon n="spark" className="h-6 w-6 text-white" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold">AI Medical Assistant</h1>
              <p className="text-sm text-blue-200/80 mt-0.5">Understand your reports in simple language</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold">Online</span>
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              <div className="flex flex-col gap-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    
                    <span className={`shrink-0 grid h-8 w-8 place-items-center rounded-full shadow-sm mt-1
                      ${m.role === "ai" ? "bg-gradient-to-br from-royal to-violet text-white" : "bg-slate-800 text-white font-bold text-xs"}`}>
                      {m.role === "ai" ? <Icon n="spark" className="h-4 w-4" /> : "U"}
                    </span>
                    
                    <div className="flex flex-col gap-1">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === "ai" ? "" : "whitespace-pre-line"} shadow-sm
                        ${m.role === "ai" 
                          ? "bg-white border border-slate-100 text-slate-700 rounded-tl-sm" 
                          : "bg-gradient-to-br from-royal to-violet text-white rounded-tr-sm"}`}>
                        {m.role === "ai" ? <Markdown text={m.text} /> : m.text}
                      </div>
                      <span className={`text-[10px] font-bold text-slate-400 ${m.role === "user" ? "text-right" : ""}`}>
                        {m.time}
                      </span>
                    </div>

                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <span className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-royal to-violet text-white shadow-sm mt-1">
                      <Icon n="spark" className="h-4 w-4" />
                    </span>
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={e => { e.preventDefault(); send(); }} className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-royal focus-within:ring-2 focus-within:ring-royal/20 transition-all">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about your report..."
                  className="flex-1 bg-transparent border-none outline-none resize-none p-2 text-sm text-navy font-medium max-h-32 min-h-[44px]"
                  rows="1"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-royal to-violet text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition"
                >
                  <Icon n="send" className="h-5 w-5 ml-1" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                MediGuide AI provides informational insights and does not replace professional medical advice.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex w-72 flex-col gap-4 overflow-y-auto">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Icon n="spark" className="h-4 w-4 text-amber-500" />
                Suggested Questions
              </h3>
              <div className="flex flex-col gap-2">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className="text-left p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 hover:border-royal/40 hover:bg-blue-50/50 hover:text-royal transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
