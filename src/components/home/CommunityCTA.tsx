import React from 'react';
import { ArrowRight, MessageSquare, Twitter, Youtube, Instagram, Twitch } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommunityCTA: React.FC = () => {
  const { siteSettings, navigate, playUiSound } = useApp();

  const handleJoinDiscord = () => {
    playUiSound('claim');
    window.open(siteSettings.discordUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-10 text-white shadow-xl my-10 border border-blue-400/30">
      {/* Background Graphic elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-300 via-blue-400 to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black tracking-widest uppercase mb-3">
            <span>● CONNECT & MULTIPLAYER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            JOIN THE COMMUNITY
          </h2>
          <p className="text-sm sm:text-base text-blue-100 font-normal mt-2 leading-relaxed">
            Connect with gamers, share moments, find teammates, and be part of something epic!
          </p>

          {/* Social Icons row */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
            <a
              href={siteSettings.discordUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Discord Server"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white hover:text-indigo-600 flex items-center justify-center text-white transition shadow-sm"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <a
              href={siteSettings.twitterUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter Community"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white hover:text-blue-500 flex items-center justify-center text-white transition shadow-sm"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href={siteSettings.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube Channel"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white hover:text-red-600 flex items-center justify-center text-white transition shadow-sm"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white hover:text-pink-600 flex items-center justify-center text-white transition shadow-sm"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <button
              onClick={() => navigate('community')}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white hover:text-purple-600 flex items-center justify-center text-white transition shadow-sm"
              title="Open CYBERX Community Feed"
            >
              <Twitch className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleJoinDiscord}
            className="px-8 py-4 bg-white hover:bg-blue-50 text-slate-900 font-black text-sm rounded-full shadow-2xl hover:shadow-blue-900/50 flex items-center gap-2.5 transition transform hover:-translate-y-1 active:translate-y-0"
          >
            <span>Join Discord</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => {
              playUiSound('click');
              navigate('community');
            }}
            className="px-6 py-4 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-full backdrop-blur-md transition"
          >
            Explore Forums
          </button>
        </div>
      </div>
    </div>
  );
};
