// src/components/WeeklyTraining.tsx
import React from "react";
import { Dumbbell, RotateCcw } from "lucide-react";
import { scheduleTitles } from "../data/constants";

interface WeeklyTrainingProps {
  completedTasks: string[];
  toggleTask: (day: string) => Promise<void>;
  workoutDetails: Record<string, string>;
  setWorkoutDetails: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  updateWorkoutDetail: (day: string, text: string) => Promise<void>;
  resetWeekly: (type: "tasks" | "plants") => Promise<void>;
}

const WeeklyTraining: React.FC<WeeklyTrainingProps> = ({
  completedTasks,
  toggleTask,
  workoutDetails,
  setWorkoutDetails,
  updateWorkoutDetail,
  resetWeekly,
}) => {
  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-indigo-600" /> Training Flow
        </h2>
        <button
          onClick={() => resetWeekly("tasks")}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset Status & Notes
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(scheduleTitles).map(([day, title]) => {
          const completed = completedTasks.includes(day);
          return (
            <div
              key={day}
              className={`p-6 rounded-[2.5rem] border flex flex-col md:flex-row md:items-center gap-6 transition-all ${
                completed
                  ? "bg-emerald-50/50 border-emerald-100"
                  : "bg-slate-50/50 border-slate-100"
              }`}
            >
              <div className="w-32 flex-shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  {day}
                </span>
                <button
                  onClick={() => toggleTask(day)}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    completed
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200"
                  }`}
                >
                  {completed ? "✓ Done" : "Log Task"}
                </button>
              </div>

              <div className="flex-grow space-y-2">
                <h3 className="text-lg font-black text-slate-800 leading-tight flex items-center gap-2">
                  {title}
                </h3>
                <textarea
                  value={workoutDetails[day] || ""}
                  onChange={(e) =>
                    setWorkoutDetails((prev) => ({
                      ...prev,
                      [day]: e.target.value,
                    }))
                  }
                  onBlur={(e) => updateWorkoutDetail(day, e.target.value)}
                  placeholder="Enter exercises, weights, or notes here..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[80px] shadow-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyTraining;
