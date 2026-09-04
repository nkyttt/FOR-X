import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div
      id="cyberx-auth-loading-screen"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex flex-col items-center z-10 text-center">
        {/* Animated Cyber Shield Loader */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25 border border-white/20 animate-pulse">
            X
          </div>
          <div className="absolute -inset-2 border-2 border-dashed border-cyan-400/40 rounded-3xl animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5 animate-pulse" />
          <span>CYBERX Security Gateway</span>
        </div>

        <p className="text-xs text-slate-400 max-w-xs font-mono">
          Verifying security signature & session token...
        </p>
      </div>
    </div>
  );
};
