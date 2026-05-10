import React from "react";
import { Clock, Calendar, Leaf, ShoppingBag, Activity } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "daily",
      label: "Daily Routine",
      icon: <Clock className="w-4 h-4" />,
      accent: "violet",
    },
    {
      id: "weekly",
      label: "Weekly Training",
      icon: <Calendar className="w-4 h-4" />,
      accent: "blue",
    },
    {
      id: "diversity",
      label: "Plant Tracker",
      icon: <Leaf className="w-4 h-4" />,
      accent: "emerald",
    },
    {
      id: "food",
      label: "Food Library",
      icon: <ShoppingBag className="w-4 h-4" />,
      accent: "amber",
    },
    {
      id: "exercises",
      label: "Exercise Library",
      icon: <Activity className="w-4 h-4" />,
      accent: "cyan",
    },
  ];

  const accentMap: Record<string, string> = {
    violet: "text-violet-600 bg-white shadow-md shadow-violet-100",
    blue: "text-blue-600 bg-white shadow-md shadow-blue-100",
    emerald: "text-emerald-600 bg-white shadow-md shadow-emerald-100",
    amber: "text-amber-600 bg-white shadow-md shadow-amber-100",
    cyan: "text-cyan-600 bg-white shadow-md shadow-cyan-100",
  };

  return (
    <div className="sticky top-6 z-50 flex flex-wrap justify-center gap-2 mb-10 bg-white/70 backdrop-blur-xl border border-slate-200/50 p-1.5 rounded-2xl w-fit mx-auto shadow-lg shadow-slate-200/20">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === t.id
              ? accentMap[t.accent]
              : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;
