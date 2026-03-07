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
import WeeklyTraining from "./components/WeeklyTraining";
import PlantTracker from "./components/PlantTracker";
import FoodLibrary from "./components/FoodLibrary";
import TrainingScience from "./components/TrainingScience";
import SidebarWidgets from "./components/SidebarWidgets";
import { defaultDailyData, defaultRituals, DailyData } from "./data/constants";

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
        apiKey: "AIzaSyBRSDBcueUcc2nWLzzsy-D50NYzkKrls80",
        authDomain: "longevity-dashboard-46509.firebaseapp.com",
        projectId: "longevity-dashboard-46509",
        storageBucket: "longevity-dashboard-46509.firebasestorage.app",
        messagingSenderId: "1021085850822",
        appId: "1:1021085850822:web:aa2bc5ac91551a58780bc7",
        measurementId: "G-JCGHESVWWN",
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
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [weeklyPlants, setWeeklyPlants] = useState<string[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<Record<string, string>>(
    {},
  );

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const datestamp = new Date().toISOString().split("T")[0];

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
    const tasksRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "weeklyTasks",
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
          });
        } else {
          setDailyData(defaultDailyData);
        }
      },
      (err) => console.error("Daily Sync Error:", err),
    );

    const unsubTasks = onSnapshot(
      tasksRef,
      (s) => setCompletedTasks(s.exists() ? s.data().list || [] : []),
      (err) => console.error("Tasks Sync Error:", err),
    );
    const unsubPlants = onSnapshot(
      plantRef,
      (s) => setWeeklyPlants(s.exists() ? s.data().list || [] : []),
      (err) => console.error("Plants Sync Error:", err),
    );
    const unsubDetails = onSnapshot(detailsRef, (s) =>
      setWorkoutDetails(s.exists() ? (s.data() as Record<string, string>) : {}),
    );

    return () => {
      unsubDaily();
      unsubTasks();
      unsubPlants();
      unsubDetails();
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
    (
      [
        "steps",
        "protein",
        "fatGrams",
        "fiber",
        "waterCups",
        "creatine",
      ] as const
    ).forEach((k) => {
      if (k in sanitized && typeof sanitized[k] === "number") {
        sanitized[k] = Math.max(0, sanitized[k] as number);
      }
    });
    await setDoc(dailyRef, sanitized, { merge: true });
  };

  const toggleTask = async (day: string) => {
    if (!user) return;
    const tasksRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "tracking",
      "weeklyTasks",
    );
    const updated = completedTasks.includes(day)
      ? arrayRemove(day)
      : arrayUnion(day);
    await setDoc(tasksRef, { list: updated }, { merge: true });
  };

  const updateWorkoutDetail = async (day: string, text: string) => {
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
    await setDoc(detailsRef, { [day]: text }, { merge: true });
  };

  const addPlant = async (p: string) => {
    const rawInput = p.trim();
    if (!user || !rawInput) return;
    const normalized = rawInput
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    if (
      weeklyPlants.some(
        (existing) => existing.toLowerCase() === normalized.toLowerCase(),
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
    await setDoc(plantRef, { list: arrayUnion(normalized) }, { merge: true });
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
      const tasksRef = doc(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "tracking",
        "weeklyTasks",
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
      await setDoc(tasksRef, { list: [] }, { merge: true });
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-600 font-black tracking-widest uppercase text-xs">
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <Header
          todayStr={todayStr}
          dailyData={dailyData}
          weeklyPlants={weeklyPlants}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* DAILY VITALS TAB */}
            {activeTab === "daily" && (
              <DailyVitals dailyData={dailyData} updateDaily={updateDaily} />
            )}

            {/* WEEKLY TRAINING ROUTINE TAB */}
            {activeTab === "weekly" && (
              <WeeklyTraining
                completedTasks={completedTasks}
                toggleTask={toggleTask}
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
            {activeTab === "food" && <FoodLibrary />}

            {/* TRAINING SCIENCE TAB */}
            {activeTab === "science" && <TrainingScience />}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Sidebar Progress Units */}
            <SidebarWidgets dailyData={dailyData} weeklyPlants={weeklyPlants} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
