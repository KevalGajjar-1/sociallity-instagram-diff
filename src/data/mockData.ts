import { DiffResult, InstagramAccount } from '../types/instagram';

export const currentUser = {
  name: 'Bima Algifari',
  username: 'algifari_bima',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Visual Designer & Creative Director 🎨 Sharing daily design tips',
  followersFormatted: '180.024',
  profileVisitFormatted: '28.024',
  accountReachFormatted: '892.024',
};

export const mockBiggestFans: InstagramAccount[] = [
  {
    username: 'bessie_co',
    name: 'Bessie Cooper',
    profileUrl: 'https://instagram.com/bessie_co',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    likesCount: 789,
    isVerified: true,
  },
  {
    username: 'nguyen_svnh',
    name: 'Savannah Nguyen',
    profileUrl: 'https://instagram.com/nguyen_svnh',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    likesCount: 789,
    isVerified: false,
  },
  {
    username: 'lo.wilson',
    name: 'Jenny Wilson',
    profileUrl: 'https://instagram.com/lo.wilson',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    likesCount: 789,
    isVerified: true,
  },
  {
    username: 'court891',
    name: 'Courtney Henry',
    profileUrl: 'https://instagram.com/court891',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    likesCount: 789,
    isVerified: false,
  },
  {
    username: 'guy_hawk',
    name: 'Guy Hawkins',
    profileUrl: 'https://instagram.com/guy_hawk',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    likesCount: 654,
  },
  {
    username: 'eleanor_p',
    name: 'Eleanor Pena',
    profileUrl: 'https://instagram.com/eleanor_p',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    likesCount: 598,
  },
];

export const mockLostFollowers: InstagramAccount[] = [
  {
    username: 'crypto_guru99',
    name: 'Crypto & Alpha Signals',
    profileUrl: 'https://instagram.com/crypto_guru99',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 45 * 86400000,
  },
  {
    username: 'travel_with_sam',
    name: 'Sam ✈️ Wanderlust',
    profileUrl: 'https://instagram.com/travel_with_sam',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 60 * 86400000,
  },
  {
    username: 'alex_fitness_hub',
    name: 'Alex Rivera Coach',
    profileUrl: 'https://instagram.com/alex_fitness_hub',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 12 * 86400000,
  },
  {
    username: 'design_vibes_24',
    name: 'Design Daily Inspo',
    profileUrl: 'https://instagram.com/design_vibes_24',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 30 * 86400000,
  },
  {
    username: 'retro_gaming_vault',
    name: 'Retro Games Hub',
    profileUrl: 'https://instagram.com/retro_gaming_vault',
    avatarUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 90 * 86400000,
  },
  {
    username: 'urban_architect',
    name: 'Studio Minimal',
    profileUrl: 'https://instagram.com/urban_architect',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 80 * 86400000,
  },
];

export const mockNewFollowers: InstagramAccount[] = [
  {
    username: 'sarah_designs',
    name: 'Sarah Mitchell',
    profileUrl: 'https://instagram.com/sarah_designs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 2 * 86400000,
  },
  {
    username: 'pixel_art_lab',
    name: 'Pixel Art Laboratory',
    profileUrl: 'https://instagram.com/pixel_art_lab',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 3 * 86400000,
  },
  {
    username: 'marcus_dev',
    name: 'Marcus Chen',
    profileUrl: 'https://instagram.com/marcus_dev',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 4 * 86400000,
  },
  {
    username: 'charlotte_photo',
    name: 'Charlotte Vance',
    profileUrl: 'https://instagram.com/charlotte_photo',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 5 * 86400000,
  },
  {
    username: 'neo_brand_studios',
    name: 'Neo Brand Studios',
    profileUrl: 'https://instagram.com/neo_brand_studios',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    followedAt: Date.now() - 6 * 86400000,
  },
];

export const mockNotFollowingBack: InstagramAccount[] = [
  {
    username: 'dribbble',
    name: 'Dribbble',
    profileUrl: 'https://instagram.com/dribbble',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    username: 'figma',
    name: 'Figma',
    profileUrl: 'https://instagram.com/figma',
    avatarUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    username: 'natgeo',
    name: 'National Geographic',
    profileUrl: 'https://instagram.com/natgeo',
    avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    username: 'spotify',
    name: 'Spotify',
    profileUrl: 'https://instagram.com/spotify',
    avatarUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    username: 'apple',
    name: 'Apple',
    profileUrl: 'https://instagram.com/apple',
    avatarUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
];

export const mockDefaultDiff: DiffResult = {
  oldSnapshot: {
    label: 'Export: Oct 30, 2026',
    exportDate: '2026-10-30T10:00:00Z',
    fileName: 'instagram-export-oct.zip',
    followers: Array(175650).fill(null).map((_, i) => ({
      username: `follower_old_${i}`,
      avatarUrl: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=user_${i}`,
    })),
    following: Array(832).fill(null).map((_, i) => ({
      username: `following_old_${i}`,
      avatarUrl: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=follow_${i}`,
    })),
  },
  newSnapshot: {
    label: 'Export: Nov 30, 2026',
    exportDate: '2026-11-30T10:00:00Z',
    fileName: 'instagram-export-nov.zip',
    followers: Array(180024).fill(null).map((_, i) => ({
      username: `follower_new_${i}`,
      avatarUrl: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=new_${i}`,
    })),
    following: Array(845).fill(null).map((_, i) => ({
      username: `following_new_${i}`,
      avatarUrl: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=following_new_${i}`,
    })),
  },
  newFollowers: mockNewFollowers,
  lostFollowers: mockLostFollowers,
  newFollowing: [
    { username: 'creative_coder', name: 'Creative Coder', profileUrl: 'https://instagram.com/creative_coder' },
    { username: 'ui_motion_lab', name: 'UI Motion Lab', profileUrl: 'https://instagram.com/ui_motion_lab' },
  ],
  unfollowedByYou: [
    { username: 'spam_account_01', name: 'Spam 01', profileUrl: 'https://instagram.com/spam_account_01' },
  ],
  notFollowingBack: mockNotFollowingBack,
  fans: mockBiggestFans,
  mutuals: mockBiggestFans.slice(0, 3),
  followersOldCount: 175650,
  followersNewCount: 180024,
  followersNetChange: 4374,
  followersChangePercent: 2.49,
  followingOldCount: 832,
  followingNewCount: 845,
  followingNetChange: 13,
  followingChangePercent: 1.56,
  followBackRate: 74.2,
  dailyActivity: [
    { date: '2026-11-30', label: 'Nov 30', discovery: 13500, gained: 142, lost: 18 },
    { date: '2026-12-01', label: 'Dec 1', discovery: 11200, gained: 115, lost: 12 },
    { date: '2026-12-02', label: 'Dec 2', discovery: 3200, gained: 38, lost: 8 },
    { date: '2026-12-03', label: 'Dec 3', discovery: 5400, gained: 62, lost: 14 },
    { date: '2026-12-04', label: 'Dec 4', discovery: 6400, gained: 85, lost: 22, isPeak: true },
    { date: '2026-12-05', label: 'Dec 5', discovery: 11800, gained: 130, lost: 16 },
    { date: '2026-12-06', label: 'Dec 6', discovery: 13100, gained: 154, lost: 19 },
  ],
};
