import React from 'react';
import { Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FeaturedVideoSidebar: React.FC = () => {
  const { videos, openVideoPlayer, navigate, playUiSound } = useApp();
  const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];

  if (!featuredVideo) return null;

  const handlePlayClick = () => {
    playUiSound('click');
    openVideoPlayer(featuredVideo);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase">
          FEATURED VIDEO
        </h3>
        <button
          onClick={() => {
            playUiSound('click');
            navigate('videos');
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          View All
        </button>
      </div>

      {/* Video Thumbnail with Circular Play Icon */}
      <div
        onClick={handlePlayClick}
        className="group relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden cursor-pointer bg-slate-900 shadow-inner"
      >
        <img
          src={featuredVideo.thumbnail}
          alt={featuredVideo.title}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all" />

        {/* Circular Play Button matching reference */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[11px] font-bold text-white">
          {featuredVideo.duration}
        </div>
      </div>

      {/* Video Details */}
      <div className="mt-3">
        <h4
          onClick={handlePlayClick}
          className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600 cursor-pointer transition"
        >
          {featuredVideo.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>{featuredVideo.views}</span>
          <span>{featuredVideo.duration}</span>
        </div>

        {/* Decorative Progress Bar matching reference */}
        <div className="w-full h-1 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
