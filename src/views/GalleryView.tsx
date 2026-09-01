import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GalleryItem } from '../types';
import {
  Heart,
  Download,
  Share2,
  ZoomIn,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize,
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { gallery, playUiSound, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Concept Art', 'Screenshots', 'Characters', 'Wallpapers', 'Esports'];

  const filteredGallery = gallery.filter(
    (item) => selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const openLightbox = (idx: number) => {
    playUiSound('click');
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredGallery.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredGallery.length) % filteredGallery.length);
  };

  const handleShare = (item: GalleryItem) => {
    playUiSound('click');
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out ${item.title} on CYBERX Gaming`,
        url: item.imageUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.imageUrl);
      showToast('Copied', 'Image link copied to clipboard');
    }
  };

  const handleDownload = (item: GalleryItem) => {
    playUiSound('click');
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloading', 'Saved high-res artwork to downloads');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black tracking-widest uppercase mb-3 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VISUAL ART & MEDIA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            CYBERX <span className="text-purple-400">GALLERY</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            High-resolution 4K concept art, character models, tactical maps, and cinematic stills.
          </p>
        </div>
      </div>

      {/* Category Pills */}
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
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredGallery.length} Artworks
        </span>
      </div>

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGallery.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="h-64 sm:h-72 w-full overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Hover overlay with actions and info */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-purple-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider">
                  {item.category}
                </span>
                <button className="p-2 bg-slate-900/80 rounded-full hover:bg-white hover:text-slate-900 transition">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700/60">
                  <span>Author: {item.author}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-3 bg-slate-900 hover:bg-rose-600 text-white rounded-full transition shadow-xl"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next controls */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-white hover:text-slate-900 text-white rounded-full transition z-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-white hover:text-slate-900 text-white rounded-full transition z-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center">
            <img
              src={filteredGallery[lightboxIndex].imageUrl}
              alt={filteredGallery[lightboxIndex].title}
              className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
            />

            {/* Bottom info bar */}
            <div className="w-full mt-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  {filteredGallery[lightboxIndex].category}
                </span>
                <h3 className="text-lg font-black">{filteredGallery[lightboxIndex].title}</h3>
                <p className="text-xs text-slate-400">Created by {filteredGallery[lightboxIndex].author}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(filteredGallery[lightboxIndex])}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" /> Download 4K
                </button>
                <button
                  onClick={() => handleShare(filteredGallery[lightboxIndex])}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
