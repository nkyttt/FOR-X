import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Heart,
  Trophy,
  Package,
  User,
  Settings,
  Sparkles,
  Play,
  Flame,
  Award,
  Zap,
  Edit3,
  LogOut,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { games, tournaments, products, openGameDetailModal, launchGameSimulator, playUiSound, showToast, setIsAuthModalOpen } =
    useApp();
  const { currentUser, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'library' | 'wishlist' | 'tournaments' | 'settings'>('library');
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.displayName || 'Alex Walker');
  const [editBio, setEditBio] = useState(currentUser?.bio || 'Competitive Cyber Strike Operative & Content Creator');

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to Access Dashboard</h2>
        <p className="text-xs text-slate-500">
          Track your tournament brackets, games library, order receipts, and level progression.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Wishlist games
  const wishlistedGames = games.filter((g) => currentUser.wishlist.includes(g.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName: editDisplayName, bio: editBio });
    playUiSound('success');
    showToast('Profile Updated', 'Your gamer profile information has been saved', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Gamer Profile Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-500 shadow-xl"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-black">{currentUser.displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black">
                  {currentUser.rank}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">@{currentUser.username} &bull; {currentUser.email}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-md">{currentUser.bio}</p>
            </div>
          </div>

          <button
            onClick={() => {
              playUiSound('click');
              logout();
            }}
            className="px-4 py-2 bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Progress & Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Gamer Level
            </span>
            <p className="text-lg font-black text-white mt-0.5">Lvl {currentUser.level}</p>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(currentUser.xp % 1000) / 10}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-cyan-400" /> Total XP
            </span>
            <p className="text-lg font-black text-cyan-400 mt-0.5">{currentUser.xp.toLocaleString()} XP</p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> CyberCredits
            </span>
            <p className="text-lg font-black text-blue-400 mt-0.5">{currentUser.points} CC</p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Daily Streak
            </span>
            <p className="text-lg font-black text-rose-400 mt-0.5">{currentUser.streakDays} Days</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('library');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'library' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> My Game Library
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('wishlist');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'wishlist' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" /> Wishlist ({wishlistedGames.length})
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('tournaments');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'tournaments' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" /> Tournaments
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('settings');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" /> Profile Settings
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {games.slice(0, 3).map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-4"
              >
                <img src={game.coverImage} alt={game.title} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{game.title}</h4>
                  <span className="text-xs text-slate-500 block">{game.genre}</span>
                  <button
                    onClick={() => {
                      playUiSound('laser');
                      launchGameSimulator(game);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" /> Play Simulator
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlistedGames.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 mt-1">Browse our game catalog and tap the heart icon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {wishlistedGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => openGameDetailModal(game)}
                    className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-4"
                  >
                    <img src={game.coverImage} alt={game.title} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{game.title}</h4>
                      <span className="text-xs text-slate-500">{game.genre}</span>
                      <div className="text-xs font-bold text-blue-600 mt-1">★ {game.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {tournaments.slice(0, 2).map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img src={t.bannerImage} alt={t.title} className="w-16 h-16 rounded-2xl object-cover" />
                  <div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      {t.status}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{t.title}</h4>
                    <span className="text-xs text-slate-500">{t.game} &bull; Starts {t.startDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Prize Pool</span>
                  <span className="text-base font-black text-amber-500">{t.prizePool}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-black text-slate-900">Profile Settings</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gamer Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
