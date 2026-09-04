import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { auth, ensureFirebaseAuth } from '../lib/firebase';
import { FirebasePost, subscribeToRealPosts } from '../services/communityFirebaseService';
import { CreatePostBox } from '../components/community/CreatePostBox';
import { RealPostCard } from '../components/community/RealPostCard';
import { CommunityPost } from '../types';
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  Sparkles,
  Trophy,
  Users,
  Image as ImageIcon,
  Flame,
  Tag,
  Search,
  Bookmark,
  Radio,
  UserPlus,
  ShieldCheck,
  Award,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  ThumbsUp,
  Gamepad2,
  TrendingUp,
  X,
  MessageCircle,
  Compass,
  Film,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MoreHorizontal,
  BarChart3,
  Repeat,
  Hash,
  LogOut,
  ArrowLeft,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Shield,
  Layers,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Navigation & Category Types
type SidebarTab = 'feed' | 'explore' | 'squads' | 'clips' | 'saved' | 'tournaments' | 'chat';
type CommunityFilterTab = 'all' | 'trending' | 'squads' | 'clips' | 'guides' | 'following' | 'saved';
type SortOption = 'trending' | 'recent' | 'top' | 'discussed';

// Story Interface
interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  caption: string;
  mediaUrl: string;
  timestamp: string;
  isViewed: boolean;
  gameTag: string;
  likes: number;
}

// Suggested Gamer Interface
interface SuggestedGamer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  game: string;
  followersCount: number;
  isFollowing: boolean;
}

// Live Voice / Squad Room Interface
interface LiveVoiceRoom {
  id: string;
  title: string;
  game: string;
  host: string;
  hostAvatar: string;
  membersCount: number;
  maxMembers: number;
  isLive: boolean;
  tag: string;
}

// Interactive Poll Data Structure
interface InteractivePoll {
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  userVoteIndex?: number;
}

export const CommunityView: React.FC = () => {
  const { playUiSound, showToast, navigate } = useApp();
  const { currentUser, addXpAndPoints } = useAuth();

  // Real Firestore Posts State
  const [realPosts, setRealPosts] = useState<FirebasePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Real-time Firestore subscription to collection 'posts'
  useEffect(() => {
    setIsLoadingPosts(true);
    const unsubscribe = subscribeToRealPosts(
      (loadedPosts) => {
        setRealPosts(loadedPosts);
        setIsLoadingPosts(false);
        setFirestoreError(null);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setFirestoreError(err.message || 'Error synchronizing with Firestore');
        setIsLoadingPosts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const ensureAuth = (): boolean => {
    if (auth.currentUser) return true;
    ensureFirebaseAuth().catch((err) => console.warn('Auto session error:', err));
    return true;
  };

  // Mobile Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Left Sidebar Active Section
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('feed');

  // Top Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(false);

  // Community Navigation Tabs
  const [activeFilterTab, setActiveFilterTab] = useState<CommunityFilterTab>('all');
  const [selectedGameTag, setSelectedGameTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  // Notifications Popover State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'New Squad Invite', desc: 'Valkyrie_Lead invited you to Team Apex Vanguard', time: '10m ago', unread: true },
    { id: 'n2', title: 'Post Upvoted', desc: 'GhostSniper and 14 others liked your Sector 7 guide', time: '1h ago', unread: true },
    { id: 'n3', title: 'Tournament Reminder', desc: 'CYBER CLASH Invitational begins in 2 hours', time: '2h ago', unread: false },
  ]);

  // Stories State & Data
  const [stories, setStories] = useState<StoryItem[]>([
    {
      id: 'story-1',
      userId: 'user-valk',
      userName: 'Valkyrie_Lead',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie',
      userRole: 'PRO SQUAD',
      caption: 'Secured the 1v4 Ace clutch in Grandmaster Sector 7! 🔥',
      mediaUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80',
      timestamp: '2h ago',
      isViewed: false,
      gameTag: 'Cyber Strike',
      likes: 342,
    },
    {
      id: 'story-2',
      userId: 'user-kai',
      userName: 'Kai_Vortex',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kai',
      userRole: 'VERIFIED',
      caption: 'New triple monitor battlestation setup ready for tournament streaming.',
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      timestamp: '4h ago',
      isViewed: false,
      gameTag: 'Battle Arena',
      likes: 512,
    },
    {
      id: 'story-3',
      userId: 'user-elena',
      userName: 'Elena_Cyber',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
      userRole: 'CREATOR',
      caption: 'Neon Riders world record speedrun lap: 0:47.88s! ⚡',
      mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      timestamp: '6h ago',
      isViewed: false,
      gameTag: 'Neon Riders',
      likes: 720,
    },
    {
      id: 'story-4',
      userId: 'user-zeno',
      userName: 'ZenoTactics',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zeno',
      userRole: 'ANALYST',
      caption: 'Full breakdown of Pulse Carbine recoil patterns uploaded to guides tab!',
      mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      timestamp: '8h ago',
      isViewed: true,
      gameTag: 'Cyber Strike',
      likes: 198,
    },
    {
      id: 'story-5',
      userId: 'user-maya',
      userName: 'CyberArtisan',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya',
      userRole: 'ARTIST',
      caption: 'Ray-traced cyberpunk cityscape fan art rendered at 4K resolution.',
      mediaUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      timestamp: '12h ago',
      isViewed: true,
      gameTag: 'Shadow Legends',
      likes: 641,
    },
  ]);

  // Active Story Viewer Modal
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyReplyText, setStoryReplyText] = useState('');
  const storyProgressIntervalRef = useRef<any>(null);

  // Story Creator Modal
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [newStoryImageUrl, setNewStoryImageUrl] = useState('https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80');
  const [newStoryGame, setNewStoryGame] = useState('Cyber Strike');

  // Suggested Gamers to Follow
  const [suggestedGamers, setSuggestedGamers] = useState<SuggestedGamer[]>([
    {
      id: 'gamer-1',
      name: 'Kira_Viper',
      handle: '@kiraviper',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kira',
      role: 'PRO SNIPER',
      game: 'Cyber Strike',
      followersCount: 14200,
      isFollowing: false,
    },
    {
      id: 'gamer-2',
      name: 'ApexPredator',
      handle: '@apexpredator',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Apex',
      role: 'CHAMPION',
      game: 'Battle Arena',
      followersCount: 28900,
      isFollowing: false,
    },
    {
      id: 'gamer-3',
      name: 'PixelWitch',
      handle: '@pixelwitch',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Witch',
      role: 'STREAMER',
      game: 'Neon Riders',
      followersCount: 19400,
      isFollowing: true,
    },
    {
      id: 'gamer-4',
      name: 'CyberRonin',
      handle: '@cyberronin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ronin',
      role: 'TACTICIAN',
      game: 'Shadow Legends',
      followersCount: 8900,
      isFollowing: false,
    },
  ]);

  // Live Squad & Voice Rooms
  const [liveRooms, setLiveRooms] = useState<LiveVoiceRoom[]>([
    {
      id: 'room-1',
      title: 'Grandmaster Ranked Comms',
      game: 'Cyber Strike',
      host: 'Valkyrie_Lead',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie',
      membersCount: 4,
      maxMembers: 5,
      isLive: true,
      tag: 'Ranked NA',
    },
    {
      id: 'room-2',
      title: 'Neon Drift Chill & Grinding',
      game: 'Neon Riders',
      host: 'Elena_Cyber',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
      membersCount: 3,
      maxMembers: 4,
      isLive: true,
      tag: 'Casual',
    },
    {
      id: 'room-3',
      title: 'Strategy & Meta Discussion',
      game: 'Battle Arena',
      host: 'ZenoTactics',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zeno',
      membersCount: 8,
      maxMembers: 12,
      isLive: true,
      tag: 'Theorycraft',
    },
  ]);

  const [joinedRooms, setJoinedRooms] = useState<{ [id: string]: boolean }>({});

  // Trending Hashtags
  const trendingTags = [
    { tag: '#CYBERCLASH2026', count: '38.4K posts', game: 'All' },
    { tag: '#PulseCarbineBuff', count: '16.2K posts', game: 'Cyber Strike' },
    { tag: '#Sector7Ace', count: '12.8K posts', game: 'Cyber Strike' },
    { tag: '#NeonWorldRecord', count: '9.4K posts', game: 'Neon Riders' },
    { tag: '#UnrealEngine5Art', count: '6.1K posts', game: 'Shadow Legends' },
  ];

  // Post Creator States
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'General' | 'Clips & Highlights' | 'Game Help' | 'Esports' | 'Memes'>('General');
  const [newGameTag, setNewGameTag] = useState('Cyber Strike');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('Option A');
  const [pollOption2, setPollOption2] = useState('Option B');
  const [isLfgSquad, setIsLfgSquad] = useState(false);
  const [lfgSlots, setLfgSlots] = useState('3/5');
  const [lfgRank, setLfgRank] = useState('Diamond+');
  const [lfgRegion, setLfgRegion] = useState('NA East');

  // Interactive Feed States
  const [likedPosts, setLikedPosts] = useState<{ [id: string]: boolean }>({});
  const [savedPosts, setSavedPosts] = useState<{ [id: string]: boolean }>({});
  const [boostedPosts, setBoostedPosts] = useState<{ [id: string]: boolean }>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [requestedSquads, setRequestedSquads] = useState<{ [postId: string]: boolean }>({});

  // Local Poll Votes state
  const [pollVotes, setPollVotes] = useState<{ [postId: string]: number }>({});

  // Sample preset images for quick testing in composer
  const samplePresets = [
    { label: 'Cyber Strike', url: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80' },
    { label: 'Neon Circuit', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sci-Fi Rig', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Neon City', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
  ];

  // Story Viewer Timer Effect
  useEffect(() => {
    if (activeStoryIndex === null || isStoryPaused) return;

    storyProgressIntervalRef.current = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((idx) => (idx !== null ? idx + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // ~5 seconds duration
      });
    }, 100);

    return () => clearInterval(storyProgressIntervalRef.current);
  }, [activeStoryIndex, isStoryPaused, stories.length]);

  // Mark story as viewed when opened
  const handleOpenStory = (index: number) => {
    if (!isMuted) playUiSound('click');
    setActiveStoryIndex(index);
    setStoryProgress(0);
    setStories((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isViewed: true } : s))
    );
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
    } else {
      setStoryProgress(0);
    }
  };

  // Story Reply Submit
  const handleSendStoryReply = () => {
    if (!storyReplyText.trim() || activeStoryIndex === null) return;
    const currentStory = stories[activeStoryIndex];
    if (!isMuted) playUiSound('claim');
    showToast('Direct Reply Sent', `Sent message to ${currentStory.userName}: "${storyReplyText}"`, 'success');
    setStoryReplyText('');
    confetti({ particleCount: 30, spread: 50 });
  };

  // Add Story Submit
  const handleAddStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryCaption.trim()) return;

    const newStory: StoryItem = {
      id: `story-${Date.now()}`,
      userId: currentUser?.id || 'me',
      userName: currentUser?.displayName || 'My Story',
      userAvatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me',
      userRole: 'OPERATIVE',
      caption: newStoryCaption.trim(),
      mediaUrl: newStoryImageUrl.trim() || 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80',
      timestamp: 'Just now',
      isViewed: false,
      gameTag: newStoryGame,
      likes: 1,
    };

    setStories([newStory, ...stories]);
    setIsAddStoryOpen(false);
    setNewStoryCaption('');
    if (!isMuted) playUiSound('claim');
    confetti({ particleCount: 50, spread: 60 });
    addXpAndPoints(100, 20, 'Story Broadcast');
    showToast('Story Live', 'Your 24h gaming story has been published across CYBERX!', 'success');
  };

  // Follow / Unfollow Gamer
  const handleToggleFollow = (gamer: SuggestedGamer) => {
    if (!isMuted) playUiSound('click');
    setSuggestedGamers((prev) =>
      prev.map((g) => {
        if (g.id === gamer.id) {
          const nextState = !g.isFollowing;
          showToast(
            nextState ? 'Operative Followed' : 'Unfollowed',
            nextState ? `You are now receiving tactical dispatches from ${g.name}` : `Removed ${g.name} from your following feed`,
            'info'
          );
          return {
            ...g,
            isFollowing: nextState,
            followersCount: g.followersCount + (nextState ? 1 : -1),
          };
        }
        return g;
      })
    );
  };

  // Join Live Voice / Squad Room
  const handleToggleJoinRoom = (room: LiveVoiceRoom) => {
    if (!isMuted) playUiSound('claim');
    const isJoined = joinedRooms[room.id];
    setJoinedRooms((prev) => ({ ...prev, [room.id]: !isJoined }));
    if (!isJoined) {
      confetti({ particleCount: 40, spread: 60 });
      showToast('Voice Channel Joined', `Connected to ${room.title} (${room.game}). Mic is active.`, 'success');
    } else {
      showToast('Channel Left', `Disconnected from ${room.title}`, 'info');
    }
  };

  // Request to Join Squad from Feed
  const handleRequestJoinSquad = (post: CommunityPost) => {
    if (!isMuted) playUiSound('claim');
    setRequestedSquads((prev) => ({ ...prev, [post.id]: true }));
    confetti({ particleCount: 45, spread: 60 });
    showToast('Recruitment Request Sent', `Invite request sent to ${post.username} for squad fireteam!`, 'success');
  };

  // Filter & Search Logic
  const filteredPosts = useMemo(() => {
    let result = [...realPosts];

    // Navigation Tab Filter
    if (activeFilterTab === 'clips') {
      result = result.filter(
        (p) =>
          p.mediaType === 'video' ||
          p.category === 'Clips & Highlights' ||
          (p.mediaUrl && /\.(mp4|webm|mov|ogg)$/i.test(p.mediaUrl))
      );
    } else if (activeFilterTab === 'guides') {
      result = result.filter(
        (p) =>
          p.category === 'Game Help' ||
          p.text.toLowerCase().includes('guide') ||
          p.text.toLowerCase().includes('meta')
      );
    }

    // Game Tag Filter
    if (selectedGameTag !== 'All') {
      result = result.filter((p) => p.gameTag && p.gameTag.toLowerCase() === selectedGameTag.toLowerCase());
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          (p.authorName && p.authorName.toLowerCase().includes(q)) ||
          (p.gameTag && p.gameTag.toLowerCase().includes(q))
      );
    }

    return result;
  }, [realPosts, activeFilterTab, selectedGameTag, searchQuery, sortBy]);

  // Quick hashtag click to filter
  const handleTagClick = (tag: string) => {
    if (!isMuted) playUiSound('click');
    setSearchQuery(tag);
    showToast('Filtered by Tag', `Showing all discussions tagged ${tag}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* ========================================================================= */}
      {/* 2. TOP HEADER WITH SEARCH */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0D1117]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Mobile Hamburger & Hub Logo */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-toggle-button"
              onClick={() => {
                if (!isMuted) playUiSound('click');
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              }}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Mobile Sidebar"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* CYBERX Brand Logo Link back to Store/Home */}
            <button
              onClick={() => {
                if (!isMuted) playUiSound('click');
                navigate('home');
              }}
              className="flex items-center gap-2.5 group text-left"
              title="Return to CYBERX Storefront"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                CX
              </div>
              <div className="hidden sm:block leading-none">
                <span className="text-sm font-black tracking-wider text-white flex items-center gap-1">
                  CYBERX
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-cyan-300 rounded font-black border border-cyan-400/30">
                    HUB
                  </span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  Global Network
                </span>
              </div>
            </button>
          </div>

          {/* Center: Top Search with live filter */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="community-top-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dispatches, squads, #tags, or players..."
                className="w-full bg-[#161B22] text-slate-100 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-2xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Quick Results Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#161B22] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in duration-150">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                  Search Results for "{searchQuery}"
                </span>
                {filteredPosts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSearchQuery(p.title);
                      setIsSearchFocused(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-bold text-slate-200 truncate">{p.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">by @{p.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Actions, Notifications, Audio Toggle, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action: New Dispatch CTA */}
            <button
              id="top-create-dispatch-button"
              onClick={() => {
                if (!isMuted) playUiSound('click');
                window.scrollTo({ top: 380, behavior: 'smooth' });
                showToast('Composer Focused', 'Ready to broadcast your tactical dispatch', 'info');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dispatch</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                showToast(isMuted ? 'Sound Enabled' : 'Sound Muted', '', 'info');
              }}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-xl transition"
              title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="community-notifications-button"
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0D1117] animate-pulse" />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#161B22] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-black uppercase text-slate-300">Notifications</span>
                    <button
                      onClick={() => {
                        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                        showToast('Notifications Cleared', 'All alerts marked as read', 'info');
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-xl text-xs space-y-0.5 ${
                          n.unread ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Storefront Link */}
            <button
              onClick={() => {
                if (!isMuted) playUiSound('click');
                navigate('home');
              }}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
              title="Return to Main Store"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Store</span>
            </button>

            {/* User Level & Avatar */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="relative">
                <img
                  src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                  alt="My Profile"
                  className="w-8 h-8 rounded-xl bg-slate-800 object-cover border border-cyan-500/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1117]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN 3-COLUMN LAYOUT: (1) LEFT SIDEBAR | (4, 3, 5) CENTER FEED | (6) RIGHT PANEL */}
      {/* ========================================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR */}
        {/* ========================================================================= */}
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-20 space-y-5">
          <div className="bg-[#161B22] rounded-3xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
            {/* Live Operative Telemetry Pill */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-cyan-950/20 border border-blue-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-black text-cyan-300 tracking-wider uppercase">
                  OPERATIVES ONLINE
                </span>
              </div>
              <span className="text-xs font-black text-white">4,120</span>
            </div>

            {/* Primary Community Nav Menu */}
            <nav className="space-y-1">
              {[
                { id: 'feed', label: 'Community Feed', icon: MessageSquare, badge: 'Active' },
                { id: 'explore', label: 'Explore & Discover', icon: Compass },
                { id: 'squads', label: 'Squads (LFG)', icon: Users, badge: '12 Live' },
                { id: 'clips', label: 'Clips & Media', icon: Film },
                { id: 'saved', label: 'Saved Dispatches', icon: Bookmark, count: Object.values(savedPosts).filter(Boolean).length },
                { id: 'tournaments', label: 'Tournaments Hub', icon: Trophy },
                { id: 'chat', label: 'Direct Messages', icon: MessageCircle, count: 3 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      if (!isMuted) playUiSound('click');
                      setActiveSidebarTab(item.id as SidebarTab);
                      if (item.id === 'squads') setActiveFilterTab('squads');
                      else if (item.id === 'clips') setActiveFilterTab('clips');
                      else if (item.id === 'saved') setActiveFilterTab('saved');
                      else if (item.id === 'feed') setActiveFilterTab('all');
                      else if (item.id === 'tournaments') navigate('tournaments');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-cyan-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Divider */}
            <div className="border-t border-slate-800/80 pt-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 block mb-1">
                Storefront & Admin
              </span>

              {/* Storefront Link */}
              <button
                id="sidebar-link-store"
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  navigate('home');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>CYBERX Storefront</span>
              </button>

              {/* Games Library Link */}
              <button
                id="sidebar-link-games"
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  navigate('games');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span>Games Catalog</span>
              </button>

              {/* Admin Portal Link */}
              <button
                id="sidebar-link-admin"
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  navigate('admin');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </button>
            </div>

            {/* Mini User Profile Card at Bottom of Sidebar */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                  alt="My Profile"
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 shrink-0"
                />
                <div className="truncate leading-tight">
                  <span className="text-xs font-black text-slate-200 block truncate">
                    {currentUser?.displayName || 'GhostOperative'}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    Level {currentUser?.level || 24} Operative
                  </span>
                </div>
              </div>

              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shrink-0" />
            </div>
          </div>
        </aside>

        {/* Mobile Slide-In Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            />
            <div className="relative w-72 max-w-[80vw] bg-[#161B22] p-5 h-full flex flex-col justify-between border-r border-slate-800 z-50 animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                      CX
                    </div>
                    <span className="text-sm font-black text-white">CYBERX Community</span>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: 'feed', label: 'Community Feed', icon: MessageSquare },
                    { id: 'explore', label: 'Explore & Discover', icon: Compass },
                    { id: 'squads', label: 'Squads (LFG)', icon: Users },
                    { id: 'clips', label: 'Clips & Media', icon: Film },
                    { id: 'saved', label: 'Saved Dispatches', icon: Bookmark },
                    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSidebarTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSidebarTab(item.id as SidebarTab);
                          if (item.id === 'squads') setActiveFilterTab('squads');
                          else if (item.id === 'clips') setActiveFilterTab('clips');
                          else if (item.id === 'saved') setActiveFilterTab('saved');
                          else if (item.id === 'feed') setActiveFilterTab('all');
                          else if (item.id === 'tournaments') navigate('tournaments');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="border-t border-slate-800 pt-3 space-y-1">
                  <button
                    onClick={() => {
                      navigate('home');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-400" />
                    <span>Return to Store</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('admin');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CENTER COLUMN: (4) STORIES | (3) TABS | (5) MAIN SOCIAL FEED */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* ========================================================================= */}
          {/* 4. STORIES SECTION */}
          {/* ========================================================================= */}
          <section className="bg-[#161B22] rounded-3xl p-4 sm:p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Operative Stories & Clips</span>
              </h2>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                24h Tactical Snaps
              </span>
            </div>

            {/* Horizontal Scrollable Stories Track */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
              {/* Card 1: Add Story CTA */}
              <div
                id="create-story-card"
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  setIsAddStoryOpen(true);
                }}
                className="w-28 sm:w-32 h-44 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500 transition cursor-pointer flex flex-col items-center justify-center p-3 text-center shrink-0 group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-200 block group-hover:text-white">
                  Add Story
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Share highlight</span>
              </div>

              {/* User Stories Cards */}
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  id={`story-card-${story.id}`}
                  onClick={() => handleOpenStory(index)}
                  className="w-28 sm:w-32 h-44 rounded-2xl relative overflow-hidden shrink-0 cursor-pointer group shadow-md transition transform hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Background Image Preview */}
                  <img
                    src={story.mediaUrl}
                    alt={story.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                  {/* Top Avatar with glowing unviewed ring */}
                  <div className="absolute top-2.5 left-2.5">
                    <div className={`p-0.5 rounded-full ${
                      story.isViewed
                        ? 'ring-2 ring-slate-600'
                        : 'ring-2 ring-cyan-400 shadow-sm shadow-cyan-400/50'
                    }`}>
                      <img
                        src={story.userAvatar}
                        alt={story.userName}
                        className="w-7 h-7 rounded-full bg-slate-800 object-cover"
                      />
                    </div>
                  </div>

                  {/* Bottom Text Info */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="text-[11px] font-black text-white block truncate drop-shadow-md">
                      {story.userName}
                    </span>
                    <span className="text-[9px] text-cyan-300 font-bold block truncate">
                      #{story.gameTag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. COMMUNITY NAVIGATION TABS & FILTER BAR */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            {/* Primary Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Dispatches', icon: Layers },
                { id: 'trending', label: '🔥 Trending', icon: Flame },
                { id: 'squads', label: '👥 Squads (LFG)', icon: Users },
                { id: 'clips', label: '🎬 Clips & Media', icon: Film },
                { id: 'guides', label: '🏆 Guides & Meta', icon: Award },
                { id: 'following', label: '⭐ Following', icon: Sparkles },
                { id: 'saved', label: '🔖 Saved', icon: Bookmark },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`filter-tab-${tab.id}`}
                    onClick={() => {
                      if (!isMuted) playUiSound('click');
                      setActiveFilterTab(tab.id as CommunityFilterTab);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                        : 'bg-[#161B22] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Filter Bar: Game Selector & Sort Options */}
            <div className="bg-[#161B22] p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Game Tag Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3" />
                  Game:
                </span>
                {['All', 'Cyber Strike', 'Neon Riders', 'Shadow Legends', 'Battle Arena'].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      if (!isMuted) playUiSound('click');
                      setSelectedGameTag(g);
                    }}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                      selectedGameTag === g
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 font-bold text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent focus:outline-none cursor-pointer text-xs"
                >
                  <option value="trending" className="bg-[#161B22]">Hot & Trending</option>
                  <option value="recent" className="bg-[#161B22]">Most Recent</option>
                  <option value="top" className="bg-[#161B22]">Top Upvoted</option>
                  <option value="discussed" className="bg-[#161B22]">Most Discussed</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. MAIN SOCIAL FEED - REAL FIREBASE COMMUNITY */}
          {/* ========================================================================= */}
          {/* Real Create Post Box with Firebase Storage Media Upload */}
          <CreatePostBox
            currentUserId={auth.currentUser?.uid || currentUser?.id}
            currentUserProfile={currentUser}
            onPostCreated={() => {
              if (!isMuted) playUiSound('claim');
              confetti({ particleCount: 80, spread: 80 });
              addXpAndPoints(150, 30, 'Community Dispatch');
            }}
            playUiSound={!isMuted ? playUiSound : undefined}
            showToast={showToast}
            requireAuth={ensureAuth}
          />

          {/* Real Posts Feed State */}
          {isLoadingPosts ? (
            <div className="bg-[#161B22] rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Synchronizing with Firebase Firestore...</h3>
              <p className="text-xs text-slate-500">Connecting to real posts collection</p>
            </div>
          ) : firestoreError ? (
            <div className="bg-rose-950/20 rounded-3xl p-8 text-center border border-rose-800/40 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-rose-300">Firestore Connection Status</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{firestoreError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-[#161B22] rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-black text-white">No Dispatches in Database</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {realPosts.length === 0
                  ? 'No posts in the database yet. Write the first broadcast above to start the community feed!'
                  : 'No dispatches match your filter criteria.'}
              </p>
              {realPosts.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilterTab('all');
                    setSelectedGameTag('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <RealPostCard
                  key={post.id}
                  post={post}
                  currentUserId={auth.currentUser?.uid || currentUser?.id}
                  currentUserProfile={currentUser}
                  onPostDeleted={(deletedId) => {
                    setRealPosts((prev) => prev.filter((p) => p.id !== deletedId));
                  }}
                  playUiSound={!isMuted ? playUiSound : undefined}
                  showToast={showToast}
                  requireAuth={ensureAuth}
                />
              ))}
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* 6. RIGHT-SIDE ACTIVITY & SUGGESTIONS PANEL */}
        {/* ========================================================================= */}
        <aside className="hidden xl:block w-80 shrink-0 sticky top-20 space-y-5">
          {/* Card 1: Suggested Operatives to Follow */}
          <div className="bg-[#161B22] rounded-3xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Suggested Operatives</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-bold">Pro Streamers</span>
            </div>

            <div className="space-y-3">
              {suggestedGamers.map((gamer) => (
                <div
                  key={gamer.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={gamer.avatar}
                      alt={gamer.name}
                      className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-200 block truncate">
                        {gamer.name}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-semibold block truncate">
                        {gamer.game} • {gamer.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(gamer)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
                      gamer.isFollowing
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {gamer.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Live Squads & Voice Rooms */}
          <div className="bg-[#161B22] rounded-3xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Active Voice Hubs</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {liveRooms.map((room) => {
                const isJoined = joinedRooms[room.id];
                return (
                  <div
                    key={room.id}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={room.hostAvatar}
                          alt={room.host}
                          className="w-6 h-6 rounded-lg bg-slate-800"
                        />
                        <span className="text-xs font-black text-slate-200 truncate max-w-[140px]">
                          {room.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {room.membersCount}/{room.maxMembers}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{room.game}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{room.tag}</span>
                    </div>

                    <button
                      onClick={() => handleToggleJoinRoom(room)}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isJoined
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Join Voice Room</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Trending Topics & Gaming Hashtags */}
          <div className="bg-[#161B22] rounded-3xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Trending Hashtags</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-bold">24h Radar</span>
            </div>

            <div className="space-y-2">
              {trendingTags.map((item) => (
                <div
                  key={item.tag}
                  onClick={() => handleTagClick(item.tag)}
                  className="p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-slate-200 hover:text-cyan-400 transition block">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.game}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Quick Community Guidelines & Discord */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>CYBERX Community Protocol</span>
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="leading-relaxed">
              Respect squadmates, verify tournament stats, and share constructive meta analysis.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
              <span className="text-slate-500">CYBERX Network v2.6</span>
              <button
                onClick={() => {
                  if (!isMuted) playUiSound('click');
                  showToast('Discord Linked', 'Connecting to Official CYBERX Esports Discord...', 'info');
                }}
                className="text-blue-400 hover:text-blue-300 font-bold"
              >
                Official Discord →
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE STORY VIEWER MODAL */}
      {/* ========================================================================= */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-[85vh] max-h-[750px] bg-[#161B22] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800">
            {/* Background Story Media */}
            <img
              src={stories[activeStoryIndex].mediaUrl}
              alt={stories[activeStoryIndex].caption}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

            {/* Top Bar: Progress Bars & Author Details */}
            <div className="relative z-10 p-4 space-y-3">
              {/* Progress Line */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100 ease-linear rounded-full shadow-sm shadow-cyan-400"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              {/* Author Info & Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <img
                    src={stories[activeStoryIndex].userAvatar}
                    alt={stories[activeStoryIndex].userName}
                    className="w-9 h-9 rounded-full bg-slate-800 border-2 border-cyan-400 object-cover"
                  />
                  <div>
                    <span className="text-xs font-black block">{stories[activeStoryIndex].userName}</span>
                    <span className="text-[10px] text-cyan-300 font-bold">
                      {stories[activeStoryIndex].timestamp} • #{stories[activeStoryIndex].gameTag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Pause / Play Toggle */}
                  <button
                    onClick={() => setIsStoryPaused(!isStoryPaused)}
                    className="p-1.5 text-white hover:bg-white/20 rounded-full transition"
                  >
                    {isStoryPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  {/* Close Story Modal */}
                  <button
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1.5 text-white hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tap Left / Right Hotspots for Story Navigation */}
            <div className="absolute inset-y-20 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrevStory} />
            <div className="absolute inset-y-20 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNextStory} />

            {/* Bottom Bar: Caption & Direct Reply */}
            <div className="relative z-10 p-4 space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed drop-shadow-md bg-black/40 p-3 rounded-2xl backdrop-blur-sm">
                {stories[activeStoryIndex].caption}
              </p>

              {/* Direct Reply Input & Heart Reaction */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={storyReplyText}
                  onChange={(e) => setStoryReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendStoryReply();
                  }}
                  placeholder="Send direct reaction..."
                  className="flex-1 bg-black/60 text-white text-xs px-3.5 py-2.5 rounded-2xl border border-white/20 focus:border-cyan-400 outline-none backdrop-blur-sm"
                />

                <button
                  onClick={handleSendStoryReply}
                  className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl transition shadow-lg shadow-cyan-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (!isMuted) playUiSound('claim');
                    confetti({ particleCount: 35, spread: 60 });
                    showToast('Hearted Story', 'Gave reaction to operative', 'success');
                  }}
                  className="p-2.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-2xl transition"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STORY CREATOR MODAL */}
      {/* ========================================================================= */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161B22] rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Create 24h Gaming Story</h3>
              </div>
              <button
                onClick={() => setIsAddStoryOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStorySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Highlight Caption</label>
                <input
                  type="text"
                  required
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  placeholder="e.g. 1v3 Clutch in Sector 7 Grandmaster!"
                  className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Highlight Screenshot URL</label>
                <input
                  type="url"
                  required
                  value={newStoryImageUrl}
                  onChange={(e) => setNewStoryImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Associated Game</label>
                <select
                  value={newStoryGame}
                  onChange={(e) => setNewStoryGame(e.target.value)}
                  className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                >
                  <option value="Cyber Strike">Cyber Strike</option>
                  <option value="Neon Riders">Neon Riders</option>
                  <option value="Shadow Legends">Shadow Legends</option>
                  <option value="Battle Arena">Battle Arena</option>
                </select>
              </div>

              {/* Preview Thumbnail */}
              {newStoryImageUrl && (
                <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={newStoryImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoryOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
