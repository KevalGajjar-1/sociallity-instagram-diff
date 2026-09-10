import JSZip from 'jszip';
import { InstagramAccount, InstagramSnapshot } from '../types/instagram';

/**
 * Normalizes an Instagram username by stripping '@', whitespace, trailing slashes, etc.
 */
export function cleanUsername(raw: string): string {
  if (!raw) return '';
  let user = raw.trim();
  if (user.startsWith('@')) user = user.substring(1);
  if (user.endsWith('/')) user = user.slice(0, -1);
  // If full url like https://www.instagram.com/username
  if (user.includes('instagram.com/')) {
    const parts = user.split('instagram.com/');
    user = parts[parts.length - 1].split('/')[0].split('?')[0];
  }
  return user.trim();
}

/**
 * Generates an avatar URL using Dicebear or UI-avatars based on username
 */
export function getAvatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${encodeURIComponent(username)}`;
}

/**
 * Parses JSON content from Instagram exports
 */
function parseInstagramJson(jsonContent: string): InstagramAccount[] {
  try {
    const data = JSON.parse(jsonContent);
    const accounts: InstagramAccount[] = [];

    // Helper to process list item
    const processItem = (item: any) => {
      let username = '';
      let profileUrl = '';
      let followedAt: number | undefined = undefined;

      if (typeof item === 'string') {
        username = cleanUsername(item);
      } else if (item && typeof item === 'object') {
        // format: { title: "username", string_list_data: [...] }
        if (item.title && typeof item.title === 'string' && item.title.trim()) {
          username = cleanUsername(item.title);
        }

        if (Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
          const first = item.string_list_data[0];
          if (!username && first.value) {
            username = cleanUsername(first.value);
          }
          if (first.href) {
            profileUrl = first.href;
            if (!username) {
              username = cleanUsername(first.href);
            }
          }
          if (first.timestamp) {
            followedAt = typeof first.timestamp === 'number' ? first.timestamp : parseInt(first.timestamp, 10);
          }
        } else if (item.value) {
          username = cleanUsername(item.value);
          if (item.href) profileUrl = item.href;
          if (item.timestamp) followedAt = item.timestamp;
        }
      }

      if (username) {
        accounts.push({
          username,
          profileUrl: profileUrl || `https://www.instagram.com/${username}/`,
          followedAt,
          avatarUrl: getAvatarUrl(username),
        });
      }
    };

    if (Array.isArray(data)) {
      data.forEach(processItem);
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.relationships_following)) {
        data.relationships_following.forEach(processItem);
      } else if (Array.isArray(data.relationships_followers)) {
        data.relationships_followers.forEach(processItem);
      } else {
        // Check any top level array property
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            data[key].forEach(processItem);
          }
        }
      }
    }

    // Deduplicate by username
    const seen = new Set<string>();
    return accounts.filter((acc) => {
      const lower = acc.username.toLowerCase();
      if (!lower || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  } catch (err) {
    console.warn('Failed to parse Instagram JSON:', err);
    return [];
  }
}

/**
 * Parses HTML content from Instagram exports
 */
function parseInstagramHtml(htmlContent: string): InstagramAccount[] {
  const accounts: InstagramAccount[] = [];
  const seen = new Set<string>();

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Instagram HTML exports usually list users in <a> tags pointing to profile URLs or containing the username
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

/**
 * Reads a ZIP file and extracts Instagram followers and following lists
 */
export async function parseInstagramExportZip(
  file: File,
  label: string
): Promise<InstagramSnapshot> {
  const zip = await JSZip.loadAsync(file);
  const fileNames = Object.keys(zip.files);

  let followers: InstagramAccount[] = [];
  let following: InstagramAccount[] = [];

  // Helper to find file matches
  const findFiles = (keyword: string) => {
    return fileNames.filter((name) => {
      const lower = name.toLowerCase();
      return !lower.startsWith('__macosx') && lower.includes(keyword);
    });
  };

  // 1. Locate followers files
  const followersFiles = findFiles('follower');
  for (const path of followersFiles) {
    const zipEntry = zip.files[path];
    if (zipEntry && !zipEntry.dir) {
      const content = await zipEntry.async('string');
      if (path.endsWith('.json')) {
        const parsed = parseInstagramJson(content);
        if (parsed.length > 0) followers.push(...parsed);
      } else if (path.endsWith('.html')) {
        const parsed = parseInstagramHtml(content);
        if (parsed.length > 0) followers.push(...parsed);
      }
    }
  }

  // 2. Locate following files
  const followingFiles = findFiles('following');
  for (const path of followingFiles) {
    const zipEntry = zip.files[path];
    if (zipEntry && !zipEntry.dir) {
      const content = await zipEntry.async('string');
      if (path.endsWith('.json')) {
        const parsed = parseInstagramJson(content);
        if (parsed.length > 0) following.push(...parsed);
      } else if (path.endsWith('.html')) {
        const parsed = parseInstagramHtml(content);
        if (parsed.length > 0) following.push(...parsed);
      }
    }
  }

  // Deduplicate each list
  const dedupe = (list: InstagramAccount[]): InstagramAccount[] => {
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.username.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  followers = dedupe(followers);
  following = dedupe(following);

  if (followers.length === 0 && following.length === 0) {
    throw new Error(
      `No follower or following data detected in "${file.name}". Please ensure this is an Instagram data export ZIP containing "followers_and_following" files.`
    );
  }

  return {
    label,
    fileName: file.name,
    exportDate: new Date(file.lastModified).toISOString(),
    followers,
    following,
  };
}
