import { ExternalLink, Copy, Check } from 'lucide-react';
import { DataTableColumn } from './DataTable';
import {
  InstagramAccount,
  LikedPostItem,
  CommentItem,
  SavedPostItem,
  SyncedContactItem,
} from '../types/instagram';
import { UserAvatar } from './UserAvatar';
import { getRealAvatarUrl } from '../utils/avatarHelper';

export function getAccountColumns(
  copiedAccount: string | null,
  copyToClipboard: (username: string) => void
): DataTableColumn<InstagramAccount>[] {
  return [
    {
      key: 'user',
      header: 'Account / User',
      sortable: true,
      width: '38%',
      accessor: (item: InstagramAccount) => `${item.username} ${item.name || ''}`,
      render: (item) => (
        <div className="table-user-cell">
          <a
            href={item.profileUrl || `https://www.instagram.com/${item.username}/`}
            target="_blank"
            rel="noopener noreferrer"
            title={`View @${item.username}'s live profile & photo on Instagram`}
            className="table-avatar-link"
          >
            <UserAvatar src={item.avatarUrl} username={item.username} size={38} />
          </a>
          <div className="table-user-meta">
            <div className="table-username-row">
              <span className="table-username">@{item.username}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.username);
                }}
                className="btn-copy-icon"
                title="Copy username"
                type="button"
              >
                {copiedAccount === item.username ? (
                  <Check size={12} color="var(--accent-green)" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
            {item.name && <span className="table-real-name">{item.name}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Relationship Status',
      sortable: true,
      width: '28%',
      accessor: (item: InstagramAccount) => item.statusType,
      render: (item) => {
        let badgeStyle = 'badge-neutral';
        let text = 'Follower';

        switch (item.statusType) {
          case 'unfollowed':
            badgeStyle = 'badge-danger';
            text = 'Unfollowed';
            break;
          case 'blocked_by_you':
          case 'suspected_blocked':
            badgeStyle = 'badge-blocked';
            text = 'Blocked';
            break;
          case 'new_follower':
            badgeStyle = 'badge-success';
            text = 'New Follower';
            break;
          case 'not_following_back':
            badgeStyle = 'badge-warning';
            text = 'Not Back';
            break;
          case 'fan':
            badgeStyle = 'badge-purple';
            text = 'Fan';
            break;
          case 'mutual':
            badgeStyle = 'badge-info';
            text = 'Mutual Friend';
            break;
          case 'recently_unfollowed':
            badgeStyle = 'badge-danger';
            text = 'Recently Unfollowed';
            break;
          case 'pending_request':
            badgeStyle = 'badge-warning';
            text = 'Request Pending';
            break;
          case 'story_hidden':
            badgeStyle = 'badge-purple';
            text = 'Story Hidden';
            break;
          case 'favorite':
            badgeStyle = 'badge-success';
            text = 'Favorited';
            break;
        }

        return (
          <div className="status-badge-container">
            <span className={`status-badge ${badgeStyle}`}>{text}</span>
            {item.detectionNote && (
              <span className="detection-note-sub">{item.detectionNote}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'followedAt',
      header: 'Date / Timestamp',
      sortable: true,
      width: '18%',
      accessor: (item: InstagramAccount) => item.followedAt || 0,
      render: (item) => {
        if (!item.followedAt) return <span className="text-muted">—</span>;
        const ms = item.followedAt > 1e11 ? item.followedAt : item.followedAt * 1000;
        const d = new Date(ms);
        return (
          <span className="table-date-text">
            {d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Profile Link',
      sortable: false,
      width: '16%',
      render: (item) => (
        <a
          href={item.profileUrl || `https://www.instagram.com/${item.username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-profile-link"
          title={`Open @${item.username} on Instagram`}
        >
          <span>View Profile</span>
          <ExternalLink size={12} />
        </a>
      ),
    },
  ];
}

export const likedPostColumns: DataTableColumn<LikedPostItem>[] = [
  {
    key: 'creator',
    header: 'Creator',
    sortable: true,
    width: '24%',
    accessor: (item: LikedPostItem) => item.creatorUsername,
    render: (item) => (
      <div className="table-user-cell">
        <UserAvatar
          src={getRealAvatarUrl(item.creatorUsername)}
          username={item.creatorUsername}
          size={36}
        />
        <div className="table-user-meta">
          <span className="table-username">@{item.creatorUsername}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'caption',
    header: 'Caption / Content',
    sortable: false,
    width: '44%',
    accessor: (item: LikedPostItem) => item.caption || '',
    render: (item) => (
      <span className="table-caption-text" title={item.caption}>
        {item.caption || 'Liked Instagram Post / Reel'}
      </span>
    ),
  },
  {
    key: 'timestamp',
    header: 'Date Liked',
    sortable: true,
    width: '16%',
    accessor: (item: LikedPostItem) => item.timestamp || 0,
    render: (item) => {
      if (!item.timestamp) return <span className="text-muted">—</span>;
      const ms = item.timestamp > 1e11 ? item.timestamp : item.timestamp * 1000;
      return (
        <span className="table-date-text">
          {new Date(ms).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );
    },
  },
  {
    key: 'link',
    header: 'Post Link',
    sortable: false,
    width: '16%',
    render: (item) => (
      <a
        href={item.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-profile-link"
      >
        <span>Open Post</span>
        <ExternalLink size={12} />
      </a>
    ),
  },
];

export const commentColumns: DataTableColumn<CommentItem>[] = [
  {
    key: 'owner',
    header: 'Post Creator',
    sortable: true,
    width: '25%',
    render: (item) => (
      <div className="table-user-cell">
        <UserAvatar
          src={getRealAvatarUrl(item.mediaOwner)}
          username={item.mediaOwner}
          size={32}
        />
        <span className="table-username">@{item.mediaOwner}</span>
      </div>
    ),
  },
  {
    key: 'comment',
    header: 'Your Comment',
    sortable: false,
    width: '55%',
    accessor: (item: CommentItem) => item.comment,
    render: (item) => <span className="table-comment-text">{item.comment}</span>,
  },
  {
    key: 'timestamp',
    header: 'Date Commented',
    sortable: true,
    width: '20%',
    accessor: (item: CommentItem) => item.timestamp || 0,
    render: (item) => {
      if (!item.timestamp) return <span className="text-muted">—</span>;
      const ms = item.timestamp > 1e11 ? item.timestamp : item.timestamp * 1000;
      return (
        <span className="table-date-text">
          {new Date(ms).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );
    },
  },
];

export const contactColumns: DataTableColumn<SyncedContactItem>[] = [
  {
    key: 'name',
    header: 'Contact Name',
    sortable: true,
    width: '40%',
    accessor: (item: SyncedContactItem) => item.name,
    render: (item) => <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>,
  },
  {
    key: 'contact',
    header: 'Phone / Details',
    sortable: true,
    width: '60%',
    accessor: (item: SyncedContactItem) => item.contact,
    render: (item) => <span>{item.contact}</span>,
  },
];

export const savedPostColumns: DataTableColumn<SavedPostItem>[] = [
  {
    key: 'url',
    header: 'Saved Post URL',
    sortable: false,
    width: '75%',
    accessor: (item: SavedPostItem) => item.postUrl,
    render: (item) => (
      <a
        href={item.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-profile-link"
      >
        <span>{item.postUrl}</span>
        <ExternalLink size={12} />
      </a>
    ),
  },
  {
    key: 'timestamp',
    header: 'Date Saved',
    sortable: true,
    width: '25%',
    accessor: (item: SavedPostItem) => item.timestamp || 0,
    render: (item) => {
      if (!item.timestamp) return <span className="text-muted">—</span>;
      const ms = item.timestamp > 1e11 ? item.timestamp : item.timestamp * 1000;
      return (
        <span className="table-date-text">
          {new Date(ms).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );
    },
  },
];
