import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';

export interface CurrentAccountData {
  label: string;
  list: InstagramAccount[];
  count: number;
  badgeClass: string;
}

export function getCurrentAccountData(
  activeAccountTab: FilterListType,
  activeDiff: DiffResult
): CurrentAccountData {
  switch (activeAccountTab) {
    case 'lost_followers':
      return {
        label: 'Unfollowers (Lost Followers)',
        list: activeDiff.lostFollowers,
        count: activeDiff.lostFollowers.length,
        badgeClass: 'badge-danger',
      };
    case 'suspected_blocked':
      return {
        label: 'Blocked Profiles',
        list: activeDiff.suspectedBlocked.length > 0
          ? activeDiff.suspectedBlocked
          : activeDiff.newSnapshot.blockedProfiles || [],
        count: (activeDiff.suspectedBlocked.length > 0
          ? activeDiff.suspectedBlocked
          : activeDiff.newSnapshot.blockedProfiles || []).length,
        badgeClass: 'badge-blocked',
      };
    case 'new_followers':
      return {
        label: 'New Followers (Gained)',
        list: activeDiff.newFollowers,
        count: activeDiff.newFollowers.length,
        badgeClass: 'badge-success',
      };
    case 'not_following_back':
      return {
        label: 'Not Following You Back',
        list: activeDiff.notFollowingBack,
        count: activeDiff.notFollowingBack.length,
        badgeClass: 'badge-warning',
      };
    case 'fans':
      return {
        label: 'Fans (You Don’t Follow Back)',
        list: activeDiff.fans,
        count: activeDiff.fans.length,
        badgeClass: 'badge-purple',
      };
    case 'mutuals':
      return {
        label: 'Mutual Followers',
        list: activeDiff.mutuals,
        count: activeDiff.mutuals.length,
        badgeClass: 'badge-info',
      };
    case 'all_followers': {
      if (activeDiff.isPartialExport && activeDiff.oldSnapshot.followers.length > 0) {
        const lostSet = new Set(
          activeDiff.lostFollowers.map((a) => a.username.toLowerCase())
        );
        const baseFiltered = activeDiff.oldSnapshot.followers.filter(
          (a) => !lostSet.has(a.username.toLowerCase())
        );
        const combined = [...activeDiff.newFollowers, ...baseFiltered];
        const seen = new Set<string>();
        const fullList = combined.filter((a) => {
          const u = a.username.toLowerCase();
          if (!u || seen.has(u)) return false;
          seen.add(u);
          return true;
        });
        return {
          label: 'All Active Followers (Verified Directory)',
          list: fullList,
          count: activeDiff.followersNewCount || fullList.length,
          badgeClass: 'badge-neutral',
        };
      }
      return {
        label: 'All Active Followers',
        list: activeDiff.newSnapshot.followers,
        count: activeDiff.newSnapshot.followers.length,
        badgeClass: 'badge-neutral',
      };
    }
    case 'all_following':
      return {
        label: 'All Accounts You Follow',
        list: activeDiff.newSnapshot.following,
        count: activeDiff.newSnapshot.following.length,
        badgeClass: 'badge-neutral',
      };
    case 'blocked_profiles':
      return {
        label: 'Blocked Profiles',
        list: activeDiff.newSnapshot.blockedProfiles || [],
        count: (activeDiff.newSnapshot.blockedProfiles || []).length,
        badgeClass: 'badge-blocked',
      };
    case 'recently_unfollowed':
      return {
        label: 'Recently Unfollowed by You',
        list: activeDiff.newSnapshot.recentlyUnfollowed || [],
        count: (activeDiff.newSnapshot.recentlyUnfollowed || []).length,
        badgeClass: 'badge-danger',
      };
    case 'pending_requests':
      return {
        label: 'Pending Follow Requests Sent',
        list: activeDiff.newSnapshot.pendingRequests || [],
        count: (activeDiff.newSnapshot.pendingRequests || []).length,
        badgeClass: 'badge-warning',
      };
    case 'recent_requests':
      return {
        label: 'Recent Follow Requests Received',
        list: activeDiff.newSnapshot.recentRequests || [],
        count: (activeDiff.newSnapshot.recentRequests || []).length,
        badgeClass: 'badge-info',
      };
    case 'hide_story':
      return {
        label: 'Hidden from Seeing Your Stories',
        list: activeDiff.newSnapshot.hideStoryFrom || [],
        count: (activeDiff.newSnapshot.hideStoryFrom || []).length,
        badgeClass: 'badge-purple',
      };
    case 'favorites':
      return {
        label: 'Favorited Profiles / Close Friends',
        list:
          activeDiff.newSnapshot.favoritedProfiles ||
          activeDiff.oldSnapshot.favoritedProfiles ||
          [],
        count: (
          activeDiff.newSnapshot.favoritedProfiles ||
          activeDiff.oldSnapshot.favoritedProfiles ||
          []
        ).length,
        badgeClass: 'badge-success',
      };
    default:
      return {
        label: 'Instagram Accounts',
        list: activeDiff.lostFollowers,
        count: activeDiff.lostFollowers.length,
        badgeClass: 'badge-neutral',
      };
  }
}
