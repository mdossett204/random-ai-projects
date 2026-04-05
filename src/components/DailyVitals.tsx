// src/components/DailyVitals.tsx
import React from "react";
import {
  Utensils,
  RotateCcw,
  Minus,
  Plus,
  Beaker,
  CheckCircle2,
} from "lucide-react";
import { defaultDailyData, DailyData } from "../data/constants";

interface DailyVitalsProps {
  dailyData: DailyData;
  updateDaily: (updates: Partial<DailyData>) => Promise<void>;
}

const DailyVitals: React.FC<DailyVitalsProps> = ({
  dailyData,
  updateDaily,
}) => {
  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Utensils className="w-6 h-6 text-indigo-600" /> Intake Tracker
        </h2>
        <button
          onClick={() => updateDaily(defaultDailyData)}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset Day
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-indigo-600 font-bold">
                Weight (Pounds)
              </label>
              <input
                type="number"
                value={dailyData.weight}
                min="0"
                onChange={(e) =>
                  updateDaily({ weight: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                Protein ({Math.ceil(dailyData.weight * 1.0)})
              </label>
              <input
                type="number"
                value={dailyData.protein}
                min="0"
                onChange={(e) =>
                  updateDaily({ protein: parseInt(e.target.value) || 0 })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                Fat ({Math.ceil(dailyData.weight * 0.33)})
              </label>
              <input
                type="number"
                value={dailyData.fatGrams}
                min="0"
                onChange={(e) =>
                  updateDaily({ fatGrams: parseInt(e.target.value) || 0 })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-emerald-600 font-bold">
                Fiber (35g)
              </label>
              <input
                type="number"
                value={dailyData.fiber}
                min="0"
                onChange={(e) =>
                  updateDaily({ fiber: parseInt(e.target.value) || 0 })
                }
                className="w-full p-4 bg-slate-50 border border-emerald-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-indigo-600 font-bold">
                Creatine (Grams)
              </label>
              <input
                type="number"
                value={dailyData.creatine}
                min="0"
                max="25"
                onChange={(e) =>
                  updateDaily({ creatine: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-indigo-600 font-bold tracking-widest">
              Water (Cups, 8 fluid oz - Target:{" "}
              {Math.round((dailyData.weight * 0.8) / 8.0)})
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <button
                onClick={() =>
                  updateDaily({
                    waterCups: Math.max(0, (dailyData.waterCups || 0) - 1),
                  })
                }
                className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-black flex-grow text-center tracking-tighter">
                {dailyData.waterCups} /{" "}
                {Math.round((dailyData.weight * 0.8) / 8.0)}
              </span>
              <button
                onClick={() =>
                  updateDaily({ waterCups: (dailyData.waterCups || 0) + 1 })
                }
                className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
              Daily Step Goal (10,000)
            </label>
            <input
              type="number"
              value={dailyData.steps}
              min="0"
              onChange={(e) =>
                updateDaily({ steps: parseInt(e.target.value) || 0 })
              }
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-black text-emerald-600 flex items-center gap-2 mb-2">
            <Beaker className="w-5 h-5" /> Daily Rituals
          </h2>
          {Object.entries(dailyData.rituals).map(([id, val]) => (
            <button
              key={id}
              onClick={() =>
                updateDaily({ rituals: { ...dailyData.rituals, [id]: !val } })
              }
              className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all ${
                val
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm"
                  : "bg-white border-slate-100 text-slate-500 hover:border-emerald-100"
              }`}
            >
              <span className="text-sm font-bold capitalize">
                {id === "vitaminD3"
                  ? "Vitamin D3"
                  : id.replace(/([A-Z])/g, " $1")}
              </span>
              {val ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-100" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyVitals;
