import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Gamepad2, Video, Newspaper, ShoppingBag, Trophy, ArrowRight } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const { searchQuery, activeRoute, games, videos, news, products, tournaments, openGameDetailModal, openVideoPlayer, navigate, playUiSound } =
    useApp();
  const query = searchQuery || activeRoute?.params?.query || '';

  const matchedGames = games.filter(
    (g) => g.title.toLowerCase().includes(query.toLowerCase()) || g.genre.toLowerCase().includes(query.toLowerCase())
  );
  const matchedVideos = videos.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()));
  const matchedNews = news.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
  const matchedProducts = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const matchedTournaments = tournaments.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

  const totalResults =
    matchedGames.length + matchedVideos.length + matchedNews.length + matchedProducts.length + matchedTournaments.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
          <Search className="w-3.5 h-3.5" />
          <span>Global Search Results</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Showing results for <span className="text-blue-600">"{query}"</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">{totalResults} matching results found across the CYBERX platform.</p>
      </div>

      {/* Games Section */}
      {matchedGames.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-blue-600" /> Games ({matchedGames.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchedGames.map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  playUiSound('click');
                  openGameDetailModal(g);
                }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-3"
              >
                <img src={g.coverImage} alt={g.title} className="w-12 h-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{g.title}</h4>
                  <span className="text-[11px] text-slate-500">{g.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {matchedVideos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-600" /> Videos ({matchedVideos.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  playUiSound('click');
                  openVideoPlayer(v);
                }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-3"
              >
                <img src={v.thumbnail} alt={v.title} className="w-16 h-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{v.title}</h4>
                  <span className="text-[11px] text-slate-500">{v.duration} &bull; {v.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {matchedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" /> Store Gear ({matchedProducts.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  playUiSound('click');
                  navigate('shop');
                }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-3"
              >
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                  <span className="text-xs font-black text-slate-900">${p.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
