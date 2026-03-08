// src/components/SidebarWidgets.tsx
import React from "react";
import { Leaf, Activity, CheckCircle2 } from "lucide-react";
import { DailyData } from "../data/constants";

interface SidebarWidgetsProps {
  dailyData: DailyData;
  weeklyPlants: string[];
  updateDaily: (updates: Partial<DailyData>) => Promise<void>;
}

const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  dailyData,
  weeklyPlants,
  updateDaily,
}) => {
  const mobilityItems = [
    { key: "smr", label: "SMR / Foam Roll (10m)" },
    { key: "dynamicStretch", label: "Dynamic Stretch Routine" },
    { key: "stability", label: "Stability & Yoga Stretch" },
  ];

  const proteinGoal = Math.ceil(dailyData.weight * 1.0);
  const fatGoal = Math.ceil(dailyData.weight * 0.33);

  return (
    <div className="space-y-6">
      {/* Protein Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
          Protein Goal ({proteinGoal}g)
        </span>
        <div className="flex justify-between items-end mt-1">
          <span className="text-2xl font-black tracking-tight">
            {dailyData.protein ?? 0}g
          </span>
          <span className="text-xs font-bold text-indigo-600 mb-1">
            {Math.round(((dailyData.protein ?? 0) / (proteinGoal || 1)) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{
              width: `${Math.min(((dailyData.protein ?? 0) / (proteinGoal || 1)) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>
      {/* Fat Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
          Fat Goal ({fatGoal}g)
        </span>
        <div className="flex justify-between items-end mt-1">
          <span className="text-2xl font-black tracking-tight">
            {dailyData.fatGrams ?? 0}g
          </span>
          <span className="text-xs font-bold text-indigo-600 mb-1">
            {Math.round(((dailyData.fatGrams ?? 0) / (fatGoal || 1)) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{
              width: `${Math.min(((dailyData.fatGrams ?? 0) / (fatGoal || 1)) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Fiber Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
          Fiber Goal (35g)
        </span>
        <div className="flex justify-between items-end mt-1">
          <span className="text-2xl font-black tracking-tight text-emerald-700">
            {dailyData.fiber ?? 0}g
          </span>
          <span className="text-xs font-bold text-emerald-600 mb-1">
            {Math.round(((dailyData.fiber ?? 0) / 35) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{
              width: `${Math.min(((dailyData.fiber ?? 0) / 35) * 100, 100)}%`,
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
        <div className="space-y-4">
          {mobilityItems.map((item) => (
            <button
              key={item.key}
              onClick={() =>
                updateDaily({
                  mobility: {
                    ...dailyData.mobility,
                    [item.key]: !dailyData.mobility?.[item.key],
                  },
                })
              }
              className={`flex items-center gap-3 w-full text-left transition-all group ${
                dailyData.mobility?.[item.key]
                  ? "opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  dailyData.mobility?.[item.key]
                    ? "text-emerald-500"
                    : "text-slate-300 group-hover:text-emerald-300"
                }`}
              />
              <span
                className={`text-[10px] font-medium leading-relaxed ${
                  dailyData.mobility?.[item.key]
                    ? "text-slate-800 font-bold"
                    : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarWidgets;
