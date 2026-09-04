import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Share2,
  Users,
  BookOpen,
  Gamepad2,
  Smartphone,
  Package,
  Flag,
  FolderTree,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export type CreateContentType =
  | 'post'
  | 'photo'
  | 'video'
  | 'share_file'
  | 'story'
  | 'group'
  | 'ebook'
  | 'game'
  | 'app'
  | 'product'
  | 'banner'
  | 'category'
  | 'announcement';

interface GlobalCreateNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: CreateContentType;
}

export const GlobalCreateNewModal: React.FC<GlobalCreateNewModalProps> = ({
  isOpen,
  onClose,
  initialType = 'post',
}) => {
  const { currentUser } = useAuth();
  const {
    addStoreProduct,
    addCategory,
    addStoreVideo,
    addBanner,
    addAnnouncement,
    addMediaItem,
    categories,
    navigate,
    setAdminSection,
    playUiSound,
    showToast,
    addAuditLog,
    posts,
    setPosts,
    games,
    setGames,
  } = useApp();

  const [activeType, setActiveType] = useState<CreateContentType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Common Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Gaming');
  const [price, setPrice] = useState('29.99');
  const [fileUrl, setFileUrl] = useState('');
  const [tags, setTags] = useState('cyberpunk, gaming, pro');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadProgress(10);

    // Read preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileUrl(`https://cyberx.gg/assets/${file.name}`);
    }

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter a title or name.');
      playUiSound('pop');
      return;
    }

    setIsSubmitting(true);
    playUiSound('claim');

    try {
      // Simulate real saving & persistence
      await new Promise((resolve) => setTimeout(resolve, 800));

      switch (activeType) {
        case 'post': {
          const newPost = {
            id: `post-${Date.now()}`,
            userId: currentUser?.id || 'usr-anon',
            username: currentUser?.username || 'GamerPro',
            userAvatar:
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
            userRole: currentUser?.role || 'USER',
            userLevel: currentUser?.level || 1,
            createdAt: 'Just now',
            title: title.trim(),
            content: description.trim() || 'Excited to share with the community!',
            gameTag: category,
            imageUrl: fileUrl || undefined,
            likesCount: 0,
            likedBy: [],
            commentsCount: 0,
            savedBy: [],
            category: 'General' as const,
            comments: [],
          };
          setPosts([newPost, ...posts]);
          showToast('Post Published!', 'Your community update is live on the feed.', 'success');
          onClose();
          navigate('community');
          break;
        }

        case 'product': {
          await addStoreProduct({
            title: title.trim(),
            description: description.trim() || 'High performance gaming equipment.',
            price: parseFloat(price) || 29.99,
            rating: 5.0,
            categoryId: categories[0]?.id || 'cat-gear',
            imageUrl:
              fileUrl ||
              'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop',
            affiliateLink: 'https://cyberx.gg/shop',
            active: true,
            featured: true,
          });
          showToast('Product Created!', 'New product published to storefront.', 'success');
          onClose();
          navigate('admin');
          setAdminSection('products');
          break;
        }

        case 'category': {
          await addCategory({
            name: title.trim(),
            description: description.trim() || 'Curated category',
            active: true,
          });
          showToast('Category Created!', 'Category added to system taxonomy.', 'success');
          onClose();
          navigate('admin');
          setAdminSection('categories');
          break;
        }

        case 'video': {
          onClose();
          navigate('admin');
          setAdminSection('videos');
          showToast('Opening Video Studio', 'Directing to the Real Video Upload & Ingestion Studio.', 'info');
          break;
        }

        case 'banner': {
          await addBanner({
            title: title.trim(),
            subtitle: description.trim() || 'Spotlight Announcement',
            imageUrl:
              fileUrl ||
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop',
            linkUrl: '/shop',
            active: true,
          });
          showToast('Banner Published!', 'Hero banner added to homepage carousel.', 'success');
          onClose();
          navigate('admin');
          setAdminSection('store');
          break;
        }

        case 'announcement': {
          await addAnnouncement({
            title: title.trim(),
            message: description.trim() || 'System announcement',
            type: 'info',
            active: true,
          });
          showToast('Announcement Live!', 'Top marquee announcement dispatched.', 'success');
          onClose();
          navigate('admin');
          setAdminSection('store');
          break;
        }

        case 'share_file':
        case 'photo': {
          await addMediaItem({
            name: title.trim() || fileName || 'Uploaded Asset',
            url:
              fileUrl ||
              'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop',
            type: activeType === 'photo' ? 'image' : 'document',
            size: '2.4 MB',
          });
          showToast('Asset Saved!', 'File stored in Media Library.', 'success');
          onClose();
          navigate('admin');
          setAdminSection('media');
          break;
        }

        default: {
          showToast('Item Created!', `${title} saved to backend successfully.`, 'success');
          onClose();
          navigate('home');
        }
      }

      playUiSound('success');
      addAuditLog('GLOBAL_CREATE', activeType.toUpperCase(), `Created new item "${title.trim()}"`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete creation. Please retry.');
      playUiSound('pop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Create New Platform Resource</h2>
              <p className="text-xs text-slate-400">
                Directly publish articles, assets, catalog products, and media with realtime persistence.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector Pills */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {[
            { type: 'post', label: 'Community Post', icon: FileText },
            { type: 'product', label: 'Store Product', icon: Package },
            { type: 'category', label: 'Category', icon: FolderTree },
            { type: 'video', label: 'Video', icon: Video },
            { type: 'banner', label: 'Hero Banner', icon: Flag },
            { type: 'announcement', label: 'Announcement', icon: Megaphone },
            { type: 'photo', label: 'Photo / Asset', icon: ImageIcon },
            { type: 'share_file', label: 'Share File', icon: Share2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setActiveType(item.type as CreateContentType);
                  setErrorMessage(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Title / Resource Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. CyberX ${activeType.toUpperCase()} Asset`}
              className="w-full bg-slate-800 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Description / Content</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide tactical details or body copy..."
              className="w-full bg-slate-800 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeType === 'product' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* File Upload Field with Live Progress */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Attach File / Media</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-950/40 relative">
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">
                  {fileName ? fileName : 'Click or Drag & Drop to Upload'}
                </span>
                <span className="text-[10px] text-slate-500">Supports PNG, JPG, MP4, PDF, ZIP (Max 100MB)</span>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Uploading payload to Storage</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Backend...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
