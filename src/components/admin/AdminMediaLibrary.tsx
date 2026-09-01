import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaItem } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
} from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const {
    mediaLibrary,
    addMediaItem,
    deleteMediaItem,
    storeProducts,
    banners,
    storeVideos,
    showToast,
    playUiSound,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'banner' | 'thumbnail'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // File Upload Handler
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
          () => {
            const reader = new FileReader();
            reader.onload = () => {
              const url = reader.result as string;
              addMediaItem({
                name: file.name,
                url,
                type: mediaType,
                sizeBytes: file.size,
              });
              setUploadProgress(100);
              setIsUploading(false);
            };
            reader.readAsDataURL(file);
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
            showToast('Asset Uploaded', `Successfully uploaded ${file.name} to Cloud Media Library.`);
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
    showToast('Copied to Clipboard', 'Asset URL ready to paste into products, banners, or trailers.');
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
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredMedia = mediaLibrary.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <span>Cloud Media & Asset Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized gallery of all uploaded product photos, trailer clips, thumbnails, and banners.
          </p>
        </div>

        <label className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition cursor-pointer shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload New Asset</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress !== null && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Uploading asset to Firebase Storage...</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media files by name..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="all">All Media ({mediaLibrary.length})</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
            <option value="banner">Banners</option>
            <option value="thumbnail">Thumbnails</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
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

      {filteredMedia.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs shadow-xl">
          No media files found matching your search.
        </div>
      )}

      {/* Delete Confirmation Modal with Cross-Reference Warning */}
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
