import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroBanner: React.FC = () => {
  const { navigate, openVideoPlayer, videos, playUiSound } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      badge: 'WELCOME TO CYBERX',
      titlePrimary: 'PLAY. WATCH.',
      titleGradient: 'EXPLORE.',
      description: 'Your ultimate destination for next-gen games, epic adventures and unforgettable moments.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85',
      characterImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80',
      activePlayers: '50K+',
      gameTarget: 'games',
    },
    {
      badge: 'SEASON 2 NOW LIVE',
      titlePrimary: 'DOMINATE.',
      titleGradient: 'CONQUER.',
      description: 'Engage in 120Hz tactical multiplayer battles across neon megacities and planetary arenas.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85',
      characterImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      activePlayers: '65K+',
      gameTarget: 'tournaments',
    },
    {
      badge: 'EXCLUSIVE ESPORTS CUP',
      titlePrimary: 'COMPETE. WIN.',
      titleGradient: 'LEGENDS.',
      description: 'Join the $100,000 CYBER CLASH tournament. Register your squad and claim the championship.',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=85',
      characterImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      activePlayers: '72K+',
      gameTarget: 'tournaments',
    },
  ];

  // Auto rotation
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const currentSlide = slides[activeSlide];

  const handleWatchTrailer = () => {
    playUiSound('click');
    const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];
    if (featuredVideo) {
      openVideoPlayer(featuredVideo);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xl transition-all min-h-[460px] lg:min-h-[500px] flex flex-col justify-between"
    >
      {/* Background artwork with gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentSlide.image}
          alt="CyberX Gaming Universe"
          className="w-full h-full object-cover object-center transition-all duration-700 transform scale-105"
        />
        {/* Subtle Cyber Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/40" />
      </div>

      {/* Hero Content on the Left */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl flex flex-col justify-center flex-1">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-bold tracking-wider mb-5 shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{currentSlide.badge}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none mb-4">
          <span>{currentSlide.titlePrimary} </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            {currentSlide.titleGradient}
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-8 max-w-md">
          {currentSlide.description}
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              playUiSound('click');
              navigate('games');
            }}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Explore Games</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleWatchTrailer}
            className="px-6 py-3.5 rounded-full bg-white/95 hover:bg-white text-slate-900 font-extrabold text-sm border border-slate-200 shadow-md hover:shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Watch Trailer</span>
            <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
          </button>
        </div>
      </div>

      {/* Floating Card & Controls at the Bottom */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                playUiSound('click');
                setActiveSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-2 ${
                activeSlide === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-500/60 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Floating "50K+ Active Players" Card with Activity Sparkline (Matches Reference Image) */}
        <div
          onClick={() => {
            playUiSound('click');
            navigate('community');
          }}
          className="cursor-pointer bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 w-fit flex items-center gap-3 sm:gap-4"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                {currentSlide.activePlayers}
              </span>
              <div className="p-1 bg-blue-100 rounded-lg text-blue-600">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Active Players</span>

            {/* Sparkline Activity Graph */}
            <div className="mt-1.5 w-24 h-5">
              <svg viewBox="0 0 100 24" className="w-full h-full stroke-indigo-600 fill-none">
                <path
                  d="M0 18 Q 20 6, 40 14 T 70 4 T 100 10"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
