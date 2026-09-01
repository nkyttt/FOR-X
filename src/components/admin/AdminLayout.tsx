import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp, AdminSection } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Film,
  Store,
  Palette,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Search,
  Menu,
  X,
  Shield,
  Activity,
  User,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { adminSection, setAdminSection, navigate, playUiSound, showToast } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const menuItems: { id: AdminSection; label: string; icon: any; countKey?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'videos', label: 'Store Videos', icon: Film },
    { id: 'store', label: 'Store & Banners CMS', icon: Store },
    { id: 'theme', label: 'Theme Customizer', icon: Palette },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'settings', label: 'Admin & Cloud Settings', icon: Settings },
  ];

  const handleNav = (id: AdminSection) => {
    playUiSound('click');
    setAdminSection(id);
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    playUiSound('click');
    await logout();
    showToast('Signed Out', 'You have been logged out of the admin console.');
    setAdminSection('login');
  };

  const currentLabel = menuItems.find((m) => m.id === adminSection)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white text-sm">
            CX
          </div>
          <span className="font-black tracking-wider text-sm text-white">ADMIN PANEL</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('home')}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg text-xs flex items-center gap-1"
            title="View Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar / Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30 border border-white/20">
                  CX
                </div>
                <div>
                  <h2 className="font-black text-white tracking-wide text-base leading-tight">
                    CYBERX CMS
                  </h2>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Admin Control
                  </span>
                </div>
              </div>
            </div>

            {/* Live Storefront Link */}
            <button
              onClick={() => navigate('home')}
              className="w-full mt-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
                <span>View Live Storefront</span>
              </span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Exit</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 flex-1">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Management Modules
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.email || 'admin@cyberx.gg'}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Firebase Admin
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition flex items-center justify-center gap-2 border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Admin Control</span>
            <span className="text-slate-600">/</span>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Firestore Realtime Sync Active</span>
            </div>

            <button
              onClick={() => navigate('home')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Storefront</span>
            </button>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Backdrop for Mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
};
