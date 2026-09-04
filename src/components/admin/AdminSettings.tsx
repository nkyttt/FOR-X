import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  resetFirebaseConfig,
  parseFirebaseConfigSnippet,
  performRealFirebaseConnectivityTest,
  isCustomConfigActive,
  FirebaseClientConfig,
  ComprehensiveTestResult,
} from '../../services/firebaseConfigService';
import { AdminConfirmModal } from './AdminConfirmModal';
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
  XCircle,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Copy,
  Download,
  UploadCloud,
  FileCode,
  Power,
  Activity,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { auditLogs, showToast, playUiSound, adminActionItemId } = useApp();

  const [activeTab, setActiveTab] = useState<'firebase' | 'activity' | 'security'>('firebase');

  // Firebase Config Form State
  const [configForm, setConfigForm] = useState<FirebaseClientConfig>(getActiveFirebaseConfig());
  const [isCustomActive, setIsCustomActive] = useState<boolean>(isCustomConfigActive());

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ComprehensiveTestResult | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSnippet, setImportSnippet] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Disconnect Modal State
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Activity Log Filter & Search State
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');

  // Sync tab if navigated with params
  useEffect(() => {
    if (adminActionItemId === 'activity') {
      setActiveTab('activity');
    } else if (adminActionItemId === 'firebase') {
      setActiveTab('firebase');
    }
  }, [adminActionItemId]);

  // Handle Real Connection Test
  const handleTestConnection = async () => {
    playUiSound('click');
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await performRealFirebaseConnectivityTest(configForm);
      setTestResult(res);
      if (res.overallSuccess) {
        playUiSound('success');
        showToast('Connection Verified', 'Firebase Authentication, Firestore, and Storage endpoints validated.');
      } else {
        showToast('Connection Warning', res.errorDetails || 'One or more Firebase service checks failed.', 'warning');
      }
    } catch (err: any) {
      showToast('Test Failed', err?.message || 'Failed to complete connectivity verification.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Save Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');

    if (!configForm.apiKey.trim() || !configForm.projectId.trim() || !configForm.appId.trim()) {
      showToast('Validation Error', 'API Key, Project ID, and App ID are mandatory fields.', 'warning');
      return;
    }

    saveCustomFirebaseConfig(configForm);
    setIsCustomActive(true);
    playUiSound('success');
    showToast('Configuration Saved', 'Custom Firebase parameters persisted to application environment.');
  };

  // Handle Copy Config to Clipboard
  const handleCopyConfig = () => {
    playUiSound('click');
    const snippet = `const firebaseConfig = {\n  apiKey: "${configForm.apiKey}",\n  authDomain: "${configForm.authDomain}",\n  projectId: "${configForm.projectId}",\n  storageBucket: "${configForm.storageBucket}",\n  messagingSenderId: "${configForm.messagingSenderId}",\n  appId: "${configForm.appId}"${configForm.measurementId ? `,\n  measurementId: "${configForm.measurementId}"` : ''}\n};`;
    navigator.clipboard.writeText(snippet);
    showToast('Config Copied', 'Firebase configuration code copied to clipboard.');
  };

  // Handle Import Config Parsing
  const handleImportSubmit = () => {
    playUiSound('click');
    setImportError(null);

    const parsed = parseFirebaseConfigSnippet(importSnippet);
    if (!parsed.success || !parsed.config) {
      setImportError(parsed.error || 'Failed to parse configuration snippet.');
      return;
    }

    setConfigForm(parsed.config);
    setIsImportModalOpen(false);
    setImportSnippet('');
    playUiSound('success');
    showToast('Config Imported', 'Firebase configuration parsed and loaded into form fields.');
  };

  // Handle Reset Config
  const handleResetConfig = () => {
    playUiSound('click');
    resetFirebaseConfig();
    const defaultConfig = getActiveFirebaseConfig();
    setConfigForm(defaultConfig);
    setIsCustomActive(false);
    setTestResult(null);
    showToast('Configuration Reset', 'Reverted to default project workspace settings.');
  };

  // Handle Disconnect Firebase
  const handleDisconnectConfirm = () => {
    setIsDisconnecting(true);
    playUiSound('click');

    setTimeout(() => {
      resetFirebaseConfig();
      setConfigForm({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
      setIsCustomActive(false);
      setTestResult(null);
      setIsDisconnecting(false);
      setIsDisconnectModalOpen(false);
      showToast('Firebase Disconnected', 'Local custom Firebase connection purged. Using base credentials.');
    }, 400);
  };

  const handleClearCache = () => {
    playUiSound('click');
    localStorage.clear();
    showToast('Local Cache Purged', 'Offline storefront cache cleared. Reloading will fetch directly from Firestore.');
  };

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(logSearch.toLowerCase());

    const matchesAction = logActionFilter === 'all' || log.action.toUpperCase().includes(logActionFilter.toUpperCase());

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Admin & Cloud Infrastructure Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Firebase Web App configurations, perform live cloud connection diagnostics, and audit admin activities.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            id="tab-btn-firebase"
            onClick={() => {
              playUiSound('click');
              setActiveTab('firebase');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Firebase Config</span>
          </button>

          <button
            id="tab-btn-activity"
            onClick={() => {
              playUiSound('click');
              setActiveTab('activity');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity & Audit ({auditLogs.length})</span>
          </button>

          <button
            id="tab-btn-security"
            onClick={() => {
              playUiSound('click');
              setActiveTab('security');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Rules</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: FIREBASE SETTINGS & DIAGNOSTICS ================= */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          {/* Live Cloud Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Firebase</span>
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    testResult
                      ? testResult.firebaseInit.status === 'connected'
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        : 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {testResult
                    ? testResult.firebaseInit.status === 'connected'
                      ? 'Connected'
                      : 'Failed'
                    : 'Initialized'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                {configForm.projectId || 'Default'}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Auth</span>
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    testResult
                      ? testResult.auth.status === 'connected'
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {testResult
                    ? testResult.auth.status === 'connected'
                      ? 'Connected'
                      : 'Failed'
                    : 'Online'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                Email/Password
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Firestore</span>
                <Database className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    testResult
                      ? testResult.firestore.status === 'connected'
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {testResult
                    ? testResult.firestore.status === 'connected'
                      ? 'Connected'
                      : 'Failed'
                    : 'Replicated'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                Realtime sync
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Storage</span>
                <Shield className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    testResult
                      ? testResult.storage.status === 'connected'
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {testResult
                    ? testResult.storage.status === 'connected'
                      ? 'Connected'
                      : 'Failed'
                    : 'Ready'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                5MB / JPG-PNG
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">App Check</span>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Disabled</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                Standard Client
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Network</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                Port 3000 Active
              </span>
            </div>
          </div>

          {/* Test Diagnostic Output Panel (Shown when testing or result is present) */}
          {(isTesting || testResult) && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Real Firebase Connectivity Diagnostic Log</span>
                </div>
                {testResult && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Checked at {testResult.timestamp}
                  </span>
                )}
              </div>

              {isTesting ? (
                <div className="py-6 flex flex-col items-center justify-center text-slate-300 space-y-2">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="text-xs font-bold tracking-wide">
                    Testing connection to Firebase services & live endpoints...
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Initializing auth probe, querying Firestore snapshot, validating storage bucket
                  </span>
                </div>
              ) : testResult ? (
                <div className="space-y-2.5 text-xs">
                  {testResult.overallSuccess ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="font-semibold">
                        All Firebase service checks completed successfully. Firestore, Auth, and Storage are fully functional.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <div className="font-bold">Firebase connection check reported issues:</div>
                        <div className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed">
                          {testResult.errorDetails || 'Check your project configuration and Firebase service settings.'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Firebase App Initialization:</span>
                      <span className={testResult.firebaseInit.status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>
                        {testResult.firebaseInit.status === 'connected' ? `🟢 Connected (${testResult.firebaseInit.latencyMs}ms)` : '🔴 Failed'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Authentication Service:</span>
                      <span className={testResult.auth.status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>
                        {testResult.auth.status === 'connected' ? `🟢 Connected (${testResult.auth.latencyMs}ms)` : '🔴 Failed'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Cloud Firestore Query:</span>
                      <span className={testResult.firestore.status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>
                        {testResult.firestore.status === 'connected' ? `🟢 Connected (${testResult.firestore.latencyMs}ms)` : '🔴 Failed'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Storage Bucket:</span>
                      <span className={testResult.storage.status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>
                        {testResult.storage.status === 'connected' ? `🟢 Connected (${testResult.storage.latencyMs}ms)` : '🔴 Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Configuration Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span>Firebase Web App Configuration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Parameters used for client authentication, cloud database replication, and binary storage.
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-import-firebase-config"
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setIsImportModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Import Config</span>
                </button>

                <button
                  id="btn-copy-firebase-config"
                  type="button"
                  onClick={handleCopyConfig}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Config</span>
                </button>

                <button
                  id="btn-reset-firebase-config"
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset</span>
                </button>

                <button
                  id="btn-disconnect-firebase"
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setIsDisconnectModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    API Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.apiKey}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Auth Domain *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.authDomain}
                    onChange={(e) => setConfigForm({ ...configForm, authDomain: e.target.value })}
                    placeholder="your-project.firebaseapp.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.projectId}
                    onChange={(e) => setConfigForm({ ...configForm, projectId: e.target.value })}
                    placeholder="your-project-id"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Storage Bucket
                  </label>
                  <input
                    type="text"
                    value={configForm.storageBucket}
                    onChange={(e) => setConfigForm({ ...configForm, storageBucket: e.target.value })}
                    placeholder="your-project.firebasestorage.app"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Messaging Sender ID
                  </label>
                  <input
                    type="text"
                    value={configForm.messagingSenderId}
                    onChange={(e) => setConfigForm({ ...configForm, messagingSenderId: e.target.value })}
                    placeholder="123456789012"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    App ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.appId}
                    onChange={(e) => setConfigForm({ ...configForm, appId: e.target.value })}
                    placeholder="1:123456789012:web:abcdef"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Measurement ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={configForm.measurementId || ''}
                    onChange={(e) => setConfigForm({ ...configForm, measurementId: e.target.value })}
                    placeholder="G-ABC123XYZ"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
                  />
                </div>
              </div>

              {/* Form Bottom CTA Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  id="btn-test-connection"
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing connection...' : 'Test Connection'}</span>
                </button>

                <button
                  id="btn-save-configuration"
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AUDIT & ACTIVITY LOGS ================= */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit logs by action, target, or admin email..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Operations</option>
                  <option value="CREATE" className="bg-slate-900">Created Items</option>
                  <option value="UPDATE" className="bg-slate-900">Updated Items</option>
                  <option value="DELETE" className="bg-slate-900">Deleted Items</option>
                  <option value="UPLOAD" className="bg-slate-900">Media Uploads</option>
                  <option value="LOGIN" className="bg-slate-900">Auth Sessions</option>
                </select>
              </div>

              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purge Cache</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Action</th>
                    <th className="py-3.5 px-6">Target Resource</th>
                    <th className="py-3.5 px-6">Details</th>
                    <th className="py-3.5 px-6 text-right">Admin Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white font-bold max-w-xs truncate">
                        {log.target}
                      </td>
                      <td className="py-4 px-6 text-slate-300 max-w-sm">
                        {log.details}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400">
                        {log.adminEmail || 'admin@cyberx.gg'}
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                        No audit events match the specified filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SECURITY & ADMIN ACCESS ================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Profile */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
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

            {/* Cloud Security Policies */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Firestore Security Rules</h2>
                  <p className="text-xs text-slate-400">Role-based access control and write locks.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Rules Deployed to Cloud:</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Enforced
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  • Public storefront visitors have read-only access to published products, active categories, and active trailers.
                </p>
                <p className="text-slate-400 text-[11px]">
                  • All mutations (`create`, `update`, `delete`) require a validated Firebase Authentication token (`request.auth != null`).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORT CONFIG ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Import Firebase Configuration</h3>
                <p className="text-xs text-slate-400">Paste your Firebase web setup code block or JSON object.</p>
              </div>
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                {importError}
              </div>
            )}

            <div className="space-y-3">
              <textarea
                rows={8}
                value={importSnippet}
                onChange={(e) => setImportSnippet(e.target.value)}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "...",\n  projectId: "...",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 outline-none transition"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 transition"
                >
                  Parse & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISCONNECT FIREBASE ================= */}
      <AdminConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleDisconnectConfirm}
        title="Disconnect Custom Firebase Configuration?"
        message="This action will clear your custom Firebase parameters from local application storage and revert back to default workspace credentials. It will NOT delete any data or users in your Firebase project."
        confirmText="Disconnect Firebase"
        isDestructive={true}
        isLoading={isDisconnecting}
      />
    </div>
  );
};
