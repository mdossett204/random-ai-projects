import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Leaf,
  Dumbbell,
  Brain,
  Zap,
  ShieldCheck,
  Clock,
  Wind,
  Activity,
  Droplets,
  Moon,
  Info,
  ChevronRight,
  TrendingUp,
  Scale,
  Soup,
  Coffee,
  Heart,
  Waves,
  ArrowRight,
  Footprints,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Target,
  Utensils,
  Beaker,
  ShoppingBag,
  Search,
  RotateCcw,
  Minus,
  LogIn,
  Link2,
  LogOut,
  User,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  linkWithPopup,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// --- DATABASE CONFIG ---
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
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
  typeof __app_id !== "undefined" ? __app_id : "master-longevity-dashboard";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [loading, setLoading] = useState(true);

  // Default Constants
  const defaultRituals = {
    fishOil: false,
    vitaminD3: false,
    mgGlycinate: false,
    boxBreathing: false,
  };

  const defaultDailyData = {
    steps: 0,
    waterCups: 0,
    creatine: 0,
    protein: 0,
    fatGrams: 0,
    fiber: 0,
    rituals: defaultRituals,
  };

  // Application State
  const [dailyData, setDailyData] = useState(defaultDailyData);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [weeklyPlants, setWeeklyPlants] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState({});
  const [newPlant, setNewPlant] = useState("");

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const datestamp = new Date().toISOString().split("T")[0];

  const scheduleTitles = {
    Monday: "Arm and Glute training",
    Tuesday: "VO2 max training (4x4 protocol)",
    Wednesday: "Core and Balance Training",
    Thursday: "Shoulder and Glute training",
    Friday: "Heavy leg and back training",
    Saturday: "Sprint intervals (30sec/2 min off)",
    Sunday: "Heavy leg and chest training",
  };

  const foodLibrary = {
    "Spices & Herbs": [
      "Sumac",
      "Fennel Seeds",
      "Caraway Seeds",
      "Black Poppy Seeds",
      "Sesame Seeds",
      "Black Pepper",
      "Ginger",
      "Cardamon",
      "Mustard Seeds",
      "Cinnamon",
      "Nutmeg",
      "Cloves",
      "Cumin",
      "Oregano",
      "Basil",
      "Thyme",
      "Parsley",
      "Red Pepper Flakes",
      "Cayenne Pepper",
      "Paprika",
    ],
    Vegetables: [
      "Onion",
      "Garlic",
      "Olives",
      "Avocado",
      "Sweet Potato",
      "Okra",
      "Cauliflower",
      "Broccoli",
      "Artichokes",
      "Heart Of Palm",
      "Asparagus",
      "Mushrooms",
      "Arugula",
      "Spring Mix",
      "Radicchio",
      "Radish",
      "Cabbage",
      "Endives",
      "Brussel Sprouts",
    ],
    Fruits: [
      "Pomegranate",
      "Blueberries",
      "Raspberries",
      "Strawberries",
      "Blackberries",
      "Black Cherries",
      "Lemon",
    ],
    Fermented: [
      "Natto",
      "Miso",
      "Kimchi",
      "Sauerkraut",
      "Apple Cider Vinegar",
      "Seaweed",
    ],
    "Nuts/Seeds": [
      "Walnuts",
      "Brazil Nuts",
      "Pistachio",
      "Flax Seeds",
      "Hemp Seeds",
      "Cacao Powder",
    ],
    Beverages: ["Black Tea", "Coffee", "Green Tea", "Mint Tea"],
  };

  const masterPlantList = useMemo(() => {
    const list = new Set();
    Object.values(foodLibrary).forEach((cat) =>
      cat.forEach((item) => list.add(item)),
    );
    return Array.from(list).sort();
  }, []);

  // --- AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
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
          const d = s.data();
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
      setWorkoutDetails(s.exists() ? s.data() : {}),
    );

    return () => {
      unsubDaily();
      unsubTasks();
      unsubPlants();
      unsubDetails();
    };
  }, [user, datestamp]);

  // --- ACTIONS ---
  const updateDaily = async (updates) => {
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
    ["steps", "protein", "fatGrams", "fiber", "waterCups", "creatine"].forEach(
      (k) => {
        if (k in sanitized) sanitized[k] = Math.max(0, sanitized[k]);
      },
    );
    await setDoc(dailyRef, { ...dailyData, ...sanitized }, { merge: true });
  };

  const toggleTask = async (day) => {
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

  const updateWorkoutDetail = async (day, text) => {
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

  const addPlant = async (p) => {
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

  const removePlant = async (p) => {
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

  const resetWeekly = async (type) => {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-xl text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
            Master Longevity
          </h1>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
            Session inactive. Sign in with Google to sync your protocol across
            all your devices.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <LogIn className="w-5 h-5" /> Login with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 text-indigo-600 font-bold mb-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="uppercase tracking-[0.3em] text-xs">
                {todayStr}
              </span>
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

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit mx-auto lg:mx-0">
          {[
            {
              id: "daily",
              label: "Daily Vitals",
              icon: <Clock className="w-4 h-4" />,
            },
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
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === t.id ? "bg-white shadow-md text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* DAILY VITALS TAB */}
            {activeTab === "daily" && (
              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-indigo-600" /> Intake
                    Tracker
                  </h2>
                  <button
                    onClick={() => updateDaily(defaultDailyData)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Day
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                          Protein (120g)
                        </label>
                        <input
                          type="number"
                          value={dailyData.protein}
                          min="0"
                          onChange={(e) =>
                            updateDaily({
                              protein: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                          Fat (42g Floor)
                        </label>
                        <input
                          type="number"
                          value={dailyData.fatGrams}
                          min="0"
                          onChange={(e) =>
                            updateDaily({
                              fatGrams: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-emerald-600 font-bold">
                          Fiber (30g+)
                        </label>
                        <input
                          type="number"
                          value={dailyData.fiber}
                          min="0"
                          onChange={(e) =>
                            updateDaily({
                              fiber: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border border-emerald-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-indigo-600 font-bold">
                          Creatine (Grams)
                        </label>
                        <input
                          type="number"
                          value={dailyData.creatine}
                          min="0"
                          max="25"
                          onChange={(e) =>
                            updateDaily({
                              creatine: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-indigo-600 font-bold tracking-widest">
                        Water (Cups - Target: 18)
                      </label>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                          onClick={() =>
                            updateDaily({
                              waterCups: Math.max(
                                0,
                                (dailyData.waterCups || 0) - 1,
                              ),
                            })
                          }
                          className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-2xl font-black flex-grow text-center tracking-tighter">
                          {dailyData.waterCups} / 18
                        </span>
                        <button
                          onClick={() =>
                            updateDaily({
                              waterCups: (dailyData.waterCups || 0) + 1,
                            })
                          }
                          className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                        Daily Step Goal (10k)
                      </label>
                      <input
                        type="number"
                        value={dailyData.steps}
                        min="0"
                        onChange={(e) =>
                          updateDaily({ steps: parseInt(e.target.value) || 0 })
                        }
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-xl font-black text-emerald-600 flex items-center gap-2 mb-2">
                      <Beaker className="w-5 h-5" /> Daily Rituals
                    </h2>
                    {Object.entries(dailyData.rituals).map(([id, val]) => (
                      <button
                        key={id}
                        onClick={() =>
                          updateDaily({
                            rituals: { ...dailyData.rituals, [id]: !val },
                          })
                        }
                        className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all ${val ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm" : "bg-white border-slate-100 text-slate-500 hover:border-emerald-100"}`}
                      >
                        <span className="text-sm font-bold capitalize">
                          {id === "vitaminD3"
                            ? "Vitamin D3"
                            : id.replace(/([A-Z])/g, " $1")}
                        </span>
                        {val ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-100" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WEEKLY TRAINING ROUTINE TAB */}
            {activeTab === "weekly" && (
              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-indigo-600" /> Training
                    Flow
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
                        className={`p-6 rounded-[2.5rem] border flex flex-col md:flex-row md:items-center gap-6 transition-all ${completed ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"}`}
                      >
                        <div className="w-32 flex-shrink-0">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {day}
                          </span>
                          <button
                            onClick={() => toggleTask(day)}
                            className={`w-full py-2 rounded-xl text-[10px] font-black uppercase transition-all ${completed ? "bg-emerald-500 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200"}`}
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
                            onBlur={(e) =>
                              updateWorkoutDetail(day, e.target.value)
                            }
                            placeholder="Enter exercises, weights, or notes here..."
                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[80px] shadow-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PLANT TRACKER TAB */}
            {activeTab === "diversity" && (
              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-emerald-500" /> Species
                    Diversity
                  </h2>
                  <button
                    onClick={() => resetWeekly("plants")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Week
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addPlant(newPlant);
                    setNewPlant("");
                  }}
                  className="flex gap-2 mb-10"
                >
                  <input
                    type="text"
                    value={newPlant}
                    onChange={(e) => setNewPlant(e.target.value)}
                    placeholder="Add a unique plant variety (e.g. Radicchio, Buckwheat, Turmeric)..."
                    className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-10">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                      Your Active Plant List
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {weeklyPlants.map((p) => (
                        <div
                          key={p}
                          className="p-3 rounded-xl text-[10px] font-bold border bg-emerald-600 border-emerald-700 text-white flex items-center justify-between shadow-md group transition-all animate-in fade-in slide-in-from-bottom-1"
                        >
                          <span className="truncate pr-2">{p}</span>
                          <button
                            onClick={() => removePlant(p)}
                            className="p-1 hover:bg-emerald-500 rounded text-emerald-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {weeklyPlants.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-300 italic text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                          No plant species logged yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-slate-400">
                      Master Botanical Selection
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {masterPlantList
                        .filter((p) => !weeklyPlants.includes(p))
                        .map((p) => (
                          <button
                            key={p}
                            onClick={() => addPlant(p)}
                            className="p-3 rounded-xl text-[10px] font-bold border bg-white border-slate-100 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left truncate flex items-center justify-between group"
                          >
                            <span className="truncate">{p}</span>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FOOD LIBRARY TAB */}
            {activeTab === "food" && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-indigo-600" />{" "}
                  Bio-Available Library
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {Object.entries(foodLibrary).map(([cat, items]) => (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                        {cat}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((i) => (
                          <div
                            key={i}
                            className="p-3 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 border border-slate-100"
                          >
                            {i}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRAINING SCIENCE TAB */}
            {activeTab === "science" && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 space-y-8 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-3xl font-black flex items-center gap-3 text-rose-500 tracking-tight">
                  <Target className="w-8 h-8" /> Training Science
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <h5 className="font-black text-indigo-400 uppercase text-xs mb-4 relative z-10 tracking-widest">
                      VO2 Max (Norwegian 4x4)
                    </h5>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed relative z-10 italic">
                      "Stroke Volume is the secret to heart longevity."
                    </p>
                    <p className="text-[11px] text-slate-400 mb-6 leading-relaxed relative z-10">
                      4 mins at 90% HR using Speed Jump Rope or KB Swings.
                      During the 4 min OFF period, perform **Active Recovery**
                      (slow walk + nasal breathing).
                    </p>
                    <Waves className="absolute -bottom-10 -right-10 w-32 h-32 text-indigo-500 opacity-10" />
                  </div>
                  <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 shadow-sm">
                    <h5 className="font-black text-indigo-600 uppercase text-xs mb-4 tracking-widest">
                      SIT & SMR
                    </h5>
                    <p className="text-[11px] text-indigo-900 mb-4 leading-relaxed italic">
                      SIT: 30s All-out Sprint + 2m recovery. SMR
                      (Self-Myofascial Release): Use foam roller for 10m daily
                      to clear fascial kinking.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Sidebar Progress Units */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Protein Goal (120g)
              </span>
              <div className="flex justify-between items-end mt-1">
                <span className="text-2xl font-black tracking-tight">
                  {dailyData.protein ?? 0}g
                </span>
                <span className="text-xs font-bold text-indigo-600 mb-1">
                  {Math.round(((dailyData.protein ?? 0) / 120) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(((dailyData.protein ?? 0) / 120) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
                Fiber Goal (30g)
              </span>
              <div className="flex justify-between items-end mt-1">
                <span className="text-2xl font-black tracking-tight text-emerald-700">
                  {dailyData.fiber ?? 0}g
                </span>
                <span className="text-xs font-bold text-emerald-600 mb-1">
                  {Math.round(((dailyData.fiber ?? 0) / 30) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(((dailyData.fiber ?? 0) / 30) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2 text-emerald-600 font-black tracking-tight">
                  <Leaf className="w-5 h-5" /> <span>Plant Diversity</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-800">
                  {weeklyPlants.length}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min((weeklyPlants.length / 30) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase mt-2">
                <span className="text-slate-400 tracking-tighter">
                  Clinical: 30 Types
                </span>
                <span className="text-emerald-500 tracking-tighter">
                  Elite: 60 Types
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 font-bold">
                <Activity className="w-4 h-4 text-indigo-500" /> Daily Mobility
                Flow
              </h4>
              <ul className="text-[10px] text-slate-600 space-y-4 font-medium leading-relaxed">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
                  <span>SMR / Foam Roll (10m)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
                  <span>Dynamic Stretch Routine</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
                  <span>Stability & Yoga Stretch</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
