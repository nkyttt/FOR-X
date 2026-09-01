import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CommunityPost } from '../types';
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  Sparkles,
  Trophy,
  Users,
  Image as ImageIcon,
  Flame,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommunityView: React.FC = () => {
  const { communityPosts, games, playUiSound, showToast } = useApp();
  const { currentUser, addXpAndPoints } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>(communityPosts);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newGameTag, setNewGameTag] = useState('Cyber Strike');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [likedPosts, setLikedPosts] = useState<{ [id: string]: boolean }>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const tags = ['All', 'Cyber Strike', 'Neon Riders', 'Shadow Legends', 'General', 'Esports'];

  const filteredPosts = posts.filter(
    (p) => selectedTag === 'All' || (p.gameTag && p.gameTag.toLowerCase() === selectedTag.toLowerCase()) || p.category === selectedTag
  );

  const handleLikePost = (postId: string) => {
    playUiSound('click');
    const isLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) } : p))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      username: currentUser?.displayName || 'Gamer',
      userAvatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Gamer',
      userRole: currentUser?.role || 'USER',
      userLevel: currentUser?.level || 1,
      title: newTitle.trim(),
      content: newContent.trim(),
      gameTag: newGameTag,
      category: 'General',
      imageUrl: newImageUrl.trim() || undefined,
      likesCount: 1,
      likedBy: [currentUser?.id || 'guest'],
      commentsCount: 0,
      savedBy: [],
      createdAt: 'Just now',
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    playUiSound('claim');
    confetti({ particleCount: 50, spread: 50 });
    addXpAndPoints(150, 30, 'Community Broadcast');
    showToast('Post Broadcasted', 'Your dispatch is live! Earned +150 XP & +30 CyberCredits', 'success');
  };

  const handleAddComment = (postId: string) => {
    if (!replyText.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newC = {
            id: `c-${Date.now()}`,
            userId: currentUser?.id || 'guest',
            username: currentUser?.displayName || 'Gamer',
            avatarUrl: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
            content: replyText.trim(),
            createdAt: 'Just now',
            likes: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newC],
          };
        }
        return p;
      })
    );
    setReplyText('');
    playUiSound('success');
    addXpAndPoints(30, 5, 'Community Reply');
    showToast('Reply Added', '+30 XP earned', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black tracking-widest uppercase mb-3 border border-cyan-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>GLOBAL GAMER NETWORK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            CYBERX <span className="text-cyan-400">COMMUNITY</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Share clutch highlights, recruit squadmates, discuss balancing, and rise through the community leaderboards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Create Post Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                alt="My avatar"
                className="w-10 h-10 rounded-full bg-slate-100 shrink-0"
              />
              <span className="text-xs font-bold text-slate-700">
                Broadcast a play, question, or team recruitment
              </span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post headline / topic (e.g., Best Sector 7 smoke setups?)"
                className="w-full bg-slate-50 text-xs sm:text-sm font-bold p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your breakdown, squad requirements, or tactic here..."
                rows={3}
                className="w-full bg-slate-50 text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <select
                    value={newGameTag}
                    onChange={(e) => setNewGameTag(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 w-full focus:outline-none"
                  >
                    <option value="Cyber Strike">Cyber Strike</option>
                    <option value="Neon Riders">Neon Riders</option>
                    <option value="Shadow Legends">Shadow Legends</option>
                    <option value="Battle Arena">Battle Arena</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Screenshot/Image URL (optional)"
                    className="bg-transparent text-xs text-slate-700 w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast Post
                </button>
              </div>
            </form>
          </div>

          {/* Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  playUiSound('click');
                  setSelectedTag(tag);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isLiked = likedPosts[post.id];
              const isCommentOpen = activeCommentPostId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.userAvatar}
                        alt={post.username}
                        className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{post.username}</h4>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                            Lvl {post.userLevel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                      </div>
                    </div>

                    {post.gameTag && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black">
                        #{post.gameTag}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-1.5">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Attached Image if any */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-slate-900 border border-slate-100">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-xl ${
                          isLiked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentPostId(isCommentOpen ? null : post.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount} Comments</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link Copied', 'Community post link copied', 'info');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expandable Comment Thread */}
                  {isCommentOpen && (
                    <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                      {/* Existing comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto">
                          {post.comments.map((c) => (
                            <div key={c.id} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl text-xs">
                              <img src={c.avatarUrl} alt={c.username} className="w-6 h-6 rounded-full" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{c.username}</span>
                                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-600 mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar (4 cols): Leaderboard & Rules */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Contributors Leaderboard */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Top MVPs This Week
            </h3>

            <div className="space-y-3">
              {[
                { name: 'VortexSniper', rank: '#1 MVP', xp: '18,400 XP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vortex' },
                { name: 'CyberQueen', rank: '#2 MVP', xp: '16,200 XP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Queen' },
                { name: 'ShadowNinja', rank: '#3 MVP', xp: '14,950 XP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                      <span className="text-[10px] text-amber-600 font-bold">{user.rank}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600">{user.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
