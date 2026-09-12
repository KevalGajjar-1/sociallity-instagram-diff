import { DiffResult, InstagramAccount } from '../types/instagram';

/**
 * Curated pool of diverse, high-resolution real human portrait photographs from Unsplash.
 * Deterministically mapped by username hash so each account gets a consistent, realistic human avatar.
 * All URLs verified 200 OK.
 */
export const REAL_AVATAR_PORTRAITS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&h=160&q=80',
  'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=160&h=160&q=80',
];

/**
 * Detects whether a given URL is a Dicebear URL (or variant typo).
 */
export function isDicebearUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('dicebear') || lower.includes('dicebar');
}

/**
 * Returns a deterministic real human photographic avatar for any username.
 */
export function getRealAvatarUrl(username: string): string {
  if (!username) return REAL_AVATAR_PORTRAITS[0];
  const clean = username.toLowerCase().trim().replace(/^@/, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % REAL_AVATAR_PORTRAITS.length;
  return REAL_AVATAR_PORTRAITS[index];
}

/**
 * Ensures an account avatar is never empty or Dicebear.
 * Always resolves to a proper high-resolution portrait.
 */
export function getEffectiveAvatarUrl(username: string, rawUrl?: string | null): string {
  if (!rawUrl || isDicebearUrl(rawUrl)) {
    return getRealAvatarUrl(username);
  }
  return rawUrl;
}

/**
 * Sanitizes an individual account to ensure its avatarUrl is clean and never dicebear.
 */
export function sanitizeAccount(account: InstagramAccount): InstagramAccount {
  if (!account || !account.username) return account;
  if (!account.avatarUrl || isDicebearUrl(account.avatarUrl)) {
    return {
      ...account,
      avatarUrl: getRealAvatarUrl(account.username),
    };
  }
  return account;
}

/**
 * Sanitizes an entire DiffResult object to purge any lingering Dicebear URLs
 * from historical snapshots or prior localStorage sessions.
 */
export function sanitizeDiffAvatars(diff: DiffResult): DiffResult {
  if (!diff) return diff;

  const sanitizeList = (list?: InstagramAccount[]): InstagramAccount[] => {
    if (!list || !Array.isArray(list)) return [];
    return list.map(sanitizeAccount);
  };

  return {
    ...diff,
    newFollowers: sanitizeList(diff.newFollowers),
    lostFollowers: sanitizeList(diff.lostFollowers),
    suspectedBlocked: sanitizeList(diff.suspectedBlocked),
    newFollowing: sanitizeList(diff.newFollowing),
    unfollowedByYou: sanitizeList(diff.unfollowedByYou),
    notFollowingBack: sanitizeList(diff.notFollowingBack),
    fans: sanitizeList(diff.fans),
    mutuals: sanitizeList(diff.mutuals),
    newBlocked: sanitizeList(diff.newBlocked),
    unblocked: sanitizeList(diff.unblocked),
    newPendingRequests: sanitizeList(diff.newPendingRequests),
    topLikedCreators: (diff.topLikedCreators || []).map((creator) => ({
      ...creator,
      avatarUrl: getEffectiveAvatarUrl(creator.username, creator.avatarUrl),
    })),
    oldSnapshot: {
      ...diff.oldSnapshot,
      followers: sanitizeList(diff.oldSnapshot?.followers),
      following: sanitizeList(diff.oldSnapshot?.following),
      blockedProfiles: sanitizeList(diff.oldSnapshot?.blockedProfiles),
      recentlyUnfollowed: sanitizeList(diff.oldSnapshot?.recentlyUnfollowed),
      pendingRequests: sanitizeList(diff.oldSnapshot?.pendingRequests),
      recentRequests: sanitizeList(diff.oldSnapshot?.recentRequests),
      hideStoryFrom: sanitizeList(diff.oldSnapshot?.hideStoryFrom),
      favoritedProfiles: sanitizeList(diff.oldSnapshot?.favoritedProfiles),
    },
    newSnapshot: {
      ...diff.newSnapshot,
      followers: sanitizeList(diff.newSnapshot?.followers),
      following: sanitizeList(diff.newSnapshot?.following),
      blockedProfiles: sanitizeList(diff.newSnapshot?.blockedProfiles),
      recentlyUnfollowed: sanitizeList(diff.newSnapshot?.recentlyUnfollowed),
      pendingRequests: sanitizeList(diff.newSnapshot?.pendingRequests),
      recentRequests: sanitizeList(diff.newSnapshot?.recentRequests),
      hideStoryFrom: sanitizeList(diff.newSnapshot?.hideStoryFrom),
      favoritedProfiles: sanitizeList(diff.newSnapshot?.favoritedProfiles),
    },
  };
}
