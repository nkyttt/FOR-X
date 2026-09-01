import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Eye, ThumbsUp, Video, Filter, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';

export const VideosView: React.FC = () => {
  const { videos, openVideoPlayer, playUiSound } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Trailers', 'Gameplay', 'Tutorials', 'Esports', 'Dev Updates'];

  const filteredVideos = videos.filter(
    (v) => selectedCategory === 'All' || v.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];

  const handlePlay = (video: VideoItem) => {
    playUiSound('click');
    openVideoPlayer(video);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Featured Video Spotlight */}
      {featuredVideo && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Spotlight Details */}
            <div className="lg:col-span-5 p-8 sm:p-12 text-white z-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 text-blue-400 text-xs font-black tracking-widest uppercase w-fit mb-4 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" /> FEATURED SPOTLIGHT
              </span>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                {featuredVideo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {featuredVideo.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                <span>By {featuredVideo.creator}</span>
                <span>&bull;</span>
                <span>{featuredVideo.views}</span>
                <span>&bull;</span>
                <span>{featuredVideo.duration}</span>
              </div>
              <button
                onClick={() => handlePlay(featuredVideo)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-extrabold text-sm rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2.5 w-fit transition transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Premiere</span>
              </button>
            </div>

            {/* Spotlight Media Thumbnail */}
            <div
              onClick={() => handlePlay(featuredVideo)}
              className="lg:col-span-7 relative h-72 sm:h-96 w-full cursor-pointer group overflow-hidden bg-black"
            >
              <img
                src={featuredVideo.thumbnail}
                alt={featuredVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden lg:block" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredVideos.length} Videos Available
        </span>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handlePlay(video)}
            className="group bg-white rounded-3xl p-3.5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition" />

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition shadow-lg">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Category tag & duration */}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider">
                {video.category}
              </span>
              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white">
                {video.duration}
              </span>
            </div>

            {/* Details */}
            <div className="mt-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Creator: {video.creator}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{video.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
