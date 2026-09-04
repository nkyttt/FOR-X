import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  FileText,
  Image,
  Video,
  Share2,
  Sparkles,
  Users,
  BookOpen,
  Gamepad2,
  Smartphone,
  UploadCloud,
  ShoppingBag,
  Flag,
  FolderTree,
  Megaphone,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { GlobalCreateNewModal, CreateContentType } from './GlobalCreateNewModal';

export const GlobalCreateNewButton: React.FC = () => {
  const { currentUser, user } = useAuth();
  const { navigate, setAdminSection, playUiSound, showToast, openAuthModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState<CreateContentType>('post');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || Boolean(user);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (type: CreateContentType) => {
    playUiSound('click');
    setIsOpen(false);

    if (!currentUser && !isAdmin) {
      openAuthModal('login');
      showToast('Authentication Required', 'Please sign in to create content.', 'info');
      return;
    }

    setModalContentType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          playUiSound('click');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
        title="Create New Content or Resource"
      >
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Create New</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-slate-100">
          {/* Header */}
          <div className="px-4 py-2 bg-slate-50/80 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {isAdmin ? 'Creator & Admin Actions' : 'Customer Actions'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-blue-100 text-blue-700">
              {isAdmin ? 'ADMIN' : currentUser ? 'MEMBER' : 'GUEST'}
            </span>
          </div>

          {/* Customer Choices */}
          <div className="p-2 space-y-0.5">
            <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Community & Social
            </p>
            <button
              onClick={() => handleAction('post')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <FileText className="w-4 h-4 text-blue-500" /> Create Post
            </button>
            <button
              onClick={() => handleAction('photo')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <Image className="w-4 h-4 text-emerald-500" /> Upload Photo
            </button>
            <button
              onClick={() => handleAction('video')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <Video className="w-4 h-4 text-rose-500" /> Upload Video
            </button>
            <button
              onClick={() => handleAction('share_file')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <Share2 className="w-4 h-4 text-indigo-500" /> Share File
            </button>
            <button
              onClick={() => handleAction('story')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Create Story
            </button>
            <button
              onClick={() => handleAction('group')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 transition"
            >
              <Users className="w-4 h-4 text-purple-500" /> Create Group
            </button>
          </div>

          {/* Admin Choices (Role Gated) */}
          {isAdmin ? (
            <div className="p-2 space-y-0.5 bg-slate-900/5 rounded-b-xl">
              <p className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Studio Management
              </p>
              <button
                onClick={() => handleAction('ebook')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" /> Create eBook
              </button>
              <button
                onClick={() => handleAction('video')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <Video className="w-4 h-4 text-rose-500" /> Upload Video
              </button>
              <button
                onClick={() => handleAction('game')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-500" /> Add Game
              </button>
              <button
                onClick={() => handleAction('app')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <Smartphone className="w-4 h-4 text-emerald-500" /> Add App
              </button>
              <button
                onClick={() => handleAction('share_file')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <UploadCloud className="w-4 h-4 text-blue-500" /> Upload File
              </button>
              <button
                onClick={() => handleAction('product')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <ShoppingBag className="w-4 h-4 text-purple-500" /> Create Product
              </button>
              <button
                onClick={() => handleAction('banner')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <Flag className="w-4 h-4 text-amber-500" /> Create Banner
              </button>
              <button
                onClick={() => handleAction('category')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <FolderTree className="w-4 h-4 text-teal-500" /> Create Category
              </button>
              <button
                onClick={() => handleAction('announcement')}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition"
              >
                <Megaphone className="w-4 h-4 text-orange-500" /> Create Announcement
              </button>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Admin actions restricted to administrators.</span>
              <button
                onClick={() => {
                  navigate('admin');
                  setIsOpen(false);
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Global Creation Modal */}
      <GlobalCreateNewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalContentType}
      />
    </div>
  );
};
