import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Terminal,
  KeyRound,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, loading: authLoading } = useAuth();
  const { setAdminSection, showToast, playUiSound } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    playUiSound('click');

    try {
      await login(email.trim(), password);
      playUiSound('success');
      showToast('Admin Authenticated', 'Welcome back to the CYBERX Management Console.');
      setAdminSection('dashboard');
    } catch (err: any) {
      console.error('Admin authentication error:', err);
      let message = 'Failed to sign in. Please verify your credentials.';
      const code = err?.code || '';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = 'Invalid administrator credentials. Please check your email and password.';
      } else if (code === 'auth/invalid-email') {
        message = 'The email address entered is not valid format.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily locked due to multiple failed login attempts. Please try again later.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network connectivity error. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter the administrator email address.');
      return;
    }

    setForgotLoading(true);
    playUiSound('click');

    try {
      if (auth) {
        await sendPasswordResetEmail(auth, forgotEmail.trim());
      }
      setForgotSuccess(`Password reset email successfully sent to ${forgotEmail}. Please check your inbox.`);
      playUiSound('success');
      showToast('Reset Link Sent', 'Check your administrator email for password reset instructions.');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      let msg = 'Failed to send password reset email.';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No administrator account found with this email address.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err?.message) {
        msg = err.message;
      }
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('admin@cyberx.gg');
    setPassword('CyberAdmin2025!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20 border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CyberX Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Login</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your authorized Firebase administrator credentials.
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cyberx.gg"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Policy Information */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Access Control Enabled</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed px-2">
            No public admin registration exists. Administrator accounts are manually provisioned via the{' '}
            <span className="text-slate-300 font-mono">Firebase Console → Authentication → Users</span> tab.
          </p>

          <button
            type="button"
            onClick={handleDemoCredentials}
            className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill sample admin credentials for preview</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                <p className="text-xs text-slate-400">Send password recovery link via Firebase Auth.</p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <span className="leading-relaxed">{forgotSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@cyberx.gg"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
