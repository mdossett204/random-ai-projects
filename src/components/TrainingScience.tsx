// src/components/TrainingScience.tsx
import React from "react";
import { Target, Waves } from "lucide-react";

const TrainingScience: React.FC = () => {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 space-y-8 shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-3xl font-black flex items-center gap-3 text-rose-500 tracking-tight">
        <Target className="w-8 h-8" /> Training Science
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <h5 className="font-black text-indigo-400 uppercase text-xs mb-4 relative z-10 tracking-widest">
            VO2 Max (Norwegian 4x4)
          </h5>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed relative z-10 italic">
            "Stroke Volume is the secret to heart longevity."
          </p>
          <p className="text-[11px] text-slate-400 mb-6 leading-relaxed relative z-10">
            4 mins at 90% HR using Speed Jump Rope or KB Swings. During the 4
            min OFF period, perform **Active Recovery** (slow walk + nasal
            breathing).
          </p>
          <Waves className="absolute -bottom-10 -right-10 w-32 h-32 text-indigo-500 opacity-10" />
        </div>
        <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 shadow-sm">
          <h5 className="font-black text-indigo-600 uppercase text-xs mb-4 tracking-widest">
            SIT & SMR
          </h5>
          <p className="text-[11px] text-indigo-900 mb-4 leading-relaxed italic">
            SIT: 30s All-out Sprint + 2m recovery. SMR (Self-Myofascial
            Release): Use foam roller for 10m daily to clear fascial kinking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingScience;
