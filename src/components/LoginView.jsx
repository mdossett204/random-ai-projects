import React from "react";
import { ShieldCheck, LogIn } from "lucide-react";

const LoginView = ({ handleLogin }) => {
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
          Session inactive. Sign in with Google to sync your protocol across all
          your devices.
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
};

export default LoginView;
