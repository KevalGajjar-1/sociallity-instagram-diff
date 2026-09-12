export interface InstagramAccount {
  username: string;
  name?: string;
  profileUrl?: string;
  followedAt?: number; // epoch timestamp in ms or seconds
  avatarUrl?: string;
  likesCount?: number;
  isVerified?: boolean;
  statusType?:
    | 'unfollowed'
    | 'suspected_blocked'
    | 'new_follower'
    | 'not_following_back'
    | 'fan'
    | 'mutual'
    | 'blocked_by_you'
    | 'recently_unfollowed'
    | 'pending_request'
    | 'story_hidden'
    | 'favorite';
  detectionNote?: string;
}

export interface InstagramProfileInfo {
  username: string;
  name: string;
  bio?: string;
  email?: string;
  gender?: string;
  birthday?: string;
  profilePicUri?: string;
  profilePicDataUrl?: string;
  isPrivate?: boolean;
}

export interface SyncedContactItem {
  name: string;
  contact: string;
  dateAdded?: number;
}

export interface LikedPostItem {
  postUrl: string;
  creatorUsername: string;
  caption?: string;
  timestamp?: number;
}

export interface CommentItem {
  mediaOwner: string;
  comment: string;
  timestamp: number;
}

export interface SavedPostItem {
  postUrl: string;
  timestamp?: number;
}

export interface AudienceInsights {
  totalFollowers?: number;
  followsGained?: number;
  unfollowsLost?: number;
  overallFollowersDelta?: number;
  dateRange?: string;
}

export interface UserMediaPostItem {
  uri: string;
  dataUrl?: string;
  fileName?: string;
  creationTimestamp?: number;
  caption?: string;
}

export interface InstagramSnapshot {
  label: string;
  exportDate?: string;
  fileName?: string;
  profileInfo?: InstagramProfileInfo;
  followers: InstagramAccount[];
  following: InstagramAccount[];
  blockedProfiles?: InstagramAccount[];
  recentlyUnfollowed?: InstagramAccount[];
  pendingRequests?: InstagramAccount[];
  recentRequests?: InstagramAccount[];
  hideStoryFrom?: InstagramAccount[];
  favoritedProfiles?: InstagramAccount[];
  syncedContacts?: SyncedContactItem[];
  likedPosts?: LikedPostItem[];
  comments?: CommentItem[];
  savedPosts?: SavedPostItem[];
  audienceInsights?: AudienceInsights;
  userMediaPosts?: UserMediaPostItem[];
}

export interface TopCreatorItem {
  username: string;
  likesCount: number;
  avatarUrl: string;
  latestPostUrl?: string;
}

export interface DiffResult {
  oldSnapshot: InstagramSnapshot;
  newSnapshot: InstagramSnapshot;

  // Follower Diffs
  newFollowers: InstagramAccount[];
  lostFollowers: InstagramAccount[]; // unfollowed you
  suspectedBlocked: InstagramAccount[]; // accounts that disappeared or blocked

  // Following Diffs
  newFollowing: InstagramAccount[];
  unfollowedByYou: InstagramAccount[]; // accounts you stopped following

  // Relationship Insights
  notFollowingBack: InstagramAccount[]; // In following, but not in followers
  fans: InstagramAccount[]; // In followers, but not in following
  mutuals: InstagramAccount[]; // Both follow each other

  // Connection & Privacy Diffs
  newBlocked: InstagramAccount[];
  unblocked: InstagramAccount[];
  newPendingRequests: InstagramAccount[];

  // Activity Insights
  topLikedCreators: TopCreatorItem[];

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

  // Partial Export Detection & Verified Meta Insights
  isPartialExport?: boolean;
  partialExportNote?: string;
  verifiedFollowersCount?: number;

  // Real Activity Timeline from actual timestamps
  dailyActivity: DailyActivityItem[];

  // Extracted Real Instagram Post Photos & User Media
  userMediaPosts?: UserMediaPostItem[];
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

export type ViewTab =
  | 'dashboard'
  | 'relationships'
  | 'connections'
  | 'activity'
  | 'profile_vault'
  // Legacy aliases for backwards compatibility
  | 'overview'
  | 'schedule'
  | 'analytics';

export type FilterListType =
  | 'lost_followers'
  | 'new_followers'
  | 'suspected_blocked'
  | 'not_following_back'
  | 'fans'
  | 'mutuals'
  | 'all_followers'
  | 'all_following'
  | 'blocked_profiles'
  | 'recently_unfollowed'
  | 'pending_requests'
  | 'recent_requests'
  | 'hide_story'
  | 'favorites'
  | 'synced_contacts'
  | 'liked_posts'
  | 'comments'
  | 'saved_posts'
  | 'user_media';
