import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GameItem } from '../types';
import { Search, Filter, Star, Heart, Play, Sparkles, Gamepad2, ArrowUpDown } from 'lucide-react';

export const GamesView: React.FC = () => {
  const { games, openGameDetailModal, launchGameSimulator, playUiSound, showToast } = useApp();
  const { currentUser, toggleWishlistGame } = useAuth();

  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const genres = ['All', 'FPS', 'Racing', 'RPG', 'Battle Royale', 'Adventure', 'Sci-Fi Strategy', 'Action'];

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const matchesGenre = selectedGenre === 'All' || g.genre.toLowerCase() === selectedGenre.toLowerCase();
        const matchesSearch =
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.genre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGenre && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        return b.reviewCount - a.reviewCount;
      });
  }, [games, selectedGenre, searchQuery, sortBy]);

  const handleWishlist = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    playUiSound('click');
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to save games', 'info');
      return;
    }
    const added = await toggleWishlistGame(gameId);
    showToast(
      added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      added ? 'Game saved to your wishlist' : 'Removed from wishlist'
    );
  };

  const handlePlayNow = (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    playUiSound('laser');
    launchGameSimulator(game);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-3 border border-blue-400/30">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>CYBERX GAME CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            NEXT-GEN <span className="text-blue-400">GAMES</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Discover premier cloud-enabled titles, tactical shooters, lightning racers, and immersive RPGs.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                playUiSound('click');
                setSelectedGenre(genre);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-slate-50 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Release</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No games matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the genre filter or search query</p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const isWishlisted = currentUser?.wishlist.includes(game.id);
            return (
              <div
                key={game.id}
                onClick={() => {
                  playUiSound('click');
                  openGameDetailModal(game);
                }}
                className="group bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Badge */}
                  {game.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white font-black text-[10px] uppercase rounded-md shadow-md">
                      {game.badge}
                    </span>
                  )}

                  {/* Wishlist toggle */}
                  <button
                    onClick={(e) => handleWishlist(e, game.id)}
                    aria-label={isWishlisted ? `Remove ${game.title} from wishlist` : `Add ${game.title} to wishlist`}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-md ${
                      isWishlisted
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900/70 text-white hover:bg-white hover:text-rose-500 opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Players Tag */}
                  <div className="absolute bottom-3 left-3 text-[11px] font-bold text-slate-200 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
                    {game.playerCount} Playing
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{game.genre} &bull; {game.developer}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{game.rating}</span>
                      <span className="text-slate-400 font-normal">({game.reviewCount})</span>
                    </div>

                    <button
                      onClick={(e) => handlePlayNow(e, game)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition transform hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
