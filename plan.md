Instagram Data Diff

User downloads Instagram data export.
Uploads old export.
Uploads new export.
App parses both.
Finds changes.
Shows dashboard.

Instagram export supports multiple formats, including HTML and JSON, depending on export choices. Meta provides export through Accounts Center.

MVP

Upload

Old ZIP
New ZIP
Accept ZIP directly, not force user to extract.
Detect JSON/HTML automatically.
Ignore unrelated Instagram files.

Compare

Followers
Following
Mutual followers
Accounts unfollowed
New followers
Accounts you stopped following
Accounts that stopped following you
Follow-back rate
Follower/following counts
Changes between export dates

Example:

OLD
Followers: 1,240
Following: 830

NEW
Followers: 1,287
Following: 845

CHANGES
+47 followers
+15 following
12 lost followers
27 new followers
8 new following
Dashboard
5

Cards:

Followers        1,287     +47
Following          845     +15
New followers      27
Lost followers     12
New following       8
Unfollowed          5

Charts:

Follower growth
Following growth
Followers gained/lost
Net growth
Follow/unfollow activity

Tables:

New followers
Lost followers
New following
Unfollowed
Mutuals
Important technical choice

Build parser around normalized internal data, not Instagram filenames.

Something like:

type InstagramAccount = {
  username: string;
  profileUrl?: string;
};

type InstagramSnapshot = {
  exportedAt?: Date;
  followers: InstagramAccount[];
  following: InstagramAccount[];
};

Then comparison stays independent from Instagram export format:

type Comparison = {
  newFollowers: InstagramAccount[];
  lostFollowers: InstagramAccount[];
  newFollowing: InstagramAccount[];
  unfollowed: InstagramAccount[];
};

Set comparison using usernames:

newFollowers = new.followers - old.followers
lostFollowers = old.followers - new.followers

newFollowing = new.following - old.following
unfollowed = old.following - new.following
Suggested stack
Next.js
TypeScript
Tailwind CSS
Recharts
Web Worker for parsing
Browser-only processing

For MVP, do not upload user Instagram data to server.

Better:

ZIP
 ↓
Browser
 ↓
Extract
 ↓
Parse JSON/HTML
 ↓
Normalize
 ↓
Compare
 ↓
Dashboard

Privacy becomes strong selling point:

Your Instagram export never leaves your device.

Bigger version

Later support:

Instagram
├── Followers
├── Following
├── Close Friends
├── Blocked accounts
├── Pending follow requests
├── Likes
├── Comments
├── Saved posts
├── Messages
└── Account activity

Then user can upload exports periodically and app creates historical snapshots.

Jan 2026 ── Feb 2026 ── Mar 2026 ── Apr 2026
   980          1,020        1,080        1,140

That turns simple file comparison into personal Instagram analytics.

One caveat: Meta export structure can change. So parser should have format/version detection + fallback parsers, rather than hardcoding one filename/schema. Search results from Meta's official documentation were poor today, so I would verify exact current Instagram export filenames/schema against a real 2026 export before locking parser design.

I can next turn this into full product spec + screen structure + database/schema + parser architecture + exact MVP build plan.