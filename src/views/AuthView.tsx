import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Gamepad2,
  Sparkles,
  KeyRound,
  UserPlus,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface AuthViewProps {
  initialTab?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialTab = 'signin' }) => {
  const {
    currentUser,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPasswordReset,
  } = useAuth();
  const { navigate, showToast, playUiSound } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal/view state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Keep browser URL synchronized with /auth
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
      window.history.replaceState(null, '', '/auth');
    }
  }, []);

  // Automatic redirect if user becomes authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('home');
    }
  }, [currentUser, navigate]);

  // Clear messages on tab switch
  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    playUiSound('click');
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    playUiSound('click');

    const res = await loginWithEmail(cleanEmail, password);

    if (res.success) {
      playUiSound('success');
      setSuccessMessage('Authentication verified! Entering CYBERX Universe...');
      showToast('Welcome Back!', `Signed in as ${cleanEmail}`, 'success');
      // Short delay for user to see success state before redirection
      setTimeout(() => {
        navigate('home');
      }, 500);
    } else {
      playUiSound('pop');
      setErrorMessage(res.error || 'Failed to sign in. Please verify your email and password.');
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Please provide your full name or gamer tag.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a secure password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    setIsLoading(true);
    playUiSound('click');

    const cleanUsername = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
    const res = await registerWithEmail(cleanName, cleanUsername, cleanEmail, password);

    if (res.success) {
      playUiSound('success');
      setSuccessMessage('Account created successfully! Welcome to the CYBERX Gaming Universe.');
      showToast('Account Created', `Welcome to CYBERX, ${cleanName}!`, 'success');
      setTimeout(() => {
        navigate('home');
      }, 600);
    } else {
      playUiSound('pop');
      setErrorMessage(res.error || 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    playUiSound('click');

    const res = await loginWithGoogle();

    if (res.success) {
      playUiSound('success');
      setSuccessMessage('Google authentication verified! Entering CYBERX Universe...');
      showToast('Google Authenticated', 'Signed in successfully with Google account.', 'success');
      setTimeout(() => {
        navigate('home');
      }, 500);
    } else {
      playUiSound('pop');
      setErrorMessage(res.error || 'Google sign-in could not be completed.');
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleSendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setForgotError('Please enter your account email address.');
      return;
    }

    setForgotLoading(true);
    playUiSound('click');

    const res = await sendPasswordReset(cleanEmail);
    setForgotLoading(false);

    if (res.success) {
      playUiSound('success');
      setForgotSuccess(
        `Password reset link dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
      );
      showToast('Reset Link Dispatched', 'Check your email for reset instructions.', 'info');
    } else {
      playUiSound('pop');
      setForgotError(res.error || 'Could not send reset email. Please verify the email address.');
    }
  };

  return (
    <div
      id="cyberx-auth-gate"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Dynamic Cyber Ambient Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-black tracking-wider uppercase mb-3 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>CYBERX Security Gateway</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25 border border-white/20">
              X
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">CYBERX</h1>
          </div>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {activeTab === 'signin'
              ? 'Enter your credentials to access cloud saves, tournaments, and your games library.'
              : 'Create your gamer profile to unlock tournaments, badges, and the gaming grid.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

          {/* Real Tab Switcher: Sign In & Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-6">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => handleTabSwitch('signin')}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Real Firebase Error Banner */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Real Success Banner */}
          {successMessage && (
            <div
              id="auth-success-banner"
              className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form id="signin-form" onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@cyberx.gg"
                    className="w-full bg-slate-950/80 text-white text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <button
                    id="signin-forgot-password-btn"
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setForgotEmail(email);
                      setIsForgotPasswordOpen(true);
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 text-white text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to CYBERX</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form id="signup-form" onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Full Name / Gamer Tag
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Neo Phoenix"
                    className="w-full bg-slate-950/80 text-white text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@cyberx.gg"
                    className="w-full bg-slate-950/80 text-white text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Password <span className="text-[10px] text-slate-500">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 text-white text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle2
                    className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                      confirmPassword && confirmPassword === password
                        ? 'text-emerald-400'
                        : confirmPassword
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <input
                    id="signup-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-950/80 text-white text-xs pl-10 pr-10 py-3 rounded-xl border focus:outline-none transition placeholder:text-slate-600 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-rose-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading || (confirmPassword !== '' && password !== confirmPassword)}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Gamer Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
              or continue with
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Real Google Auth Option */}
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl font-bold text-xs text-slate-200 transition flex items-center justify-center gap-3 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* Security / Admin Note */}
        <div className="mt-6 text-center space-y-2 text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
            Protected by Firebase Authentication & 256-bit SSL encryption
          </p>
          <p className="text-[10px] text-slate-600">
            Staff administrator?{' '}
            <button
              onClick={() => navigate('admin')}
              className="text-slate-400 hover:text-cyan-400 underline font-semibold transition"
            >
              Administrator Console →
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter your registered email address to receive a secure password recovery link.
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="player@cyberx.gg"
                    className="w-full bg-slate-950 text-white text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-extrabold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
