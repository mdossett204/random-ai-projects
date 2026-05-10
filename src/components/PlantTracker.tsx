// src/components/PlantTracker.tsx
import React, { useState, useMemo } from "react";
import { Leaf, RotateCcw, Trash2, Plus, Sparkles, X } from "lucide-react";
import { foodLibrary } from "../data/constants";
import { normalizeItem } from "../utils/textUtils";

interface PlantTrackerProps {
  weeklyPlants: string[];
  resetWeekly: (type: "tasks" | "plants") => Promise<void>;
  addPlant: (p: string) => Promise<void>;
  removePlant: (p: string) => Promise<void>;
  customFoods?: Record<string, string[]>;
  removedFoods?: Record<string, string[]>;
}

const PlantTracker: React.FC<PlantTrackerProps> = ({
  weeklyPlants,
  resetWeekly,
  addPlant,
  removePlant,
  customFoods = {},
  removedFoods = {},
}) => {
  const [newPlant, setNewPlant] = useState("");
  const pct = Math.min((weeklyPlants.length / 30) * 100, 100);

  const handleAddPlant = (p: string) => {
    if (!p.trim()) return;
    addPlant(normalizeItem(p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddPlant(newPlant);
    setNewPlant("");
  };

  const availablePlants = useMemo(() => {
    const list = new Set<string>();
    const excludeCategories = ["Animal Proteins", "Healthy Fats"];

    const allCategories = new Set([
      ...Object.keys(foodLibrary),
      ...Object.keys(customFoods),
    ]);

    allCategories.forEach((cat) => {
      if (excludeCategories.includes(cat)) return;

      const defaults = (foodLibrary[cat] || []).map(normalizeItem);
      const customs = (customFoods[cat] || []).map(normalizeItem);
      const removed = (removedFoods[cat] || []).map(normalizeItem);

      [...defaults, ...customs].forEach((item) => {
        const normalized = normalizeItem(item);
        if (
          !removed.includes(normalized) &&
          !weeklyPlants.some((w) => normalizeItem(w) === normalized)
        ) {
          list.add(normalized);
        }
      });
    });

    return Array.from(list).sort((a, b) => a.localeCompare(b));
  }, [customFoods, removedFoods, weeklyPlants]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Progress hero */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              <Leaf className="w-6 h-6 text-emerald-400" /> Species Diversity
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Aim for 30 unique plant species per week
            </p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">
              {weeklyPlants.length}
            </span>
            <span className="text-xl font-bold text-slate-500 mb-1">/ 30</span>
          </div>
        </div>
        <div className="mt-6 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {weeklyPlants.length >= 30 && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-full">
            <Sparkles className="w-3 h-3" /> 30-plant goal achieved!
          </div>
        )}
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60">
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">
            Your Active List
          </h3>
          <button
            onClick={() => resetWeekly("plants")}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear Week
          </button>
        </div>

        {/* Add input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <div className="flex-grow relative flex items-center">
            <input
              type="text"
              list="plant-library"
              value={newPlant}
              onChange={(e) => setNewPlant(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Add a plant (e.g. Radicchio, Buckwheat, Turmeric)..."
              className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-sm"
            />
            {newPlant && (
              <button
                type="button"
                onClick={() => setNewPlant("")}
                className="absolute right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                title="Clear to see full list"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-black transition-all active:scale-[0.97] whitespace-nowrap shadow-md shadow-emerald-100"
          >
            Add
          </button>
        </form>

        {/* Active plants */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-10">
          {weeklyPlants.map((p) => (
            <div
              key={p}
              className="p-3 rounded-xl text-[11px] font-bold bg-emerald-500 text-white flex items-center justify-between group animate-in fade-in slide-in-from-bottom-1 duration-200 shadow-sm"
            >
              <span className="truncate pr-2">{p}</span>
              <button
                onClick={() => removePlant(p)}
                className="p-1 hover:bg-emerald-600 rounded transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {weeklyPlants.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl font-semibold bg-slate-50/50">
              No plant species logged yet — start adding!
            </div>
          )}
        </div>

        {/* Master list */}
        <div className="pt-8 border-t border-slate-100">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
            Master Botanical Selection
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availablePlants.map((p) => (
              <button
                key={p}
                onClick={() => handleAddPlant(p)}
                className="p-3 rounded-xl text-[11px] font-bold border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all text-left flex items-center justify-between group shadow-sm"
              >
                <span className="truncate">{p}</span>
                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-500 flex-shrink-0 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <datalist id="plant-library">
        {availablePlants.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
};

export default PlantTracker;
