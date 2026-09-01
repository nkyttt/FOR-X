import React, { useRef } from 'react';
import { ChevronRight, Star, Heart, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { GameItem } from '../../types';

export const PopularGamesSection: React.FC = () => {
  const { games, navigate, launchGameSimulator, openGameDetailModal, playUiSound, showToast } = useApp();
  const { currentUser, toggleWishlistGame } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    playUiSound('click');
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handlePlayNow = (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    playUiSound('laser');
    launchGameSimulator(game);
  };

  const handleWishlist = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    playUiSound('click');
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to save games to your wishlist', 'info');
      return;
    }
    const added = await toggleWishlistGame(gameId);
    showToast(
      added ? 'Added to Wishlist' : 'Removed from Wishlist',
      added ? 'Game saved to your dashboard library' : 'Game removed from wishlist',
      added ? 'success' : 'info'
    );
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'HOT':
        return 'bg-rose-500 text-white';
      case 'NEW':
        return 'bg-emerald-500 text-white';
      case 'TRENDING':
        return 'bg-indigo-600 text-white';
      case 'EXCLUSIVE':
        return 'bg-cyan-500 text-white';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  return (
    <div className="w-full my-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
            POPULAR GAMES
          </h2>
        </div>
        <button
          onClick={() => {
            playUiSound('click');
            navigate('games');
          }}
          className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition"
        >
          View All Games
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.slice(0, 6).map((game) => {
            const isWishlisted = currentUser?.wishlist.includes(game.id);
            return (
              <div
                key={game.id}
                onClick={() => {
                  playUiSound('click');
                  openGameDetailModal(game);
                }}
                className="group/card relative w-56 sm:w-64 bg-white rounded-3xl p-3 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer shrink-0 flex flex-col justify-between"
              >
                {/* Artwork */}
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Badge */}
                  {game.badge && (
                    <span
                      className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm ${getBadgeStyle(
                        game.badge
                      )}`}
                    >
                      {game.badge}
                    </span>
                  )}

                  {/* Wishlist Toggle Button */}
                  <button
                    onClick={(e) => handleWishlist(e, game.id)}
                    aria-label={isWishlisted ? `Remove ${game.title} from wishlist` : `Add ${game.title} to wishlist`}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow-md ${
                      isWishlisted
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900/60 text-white hover:bg-white hover:text-rose-500 opacity-80 group-hover/card:opacity-100'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Details */}
                <div className="mt-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover/card:text-blue-600 transition truncate">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{game.genre}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{game.rating}</span>
                    </div>

                    <button
                      onClick={(e) => handlePlayNow(e, game)}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1 shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrow Button */}
        <button
          onClick={scrollRight}
          aria-label="Scroll popular games right"
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-110 flex items-center justify-center transition z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
