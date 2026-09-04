import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GameItem,
  VideoItem,
  NewsItem,
  GalleryItem,
  TournamentItem,
  ProductItem,
  CommunityPost,
  NotificationItem,
  SiteSettings,
  AuditLog,
  CategoryItem,
  StoreProduct,
  StoreVideo,
  BannerItem,
  StoreSettings,
  ThemeSettings,
  NavItem,
  AnnouncementItem,
  MediaItem,
  GlobalChatMessage,
  ChatChannel,
} from '../types';
import {
  SEED_GAMES,
  SEED_VIDEOS,
  SEED_NEWS,
  SEED_GALLERY,
  SEED_TOURNAMENTS,
  SEED_PRODUCTS,
  SEED_POSTS,
  DEFAULT_SITE_SETTINGS,
  SEED_CATEGORIES,
  SEED_STORE_PRODUCTS,
  SEED_STORE_VIDEOS,
  SEED_BANNERS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_THEME_SETTINGS,
  SEED_ANNOUNCEMENTS,
  SEED_NAVIGATION,
  SEED_MEDIA_ITEMS,
  SEED_GLOBAL_CHAT_MESSAGES,
} from '../data/seedData';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

export type AppView =
  | 'home'
  | 'games'
  | 'videos'
  | 'gallery'
  | 'news'
  | 'community'
  | 'tournaments'
  | 'shop'
  | 'rewards'
  | 'dashboard'
  | 'profile'
  | 'checkout'
  | 'admin'
  | 'security'
  | 'search';

export interface ActiveRoute {
  name: AppView;
  params?: Record<string, string>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export type AdminSection =
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'videos'
  | 'store'
  | 'theme'
  | 'media'
  | 'settings'
  | 'health'
  | 'login';

interface AppContextType {
  currentView: AppView;
  activeRoute: ActiveRoute;
  setCurrentView: (view: AppView) => void;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  
  // Admin Sub Routing
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  adminActionItemId: string | null;
  setAdminActionItemId: (id: string | null) => void;
  
  // Route params
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
  selectedNewsSlug: string | null;
  setSelectedNewsSlug: (slug: string | null) => void;
  selectedTournamentId: string | null;
  setSelectedTournamentId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedProfileUsername: string | null;
  setSelectedProfileUsername: (username: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Modals
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  activeVideo: VideoItem | null;
  openVideoPlayer: (video: VideoItem) => void;
  closeVideoPlayer: () => void;
  activeLaunchingGame: GameItem | null;
  launchGameSimulator: (game: GameItem) => void;
  closeGameSimulator: () => void;
  activeGameDetail: GameItem | null;
  openGameDetailModal: (game: GameItem) => void;
  closeGameDetailModal: () => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Store & CMS Data Collections
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  addCategory: (category: Omit<CategoryItem, 'id' | 'createdAt'>) => Promise<CategoryItem>;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;

  storeProducts: StoreProduct[];
  setStoreProducts: React.Dispatch<React.SetStateAction<StoreProduct[]>>;
  addStoreProduct: (product: Omit<StoreProduct, 'id' | 'createdAt'>) => Promise<StoreProduct>;
  updateStoreProduct: (id: string, updates: Partial<StoreProduct>) => Promise<void>;
  deleteStoreProduct: (id: string) => Promise<boolean>;
  toggleProductActive: (id: string) => Promise<void>;
  toggleProductFeatured: (id: string) => Promise<void>;

  storeVideos: StoreVideo[];
  setStoreVideos: React.Dispatch<React.SetStateAction<StoreVideo[]>>;
  addStoreVideo: (video: Omit<StoreVideo, 'id' | 'createdAt'>) => Promise<StoreVideo & { dbSuccess?: boolean; dbError?: string }>;
  updateStoreVideo: (id: string, updates: Partial<StoreVideo>) => Promise<void>;
  deleteStoreVideo: (id: string) => Promise<boolean>;
  retrySaveVideoToFirestore: (video: StoreVideo) => Promise<{ success: boolean; error?: string }>;
  toggleVideoActive: (id: string) => Promise<void>;
  toggleVideoFeatured: (id: string) => Promise<void>;

  banners: BannerItem[];
  setBanners: React.Dispatch<React.SetStateAction<BannerItem[]>>;
  addBanner: (banner: Omit<BannerItem, 'id' | 'createdAt'>) => Promise<BannerItem>;
  updateBanner: (id: string, updates: Partial<BannerItem>) => Promise<void>;
  deleteBanner: (id: string) => Promise<boolean>;
  toggleBannerActive: (id: string) => Promise<void>;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;

  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => Promise<void>;

  announcements: AnnouncementItem[];
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementItem[]>>;
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id'>) => Promise<AnnouncementItem>;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<boolean>;

  navigationItems: NavItem[];
  setNavigationItems: React.Dispatch<React.SetStateAction<NavItem[]>>;
  updateNavigationItems: (items: NavItem[]) => Promise<void>;
  addNavigationItem: (item: Omit<NavItem, 'id'>) => Promise<NavItem>;
  deleteNavigationItem: (id: string) => Promise<boolean>;

  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  addMediaItem: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => Promise<MediaItem>;
  deleteMediaItem: (id: string) => Promise<boolean>;

  // Legacy/Platform Data Collections with CRUD
  games: GameItem[];
  setGames: React.Dispatch<React.SetStateAction<GameItem[]>>;
  videos: VideoItem[];
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  news: NewsItem[];
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  tournaments: TournamentItem[];
  setTournaments: React.Dispatch<React.SetStateAction<TournamentItem[]>>;
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    title: string,
    message: string,
    type?: 'tournament' | 'order' | 'community' | 'reward' | 'system',
    link?: string
  ) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, target: string, details: string, email?: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playUiSound: (type?: 'click' | 'success' | 'claim' | 'laser' | 'pop' | 'message') => void;

  // Global Gaming Mini Chat
  isMiniChatOpen: boolean;
  setIsMiniChatOpen: (open: boolean) => void;
  isMiniChatMinimized: boolean;
  setIsMiniChatMinimized: (minimized: boolean) => void;
  chatChannel: ChatChannel;
  setChatChannel: (channel: ChatChannel) => void;
  globalChatMessages: GlobalChatMessage[];
  sendGlobalChatMessage: (
    content: string,
    channel?: ChatChannel,
    senderProfile?: { id: string; username: string; displayName: string; avatarUrl: string; role?: string; level?: number; badge?: string }
  ) => Promise<boolean>;
  reactToGlobalChatMessage: (messageId: string, emoji: string) => Promise<void>;
  unreadChatCount: number;
  resetUnreadChatCount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialViewFromPath = (): AppView => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path === '/community' || path.startsWith('/community')) return 'community';
    if (path === '/games' || path.startsWith('/games')) return 'games';
    if (path === '/videos' || path.startsWith('/videos')) return 'videos';
    if (path === '/gallery' || path.startsWith('/gallery')) return 'gallery';
    if (path === '/news' || path.startsWith('/news')) return 'news';
    if (path === '/tournaments' || path.startsWith('/tournaments')) return 'tournaments';
    if (path === '/shop' || path.startsWith('/shop')) return 'shop';
    if (path === '/checkout' || path.startsWith('/checkout')) return 'checkout';
    if (path === '/dashboard' || path.startsWith('/dashboard')) return 'dashboard';
    if (path === '/rewards' || path.startsWith('/rewards')) return 'rewards';
    if (path === '/admin' || path.startsWith('/admin')) return 'admin';
    if (path === '/security' || path.startsWith('/security')) return 'security';
    if (path === '/search' || path.startsWith('/search')) return 'search';
  }
  return 'home';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>(getInitialViewFromPath);
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [adminActionItemId, setAdminActionItemId] = useState<string | null>(null);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedNewsSlug, setSelectedNewsSlug] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeLaunchingGame, setActiveLaunchingGame] = useState<GameItem | null>(null);
  const [activeGameDetail, setActiveGameDetail] = useState<GameItem | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dynamic CMS Store Data
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('cyberx_categories');
    return saved ? JSON.parse(saved) : SEED_CATEGORIES;
  });

  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() => {
    const saved = localStorage.getItem('cyberx_store_products');
    return saved ? JSON.parse(saved) : SEED_STORE_PRODUCTS;
  });

  const [storeVideos, setStoreVideos] = useState<StoreVideo[]>(() => {
    const saved = localStorage.getItem('cyberx_store_videos');
    return saved ? JSON.parse(saved) : SEED_STORE_VIDEOS;
  });

  const [banners, setBanners] = useState<BannerItem[]>(() => {
    const saved = localStorage.getItem('cyberx_banners');
    return saved ? JSON.parse(saved) : SEED_BANNERS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('cyberx_store_settings');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('cyberx_theme_settings');
    return saved ? JSON.parse(saved) : DEFAULT_THEME_SETTINGS;
  });

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('cyberx_announcements');
    return saved ? JSON.parse(saved) : SEED_ANNOUNCEMENTS;
  });

  const [navigationItems, setNavigationItems] = useState<NavItem[]>(() => {
    const saved = localStorage.getItem('cyberx_navigation_items');
    return saved ? JSON.parse(saved) : SEED_NAVIGATION;
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('cyberx_media_items');
    return saved ? JSON.parse(saved) : SEED_MEDIA_ITEMS;
  });

  // Dynamic Gaming Platform Data
  const [games, setGames] = useState<GameItem[]>(() => {
    const saved = localStorage.getItem('cyberx_games');
    return saved ? JSON.parse(saved) : SEED_GAMES;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('cyberx_videos');
    return saved ? JSON.parse(saved) : SEED_VIDEOS;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('cyberx_news');
    return saved ? JSON.parse(saved) : SEED_NEWS;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('cyberx_gallery');
    return saved ? JSON.parse(saved) : SEED_GALLERY;
  });

  const [tournaments, setTournaments] = useState<TournamentItem[]>(() => {
    const saved = localStorage.getItem('cyberx_tournaments');
    return saved ? JSON.parse(saved) : SEED_TOURNAMENTS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('cyberx_products');
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('cyberx_posts');
    return saved ? JSON.parse(saved) : SEED_POSTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'all',
      title: 'Spring Tournament LIVE',
      message: 'CYBER CLASH 2024 Semifinals are streaming now on main stage!',
      type: 'tournament',
      isRead: false,
      createdAt: '10m ago',
      link: 'tournaments',
    },
    {
      id: 'notif-2',
      userId: 'all',
      title: 'Daily Streak Bonus Ready',
      message: 'Claim your Day 7 streak reward of 250 CyberCredits!',
      type: 'reward',
      isRead: false,
      createdAt: '1h ago',
      link: 'rewards',
    },
  ]);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('cyberx_site_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SITE_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      adminEmail: 'admin@cyberx.gg',
      action: 'SYSTEM_INIT',
      target: 'CYBERX CMS Engine',
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      details: 'Initialized full CMS panel with categories, products, videos, and theme customizer.',
    },
  ]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Global Gaming Mini Chat States
  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);
  const [isMiniChatMinimized, setIsMiniChatMinimized] = useState(false);
  const [chatChannel, setChatChannel] = useState<ChatChannel>('general');
  const [globalChatMessages, setGlobalChatMessages] = useState<GlobalChatMessage[]>(() => {
    const saved = localStorage.getItem('cyberx_global_chat_messages');
    return saved ? JSON.parse(saved) : SEED_GLOBAL_CHAT_MESSAGES;
  });
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const resetUnreadChatCount = () => {
    setUnreadChatCount(0);
  };

  // Local Storage Synchronizations
  useEffect(() => {
    localStorage.setItem('cyberx_global_chat_messages', JSON.stringify(globalChatMessages));
  }, [globalChatMessages]);
  useEffect(() => {
    localStorage.setItem('cyberx_categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem('cyberx_store_products', JSON.stringify(storeProducts));
  }, [storeProducts]);
  useEffect(() => {
    localStorage.setItem('cyberx_store_videos', JSON.stringify(storeVideos));
  }, [storeVideos]);
  useEffect(() => {
    localStorage.setItem('cyberx_banners', JSON.stringify(banners));
  }, [banners]);
  useEffect(() => {
    localStorage.setItem('cyberx_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);
  useEffect(() => {
    localStorage.setItem('cyberx_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);
  useEffect(() => {
    localStorage.setItem('cyberx_announcements', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('cyberx_navigation_items', JSON.stringify(navigationItems));
  }, [navigationItems]);
  useEffect(() => {
    localStorage.setItem('cyberx_media_items', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('cyberx_games', JSON.stringify(games));
  }, [games]);
  useEffect(() => {
    localStorage.setItem('cyberx_videos', JSON.stringify(videos));
  }, [videos]);
  useEffect(() => {
    localStorage.setItem('cyberx_news', JSON.stringify(news));
  }, [news]);
  useEffect(() => {
    localStorage.setItem('cyberx_gallery', JSON.stringify(gallery));
  }, [gallery]);
  useEffect(() => {
    localStorage.setItem('cyberx_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);
  useEffect(() => {
    localStorage.setItem('cyberx_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('cyberx_posts', JSON.stringify(posts));
  }, [posts]);
  useEffect(() => {
    localStorage.setItem('cyberx_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  // Firestore Realtime Subscription and Seeding
  useEffect(() => {
    if (!db) return;

    try {
      const unsubCategories = onSnapshot(
        collection(db, 'categories'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as CategoryItem));
            items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setCategories(items);
          }
        },
        (error) => {
          console.warn('Firestore categories sync offline/skipped:', error.message);
        }
      );

      const unsubProducts = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as StoreProduct));
            items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setStoreProducts(items);
          }
        },
        (error) => {
          console.warn('Firestore products sync offline/skipped:', error.message);
        }
      );

      const unsubVideos = onSnapshot(
        collection(db, 'videos'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as StoreVideo));
            items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setStoreVideos(items);
          }
        },
        (error) => {
          console.warn('Firestore videos sync offline/skipped:', error.message);
        }
      );

      const unsubBanners = onSnapshot(
        collection(db, 'banners'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as BannerItem));
            items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setBanners(items);
          }
        },
        (error) => {
          console.warn('Firestore banners sync offline/skipped:', error.message);
        }
      );

      const unsubStoreSettings = onSnapshot(
        doc(db, 'storeSettings', 'main'),
        (snapshot) => {
          if (snapshot.exists()) {
            setStoreSettings(snapshot.data() as StoreSettings);
          }
        },
        (error) => {
          console.warn('Firestore storeSettings sync offline/skipped:', error.message);
        }
      );

      const unsubThemeSettings = onSnapshot(
        doc(db, 'themeSettings', 'main'),
        (snapshot) => {
          if (snapshot.exists()) {
            setThemeSettings(snapshot.data() as ThemeSettings);
          }
        },
        (error) => {
          console.warn('Firestore themeSettings sync offline/skipped:', error.message);
        }
      );

      const unsubChat = onSnapshot(
        collection(db, 'global_chat_messages'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as GlobalChatMessage));
            items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setGlobalChatMessages(items);
          }
        },
        (error) => {
          console.warn('Firestore global_chat_messages sync offline/skipped:', error.message);
        }
      );

      const unsubAuditLogs = onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as AuditLog));
            setAuditLogs(items);
          }
        },
        (error) => {
          console.warn('Firestore auditLogs sync offline/skipped:', error.message);
        }
      );

      return () => {
        unsubCategories();
        unsubProducts();
        unsubVideos();
        unsubBanners();
        unsubStoreSettings();
        unsubThemeSettings();
        unsubChat();
        unsubAuditLogs();
      };
    } catch (e) {
      console.warn('Firestore initialization error:', e);
    }
  }, []);

  // Synchronize storeVideos into customer videos collection in real time
  useEffect(() => {
    if (storeVideos && storeVideos.length > 0) {
      const activeVideos = storeVideos.filter((sv) => sv.status === 'Published' || sv.active !== false);
      const mapped: VideoItem[] = activeVideos.map((sv) => ({
        id: sv.id,
        title: sv.title,
        creator: sv.adminUploaderEmail ? sv.adminUploaderEmail.split('@')[0] : 'CYBERX Admin',
        thumbnail: sv.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        videoUrl: sv.videoUrl,
        views: typeof sv.views === 'number' ? `${sv.views.toLocaleString()} views` : (sv.views || '0 views'),
        duration: sv.durationFormatted || '00:00',
        category: (sv.category as any) || 'Trailers',
        publishedAt: sv.uploadDate ? new Date(sv.uploadDate).toLocaleDateString() : 'Recently',
        description: sv.description || '',
        isFeatured: sv.featured,
        likes: sv.likes ?? 0,
        tags: sv.tags,
        fileSizeFormatted: sv.fileSizeFormatted,
        resolution: sv.resolution,
        fps: sv.fps,
        codec: sv.codec,
        width: sv.width,
        height: sv.height,
        is4K: sv.is4K,
        originalFileName: sv.originalFileName,
        bitrateFormatted: sv.bitrateFormatted,
        format: sv.format,
        price: sv.price,
        discount: sv.discount,
        isFree: sv.isFree,
        status: sv.status,
        storagePath: sv.storagePath,
        adminUploaderEmail: sv.adminUploaderEmail,
      }));
      setVideos(mapped);
    }
  }, [storeVideos]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const playUiSound = (type: 'click' | 'success' | 'claim' | 'laser' | 'pop' | 'message' = 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'success' || type === 'claim') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'message') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {}
  };

  // Synchronize browser history and popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/community' || path.startsWith('/community')) {
        setCurrentView('community');
      } else if (path === '/games' || path.startsWith('/games')) {
        setCurrentView('games');
      } else if (path === '/videos' || path.startsWith('/videos')) {
        setCurrentView('videos');
      } else if (path === '/gallery' || path.startsWith('/gallery')) {
        setCurrentView('gallery');
      } else if (path === '/news' || path.startsWith('/news')) {
        setCurrentView('news');
      } else if (path === '/tournaments' || path.startsWith('/tournaments')) {
        setCurrentView('tournaments');
      } else if (path === '/shop' || path.startsWith('/shop')) {
        setCurrentView('shop');
      } else if (path === '/checkout' || path.startsWith('/checkout')) {
        setCurrentView('checkout');
      } else if (path === '/dashboard' || path.startsWith('/dashboard')) {
        setCurrentView('dashboard');
      } else if (path === '/rewards' || path.startsWith('/rewards')) {
        setCurrentView('rewards');
      } else if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (path === '/security' || path.startsWith('/security')) {
        setCurrentView('security');
      } else if (path === '/search' || path.startsWith('/search')) {
        setCurrentView('search');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (view: AppView, params?: Record<string, string>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'home' ? '/' : `/${view}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
    if (params) {
      if (params.gameId) setSelectedGameId(params.gameId);
      if (params.newsSlug) setSelectedNewsSlug(params.newsSlug);
      if (params.tournamentId) setSelectedTournamentId(params.tournamentId);
      if (params.productId) setSelectedProductId(params.productId);
      if (params.username) setSelectedProfileUsername(params.username);
      if (params.q) setSearchQuery(params.q);
      if (params.section) setAdminSection(params.section as AdminSection);
      if (params.actionId) setAdminActionItemId(params.actionId);
    }
  };

  // --- Category CRUD ---
  const addCategory = async (catData: Omit<CategoryItem, 'id' | 'createdAt'>): Promise<CategoryItem> => {
    const id = `cat-${Date.now()}`;
    const newCat: CategoryItem = {
      ...catData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    try {
      if (db) {
        await setDoc(doc(db, 'categories', id), newCat);
      }
    } catch (e) {
      console.warn('Firestore write failed, stored in local state', e);
    }
    addAuditLog('CREATE_CATEGORY', newCat.name, `Created category "${newCat.name}"`);
    showToast('Category Created', `Category "${newCat.name}" successfully created.`);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    try {
      if (db) {
        await updateDoc(doc(db, 'categories', id), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Firestore update failed, updated in local state', e);
    }
    addAuditLog('UPDATE_CATEGORY', id, `Updated category properties`);
    showToast('Category Updated', 'Changes saved successfully.');
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const cat = categories.find((c) => c.id === id);
    const relatedProducts = storeProducts.filter((p) => p.categoryId === id);
    if (relatedProducts.length > 0) {
      showToast(
        'Cannot Delete Category',
        `Category has ${relatedProducts.length} active products linked. Please reassign or delete them first.`,
        'warning'
      );
      return false;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'categories', id));
      }
    } catch (e) {
      console.warn('Firestore delete failed, removed from local state', e);
    }
    if (cat) {
      addAuditLog('DELETE_CATEGORY', cat.name, `Deleted category "${cat.name}"`);
    }
    showToast('Category Deleted', 'Category removed successfully.');
    return true;
  };

  // --- Store Product CRUD ---
  const addStoreProduct = async (prodData: Omit<StoreProduct, 'id' | 'createdAt'>): Promise<StoreProduct> => {
    const id = `prod-${Date.now()}`;
    const newProd: StoreProduct = {
      ...prodData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoreProducts((prev) => [...prev, newProd]);
    try {
      if (db) {
        await setDoc(doc(db, 'products', id), newProd);
      }
    } catch (e) {
      console.warn('Firestore write failed, stored in local state', e);
    }
    addAuditLog('CREATE_PRODUCT', newProd.title, `Added product "${newProd.title}" at $${newProd.price}`);
    showToast('Product Created', `"${newProd.title}" added to inventory.`);
    return newProd;
  };

  const updateStoreProduct = async (id: string, updates: Partial<StoreProduct>) => {
    setStoreProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    try {
      if (db) {
        await updateDoc(doc(db, 'products', id), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Firestore update failed, updated in local state', e);
    }
    addAuditLog('UPDATE_PRODUCT', id, `Updated product details`);
    showToast('Product Updated', 'Product changes saved successfully.');
  };

  const deleteStoreProduct = async (id: string): Promise<boolean> => {
    const prod = storeProducts.find((p) => p.id === id);
    setStoreProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'products', id));
      }
    } catch (e) {
      console.warn('Firestore delete failed, removed from local state', e);
    }
    if (prod) {
      addAuditLog('DELETE_PRODUCT', prod.title, `Deleted product "${prod.title}"`);
    }
    showToast('Product Deleted', 'Product removed from store catalog.');
    return true;
  };

  const toggleProductActive = async (id: string) => {
    const prod = storeProducts.find((p) => p.id === id);
    if (!prod) return;
    const newStatus = !prod.active;
    await updateStoreProduct(id, { active: newStatus });
    showToast(
      newStatus ? 'Product Activated' : 'Product Deactivated',
      `"${prod.title}" is now ${newStatus ? 'visible' : 'hidden'} on the storefront.`
    );
  };

  const toggleProductFeatured = async (id: string) => {
    const prod = storeProducts.find((p) => p.id === id);
    if (!prod) return;
    const newFeatured = !prod.featured;
    await updateStoreProduct(id, { featured: newFeatured });
    showToast(
      newFeatured ? 'Featured on Homepage' : 'Removed from Featured',
      `"${prod.title}" ${newFeatured ? 'is now spotlighted' : 'removed from spotlight'}.`
    );
  };

  // --- Store Video CRUD ---
  const addStoreVideo = async (
    vidData: Omit<StoreVideo, 'id' | 'createdAt'>
  ): Promise<StoreVideo & { dbSuccess?: boolean; dbError?: string }> => {
    const id = vidData.videoId || `vid-${Date.now()}`;
    const newVid: StoreVideo = {
      ...vidData,
      id,
      videoId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoreVideos((prev) => [...prev, newVid]);
    let dbSuccess = false;
    let dbError: string | undefined;
    try {
      if (db) {
        await setDoc(doc(db, 'videos', id), newVid);
        dbSuccess = true;
      } else {
        dbError = 'Firestore database client unavailable';
      }
    } catch (e: any) {
      console.warn('Firestore video document write failed:', e);
      dbError = e?.message || 'Firestore permission or network error';
    }
    addAuditLog('CREATE_VIDEO', newVid.title, `Uploaded video asset "${newVid.title}" (DB: ${dbSuccess ? 'OK' : 'Failed'})`);
    if (dbSuccess) {
      showToast('Video Published', `"${newVid.title}" published to video hub.`);
    }
    return { ...newVid, dbSuccess, dbError };
  };

  const retrySaveVideoToFirestore = async (video: StoreVideo): Promise<{ success: boolean; error?: string }> => {
    try {
      if (db) {
        await setDoc(doc(db, 'videos', video.id), {
          ...video,
          processingStatus: 'Ready',
          updatedAt: new Date().toISOString(),
        });
        setStoreVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, processingStatus: 'Ready' } : v))
        );
        showToast('Firestore Synchronized', `"${video.title}" metadata successfully saved to database.`);
        return { success: true };
      }
      return { success: false, error: 'Database service unavailable' };
    } catch (err: any) {
      console.error('Retry save to Firestore failed:', err);
      return { success: false, error: err?.message || 'Database write error' };
    }
  };

  const updateStoreVideo = async (id: string, updates: Partial<StoreVideo>) => {
    setStoreVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
    try {
      if (db) {
        await updateDoc(doc(db, 'videos', id), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Firestore video update fallback to local', e);
    }
    addAuditLog('UPDATE_VIDEO', id, `Updated video settings`);
    showToast('Video Updated', 'Video properties saved.');
  };

  const deleteStoreVideo = async (id: string): Promise<boolean> => {
    const vid = storeVideos.find((v) => v.id === id);
    setStoreVideos((prev) => prev.filter((v) => v.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'videos', id));
      }
    } catch (e) {
      console.warn('Firestore video delete fallback to local', e);
    }
    if (vid) {
      addAuditLog('DELETE_VIDEO', vid.title, `Deleted video "${vid.title}"`);
    }
    showToast('Video Deleted', 'Video removed from library.');
    return true;
  };

  const toggleVideoActive = async (id: string) => {
    const vid = storeVideos.find((v) => v.id === id);
    if (!vid) return;
    const newActive = !vid.active;
    await updateStoreVideo(id, { active: newActive });
  };

  const toggleVideoFeatured = async (id: string) => {
    const vid = storeVideos.find((v) => v.id === id);
    if (!vid) return;
    const newFeatured = !vid.featured;
    await updateStoreVideo(id, { featured: newFeatured });
  };

  // --- Banner CRUD ---
  const addBanner = async (bannerData: Omit<BannerItem, 'id' | 'createdAt'>): Promise<BannerItem> => {
    const id = `ban-${Date.now()}`;
    const newBanner: BannerItem = {
      ...bannerData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBanners((prev) => [...prev, newBanner]);
    try {
      if (db) {
        await setDoc(doc(db, 'banners', id), newBanner);
      }
    } catch (e) {
      console.warn('Firestore banner write fallback', e);
    }
    addAuditLog('CREATE_BANNER', newBanner.title, `Created promotional banner "${newBanner.title}"`);
    showToast('Banner Added', 'New promotional banner active.');
    return newBanner;
  };

  const updateBanner = async (id: string, updates: Partial<BannerItem>) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
    try {
      if (db) {
        await updateDoc(doc(db, 'banners', id), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Firestore banner update fallback', e);
    }
    addAuditLog('UPDATE_BANNER', id, 'Updated banner content');
    showToast('Banner Updated', 'Banner modifications saved.');
  };

  const deleteBanner = async (id: string): Promise<boolean> => {
    const ban = banners.find((b) => b.id === id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'banners', id));
      }
    } catch (e) {
      console.warn('Firestore banner delete fallback', e);
    }
    if (ban) {
      addAuditLog('DELETE_BANNER', ban.title, `Deleted banner "${ban.title}"`);
    }
    showToast('Banner Deleted', 'Banner removed from homepage carousel.');
    return true;
  };

  const toggleBannerActive = async (id: string) => {
    const ban = banners.find((b) => b.id === id);
    if (!ban) return;
    await updateBanner(id, { active: !ban.active });
  };

  // --- Store & Theme Settings ---
  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...settings, updatedAt: new Date().toISOString() };
    setStoreSettings(updated);
    try {
      if (db) {
        await setDoc(doc(db, 'storeSettings', 'main'), updated, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore storeSettings fallback', e);
    }
    addAuditLog('UPDATE_STORE_SETTINGS', 'Storefront Configuration', 'Updated global store metadata & contact info');
    showToast('Store Settings Saved', 'Storefront configuration updated successfully.');
  };

  const updateThemeSettings = async (settings: Partial<ThemeSettings>) => {
    const updated = { ...themeSettings, ...settings, updatedAt: new Date().toISOString() };
    setThemeSettings(updated);
    try {
      if (db) {
        await setDoc(doc(db, 'themeSettings', 'main'), updated, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore themeSettings fallback', e);
    }
    addAuditLog('UPDATE_THEME_SETTINGS', 'Visual Theme', 'Updated primary colors, button styles, and border radius');
    showToast('Theme Updated', 'Storefront appearance updated in real time.');
  };

  // --- Announcements CMS ---
  const addAnnouncement = async (annData: Omit<AnnouncementItem, 'id'>): Promise<AnnouncementItem> => {
    const id = `ann-${Date.now()}`;
    const newAnn: AnnouncementItem = { ...annData, id };
    setAnnouncements((prev) => [newAnn, ...prev]);
    try {
      if (db) {
        await setDoc(doc(db, 'announcements', id), newAnn);
      }
    } catch (e) {
      console.warn('Firestore announcement fallback', e);
    }
    showToast('Announcement Added', 'New banner message is ready.');
    return newAnn;
  };

  const updateAnnouncement = async (id: string, updates: Partial<AnnouncementItem>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    try {
      if (db) {
        await updateDoc(doc(db, 'announcements', id), updates);
      }
    } catch (e) {
      console.warn('Firestore announcement update fallback', e);
    }
    showToast('Announcement Saved', 'Changes published.');
  };

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'announcements', id));
      }
    } catch (e) {
      console.warn('Firestore announcement delete fallback', e);
    }
    showToast('Announcement Deleted', 'Removed from header.');
    return true;
  };

  // --- Navigation CMS ---
  const updateNavigationItems = async (items: NavItem[]) => {
    setNavigationItems(items);
    try {
      if (db) {
        for (const item of items) {
          await setDoc(doc(db, 'navigation', item.id), item);
        }
      }
    } catch (e) {
      console.warn('Firestore nav items update fallback', e);
    }
    showToast('Navigation Updated', 'Header menu layout updated.');
  };

  const addNavigationItem = async (itemData: Omit<NavItem, 'id'>): Promise<NavItem> => {
    const id = `nav-${Date.now()}`;
    const newItem: NavItem = { ...itemData, id };
    setNavigationItems((prev) => [...prev, newItem]);
    try {
      if (db) {
        await setDoc(doc(db, 'navigation', id), newItem);
      }
    } catch (e) {
      console.warn('Firestore add nav fallback', e);
    }
    showToast('Nav Link Added', `"${newItem.label}" added to menu.`);
    return newItem;
  };

  const deleteNavigationItem = async (id: string): Promise<boolean> => {
    setNavigationItems((prev) => prev.filter((n) => n.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'navigation', id));
      }
    } catch (e) {
      console.warn('Firestore delete nav fallback', e);
    }
    showToast('Nav Link Removed', 'Menu item deleted.');
    return true;
  };

  // --- Media Library CRUD ---
  const addMediaItem = async (mediaData: Omit<MediaItem, 'id' | 'uploadedAt'>): Promise<MediaItem> => {
    const id = `med-${Date.now()}`;
    const newMedia: MediaItem = {
      ...mediaData,
      id,
      uploadedAt: new Date().toISOString(),
    };
    setMediaItems((prev) => [newMedia, ...prev]);
    try {
      if (db) {
        await setDoc(doc(db, 'media', id), newMedia);
      }
    } catch (e) {
      console.warn('Firestore media add fallback', e);
    }
    addAuditLog('UPLOAD_MEDIA', newMedia.name, `Uploaded media asset (${newMedia.type})`);
    showToast('Media Uploaded', `"${newMedia.name}" is stored in media library.`);
    return newMedia;
  };

  const deleteMediaItem = async (id: string): Promise<boolean> => {
    const media = mediaItems.find((m) => m.id === id);
    if (!media) return false;

    // Check if media URL is used in active products or banners
    const usedInProducts = storeProducts.filter((p) => p.imageUrl === media.url);
    const usedInBanners = banners.filter((b) => b.imageUrl === media.url);
    const usedInVideos = storeVideos.filter((v) => v.thumbnailUrl === media.url || v.videoUrl === media.url);

    if (usedInProducts.length > 0 || usedInBanners.length > 0 || usedInVideos.length > 0) {
      const usageCount = usedInProducts.length + usedInBanners.length + usedInVideos.length;
      showToast(
        'Media In Use',
        `This asset is currently used in ${usageCount} live catalog item(s). Please replace them first.`,
        'warning'
      );
      return false;
    }

    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'media', id));
      }
    } catch (e) {
      console.warn('Firestore delete media fallback', e);
    }
    addAuditLog('DELETE_MEDIA', media.name, `Deleted media asset "${media.name}"`);
    showToast('Media Deleted', 'Asset removed from library.');
    return true;
  };

  // Video and modal helpers
  const openVideoPlayer = (video: VideoItem) => {
    setActiveVideo(video);
  };
  const closeVideoPlayer = () => {
    setActiveVideo(null);
  };
  const launchGameSimulator = (game: GameItem) => {
    setActiveLaunchingGame(game);
  };
  const closeGameSimulator = () => {
    setActiveLaunchingGame(null);
  };
  const openGameDetailModal = (game: GameItem) => {
    setActiveGameDetail(game);
  };
  const closeGameDetailModal = () => {
    setActiveGameDetail(null);
  };
  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Notifications updated', 'All notifications marked as read', 'info');
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'tournament' | 'order' | 'community' | 'reward' | 'system' = 'system',
    link?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user',
      title,
      message,
      type,
      isRead: false,
      createdAt: 'Just now',
      link,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
    showToast('Settings Saved', 'Platform configuration successfully updated');
  };

  const addAuditLog = (action: string, target: string, details: string, email = 'admin@cyberx.gg') => {
    const id = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id,
      adminEmail: email,
      action,
      target,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    try {
      if (db) {
        setDoc(doc(db, 'auditLogs', id), newLog).catch((e) => {
          console.warn('Firestore auditLog write queued locally:', e);
        });
      }
    } catch {}
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const activeRoute: ActiveRoute = {
    name: currentView,
    params: {
      ...(selectedGameId ? { gameId: selectedGameId } : {}),
      ...(selectedNewsSlug ? { newsSlug: selectedNewsSlug } : {}),
      ...(selectedTournamentId ? { tournamentId: selectedTournamentId } : {}),
      ...(selectedProductId ? { productId: selectedProductId } : {}),
      ...(selectedProfileUsername ? { username: selectedProfileUsername } : {}),
      ...(searchQuery ? { query: searchQuery, q: searchQuery } : {}),
      ...(adminSection ? { section: adminSection } : {}),
    },
  };

  const sendGlobalChatMessage = async (
    content: string,
    targetChannel: ChatChannel = chatChannel,
    senderProfile?: { id: string; username: string; displayName: string; avatarUrl: string; role?: string; level?: number; badge?: string }
  ): Promise<boolean> => {
    if (!content.trim()) return false;
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: GlobalChatMessage = {
      id,
      userId: senderProfile?.id || 'usr_cyber_ace',
      username: senderProfile?.username || 'CyberAce_99',
      displayName: senderProfile?.displayName || 'Neo Stryker',
      avatarUrl: senderProfile?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberAce',
      role: senderProfile?.role || 'USER',
      userLevel: senderProfile?.level || 18,
      badge: senderProfile?.badge || (senderProfile?.role === 'OWNER' || senderProfile?.role === 'ADMIN' ? 'STAFF' : 'CYBER PRO'),
      content: content.trim(),
      channel: targetChannel,
      reactions: {},
      createdAt: new Date().toISOString(),
    };

    setGlobalChatMessages((prev) => [...prev, newMsg]);
    playUiSound('message');

    try {
      if (db) {
        await setDoc(doc(db, 'global_chat_messages', id), newMsg);
      }
    } catch (err) {
      console.warn('Firestore message write queued locally:', err);
    }
    return true;
  };

  const reactToGlobalChatMessage = async (messageId: string, emoji: string) => {
    playUiSound('pop');
    let updatedMsg: GlobalChatMessage | undefined;

    setGlobalChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = { ...(msg.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          updatedMsg = { ...msg, reactions: currentReactions };
          return updatedMsg;
        }
        return msg;
      })
    );

    try {
      if (db && updatedMsg) {
        await updateDoc(doc(db, 'global_chat_messages', messageId), {
          reactions: updatedMsg.reactions,
        });
      }
    } catch (e) {
      console.warn('Firestore reaction update stored in local state:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        activeRoute,
        setCurrentView,
        navigate,
        adminSection,
        setAdminSection,
        adminActionItemId,
        setAdminActionItemId,
        selectedGameId,
        setSelectedGameId,
        selectedNewsSlug,
        setSelectedNewsSlug,
        selectedTournamentId,
        setSelectedTournamentId,
        selectedProductId,
        setSelectedProductId,
        selectedProfileUsername,
        setSelectedProfileUsername,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        activeVideo,
        openVideoPlayer,
        closeVideoPlayer,
        activeLaunchingGame,
        launchGameSimulator,
        closeGameSimulator,
        activeGameDetail,
        openGameDetailModal,
        closeGameDetailModal,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        toasts,
        showToast,
        removeToast,
        // Global Gaming Mini Chat
        isMiniChatOpen,
        setIsMiniChatOpen,
        isMiniChatMinimized,
        setIsMiniChatMinimized,
        chatChannel,
        setChatChannel,
        globalChatMessages,
        sendGlobalChatMessage,
        reactToGlobalChatMessage,
        unreadChatCount,
        resetUnreadChatCount,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        storeProducts,
        setStoreProducts,
        addStoreProduct,
        updateStoreProduct,
        deleteStoreProduct,
        toggleProductActive,
        toggleProductFeatured,
        storeVideos,
        setStoreVideos,
        addStoreVideo,
        updateStoreVideo,
        deleteStoreVideo,
        retrySaveVideoToFirestore,
        toggleVideoActive,
        toggleVideoFeatured,
        banners,
        setBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        storeSettings,
        updateStoreSettings,
        themeSettings,
        updateThemeSettings,
        announcements,
        setAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        navigationItems,
        setNavigationItems,
        updateNavigationItems,
        addNavigationItem,
        deleteNavigationItem,
        mediaItems,
        setMediaItems,
        addMediaItem,
        deleteMediaItem,
        games,
        setGames,
        videos,
        setVideos,
        news,
        setNews,
        gallery,
        setGallery,
        tournaments,
        setTournaments,
        products,
        setProducts,
        posts,
        setPosts,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        siteSettings,
        updateSiteSettings,
        auditLogs,
        addAuditLog,
        soundEnabled,
        setSoundEnabled,
        playUiSound,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
