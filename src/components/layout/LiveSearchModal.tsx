import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Gamepad2, Video, Newspaper, ShoppingBag, ArrowRight } from 'lucide-react';

export const LiveSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    games,
    videos,
    news,
    products,
    navigate,
    openGameDetailModal,
    openVideoPlayer,
  } = useApp();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Games' | 'Videos' | 'News' | 'Shop'>('All');

  if (!isSearchModalOpen) return null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { games: [], videos: [], news: [], products: [] };

    return {
      games: games.filter((g) => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q)),
      videos: videos.filter((v) => v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)),
      news: news.filter((n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)),
      products: products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
    };
  }, [query, games, videos, news, products]);

  const totalMatches =
    results.games.length + results.videos.length + results.news.length + results.products.length;

  const handleSelectGame = (game: any) => {
    setIsSearchModalOpen(false);
    openGameDetailModal(game);
  };

  const handleSelectVideo = (video: any) => {
    setIsSearchModalOpen(false);
    openVideoPlayer(video);
  };

  const handleSelectNews = (slug: string) => {
    setIsSearchModalOpen(false);
    navigate('news', { newsSlug: slug });
  };

  const handleSelectProduct = (id: string) => {
    setIsSearchModalOpen(false);
    navigate('shop', { productId: id });
  };

  const handleViewAll = () => {
    setIsSearchModalOpen(false);
    navigate('search', { q: query });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, videos, articles, gaming gear..."
            className="w-full bg-transparent text-slate-800 text-base sm:text-lg font-medium focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-200/80 hover:bg-slate-300 rounded-lg transition"
          >
            ESC
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-100 flex gap-2 overflow-x-auto text-xs font-semibold">
          {(['All', 'Games', 'Videos', 'News', 'Shop'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full transition ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Suggestions / Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium">Type to search the entire CYBERX ecosystem</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs">
                <span className="text-slate-500">Popular:</span>
                {['Cyber Strike', 'Neon Riders', 'Tournament', 'Wireless Headset', 'Battle Pass'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="font-bold text-base">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or browse our categories</p>
            </div>
          ) : (
            <>
              {/* Games */}
              {(activeCategory === 'All' || activeCategory === 'Games') && results.games.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-blue-500" /> Games ({results.games.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.games.slice(0, 3).map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleSelectGame(g)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition"
                      >
                        <img
                          src={g.coverImage}
                          alt={g.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{g.title}</p>
                            {g.badge && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                {g.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{g.genre} &bull; ★ {g.rating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(activeCategory === 'All' || activeCategory === 'Videos') && results.videos.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-500" /> Videos ({results.videos.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.videos.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVideo(v)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer transition"
                      >
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-16 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{v.title}</p>
                          <p className="text-xs text-slate-500">{v.creator} &bull; {v.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {(activeCategory === 'All' || activeCategory === 'News') && results.news.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-cyan-500" /> Articles & Updates ({results.news.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.news.slice(0, 2).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleSelectNews(n.slug)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cyan-50/60 cursor-pointer transition"
                      >
                        <img
                          src={n.thumbnail}
                          alt={n.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{n.title}</p>
                          <p className="text-xs text-slate-500">{n.publishedAt} &bull; {n.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {(activeCategory === 'All' || activeCategory === 'Shop') && results.products.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> Gear & Merch ({results.products.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.products.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.id)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs font-extrabold text-emerald-600">${p.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {query.trim() && totalMatches > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{totalMatches} result(s) found</span>
            <button
              onClick={handleViewAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View full search page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
