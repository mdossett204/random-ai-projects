// src/components/PlantTracker.tsx
import React, { useState } from "react";
import { Leaf, RotateCcw, Trash2, Plus } from "lucide-react";
import { masterPlantList } from "../data/constants";

interface PlantTrackerProps {
  weeklyPlants: string[];
  resetWeekly: (type: "tasks" | "plants") => Promise<void>;
  addPlant: (p: string) => Promise<void>;
  removePlant: (p: string) => Promise<void>;
}

const PlantTracker: React.FC<PlantTrackerProps> = ({
  weeklyPlants,
  resetWeekly,
  addPlant,
  removePlant,
}) => {
  const [newPlant, setNewPlant] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlant(newPlant);
    setNewPlant("");
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-500" /> Species Diversity
        </h2>
        <button
          onClick={() => resetWeekly("plants")}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Clear Week
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input
          type="text"
          value={newPlant}
          onChange={(e) => setNewPlant(e.target.value)}
          placeholder="Add a unique plant variety (e.g. Radicchio, Buckwheat, Turmeric)..."
          className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        <button
          type="submit"
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          Add
        </button>
      </form>

      <div className="space-y-10">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
            Your Active Plant List
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {weeklyPlants.map((p) => (
              <div
                key={p}
                className="p-3 rounded-xl text-[10px] font-bold border bg-emerald-600 border-emerald-700 text-white flex items-center justify-between shadow-md group transition-all animate-in fade-in slide-in-from-bottom-1"
              >
                <span className="truncate pr-2">{p}</span>
                <button
                  onClick={() => removePlant(p)}
                  className="p-1 hover:bg-emerald-500 rounded text-emerald-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {weeklyPlants.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-300 italic text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                No plant species logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-10 border-t border-slate-50">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-slate-400">
            Master Botanical Selection
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {masterPlantList
              .filter((p) => !weeklyPlants.includes(p))
              .map((p) => (
                <button
                  key={p}
                  onClick={() => addPlant(p)}
                  className="p-3 rounded-xl text-[10px] font-bold border bg-white border-slate-100 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left truncate flex items-center justify-between group"
                >
                  <span className="truncate">{p}</span>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantTracker;
