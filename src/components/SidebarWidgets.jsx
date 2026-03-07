// src/components/SidebarWidgets.jsx
import React from "react";
import { Leaf, Activity, CheckCircle2 } from "lucide-react";

const SidebarWidgets = ({ dailyData, weeklyPlants }) => {
  return (
    <div className="space-y-6">
      {/* Protein Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
          Protein Goal (120g)
        </span>
        <div className="flex justify-between items-end mt-1">
          <span className="text-2xl font-black tracking-tight">
            {dailyData.protein ?? 0}g
          </span>
          <span className="text-xs font-bold text-indigo-600 mb-1">
            {Math.round(((dailyData.protein ?? 0) / 120) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{
              width: `${Math.min(((dailyData.protein ?? 0) / 120) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Fiber Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
          Fiber Goal (30g)
        </span>
        <div className="flex justify-between items-end mt-1">
          <span className="text-2xl font-black tracking-tight text-emerald-700">
            {dailyData.fiber ?? 0}g
          </span>
          <span className="text-xs font-bold text-emerald-600 mb-1">
            {Math.round(((dailyData.fiber ?? 0) / 30) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{
              width: `${Math.min(((dailyData.fiber ?? 0) / 30) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Plant Diversity Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-2 text-emerald-600 font-black tracking-tight">
            <Leaf className="w-5 h-5" /> <span>Plant Diversity</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">
            {weeklyPlants.length}
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{
              width: `${Math.min((weeklyPlants.length / 30) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase mt-2">
          <span className="text-slate-400 tracking-tighter">
            Clinical: 30 Types
          </span>
          <span className="text-emerald-500 tracking-tighter">
            Elite: 60 Types
          </span>
        </div>
      </div>

      {/* Mobility Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 font-bold">
          <Activity className="w-4 h-4 text-indigo-500" /> Daily Mobility Flow
        </h4>
        <ul className="text-[10px] text-slate-600 space-y-4 font-medium leading-relaxed">
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
            <span>SMR / Foam Roll (10m)</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
            <span>Dynamic Stretch Routine</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
            <span>Stability & Yoga Stretch</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarWidgets;
