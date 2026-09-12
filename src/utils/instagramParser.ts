import JSZip from 'jszip';
import {
  InstagramAccount,
  InstagramProfileInfo,
  InstagramSnapshot,
  LikedPostItem,
  CommentItem,
  SavedPostItem,
  SyncedContactItem,
  AudienceInsights,
  UserMediaPostItem,
} from '../types/instagram';

/**
 * Normalizes an Instagram username by stripping '@', whitespace, trailing slashes, etc.
 */
export function cleanUsername(raw: string): string {
  if (!raw) return '';
  let user = raw.trim();
  if (user.startsWith('@')) user = user.substring(1);
  if (user.endsWith('/')) user = user.slice(0, -1);
  if (user.includes('instagram.com/')) {
    const parts = user.split('instagram.com/');
    const segment = parts[parts.length - 1];
    if (segment.startsWith('_u/')) {
      user = segment.substring(3).split('/')[0].split('?')[0];
    } else {
      user = segment.split('/')[0].split('?')[0];
    }
  }
  return user.trim();
}

import { getRealAvatarUrl } from './avatarHelper';

/**
 * Fixes Mojibake caused by Instagram exporting UTF-8 strings as Latin1 byte sequences.
 * e.g. "ð\u009f\u0092\u00bb" -> "💻"
 */
export function fixInstagramEncoding(str?: string): string {
  if (!str) return '';
  try {
    const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (decoded && !decoded.includes('\ufffd')) {
      return decoded;
    }
  } catch {}
  return str;
}

/**
 * Generates a realistic human portrait photograph avatar URL based on username
 */
export function getAvatarUrl(username: string): string {
  return getRealAvatarUrl(username);
}

/**
 * Deep search for key-value or label-value in arbitrary Instagram JSON objects
 */
function findValueInObject(obj: any, targetLabels: string[]): string {
  if (!obj || typeof obj !== 'object') return '';

  // Check label_values format
  if (Array.isArray(obj.label_values)) {
    for (const lv of obj.label_values) {
      if (lv && targetLabels.some((l) => lv.label?.toLowerCase() === l.toLowerCase())) {
        if (lv.value) return String(lv.value).trim();
        if (lv.href) return String(lv.href).trim();
      }
      if (lv && lv.dict && Array.isArray(lv.dict)) {
        for (const sub of lv.dict) {
          const found = findValueInObject(sub, targetLabels);
          if (found) return found;
        }
      }
    }
  }

  // Check string_map_data format
  if (obj.string_map_data && typeof obj.string_map_data === 'object') {
    for (const key of Object.keys(obj.string_map_data)) {
      if (targetLabels.some((l) => key.toLowerCase() === l.toLowerCase())) {
        const item = obj.string_map_data[key];
        if (item?.value) return String(item.value).trim();
        if (item?.href) return String(item.href).trim();
      }
    }
  }

  // Check direct keys
  for (const key of Object.keys(obj)) {
    if (targetLabels.some((l) => key.toLowerCase() === l.toLowerCase())) {
      if (typeof obj[key] === 'string' || typeof obj[key] === 'number') {
        return String(obj[key]).trim();
      }
    }
  }

  return '';
}

/**
 * Universal extractor for Instagram Account objects from arbitrary JSON array or object
 */
export function parseInstagramAccountsJson(
  jsonContent: string,
  defaultStatusType?: InstagramAccount['statusType']
): InstagramAccount[] {
  try {
    const data = JSON.parse(jsonContent);
    const accounts: InstagramAccount[] = [];

    const processItem = (item: any) => {
      if (!item) return;

      let username = '';
      let name = '';
      let profileUrl = '';
      let followedAt: number | undefined = undefined;

      // Check item timestamp
      if (typeof item.timestamp === 'number') {
        followedAt = item.timestamp;
      } else if (typeof item.timestamp === 'string') {
        followedAt = parseInt(item.timestamp, 10);
      }

      // Check label_values format (Meta 2026+)
      if (Array.isArray(item.label_values)) {
        username = findValueInObject(item, ['Username', 'User']);
        name = findValueInObject(item, ['Name', 'Full Name']);
        profileUrl = findValueInObject(item, ['URL', 'href']);
      }

      // Check traditional format: { title: "username", string_list_data: [...] }
      if (!username && item.title && typeof item.title === 'string' && item.title.trim()) {
        username = cleanUsername(item.title);
      }

      if (Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
        const first = item.string_list_data[0];
        if (!username && first.value) {
          username = cleanUsername(first.value);
        }
        if (first.href) {
          profileUrl = first.href;
          if (!username) username = cleanUsername(first.href);
        }
        if (first.timestamp && !followedAt) {
          followedAt = typeof first.timestamp === 'number' ? first.timestamp : parseInt(first.timestamp, 10);
        }
      }

      // Check string_map_data
      if (!username && item.string_map_data) {
        username = cleanUsername(findValueInObject(item, ['Username', 'User']));
        name = findValueInObject(item, ['Name', 'Full Name']);
      }

      // Fallback direct value
      if (!username && typeof item.value === 'string') {
        username = cleanUsername(item.value);
      }

      if (username) {
        // Exclude hashtag-like entries or exploration strings
        if (username.startsWith('#') || username === 'withgalaxy' && profileUrl.includes('hashtag')) {
          return;
        }

        accounts.push({
          username,
          name: name || undefined,
          profileUrl: profileUrl || `https://www.instagram.com/${username}/`,
          followedAt,
          avatarUrl: getAvatarUrl(username),
          statusType: defaultStatusType,
        });
      }
    };

    if (Array.isArray(data)) {
      data.forEach(processItem);
    } else if (data && typeof data === 'object') {
      const arrayKeys = [
        'relationships_following',
        'relationships_followers',
        'relationships_blocked_users',
        'relationships_close_friends',
        'relationships_pending_users',
      ];

      let foundList = false;
      for (const key of arrayKeys) {
        if (Array.isArray(data[key])) {
          data[key].forEach(processItem);
          foundList = true;
          break;
        }
      }

      if (!foundList) {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            data[key].forEach(processItem);
          }
        }
      }
    }

    // Deduplicate by lowercased username
    const seen = new Set<string>();
    return accounts.filter((acc) => {
      const lower = acc.username.toLowerCase();
      if (!lower || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  } catch (err) {
    console.warn('Failed to parse Instagram Accounts JSON:', err);
    return [];
  }
}

/**
 * Parses personal_information.json for user profile
 */
export function parseProfileInfoJson(jsonContent: string): InstagramProfileInfo | undefined {
  try {
    const data = JSON.parse(jsonContent);
    const profileItem = Array.isArray(data.profile_user) ? data.profile_user[0] : data;
    if (!profileItem) return undefined;

    const username = cleanUsername(findValueInObject(profileItem, ['Username']));
    const name = fixInstagramEncoding(findValueInObject(profileItem, ['Name']));
    const bio = fixInstagramEncoding(findValueInObject(profileItem, ['Bio']));
    const email = findValueInObject(profileItem, ['Email']);
    const gender = findValueInObject(profileItem, ['Gender']);
    const birthday = findValueInObject(profileItem, ['Date of birth']);
    const isPrivate = findValueInObject(profileItem, ['Private Account']).toLowerCase() === 'true';

    let profilePicUri: string | undefined = undefined;
    if (profileItem.media_map_data?.['Profile Photo']?.uri) {
      profilePicUri = profileItem.media_map_data['Profile Photo'].uri;
    }

    if (username || name) {
      return {
        username: username || 'instagram_user',
        name: name || username || 'Instagram User',
        bio,
        email,
        gender,
        birthday,
        isPrivate,
        profilePicUri,
      };
    }
  } catch (err) {
    console.warn('Failed to parse profile info:', err);
  }
  return undefined;
}

/**
 * Parses synced_contacts.json
 */
export function parseSyncedContactsJson(jsonContent: string): SyncedContactItem[] {
  try {
    const data = JSON.parse(jsonContent);
    const list = data.contacts_contact_info || (Array.isArray(data) ? data : []);
    const result: SyncedContactItem[] = [];

    for (const item of list) {
      const first = findValueInObject(item, ['First Name']);
      const last = findValueInObject(item, ['Last Name']);
      const contact = findValueInObject(item, ['Contact Information', 'Phone', 'Email']);
      const fullName = [first, last].filter(Boolean).join(' ') || 'Unnamed Contact';

      if (contact || fullName) {
        result.push({
          name: fullName,
          contact: contact || '',
        });
      }
    }
    return result;
  } catch (err) {
    console.warn('Failed to parse synced contacts:', err);
    return [];
  }
}

/**
 * Parses liked_posts.json
 */
export function parseLikedPostsJson(jsonContent: string, maxItems: number = 2000): LikedPostItem[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) return [];

    const result: LikedPostItem[] = [];
    const itemsToProcess = data.slice(0, maxItems);

    for (const item of itemsToProcess) {
      let postUrl = '';
      let creatorUsername = '';
      let caption = '';
      let timestamp = typeof item.timestamp === 'number' ? item.timestamp : undefined;

      if (Array.isArray(item.label_values)) {
        for (const lv of item.label_values) {
          if (lv.label === 'URL' && lv.value) postUrl = lv.value;
          if (lv.label === 'Caption' && lv.value) caption = lv.value;
          if (lv.title === 'Owner' && Array.isArray(lv.dict)) {
            creatorUsername = findValueInObject(lv, ['Username']);
          }
        }
      }

      // Traditional format
      if (!postUrl && item.string_list_data?.[0]?.href) {
        postUrl = item.string_list_data[0].href;
        timestamp = item.string_list_data[0].timestamp;
      }
      if (!creatorUsername && item.title) {
        creatorUsername = cleanUsername(item.title);
      }

      if (postUrl || creatorUsername) {
        result.push({
          postUrl: postUrl || '#',
          creatorUsername: creatorUsername || 'Instagram Post',
          caption: caption.slice(0, 120),
          timestamp,
        });
      }
    }
    return result;
  } catch (err) {
    console.warn('Failed to parse liked posts:', err);
    return [];
  }
}

/**
 * Parses post_comments_1.json and reels_comments.json
 */
export function parseCommentsJson(jsonContent: string): CommentItem[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) return [];

    const result: CommentItem[] = [];
    for (const item of data) {
      const mediaOwner = cleanUsername(findValueInObject(item, ['Media Owner', 'Owner', 'User']));
      const comment = findValueInObject(item, ['Comment', 'Text']);
      let timestamp = 0;

      if (item.string_map_data?.Time?.timestamp) {
        timestamp = item.string_map_data.Time.timestamp;
      } else if (item.timestamp) {
        timestamp = item.timestamp;
      }

      if (comment || mediaOwner) {
        result.push({
          mediaOwner: mediaOwner || 'Unknown Creator',
          comment: comment || 'Media Comment',
          timestamp,
        });
      }
    }
    return result;
  } catch (err) {
    console.warn('Failed to parse comments:', err);
    return [];
  }
}

/**
 * Parses saved_posts.json
 */
export function parseSavedPostsJson(jsonContent: string): SavedPostItem[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) return [];

    const result: SavedPostItem[] = [];
    for (const item of data) {
      let postUrl = '';
      let timestamp = item.timestamp;

      if (Array.isArray(item.label_values)) {
        for (const lv of item.label_values) {
          if (lv.label === 'URL' && lv.value) postUrl = lv.value;
        }
      }
      if (!postUrl && item.string_list_data?.[0]?.href) {
        postUrl = item.string_list_data[0].href;
        timestamp = item.string_list_data[0].timestamp;
      }

      if (postUrl) {
        result.push({ postUrl, timestamp });
      }
    }
    return result;
  } catch (err) {
    console.warn('Failed to parse saved posts:', err);
    return [];
  }
}

/**
 * Parses audience_insights.json from Instagram exports
 */
export function parseAudienceInsightsJson(jsonContent: string): AudienceInsights | undefined {
  try {
    const data = JSON.parse(jsonContent);
    const item = Array.isArray(data.organic_insights_audience)
      ? data.organic_insights_audience[0]
      : data;
    if (!item || !item.string_map_data) return undefined;

    const map = item.string_map_data;
    const parseNum = (val?: string) => {
      if (!val) return undefined;
      const clean = val.replace(/,/g, '').trim();
      const n = parseInt(clean, 10);
      return isNaN(n) ? undefined : n;
    };

    const totalFollowers = parseNum(map['Followers']?.value);
    const followsGained = parseNum(map['Follows']?.value);
    const unfollowsLost = parseNum(map['Unfollows']?.value);
    const overallFollowersDelta = parseNum(map['Overall followers']?.value);
    const dateRange = map['Date range']?.value;

    return {
      totalFollowers,
      followsGained,
      unfollowsLost,
      overallFollowersDelta,
      dateRange,
    };
  } catch (err) {
    console.warn('Failed to parse audience insights:', err);
    return undefined;
  }
}

/**
 * Parses HTML content from Instagram exports
 */
export function parseInstagramHtml(htmlContent: string): InstagramAccount[] {
  const accounts: InstagramAccount[] = [];
  const seen = new Set<string>();

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const links = doc.querySelectorAll('a');
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || '';

      let username = '';
      if (href.includes('instagram.com/')) {
        const after = href.split('instagram.com/')[1];
        if (after && !after.startsWith('explore') && !after.startsWith('accounts') && !after.startsWith('direct')) {
          username = cleanUsername(after);
        }
      }

      if (!username && text && !text.includes(' ') && text.length < 40) {
        username = cleanUsername(text);
      }

      if (username) {
        const lower = username.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          accounts.push({
            username,
            profileUrl: href.startsWith('http') ? href : `https://www.instagram.com/${username}/`,
            avatarUrl: getAvatarUrl(username),
          });
        }
      }
    });
  } catch (err) {
    console.warn('Failed to parse Instagram HTML:', err);
  }

  return accounts;
}

export interface FileEntryItem {
  path: string;
  readText: () => Promise<string>;
  readBase64?: () => Promise<string>;
}

/**
 * Core processor that builds an InstagramSnapshot from a list of abstract file entries
 */
export async function buildSnapshotFromEntries(
  entries: FileEntryItem[],
  label: string,
  fileName?: string,
  exportDate?: string
): Promise<InstagramSnapshot> {
  const followers: InstagramAccount[] = [];
  const following: InstagramAccount[] = [];
  let blockedProfiles: InstagramAccount[] = [];
  let recentlyUnfollowed: InstagramAccount[] = [];
  let pendingRequests: InstagramAccount[] = [];
  let recentRequests: InstagramAccount[] = [];
  let hideStoryFrom: InstagramAccount[] = [];
  let favoritedProfiles: InstagramAccount[] = [];
  let syncedContacts: SyncedContactItem[] = [];
  let profileInfo: InstagramProfileInfo | undefined = undefined;
  let likedPosts: LikedPostItem[] = [];
  let comments: CommentItem[] = [];
  let savedPosts: SavedPostItem[] = [];

  const dedupeAccounts = (list: InstagramAccount[]): InstagramAccount[] => {
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.username.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  let audienceInsights: AudienceInsights | undefined = undefined;

  for (const entry of entries) {
    const normalizedPath = entry.path.toLowerCase().replace(/\\/g, '/');

    // Skip macOS or OS metadata
    if (normalizedPath.includes('__macosx') || normalizedPath.includes('.ds_store')) continue;

    // Extract exact file name
    const fileName = normalizedPath.split('/').pop() || '';

    // 1. Followers files (followers_1.json, followers_2.json, followers.json, followers.html)
    // STRICT: Must start with followers so following.json, removed_suggestions.json, etc. are NEVER matched!
    if (fileName.startsWith('followers') && (fileName.endsWith('.json') || fileName.endsWith('.html'))) {
      const content = await entry.readText();
      if (fileName.endsWith('.json')) {
        followers.push(...parseInstagramAccountsJson(content, 'mutual'));
      } else if (fileName.endsWith('.html')) {
        followers.push(...parseInstagramHtml(content));
      }
    }
    // 2. Following files (following.json, following_1.json, etc.)
    // STRICT: Must start with following and not hashtags
    else if (fileName.startsWith('following') && !fileName.includes('hashtag') && (fileName.endsWith('.json') || fileName.endsWith('.html'))) {
      const content = await entry.readText();
      if (fileName.endsWith('.json')) {
        following.push(...parseInstagramAccountsJson(content));
      } else if (fileName.endsWith('.html')) {
        following.push(...parseInstagramHtml(content));
      }
    }
    // 3. Blocked profiles
    else if (fileName.includes('blocked_profile') || fileName.includes('blocked_user')) {
      const content = await entry.readText();
      blockedProfiles.push(...parseInstagramAccountsJson(content, 'blocked_by_you'));
    }
    // 4. Recently unfollowed
    else if (fileName.includes('recently_unfollowed')) {
      const content = await entry.readText();
      recentlyUnfollowed.push(...parseInstagramAccountsJson(content, 'recently_unfollowed'));
    }
    // 5. Pending follow requests (sent by you)
    else if (fileName.includes('pending_follow_request')) {
      const content = await entry.readText();
      pendingRequests.push(...parseInstagramAccountsJson(content, 'pending_request'));
    }
    // 6. Recent follow requests (received)
    else if (fileName.includes('recent_follow_request')) {
      const content = await entry.readText();
      recentRequests.push(...parseInstagramAccountsJson(content));
    }
    // 7. Hide story from
    else if (fileName.includes('hide_story')) {
      const content = await entry.readText();
      hideStoryFrom.push(...parseInstagramAccountsJson(content, 'story_hidden'));
    }
    // 8. Close friends / favorites
    else if (fileName.includes('favorited_profile') || fileName.includes('close_friend')) {
      const content = await entry.readText();
      favoritedProfiles.push(...parseInstagramAccountsJson(content, 'favorite'));
    }
    // 9. Synced contacts
    else if (fileName.includes('synced_contact') || fileName.includes('contacts_contact_info')) {
      const content = await entry.readText();
      syncedContacts.push(...parseSyncedContactsJson(content));
    }
    // 10. Personal Profile & Profile Photos
    else if (fileName === 'personal_information.json' || fileName === 'instagram_profile_information.json') {
      const content = await entry.readText();
      const info = parseProfileInfoJson(content);
      if (info) {
        profileInfo = profileInfo ? Object.assign({}, profileInfo, info) : info;
      }
    }
    else if (fileName.includes('profile_photo')) {
      try {
        const content = await entry.readText();
        const d = JSON.parse(content);
        const uri = d.ig_profile_picture?.[0]?.uri || d.profile_photos?.[0]?.uri;
        if (uri && profileInfo) {
          profileInfo.profilePicUri = uri;
        }
      } catch {}
    }
    // 11. Liked Posts
    else if (fileName.includes('liked_post')) {
      const content = await entry.readText();
      likedPosts.push(...parseLikedPostsJson(content));
    }
    // 12. Comments
    else if (fileName.includes('post_comment') || fileName.includes('reels_comment')) {
      const content = await entry.readText();
      comments.push(...parseCommentsJson(content));
    }
    // 13. Saved Posts
    else if (fileName.includes('saved_post')) {
      const content = await entry.readText();
      savedPosts.push(...parseSavedPostsJson(content));
    }
    // 14. Audience Insights (contains verified exact follower count and net delta)
    else if (fileName.includes('audience_insights.json')) {
      const content = await entry.readText();
      const insights = parseAudienceInsightsJson(content);
      if (insights) audienceInsights = insights;
    }
    // Note: removed_suggestions.json is explicitly ignored so feed suggestions never contaminate followers!
  }

  // Extract real Instagram Profile Photo binary into data URL
  let targetUri = (profileInfo?.profilePicUri || '').replace(/\\/g, '/').toLowerCase();
  let picEntry = entries.find((e) => {
    const p = e.path.toLowerCase().replace(/\\/g, '/');
    if (targetUri && (p.endsWith(targetUri) || p.endsWith(targetUri.split('/').pop() || ''))) return true;
    return (p.includes('media/other/') || p.includes('profile_photo')) && (p.endsWith('.jpg') || p.endsWith('.png') || p.endsWith('.jpeg'));
  });

  if (picEntry && picEntry.readBase64) {
    try {
      const b64 = await picEntry.readBase64();
      const ext = picEntry.path.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
      const dataUrl = `data:image/${ext};base64,${b64}`;
      if (!profileInfo) {
        profileInfo = {
          username: 'instagram_user',
          name: 'Instagram User',
          profilePicDataUrl: dataUrl,
        };
      } else {
        profileInfo.profilePicDataUrl = dataUrl;
      }
    } catch (err) {
      console.warn('Could not extract profile photo binary from archive:', err);
    }
  }

  // Extract all real Instagram Post Images & User Media into userMediaPosts
  const userMediaPosts: UserMediaPostItem[] = [];
  const postMetadataMap = new Map<string, { creationTimestamp?: number; caption?: string }>();

  for (const entry of entries) {
    const fn = entry.path.toLowerCase().replace(/\\/g, '/').split('/').pop() || '';
    if (fn.startsWith('posts') && fn.endsWith('.json')) {
      try {
        const text = await entry.readText();
        const d = JSON.parse(text);
        const list = Array.isArray(d) ? d : [];
        for (const item of list) {
          if (Array.isArray(item.media)) {
            for (const m of item.media) {
              if (m.uri) {
                const baseName = m.uri.toLowerCase().split('/').pop() || '';
                postMetadataMap.set(baseName, {
                  creationTimestamp: m.creation_timestamp,
                  caption: m.title || item.title || '',
                });
              }
            }
          }
        }
      } catch {}
    }
  }

  for (const entry of entries) {
    const norm = entry.path.toLowerCase().replace(/\\/g, '/');
    if (
      (norm.startsWith('media/posts/') || norm.includes('your_posts')) &&
      (norm.endsWith('.jpg') || norm.endsWith('.jpeg') || norm.endsWith('.png') || norm.endsWith('.webp')) &&
      entry.readBase64
    ) {
      try {
        const b64 = await entry.readBase64();
        const ext = norm.endsWith('.png') ? 'png' : 'jpeg';
        const baseName = norm.split('/').pop() || '';
        const meta = postMetadataMap.get(baseName);
        userMediaPosts.push({
          uri: entry.path,
          dataUrl: `data:image/${ext};base64,${b64}`,
          fileName: baseName,
          creationTimestamp: meta?.creationTimestamp,
          caption: meta?.caption,
        });
      } catch (err) {
        console.warn('Failed to extract media post image:', err);
      }
    }
  }

  const cleanFollowers = dedupeAccounts(followers);
  const cleanFollowing = dedupeAccounts(following);

  if (cleanFollowers.length === 0 && cleanFollowing.length === 0) {
    throw new Error(
      `No followers or following records detected in "${fileName || label}". Please ensure the files contain Instagram export JSON/HTML files.`
    );
  }

  return {
    label,
    fileName: fileName || label,
    exportDate: exportDate || new Date().toISOString(),
    profileInfo,
    followers: cleanFollowers,
    following: cleanFollowing,
    blockedProfiles: dedupeAccounts(blockedProfiles),
    recentlyUnfollowed: dedupeAccounts(recentlyUnfollowed),
    pendingRequests: dedupeAccounts(pendingRequests),
    recentRequests: dedupeAccounts(recentRequests),
    hideStoryFrom: dedupeAccounts(hideStoryFrom),
    favoritedProfiles: dedupeAccounts(favoritedProfiles),
    syncedContacts,
    likedPosts,
    comments,
    savedPosts,
    audienceInsights,
    userMediaPosts,
  };
}

/**
 * Reads a ZIP file and extracts Instagram followers and following lists
 */
export async function parseInstagramExportZip(
  file: File,
  label: string
): Promise<InstagramSnapshot> {
  const zip = await JSZip.loadAsync(file);
  const entries: FileEntryItem[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      entries.push({
        path: relativePath,
        readText: () => zipEntry.async('string'),
        readBase64: () => zipEntry.async('base64'),
      });
    }
  });

  return buildSnapshotFromEntries(
    entries,
    label,
    file.name,
    new Date(file.lastModified).toISOString()
  );
}

/**
 * Reads an extracted folder / FileList (e.g. from webkitdirectory)
 */
export async function parseInstagramExportFolder(
  files: FileList | File[],
  label: string
): Promise<InstagramSnapshot> {
  const fileArray = Array.from(files);
  const entries: FileEntryItem[] = fileArray.map((file) => ({
    path: (file as any).webkitRelativePath || file.name,
    readText: () => file.text(),
  }));

  const folderName =
    (fileArray[0] as any)?.webkitRelativePath?.split('/')[0] || label;

  return buildSnapshotFromEntries(
    entries,
    label,
    folderName,
    new Date(fileArray[0]?.lastModified || Date.now()).toISOString()
  );
}
