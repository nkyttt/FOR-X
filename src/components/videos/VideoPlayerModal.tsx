import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  ThumbsUp,
  Share2,
  Sparkles,
} from 'lucide-react';

export const VideoPlayerModal: React.FC = () => {
  const { activeVideo, closeVideoPlayer, playUiSound, showToast, videos } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likesCount, setLikesCount] = useState(activeVideo?.likes || 1200);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (activeVideo) {
      setLikesCount(activeVideo.likes);
      setHasLiked(false);
      setIsPlaying(true);
    }
  }, [activeVideo]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeVideo) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        closeVideoPlayer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, isPlaying, isFullscreen]);

  if (!activeVideo) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLike = () => {
    playUiSound('click');
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      showToast('Liked!', 'Added to your liked videos');
    } else {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    playUiSound('click');
    if (navigator.share) {
      navigator.share({
        title: activeVideo.title,
        text: `Watch ${activeVideo.title} on CYBERX!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Video link copied to clipboard', 'info');
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
      >
            {/* Video Canvas Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center group">
          <video
            ref={videoRef}
            src={activeVideo.videoUrl}
            poster={activeVideo.thumbnail}
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Top Overlay Badges */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-black text-cyan-400 border border-cyan-500/30 shadow-lg uppercase tracking-wider">
              {activeVideo.category}
            </span>
            {(activeVideo.is4K || activeVideo.resolution?.includes('4K') || (activeVideo.width && activeVideo.width >= 3800)) && (
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 4K UHD
              </span>
            )}
            {(activeVideo.fps && activeVideo.fps >= 100) && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black shadow-lg">
                {activeVideo.fps} FPS
              </span>
            )}
            {activeVideo.resolution && !activeVideo.resolution.includes('4K') && (
              <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-300 font-mono text-[11px] border border-slate-700">
                {activeVideo.resolution}
              </span>
            )}
            {activeVideo.codec && (
              <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] border border-slate-700">
                {activeVideo.codec}
              </span>
            )}
          </div>

          {/* Close Button Top Right */}
          <button
            onClick={closeVideoPlayer}
            className="absolute top-4 right-4 z-30 p-2 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full transition shadow-lg border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Play Center Overlay when Paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
            >
              <Play className="w-8 h-8 ml-1 fill-current" />
            </button>
          )}

          {/* Custom Media Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition duration-200">
            {/* Seek Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="hover:text-blue-400 transition">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="hover:text-blue-400 transition">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Time Display */}
                <span className="text-slate-300 font-mono text-[11px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Playback speed selector */}
                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md text-[11px]">
                  {[0.75, 1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-1 rounded ${
                        playbackRate === s ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="hover:text-blue-400 transition">
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Information & Actions */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                {activeVideo.category}
              </span>
              <h2 className="text-xl font-black text-white mt-1">{activeVideo.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded by <span className="font-semibold text-slate-200">{activeVideo.creator}</span> &bull;{' '}
                {activeVideo.views} &bull; {activeVideo.publishedAt}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  hasLiked ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likesCount.toLocaleString()}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300 mt-4 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
            {activeVideo.description}
          </p>
        </div>
      </div>
    </div>
  );
};
