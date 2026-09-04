import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StoreVideo, VideoUploadState } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { storage } from '../../lib/firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  XCircle,
  Upload,
  X,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  HardDrive,
  Monitor,
  Tag,
  DollarSign,
  ShieldCheck,
  FileVideo,
  Image as ImageIcon,
  Check,
  Filter,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { analyzeVideoFile, formatBytes, formatDuration, ExtractedVideoMetadata } from '../../utils/videoMetadata';

export const AdminVideos: React.FC = () => {
  const {
    storeVideos,
    addStoreVideo,
    updateStoreVideo,
    deleteStoreVideo,
    retrySaveVideoToFirestore,
    toggleVideoActive,
    toggleVideoFeatured,
    addMediaItem,
    showToast,
    playUiSound,
    addAuditLog,
  } = useApp();

  const { currentUser } = useAuth();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured' | 'paid' | 'free'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals & Active Selections
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<StoreVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<StoreVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<StoreVideo | null>(null);

  // Form & Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trailers');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Archived'>('Published');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Video File & Storage references
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoStoragePath, setVideoStoragePath] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [durationFormatted, setDurationFormatted] = useState('00:00');
  const [resolution, setResolution] = useState('1080p');
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [fps, setFps] = useState<number>(60);
  const [codec, setCodec] = useState<string>('H.264/AVC');
  const [container, setContainer] = useState<string>('mp4');
  const [bitrate, setBitrate] = useState<number | undefined>(undefined);
  const [bitrateFormatted, setBitrateFormatted] = useState<string>('');
  const [is4K, setIs4K] = useState(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileSizeFormatted, setFileSizeFormatted] = useState('0 MB');
  const [format, setFormat] = useState('video/mp4');

  // Thumbnail State
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailStoragePath, setThumbnailStoragePath] = useState('');
  const [autoCapturedThumb, setAutoCapturedThumb] = useState<string | null>(null);
  const [autoThumbBlob, setAutoThumbBlob] = useState<Blob | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Upload Progress & Telemetry Tracking
  const [uploadState, setUploadState] = useState<VideoUploadState>('idle');
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Error Classification & Database Protection
  const [errorCategory, setErrorCategory] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [dbSaveFailed, setDbSaveFailed] = useState(false);
  const [incompleteVideo, setIncompleteVideo] = useState<StoreVideo | null>(null);
  const [isRetryingDb, setIsRetryingDb] = useState(false);

  // References
  const uploadTaskRef = useRef<UploadTask | null>(null);
  const uploadStartTimeRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(0);
  const lastSampleBytesRef = useRef<number>(0);
  const topFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Trailers',
    'Gameplay',
    'Tutorials',
    'Esports',
    'Developer',
    'Community',
    'Reviews',
    'Guides',
  ];

  // Error classifier adhering strictly to Requirement 20
  const classifyStorageError = (error: any): { category: string; message: string } => {
    const code = error?.code || '';
    const msg = error?.message || String(error);
    if (code === 'storage/unauthenticated' || msg.includes('unauthenticated')) {
      return { category: 'Authentication failed', message: 'Admin authentication is required. Please check your admin session.' };
    }
    if (code === 'storage/unauthorized' || msg.includes('permission')) {
      return { category: 'Permission denied', message: 'Storage security rules denied write access to this bucket location.' };
    }
    if (code === 'storage/retry-limit-exceeded' || msg.includes('network') || msg.includes('offline')) {
      return { category: 'Network interrupted', message: 'Network connection was interrupted during file bytes transfer.' };
    }
    if (code === 'storage/canceled') {
      return { category: 'Upload cancelled', message: 'Upload was aborted by user.' };
    }
    if (code === 'storage/quota-exceeded') {
      return { category: 'Storage unavailable', message: 'Firebase Storage quota exceeded.' };
    }
    return { category: 'Storage unavailable', message: msg };
  };

  // Reset all state for new upload
  const resetFormState = () => {
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setCategory('Trailers');
    setTags(['Trailer', 'CyberX']);
    setIsFree(true);
    setPrice(0);
    setDiscount(0);
    setStatus('Published');
    setFeatured(false);
    setDisplayOrder(storeVideos.length + 1);

    setSelectedVideoFile(null);
    setVideoUrl('');
    setVideoStoragePath('');
    setDuration(0);
    setDurationFormatted('00:00');
    setResolution('1080p');
    setWidth(1920);
    setHeight(1080);
    setFps(60);
    setCodec('H.264/AVC');
    setContainer('mp4');
    setBitrate(undefined);
    setBitrateFormatted('');
    setIs4K(false);
    setFileSize(0);
    setFileSizeFormatted('0 MB');
    setFormat('video/mp4');

    setThumbnailUrl('');
    setThumbnailStoragePath('');
    setAutoCapturedThumb(null);
    setAutoThumbBlob(null);

    setUploadState('idle');
    setBytesTransferred(0);
    setTotalBytes(0);
    setUploadProgress(0);
    setUploadSpeed('');
    setRemainingTime('');
    setErrorCategory(null);
    setErrorMessage(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setDbSaveFailed(false);
    setIncompleteVideo(null);
  };

  // Trigger Native File Picker (Requirement 2 & 3)
  const handleTriggerUpload = () => {
    playUiSound('click');
    if (topFileInputRef.current) {
      topFileInputRef.current.value = '';
      topFileInputRef.current.click();
    }
  };

  // Process selected real file
  const handleProcessSelectedFile = async (file: File) => {
    if (!file) return;

    // Strict validation (Requirement 4 & 5)
    const validExtensions = /\.(mp4|webm|ogg|mov|mkv|m4v)$/i;
    const isMimeValid =
      file.type.startsWith('video/') ||
      file.name.match(validExtensions);

    if (!isMimeValid) {
      setErrorCategory('Unsupported format');
      setErrorMessage(`Invalid format "${file.name}". Supported: MP4, WebM, MOV, MKV, M4V.`);
      setErrorDetails(`Detected MIME: ${file.type || 'unknown'}`);
      playUiSound('pop');
      setIsModalOpen(true);
      return;
    }

    // High ceiling for 4K / 120fps master assets (10 GB)
    const maxSizeBytes = 10 * 1024 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorCategory('File too large');
      setErrorMessage(`File exceeds 10 GB limit (${formatBytes(file.size)}).`);
      setErrorDetails(`Size in bytes: ${file.size}`);
      playUiSound('pop');
      setIsModalOpen(true);
      return;
    }

    // Reset and open modal with populated file
    resetFormState();
    setSelectedVideoFile(file);
    setFileSize(file.size);
    setFileSizeFormatted(formatBytes(file.size));
    setFormat(file.type || 'video/mp4');
    setUploadState('selecting');
    setIsModalOpen(true);

    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));

    // Real-time metadata extraction & auto thumbnail capture (Requirement 6, 7, 8)
    try {
      const analysis: ExtractedVideoMetadata = await analyzeVideoFile(file);
      setDuration(analysis.duration);
      setDurationFormatted(analysis.durationFormatted);
      setResolution(analysis.resolution);
      setWidth(analysis.width);
      setHeight(analysis.height);
      setFps(analysis.fps);
      setCodec(analysis.codec);
      setContainer(analysis.container);
      setBitrate(analysis.bitrate);
      setBitrateFormatted(analysis.bitrateFormatted);
      setIs4K(analysis.is4K);

      if (analysis.thumbnailBlob) {
        setAutoThumbBlob(analysis.thumbnailBlob);
        const thumbObjectUrl = URL.createObjectURL(analysis.thumbnailBlob);
        setAutoCapturedThumb(thumbObjectUrl);
        setThumbnailUrl(thumbObjectUrl);
      }

      // Automatically begin real byte transfer (Requirement 3.5 & 3.6)
      startRealUpload(file, analysis.thumbnailBlob);
    } catch (err: any) {
      console.warn('Metadata analysis warning, falling back to basic upload:', err);
      startRealUpload(file, null);
    }
  };

  // Start Real Resumable Firebase Storage Transfer (Requirement 1, 9, 10)
  const startRealUpload = async (file: File, thumbBlob: Blob | null) => {
    if (!storage) {
      setErrorCategory('Storage unavailable');
      setErrorMessage('Firebase Storage client is not initialized.');
      setUploadState('failed');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setBytesTransferred(0);
    setTotalBytes(file.size);
    setErrorCategory(null);
    setErrorMessage(null);
    setErrorDetails(null);
    setDbSaveFailed(false);

    uploadStartTimeRef.current = Date.now();
    lastSampleTimeRef.current = Date.now();
    lastSampleBytesRef.current = 0;

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const videoPath = `videos/${Date.now()}_${sanitizedName}`;
      const videoRef = ref(storage, videoPath);

      const metadata = {
        contentType: file.type || 'video/mp4',
        customMetadata: {
          originalName: file.name,
          uploaderEmail: currentUser?.email || 'admin@cyberx.gg',
          uploaderId: currentUser?.id || 'admin',
          resolution: resolution,
          fps: String(fps),
          codec: codec,
          container: container,
        },
      };

      const uploadTask = uploadBytesResumable(videoRef, file, metadata);
      uploadTaskRef.current = uploadTask;

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const transferred = snapshot.bytesTransferred;
          const total = snapshot.totalBytes;
          const progress = total > 0 ? Math.round((transferred / total) * 100) : 0;

          setBytesTransferred(transferred);
          setTotalBytes(total);
          setUploadProgress(progress);

          // Calculate Real Speed & Remaining Time (Requirement 9)
          const now = Date.now();
          const elapsedSecs = (now - uploadStartTimeRef.current) / 1000;
          if (elapsedSecs > 0.5 && transferred > 0) {
            const bytesPerSec = transferred / elapsedSecs;
            setUploadSpeed(`${formatBytes(bytesPerSec)}/s`);

            const remainingBytes = Math.max(0, total - transferred);
            const remainingSecs = Math.round(remainingBytes / bytesPerSec);
            if (remainingSecs < 60) {
              setRemainingTime(`${remainingSecs}s remaining`);
            } else {
              const mins = Math.floor(remainingSecs / 60);
              const secs = remainingSecs % 60;
              setRemainingTime(`${mins}m ${secs}s remaining`);
            }
          }
        },
        (error) => {
          console.error('Firebase Storage Upload Error:', error);
          const classified = classifyStorageError(error);
          setErrorCategory(classified.category);
          setErrorMessage(classified.message);
          setErrorDetails(error?.stack || error?.message || String(error));
          setUploadState(error.code === 'storage/canceled' ? 'cancelled' : 'failed');
          uploadTaskRef.current = null;
          playUiSound('pop');
        },
        async () => {
          // Upload complete on Storage! Transition to processing state (Requirement 13)
          setUploadState('processing');
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setVideoUrl(downloadUrl);
            setVideoStoragePath(videoPath);

            // Upload Auto-captured Poster Thumbnail if generated
            if (thumbBlob && !thumbnailStoragePath) {
              try {
                const thumbPath = `thumbnails/${Date.now()}_poster.jpg`;
                const thumbRef = ref(storage, thumbPath);
                const thumbSnapshot = await uploadBytesResumable(thumbRef, thumbBlob, {
                  contentType: 'image/jpeg',
                });
                const thumbDownloadUrl = await getDownloadURL(thumbSnapshot.ref);
                setThumbnailUrl(thumbDownloadUrl);
                setThumbnailStoragePath(thumbPath);
              } catch (tErr) {
                console.warn('Thumbnail upload warning:', tErr);
              }
            }

            setUploadState('completed');
            setUploadProgress(100);
            showToast('Video Transfer Complete', `${file.name} uploaded to private storage.`, 'success');
            playUiSound('success');
          } catch (resErr: any) {
            setErrorCategory('Processing failed');
            setErrorMessage(`Failed to resolve storage download URL: ${resErr.message}`);
            setErrorDetails(resErr?.stack || String(resErr));
            setUploadState('failed');
          } finally {
            uploadTaskRef.current = null;
          }
        }
      );
    } catch (setupErr: any) {
      const classified = classifyStorageError(setupErr);
      setErrorCategory(classified.category);
      setErrorMessage(`Upload setup error: ${classified.message}`);
      setErrorDetails(setupErr?.stack || String(setupErr));
      setUploadState('failed');
      uploadTaskRef.current = null;
    }
  };

  // Pause Upload (Requirement 10 & 13)
  const handlePauseUpload = () => {
    if (uploadTaskRef.current && uploadState === 'uploading') {
      uploadTaskRef.current.pause();
      setUploadState('paused');
      showToast('Upload Paused', 'Transfer suspended.', 'info');
    }
  };

  // Resume Upload (Requirement 10 & 13)
  const handleResumeUpload = () => {
    if (uploadTaskRef.current && uploadState === 'paused') {
      uploadTaskRef.current.resume();
      setUploadState('uploading');
      showToast('Upload Resumed', 'Transfer resumed.', 'info');
    }
  };

  // Cancel Upload (Requirement 10 & 13)
  const handleCancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
      setUploadState('cancelled');
      showToast('Upload Cancelled', 'File transfer stopped.', 'warning');
    }
  };

  // Retry Upload (Requirement 13 & 20)
  const handleRetryUpload = () => {
    if (selectedVideoFile) {
      setErrorCategory(null);
      setErrorMessage(null);
      setErrorDetails(null);
      startRealUpload(selectedVideoFile, autoThumbBlob);
    }
  };

  // Custom Thumbnail Upload
  const handleCustomThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorCategory('Unsupported format');
      setErrorMessage('Please choose a valid image file (JPG, PNG, WebP) for the thumbnail poster.');
      return;
    }

    if (!storage) {
      setErrorCategory('Storage unavailable');
      setErrorMessage('Firebase Storage is not initialized.');
      return;
    }

    setIsUploadingThumb(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const thumbPath = `thumbnails/${Date.now()}_${sanitizedName}`;
      const thumbRef = ref(storage, thumbPath);

      const task = uploadBytesResumable(thumbRef, file, { contentType: file.type });
      task.on(
        'state_changed',
        null,
        (err) => {
          setErrorCategory('Storage unavailable');
          setErrorMessage(`Thumbnail upload failed: ${err.message}`);
          setIsUploadingThumb(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          setThumbnailUrl(downloadUrl);
          setThumbnailStoragePath(thumbPath);
          setIsUploadingThumb(false);
          showToast('Custom Poster Attached', 'High-res thumbnail uploaded.', 'success');
        }
      );
    } catch (err: any) {
      setErrorCategory('Storage unavailable');
      setErrorMessage(`Thumbnail error: ${err.message}`);
      setIsUploadingThumb(false);
    }
  };

  // Save to Database with Section 21 Failure Protection
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCategory(null);
    setErrorMessage(null);
    setErrorDetails(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Video title is required.');
      playUiSound('pop');
      return;
    }

    if (!videoUrl) {
      if (uploadState === 'uploading' || uploadState === 'processing') {
        setErrorMessage('Video is still transferring. Please wait for upload to complete.');
      } else {
        setErrorMessage('Please select and upload a video file first.');
      }
      playUiSound('pop');
      return;
    }

    setIsSubmitting(true);
    playUiSound('click');

    const videoId = editingVideo?.videoId || editingVideo?.id || `vid-${Date.now()}`;
    const videoRecord: Omit<StoreVideo, 'id' | 'createdAt'> = {
      videoId,
      title: trimmedTitle,
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl:
        thumbnailUrl.trim() ||
        autoCapturedThumb ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      storagePath: videoStoragePath || undefined,
      thumbnailPath: thumbnailStoragePath || undefined,
      thumbnailStoragePath: thumbnailStoragePath || undefined,
      originalFileName: selectedVideoFile?.name || editingVideo?.originalFileName || 'video.mp4',
      mimeType: format || selectedVideoFile?.type || 'video/mp4',
      format: format || 'video/mp4',
      container: container || 'mp4',
      width: width || 1920,
      height: height || 1080,
      resolution: resolution || '1080p',
      fps: fps || 60,
      codec: codec || 'H.264',
      bitrate: bitrate || undefined,
      bitrateFormatted: bitrateFormatted || undefined,
      is4K: is4K || (width >= 3800 || height >= 2100),
      category,
      tags,
      duration: duration || 0,
      durationFormatted: durationFormatted || '00:00',
      fileSize: fileSize || 0,
      fileSizeFormatted: fileSizeFormatted || '0 MB',
      processingStatus: 'Ready',
      uploadStatus: 'Uploaded',
      visibility: 'Public',
      price: isFree ? 0 : Number(price) || 0,
      discount: isFree ? 0 : Number(discount) || 0,
      isFree,
      published: status === 'Published',
      status,
      active: status === 'Published',
      featured,
      displayOrder: Number(displayOrder) || 1,
      views: editingVideo ? editingVideo.views || 0 : 0,
      likes: editingVideo ? editingVideo.likes || 0 : 0,
      uploadDate: editingVideo?.uploadDate || new Date().toISOString(),
      adminUploaderId: currentUser?.id || 'admin',
      adminUploaderEmail: currentUser?.email || 'admin@cyberx.gg',
      uploadedBy: currentUser?.email || 'admin@cyberx.gg',
      browserPlaybackSupported: true,
    };

    try {
      if (editingVideo) {
        await updateStoreVideo(editingVideo.id, videoRecord);
        addAuditLog('UPDATE_VIDEO', editingVideo.id, `Updated video "${trimmedTitle}" (${status})`);
        setIsModalOpen(false);
      } else {
        const result = await addStoreVideo(videoRecord);
        if (result.dbSuccess === false) {
          // Requirement 21: Database Failure Protection
          setUploadState('incomplete_db');
          setDbSaveFailed(true);
          setIncompleteVideo(result);
          setErrorCategory('Database write failed');
          setErrorMessage('Storage upload SUCCEEDED, but writing metadata to Firestore failed.');
          setErrorDetails(result.dbError || 'Firestore document write timed out or encountered rule permissions error.');
          showToast('Database Sync Incomplete', 'Storage file preserved. Reconcile metadata to complete publish.', 'error');
          return;
        }

        // Add to media gallery
        addMediaItem({
          name: trimmedTitle,
          url: videoUrl,
          type: 'video',
          sizeBytes: fileSize,
        });

        setIsModalOpen(false);
      }
    } catch (err: any) {
      setUploadState('incomplete_db');
      setDbSaveFailed(true);
      setErrorCategory('Database write failed');
      setErrorMessage(`Failed to save video record: ${err.message}`);
      setErrorDetails(err.stack || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reconcile / Retry Metadata Save (Requirement 21)
  const handleRetryDatabaseSave = async () => {
    if (!incompleteVideo) return;
    setIsRetryingDb(true);
    try {
      const res = await retrySaveVideoToFirestore(incompleteVideo);
      if (res.success) {
        setDbSaveFailed(false);
        setUploadState('completed');
        setIsModalOpen(false);
        showToast('Reconciliation Succeeded', 'Video metadata successfully synchronized to Firestore.', 'success');
      } else {
        setErrorDetails(res.error || 'Firestore write failed again');
        showToast('Retry Failed', res.error || 'Could not write to database.', 'error');
      }
    } finally {
      setIsRetryingDb(false);
    }
  };

  // Delete Video & Clean Storage
  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    setIsSubmitting(true);
    try {
      if (storage && deletingVideo.storagePath) {
        try {
          const fileRef = ref(storage, deletingVideo.storagePath);
          await deleteObject(fileRef);
        } catch (e) {
          console.warn('Storage file cleanup note:', e);
        }
      }

      if (storage && deletingVideo.thumbnailStoragePath) {
        try {
          const thumbRef = ref(storage, deletingVideo.thumbnailStoragePath);
          await deleteObject(thumbRef);
        } catch (e) {
          console.warn('Thumbnail storage cleanup note:', e);
        }
      }

      await deleteStoreVideo(deletingVideo.id);
      setDeletingVideo(null);
    } catch (err: any) {
      showToast('Error', `Delete failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal for existing video
  const handleOpenEdit = (vid: StoreVideo) => {
    playUiSound('click');
    setEditingVideo(vid);
    setTitle(vid.title);
    setDescription(vid.description || '');
    setCategory(vid.category || 'Trailers');
    setTags(vid.tags || []);
    setIsFree(vid.isFree ?? true);
    setPrice(vid.price || 0);
    setDiscount(vid.discount || 0);
    setStatus(vid.status || (vid.active ? 'Published' : 'Draft'));
    setFeatured(vid.featured || false);
    setDisplayOrder(vid.displayOrder ?? 1);

    setSelectedVideoFile(null);
    setVideoUrl(vid.videoUrl);
    setVideoStoragePath(vid.storagePath || '');
    setDuration(vid.duration || 0);
    setDurationFormatted(vid.durationFormatted || '00:00');
    setResolution(vid.resolution || '1080p');
    setWidth(vid.width || 1920);
    setHeight(vid.height || 1080);
    setFps(vid.fps || 60);
    setCodec(vid.codec || 'H.264');
    setContainer(vid.container || 'mp4');
    setBitrate(vid.bitrate);
    setBitrateFormatted(vid.bitrateFormatted || '');
    setIs4K(vid.is4K || false);
    setFileSize(vid.fileSize || 0);
    setFileSizeFormatted(vid.fileSizeFormatted || '0 MB');
    setFormat(vid.format || 'video/mp4');

    setThumbnailUrl(vid.thumbnailUrl || '');
    setThumbnailStoragePath(vid.thumbnailStoragePath || '');
    setAutoCapturedThumb(null);

    setUploadState(vid.videoUrl ? 'completed' : 'idle');
    setUploadProgress(100);
    setErrorCategory(null);
    setErrorMessage(null);
    setErrorDetails(null);
    setDbSaveFailed(false);
    setIsModalOpen(true);
  };

  // Dynamic Upload Button State (Requirement 13)
  const getUploadButtonLabel = () => {
    switch (uploadState) {
      case 'idle':
        return 'Select Video File';
      case 'selecting':
        return 'Analyzing & Extracting Frames...';
      case 'uploading':
        return `Uploading ${uploadProgress}%...`;
      case 'paused':
        return 'Upload Paused (Click Resume)';
      case 'processing':
        return 'Processing & Generating Poster...';
      case 'completed':
        return 'Ready ✓';
      case 'incomplete_db':
        return 'Database Write Failed (Retry)';
      case 'failed':
        return 'Retry Upload';
      case 'cancelled':
        return 'Upload Cancelled';
      default:
        return 'Upload Video';
    }
  };

  // Filtered Video Library
  const filteredVideos = storeVideos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && (v.status === 'Published' || v.active)) ||
      (statusFilter === 'draft' && (v.status === 'Draft' || !v.active)) ||
      (statusFilter === 'featured' && v.featured) ||
      (statusFilter === 'paid' && !v.isFree) ||
      (statusFilter === 'free' && v.isFree);

    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto animate-fadeIn"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.relatedTarget === null) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleProcessSelectedFile(file);
      }}
    >
      {/* Hidden Native File Inputs for direct system picker opening */}
      <input
        ref={topFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.ogg,.mov,.mkv,.m4v"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessSelectedFile(file);
        }}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <span>Storefront Video Hub</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400">
              4K / 120 FPS SUPPORTED
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade resumable file transfer directly to Firebase Storage with automatic frame rate detection and instant storefront sync.
          </p>
        </div>

        {/* The Working "Upload Video" Button (Requirement 2 & 3) */}
        <button
          id="admin-upload-video-btn"
          onClick={handleTriggerUpload}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-xl shadow-cyan-600/30 flex items-center gap-2.5 transition shrink-0 transform active:scale-95"
        >
          <Upload className="w-4 h-4 animate-bounce" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Drag & Drop Global Target Indicator */}
      {isDragging && (
        <div className="border-2 border-dashed border-cyan-400 bg-cyan-500/10 rounded-2xl p-6 text-center animate-pulse flex items-center justify-center gap-3">
          <FileVideo className="w-8 h-8 text-cyan-400" />
          <p className="text-sm font-bold text-cyan-300">Drop video file here to begin real transfer (MP4, WebM, MOV, MKV)</p>
        </div>
      )}

      {/* Stats Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stored</span>
          <p className="text-xl font-black text-white mt-1">{storeVideos.length}</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Published</span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {storeVideos.filter((v) => v.status === 'Published' || v.active).length}
          </p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Drafts</span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {storeVideos.filter((v) => v.status === 'Draft' || !v.active).length}
          </p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Featured</span>
          <p className="text-xl font-black text-cyan-400 mt-1">
            {storeVideos.filter((v) => v.featured).length}
          </p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, category, tags, codec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'published', 'draft', 'featured', 'paid', 'free'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No videos found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search query or filters.'
              : 'Transfer your first real video file to Firebase Storage to populate the hub.'}
          </p>
          <button
            onClick={handleTriggerUpload}
            className="mt-4 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Select & Upload Video File</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isPublished = video.status === 'Published' || video.active;

            return (
              <div
                key={video.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between group"
              >
                {/* Thumbnail & Video Preview Trigger */}
                <div
                  className="relative aspect-video bg-black overflow-hidden group/thumb cursor-pointer"
                  onClick={() => {
                    playUiSound('click');
                    setPreviewVideo(video);
                  }}
                >
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover/thumb:bg-slate-950/20 transition" />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-xl group-hover/thumb:scale-110 transition">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-cyan-300 uppercase tracking-wider border border-slate-700">
                      {video.category || 'Trailers'}
                    </span>
                    {(video.is4K || video.resolution?.includes('4K') || (video.width && video.width >= 3800)) && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-[10px] font-black text-slate-950 flex items-center gap-0.5 shadow-md">
                        <Sparkles className="w-2.5 h-2.5" /> 4K UHD
                      </span>
                    )}
                    {video.fps && video.fps >= 100 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md">
                        {video.fps} FPS
                      </span>
                    )}
                    {video.featured && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/90 backdrop-blur-md text-[10px] font-black text-slate-950 flex items-center gap-1 shadow-md">
                        FEATURED
                      </span>
                    )}
                    {!video.isFree && (
                      <span className="px-2 py-0.5 rounded bg-purple-600/90 backdrop-blur-md text-[10px] font-black text-white">
                        ${video.price?.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                    {video.resolution && !video.resolution.includes('4K') && (
                      <span className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-mono text-slate-300 border border-slate-750">
                        {video.resolution}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-bold text-white">
                      {video.durationFormatted || '00:00'}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {video.description || 'No description provided.'}
                    </p>

                    {/* Metadata Specs Strip */}
                    <div className="flex items-center gap-2 mt-2.5 text-[10px] font-mono text-slate-400 flex-wrap">
                      {video.codec && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {video.codec}
                        </span>
                      )}
                      {video.fps && video.fps < 100 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {video.fps}fps
                        </span>
                      )}
                      {video.bitrateFormatted && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {video.bitrateFormatted}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mt-2">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{video.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata telemetry */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        {video.fileSizeFormatted || 'N/A'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        {typeof video.views === 'number' ? video.views.toLocaleString() : video.views || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVideoActive(video.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          isPublished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleVideoFeatured(video.id)}
                      className={`p-1.5 rounded-lg transition ${
                        video.featured
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                      title={video.featured ? 'Remove from Homepage Spotlight' : 'Spotlight on Homepage'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        playUiSound('click');
                        setPreviewVideo(video);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Preview Video Player"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(video)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                      title="Edit Video Settings"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        playUiSound('pop');
                        setDeletingVideo(video);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD & EDIT MODAL (Requirements 1-13 & 20-21) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {editingVideo ? 'Edit Stored Video Asset' : 'Real Video Upload & Ingestion Studio'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Real resumable byte transfer to Firebase Storage with automated 4K/120fps inspection and persistent database synchronization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (uploadState === 'uploading') {
                    handleCancelUpload();
                  }
                  setIsModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Categorized Error Alert (Requirement 20 & 21) */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs space-y-2 animate-shake">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="flex-1">
                      {errorCategory && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 text-[10px] font-black uppercase tracking-wider mr-2">
                          {errorCategory}
                        </span>
                      )}
                      <span className="font-bold">{errorMessage}</span>
                    </div>
                  </div>

                  {/* Section 21: Database Failure Protection Status Display */}
                  {dbSaveFailed && (
                    <div className="mt-2 p-3 bg-slate-900/90 rounded-xl border border-rose-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Storage File Upload:</span>
                        <span className="text-emerald-400 font-bold">SUCCESS ✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Database Metadata Sync:</span>
                        <span className="text-rose-400 font-bold">FAILED ✕</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Overall Pipeline Status:</span>
                        <span className="text-amber-400 font-bold">INCOMPLETE</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Your uploaded video is safe in Firebase Storage. Click below to reconcile and write metadata without re-uploading bytes.
                      </p>
                      <button
                        type="button"
                        onClick={handleRetryDatabaseSave}
                        disabled={isRetryingDb}
                        className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        {isRetryingDb ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Reconciling with Firestore...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Metadata Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error Action Controls: Retry / Cancel / View Details */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {uploadState === 'failed' && (
                        <button
                          type="button"
                          onClick={handleRetryUpload}
                          className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry Upload</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setErrorCategory(null);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                      >
                        Dismiss
                      </button>
                    </div>

                    {errorDetails && (
                      <button
                        type="button"
                        onClick={() => setShowErrorDetails(!showErrorDetails)}
                        className="text-[11px] text-rose-300/80 hover:text-white underline flex items-center gap-1"
                      >
                        <span>{showErrorDetails ? 'Hide Details' : 'View Details'}</span>
                        {showErrorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {showErrorDetails && errorDetails && (
                    <pre className="mt-2 p-2 bg-black/60 rounded-lg text-[10px] font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap">
                      {errorDetails}
                    </pre>
                  )}
                </div>
              )}

              {/* Real Video Dropzone / Upload Bar (Requirements 1, 6, 7, 8, 9, 10) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>Source Video File</span>
                    <span className="text-rose-400">*</span>
                  </span>
                  {fileSizeFormatted !== '0 MB' && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {fileSizeFormatted}
                    </span>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-4 bg-slate-950/60 transition group">
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.ogg,.mov,.mkv,.m4v"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessSelectedFile(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploadState === 'uploading'}
                  />

                  {uploadState === 'uploading' || uploadState === 'paused' ? (
                    <div className="space-y-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold">
                          {uploadState === 'uploading' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          ) : (
                            <Pause className="w-4 h-4 text-amber-400" />
                          )}
                          <span>
                            {uploadState === 'uploading'
                              ? 'Transferring Actual Bytes to Firebase Storage...'
                              : 'Upload Suspended / Paused'}
                          </span>
                        </div>
                        <span className="font-mono text-white font-black text-sm">{uploadProgress}%</span>
                      </div>

                      {/* Real Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-200 ${
                            uploadState === 'paused'
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>

                      {/* Real Speed, Transferred Bytes, ETA, Pause / Resume / Cancel Controls */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>
                          {formatBytes(bytesTransferred)} / {formatBytes(totalBytes)}
                        </span>
                        {uploadSpeed && <span className="text-cyan-300 font-bold">{uploadSpeed}</span>}
                        {remainingTime && <span className="text-slate-400">{remainingTime}</span>}
                        <div className="flex items-center gap-2 z-20">
                          {uploadState === 'uploading' ? (
                            <button
                              type="button"
                              onClick={handlePauseUpload}
                              className="text-amber-400 hover:text-amber-300 font-bold underline"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResumeUpload}
                              className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                            >
                              Resume
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleCancelUpload}
                            className="text-rose-400 hover:text-rose-300 font-bold underline ml-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : uploadState === 'completed' || videoUrl ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {selectedVideoFile?.name || editingVideo?.originalFileName || 'Stored Video Object'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-400 font-mono flex-wrap">
                            <span>{durationFormatted}</span>
                            <span>&bull;</span>
                            <span>{resolution}</span>
                            <span>&bull;</span>
                            <span>{fps} FPS</span>
                            <span>&bull;</span>
                            <span>{codec}</span>
                            <span>&bull;</span>
                            <span>{fileSizeFormatted}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition shrink-0 z-20"
                      >
                        Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-5 text-center">
                      <FileVideo className="w-10 h-10 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                      <p className="text-xs font-bold text-white">Click or drag & drop video file</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        MP4, WebM, MOV, MKV, M4V (Supports 4K UHD & 120 FPS, up to 10 GB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Inspection Readout Panel */}
              {(duration > 0 || resolution !== '1080p' || is4K) && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Resolution</span>
                    <span className="text-white font-mono font-bold flex items-center gap-1 mt-0.5">
                      {resolution}
                      {is4K && <Sparkles className="w-3 h-3 text-amber-400" />}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Frame Rate</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">
                      {fps} FPS {fps >= 100 && '🚀'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">
                      {durationFormatted}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Codec / Container</span>
                    <span className="text-cyan-400 font-mono font-bold mt-0.5 block line-clamp-1">
                      {codec} ({container})
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Video Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Cyber Strike Grand Finals Highlights"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context, highlights, player names, or timestamps..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tags & Keywords</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = tagInput.trim();
                        if (trimmed && !tags.includes(trimmed)) {
                          setTags([...tags, trimmed]);
                          setTagInput('');
                        }
                      }
                    }}
                    placeholder="Add a tag (e.g. 4K, 120FPS, Finals) and press Enter"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = tagInput.trim();
                      if (trimmed && !tags.includes(trimmed)) {
                        setTags([...tags, trimmed]);
                        setTagInput('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-300 text-xs"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((item) => item !== t))}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Poster Thumbnail Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Video Poster Thumbnail</span>
                  {isUploadingThumb && (
                    <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading custom poster...
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  {/* Thumbnail Preview Box */}
                  <div className="relative w-36 aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shrink-0">
                    <img
                      src={thumbnailUrl || autoCapturedThumb || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <p className="text-slate-300">
                      Auto-captured from real video frame at 15% mark. You can also upload custom cover art.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCustomThumbnailChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Upload Custom Poster</span>
                      </button>
                      {autoCapturedThumb && (
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl(autoCapturedThumb)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-800 transition"
                        >
                          Use Auto Frame
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monetization & Access Control */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Access Control & Monetization</span>
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Free streaming for all members</p>
                    <p className="text-[11px] text-slate-400">
                      Unrestricted playback on customer storefront for visitors and players.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFree(!isFree)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isFree ? 'bg-cyan-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isFree ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {!isFree && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Price ($ USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Publication Status & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="Published">Published (Customer Live)</option>
                    <option value="Draft">Draft (Admin Only)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                    />
                    <span>Spotlight on Home</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions (Requirement 13) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="text-cyan-400">{getUploadButtonLabel()}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadState === 'uploading' || uploadState === 'selecting'}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synchronizing Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingVideo ? 'Save Changes' : 'Publish to Storefront'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN PREVIEW PLAYER MODAL (Requirement 19) */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col my-auto">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  ADMIN PREVIEW & METRICS
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

            {/* Video Canvas */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={previewVideo.videoUrl}
                poster={previewVideo.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Real Telemetry Metadata Strip */}
            <div className="p-5 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Duration</span>
                  <p className="font-mono text-white mt-0.5">{previewVideo.durationFormatted || '00:00'}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Resolution</span>
                  <p className="font-mono text-white mt-0.5">{previewVideo.resolution || '1080p'}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Frame Rate</span>
                  <p className="font-mono text-white mt-0.5">{previewVideo.fps || 60} FPS</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Codec</span>
                  <p className="font-mono text-cyan-400 mt-0.5">{previewVideo.codec || 'H.264'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-850">
                <div className="flex items-center gap-3">
                  <span>Size: {previewVideo.fileSizeFormatted || 'N/A'}</span>
                  <span>&bull;</span>
                  <span>Category: {previewVideo.category}</span>
                  <span>&bull;</span>
                  <span>Status: {previewVideo.status || 'Published'}</span>
                </div>
                {previewVideo.storagePath && (
                  <span className="font-mono text-slate-500 truncate max-w-xs">
                    {previewVideo.storagePath}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deletingVideo}
        title="Delete Video"
        message={`Are you sure you want to delete "${deletingVideo?.title}"? This will permanently remove the video record and delete the file object from Firebase Storage.`}
        confirmText="Delete Video"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingVideo(null)}
      />
    </div>
  );
};
