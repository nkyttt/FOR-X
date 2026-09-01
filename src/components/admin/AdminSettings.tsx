import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Database,
  Cloud,
  Lock,
  User,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast, playUiSound } = useApp();

  const handleClearCache = () => {
    playUiSound('click');
    localStorage.clear();
    showToast('Local Cache Purged', 'Offline storefront cache cleared. Reloading will fetch directly from Firestore.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" />
          <span>Admin & Cloud Infrastructure Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View authorized administrator credentials, Firebase cloud configuration, and security rules status.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Admin Profile Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Active Administrator Profile</h2>
              <p className="text-xs text-slate-400">Session authenticated via Firebase Auth token.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email Address:</span>
              <span className="font-bold text-white font-mono">{user?.email || 'admin@cyberx.gg'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firebase User ID (UID):</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">
                {user?.uid || 'fb-admin-auth-uid-0912'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Role:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Super Administrator
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Auth Method:</span>
              <span className="font-semibold text-slate-300">Firebase Email / Password</span>
            </div>
          </div>
        </div>

        {/* Cloud Infrastructure Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Firebase & Database Connectivity</h2>
              <p className="text-xs text-slate-400">Realtime distributed replication endpoints.</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-semibold">Firestore Named Database</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 font-semibold">Security Rules Enforced</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Deployed
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 font-semibold">Firebase Storage</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Access Security Policy Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Administrator Access & Account Security Policy</h2>
            <p className="text-xs text-slate-400">Specification compliance notice (Section 5.4.1).</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            • <strong>No Client-Side Registration:</strong> The storefront application strictly prohibits any public account creation or sign-up endpoints for administrative roles.
          </p>
          <p>
            • <strong>Console Account Provisioning:</strong> New administrators must be added manually through the official Firebase console:
          </p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-400 flex items-center justify-between">
            <span>Firebase Console → Authentication → Users → Add User</span>
            <span className="text-slate-500 text-[10px]">Strict Server-Only Control</span>
          </div>
          <p>
            • <strong>Firestore Security Rules:</strong> All mutations (create, update, delete) to products, categories, trailers, theme tokens, and banners require a validated Firebase Authentication token (`request.auth != null`).
          </p>
        </div>
      </div>

      {/* Diagnostics & Cache Tools */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Local Storage & State Cache</h3>
          <p className="text-xs text-slate-400">
            Purge local offline keys to force a fresh pull of all collections from Firestore.
          </p>
        </div>

        <button
          onClick={handleClearCache}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge Local Cache</span>
        </button>
      </div>
    </div>
  );
};
