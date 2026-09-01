import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppProvider, useApp } from './context/AppContext';

// Layout
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { LiveSearchModal } from './components/layout/LiveSearchModal';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalMiniChat } from './components/chat/GlobalMiniChat';

// Modals
import { VideoPlayerModal } from './components/videos/VideoPlayerModal';
import { GameLauncherModal } from './components/games/GameLauncherModal';
import { GameDetailModal } from './components/games/GameDetailModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { GamesView } from './views/GamesView';
import { VideosView } from './views/VideosView';
import { GalleryView } from './views/GalleryView';
import { NewsView } from './views/NewsView';
import { CommunityView } from './views/CommunityView';
import { TournamentsView } from './views/TournamentsView';
import { ShopView } from './views/ShopView';
import { CheckoutView } from './views/CheckoutView';
import { DashboardView } from './views/DashboardView';
import { RewardsView } from './views/RewardsView';
import { AdminView } from './views/AdminView';
import { SecurityView } from './views/SecurityView';
import { SearchResultsView } from './views/SearchResultsView';

import { Sparkles, BrainCircuit } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, activeRoute, setIsAIAssistantOpen, playUiSound } = useApp();

  const viewName = activeRoute?.name || currentView || 'home';

  // Dedicated Full-Console rendering for Admin Panel
  if (viewName === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <AdminView />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (viewName) {
      case 'home':
        return <HomeView />;
      case 'games':
        return <GamesView />;
      case 'videos':
        return <VideosView />;
      case 'gallery':
        return <GalleryView />;
      case 'news':
        return <NewsView />;
      case 'community':
        return <CommunityView />;
      case 'tournaments':
        return <TournamentsView />;
      case 'shop':
        return <ShopView />;
      case 'checkout':
        return <CheckoutView />;
      case 'dashboard':
        return <DashboardView />;
      case 'rewards':
        return <RewardsView />;
      case 'admin':
        return <AdminView />;
      case 'security':
        return <SecurityView />;
      case 'search':
        return <SearchResultsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Navigation Header matching the design */}
      <Header />

      {/* Main Dynamic View Outlet */}
      <main className="flex-1 w-full">{renderCurrentView()}</main>

      {/* Global Footer */}
      <Footer />

      {/* Floating AI Mastermind Action Button */}
      <button
        onClick={() => {
          playUiSound('click');
          setIsAIAssistantOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-full shadow-2xl shadow-indigo-500/30 flex items-center gap-2 transition transform hover:scale-105 active:scale-95 group border border-white/20"
        title="Open Gemini 3.1 Pro Tactical AI Mastermind"
      >
        <BrainCircuit className="w-4 h-4 text-cyan-200 animate-pulse" />
        <span className="hidden sm:inline">AI Tactical Mastermind</span>
        <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase">3.1 Pro</span>
      </button>

      {/* Global Overlays & Modals */}
      <GlobalMiniChat />
      <LiveSearchModal />
      <CartDrawer />
      <VideoPlayerModal />
      <GameLauncherModal />
      <GameDetailModal />
      <AIAssistantModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </CartProvider>
    </AuthProvider>
  );
}
