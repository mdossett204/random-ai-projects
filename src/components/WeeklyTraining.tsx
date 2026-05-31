// src/components/WeeklyTraining.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar,
  RotateCcw,
  Activity,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Clipboard,
  Check,
  AlertCircle,
  X,
  CheckCircle,
  Circle,
  ArrowLeftRight,
} from "lucide-react";
import { exerciseLibrary } from "../data/constants";
import { normalizeItem } from "../utils/textUtils";

export interface WorkoutSet {
  id: string;
  weight?: string;
  reps?: string;
  duration?: string;
  durationUnit?: "min" | "sec";
  completed?: boolean;
}

export interface Exercise {
  id: string;
  type: "strength" | "cardio" | "ab" | "balance" | "mobility";
  name: string;
  notes: string;
  sets: WorkoutSet[];
  completed?: boolean;
  trackingType?: "reps" | "duration";
  weightType?: "weight" | "bodyweight";
}

export interface DayWorkout {
  title: string;
  exercises: Exercise[];
  additionalNotes: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const emptySet = (): WorkoutSet => ({
  id: generateId(),
  weight: "",
  reps: "",
  duration: "",
  durationUnit: "min",
  completed: false,
});

const emptyExercise = (type: Exercise["type"] = "strength"): Exercise => ({
  id: generateId(),
  type,
  name: "",
  notes: "",
  sets: [emptySet()],
  completed: false,
  trackingType: "reps",
  weightType: "weight",
});

interface LegacyExercise {
  name?: string;
  "Weight (pounds)"?: string;
  rep?: string;
  duration?: string;
  notes?: string;
  sets?: WorkoutSet[];
  completed?: boolean;
  trackingType?: "reps" | "duration";
  weightType?: "weight" | "bodyweight";
}

const normalizeSavedExercises = (
  data?: DayWorkout | { exercises?: LegacyExercise[] },
): Exercise[] => {
  const old = data?.exercises;
  if (!old || !Array.isArray(old) || old.length === 0) return [];
  if ("id" in old[0] && "type" in old[0]) return old as Exercise[]; // Already migrated

  // Migrate legacy structure
  const migrated = (old as LegacyExercise[])
    .filter(
      (ex) =>
        ex.name || ex["Weight (pounds)"] || ex.rep || ex.duration || ex.notes,
    )
    .map(
      (ex): Exercise => ({
        id: generateId(),
        type: ex.duration ? "cardio" : "strength",
        name: ex.name || "",
        notes: ex.notes || "",
        completed: ex.completed || false,
        trackingType: ex.trackingType || "reps",
        weightType: ex.weightType || "weight",
        sets: [
          {
            id: generateId(),
            weight: ex["Weight (pounds)"] || "",
            reps: ex.rep || "",
            duration: ex.duration || "",
            durationUnit: "min",
            completed: ex.completed || false,
          },
        ],
      }),
    );
  return migrated;
};

interface WeeklyTrainingProps {
  workoutDetails: Record<string, DayWorkout>;
  setWorkoutDetails: React.Dispatch<
    React.SetStateAction<Record<string, DayWorkout>>
  >;
  updateWorkoutDetail: (day: string, data: DayWorkout) => Promise<void>;
  resetWeekly: (type: "tasks" | "plants") => Promise<void>;
  customExercises?: Record<string, string[]>;
  removedExercises?: Record<string, string[]>;
  clipboard?: { day: DayWorkout | null; exercise: Exercise | null };
  updateClipboard?: (
    updates: Partial<{ day: DayWorkout | null; exercise: Exercise | null }>,
  ) => Promise<void>;
  addCustomExercise?: (category: string, item: string) => Promise<void>;
  syncDailyTraining?: (isCompleted: boolean) => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
}: ConfirmModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-black text-lg">{title}</h3>
        </div>
        <p className="text-slate-600 font-medium mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-black text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SwapDayModalProps {
  isOpen: boolean;
  currentDay: string;
  days: string[];
  onConfirm: (targetDay: string) => void;
  onCancel: () => void;
}

const SwapDayModal = ({
  isOpen,
  currentDay,
  days,
  onConfirm,
  onCancel,
}: SwapDayModalProps) => {
  const [selectedTarget, setSelectedTarget] = useState("");

  const available = days.filter((d) => d !== currentDay);
  const activeTarget = selectedTarget || available[0] || "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-violet-600 mb-4">
          <ArrowLeftRight className="w-6 h-6" />
          <h3 className="font-black text-lg">Swap Day</h3>
        </div>
        <p className="text-slate-600 font-medium mb-4 text-base">
          Select a day to swap workouts with <strong>{currentDay}</strong>:
        </p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {available.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedTarget(d)}
              className={`p-3 rounded-xl text-base font-bold transition-all border-2 ${
                activeTarget === d
                  ? "bg-violet-50 border-violet-500 text-violet-700"
                  : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setSelectedTarget("");
              onCancel();
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(activeTarget);
              setSelectedTarget("");
            }}
            className="px-4 py-2 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
          >
            Swap
          </button>
        </div>
      </div>
    </div>
  );
};

const CATEGORY_MAP: Record<string, string> = {
  cardio: "Cardio Exercises",
  strength: "Resistance Training",
  ab: "Ab Training",
  balance: "Balance and Core Training",
  mobility: "Mobility Training",
};

interface DayCardProps {
  day: string;
  defaultTitle: string;
  data?: DayWorkout;
  onUpdate: (day: string, data: DayWorkout) => void;
  onSave: (day: string, data: DayWorkout) => Promise<void>;
  copiedDay: DayWorkout | null;
  setCopiedDay: (d: DayWorkout | null) => void;
  copiedExercise: Exercise | null;
  setCopiedExercise: (e: Exercise | null) => void;
  exerciseLists: Record<string, string[]>;
  addCustomExercise?: (category: string, item: string) => Promise<void>;
  days: string[];
  onSwap: (targetDay: string, currentDayData: DayWorkout) => Promise<void>;
  syncDailyTraining?: (isCompleted: boolean) => void;
}

const DayCard = ({
  day,
  defaultTitle,
  data,
  onUpdate,
  onSave,
  copiedDay,
  setCopiedDay,
  copiedExercise,
  setCopiedExercise,
  exerciseLists,
  addCustomExercise,
  days,
  onSwap,
  syncDailyTraining,
}: DayCardProps) => {
  const [localData, setLocalData] = useState<DayWorkout>(() => ({
    title: data?.title || defaultTitle,
    exercises: normalizeSavedExercises(data),
    additionalNotes: data?.additionalNotes || "",
  }));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deleteExerciseIndex, setDeleteExerciseIndex] = useState<number | null>(
    null,
  );
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showClearDayConfirm, setShowClearDayConfirm] = useState(false);
  const [showPasteDayConfirm, setShowPasteDayConfirm] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showUncheckAllConfirm, setShowUncheckAllConfirm] = useState(false);
  const [scrollToExercise, setScrollToExercise] = useState<string | null>(null);

  // Safety mechanism to guarantee data saves to Firebase if you immediately switch tabs
  // before the 1-second debounce timeout finishes.
  const latestDataRef = useRef(localData);
  const latestSaveRef = useRef(onSave);
  useEffect(() => {
    latestDataRef.current = localData;
  }, [localData]);
  useEffect(() => {
    latestSaveRef.current = onSave;
  }, [onSave]);
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        latestSaveRef.current(day, latestDataRef.current);
      }
    };
  }, [day]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalData({
      title: data?.title || defaultTitle,
      exercises: normalizeSavedExercises(data),
      additionalNotes: data?.additionalNotes || "",
    });
  }, [data, defaultTitle]);

  const prevCompletedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      new Date(),
    );
    if (day !== today || !syncDailyTraining) return;

    const hasExercises = localData.exercises.length > 0;
    const allCompleted =
      hasExercises && localData.exercises.every((ex) => ex.completed);

    if (
      prevCompletedRef.current !== null &&
      prevCompletedRef.current !== allCompleted
    ) {
      syncDailyTraining(allCompleted);
    }

    prevCompletedRef.current = allCompleted;
  }, [localData.exercises, day, syncDailyTraining]);

  // Smoothly scroll to the target exercise after it has been added or moved
  useEffect(() => {
    if (scrollToExercise) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`exercise-${scrollToExercise}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        setScrollToExercise(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [scrollToExercise, localData.exercises]);

  const handleChange = (updater: (prev: DayWorkout) => DayWorkout) => {
    const newData = updater(localData);
    setLocalData(newData);
    onUpdate(day, newData);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(day, newData);
      debounceRef.current = null;
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange((prev) => ({ ...prev, title: e.target.value }));

  const handleAdditionalNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    handleChange((prev) => ({ ...prev, additionalNotes: e.target.value }));

  const handleCopyDay = () => {
    setCopiedDay(localData);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const confirmPasteDay = () => {
    if (!copiedDay) return;
    const newExercises = copiedDay.exercises.map((ex) => ({
      ...ex,
      id: generateId(),
      completed: false,
      sets: ex.sets.map((s) => ({ ...s, id: generateId(), completed: false })),
    }));
    handleChange((prev) => ({
      ...prev,
      title: copiedDay.title,
      exercises: newExercises,
      additionalNotes: copiedDay.additionalNotes,
    }));
    setShowPasteDayConfirm(false);
  };

  const handleClearDay = () => {
    handleChange((prev) => ({
      ...prev,
      title: "",
      exercises: [],
      additionalNotes: "",
    }));
    setShowClearDayConfirm(false);
  };

  const handleUncheckAll = () => {
    handleChange((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        completed: false,
        sets: ex.sets.map((s) => ({ ...s, completed: false })),
      })),
    }));
    setShowUncheckAllConfirm(false);
  };

  const handleConfirmSwap = async (targetDay: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await onSwap(targetDay, localData);
    setShowSwapModal(false);
  };

  const addExerciseAt = (index: number, exToInsert?: Exercise) => {
    const newId = generateId();
    handleChange((prev) => {
      const arr = [...prev.exercises];
      const newEx = exToInsert
        ? {
            ...exToInsert,
            id: newId,
            completed: false,
            sets: exToInsert.sets.map((s) => ({
              ...s,
              id: generateId(),
              completed: false,
            })),
          }
        : { ...emptyExercise(), id: newId };
      arr.splice(index, 0, newEx);
      return { ...prev, exercises: arr };
    });
    setScrollToExercise(newId);
  };

  const confirmRemoveExercise = () => {
    if (deleteExerciseIndex === null) return;
    handleChange((prev) => {
      const arr = [...prev.exercises];
      arr.splice(deleteExerciseIndex, 1);
      return { ...prev, exercises: arr };
    });
    setDeleteExerciseIndex(null);
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    let targetId: string | null = null;
    handleChange((prev) => {
      const arr = [...prev.exercises];
      if (index + direction < 0 || index + direction >= arr.length) return prev;
      targetId = arr[index].id;
      const temp = arr[index];
      arr[index] = arr[index + direction];
      arr[index + direction] = temp;
      return { ...prev, exercises: arr };
    });
    if (targetId) {
      setScrollToExercise(targetId);
    }
  };

  const toggleExerciseCompletion = (eIdx: number) => {
    handleChange((prev) => {
      const arr = [...prev.exercises];
      const ex = arr[eIdx];
      const newCompleted = !ex.completed;
      const newSets = ex.sets.map((s) => ({ ...s, completed: newCompleted }));
      arr[eIdx] = { ...ex, completed: newCompleted, sets: newSets };
      return { ...prev, exercises: arr };
    });
  };

  const updateExercise = <K extends keyof Exercise>(
    eIdx: number,
    field: K,
    value: Exercise[K],
  ) => {
    handleChange((prev) => {
      const arr = [...prev.exercises];
      arr[eIdx] = { ...arr[eIdx], [field]: value } as Exercise;
      return { ...prev, exercises: arr };
    });
  };

  const addSet = (eIdx: number) => {
    handleChange((prev) => {
      const arr = [...prev.exercises];
      const sets = arr[eIdx].sets;
      const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;
      const newSet = emptySet();
      if (lastSet) {
        newSet.weight = lastSet.weight;
        newSet.reps = lastSet.reps;
        newSet.duration = lastSet.duration;
        newSet.durationUnit = lastSet.durationUnit || "min";
      }
      arr[eIdx] = { ...arr[eIdx], sets: [...sets, newSet], completed: false };
      return { ...prev, exercises: arr };
    });
  };

  const updateSet = <K extends keyof WorkoutSet>(
    eIdx: number,
    sIdx: number,
    field: K,
    value: WorkoutSet[K],
  ) => {
    handleChange((prev) => {
      const arr = [...prev.exercises];
      const sets = [...arr[eIdx].sets];
      sets[sIdx] = { ...sets[sIdx], [field]: value } as WorkoutSet;

      let exerciseCompleted = arr[eIdx].completed;
      if (field === "completed") {
        exerciseCompleted = sets.length > 0 && sets.every((s) => s.completed);
      }

      arr[eIdx] = {
        ...arr[eIdx],
        sets,
        completed: exerciseCompleted,
      } as Exercise;
      return { ...prev, exercises: arr };
    });
  };

  const removeSet = (eIdx: number, sIdx: number) => {
    handleChange((prev) => {
      const arr = [...prev.exercises];
      const sets = [...arr[eIdx].sets];
      sets.splice(sIdx, 1);
      const exerciseCompleted =
        sets.length > 0 && sets.every((s) => s.completed);
      arr[eIdx] = { ...arr[eIdx], sets, completed: exerciseCompleted };
      return { ...prev, exercises: arr };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
            {day}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Activity className="w-3 h-3" /> {localData.exercises.length}{" "}
            exercises
          </span>
        </div>
        <div className="flex-grow max-w-md">
          <input
            type="text"
            value={localData.title}
            onChange={handleTitleChange}
            placeholder="Workout Focus (e.g. Pull Day)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-bold text-center text-slate-900 focus:ring-2 focus:border-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyDay}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors flex-1 md:flex-auto"
          >
            {showCopyFeedback ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {showCopyFeedback ? "Copied!" : "Copy Day"}
          </button>
          <button
            onClick={() => setShowPasteDayConfirm(true)}
            disabled={!copiedDay}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 md:flex-auto"
          >
            <Clipboard className="w-4 h-4" /> Paste
          </button>
          <button
            onClick={() => setShowSwapModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-violet-600 hover:bg-violet-100 transition-colors flex-1 md:flex-auto"
          >
            <ArrowLeftRight className="w-4 h-4" /> Swap
          </button>
          <button
            onClick={() => setShowUncheckAllConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors flex-1 md:flex-auto"
          >
            <RotateCcw className="w-4 h-4" /> Uncheck All
          </button>
          <button
            onClick={() => setShowClearDayConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors flex-1 md:flex-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear Day
          </button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {localData.exercises.map((ex, index) => {
          const isStrength = ex.type === "strength";
          const isCardio = ex.type === "cardio";
          const isOther = !isStrength && !isCardio;

          const currentWeightType = ex.weightType || "weight";
          const currentTrackingType = ex.trackingType || "reps";

          const showWeight =
            isStrength || (isOther && currentWeightType === "weight");
          const showReps =
            isStrength || (isOther && currentTrackingType === "reps");
          const showDuration =
            isCardio || (isOther && currentTrackingType === "duration");

          return (
            <div
              key={ex.id}
              id={`exercise-${ex.id}`}
              className={`border rounded-2xl shadow-sm transition-all duration-300 ${
                ex.completed
                  ? "border-emerald-200 bg-emerald-50/40 opacity-75"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Exercise Header */}
              <div className="bg-slate-50 rounded-t-2xl p-3 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border-b border-slate-200">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:flex-1">
                  <button
                    onClick={() => toggleExerciseCompletion(index)}
                    title={ex.completed ? "Mark incomplete" : "Mark complete"}
                    className={`group relative flex-shrink-0 transition-colors ${
                      ex.completed
                        ? "text-emerald-500"
                        : "text-slate-300 hover:text-emerald-500"
                    }`}
                  >
                    {ex.completed ? (
                      <CheckCircle className="w-6 h-6 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      {ex.completed ? "Mark incomplete" : "Mark complete"}
                    </span>
                  </button>
                  <select
                    value={ex.type}
                    onChange={(e) => {
                      const newType = e.target.value as Exercise["type"];
                      if (newType !== ex.type) {
                        handleChange((prev) => {
                          const arr = [...prev.exercises];
                          arr[index] = {
                            ...arr[index],
                            type: newType,
                            name: "", // Automatically clear name when changing category type
                          } as Exercise;
                          return { ...prev, exercises: arr };
                        });
                      }
                    }}
                    className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="ab">Ab</option>
                    <option value="balance">Balance</option>
                    <option value="mobility">Mobility</option>
                  </select>

                  {isOther && (
                    <>
                      <select
                        value={ex.trackingType || "reps"}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "trackingType",
                            e.target.value as Exercise["trackingType"],
                          )
                        }
                        className="bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] font-bold text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option value="reps">Reps</option>
                        <option value="duration">Duration</option>
                      </select>
                      <select
                        value={ex.weightType || "weight"}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "weightType",
                            e.target.value as Exercise["weightType"],
                          )
                        }
                        className="bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] font-bold text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option value="weight">Weighted</option>
                        <option value="bodyweight">Bodyweight</option>
                      </select>
                    </>
                  )}

                  <div className="relative flex-1 w-full">
                    <input
                      list={`library-${ex.type}`}
                      value={ex.name}
                      onChange={(e) =>
                        updateExercise(index, "name", e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      placeholder="Exercise Name..."
                      className="w-full bg-white border border-slate-200 p-2.5 pr-10 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[200px] text-ellipsis"
                    />
                    {ex.name && (
                      <button
                        onClick={() => updateExercise(index, "name", "")}
                        title="Clear"
                        className="group absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                          Clear
                        </span>
                      </button>
                    )}
                  </div>
                  {ex.name.trim() !== "" &&
                    !exerciseLists[ex.type].some(
                      (i) => i === normalizeItem(ex.name),
                    ) &&
                    addCustomExercise && (
                      <button
                        onClick={() => {
                          const normalized = normalizeItem(ex.name);
                          addCustomExercise(CATEGORY_MAP[ex.type], normalized);
                          updateExercise(index, "name", normalized);
                        }}
                        className="px-3 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        Save to Library
                      </button>
                    )}
                </div>
                <div className="flex items-center gap-1 w-full md:w-auto justify-end flex-shrink-0">
                  <button
                    onClick={() => addExerciseAt(index)}
                    title="Add Above"
                    className="group relative p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Add Above
                    </span>
                  </button>
                  <button
                    disabled={index === 0}
                    onClick={() => moveExercise(index, -1)}
                    title="Move Up"
                    className="group relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Move Up
                    </span>
                  </button>
                  <button
                    disabled={index === localData.exercises.length - 1}
                    onClick={() => moveExercise(index, 1)}
                    title="Move Down"
                    className="group relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Move Down
                    </span>
                  </button>
                  <button
                    onClick={() => setCopiedExercise(ex)}
                    title="Copy"
                    className="group relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Copy
                    </span>
                  </button>
                  <button
                    disabled={!copiedExercise}
                    onClick={() => addExerciseAt(index + 1, copiedExercise!)}
                    title="Paste Below"
                    className="group relative p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Paste Below
                    </span>
                  </button>
                  <button
                    onClick={() => setDeleteExerciseIndex(index)}
                    title="Delete"
                    className="group relative p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="pointer-events-none absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                      Delete
                    </span>
                  </button>
                </div>
              </div>

              {/* Sets & Notes */}
              <div className="p-4 space-y-3 bg-white">
                {/* Columns Header */}
                <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  <div className="col-span-2 md:col-span-1">Set</div>
                  {showWeight && (
                    <div
                      className={
                        showReps || showDuration
                          ? "col-span-4 md:col-span-5"
                          : "col-span-8 md:col-span-10"
                      }
                    >
                      Weight (lbs)
                    </div>
                  )}
                  {showReps && (
                    <div
                      className={
                        showWeight
                          ? "col-span-4 md:col-span-5"
                          : "col-span-8 md:col-span-10"
                      }
                    >
                      Reps
                    </div>
                  )}
                  {showDuration && (
                    <div
                      className={
                        showWeight
                          ? "col-span-4 md:col-span-5"
                          : "col-span-8 md:col-span-10"
                      }
                    >
                      Duration
                    </div>
                  )}
                  <div className="col-span-2 md:col-span-1"></div>
                </div>

                {ex.sets.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          updateSet(index, sIdx, "completed", !set.completed)
                        }
                        className={`transition-colors ${
                          set.completed
                            ? "text-emerald-500"
                            : "text-slate-300 hover:text-emerald-400"
                        }`}
                      >
                        {set.completed ? (
                          <CheckCircle className="w-4 h-4 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-center text-xs font-bold text-slate-400">
                        {sIdx + 1}
                      </span>
                    </div>
                    {showWeight && (
                      <div
                        className={
                          showReps || showDuration
                            ? "col-span-4 md:col-span-5"
                            : "col-span-8 md:col-span-10"
                        }
                      >
                        <input
                          type="text"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSet(index, sIdx, "weight", e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="e.g. 135"
                        />
                      </div>
                    )}
                    {showReps && (
                      <div
                        className={
                          showWeight
                            ? "col-span-4 md:col-span-5"
                            : "col-span-8 md:col-span-10"
                        }
                      >
                        <input
                          type="text"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(index, sIdx, "reps", e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="e.g. 10"
                        />
                      </div>
                    )}
                    {showDuration && (
                      <div
                        className={`${showWeight ? "col-span-4 md:col-span-5" : "col-span-8 md:col-span-10"} flex gap-1`}
                      >
                        <input
                          type="text"
                          value={set.duration || ""}
                          onChange={(e) =>
                            updateSet(index, sIdx, "duration", e.target.value)
                          }
                          className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="e.g. 30"
                        />
                        <select
                          value={set.durationUnit || "min"}
                          onChange={(e) =>
                            updateSet(
                              index,
                              sIdx,
                              "durationUnit",
                              e.target.value as WorkoutSet["durationUnit"],
                            )
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value="min">min</option>
                          <option value="sec">sec</option>
                        </select>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <button
                        onClick={() => removeSet(index, sIdx)}
                        title="Delete Set"
                        className="group relative p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="pointer-events-none absolute bottom-full mb-1 right-0 md:left-1/2 md:-translate-x-1/2 w-max rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 z-[100]">
                          Delete Set
                        </span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center pt-1">
                  <button
                    onClick={() => addSet(index)}
                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Set
                  </button>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={(e) =>
                      updateExercise(index, "notes", e.target.value)
                    }
                    placeholder="Exercise notes..."
                    className="w-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => addExerciseAt(localData.exercises.length)}
          className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-200 transition-colors flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Exercise
        </button>
      </div>

      {/* Additional Notes Box */}
      <textarea
        value={localData.additionalNotes}
        onChange={handleAdditionalNotes}
        placeholder="Additional notes for this day (e.g. felt great, energy was high)..."
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none min-h-[100px] shadow-sm"
      />

      <ConfirmModal
        isOpen={deleteExerciseIndex !== null}
        title="Delete Exercise"
        message="Are you sure you want to remove this exercise and all its sets?"
        onConfirm={confirmRemoveExercise}
        onCancel={() => setDeleteExerciseIndex(null)}
      />

      <ConfirmModal
        isOpen={showPasteDayConfirm}
        title={`Overwrite ${day}?`}
        message={`Are you sure you want to overwrite ${day}'s workout? This will permanently replace your current exercises and notes for this day.`}
        onConfirm={confirmPasteDay}
        onCancel={() => setShowPasteDayConfirm(false)}
        confirmText="Overwrite"
      />

      <ConfirmModal
        isOpen={showClearDayConfirm}
        title={`Clear ${day}`}
        message={`Are you sure you want to clear all workouts and notes for ${day}? This action cannot be undone.`}
        onConfirm={handleClearDay}
        onCancel={() => setShowClearDayConfirm(false)}
      />

      <ConfirmModal
        isOpen={showUncheckAllConfirm}
        title={`Uncheck All`}
        message={`Are you sure you want to mark all exercises as incomplete for ${day}?`}
        onConfirm={handleUncheckAll}
        onCancel={() => setShowUncheckAllConfirm(false)}
        confirmText="Uncheck All"
      />

      <SwapDayModal
        isOpen={showSwapModal}
        currentDay={day}
        days={days}
        onConfirm={handleConfirmSwap}
        onCancel={() => setShowSwapModal(false)}
      />
    </div>
  );
};

const WeeklyTraining: React.FC<WeeklyTrainingProps> = ({
  workoutDetails,
  setWorkoutDetails,
  updateWorkoutDetail,
  resetWeekly,
  customExercises,
  removedExercises = {},
  clipboard = { day: null, exercise: null },
  updateClipboard,
  addCustomExercise,
  syncDailyTraining,
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
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      new Date(),
    );
    return days.includes(today) ? today : "Monday";
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUncheckAllWeekConfirm, setShowUncheckAllWeekConfirm] =
    useState(false);

  const copiedDay = clipboard.day;
  const copiedExercise = clipboard.exercise;
  const setCopiedDay = (day: DayWorkout | null) => updateClipboard?.({ day });
  const setCopiedExercise = (exercise: Exercise | null) =>
    updateClipboard?.({ exercise });

  // Map the internal types to the datalist keys
  const exerciseLists = useMemo(() => {
    const lists: Record<string, string[]> = {
      cardio: [],
      strength: [],
      ab: [],
      balance: [],
      mobility: [],
    };

    (Object.keys(CATEGORY_MAP) as (keyof typeof CATEGORY_MAP)[]).forEach(
      (key) => {
        const catName = CATEGORY_MAP[key];
        const defaults = (exerciseLibrary[catName] || []).map(normalizeItem);
        const customs = (customExercises?.[catName] || []).map(normalizeItem);
        const removed = (removedExercises[catName] || []).map(normalizeItem);
        lists[key] = Array.from(new Set([...defaults, ...customs]))
          .filter((ex) => !removed.includes(ex))
          .sort();
      },
    );
    return lists;
  }, [customExercises, removedExercises]);

  const handleResetConfirm = async () => {
    await resetWeekly("tasks");
    setShowResetConfirm(false);
  };

  const handleUncheckAllWeekConfirm = async () => {
    const newDetails = { ...workoutDetails };
    const updatePromises: Promise<void>[] = [];

    for (const day of Object.keys(newDetails)) {
      let dayChanged = false;
      const updatedExercises = (newDetails[day].exercises || []).map((ex) => {
        let setChanged = false;
        const updatedSets = ex.sets.map((s) => {
          if (s.completed) {
            setChanged = true;
            return { ...s, completed: false };
          }
          return s;
        });

        if (ex.completed || setChanged) {
          dayChanged = true;
          return { ...ex, completed: false, sets: updatedSets };
        }
        return ex;
      });

      if (dayChanged) {
        newDetails[day] = {
          ...newDetails[day],
          exercises: updatedExercises,
        };
        updatePromises.push(updateWorkoutDetail(day, newDetails[day]));
      }
    }

    setWorkoutDetails(newDetails);
    await Promise.all(updatePromises);
    setShowUncheckAllWeekConfirm(false);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              <Calendar className="w-6 h-6 text-blue-400" /> Weekly Training
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Log your workouts for the week
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowUncheckAllWeekConfirm(true)}
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors bg-slate-800 border border-slate-700 hover:border-amber-400/30 px-4 py-2.5 rounded-xl flex-1 md:flex-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Uncheck Week
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 border border-slate-700 hover:border-rose-400/30 px-4 py-2.5 rounded-xl flex-1 md:flex-auto"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset Week
            </button>
          </div>
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
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 hover:text-slate-900"
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
          copiedDay={copiedDay}
          setCopiedDay={setCopiedDay}
          copiedExercise={copiedExercise}
          setCopiedExercise={setCopiedExercise}
          exerciseLists={exerciseLists}
          addCustomExercise={addCustomExercise}
          days={days}
          onSwap={async (targetDay, currentDayData) => {
            const targetData = workoutDetails[targetDay] || {
              title: "",
              exercises: [],
              additionalNotes: "",
            };
            setWorkoutDetails((prev) => ({
              ...prev,
              [selectedDay]: targetData,
              [targetDay]: currentDayData,
            }));
            await updateWorkoutDetail(selectedDay, targetData);
            await updateWorkoutDetail(targetDay, currentDayData);
          }}
          syncDailyTraining={syncDailyTraining}
        />
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Weekly Training"
        message="Are you sure you want to clear all workouts for the week? This action cannot be undone."
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        isOpen={showUncheckAllWeekConfirm}
        title="Uncheck Entire Week"
        message="Are you sure you want to mark all exercises as incomplete for the entire week?"
        onConfirm={handleUncheckAllWeekConfirm}
        onCancel={() => setShowUncheckAllWeekConfirm(false)}
        confirmText="Uncheck Week"
      />

      {Object.entries(exerciseLists).map(([key, list]) => (
        <datalist key={key} id={`library-${key}`}>
          {list.map((ex) => (
            <option key={ex} value={ex} />
          ))}
        </datalist>
      ))}
    </div>
  );
};

export default WeeklyTraining;
