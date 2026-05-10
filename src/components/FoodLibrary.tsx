// src/components/FoodLibrary.tsx
import React, { useState } from "react";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { foodLibrary } from "../data/constants";
import { normalizeItem } from "../utils/textUtils";

interface FoodLibraryProps {
  customFoods?: Record<string, string[]>;
  removedFoods?: Record<string, string[]>;
  addCustomFood?: (category: string, item: string) => Promise<void>;
  removeCustomFood?: (category: string, item: string) => Promise<void>;
}

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

const FoodLibrary: React.FC<FoodLibraryProps> = ({
  customFoods = {},
  removedFoods = {},
  addCustomFood,
  removeCustomFood,
}) => {
  const [search, setSearch] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  // Combine default library with custom synced items
  const combinedLibrary: Record<string, string[]> = {};
  const allCategories = new Set([
    ...Object.keys(foodLibrary),
    ...Object.keys(customFoods),
  ]);
  allCategories.forEach((cat) => {
    const defaults = (foodLibrary[cat as keyof typeof foodLibrary] || []).map(
      normalizeItem,
    );
    const customs = (customFoods[cat] || []).map(normalizeItem);
    const removed = (removedFoods[cat] || []).map(normalizeItem);

    combinedLibrary[cat] = Array.from(new Set([...defaults, ...customs]))
      .filter((i) => !removed.includes(i))
      .sort((a, b) => a.localeCompare(b));
  });

  const categories = Object.entries(combinedLibrary);
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

  const handleAdd = async (cat: string) => {
    const item = newItems[cat];
    if (!item || !addCustomFood) return;

    const normalized = normalizeItem(item);
    await addCustomFood(cat, normalized);
    setNewItems((prev) => ({ ...prev, [cat]: "" }));
  };

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

              {/* Add Item Input */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newItems[cat] || ""}
                  onChange={(e) =>
                    setNewItems((prev) => ({ ...prev, [cat]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(cat)}
                  placeholder="Add custom food..."
                  className="bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-400/50 transition-all w-full"
                />
                <button
                  onClick={() => handleAdd(cat)}
                  disabled={!addCustomFood}
                  className={`p-2 rounded-xl text-white ${palette.dot} hover:opacity-80 transition-opacity flex-shrink-0 shadow-sm disabled:opacity-50`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {items.map((i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-[11px] font-bold ${palette.bg} ${palette.text} border border-transparent flex justify-between items-center group`}
                  >
                    <span className="truncate pr-1">{i}</span>

                    {removeCustomFood && (
                      <button
                        onClick={() => removeCustomFood(cat, i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
