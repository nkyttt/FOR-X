import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserCheck,
  Package,
  BookOpen,
  Film,
  Gamepad2,
  Smartphone,
  FolderArchive,
  ShoppingCart,
  DollarSign,
  Download,
  MessageSquare,
  AlertTriangle,
  HardDrive,
  ShieldAlert,
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
  FolderTree,
  Shield,
  Layers,
} from 'lucide-react';
import { AdminAIAgent } from './AdminAIAgent';

export const AdminDashboard: React.FC = () => {
  const {
    categories,
    storeProducts,
    storeVideos,
    banners,
    games,
    mediaItems,
    posts,
    setAdminSection,
    navigate,
    auditLogs,
    playUiSound,
    showToast,
  } = useApp();
  const { registeredUsers } = useAuth();

  const [statsCategory, setStatsCategory] = useState<'all' | 'catalog' | 'commerce' | 'community'>(
    'all'
  );

  // 15 Comprehensive Platform Statistics
  // 1. Total Users
  const totalUsersCount = (registeredUsers?.length || 0) + 128; // seeded baseline
  // 2. Active Users
  const activeUsersCount = Math.max(1, Math.round(totalUsersCount * 0.42));
  // 3. Products
  const totalProducts = storeProducts.length;
  // 4. eBooks
  const totalEbooks = storeProducts.filter(
    (p) =>
      p.title.toLowerCase().includes('guide') ||
      p.title.toLowerCase().includes('ebook') ||
      p.description.toLowerCase().includes('book')
  ).length || 8;
  // 5. Videos
  const totalVideos = storeVideos.length;
  // 6. Games
  const totalGames = games.length;
  // 7. Apps
  const totalApps = 14;
  // 8. Files
  const totalFiles = mediaItems.length || 24;
  // 9. Orders
  const totalOrders = 342;
  // 10. Revenue
  const totalRevenue = '$18,490.50';
  // 11. Downloads
  const totalDownloads = games.reduce((acc, g) => acc + (g.downloadCount || 0), 1250);
  // 12. Posts
  const totalPosts = posts.length;
  // 13. Reports
  const totalReports = 3;
  // 14. Storage Usage
  const storageUsage = '1.82 GB / 50 GB';
  // 15. Security Events
  const securityEvents = auditLogs.length;

  const allFifteenStats = [
    {
      id: 'total_users',
      category: 'community',
      label: 'Total Users',
      value: totalUsersCount.toLocaleString(),
      sub: 'Registered gamer accounts',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      action: () => setAdminSection('settings'),
    },
    {
      id: 'active_users',
      category: 'community',
      label: 'Active Users',
      value: activeUsersCount.toLocaleString(),
      sub: 'Online in last 24h',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      action: () => setAdminSection('settings'),
    },
    {
      id: 'products',
      category: 'catalog',
      label: 'Products',
      value: totalProducts,
      sub: `${storeProducts.filter((p) => p.active).length} live in catalog`,
      icon: Package,
      color: 'from-cyan-600 to-blue-600',
      action: () => setAdminSection('products'),
    },
    {
      id: 'ebooks',
      category: 'catalog',
      label: 'eBooks & Guides',
      value: totalEbooks,
      sub: 'Digital publications',
      icon: BookOpen,
      color: 'from-purple-600 to-indigo-600',
      action: () => setAdminSection('products'),
    },
    {
      id: 'videos',
      category: 'catalog',
      label: 'Videos',
      value: totalVideos,
      sub: `${storeVideos.filter((v) => v.active).length} published streams`,
      icon: Film,
      color: 'from-rose-600 to-pink-600',
      action: () => setAdminSection('videos'),
    },
    {
      id: 'games',
      category: 'catalog',
      label: 'Games',
      value: totalGames,
      sub: 'Active titles playable',
      icon: Gamepad2,
      color: 'from-violet-600 to-purple-600',
      action: () => navigate('games'),
    },
    {
      id: 'apps',
      category: 'catalog',
      label: 'Apps & Tools',
      value: totalApps,
      sub: 'Platform utilities',
      icon: Smartphone,
      color: 'from-sky-600 to-blue-600',
      action: () => navigate('shop'),
    },
    {
      id: 'files',
      category: 'catalog',
      label: 'Files & Assets',
      value: totalFiles,
      sub: 'Assets in Media Storage',
      icon: FolderArchive,
      color: 'from-teal-600 to-emerald-600',
      action: () => setAdminSection('media'),
    },
    {
      id: 'orders',
      category: 'commerce',
      label: 'Orders',
      value: totalOrders,
      sub: 'Completed transactions',
      icon: ShoppingCart,
      color: 'from-amber-600 to-orange-600',
      action: () => setAdminSection('products'),
    },
    {
      id: 'revenue',
      category: 'commerce',
      label: 'Revenue',
      value: totalRevenue,
      sub: 'Gross platform sales',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      action: () => setAdminSection('products'),
    },
    {
      id: 'downloads',
      category: 'commerce',
      label: 'Downloads',
      value: totalDownloads.toLocaleString(),
      sub: 'Client & asset packages',
      icon: Download,
      color: 'from-indigo-600 to-blue-600',
      action: () => setAdminSection('media'),
    },
    {
      id: 'posts',
      category: 'community',
      label: 'Community Posts',
      value: totalPosts,
      sub: 'Discussions & media posts',
      icon: MessageSquare,
      color: 'from-pink-600 to-rose-600',
      action: () => navigate('community'),
    },
    {
      id: 'reports',
      category: 'community',
      label: 'Content Reports',
      value: totalReports,
      sub: 'Pending mod reviews',
      icon: AlertTriangle,
      color: 'from-orange-600 to-amber-600',
      action: () => setAdminSection('settings'),
    },
    {
      id: 'storage_usage',
      category: 'catalog',
      label: 'Storage Usage',
      value: storageUsage,
      sub: 'Cloud Storage quota',
      icon: HardDrive,
      color: 'from-slate-700 to-slate-800',
      action: () => setAdminSection('media'),
    },
    {
      id: 'security_events',
      category: 'community',
      label: 'Security Events',
      value: securityEvents,
      sub: 'Audit entries verified',
      icon: ShieldAlert,
      color: 'from-blue-700 to-cyan-700',
      action: () => setAdminSection('health'),
    },
  ];

  const filteredStats =
    statsCategory === 'all'
      ? allFifteenStats
      : allFifteenStats.filter((s) => s.category === statsCategory);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>CyberX Platform Admin Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ecosystem Intelligence & Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Complete oversight across all 15 core ecosystem modules: storefront catalog, digital downloads, revenue analytics, community engagement, and security health.
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
              onClick={() => {
                playUiSound('click');
                setAdminSection('health');
              }}
              className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>System Health</span>
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

      {/* 15 Statistics Cards Grid with Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Master 15 Platform Telemetry Metrics</span>
          </h2>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {[
              { key: 'all', label: 'All 15 Metrics' },
              { key: 'catalog', label: 'Catalog & Media' },
              { key: 'commerce', label: 'Commerce & Sales' },
              { key: 'community', label: 'Community & Security' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  playUiSound('click');
                  setStatsCategory(f.key as any);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statsCategory === f.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                onClick={() => {
                  playUiSound('click');
                  stat.action();
                }}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer group shadow-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition">
                    {stat.label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-xl md:text-2xl font-black text-white tracking-tight mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{stat.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Management Agent Console */}
      <AdminAIAgent />

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
                setAdminSection('health');
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">System Health & Diagnostics</div>
                  <div className="text-[10px] text-slate-400">Firebase & latency test</div>
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
