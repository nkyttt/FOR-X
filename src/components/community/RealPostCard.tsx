import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Trash2,
  Share2,
  Repeat,
  Bookmark,
  Clock,
  Send,
  Loader2,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  User,
} from 'lucide-react';
import {
  FirebasePost,
  FirebaseComment,
  subscribeToPostLikes,
  toggleRealLike,
  subscribeToPostComments,
  addRealComment,
  deleteRealComment,
  deleteRealPost,
} from '../../services/communityFirebaseService';

interface RealPostCardProps {
  post: FirebasePost;
  currentUserId?: string | null;
  currentUserProfile?: {
    displayName?: string;
    avatarUrl?: string;
  } | null;
  onPostDeleted?: (postId: string) => void;
  playUiSound?: (sound: string) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requireAuth?: () => boolean;
}

export const RealPostCard: React.FC<RealPostCardProps> = ({
  post,
  currentUserId,
  currentUserProfile,
  onPostDeleted,
  playUiSound,
  showToast,
  requireAuth,
}) => {
  // Real Likes state from Firestore subcollection
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [isLiking, setIsLiking] = useState(false);

  // Real Comments state from Firestore subcollection
  const [comments, setComments] = useState<FirebaseComment[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Post Actions state
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);

  // Real-time listener for likes: posts/{postId}/likes
  useEffect(() => {
    const unsubLikes = subscribeToPostLikes(post.id, (ids) => {
      setLikedUserIds(ids);
    });
    return () => unsubLikes();
  }, [post.id]);

  // Real-time listener for comments: posts/{postId}/comments
  useEffect(() => {
    const unsubComments = subscribeToPostComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsubComments();
  }, [post.id]);

  const isLikedByMe = currentUserId ? likedUserIds.includes(currentUserId) : false;
  const isMyPost = currentUserId && post.authorId === currentUserId;

  // Format timestamp
  const formatTime = (ts: any): string => {
    if (!ts) return 'Just now';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const diffMs = Date.now() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // REAL LIKE action: posts/{postId}/likes/{userId}
  const handleLike = async () => {
    if (requireAuth && !requireAuth()) return;
    if (!currentUserId) {
      if (showToast) showToast('Authentication Required', 'Please sign in to like dispatches', 'warning');
      return;
    }
    if (isLiking) return;

    if (playUiSound) playUiSound('click');
    setIsLiking(true);

    try {
      await toggleRealLike(post.id, currentUserId, isLikedByMe);
      // Real-time listener will update likedUserIds automatically!
    } catch (err: any) {
      console.error('Failed to toggle real like:', err);
      if (showToast) showToast('Like Error', err.message || 'Could not update like status', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  // REAL ADD COMMENT action: posts/{postId}/comments/{commentId}
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth && !requireAuth()) return;
    if (!currentUserId) {
      if (showToast) showToast('Authentication Required', 'Please sign in to reply to dispatches', 'warning');
      return;
    }
    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addRealComment(post.id, newCommentText.trim(), {
        uid: currentUserId,
        displayName: currentUserProfile?.displayName || 'Tactical Operative',
        avatarUrl: currentUserProfile?.avatarUrl,
      });
      setNewCommentText('');
      if (playUiSound) playUiSound('success');
      if (showToast) showToast('Comment Published', 'Your feedback was saved to Firebase Firestore', 'success');
    } catch (err: any) {
      console.error('Failed to save comment:', err);
      if (showToast) showToast('Comment Error', err.message || 'Failed to submit comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // REAL DELETE COMMENT action
  const handleDeleteComment = async (commentId: string) => {
    if (requireAuth && !requireAuth()) return;
    setDeletingCommentId(commentId);
    try {
      await deleteRealComment(post.id, commentId);
      if (playUiSound) playUiSound('click');
      if (showToast) showToast('Comment Deleted', 'Your comment was removed from Firestore', 'info');
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      if (showToast) showToast('Deletion Error', err.message || 'Failed to remove comment', 'error');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // REAL DELETE POST action
  const handleDeletePost = async () => {
    if (requireAuth && !requireAuth()) return;
    if (!window.confirm('Are you sure you want to permanently delete this dispatch from Firestore?')) {
      return;
    }

    setIsDeletingPost(true);
    try {
      await deleteRealPost(post.id);
      if (playUiSound) playUiSound('claim');
      if (showToast) showToast('Dispatch Deleted', 'Post removed from Firebase Firestore', 'success');
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      if (showToast) showToast('Delete Error', err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Share link
  const handleShare = () => {
    if (playUiSound) playUiSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/community#${post.id}`);
      if (showToast) showToast('Link Copied', 'Dispatch link copied to clipboard', 'success');
    }
  };

  const isVideo = post.mediaType === 'video' || (post.mediaUrl && /\.(mp4|webm|ogg|mov)$/i.test(post.mediaUrl));

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-[#161B22] rounded-3xl p-5 sm:p-6 border border-slate-800/90 hover:border-slate-700/90 transition duration-200 shadow-xl shadow-black/20 space-y-4"
    >
      {/* Post Header: Author Avatar, Username, Time, Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`}
            alt={post.authorName || 'Operative'}
            className="w-11 h-11 rounded-2xl bg-slate-800 object-cover border border-slate-700 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white hover:text-cyan-400 cursor-pointer transition">
                {post.authorName || 'Operative'}
              </span>
              {post.authorRole && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-cyan-300 border border-cyan-400/30 rounded text-[10px] font-black uppercase">
                  {post.authorRole}
                </span>
              )}
              {post.authorLevel && (
                <span className="text-[10px] font-bold text-slate-400">
                  Lvl {post.authorLevel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>@{post.authorName ? post.authorName.toLowerCase().replace(/\s+/g, '_') : 'operative'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Game Tag & Delete Button (for author) */}
        <div className="flex items-center gap-2">
          {post.gameTag && (
            <span className="px-3 py-1 bg-slate-900 text-cyan-400 border border-slate-800 rounded-full text-xs font-black">
              #{post.gameTag}
            </span>
          )}

          {isMyPost && (
            <button
              id={`delete-post-btn-${post.id}`}
              onClick={handleDeletePost}
              disabled={isDeletingPost}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Delete dispatch from Firestore"
            >
              {isDeletingPost ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
          {post.text}
        </p>
      </div>

      {/* Media Attachment (Image or Video) from Firebase Storage */}
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden max-h-[440px] w-full bg-slate-950 border border-slate-800 relative group flex items-center justify-center">
          {isVideo ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[440px] object-contain rounded-2xl bg-black"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media attachment"
              className="w-full max-h-[440px] object-cover transition duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Post Action Toolbar: REAL Like, REAL Comments, Repost, Bookmark, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* REAL LIKE BUTTON */}
          <button
            id={`like-btn-${post.id}`}
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              isLikedByMe
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isLikedByMe ? 'Unlike this dispatch' : 'Like this dispatch'}
          >
            {isLiking ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
            ) : (
              <Heart className={`w-4 h-4 transition ${isLikedByMe ? 'fill-rose-500 text-rose-500' : ''}`} />
            )}
            <span>{likedUserIds.length}</span>
          </button>

          {/* REAL COMMENT TOGGLE BUTTON */}
          <button
            id={`comment-btn-${post.id}`}
            onClick={() => {
              if (playUiSound) playUiSound('click');
              setIsCommentsOpen(!isCommentsOpen);
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              isCommentsOpen
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="View discussion thread"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>

          {/* Boost / Repost toggle */}
          <button
            onClick={() => {
              if (playUiSound) playUiSound('claim');
              setIsBoosted(!isBoosted);
              if (showToast) {
                showToast(
                  isBoosted ? 'Boost Cancelled' : 'Dispatch Amplified',
                  isBoosted ? 'Boost reverted' : 'Dispatch amplified across the network!',
                  'success'
                );
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl transition ${
              isBoosted
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Amplify dispatch"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => {
              if (playUiSound) playUiSound('click');
              setIsSaved(!isSaved);
              if (showToast) {
                showToast(
                  isSaved ? 'Bookmark Removed' : 'Saved to Archive',
                  isSaved ? 'Removed from your bookmarks' : 'Dispatch saved to archive',
                  'info'
                );
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl transition ${
              isSaved
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Bookmark dispatch"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Real Firestore Comments Section */}
      {isCommentsOpen && (
        <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
          {comments.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {comments.map((c) => {
                const isMyComment = currentUserId && c.userId === currentUserId;
                const isDeletingThis = deletingCommentId === c.id;

                return (
                  <div
                    key={c.id}
                    id={`comment-${c.id}`}
                    className="flex items-start justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl text-xs border border-slate-800/80 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <img
                        src={c.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.userId}`}
                        alt={c.authorName || 'User'}
                        className="w-7 h-7 rounded-full bg-slate-800 shrink-0 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-200">
                            {c.authorName || 'Operative'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                          {c.text}
                        </p>
                      </div>
                    </div>

                    {/* Delete button: only for own comment */}
                    {isMyComment && (
                      <button
                        id={`delete-comment-btn-${c.id}`}
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={isDeletingThis}
                        className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
                        title="Delete your comment"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1 text-center">
              No replies yet. Be the first operative to join the discussion!
            </p>
          )}

          {/* Real Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input
              id={`comment-input-${post.id}`}
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a tactical response..."
              className="flex-1 bg-slate-900 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              id={`comment-submit-${post.id}`}
              disabled={isSubmittingComment || !newCommentText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
            >
              {isSubmittingComment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Reply</span>
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
