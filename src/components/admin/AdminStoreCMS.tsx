import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BannerItem, NavItem } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import {
  Store,
  Sliders,
  Image as ImageIcon,
  Bell,
  Navigation,
  Save,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Upload,
  X,
  Sparkles,
  ShieldAlert,
  Globe,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const AdminStoreCMS: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    announcements,
    updateAnnouncement,
    navItems,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    showToast,
    playUiSound,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'banners' | 'announcements' | 'nav'>('general');

  // General Settings State
  const [generalForm, setGeneralForm] = useState({ ...storeSettings });
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Banner State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    active: true,
    displayOrder: 1,
  });

  // Announcement State
  const activeAnnouncement = announcements[0] || {
    id: 'announcement-default',
    message: '🚀 CYBERX SEASON 4 CHAMPIONSHIPS LIVE • USE CODE "PRO25" FOR 25% OFF STOREWIDE',
    active: true,
    backgroundColor: '#0f172a',
    textColor: '#38bdf8',
    link: '/products',
  };
  const [announcementForm, setAnnouncementForm] = useState({ ...activeAnnouncement });

  // Nav Links State
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [editingNav, setEditingNav] = useState<NavItem | null>(null);
  const [deletingNav, setDeletingNav] = useState<NavItem | null>(null);
  const [navForm, setNavForm] = useState({
    label: '',
    path: '',
    displayOrder: 1,
    active: true,
    isExternal: false,
  });

  // Handler for General Settings Submit
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    playUiSound('click');
    try {
      await updateStoreSettings(generalForm);
      playUiSound('success');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // Handler for Banner Open / Submit
  const handleOpenAddBanner = () => {
    playUiSound('click');
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Explore Gear',
      ctaLink: '/products',
      active: true,
      displayOrder: banners.length + 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerItem) => {
    playUiSound('click');
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      ctaText: b.ctaText || 'Shop Now',
      ctaLink: b.ctaLink || '/products',
      active: b.active,
      displayOrder: b.displayOrder ?? 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');
    if (editingBanner) {
      await updateBanner(editingBanner.id, {
        ...bannerForm,
        displayOrder: Number(bannerForm.displayOrder),
      });
    } else {
      await addBanner({
        ...bannerForm,
        displayOrder: Number(bannerForm.displayOrder),
      });
    }
    setIsBannerModalOpen(false);
  };

  const handleDeleteBannerConfirm = async () => {
    if (!deletingBanner) return;
    await deleteBanner(deletingBanner.id);
    setDeletingBanner(null);
  };

  // Handler for Announcement Submit
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');
    await updateAnnouncement(announcementForm.id, announcementForm);
    showToast('Announcement Saved', 'Storefront header announcement updated live.');
  };

  // Handler for Nav Submit
  const handleSaveNav = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');
    if (editingNav) {
      await updateNavItem(editingNav.id, {
        ...navForm,
        displayOrder: Number(navForm.displayOrder),
      });
    } else {
      await addNavItem({
        ...navForm,
        displayOrder: Number(navForm.displayOrder),
      });
    }
    setIsNavModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-400" />
          <span>Store CMS & Brand Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure storefront identity, homepage promotional carousels, announcement alerts, and header navigation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('general');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'general'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General Identity</span>
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('banners');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'banners'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Homepage Banners ({banners.length})</span>
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('announcements');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'announcements'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcement Bar</span>
        </button>

        <button
          onClick={() => {
            playUiSound('click');
            setActiveTab('nav');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'nav'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Header Navigation ({navItems.length})</span>
        </button>
      </div>

      {/* TAB 1: General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                required
                value={generalForm.storeName}
                onChange={(e) => setGeneralForm({ ...generalForm, storeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Currency Code & Symbol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={generalForm.currency}
                  onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                  placeholder="USD"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                />
                <input
                  type="text"
                  value={generalForm.currencySymbol}
                  onChange={(e) => setGeneralForm({ ...generalForm, currencySymbol: e.target.value })}
                  placeholder="$"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Support Contact Email
              </label>
              <input
                type="email"
                value={generalForm.contactEmail}
                onChange={(e) => setGeneralForm({ ...generalForm, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Support Phone Number
              </label>
              <input
                type="text"
                value={generalForm.contactPhone || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, contactPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Store Tagline & Description
            </label>
            <textarea
              rows={2}
              value={generalForm.storeDescription}
              onChange={(e) => setGeneralForm({ ...generalForm, storeDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Logo Image URL
              </label>
              <input
                type="url"
                value={generalForm.logoUrl}
                onChange={(e) => setGeneralForm({ ...generalForm, logoUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Favicon URL
              </label>
              <input
                type="url"
                value={generalForm.faviconUrl || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, faviconUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          {/* Social Links Sub-Section */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Social & Community Links</span>
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Discord</label>
                <input
                  type="url"
                  value={generalForm.socialLinks?.discord || ''}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      socialLinks: { ...generalForm.socialLinks, discord: e.target.value },
                    })
                  }
                  placeholder="https://discord.gg/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Twitter / X</label>
                <input
                  type="url"
                  value={generalForm.socialLinks?.twitter || ''}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      socialLinks: { ...generalForm.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Twitch</label>
                <input
                  type="url"
                  value={generalForm.socialLinks?.twitch || ''}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      socialLinks: { ...generalForm.socialLinks, twitch: e.target.value },
                    })
                  }
                  placeholder="https://twitch.tv/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">YouTube</label>
                <input
                  type="url"
                  value={generalForm.socialLinks?.youtube || ''}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      socialLinks: { ...generalForm.socialLinks, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Instagram</label>
                <input
                  type="url"
                  value={generalForm.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      socialLinks: { ...generalForm.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={generalForm.footerCopyright}
                onChange={(e) => setGeneralForm({ ...generalForm, footerCopyright: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Maintenance Mode</span>
                </div>
                <div className="text-[11px] text-slate-400">Lock storefront with maintenance message</div>
              </div>
              <input
                type="checkbox"
                checked={generalForm.maintenanceMode}
                onChange={(e) => setGeneralForm({ ...generalForm, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              {isSavingGeneral ? (
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save General Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Homepage Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Homepage Carousel & Hero Banners
            </h2>
            <button
              onClick={handleOpenAddBanner}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="relative aspect-[21/9] bg-slate-950">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Order #{b.displayOrder ?? 0}
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">{b.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-1">{b.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-slate-950/40 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBannerActive(b.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                        b.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {b.active ? 'Active' : 'Disabled'}
                    </button>
                    <span className="text-xs text-slate-400">CTA: {b.ctaText}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditBanner(b)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBanner(b)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Announcement Bar */}
      {activeTab === 'announcements' && (
        <form
          onSubmit={handleSaveAnnouncement}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          {/* Live Bar Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Preview
            </span>
            <div
              className="p-3 rounded-xl flex items-center justify-between text-xs font-bold px-4 border border-white/10"
              style={{
                backgroundColor: announcementForm.backgroundColor || '#0f172a',
                color: announcementForm.textColor || '#38bdf8',
              }}
            >
              <div className="flex items-center gap-2 truncate">
                <Bell className="w-4 h-4 shrink-0" />
                <span className="truncate">{announcementForm.message}</span>
              </div>
              <span className="text-[10px] uppercase underline shrink-0 ml-2">Click Link</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              required
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={announcementForm.backgroundColor || '#0f172a'}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, backgroundColor: e.target.value })
                  }
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={announcementForm.backgroundColor || '#0f172a'}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, backgroundColor: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Text / Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={announcementForm.textColor || '#38bdf8'}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, textColor: e.target.value })
                  }
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={announcementForm.textColor || '#38bdf8'}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, textColor: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Destination Link
              </label>
              <input
                type="text"
                value={announcementForm.link || ''}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                placeholder="/products or /tournaments"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementForm.active}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, active: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-950"
              />
              <span className="text-xs font-bold text-slate-300">
                {announcementForm.active ? 'Active on Storefront' : 'Announcement Disabled'}
              </span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Update Announcement</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Navigation Links */}
      {activeTab === 'nav' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Header Navigation Items
            </h2>
            <button
              onClick={() => {
                setEditingNav(null);
                setNavForm({
                  label: '',
                  path: '',
                  displayOrder: navItems.length + 1,
                  active: true,
                  isExternal: false,
                });
                setIsNavModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Nav Item</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Label</th>
                  <th className="py-3.5 px-6">Path / Route</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {navItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                      #{item.displayOrder}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{item.label}</td>
                    <td className="py-4 px-6 font-mono text-slate-300">{item.path}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          item.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingNav(item);
                            setNavForm({
                              label: item.label,
                              path: item.path,
                              displayOrder: item.displayOrder,
                              active: item.active,
                              isExternal: item.isExternal || false,
                            });
                            setIsNavModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingNav(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingBanner ? 'Edit Banner' : 'Create Banner'}
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Link Destination</label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nav Item Modal */}
      {isNavModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsNavModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingNav ? 'Edit Nav Item' : 'Add Nav Item'}
            </h3>

            <form onSubmit={handleSaveNav} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={navForm.label}
                  onChange={(e) => setNavForm({ ...navForm, label: e.target.value })}
                  placeholder="e.g. Products, Tournaments, Media"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Path / Route *</label>
                <input
                  type="text"
                  required
                  value={navForm.path}
                  onChange={(e) => setNavForm({ ...navForm, path: e.target.value })}
                  placeholder="/products or https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNavModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition"
                >
                  Save Navigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Banners */}
      <AdminConfirmModal
        isOpen={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        onConfirm={handleDeleteBannerConfirm}
        title="Delete Banner Carousel Item?"
        message="This banner will be removed from the homepage rotating carousel."
      />

      {/* Delete Confirmation Modal for Nav */}
      <AdminConfirmModal
        isOpen={Boolean(deletingNav)}
        onClose={() => setDeletingNav(null)}
        onConfirm={async () => {
          if (deletingNav) {
            await deleteNavItem(deletingNav.id);
            setDeletingNav(null);
          }
        }}
        title="Delete Header Navigation Item?"
        message="This navigation link will be removed from the storefront header."
      />
    </div>
  );
};
