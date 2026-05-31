// src/components/DailyVitals.tsx
import React from "react";
import { HeartPulse, Activity, RotateCcw, CheckCircle2 } from "lucide-react";
import { defaultDailyData, DailyData } from "../data/constants";

interface DailyVitalsProps {
  dailyData: DailyData;
  updateDaily: (updates: Partial<DailyData>) => Promise<void>;
}

const CheckCard = ({
  label,
  checked,
  onClick,
  color,
  readonly,
  tooltip,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  color: "violet" | "emerald";
  readonly?: boolean;
  tooltip?: string;
}) => {
  const activeClass =
    color === "violet"
      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200"
      : "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100";

  const inactiveClass =
    color === "violet"
      ? "bg-white border-slate-200 text-slate-400 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-600"
      : "bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600";

  return (
    <button
      onClick={readonly ? undefined : onClick}
      disabled={readonly}
      title={tooltip}
      className={`w-full p-5 rounded-2xl border-2 flex flex-col justify-center items-center gap-3 transition-all duration-200 ${
        readonly
          ? "cursor-help opacity-90"
          : "active:scale-[0.97] cursor-pointer"
      } ${checked ? activeClass : inactiveClass}`}
    >
      {checked ? (
        <CheckCircle2 className="w-8 h-8" />
      ) : (
        <div className="w-8 h-8 rounded-full border-[3px] border-current opacity-30" />
      )}
      <span className="text-sm font-bold leading-tight text-center">
        {label}
      </span>
    </button>
  );
};

const DailyVitals: React.FC<DailyVitalsProps> = ({
  dailyData,
  updateDaily,
}) => {
  const vitalsItems = [
    { key: "fishOil", label: "Fish Oil" },
    { key: "vitaminD3", label: "Vitamin D3" },
    { key: "magnesium", label: "Magnesium" },
    { key: "creatine", label: "Creatine" },
  ];

  const mobilityItems = [
    { key: "breathing", label: "Breathing" },
    { key: "foamRoll", label: "Foam Roll" },
    { key: "dynamicStretch", label: "Dynamic Stretch" },
    { key: "staticStretch", label: "Static Stretch" },
    { key: "training", label: "Daily Training" },
  ];

  const vitalsChecked = vitalsItems.filter(
    (i) => dailyData.rituals?.[i.key],
  ).length;
  const mobilityChecked = mobilityItems.filter(
    (i) => dailyData.mobility?.[i.key],
  ).length;

  return (
    <div className="space-y-6">
      {/* Vitamins */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
              <HeartPulse className="w-5 h-5 text-violet-500" /> Daily Vitamins
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1 ml-7">
              {vitalsChecked} of {vitalsItems.length} taken today
            </p>
          </div>
          <button
            onClick={() => updateDaily({ rituals: defaultDailyData.rituals })}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-violet-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vitalsItems.map((item) => (
            <CheckCard
              key={item.key}
              label={item.label}
              checked={!!dailyData.rituals?.[item.key]}
              onClick={() =>
                updateDaily({
                  rituals: {
                    ...dailyData.rituals,
                    [item.key]: !dailyData.rituals?.[item.key],
                  },
                })
              }
              color="violet"
            />
          ))}
        </div>
      </div>

      {/* Movement */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 animate-in fade-in zoom-in-95 duration-300 delay-75">
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5 text-emerald-500" /> Daily Movement
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1 ml-7">
              {mobilityChecked} of {mobilityItems.length} completed
            </p>
          </div>
          <button
            onClick={() =>
              updateDaily({
                mobility: {
                  ...defaultDailyData.mobility,
                  training: dailyData.mobility?.training || false,
                },
              })
            }
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {mobilityItems.map((item) => (
            <CheckCard
              key={item.key}
              label={item.label}
              checked={!!dailyData.mobility?.[item.key]}
              readonly={item.key === "training"}
              tooltip={
                item.key === "training"
                  ? "Automatically tracked via the Weekly Training tab"
                  : undefined
              }
              onClick={() => {
                if (item.key === "training") return;
                updateDaily({
                  mobility: {
                    ...dailyData.mobility,
                    [item.key]: !dailyData.mobility?.[item.key],
                  },
                });
              }}
              color="emerald"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyVitals;
