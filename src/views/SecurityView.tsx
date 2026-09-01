import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2, Server, Key, AlertTriangle } from 'lucide-react';

export const SecurityView: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-widest uppercase mb-3 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENTERPRISE SECURITY & FAIR PLAY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            SECURITY & <span className="text-emerald-400">SAFETY</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Discover how CYBERX protects player data, tournament integrity, cloud save states, and transactions.
          </p>
        </div>
      </div>

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">End-to-End Encryption</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user credentials, tournament brackets, and order records are secured with TLS 1.3 in-transit and AES-256 at rest.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Server-Authoritative Anti-Cheat</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Proprietary heuristic behavioral detection prevents memory manipulation, aim assist injection, and packet spoofing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Gmail Verified Passes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct integration with Google OAuth dispatches tamper-proof, cryptographic tournament admission codes to verified inboxes.
          </p>
        </div>
      </div>

      {/* Fair Play Code */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-900">CYBERX Fair Play Commitment</h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Competitive gaming is built on sportsmanship, mutual respect, and pure skill. We operate zero-tolerance policies regarding toxic behavior, DDOS attacks, and exploitation of software bugs during ranked or tournament play.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time match telemetry inspection</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Community peer-review tribunal for appeals</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated squad identity verification</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fast bug bounty reward program</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
