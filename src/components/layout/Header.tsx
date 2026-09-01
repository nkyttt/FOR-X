import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Heart,
  Package,
  Award,
  Settings,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp, AppView } from '../../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import { GamingTimerSet } from './GamingTimerSet';

export const Header: React.FC = () => {
  const { currentUser, logout, switchDemoRole } = useAuth();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const {
    currentView,
    navigate,
    unreadNotificationsCount,
    setIsSearchModalOpen,
    setIsAIAssistantOpen,
    openAuthModal,
    soundEnabled,
    setSoundEnabled,
    playUiSound,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Games', view: 'games' },
    { label: 'Videos', view: 'videos' },
    { label: 'Gallery', view: 'gallery' },
    { label: 'Community', view: 'community' },
    { label: 'Shop', view: 'shop' },
  ];

  const handleNavClick = (view: AppView) => {
    playUiSound('click');
    navigate(view);
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      playUiSound('click');
      navigate('search', { q: searchInput.trim() });
      setSearchInput('');
    } else {
      setIsSearchModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleNavClick('home')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-md shadow-blue-500/20 text-white font-black text-xl">
            <span className="tracking-tighter">X</span>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-30 blur-sm -z-10 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-wider text-slate-900 leading-none">
              CYBER<span className="text-blue-600">X</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Next-Gen Gaming</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Cart, Notifs, AI, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Input Bar (Matches Reference Image) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:flex items-center w-48 lg:w-64 transition-all"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search games, videos..."
              className="w-full bg-slate-100/90 text-slate-800 text-sm pl-4 pr-9 py-2 rounded-full border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400 transition"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 text-slate-400 hover:text-blue-600 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Search Button */}
          <button
            onClick={() => {
              playUiSound('click');
              setIsSearchModalOpen(true);
            }}
            aria-label="Open search dialog"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* AI Tactical Mastermind Trigger */}
          <button
            onClick={() => {
              playUiSound('laser');
              setIsAIAssistantOpen(true);
            }}
            title="CYBERX AI Tactical Coach (Gemini 3.1 Pro HIGH Thinking)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100/80 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">AI Mastermind</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Sound Effects Active' : 'Sound Effects Muted'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Shopping Cart with Badge */}
          <button
            onClick={() => {
              playUiSound('click');
              setIsCartDrawerOpen(true);
            }}
            aria-label="Shopping Cart"
            className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full animate-bounce">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Notification Bell with Badge & Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                playUiSound('click');
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
              }}
              aria-label="Notifications"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {isNotifDropdownOpen && (
              <NotificationDropdown onClose={() => setIsNotifDropdownOpen(false)} />
            )}
          </div>

          {/* Auth Button or User Profile Dropdown */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  playUiSound('click');
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-full border border-slate-200 transition"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full bg-white border border-slate-300 object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
                <span className="hidden sm:inline px-1.5 py-0.5 bg-blue-600 text-[10px] font-extrabold text-white rounded-full">
                  LV.{currentUser.level}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-600">Points: {currentUser.cyberPoints}</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[10px]">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('admin');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-blue-600 font-bold hover:bg-blue-50 flex items-center gap-2.5"
                    >
                      <ShieldAlert className="w-4 h-4 text-blue-600" /> Admin CMS Console
                    </button>
                    <button
                      onClick={() => {
                        navigate('profile', { username: currentUser.username });
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-blue-600" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('dashboard');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" /> Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('rewards');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Award className="w-4 h-4 text-amber-500" /> Rewards & Streaks
                    </button>
                    <button
                      onClick={() => {
                        navigate('dashboard');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Heart className="w-4 h-4 text-rose-500" /> Wishlist ({currentUser.wishlist.length})
                    </button>
                    <button
                      onClick={() => {
                        navigate('dashboard');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Package className="w-4 h-4 text-cyan-600" /> My Orders
                    </button>
                  </div>

                  {/* Real Gaming Timer Set */}
                  <GamingTimerSet />

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                playUiSound('click');
                openAuthModal('login');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-bold rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Login / Sign Up
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search games, videos..."
              className="w-full bg-slate-100 text-slate-800 text-sm pl-4 pr-10 py-2.5 rounded-xl border border-slate-200"
            />
            <button type="submit" aria-label="Submit search" className="absolute right-3 top-3 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold flex items-center justify-between ${
                currentView === item.view ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {currentView === item.view && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </button>
          ))}

          <button
            onClick={() => {
              navigate('tournaments');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50"
          >
            Tournaments
          </button>
          <button
            onClick={() => {
              navigate('rewards');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50"
          >
            Rewards & Streaks
          </button>

          {!currentUser && (
            <button
              onClick={() => {
                openAuthModal('login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl mt-2 shadow-md"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </header>
  );
};
