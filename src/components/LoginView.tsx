// src/components/LoginView.tsx
import React from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface LoginViewProps {
  handleLogin: () => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ handleLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
      <div className="bg-slate-900 rounded-3xl p-10 md:p-12 shadow-2xl border border-slate-700/50 w-full max-w-md relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-slate-800 rounded-[2rem] mx-auto flex items-center justify-center mb-8 border border-slate-700 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            Longevity Protocol
          </h1>
          <p className="text-slate-400 font-medium mb-10 text-sm md:text-base leading-relaxed">
            Your personal dashboard for optimizing daily habits, movement, and
            bio-available nutrition.
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm md:text-base py-4 px-8 rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-white/5"
          >
            Sign in with Google{" "}
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
