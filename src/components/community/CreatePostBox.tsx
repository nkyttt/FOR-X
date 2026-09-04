import React, { useState, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Film,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Tag,
  Gamepad2,
} from 'lucide-react';
import { UploadTask } from 'firebase/storage';
import { createRealPost } from '../../services/communityFirebaseService';

interface CreatePostBoxProps {
  currentUserId?: string | null;
  currentUserProfile?: {
    displayName?: string;
    avatarUrl?: string;
    role?: string;
    level?: number;
  } | null;
  onPostCreated?: (postId: string) => void;
  playUiSound?: (sound: string) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requireAuth?: () => boolean;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({
  currentUserId,
  currentUserProfile,
  onPostCreated,
  playUiSound,
  showToast,
  requireAuth,
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  const [gameTag, setGameTag] = useState('Cyber Strike');
  const [category, setCategory] = useState('General');

  // Real upload state
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTaskRef = useRef<UploadTask | null>(null);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selected file is not an image.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image size exceeds 25MB limit.');
      return;
    }

    setSelectedFile(file);
    setMediaType('image');
    setUploadError(null);
    setMediaPreviewUrl(URL.createObjectURL(file));
    if (playUiSound) playUiSound('click');
  };

  // Handle video selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Selected file is not a video.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Video size exceeds 100MB limit.');
      return;
    }

    setSelectedFile(file);
    setMediaType('video');
    setUploadError(null);
    setMediaPreviewUrl(URL.createObjectURL(file));
    if (playUiSound) playUiSound('click');
  };

  // Remove media attachment
  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setMediaType(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Cancel action
  const handleCancel = () => {
    if (uploadTaskRef.current && isPublishing) {
      try {
        uploadTaskRef.current.cancel();
      } catch (e) {
        console.warn('Could not cancel upload task:', e);
      }
    }
    setText('');
    handleRemoveMedia();
    setIsPublishing(false);
    setUploadProgress(null);
    setUploadError(null);
    if (playUiSound) playUiSound('click');
    if (showToast) showToast('Post Cancelled', 'Draft was discarded', 'info');
  };

  // Publish action
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth && !requireAuth()) return;

    if (!text.trim() && !selectedFile) {
      setUploadError('Please enter some text or select an image/video to broadcast.');
      return;
    }

    setIsPublishing(true);
    setUploadProgress(selectedFile ? 0 : null);
    setUploadError(null);

    try {
      const postId = await createRealPost({
        text: text.trim(),
        mediaFile: selectedFile,
        mediaType,
        authorId: currentUserId || 'operative',
        authorName: currentUserProfile?.displayName || 'Tactical Operative',
        authorAvatar: currentUserProfile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserId}`,
        authorRole: currentUserProfile?.role || 'OPERATIVE',
        authorLevel: currentUserProfile?.level || 1,
        gameTag,
        category,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
        onUploadTask: (task) => {
          uploadTaskRef.current = task;
        },
      });

      // Clear state on success
      setText('');
      handleRemoveMedia();
      setIsPublishing(false);
      setUploadProgress(null);

      if (playUiSound) playUiSound('claim');
      if (showToast) {
        showToast(
          'Dispatch Live',
          'Your post has been published to Firebase Firestore!',
          'success'
        );
      }
      if (onPostCreated && postId) {
        onPostCreated(postId);
      }
    } catch (err: any) {
      console.error('Error publishing real post:', err);
      setIsPublishing(false);
      setUploadProgress(null);
      const errMsg = err?.message || 'Failed to publish post to Firebase';
      setUploadError(errMsg);
      if (showToast) showToast('Publish Failed', errMsg, 'error');
    }
  };

  return (
    <div className="bg-[#161B22] rounded-3xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        id="community-image-upload-input"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
        id="community-video-upload-input"
      />

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Top: Avatar and Text input */}
        <div className="flex items-start gap-3">
          <img
            src={
              currentUserProfile?.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserId || 'me'}`
            }
            alt="My Avatar"
            className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 shrink-0 object-cover"
          />
          <div className="flex-1 space-y-3 min-w-0">
            <textarea
              id="community-create-post-textarea"
              rows={3}
              value={text}
              disabled={isPublishing}
              onChange={(e) => {
                setText(e.target.value);
                if (uploadError) setUploadError(null);
              }}
              placeholder="What's happening in the grid? Share match tactics, squad recruitment, clips, or gameplay feedback..."
              className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed transition resize-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Selected Media Preview Box */}
        {selectedFile && mediaPreviewUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 max-h-72 flex items-center justify-center">
            {mediaType === 'video' ? (
              <video
                src={mediaPreviewUrl}
                controls
                className="max-h-64 rounded-xl object-contain w-full"
              />
            ) : (
              <img
                src={mediaPreviewUrl}
                alt="Selected preview"
                className="max-h-64 rounded-xl object-contain w-full"
              />
            )}

            {/* Remove button */}
            {!isPublishing && (
              <button
                type="button"
                id="community-remove-media-btn"
                onClick={handleRemoveMedia}
                className="absolute top-4 right-4 p-1.5 bg-black/80 hover:bg-rose-600 text-white rounded-full transition shadow-lg"
                title="Remove media"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[11px] text-slate-300 font-mono">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          </div>
        )}

        {/* REAL Upload Progress Bar */}
        {isPublishing && uploadProgress !== null && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-blue-950/30 border border-blue-800/40 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                {uploadProgress < 100
                  ? `Uploading media to Firebase Storage...`
                  : `Saving post to Firestore...`}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* REAL Error Display Banner */}
        {uploadError && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Firebase Operation Error:</span>
              <span className="text-slate-300 text-[11px]">{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Metadata Selectors: Game Tag and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Game Tag */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
            <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={gameTag}
              disabled={isPublishing}
              onChange={(e) => setGameTag(e.target.value)}
              className="bg-transparent w-full focus:outline-none cursor-pointer"
            >
              <option value="Cyber Strike" className="bg-[#161B22]">Cyber Strike</option>
              <option value="Neon Riders" className="bg-[#161B22]">Neon Riders</option>
              <option value="Shadow Legends" className="bg-[#161B22]">Shadow Legends</option>
              <option value="Battle Arena" className="bg-[#161B22]">Battle Arena</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
            <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={category}
              disabled={isPublishing}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent w-full focus:outline-none cursor-pointer"
            >
              <option value="General" className="bg-[#161B22]">General Pulse</option>
              <option value="Clips & Highlights" className="bg-[#161B22]">Clips & Media</option>
              <option value="Game Help" className="bg-[#161B22]">Guides & Strategy</option>
              <option value="Esports" className="bg-[#161B22]">Esports & Scrims</option>
              <option value="Memes" className="bg-[#161B22]">Memes & Fan Art</option>
            </select>
          </div>
        </div>

        {/* Action Controls Toolbar: Media Buttons, Cancel, Publish */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Media Attach Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="community-attach-image-btn"
              disabled={isPublishing}
              onClick={() => imageInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mediaType === 'image'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Upload image to Firebase Storage"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>{mediaType === 'image' ? 'Image Ready' : 'Upload Image'}</span>
            </button>

            <button
              type="button"
              id="community-attach-video-btn"
              disabled={isPublishing}
              onClick={() => videoInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mediaType === 'video'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Upload video to Firebase Storage"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>{mediaType === 'video' ? 'Video Ready' : 'Upload Video'}</span>
            </button>
          </div>

          {/* Action Buttons: Cancel and Publish */}
          <div className="flex items-center gap-2">
            {(text || selectedFile || isPublishing) && (
              <button
                type="button"
                id="community-cancel-post-btn"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              id="community-publish-post-btn"
              disabled={isPublishing || (!text.trim() && !selectedFile)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
