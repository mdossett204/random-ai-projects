// src/components/FoodLibrary.tsx
import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { foodLibrary } from "../data/constants";

const categoryColors: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  "Animal Proteins": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  "Healthy Fats": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Vegetables: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Fruits: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  "Nuts/Seeds": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  Fermented: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  "Spices & Herbs": {
    bg: "bg-lime-50",
    text: "text-lime-700",
    dot: "bg-lime-500",
  },
  Beverages: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
};

const FoodLibrary: React.FC = () => {
  const [search, setSearch] = useState("");
  const categories = Object.entries(foodLibrary);

  const filtered = search.trim()
    ? categories
        .map(
          ([cat, items]) =>
            [
              cat,
              items.filter((i) =>
                i.toLowerCase().includes(search.toLowerCase()),
              ),
            ] as [string, string[]],
        )
        .filter(([, items]) => items.length > 0)
    : categories;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      {/* Hero */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              <ShoppingBag className="w-6 h-6 text-amber-400" /> Bio-Available
              Library
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Nutrient-dense, whole-food selections
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods..."
            className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-2xl px-5 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all w-full md:w-64"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(([cat, items]) => {
          const palette = categoryColors[cat] || {
            bg: "bg-slate-50",
            text: "text-slate-700",
            dot: "bg-slate-500",
          };
          return (
            <div
              key={cat}
              className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
                <span className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  {cat}
                </h4>
                <span className="ml-auto text-xs font-bold text-slate-400">
                  {items.length} items
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-[11px] font-bold ${palette.bg} ${palette.text} border border-transparent`}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-300 text-sm border-2 border-dashed border-slate-100 rounded-3xl font-medium">
            No foods match "{search}"
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodLibrary;
