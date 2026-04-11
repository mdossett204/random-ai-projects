// src/components/WeeklyTraining.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  RotateCcw,
  Target,
  Activity,
  Plus,
  Trash2,
} from "lucide-react";

interface Exercise {
  name: string;
  "Weight (pounds)": string;
  rep: string;
  duration?: string;
  notes: string;
}

export interface DayWorkout {
  type?: "strength" | "cardio";
  title: string;
  exercises: Exercise[];
  additionalNotes: string;
}

interface WeeklyTrainingProps {
  workoutDetails: Record<string, DayWorkout>;
  setWorkoutDetails: React.Dispatch<
    React.SetStateAction<Record<string, DayWorkout>>
  >;
  updateWorkoutDetail: (day: string, data: DayWorkout) => Promise<void>;
  resetWeekly: (type: "tasks" | "plants") => Promise<void>;
}

const emptyExercise = (): Exercise => ({
  name: "",
  "Weight (pounds)": "",
  rep: "",
  duration: "",
  notes: "",
});

const getInitialExercises = (exercises?: Exercise[]) => {
  if (!exercises) {
    return Array.from({ length: 6 }, emptyExercise);
  }
  return exercises;
};

interface DayCardProps {
  day: string;
  defaultTitle: string;
  data?: DayWorkout;
  onUpdate: (day: string, data: DayWorkout) => void;
  onSave: (day: string, data: DayWorkout) => Promise<void>;
}

const DayCard = ({
  day,
  defaultTitle,
  data,
  onUpdate,
  onSave,
}: DayCardProps) => {
  const workout: DayWorkout = data
    ? {
        type: data.type || "strength",
        title: data.title || defaultTitle,
        exercises: getInitialExercises(data.exercises),
        additionalNotes: data.additionalNotes || "",
      }
    : {
        type: "strength",
        title: defaultTitle,
        exercises: getInitialExercises(),
        additionalNotes: "",
      };

  const [localData, setLocalData] = useState<DayWorkout>(workout);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCardio = localData.type === "cardio";

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalData({
        type: data.type || "strength",
        title: data.title || defaultTitle,
        exercises: getInitialExercises(data.exercises),
        additionalNotes: data.additionalNotes || "",
      });
    } else {
      setLocalData({
        type: "strength",
        title: defaultTitle,
        exercises: getInitialExercises(),
        additionalNotes: "",
      });
    }
  }, [data, defaultTitle]);

  const handleChange = (updater: (prev: DayWorkout) => DayWorkout) => {
    const newData = updater(localData);
    setLocalData(newData);
    onUpdate(day, newData);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(day, newData);
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange((prev) => ({ ...prev, title: e.target.value }));

  const handleAdditionalNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    handleChange((prev) => ({ ...prev, additionalNotes: e.target.value }));

  const handleExerciseChange = (
    index: number,
    field: keyof Exercise,
    value: string,
  ) => {
    handleChange((prev) => {
      const newExercises = [...(prev.exercises || [])];
      // Ensure we have enough rows
      while (newExercises.length <= index) {
        newExercises.push(emptyExercise());
      }
      newExercises[index] = { ...newExercises[index], [field]: value };
      return { ...prev, exercises: newExercises };
    });
  };

  const removeExercise = (index: number) => {
    handleChange((prev) => {
      const newExercises = [...(prev.exercises || [])];
      newExercises.splice(index, 1);
      return { ...prev, exercises: newExercises };
    });
  };

  const addExercise = () => {
    handleChange((prev) => ({
      ...prev,
      exercises: [...(prev.exercises || []), emptyExercise()],
    }));
  };

  const filledCount =
    localData.exercises?.filter((e) => e.name.trim()).length || 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col gap-4">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest w-24 flex-shrink-0">
            {day}
          </span>
          <select
            value={localData.type || "strength"}
            onChange={(e) =>
              handleChange((prev) => ({
                ...prev,
                type: e.target.value as "strength" | "cardio",
              }))
            }
            className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-600 focus:ring-2 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
          </select>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
              isCardio
                ? "bg-orange-50 text-orange-600 border border-orange-200"
                : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}
          >
            {isCardio ? (
              <Activity className="w-3 h-3" />
            ) : (
              <Target className="w-3 h-3" />
            )}
            {filledCount} exercises
          </span>
        </div>
        <input
          type="text"
          value={localData.title}
          onChange={handleTitleChange}
          placeholder="Workout Focus"
          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-bold text-center text-slate-900 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
        />
      </div>

      {/* 6 Lines of Exercises */}
      <div className="space-y-2">
        {localData.type === "cardio" ? (
          <div className="hidden md:grid grid-cols-12 gap-2 px-2">
            <span className="col-span-4 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Activity Name
            </span>
            <span className="col-span-4 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Duration / Distance
            </span>
            <span className="col-span-3 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Notes
            </span>
            <span className="col-span-1"></span>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-12 gap-2 px-2">
            <span className="col-span-4 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Exercise Name
            </span>
            <span className="col-span-2 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Weight (pounds)
            </span>
            <span className="col-span-2 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Reps
            </span>
            <span className="col-span-3 text-[10px] font-bold text-center uppercase text-slate-400 tracking-widest">
              Notes
            </span>
            <span className="col-span-1"></span>
          </div>
        )}

        {(localData.exercises || []).map((ex, i) => {
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {localData.type === "cardio" ? (
                <>
                  <input
                    type="text"
                    placeholder="Activity Name"
                    value={ex.name}
                    onChange={(e) =>
                      handleExerciseChange(i, "name", e.target.value)
                    }
                    className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Duration / Distance"
                    value={ex.duration || ""}
                    onChange={(e) =>
                      handleExerciseChange(i, "duration", e.target.value)
                    }
                    className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={ex.notes}
                    onChange={(e) =>
                      handleExerciseChange(i, "notes", e.target.value)
                    }
                    className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <button
                    onClick={() => removeExercise(i)}
                    title="Remove exercise"
                    className="md:col-span-1 flex items-center justify-center p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Exercise Name"
                    value={ex.name}
                    onChange={(e) =>
                      handleExerciseChange(i, "name", e.target.value)
                    }
                    className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Weight (pounds)"
                    value={ex["Weight (pounds)"]}
                    onChange={(e) =>
                      handleExerciseChange(i, "Weight (pounds)", e.target.value)
                    }
                    className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Reps"
                    value={ex.rep}
                    onChange={(e) =>
                      handleExerciseChange(i, "rep", e.target.value)
                    }
                    className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={ex.notes}
                    onChange={(e) =>
                      handleExerciseChange(i, "notes", e.target.value)
                    }
                    className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                  />
                  <button
                    onClick={() => removeExercise(i)}
                    title="Remove exercise"
                    className="md:col-span-1 flex items-center justify-center p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* Add Exercise Row Button */}
        <button
          onClick={addExercise}
          className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Exercise
        </button>
      </div>

      {/* Additional Notes Box */}
      <textarea
        value={localData.additionalNotes}
        onChange={handleAdditionalNotes}
        placeholder="Additional notes for this day..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-center text-slate-800 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all resize-none min-h-[80px] mt-2"
      />
    </div>
  );
};

const WeeklyTraining: React.FC<WeeklyTrainingProps> = ({
  workoutDetails,
  setWorkoutDetails,
  updateWorkoutDetail,
  resetWeekly,
}) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [selectedDay, setSelectedDay] = useState("Monday");

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              <Calendar className="w-6 h-6 text-blue-400" /> Weekly Training
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Log your workouts for the week
            </p>
          </div>
          <button
            onClick={() => resetWeekly("tasks")}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 border border-slate-700 hover:border-rose-400/30 px-4 py-2.5 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Week
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 hover:text-slate-900"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected Day Card */}
      <div className="space-y-4">
        <DayCard
          key={selectedDay}
          day={selectedDay}
          defaultTitle=""
          data={workoutDetails[selectedDay]}
          onUpdate={(d: string, data: DayWorkout) =>
            setWorkoutDetails((prev) => ({ ...prev, [d]: data }))
          }
          onSave={updateWorkoutDetail}
        />
      </div>
    </div>
  );
};

export default WeeklyTraining;
