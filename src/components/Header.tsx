// src/components/Header.tsx
import React from "react";
import { ShieldCheck, Scale, Brain, CheckCircle2, LogOut } from "lucide-react";
import { User } from "firebase/auth";
import { DailyData } from "../data/constants";

interface HeaderProps {
  todayStr: string;
  dailyData: DailyData;
  weeklyPlants: string[];
  user: User | null;
  handleLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({
  todayStr,
  dailyData,
  weeklyPlants,
  user,
  handleLogout,
}) => {
  return (
    <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
      <div>
        <div className="flex items-center gap-3 text-indigo-600 font-bold mb-2">
          <ShieldCheck className="w-6 h-6" />
          <span className="uppercase tracking-[0.3em] text-xs">{todayStr}</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
          Master Longevity Protocol
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <Scale className="w-4 h-4 text-indigo-400" /> 120 lbs
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <Brain className="w-4 h-4 text-indigo-400" /> Creatine:{" "}
            {dailyData.creatine ?? 0}g
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
              <CheckCircle2 className="w-3 h-3" /> Synced: {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-3 py-1 rounded-full hover:bg-rose-100 transition-all border border-rose-100"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="bg-slate-50 px-6 py-4 rounded-[2rem] border border-slate-100 text-center min-w-[120px]">
          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">
            Diversity
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {weeklyPlants.length} / 30
          </span>
        </div>
        <div className="bg-indigo-600 px-6 py-4 rounded-[2rem] text-white shadow-xl text-center min-w-[140px]">
          <span className="text-[10px] font-black text-indigo-200 uppercase block mb-1 tracking-widest">
            Daily Steps
          </span>
          <span className="text-2xl font-black">
            {(dailyData.steps ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
