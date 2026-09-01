export type UserRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'EDITOR' | 'SELLER' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  level: number;
  xp: number;
  nextLevelXp: number;
  cyberPoints: number;
  bio?: string;
  favoriteGame?: string;
  badges: string[];
  gamesLibrary: string[];
  wishlist: string[];
  tournamentsJoined: string[];
  createdAt: string;
  lastLoginDate?: string;
  streakDays: number;
}

export type GameBadgeType = 'HOT' | 'NEW' | 'TRENDING' | 'EXCLUSIVE';

export interface GameReview {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GameItem {
  id: string;
  slug: string;
  title: string;
  genre: string;
  rating: number;
  reviewCount: number;
  playerCount: string;
  badge?: GameBadgeType;
  coverImage: string;
  heroBanner: string;
  screenshots: string[];
  trailerUrl: string;
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  platforms: string[];
  systemRequirements: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  status: 'Published' | 'Draft' | 'Hidden' | 'Coming Soon';
  isFeatured?: boolean;
  minigameType?: 'shooter' | 'racer' | 'runner' | 'arena';
}

export interface VideoItem {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  videoUrl: string;
  views: string;
  duration: string;
  category: 'Trailers' | 'Gameplay' | 'Tutorials' | 'Esports' | 'Developer' | 'Community';
  publishedAt: string;
  description: string;
  isFeatured?: boolean;
  likes: number;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  commentsCount: number;
  isFeatured?: boolean;
}

export interface NewsComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Games' | 'Characters' | 'Wallpapers' | 'Cyberpunk' | 'Fan Art' | 'Community';
  imageUrl: string;
  author: string;
  likes: number;
  downloads: number;
  createdAt: string;
  dimensions: string;
}

export interface TournamentItem {
  id: string;
  title: string;
  gameTitle: string;
  gameId: string;
  bannerImage: string;
  prizePool: string;
  firstPlacePrize: string;
  participantsCount: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  format: string;
  rules: string[];
  schedule: { time: string; round: string; status: string }[];
  leaderboard: { rank: number; player: string; score: number; avatar: string }[];
  registeredUsers: string[];
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  category: 'Gaming Gear' | 'Merchandise' | 'Accessories' | 'Digital Collectibles';
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  sku: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderItemRecord {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPostal: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  paymentMethod: string;
  trackingNumber: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userRole?: string;
  userLevel: number;
  createdAt: string;
  title: string;
  content: string;
  gameTag?: string;
  imageUrl?: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  savedBy: string[];
  category: 'General' | 'Clips & Highlights' | 'Game Help' | 'Esports' | 'Memes';
  comments: {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    content: string;
    createdAt: string;
    likes: number;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'tournament' | 'order' | 'community' | 'reward' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface RedeemableReward {
  id: string;
  title: string;
  cost: number;
  category: 'Discount' | 'Skin' | 'Avatar Frame' | 'VIP Role';
  description: string;
  code?: string;
  image: string;
  claimed?: boolean;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconKey?: string;
  description?: string;
  displayOrder?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  categoryId: string;
  imageUrl: string;
  affiliateLink: string;
  active: boolean;
  featured?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  active: boolean;
  featured?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaLink?: string;
  active: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  description?: string;
  storeDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  supportInfo?: string;
  footerText?: string;
  footerCopyright?: string;
  copyrightText?: string;
  currency?: string;
  currencySymbol?: string;
  defaultSorting?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  maintenanceMode?: boolean;
  socialLinks?: {
    discord?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    twitch?: string;
  };
  updatedAt?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle: 'rounded' | 'pill' | 'sharp' | 'glow';
  cardStyle: 'flat' | 'bordered' | 'elevated' | 'glass';
  headerStyle?: 'standard' | 'minimal' | 'glass' | 'bold';
  footerStyle?: 'standard' | 'columns' | 'compact';
  appearance?: 'dark' | 'light' | 'system';
  mode?: 'dark' | 'light' | 'system';
  storeLogo?: string;
  favicon?: string;
  updatedAt?: string;
}

export interface NavItem {
  id: string;
  label: string;
  url?: string;
  path?: string;
  active: boolean;
  displayOrder: number;
  openInNewTab?: boolean;
  isExternal?: boolean;
}

export interface AnnouncementItem {
  id: string;
  message: string;
  active: boolean;
  bgColor?: string;
  backgroundColor?: string;
  textColor?: string;
  startDate?: string;
  endDate?: string;
  ctaUrl?: string;
  ctaText?: string;
  link?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'logo' | 'banner' | 'thumbnail';
  sizeBytes?: number;
  uploadedAt: string;
  dimensions?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  discordUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  activePlayersCount: number;
  totalGamesCount: number;
  totalTournamentsCount: number;
}
