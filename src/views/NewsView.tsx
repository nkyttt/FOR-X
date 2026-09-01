import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { NewsItem } from '../types';
import {
  Calendar,
  Clock,
  User,
  Share2,
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const NewsView: React.FC = () => {
  const { news, activeRoute, selectedNewsSlug, navigate, playUiSound, showToast } = useApp();
  const { currentUser, addXpAndPoints } = useAuth();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    selectedNewsSlug || activeRoute?.params?.newsSlug || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'CyberPhantom',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Phantom',
      text: 'The anti-cheat and movement sync updates feel incredible! Can not wait for the seasonal tournament qualifiers.',
      date: '1 hour ago',
    },
    {
      id: 'c2',
      author: 'AuraSniper',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura',
      text: 'Great dev update. Please buff the recoil stability on the Sector 7 plasma rifles in next patch.',
      date: '3 hours ago',
    },
  ]);

  const categories = ['All', 'Announcements', 'Esports', 'Patch Notes', 'Dev Updates'];

  const filteredNews = news.filter(
    (item) => selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const currentArticle = selectedSlug ? news.find((n) => n.slug === selectedSlug) || news[0] : null;

  const handleSelectArticle = (slug: string) => {
    playUiSound('click');
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    playUiSound('click');
    setSelectedSlug(null);
  };

  const handleShare = (article: NewsItem) => {
    playUiSound('click');
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Article link copied to clipboard');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser?.displayName || 'Guest Player',
      avatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
      text: commentText.trim(),
      date: 'Just now',
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    playUiSound('success');
    addXpAndPoints(50, 10, 'Article Discussion');
    showToast('Comment Posted', 'Earned +50 XP & +10 CyberCredits!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* If single article is active, show Article Reader */}
      {currentArticle ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All News</span>
          </button>

          {/* Article Header & Hero */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
            <div className="relative h-72 sm:h-96 w-full bg-slate-900">
              <img
                src={currentArticle.thumbnail}
                alt={currentArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-black uppercase tracking-wider">
                  {currentArticle.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black mt-2 leading-tight">
                  {currentArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" /> {currentArticle.author}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> {currentArticle.publishedAt}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {currentArticle.readTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10 space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
              <p className="font-semibold text-slate-900 text-lg leading-relaxed border-l-4 border-blue-600 pl-4">
                {currentArticle.excerpt}
              </p>

              <div className="space-y-4">
                {currentArticle.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Share and Action Strip */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Category:</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {currentArticle.category}
                  </span>
                </div>

                <button
                  onClick={() => handleShare(currentArticle)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" /> Share Article
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Community Discussion ({comments.length})
            </h3>

            {/* Post Comment Form */}
            <form onSubmit={handlePostComment} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts, patch impressions, or questions..."
                rows={3}
                className="w-full bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {comments.map((c) => (
                <div key={c.id} className="pt-4 first:pt-0 flex items-start gap-3.5">
                  <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.author}</span>
                      <span className="text-[11px] text-slate-400">{c.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-normal">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* News List Overview */
        <>
          {/* Header */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-3 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL NEWSROOM</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                NEWS & <span className="text-blue-400">DISPATCHES</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
                Stay ahead of patch updates, global tournament broadcasts, engine optimizations, and dev diaries.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playUiSound('click');
                    setSelectedCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              {filteredNews.length} Articles
            </span>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                onClick={() => handleSelectArticle(article.slug)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span>{article.publishedAt}</span>
                      <span>&bull;</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600">
                    <span>Read Article</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
