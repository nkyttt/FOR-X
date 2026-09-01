import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ChatChannel, GlobalChatMessage } from '../../types';
import {
  MessageSquare,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Smile,
  Volume2,
  VolumeX,
  Users,
  Flame,
  Gamepad2,
  Zap,
  Trophy,
  Crown,
  Sparkles,
  ChevronDown,
  Shield,
  Bot,
  Hash,
} from 'lucide-react';

const QUICK_EMOJIS = ['🔥', '🎮', '⚡', '🏆', '💎', '👾', '🎯', '🚀', '👑', '💥', '🌟', '🛡️'];

const QUICK_CHATS = [
  'GG WP! 🔥',
  'LFG Squad Up! 🎮',
  'Who is in the tournament? 🏆',
  'Nice setup! ⚡',
  'Let\'s run ranked matches! 🎯',
];

const CHANNELS: { id: ChatChannel; label: string; icon: any; desc: string }[] = [
  { id: 'general', label: 'General', icon: Hash, desc: 'Lobby chat & community banter' },
  { id: 'lfg', label: 'LFG Squads', icon: Users, desc: 'Find teammates & party up' },
  { id: 'gear', label: 'Gear Talk', icon: Zap, desc: 'Hardware, setups & peripherals' },
  { id: 'esports', label: 'Esports', icon: Trophy, desc: 'Tournament hype & live match discussion' },
];

export const GlobalMiniChat: React.FC = () => {
  const {
    isMiniChatOpen,
    setIsMiniChatOpen,
    isMiniChatMinimized,
    setIsMiniChatMinimized,
    chatChannel,
    setChatChannel,
    globalChatMessages,
    sendGlobalChatMessage,
    reactToGlobalChatMessage,
    soundEnabled,
    setSoundEnabled,
    playUiSound,
    resetUnreadChatCount,
  } = useApp();

  const { currentUser } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filter messages for active channel
  const currentMessages = globalChatMessages.filter(
    (msg) => msg.channel === chatChannel || msg.isSystem
  );

  // Auto-scroll when messages change if autoScroll is enabled
  useEffect(() => {
    if (isMiniChatOpen && !isMiniChatMinimized && autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isMiniChatOpen, isMiniChatMinimized, autoScroll]);

  // Reset unread count when opened
  useEffect(() => {
    if (isMiniChatOpen && !isMiniChatMinimized) {
      resetUnreadChatCount();
    }
  }, [isMiniChatOpen, isMiniChatMinimized, resetUnreadChatCount]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isAtBottom);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSubmitting) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setIsSubmitting(true);
    setShowEmojiPicker(false);

    const sender = {
      id: currentUser?.id || 'usr_guest_' + (guestName || 'Gamer'),
      username: currentUser?.username || guestName || 'CyberGamer',
      displayName: currentUser?.displayName || guestName || 'Cyber Gamer',
      avatarUrl: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || guestName || 'Gamer'}`,
      role: currentUser?.role || 'USER',
      level: currentUser?.level || 1,
      badge: currentUser?.badges?.[0] || (currentUser?.role === 'OWNER' ? 'STAFF' : 'MEMBER'),
    };

    await sendGlobalChatMessage(content, chatChannel, sender);
    setIsSubmitting(false);
    setAutoScroll(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleQuickChatClick = (text: string) => {
    setInputMessage(text);
    inputRef.current?.focus();
  };

  const addEmojiToInput = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isMiniChatOpen) return null;

  // Minimized Floating Pill View
  if (isMiniChatMinimized) {
    const latestMsg = globalChatMessages[globalChatMessages.length - 1];
    return (
      <div
        id="global-mini-chat-minimized-pill"
        onClick={() => {
          playUiSound('click');
          setIsMiniChatMinimized(false);
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-slate-900/95 hover:bg-slate-900 border border-blue-500/50 hover:border-blue-400 text-white px-4 py-2.5 rounded-full shadow-2xl shadow-blue-900/30 cursor-pointer backdrop-blur-md transition-all duration-200 group hover:scale-[1.02]"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40">
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
        <div className="flex flex-col text-left pr-1 max-w-[200px] truncate">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <span>Global Chat</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-950 text-blue-300 rounded font-mono border border-blue-800/60">
              #{chatChannel}
            </span>
          </div>
          {latestMsg && (
            <span className="text-[11px] text-slate-400 truncate">
              <strong className="text-slate-300">{latestMsg.displayName}:</strong> {latestMsg.content}
            </span>
          )}
        </div>
        <button
          id="btn-close-minichat-pill"
          onClick={(e) => {
            e.stopPropagation();
            playUiSound('click');
            setIsMiniChatOpen(false);
          }}
          aria-label="Close Chat"
          className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full Expanded / Standard Overlay View
  return (
    <div
      id="global-mini-chat-overlay"
      className={`fixed bottom-4 right-4 sm:right-6 z-40 flex flex-col bg-slate-950/95 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        isExpanded
          ? 'w-[95vw] sm:w-[540px] h-[85vh] sm:h-[640px]'
          : 'w-[95vw] sm:w-[380px] h-[520px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-wide text-white">CYBERX LOBBY</span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-950 text-emerald-300 font-semibold rounded border border-emerald-800/60">
                LIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>142 gamers connected</span>
            </div>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            id="btn-toggle-chat-sound"
            onClick={() => {
              playUiSound('click');
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute Chat Sound' : 'Enable Chat Sound'}
            aria-label={soundEnabled ? 'Mute Chat Sound' : 'Enable Chat Sound'}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            id="btn-toggle-chat-expand"
            onClick={() => {
              playUiSound('click');
              setIsExpanded(!isExpanded);
            }}
            title={isExpanded ? 'Standard Window' : 'Expand Window'}
            aria-label={isExpanded ? 'Standard Window' : 'Expand Window'}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            id="btn-minimize-chat"
            onClick={() => {
              playUiSound('click');
              setIsMiniChatMinimized(true);
            }}
            title="Minimize to Pill"
            aria-label="Minimize Chat"
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-close-chat"
            onClick={() => {
              playUiSound('click');
              setIsMiniChatOpen(false);
            }}
            title="Close Chat"
            aria-label="Close Chat"
            className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const isActive = chatChannel === ch.id;
          return (
            <button
              key={ch.id}
              id={`chat-tab-${ch.id}`}
              onClick={() => {
                playUiSound('click');
                setChatChannel(ch.id);
                setAutoScroll(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* Channel Header Banner */}
      <div className="px-3 py-1 bg-slate-900/30 border-b border-slate-800/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate">
          {CHANNELS.find((c) => c.id === chatChannel)?.desc}
        </span>
        <span className="text-slate-500 text-[10px]">Real-Time Sync</span>
      </div>

      {/* Message Feed Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth text-xs"
      >
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 text-slate-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-blue-400" />
            <p className="font-semibold text-slate-400">No messages in #{chatChannel} yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Be the first gamer to post here!</p>
          </div>
        ) : (
          currentMessages.map((msg) => {
            const isMe = msg.userId === currentUser?.id || msg.username === currentUser?.username;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>{msg.displayName}</span>
                    <span className="text-[10px] px-1 bg-blue-900 text-blue-300 rounded font-mono">SYS</span>
                    <span className="ml-auto text-[10px] text-blue-400/60 font-normal">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="leading-relaxed text-blue-100">{msg.content}</p>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`group flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <img
                  src={msg.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.username}`}
                  alt={msg.displayName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 mt-0.5 object-cover"
                />

                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[82%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Meta Info */}
                  <div className="flex items-center gap-1.5 mb-0.5 text-[11px]">
                    <span className={`font-semibold ${isMe ? 'text-blue-300' : 'text-slate-200'}`}>
                      {msg.displayName}
                    </span>
                    {msg.userLevel && (
                      <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-amber-400 font-mono rounded border border-slate-700">
                        LV.{msg.userLevel}
                      </span>
                    )}
                    {msg.role === 'OWNER' || msg.role === 'ADMIN' ? (
                      <span className="text-[9px] px-1 py-0.2 bg-red-950 text-red-300 font-bold rounded border border-red-800/60 flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> STAFF
                      </span>
                    ) : msg.badge ? (
                      <span className="text-[9px] px-1 py-0.2 bg-indigo-950 text-indigo-300 font-bold rounded border border-indigo-800/50">
                        {msg.badge}
                      </span>
                    ) : null}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Reactions Pill Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => {
                        const numCount = typeof count === 'number' ? count : Number(count);
                        if (!numCount || numCount <= 0) return null;
                        return (
                          <button
                            key={emoji}
                            onClick={() => reactToGlobalChatMessage(msg.id, emoji)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition"
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-slate-400">{numCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Hover Reaction Shortcut Bar */}
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 bg-slate-900/90 px-1.5 py-0.5 rounded-full border border-slate-800 ${
                      isMe ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {['🔥', '🎮', '⚡', '🏆'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => reactToGlobalChatMessage(msg.id, emoji)}
                        className="hover:scale-125 text-xs transition px-0.5"
                        title={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Auto Scroll to Bottom Button */}
      {!autoScroll && (
        <div className="absolute bottom-24 right-4 z-20">
          <button
            id="btn-scroll-chat-latest"
            onClick={() => {
              setAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-full shadow-lg border border-blue-400/40 transition hover:scale-105"
          >
            <ChevronDown className="w-3 h-3 animate-bounce" />
            <span>New messages</span>
          </button>
        </div>
      )}

      {/* Quick Chat Presets Ribbon */}
      <div className="px-3 py-1 bg-slate-950 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_CHATS.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickChatClick(qc)}
            className="text-[10px] whitespace-nowrap px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-full transition"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Quick Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 grid grid-cols-6 gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmojiToInput(emoji)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-base text-center hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input & Sender Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-1.5"
      >
        {/* User Identity / Guest Switcher */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Posting as:</span>
            {isEditingGuestName ? (
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onBlur={() => setIsEditingGuestName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingGuestName(false)}
                autoFocus
                placeholder="Enter gamer tag..."
                className="bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded border border-blue-500 outline-none w-28"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingGuestName(true)}
                className="text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>{currentUser?.displayName || guestName || 'CyberGamer (Guest)'}</span>
                <span className="text-[10px] text-slate-500 font-normal">(change)</span>
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {inputMessage.length}/500
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-chat-emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Insert Emoji"
            className={`p-2 rounded-xl transition ${
              showEmojiPicker
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            id="input-global-chat-message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message #${chatChannel}...`}
            maxLength={500}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3 py-2 outline-none transition"
          />

          <button
            type="submit"
            id="btn-send-chat-message"
            disabled={!inputMessage.trim() || isSubmitting}
            aria-label="Send Message"
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
