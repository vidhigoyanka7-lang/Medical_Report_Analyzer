import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";
import api from "../services/api";

const MEDICAL_CONDITIONS = [
  { id: "Diabetes",         label: "Diabetes",         icon: "activity" },
  { id: "Heart Disease",    label: "Heart Disease",    icon: "heart"    },
  { id: "Stroke",           label: "Stroke",           icon: "brain"    },
  { id: "Liver Disease",    label: "Liver Disease",    icon: "alert"    },
  { id: "Certain Cancer",   label: "Certain Cancer",   icon: "alert"    },
  { id: "High Cholesterol", label: "High Cholesterol", icon: "trend"    },
  { id: "Hypertension",     label: "Hypertension",     icon: "activity" },
];

const FAMILY_MEMBERS = ["Mother", "Father", "Siblings", "Grandparents"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem('user') || '{"name": "Guest"}');

  // 1. Personal Information
  const [personal, setPersonal] = useState({
    fullName: storedUser.name || "Guest",
    age: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    bloodGroup: "",
    contact: ""
  });

  // 2. Medical History
  const [myHistory, setMyHistory] = useState([]);

  // 3. Family Health History
  const [family, setFamily] = useState({
    Mother: { hasHistory: "No", conditions: [] },
    Father: { hasHistory: "No", conditions: [] },
    Siblings: { hasHistory: "No", conditions: [] },
    Grandparents: { hasHistory: "No", conditions: [] },
  });

  // Age is worked out from the date of birth (only the date of birth is stored).
  const ageFromDob = (dob) => {
    if (!dob) return "";
    const born = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - born.getFullYear();
    if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
    return age >= 0 ? String(age) : "";
  };

  // Load the saved profile from the backend.
  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      const d = res.data.data;
      setPersonal((p) => ({
        ...p,
        dob: d.personal.dob ? String(d.personal.dob).slice(0, 10) : "",
        age: ageFromDob(d.personal.dob),
        gender: d.personal.gender || "",
        height: String(d.personal.height ?? ""),
        weight: String(d.personal.weight ?? ""),
        bloodGroup: d.personal.bloodGroup || "",
        contact: d.personal.contact || "",
      }));
      setMyHistory(d.conditions);
      const fam = {};
      FAMILY_MEMBERS.forEach((m) => {
        const list = d.family[m] || [];
        fam[m] = { hasHistory: list.length > 0 ? "Yes" : "No", conditions: list };
      });
      setFamily(fam);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };
  useEffect(() => { loadProfile(); }, []);

  const setP = (k, v) => setPersonal(p => ({ ...p, [k]: v, ...(k === "dob" ? { age: ageFromDob(v) } : {}) }));

  const toggleMyHistory = (condId) => {
    setMyHistory(prev => 
      prev.includes(condId) ? prev.filter(c => c !== condId) : [...prev, condId]
    );
  };

  const setFamStatus = (member, status) => {
    setFamily(prev => ({
      ...prev,
      [member]: { ...prev[member], hasHistory: status, conditions: status === "No" ? [] : prev[member].conditions }
    }));
  };

  const toggleFamCondition = (member, condId) => {
    setFamily(prev => {
      const arr = prev[member].conditions;
      const newArr = arr.includes(condId) ? arr.filter(c => c !== condId) : [...arr, condId];
      return { ...prev, [member]: { ...prev[member], conditions: newArr } };
    });
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      const familyPayload = {};
      FAMILY_MEMBERS.forEach((m) => { familyPayload[m] = family[m].conditions; });
      const saveRes = await api.put('/profile', {
        personal: { fullName: personal.fullName, dob: personal.dob, gender: personal.gender, height: personal.height, weight: personal.weight, bloodGroup: personal.bloodGroup, contact: personal.contact },
        conditions: myHistory,
        family: familyPayload,
      });
      // Keep the name in the top bar in sync with what was just saved.
      localStorage.setItem("user", JSON.stringify({ ...storedUser, name: saveRes.data.fullName }));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Unable to save your profile. Please try again.");
    }
  };

  // Profile completion = share of the five health fields that are filled in.
  // (Name and contact are not counted, and doing nothing no longer gives free points.)
  const completionPercentage = useMemo(() => {
    const healthFields = [personal.dob, personal.gender, personal.height, personal.weight, personal.bloodGroup];
    const filled = healthFields.filter((v) => String(v).trim() !== "").length;
    return Math.round((filled / healthFields.length) * 100);
  }, [personal]);

  return (
    <DashboardLayout pageTitle="Health Details">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-fadeIn pb-12">
        
        {/* Header & Completion */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Health Details</h1>
            <p className="text-sm text-slate-500 mt-1">Keep your health information updated for better AI analysis.</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4 min-w-[240px]">
            <div className="relative h-12 w-12 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#2563EB" strokeWidth="4" 
                  strokeDasharray={`${completionPercentage}, 100`} strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-navy">{completionPercentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Profile Completion</p>
              <p className="text-sm font-extrabold text-navy">
                {completionPercentage === 100 ? "Fully Complete!" : completionPercentage === 0 ? "Not started yet" : "Almost there"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          
          <div className="flex flex-col gap-6">
            {/* 1. PERSONAL INFORMATION */}
            <div className="card p-6 sm:p-8 border-t-4 border-royal">
              <h2 className="text-lg font-extrabold text-navy mb-6 flex items-center gap-2">
                <Icon n="user" className="h-5 w-5 text-royal" />
                Personal Information
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input type="text" value={personal.fullName} onChange={e => setP("fullName", e.target.value)} className="form-input bg-slate-50 focus:bg-white" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Age</label>
                  <input type="number" value={personal.age} readOnly title="Worked out from your date of birth" className="form-input bg-slate-100 text-slate-500 cursor-not-allowed" placeholder="From date of birth" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gender</label>
                  <select value={personal.gender} onChange={e => setP("gender", e.target.value)} className="form-input bg-slate-50 focus:bg-white">
                    <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date of Birth</label>
                  <input type="date" value={personal.dob} onChange={e => setP("dob", e.target.value)} className="form-input bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Height (cm)</label>
                  <input type="number" value={personal.height} onChange={e => setP("height", e.target.value)} className="form-input bg-slate-50 focus:bg-white" placeholder="e.g. 175" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Weight (kg)</label>
                  <input type="number" value={personal.weight} onChange={e => setP("weight", e.target.value)} className="form-input bg-slate-50 focus:bg-white" placeholder="e.g. 70" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Blood Group</label>
                  <select value={personal.bloodGroup} onChange={e => setP("bloodGroup", e.target.value)} className="form-input bg-slate-50 focus:bg-white">
                    <option value="">Select Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Number</label>
                  <input type="tel" value={personal.contact} onChange={e => setP("contact", e.target.value)} className="form-input bg-slate-50 focus:bg-white" placeholder="+1 234 567 890" />
                </div>
              </div>
            </div>

            {/* 2. MEDICAL HISTORY */}
            <div className="card p-6 sm:p-8 border-t-4 border-violet">
              <h2 className="text-lg font-extrabold text-navy mb-2 flex items-center gap-2">
                <Icon n="activity" className="h-5 w-5 text-violet" />
                Medical History
              </h2>
              <p className="text-xs text-slate-500 mb-6">Select any pre-existing medical conditions you have.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {MEDICAL_CONDITIONS.map((cond) => {
                  const selected = myHistory.includes(cond.id);
                  return (
                    <div 
                      key={cond.id}
                      onClick={() => toggleMyHistory(cond.id)}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col gap-3 group
                        ${selected 
                          ? "bg-violet/10 border-violet shadow-md scale-[1.02]" 
                          : "bg-white border-slate-100 hover:border-violet/30 hover:bg-slate-50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`grid h-8 w-8 place-items-center rounded-xl transition-colors
                          ${selected ? "bg-violet text-white" : "bg-slate-100 text-slate-400 group-hover:text-violet group-hover:bg-violet/10"}`}>
                          <Icon n={cond.icon} className="h-4 w-4" />
                        </span>
                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors
                          ${selected ? "bg-violet border-violet text-white" : "border-slate-300"}`}>
                          {selected && <Icon n="check" className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${selected ? "text-violet" : "text-slate-600"}`}>
                        {cond.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. FAMILY HEALTH HISTORY */}
            <div className="card p-6 sm:p-8 border-t-4 border-emerald-500">
              <h2 className="text-lg font-extrabold text-navy mb-2 flex items-center gap-2">
                <Icon n="heart" className="h-5 w-5 text-emerald-500" />
                Family Health History
              </h2>
              <p className="text-xs text-slate-500 mb-6">Select family members with known health conditions.</p>

              <div className="flex flex-col gap-6">
                {FAMILY_MEMBERS.map(member => {
                  const famData = family[member];
                  const hasHistory = famData.hasHistory;

                  return (
                    <div key={member} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 transition-all hover:bg-slate-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <p className="font-extrabold text-navy flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Icon n="user" className="h-4 w-4" />
                          </span>
                          {member}
                        </p>
                        
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setFamStatus(member, "Yes")}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${hasHistory === "Yes" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                          >Yes</button>
                          <button
                            type="button"
                            onClick={() => setFamStatus(member, "No")}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${hasHistory === "No" ? "bg-slate-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                          >No</button>
                        </div>
                      </div>

                      {hasHistory === "Yes" && (
                        <div className="pt-4 border-t border-slate-200/60 animate-fadeDown">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Select Conditions</p>
                          <div className="flex flex-wrap gap-2">
                            {MEDICAL_CONDITIONS.map((cond) => {
                              const checked = famData.conditions.includes(cond.id);
                              return (
                                <button
                                  key={cond.id}
                                  type="button"
                                  onClick={() => toggleFamCondition(member, cond.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 flex items-center gap-1.5
                                    ${checked ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                >
                                  <div className={`h-3 w-3 rounded-sm flex items-center justify-center border ${checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                                    {checked && <Icon n="check" className="h-2.5 w-2.5" />}
                                  </div>
                                  {cond.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save result: shown at the bottom, next to the buttons */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm">{saveError}</div>
            )}
            {saved && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl animate-scaleIn font-bold text-sm shadow-sm">
                <Icon n="check" className="h-5 w-5 bg-emerald-100 rounded-full p-0.5" />
                Health profile successfully saved!
              </div>
            )}

            {/* 6. BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <button onClick={handleSave} className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-royal/30">
                <Icon n="check" className="h-5 w-5" /> Save Changes
              </button>
              <button onClick={loadProfile} className="btn-ghost w-full sm:w-auto px-6 py-3.5">
                Cancel
              </button>
              <button onClick={() => navigate("/dashboard")} className="btn-secondary w-full sm:w-auto px-6 py-3.5 sm:ml-auto">
                Continue to Dashboard <Icon n="arrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 4. PROFILE SUMMARY SIDEBAR */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 card p-6 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-3">
                Profile Summary
              </h3>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-royal to-violet text-white font-extrabold text-xl shadow-md">
                  {personal.fullName ? personal.fullName[0].toUpperCase() : "?"}
                </span>
                <div>
                  <p className="font-extrabold text-navy text-lg truncate max-w-[150px]">{personal.fullName || "—"}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {personal.age ? `${personal.age} yrs` : "—"} · {personal.gender || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 mb-6 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p>
                  <p className="font-bold text-navy">{personal.bloodGroup || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                  <p className="font-bold text-navy">{personal.height ? `${personal.height} cm` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                  <p className="font-bold text-navy">{personal.weight ? `${personal.weight} kg` : "—"}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 mb-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Your Conditions</p>
                {myHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {myHistory.map(c => (
                      <span key={c} className="bg-violet/10 text-violet text-[10px] font-bold px-2 py-1 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : <p className="text-xs font-medium text-slate-500">None selected</p>}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Family History</p>
                <div className="flex flex-col gap-2">
                  {FAMILY_MEMBERS.map(member => {
                    const conds = family[member].conditions;
                    if (conds.length === 0) return null;
                    return (
                      <div key={member}>
                        <p className="text-xs font-bold text-navy">{member}</p>
                        <p className="text-[10px] font-medium text-slate-500">{conds.join(", ")}</p>
                      </div>
                    )
                  })}
                  {FAMILY_MEMBERS.every(m => family[m].conditions.length === 0) && (
                    <p className="text-xs font-medium text-slate-500">No conditions logged</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
