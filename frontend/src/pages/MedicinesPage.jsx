import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Icon } from "../components/ui";

const MEDICINES = [
  {
    id: "m1",
    name: "Atorvastatin",
    dose: "10mg",
    type: "Prescription",
    category: "Cholesterol",
    color: "text-red-500",
    bg: "bg-red-50",
    uses: "Lowers high cholesterol and reduces risk of heart disease and stroke.",
    dosage: "Once daily in the evening, or as directed by your doctor.",
    sideEffects: "Muscle pain, nausea, headache, stomach pain, liver enzyme changes.",
    interactions: "Avoid grapefruit juice. May interact with warfarin, antibiotics, and antifungal medicines.",
  },
  {
    id: "m2",
    name: "Ferrous Sulfate",
    dose: "200mg",
    type: "OTC",
    category: "Iron Supplement",
    color: "text-amber-600",
    bg: "bg-amber-50",
    uses: "Treats and prevents iron deficiency anemia. Increases hemoglobin levels.",
    dosage: "2-3 times daily with food to reduce stomach upset.",
    sideEffects: "Constipation, dark stools, nausea, stomach cramps.",
    interactions: "Avoid taking with dairy, antacids, or tetracycline antibiotics.",
  },
  {
    id: "m3",
    name: "Vitamin D3",
    dose: "2000 IU",
    type: "Supplement",
    category: "Vitamins",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    uses: "Maintains healthy bone density, supports immune function, and improves mood.",
    dosage: "Once daily with a fatty meal for best absorption.",
    sideEffects: "Generally safe. High doses may cause hypercalcemia.",
    interactions: "May interact with steroids and weight-loss medications.",
  },
  {
    id: "m4",
    name: "Metformin",
    dose: "500mg",
    type: "Prescription",
    category: "Diabetes",
    color: "text-blue-600",
    bg: "bg-blue-50",
    uses: "Controls blood sugar in type 2 diabetes. Also used for PCOS.",
    dosage: "Twice daily with meals to reduce stomach side effects.",
    sideEffects: "Nausea, diarrhea, stomach upset, metallic taste.",
    interactions: "Avoid alcohol. Hold before contrast imaging procedures.",
  },
];

const TYPE_COLOR = {
  "Prescription": "badge-red",
  "OTC":          "badge-green",
  "Supplement":   "badge-gold",
};

export default function MedicinesPage() {
  const [selected, setSelected] = useState(MEDICINES[0]);
  const [search, setSearch] = useState("");

  const filtered = MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Medicine Information</h1>
          <p className="text-sm text-slate-500 mt-1">Educational information about medicines in your reports</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Medicine list */}
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Icon n="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines..."
                className="form-input pl-9"
                id="medicine-search"
              />
            </div>

            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition duration-200 ${
                  selected.id === m.id
                    ? "border-royal bg-sky shadow-md"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.bg} ${m.color}`}>
                  <Icon n="pill" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-navy text-sm">{m.name} {m.dose}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge ${TYPE_COLOR[m.type]} text-[10px]`}>{m.type}</span>
                    <span className="text-[10px] text-slate-400">{m.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card p-6 animate-scaleIn">
              {/* Medicine header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100 mb-5">
                <span className={`grid h-16 w-16 place-items-center rounded-2xl ${selected.bg} ${selected.color}`}>
                  <Icon n="pill" className="h-8 w-8" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-navy">{selected.name} {selected.dose}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${TYPE_COLOR[selected.type]}`}>{selected.type}</span>
                    <span className="badge badge-blue">{selected.category}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: "check",    label: "Uses",         text: selected.uses },
                  { icon: "clock",    label: "Dosage",       text: selected.dosage },
                  { icon: "alert",    label: "Side Effects", text: selected.sideEffects },
                  { icon: "activity", label: "Interactions", text: selected.interactions },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-royal shadow-sm">
                        <Icon n={item.icon} className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-bold text-navy">{item.label}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Important Medical Disclaimer</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider before starting, stopping, or changing any medication.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
