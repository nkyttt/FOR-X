import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  FolderTree,
  Film,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Eye,
  Plus,
  Palette,
  Store,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    categories,
    storeProducts,
    storeVideos,
    banners,
    setAdminSection,
    navigate,
    auditLogs,
    playUiSound,
  } = useApp();

  const totalProducts = storeProducts.length;
  const activeProducts = storeProducts.filter((p) => p.active).length;
  const featuredProducts = storeProducts.filter((p) => p.featured).length;

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.active).length;

  const totalVideos = storeVideos.length;
  const publishedVideos = storeVideos.filter((v) => v.active).length;
  const draftVideos = totalVideos - publishedVideos;

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      sub: `${activeProducts} active in store`,
      icon: Package,
      color: 'from-blue-600 to-indigo-600',
      action: () => setAdminSection('products'),
    },
    {
      label: 'Categories',
      value: totalCategories,
      sub: `${activeCategories} active tags`,
      icon: FolderTree,
      color: 'from-purple-600 to-pink-600',
      action: () => setAdminSection('categories'),
    },
    {
      label: 'Store Videos',
      value: totalVideos,
      sub: `${publishedVideos} live streams & clips`,
      icon: Film,
      color: 'from-cyan-600 to-blue-600',
      action: () => setAdminSection('videos'),
    },
    {
      label: 'Active Products',
      value: activeProducts,
      sub: 'Visible on storefront',
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-600',
      action: () => setAdminSection('products'),
    },
    {
      label: 'Featured Products',
      value: featuredProducts,
      sub: 'Homepage spotlight',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      action: () => setAdminSection('products'),
    },
    {
      label: 'Published Videos',
      value: publishedVideos,
      sub: 'Public playback',
      icon: Eye,
      color: 'from-indigo-600 to-cyan-600',
      action: () => setAdminSection('videos'),
    },
    {
      label: 'Draft Videos',
      value: draftVideos,
      sub: 'Unpublished review',
      icon: FileEdit,
      color: 'from-slate-700 to-slate-800',
      action: () => setAdminSection('videos'),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Control Hub Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Storefront Content Management
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Control your dynamic gaming products, categories, affiliate links, trailers, banners, and visual theme in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('products');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Storefront Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Statistics Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Catalog & Media Metrics</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  playUiSound('click');
                  stat.action();
                }}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition">
                    {stat.label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Panel & Activity Log */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Quick Management Shortcuts</span>
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('products');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Create New Product</div>
                  <div className="text-[10px] text-slate-400">Set title, price & affiliate link</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('categories');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Manage Categories</div>
                  <div className="text-[10px] text-slate-400">Assign Lucide icons & ordering</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('videos');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Upload Store Video</div>
                  <div className="text-[10px] text-slate-400">Add trailers & gameplay highlights</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('store');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Store Settings & Banners</div>
                  <div className="text-[10px] text-slate-400">Hero carousels, announcements & footer</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setAdminSection('theme');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Theme & Appearance</div>
                  <div className="text-[10px] text-slate-400">Colors, border radius & button styles</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Recent Admin Activity Log</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {auditLogs.length} Events Recorded
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                      <span className="font-bold text-white">{log.target}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono shrink-0">
                    {log.timestamp}
                  </div>
                </div>
              ))}

              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No admin activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Audit logs persist with administrator attribution.</span>
            <button
              onClick={() => setAdminSection('settings')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View System Rules</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
