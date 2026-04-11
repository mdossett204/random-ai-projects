// src/components/Header.tsx
import React from "react";
import { ShieldCheck, LogOut, Zap } from "lucide-react";
import { User } from "firebase/auth";

interface HeaderProps {
  todayStr: string;
  weeklyPlants: string[];
  user: User | null;
  handleLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({
  todayStr,
  weeklyPlants,
  user,
  handleLogout,
}) => {
  const diversity = weeklyPlants.length;
  const diversityPct = Math.min((diversity / 30) * 100, 100);

  return (
    <header className="mb-8 relative overflow-hidden bg-slate-900 p-8 rounded-3xl border border-slate-700/50">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-500/10 rounded-full translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" /> {todayStr}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-none mb-1">
            Longevity Protocol
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            Optimizing health one day at a time
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-400/30 transition-all border border-slate-700"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>

        {/* Stats panel */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 px-6 py-4 rounded-2xl text-center min-w-[140px] backdrop-blur-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Plant Diversity
            </span>
            <span className="text-3xl font-black text-white">
              {diversity}
              <span className="text-lg text-slate-500 font-bold"> / 30</span>
            </span>
            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${diversityPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
