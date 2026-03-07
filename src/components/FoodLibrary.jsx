// src/components/FoodLibrary.jsx
import React from "react";
import { ShoppingBag } from "lucide-react";
import { foodLibrary } from "../data/constants";

const FoodLibrary = () => {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-indigo-600" /> Bio-Available
        Library
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {Object.entries(foodLibrary).map(([cat, items]) => (
          <div key={cat} className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">
              {cat}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {items.map((i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 border border-slate-100"
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodLibrary;
