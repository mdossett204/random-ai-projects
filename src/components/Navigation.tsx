import React from "react";
import { Clock, Calendar, Leaf, ShoppingBag, Target } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "daily", label: "Daily Vitals", icon: <Clock className="w-4 h-4" /> },
    {
      id: "weekly",
      label: "Weekly Training",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "diversity",
      label: "Plant Tracker",
      icon: <Leaf className="w-4 h-4" />,
    },
    {
      id: "food",
      label: "Food Library",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: "science",
      label: "Training Science",
      icon: <Target className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit mx-auto lg:mx-0">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === t.id
              ? "bg-white shadow-md text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;
