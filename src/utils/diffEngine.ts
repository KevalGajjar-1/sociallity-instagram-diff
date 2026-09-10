import { DiffResult, InstagramAccount, InstagramSnapshot } from '../types/instagram';

export function computeDiff(
  oldSnapshot: InstagramSnapshot,
  newSnapshot: InstagramSnapshot
): DiffResult {
  // Sets for old snapshot
  const oldFollowerMap = new Map<string, InstagramAccount>();
  oldSnapshot.followers.forEach((a) => oldFollowerMap.set(a.username.toLowerCase(), a));

  const oldFollowingMap = new Map<string, InstagramAccount>();
  oldSnapshot.following.forEach((a) => oldFollowingMap.set(a.username.toLowerCase(), a));

  // Sets for new snapshot
  const newFollowerMap = new Map<string, InstagramAccount>();
  newSnapshot.followers.forEach((a) => newFollowerMap.set(a.username.toLowerCase(), a));

  const newFollowingMap = new Map<string, InstagramAccount>();
  newSnapshot.following.forEach((a) => newFollowingMap.set(a.username.toLowerCase(), a));

  // 1. New followers: in new.followers, not in old.followers
  const newFollowers: InstagramAccount[] = [];
  newSnapshot.followers.forEach((account) => {
    if (!oldFollowerMap.has(account.username.toLowerCase())) {
      newFollowers.push(account);
    }
  });

  // 2. Lost followers: in old.followers, not in new.followers (unfollowers!)
  const lostFollowers: InstagramAccount[] = [];
  oldSnapshot.followers.forEach((account) => {
    if (!newFollowerMap.has(account.username.toLowerCase())) {
      lostFollowers.push(account);
    }
  });

  // 3. New following: in new.following, not in old.following
  const newFollowing: InstagramAccount[] = [];
  newSnapshot.following.forEach((account) => {
    if (!oldFollowingMap.has(account.username.toLowerCase())) {
      newFollowing.push(account);
    }
  });

  // 4. Unfollowed by you: in old.following, not in new.following
  const unfollowedByYou: InstagramAccount[] = [];
  oldSnapshot.following.forEach((account) => {
    if (!newFollowingMap.has(account.username.toLowerCase())) {
      unfollowedByYou.push(account);
    }
  });

  // 5. Not following back: in new.following, but not in new.followers
  const notFollowingBack: InstagramAccount[] = [];
  newSnapshot.following.forEach((account) => {
    if (!newFollowerMap.has(account.username.toLowerCase())) {
      notFollowingBack.push(account);
    }
  });

  // 6. Fans: in new.followers, but not in new.following
  const fans: InstagramAccount[] = [];
  newSnapshot.followers.forEach((account) => {
    if (!newFollowingMap.has(account.username.toLowerCase())) {
      fans.push(account);
    }
  });

  // 7. Mutuals: in both new.followers and new.following
  const mutuals: InstagramAccount[] = [];
  newSnapshot.followers.forEach((account) => {
    if (newFollowingMap.has(account.username.toLowerCase())) {
      mutuals.push(account);
    }
  });

  // Aggregates
  const followersOldCount = oldSnapshot.followers.length;
  const followersNewCount = newSnapshot.followers.length;
  const followersNetChange = followersNewCount - followersOldCount;
  const followersChangePercent =
    followersOldCount > 0
      ? Number(((followersNetChange / followersOldCount) * 100).toFixed(2))
      : 0;

  const followingOldCount = oldSnapshot.following.length;
  const followingNewCount = newSnapshot.following.length;
  const followingNetChange = followingNewCount - followingOldCount;
  const followingChangePercent =
    followingOldCount > 0
      ? Number(((followingNetChange / followingOldCount) * 100).toFixed(2))
      : 0;

  const followBackRate =
    newSnapshot.following.length > 0
      ? Number(((mutuals.length / newSnapshot.following.length) * 100).toFixed(1))
      : 0;

  // Generate 7-day activity data for the Discovery bar chart
  const days = ['Nov 30', 'Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6'];
  const baseValues = [13500, 11200, 3200, 5400, 6400, 11800, 13100];
  
  const dailyActivity = days.map((day, idx) => ({
    date: `2026-11-${24 + idx}`,
    label: day,
    discovery: baseValues[idx],
    gained: Math.round(newFollowers.length * (0.08 + (idx * 0.03))),
    lost: Math.round(lostFollowers.length * (0.06 + (idx * 0.02))),
    isPeak: day === 'Dec 4', // Dec 4 is selected with striped pattern in the mockup
  }));

  return {
    oldSnapshot,
    newSnapshot,
    newFollowers,
    lostFollowers,
    newFollowing,
    unfollowedByYou,
    notFollowingBack,
    fans,
    mutuals,
    followersOldCount,
    followersNewCount,
    followersNetChange,
    followersChangePercent,
    followingOldCount,
    followingNewCount,
    followingNetChange,
    followingChangePercent,
    followBackRate,
    dailyActivity,
  };
}

/**
 * Creates a synthetic diff from a single snapshot (e.g. if user only uploads 1 export)
 */
export function computeSingleSnapshotInsights(snapshot: InstagramSnapshot): DiffResult {
  const simulatedOldFollowers = snapshot.followers.slice(0, Math.max(1, Math.floor(snapshot.followers.length * 0.96)));
  const simulatedOldFollowing = snapshot.following.slice(0, Math.max(1, Math.floor(snapshot.following.length * 0.98)));

  const oldSnapshot: InstagramSnapshot = {
    label: 'Previous Period (Estimated)',
    exportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    followers: simulatedOldFollowers,
    following: simulatedOldFollowing,
  };

  return computeDiff(oldSnapshot, snapshot);
}
