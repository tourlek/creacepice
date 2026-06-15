import React, { useState } from "react";
import { SOP_PACKAGES } from "../data";
import { SopPackage } from "../types";
import { Bolt, Info, ShieldCheck, ClipboardCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SopTab() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedSop = SOP_PACKAGES.find((pkg) => pkg.id === selectedId);

  // Render correct color classes based on configuration
  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          border: "border-emerald-200 hover:border-emerald-500",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          bullet: "bg-emerald-600",
        };
      case "blue":
        return {
          border: "border-blue-200 hover:border-blue-500",
          bg: "bg-blue-50",
          text: "text-blue-700",
          bullet: "bg-blue-600",
        };
      case "amber":
        return {
          border: "border-amber-200 hover:border-amber-500",
          bg: "bg-amber-50",
          text: "text-amber-700",
          bullet: "bg-amber-600",
        };
      case "rose":
        return {
          border: "border-rose-200 hover:border-rose-500",
          bg: "bg-rose-50",
          text: "text-rose-700",
          bullet: "bg-rose-600",
        };
      case "slate":
      default:
        return {
          border: "border-slate-200 hover:border-slate-600",
          bg: "bg-slate-50",
          text: "text-slate-700",
          bullet: "bg-slate-600",
        };
    }
  };

  return (
    <div className="space-y-8" id="sop-tab-root">
      <header id="sop-header">
        <h1 className="font-sans text-3xl font-extrabold text-slate-900 tracking-tight" id="sop-title">
          SOP Manual &amp; Packages
        </h1>
        <p className="text-sm text-slate-500 font-medium" id="sop-subtitle">
          Standard Operating Procedures for Energy-Saving Efficiency
        </p>
      </header>

      {/* Packages Grid Row */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        id="sop-packages-grid"
      >
        {SOP_PACKAGES.map((pkg) => {
          const colors = getColorClasses(pkg.color);
          const isSelected = selectedId === pkg.id;
          return (
            <button
              key={pkg.id}
              id={`sop-package-card-${pkg.id}`}
              onClick={() => setSelectedId(pkg.id)}
              className={`sop-card p-5 bg-white rounded-2xl border text-left shadow-xs transition-all duration-300 transform hover:-translate-y-1 ${
                isSelected 
                  ? "ring-2 ring-blue-500 border-blue-500 shadow-md scale-[1.02]" 
                  : `border-slate-200 ${colors.border}`
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${colors.text}`}>
                PACKAGE {pkg.id}
              </span>
              <h4 className="text-sm font-black text-slate-900 mb-3 leading-tight">
                {pkg.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <Bolt className="w-3.5 h-3.5 text-slate-300" />
                <span>{pkg.energy}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Package Detail Viewer */}
      <div 
        className="stripe-card p-8 min-h-[420px]"
        id="sop-detail-viewer-container"
      >
        <AnimatePresence mode="wait">
          {selectedSop ? (
            <motion.div
              key={selectedSop.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              id={`sop-detail-${selectedSop.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${getColorClasses(selectedSop.color).text}`}>
                    Package {selectedSop.id} Details
                  </span>
                  <h2 className="font-sans text-2xl font-bold text-slate-900">
                    {selectedSop.title}
                  </h2>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-bold border self-start sm:self-center ${getColorClasses(selectedSop.color).bg} ${getColorClasses(selectedSop.color).text}`}>
                  Energy Requirement: {selectedSop.energy}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Definition and Deliverables */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Definition / นิยามแพ็กเกจ
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      {selectedSop.definition}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Deliverables / สิ่งที่ส่งมอบให้แบรนด์
                    </h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-blue-600 leading-relaxed font-semibold">
                      {selectedSop.deliverables}
                    </div>
                  </div>
                </div>

                {/* Workflow steps */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Workflow (Step-by-step) / ขั้นตอนการทำงาน
                  </h4>
                  <ul className="space-y-3.5">
                    {selectedSop.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3.5 text-sm text-slate-700 leading-relaxed">
                        <span className={`w-5.5 h-5.5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${getColorClasses(selectedSop.color).bullet}`}>
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Energy Guardrail warning panel */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex gap-4">
                  <ShieldCheck className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">
                      Energy-Saving Guard (Guardrail) / จุดคุมขอบเซฟแรง
                    </h5>
                    <p className="text-xs font-medium text-amber-900 leading-relaxed">
                      {selectedSop.guard}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-350 py-20" id="sop-empty-state">
              <ClipboardCheck className="w-16 h-16 mb-4 text-slate-300 stroke-[1.25]" />
              <p className="font-sans font-bold text-slate-400">Select a package to view detailed SOP</p>
              <p className="text-xs text-slate-400 mt-1">คลิกเลือกแพ็กเกจด้านบนเพื่อเริ่มตรวจสอบขั้นตอนการทำงานอย่างละเอียด</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
