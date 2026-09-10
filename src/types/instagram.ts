export interface InstagramAccount {
  username: string;
  name?: string;
  profileUrl?: string;
  followedAt?: number; // epoch timestamp in ms or seconds
  avatarUrl?: string;
  likesCount?: number;
  isVerified?: boolean;
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
  dailyActivity: {
    date: string;
    label: string;
    discovery: number;
    gained: number;
    lost: number;
    isPeak?: boolean;
  }[];
}

export type ViewTab = 'dashboard' | 'overview' | 'schedule' | 'analytics';
export type FilterListType = 'new_followers' | 'lost_followers' | 'not_following_back' | 'fans' | 'mutuals' | 'all_followers' | 'all_following';
