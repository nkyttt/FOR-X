import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, MessageSquare, Twitter, Youtube, Instagram, Disc as Discord, Sparkles, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    navigate,
    siteSettings,
    playUiSound,
    isMiniChatOpen,
    setIsMiniChatOpen,
    setIsMiniChatMinimized,
    globalChatMessages,
  } = useApp();

  const latestMsg = globalChatMessages[globalChatMessages.length - 1];

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-10 mt-16 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Global Community Chat Quick Connect Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-indigo-900/50">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-sm text-slate-100">
                <span>CYBERX Global Community Chat</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  142 GAMERS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {latestMsg ? (
                  <span>
                    <strong className="text-slate-300">@{latestMsg.username}:</strong> {latestMsg.content}
                  </span>
                ) : (
                  'Connect with gamers, find squads for tournaments, and share gear reviews.'
                )}
              </p>
            </div>
          </div>

          <button
            id="btn-footer-open-minichat"
            onClick={() => {
              playUiSound('click');
              setIsMiniChatOpen(true);
              setIsMiniChatMinimized(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isMiniChatOpen ? 'Focus Lobby Chat' : 'Open Mini-Chat'}</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Brand & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                playUiSound('click');
                navigate('home');
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base shadow-sm">
                X
              </div>
              <span className="font-extrabold text-xl tracking-wider text-slate-900">
                CYBER<span className="text-blue-600">X</span>
              </span>
            </div>
            <span className="text-xs text-slate-400">
              © {new Date().getFullYear()} {siteSettings.siteName}. All rights reserved.
            </span>
          </div>

          {/* Quick Legal and Info Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                playUiSound('click');
                navigate('security');
              }}
              className="hover:text-blue-600 transition"
            >
              About Us
            </button>
            <button
              onClick={() => {
                playUiSound('click');
                navigate('security');
              }}
              className="hover:text-blue-600 transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                playUiSound('click');
                navigate('security');
              }}
              className="hover:text-blue-600 transition"
            >
              Terms of Service
            </button>
            <button
              onClick={() => {
                playUiSound('click');
                navigate('security');
              }}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
            <button
              onClick={() => {
                playUiSound('click');
                navigate('admin');
              }}
              className="hover:text-blue-600 transition"
            >
              Admin CMS
            </button>
            <button
              onClick={() => {
                playUiSound('click');
                navigate('security');
              }}
              className="hover:text-blue-600 transition flex items-center gap-1 text-emerald-600"
            >
              <ShieldCheck className="w-4 h-4" /> Safety & Security
            </button>
          </div>

          {/* Social Links (Configured in admin site settings) */}
          <div className="flex items-center gap-3">
            <a
              href={siteSettings.discordUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <a
              href={siteSettings.twitterUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-500 hover:text-white transition shadow-sm"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={siteSettings.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-600 hover:text-white transition shadow-sm"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-pink-600 hover:text-white transition shadow-sm"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-slate-400">
          CYBERX Gaming Universe &bull; Built with Cloud Firestore, Next-Gen React, and Gemini 3.1 Pro Thinking Engine.
        </div>
      </div>
    </footer>
  );
};
