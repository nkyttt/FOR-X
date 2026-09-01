import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Star,
  Heart,
  Play,
  Share2,
  Check,
  Cpu,
  HardDrive,
  Monitor,
  Layers,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const GameDetailModal: React.FC = () => {
  const { activeGameDetail, closeGameDetailModal, launchGameSimulator, playUiSound, showToast } = useApp();
  const { currentUser, toggleWishlistGame, addXpAndPoints } = useAuth();

  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      username: 'CyberGhost_99',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ghost',
      rating: 5,
      comment: 'Best tactical shooter in years. The cybernetics perk tree allows for insane outplay potential on Sector 7!',
      date: '2 days ago',
    },
    {
      id: 'rev-2',
      username: 'NeoValkyrie',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valk',
      rating: 4,
      comment: 'Fluid 144Hz movement mechanics and crisp weapon sound design. Can not wait for the next tournament stage.',
      date: '1 week ago',
    },
  ]);

  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!activeGameDetail) return null;

  const isWishlisted = currentUser?.wishlist.includes(activeGameDetail.id);

  const handleWishlistToggle = async () => {
    playUiSound('click');
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to save games', 'info');
      return;
    }
    const added = await toggleWishlistGame(activeGameDetail.id);
    showToast(
      added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      added ? `${activeGameDetail.title} is now in your wishlist` : 'Removed from wishlist'
    );
  };

  const handleShare = () => {
    playUiSound('click');
    if (navigator.share) {
      navigator.share({
        title: `${activeGameDetail.title} on CYBERX`,
        text: activeGameDetail.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Game link copied to clipboard', 'info');
    }
  };

  const handlePlayNow = () => {
    playUiSound('laser');
    closeGameDetailModal();
    launchGameSimulator(activeGameDetail);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      username: currentUser?.displayName || 'Anonymous Player',
      avatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
      rating: userRating,
      comment: reviewComment.trim(),
      date: 'Just now',
    };

    setReviews([newRev, ...reviews]);
    setReviewComment('');
    playUiSound('success');
    addXpAndPoints(100, 25, 'Reviewed Game');
    showToast('Review Submitted', 'Thank you! You earned +100 XP & +25 CyberCredits');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header Hero Banner */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={activeGameDetail.screenshots[activeScreenshot] || activeGameDetail.heroBanner}
            alt={activeGameDetail.title}
            className="w-full h-full object-cover transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={closeGameDetailModal}
            className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full transition shadow-lg z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Details Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10 text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-black rounded-md uppercase tracking-wider">
                  {activeGameDetail.genre}
                </span>
                {activeGameDetail.badge && (
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white text-xs font-black rounded-md uppercase tracking-wider">
                    {activeGameDetail.badge}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{activeGameDetail.rating}</span>
                  <span className="text-slate-400 font-normal">({activeGameDetail.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{activeGameDetail.title}</h1>
              <p className="text-xs text-slate-300 mt-1">
                By {activeGameDetail.developer} &bull; Published by {activeGameDetail.publisher} &bull; {activeGameDetail.releaseDate}
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-2xl transition border ${
                  isWishlisted
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-slate-900/80 hover:bg-white hover:text-rose-500 text-white border-slate-700'
                }`}
                title={isWishlisted ? 'Remove Wishlist' : 'Add to Wishlist'}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition"
                title="Share Game"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={handlePlayNow}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Live Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50">
          {/* Screenshots Carousel Strip */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-400 uppercase mb-3">
              SCREENSHOTS & MEDIA
            </h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {activeGameDetail.screenshots.map((shot, idx) => (
                <img
                  key={idx}
                  src={shot}
                  alt={`Screenshot ${idx + 1}`}
                  onClick={() => setActiveScreenshot(idx)}
                  className={`w-36 h-20 rounded-xl object-cover cursor-pointer border-2 transition ${
                    activeScreenshot === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
              About The Game
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {activeGameDetail.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 mr-2">Platforms:</span>
              {activeGameDetail.platforms.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" /> System Requirements (PC)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Operating System</span>
                <span>{activeGameDetail.systemRequirements.os}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Processor</span>
                <span>{activeGameDetail.systemRequirements.processor}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Memory (RAM)</span>
                <span>{activeGameDetail.systemRequirements.memory}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Graphics Card</span>
                <span>{activeGameDetail.systemRequirements.graphics}</span>
              </div>
            </div>
          </div>

          {/* Community Reviews & Review Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> Player Reviews
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{reviews.length} reviews</span>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleSubmitReview} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Your Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your gameplay experience, tactics, or performance notes..."
                rows={2}
                className="w-full bg-white text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post Review
                </button>
              </div>
            </form>

            {/* Reviews list */}
            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 flex gap-3.5">
                  <img
                    src={rev.avatar}
                    alt={rev.username}
                    className="w-9 h-9 rounded-full bg-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{rev.username}</h4>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5 mb-1.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{rev.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
