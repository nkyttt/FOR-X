import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaItem, StoreVideo } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  Image as ImageIcon,
  Film,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Filter,
  FileCode,
  Sparkles,
  Play,
  Eye,
  ArrowUpDown,
  Clock,
  HardDrive,
  CheckCircle2,
  X,
  Edit2,
  FileVideo,
} from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const {
    mediaLibrary,
    addMediaItem,
    deleteMediaItem,
    storeProducts,
    banners,
    storeVideos,
    toggleVideoActive,
    deleteStoreVideo,
    setAdminSection,
    showToast,
    playUiSound,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image' | 'banner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [videoSortBy, setVideoSortBy] = useState<'date' | 'size' | 'duration' | 'views'>('date');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<StoreVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<StoreVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // File Upload Handler for general media
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    playUiSound('click');

    const isVideo = file.type.startsWith('video/');
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

    try {
      if (storage) {
        const fileExt = file.name.split('.').pop();
        const path = `${mediaType}s/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (err) => {
            console.error(err);
            showToast('Upload Failed', err.message, 'error');
            setIsUploading(false);
            setUploadProgress(null);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await addMediaItem({
              name: file.name,
              url: downloadUrl,
              type: mediaType,
              sizeBytes: file.size,
            });
            setUploadProgress(100);
            setIsUploading(false);
            showToast('Asset Uploaded', `Successfully uploaded ${file.name} to Cloud Storage.`, 'success');
          }
        );
      }
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    playUiSound('success');
    showToast('Copied to Clipboard', 'Asset URL copied.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyVideoId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    playUiSound('success');
    showToast('Video ID Copied', `Copied ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cross-reference safety check: is URL used by products/banners/videos?
  const checkMediaUsage = (url: string) => {
    const productCount = storeProducts.filter((p) => p.imageUrl === url).length;
    const bannerCount = banners.filter((b) => b.imageUrl === url).length;
    const videoCount = storeVideos.filter((v) => v.videoUrl === url || v.thumbnailUrl === url).length;
    return { productCount, bannerCount, videoCount, total: productCount + bannerCount + videoCount };
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Filtered media files
  const filteredMedia = mediaLibrary.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 'all' || m.type === activeTab;
    return matchesSearch && matchesType;
  });

  // Filtered & Sorted Videos for Requirement 18
  const sortedVideos = [...storeVideos]
    .filter((v) => {
      return (
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.originalFileName && v.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (videoSortBy === 'date') {
        return new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime();
      }
      if (videoSortBy === 'size') {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      if (videoSortBy === 'duration') {
        return (b.duration || 0) - (a.duration || 0);
      }
      if (videoSortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <span>Cloud File & Media Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized repository for high-resolution video streams, product photos, banners, and game assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAdminSection('videos')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <Film className="w-4 h-4" />
            <span>Open Video Studio</span>
          </button>

          <label className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition cursor-pointer shrink-0">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress !== null && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Transferring asset bytes to Firebase Storage...</span>
            </span>
            <span className="font-mono text-cyan-400">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Tabs (Requirement 18: Video tab in Media Library) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>All Media</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{mediaLibrary.length}</span>
        </button>

        <button
          id="media-library-video-tab"
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'video'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Videos ({storeVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'image'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Images</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'video' ? 'Search videos by title, filename, category...' : 'Search media files...'}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        {activeTab === 'video' && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={videoSortBy}
              onChange={(e) => setVideoSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="duration">Sort by Duration</option>
              <option value="views">Sort by Views</option>
            </select>
          </div>
        )}
      </div>

      {/* REQUIREMENT 18: VIDEO TAB FILE MANAGER TABLE / CARDS */}
      {activeTab === 'video' ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Thumbnail & Title</th>
                    <th className="p-4">Filename</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Specs (Res / FPS)</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Upload Date</th>
                    <th className="p-4">Processing</th>
                    <th className="p-4">Published</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedVideos.map((video) => {
                    const isPublished = video.status === 'Published' || video.active;
                    const isCopied = copiedId === video.id;

                    return (
                      <tr key={video.id} className="hover:bg-slate-850 transition">
                        {/* Thumbnail & Title */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setPreviewVideo(video)}
                              className="relative w-16 aspect-video bg-black rounded-lg overflow-hidden shrink-0 cursor-pointer group/thumb border border-slate-700"
                            >
                              <img
                                src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition">
                                <Play className="w-4 h-4 text-white fill-current" />
                              </div>
                            </div>
                            <div className="min-w-[140px]">
                              <p className="font-bold text-white line-clamp-1">{video.title}</p>
                              <span className="text-[10px] text-cyan-400 font-mono">{video.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* Filename */}
                        <td className="p-4 font-mono text-[11px] text-slate-400 max-w-[150px] truncate" title={video.originalFileName || 'video.mp4'}>
                          {video.originalFileName || 'video.mp4'}
                        </td>

                        {/* Size */}
                        <td className="p-4 font-mono text-[11px] text-slate-300">
                          {video.fileSizeFormatted || formatFileSize(video.fileSize)}
                        </td>

                        {/* Resolution & FPS */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono font-bold text-cyan-300 border border-slate-800">
                              {video.resolution || '1080p'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-emerald-400 border border-slate-800">
                              {video.fps || 60} FPS
                            </span>
                            {video.is4K && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-[10px] font-black text-slate-950">
                                4K
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="p-4 font-mono text-[11px] text-slate-300">
                          {video.durationFormatted || '00:00'}
                        </td>

                        {/* Upload Date */}
                        <td className="p-4 text-[11px] text-slate-400 whitespace-nowrap">
                          {video.uploadDate ? new Date(video.uploadDate).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* Processing Status */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {video.processingStatus || 'Ready'} ✓
                          </span>
                        </td>

                        {/* Published Status */}
                        <td className="p-4">
                          <button
                            onClick={() => toggleVideoActive(video.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                              isPublished
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isPublished ? 'Published' : 'Draft'}
                          </button>
                        </td>

                        {/* Working Actions (Requirement 18) */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewVideo(video)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Preview Video"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAdminSection('videos')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                              title="Edit Video"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyVideoId(video.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                              title="Copy Video ID"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDeletingVideo(video)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedVideos.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs">
                No videos found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Media Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const usage = checkMediaUsage(item.url);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group transition"
              >
                {/* Asset Preview Frame */}
                <div className="relative aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur flex items-center justify-center text-cyan-400">
                        <Film className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}

                  {/* Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950/80 text-cyan-400 border border-slate-800">
                      {item.type}
                    </span>
                  </div>

                  {usage.total > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/90 text-white shadow">
                        Used ({usage.total})
                      </span>
                    </div>
                  )}
                </div>

                {/* Asset Metadata & Actions */}
                <div className="p-3 space-y-2 bg-slate-950/40">
                  <div>
                    <div className="text-xs font-bold text-white truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatFileSize(item.sizeBytes)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => setDeletingMedia(item)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Preview Modal (Requirement 18 & 19) */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  PREVIEW PLAYER
                </span>
                <span className="text-xs font-bold text-white">{previewVideo.title}</span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={previewVideo.videoUrl}
                poster={previewVideo.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
              <span>Resolution: {previewVideo.resolution || '1080p'} &bull; {previewVideo.fps || 60} FPS</span>
              <span>Size: {previewVideo.fileSizeFormatted || formatFileSize(previewVideo.fileSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Video Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        onConfirm={async () => {
          if (deletingVideo) {
            if (storage && deletingVideo.storagePath) {
              try {
                const r = ref(storage, deletingVideo.storagePath);
                await deleteObject(r);
              } catch (e) {
                console.warn(e);
              }
            }
            await deleteStoreVideo(deletingVideo.id);
            setDeletingVideo(null);
          }
        }}
        title={`Delete Video "${deletingVideo?.title}"?`}
        message="Are you sure you want to delete this video? This will delete the stored file from Firebase Storage and remove it from public storefronts."
        confirmText="Delete Video"
        isDestructive={true}
      />

      {/* Delete General Media Asset Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deletingMedia)}
        onClose={() => setDeletingMedia(null)}
        onConfirm={async () => {
          if (deletingMedia) {
            await deleteMediaItem(deletingMedia.id);
            setDeletingMedia(null);
          }
        }}
        title={`Delete Media Asset "${deletingMedia?.name}"?`}
        message={
          deletingMedia && checkMediaUsage(deletingMedia.url).total > 0
            ? `Warning: This asset is currently linked to ${
                checkMediaUsage(deletingMedia.url).total
              } storefront products, banners, or trailers. Deleting it will cause missing broken images on those pages.`
            : 'Are you sure you want to delete this media asset? This will remove it from the media library and storage index.'
        }
        confirmText="Delete Asset"
        isDestructive={true}
      />
    </div>
  );
};
