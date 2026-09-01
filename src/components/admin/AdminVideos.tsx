import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreVideo } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  Upload,
  X,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';

export const AdminVideos: React.FC = () => {
  const {
    storeVideos,
    addStoreVideo,
    updateStoreVideo,
    deleteStoreVideo,
    toggleVideoActive,
    toggleVideoFeatured,
    addMediaItem,
    showToast,
    playUiSound,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<StoreVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<StoreVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<StoreVideo | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    active: true,
    featured: false,
    displayOrder: 1,
  });

  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    playUiSound('click');
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: false,
      displayOrder: storeVideos.length + 1,
    });
    setFormError(null);
    setVideoUploadProgress(null);
    setThumbnailUploadProgress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vid: StoreVideo) => {
    playUiSound('click');
    setEditingVideo(vid);
    setFormData({
      title: vid.title,
      description: vid.description || '',
      videoUrl: vid.videoUrl,
      thumbnailUrl: vid.thumbnailUrl || '',
      active: vid.active,
      featured: vid.featured || false,
      displayOrder: vid.displayOrder ?? 1,
    });
    setFormError(null);
    setVideoUploadProgress(null);
    setThumbnailUploadProgress(null);
    setIsModalOpen(true);
  };

  // Video File Upload Handler (MP4/WebM)
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validVideoTypes.includes(file.type)) {
      setFormError('Please select a valid MP4 or WebM video file.');
      return;
    }

    setFormError(null);
    setVideoUploadProgress(10);

    try {
      if (storage) {
        const fileExt = file.name.split('.').pop();
        const fileName = `videos/${Date.now()}_video.${fileExt}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setVideoUploadProgress(Math.round(progress));
          },
          (err) => {
            console.warn('Storage fallback:', err);
            const objectUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, videoUrl: objectUrl }));
            setVideoUploadProgress(100);
            addMediaItem({
              name: file.name,
              url: objectUrl,
              type: 'video',
              sizeBytes: file.size,
            });
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData((prev) => ({ ...prev, videoUrl: downloadUrl }));
            setVideoUploadProgress(100);
            addMediaItem({
              name: file.name,
              url: downloadUrl,
              type: 'video',
              sizeBytes: file.size,
            });
            showToast('Video Uploaded', 'Video asset saved to Firebase Storage.');
          }
        );
      }
    } catch (err: any) {
      setFormError('Video upload failed: ' + err.message);
      setVideoUploadProgress(null);
    }
  };

  // Thumbnail Image Upload Handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setFormError('Please select a JPG or PNG image for the thumbnail.');
      return;
    }

    setThumbnailUploadProgress(10);
    try {
      if (storage) {
        const fileExt = file.name.split('.').pop();
        const fileName = `videos/${Date.now()}_thumb.${fileExt}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setThumbnailUploadProgress(Math.round(progress));
          },
          () => {
            const reader = new FileReader();
            reader.onload = () => {
              setFormData((prev) => ({ ...prev, thumbnailUrl: reader.result as string }));
              setThumbnailUploadProgress(100);
            };
            reader.readAsDataURL(file);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData((prev) => ({ ...prev, thumbnailUrl: downloadUrl }));
            setThumbnailUploadProgress(100);
            showToast('Thumbnail Uploaded', 'Video cover saved to cloud.');
          }
        );
      }
    } catch {
      setThumbnailUploadProgress(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setFormError('Video title is required.');
      return;
    }

    if (!formData.videoUrl.trim()) {
      setFormError('Video URL or video file is required.');
      return;
    }

    setIsSubmitting(true);
    playUiSound('click');

    try {
      if (editingVideo) {
        await updateStoreVideo(editingVideo.id, {
          title: trimmedTitle,
          description: formData.description.trim(),
          videoUrl: formData.videoUrl.trim(),
          thumbnailUrl: formData.thumbnailUrl.trim(),
          active: formData.active,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
        });
      } else {
        await addStoreVideo({
          title: trimmedTitle,
          description: formData.description.trim(),
          videoUrl: formData.videoUrl.trim(),
          thumbnailUrl: formData.thumbnailUrl.trim(),
          active: formData.active,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    setIsSubmitting(true);
    try {
      await deleteStoreVideo(deletingVideo.id);
      setDeletingVideo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = storeVideos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && v.active) ||
      (statusFilter === 'draft' && !v.active) ||
      (statusFilter === 'featured' && v.featured);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <span>Storefront Video Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload and manage trailers, gameplay showcases, product review clips, and live match streams.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos by title or tags..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="all">All Videos</option>
            <option value="published">Published / Live</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured Hub</option>
          </select>
        </div>
      </div>

      {/* Video Grid Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => (
          <div
            key={vid.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between group"
          >
            {/* Thumbnail Preview Area */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              <img
                src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                <button
                  onClick={() => setPreviewVideo(vid)}
                  className="w-12 h-12 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 transform group-hover:scale-110 transition active:scale-95 pl-0.5"
                  title="Play Video"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                </button>
              </div>

              {/* Status Tags */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    vid.active
                      ? 'bg-emerald-500/90 text-white shadow-md'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-700'
                  }`}
                >
                  {vid.active ? 'Published' : 'Draft'}
                </span>
                {vid.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>
            </div>

            {/* Video Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-1.5">
                  {vid.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {vid.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">Order #{vid.displayOrder ?? 0}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVideoFeatured(vid.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                        vid.featured ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {vid.featured ? 'Featured' : 'Make Featured'}
                    </button>
                    <button
                      onClick={() => toggleVideoActive(vid.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                        vid.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {vid.active ? 'Published' : 'Unpublished'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPreviewVideo(vid)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                    title="Preview Video Player"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(vid)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Edit Video Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingVideo(vid)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs shadow-xl">
          No videos found matching the current search criteria.
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingVideo ? 'Edit Store Video' : 'Add Store Video'}
                </h3>
                <p className="text-xs text-slate-400">Configure title, media assets, thumbnail, and playback ordering.</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. CYBERX 2025 Platform Premiere Trailer"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Video Source (Upload MP4 or Direct URL) *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    required
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                  />

                  <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload Video File (MP4/WebM)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {videoUploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Uploading video file...</span>
                        <span>{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Thumbnail Image Cover
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                  />

                  <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload Thumbnail Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>

                  {thumbnailUploadProgress !== null && (
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${thumbnailUploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of video, match context, or game highlights..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Live Status
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-700 bg-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {formData.active ? 'Published' : 'Draft'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Featured
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {formData.featured ? 'Featured' : 'Standard'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingVideo ? 'Save Changes' : 'Publish Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Video Player Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white truncate max-w-md">{previewVideo.title}</span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                poster={previewVideo.thumbnailUrl}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-slate-950/50">
              <h4 className="font-bold text-white text-base mb-1">{previewVideo.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Video "${deletingVideo?.title}"?`}
        message="This action will permanently delete this video asset from Firestore and remove it from the public video hub."
        confirmText="Delete Video"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
