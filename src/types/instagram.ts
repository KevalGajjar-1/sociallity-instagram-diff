export interface InstagramAccount {
  username: string;
  name?: string;
  profileUrl?: string;
  followedAt?: number; // epoch timestamp in ms or seconds
  avatarUrl?: string;
  likesCount?: number;
  isVerified?: boolean;
  statusType?: 'unfollowed' | 'suspected_blocked' | 'new_follower' | 'not_following_back' | 'fan' | 'mutual' | 'blocked_by_you';
  detectionNote?: string;
}

export interface InstagramSnapshot {
  label: string;
  exportDate?: string;
  fileName?: string;
  followers: InstagramAccount[];
  following: InstagramAccount[];
  closeFriends?: InstagramAccount[];
  pendingRequests?: InstagramAccount[];
  blockedAccounts?: InstagramAccount[];
}

export interface DiffResult {
  oldSnapshot: InstagramSnapshot;
  newSnapshot: InstagramSnapshot;

  // Follower Diffs
  newFollowers: InstagramAccount[];
  lostFollowers: InstagramAccount[]; // unfollowed you
  suspectedBlocked: InstagramAccount[]; // accounts that disappeared and may have blocked you or deactivated

  // Following Diffs
  newFollowing: InstagramAccount[];
  unfollowedByYou: InstagramAccount[]; // accounts you stopped following

  // Relationship Insights
  notFollowingBack: InstagramAccount[]; // In following, but not in followers (you follow them, they don't follow you)
  fans: InstagramAccount[]; // In followers, but not in following (they follow you, you don't follow them)
  mutuals: InstagramAccount[]; // Both follow each other

  // Aggregates
  followersOldCount: number;
  followersNewCount: number;
  followersNetChange: number;
  followersChangePercent: number;

  followingOldCount: number;
  followingNewCount: number;
  followingNetChange: number;
  followingChangePercent: number;

  followBackRate: number; // percentage of followers who follow you back

  // Activity Timeline for charts
  dailyActivity: DailyActivityItem[];
}

export interface DailyActivityItem {
  date: string;
  label: string;
  discovery: number;
  gained: number;
  lost: number;
  isPeak?: boolean;
}

export interface SnapshotHistoryItem {
  id: string;
  date: string;
  label: string;
  fileName: string;
  followersCount: number;
  followingCount: number;
  netChange: number;
  status: 'Ready' | 'Archived' | 'Scheduled';
  format: 'JSON' | 'HTML';
}

export type ViewTab = 'dashboard' | 'overview' | 'schedule' | 'analytics';
export type FilterListType =
  | 'new_followers'
  | 'lost_followers'
  | 'suspected_blocked'
  | 'not_following_back'
  | 'fans'
  | 'mutuals'
  | 'all_followers'
  | 'all_following';


