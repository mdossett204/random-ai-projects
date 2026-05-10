import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
// Components
import Header from "./components/Header";
import LoginView from "./components/LoginView";
import Navigation from "./components/Navigation";
import DailyVitals from "./components/DailyVitals";
import WeeklyTraining, { DayWorkout } from "./components/WeeklyTraining";
import PlantTracker from "./components/PlantTracker";
import FoodLibrary from "./components/FoodLibrary";
import ExerciseLibrary from "./components/ExerciseLibrary";
import {
  defaultDailyData,
  defaultRituals,
  defaultMobility,
  DailyData,
} from "./data/constants";

// Global window augmentation for Firebase config
declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

// --- DATABASE CONFIG ---
const firebaseConfig =
  typeof window !== "undefined" && window.__firebase_config
    ? JSON.parse(window.__firebase_config)
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId =
  typeof window !== "undefined" && window.__app_id
    ? window.__app_id
    : "master-longevity-dashboard";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [loading, setLoading] = useState<boolean>(true);

  // Application State
  const [dailyData, setDailyData] = useState<DailyData>(defaultDailyData);
  const [weeklyPlants, setWeeklyPlants] = useState<string[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<
    Record<string, DayWorkout>
  >({});

  const [customFoods, setCustomFoods] = useState<Record<string, string[]>>({});
  const [removedFoods, setRemovedFoods] = useState<Record<string, string[]>>(
    {},
  );
  const [customExercises, setCustomExercises] = useState<
    Record<string, string[]>
  >({});
  const [removedExercises, setRemovedExercises] = useState<
    Record<string, string[]>
  >({});

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.toDateString() !== currentDate.toDateString()) {
        setCurrentDate(now);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentDate]);

  const todayStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const datestamp = `${year}-${month}-${day}`;

  // --- AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== "undefined" && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Failed:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setDailyData(defaultDailyData);
      setWeeklyPlants([]);
      setWorkoutDetails({});
      setActiveTab("daily");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;
    const dailyRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "dailyStats",
      datestamp,
    );
    const plantRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "weeklyPlants",
    );
    const detailsRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "workoutDetails",
    );

    const unsubDaily = onSnapshot(
      dailyRef,
      (s) => {
        if (s.exists()) {
          const d = s.data() as Partial<DailyData>;
          setDailyData({
            ...defaultDailyData,
            ...d,
            rituals: { ...defaultRituals, ...(d.rituals || {}) },
            mobility: { ...defaultMobility, ...(d.mobility || {}) },
          });
        } else {
          setDailyData(defaultDailyData);
        }
      },
      (err) => console.error("Daily Sync Error:", err),
    );

    const unsubPlants = onSnapshot(
      plantRef,
      (s) => setWeeklyPlants(s.exists() ? s.data().list || [] : []),
      (err) => console.error("Plants Sync Error:", err),
    );
    const unsubDetails = onSnapshot(detailsRef, (s) =>
      setWorkoutDetails(
        s.exists() ? (s.data() as Record<string, DayWorkout>) : {},
      ),
    );

    const libraryRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "library",
    );
    const unsubLibrary = onSnapshot(
      libraryRef,
      (s) => {
        if (s.exists()) {
          const data = s.data();
          setCustomFoods(data.foods || {});
          setRemovedFoods(data.removedFoods || {});
          setCustomExercises(data.exercises || {});
          setRemovedExercises(data.removedExercises || {});
        } else {
          setCustomFoods({});
          setRemovedFoods({});
          setCustomExercises({});
          setRemovedExercises({});
        }
      },
      (err) => console.error("Library Sync Error:", err),
    );

    return () => {
      unsubDaily();
      unsubPlants();
      unsubDetails();
      unsubLibrary();
    };
  }, [user, datestamp]);

  // --- ACTIONS ---
  const updateDaily = async (updates: Partial<DailyData>) => {
    if (!user) return;
    const dailyRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "dailyStats",
      datestamp,
    );
    const sanitized = { ...updates };
    await setDoc(dailyRef, sanitized, { merge: true });
  };

  const updateWorkoutDetail = async (day: string, data: DayWorkout) => {
    if (!user) return;
    const detailsRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "workoutDetails",
    );
    await setDoc(detailsRef, { [day]: data }, { merge: true });
  };

  const addPlant = async (p: string) => {
    const rawInput = p.trim();
    if (!user || !rawInput) return;
    if (
      weeklyPlants.some(
        (existing) => existing.toLowerCase() === rawInput.toLowerCase(),
      )
    )
      return;
    const plantRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "weeklyPlants",
    );
    await setDoc(plantRef, { list: arrayUnion(rawInput) }, { merge: true });
  };

  const removePlant = async (p: string) => {
    if (!user) return;
    const plantRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "weeklyPlants",
    );
    await setDoc(plantRef, { list: arrayRemove(p) }, { merge: true });
  };

  const resetWeekly = async (type: "tasks" | "plants") => {
    if (!user) return;
    if (type === "tasks") {
      const detailsRef = doc(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "tracking",
        "workoutDetails",
      );
      await setDoc(detailsRef, {}, { merge: false });
    } else {
      const ref = doc(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "tracking",
        "weeklyPlants",
      );
      await setDoc(ref, { list: [] }, { merge: true });
    }
  };

  const addCustomFood = async (category: string, item: string) => {
    if (!user) return;
    const updated = { ...customFoods };
    const removed = { ...removedFoods };
    if (removed[category]) {
      removed[category] = removed[category].filter((i) => i !== item);
    }
    if (!updated[category]) updated[category] = [];
    if (!updated[category].includes(item)) {
      updated[category] = [...updated[category], item];
    }
    const ref = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "library",
    );
    await setDoc(
      ref,
      { foods: updated, removedFoods: removed },
      { merge: true },
    );
  };

  const removeCustomFood = async (category: string, item: string) => {
    if (!user) return;
    const updated = { ...customFoods };
    const removed = { ...removedFoods };
    if (updated[category]) {
      updated[category] = updated[category].filter((i) => i !== item);
    }
    if (!removed[category]) removed[category] = [];
    if (!removed[category].includes(item)) {
      removed[category] = [...removed[category], item];
    }
    const ref = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "library",
    );
    await setDoc(
      ref,
      { foods: updated, removedFoods: removed },
      { merge: true },
    );
  };

  const addCustomExercise = async (category: string, item: string) => {
    if (!user) return;
    const updated = { ...customExercises };
    const removed = { ...removedExercises };
    if (removed[category]) {
      removed[category] = removed[category].filter((i) => i !== item);
    }
    if (!updated[category]) updated[category] = [];
    if (!updated[category].includes(item)) {
      updated[category] = [...updated[category], item];
    }
    const ref = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "library",
    );
    await setDoc(
      ref,
      { exercises: updated, removedExercises: removed },
      { merge: true },
    );
  };

  const removeCustomExercise = async (category: string, item: string) => {
    if (!user) return;
    const updated = { ...customExercises };
    const removed = { ...removedExercises };
    if (updated[category]) {
      updated[category] = updated[category].filter((i) => i !== item);
    }
    if (!removed[category]) removed[category] = [];
    if (!removed[category].includes(item)) {
      removed[category] = [...removed[category], item];
    }
    const ref = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "library",
    );
    await setDoc(
      ref,
      { exercises: updated, removedExercises: removed },
      { merge: true },
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-600/20 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">
            Syncing Protocol...
          </p>
        </div>
      </div>
    );

  // --- LOGIN VIEW ---
  if (!user) {
    return <LoginView handleLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <Header
          todayStr={todayStr}
          weeklyPlants={weeklyPlants}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="w-full">
          {/* DAILY ROUTINE TAB */}
          {activeTab === "daily" && (
            <DailyVitals dailyData={dailyData} updateDaily={updateDaily} />
          )}

          {/* WEEKLY TRAINING ROUTINE TAB */}
          {activeTab === "weekly" && (
            <WeeklyTraining
              workoutDetails={workoutDetails}
              setWorkoutDetails={setWorkoutDetails}
              updateWorkoutDetail={updateWorkoutDetail}
              resetWeekly={resetWeekly}
            />
          )}

          {/* PLANT TRACKER TAB */}
          {activeTab === "diversity" && (
            <PlantTracker
              weeklyPlants={weeklyPlants}
              resetWeekly={resetWeekly}
              addPlant={addPlant}
              removePlant={removePlant}
            />
          )}

          {/* FOOD LIBRARY TAB */}
          {activeTab === "food" && (
            <FoodLibrary
              customFoods={customFoods}
              removedFoods={removedFoods}
              addCustomFood={addCustomFood}
              removeCustomFood={removeCustomFood}
            />
          )}

          {/* EXERCISE LIBRARY TAB */}
          {activeTab === "exercises" && (
            <ExerciseLibrary
              customExercises={customExercises}
              removedExercises={removedExercises}
              addCustomExercise={addCustomExercise}
              removeCustomExercise={removeCustomExercise}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
