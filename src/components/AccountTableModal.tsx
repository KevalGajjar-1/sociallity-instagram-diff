import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';
import { DataTable, DataTableColumn } from './DataTable';

interface AccountTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  diff: DiffResult;
  initialFilter?: FilterListType;
}

export const AccountTableModal: React.FC<AccountTableModalProps> = ({
  isOpen,
  onClose,
  diff,
  initialFilter = 'lost_followers',
}) => {
  const [filterType, setFilterType] = useState<FilterListType>(initialFilter);
  const [copiedUser, setCopiedUser] = useState<string | null>(null);

  // Sync filter type when initialFilter changes
  useEffect(() => {
    if (isOpen) {
      setFilterType(initialFilter);
    }
  }, [isOpen, initialFilter]);

  if (!isOpen) return null;

  // Determine current list and metadata
  let currentList: InstagramAccount[] = [];
  let categoryLabel = '';
  let badgeColor = '';
  let badgeBg = '';

  switch (filterType) {
    case 'lost_followers':
      currentList = diff.lostFollowers;
      categoryLabel = 'Lost Follower';
      badgeColor = 'var(--accent-red)';
      badgeBg = 'var(--accent-red-bg)';
      break;
    case 'new_followers':
      currentList = diff.newFollowers;
      categoryLabel = 'New Follower';
      badgeColor = 'var(--accent-green)';
      badgeBg = 'var(--accent-green-bg)';
      break;
    case 'not_following_back':
      currentList = diff.notFollowingBack;
      categoryLabel = 'Not Following Back';
      badgeColor = '#f59e0b';
      badgeBg = 'rgba(245, 158, 11, 0.15)';
      break;
    case 'fans':
      currentList = diff.fans;
      categoryLabel = 'Fan (Not Followed Back)';
      badgeColor = 'var(--accent-purple)';
      badgeBg = 'rgba(139, 92, 246, 0.15)';
      break;
    case 'mutuals':
      currentList = diff.mutuals;
      categoryLabel = 'Mutual';
      badgeColor = 'var(--accent-blue)';
      badgeBg = 'rgba(56, 189, 248, 0.15)';
      break;
    case 'all_followers':
      currentList = diff.newSnapshot.followers;
      categoryLabel = 'Follower';
      badgeColor = 'var(--accent-purple)';
      badgeBg = 'rgba(139, 92, 246, 0.15)';
      break;
    case 'all_following':
      currentList = diff.newSnapshot.following;
      categoryLabel = 'Following';
      badgeColor = 'var(--accent-blue)';
      badgeBg = 'rgba(56, 189, 248, 0.15)';
      break;
  }

  const copyToClipboard = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUser(username);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  // Define DataTable Columns
  const columns: DataTableColumn<InstagramAccount>[] = [
    {
      key: 'user',
      header: 'Account',
      sortable: true,
      accessor: (item) => item.name || item.username,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={item.avatarUrl || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${item.username}`}
            alt={item.username}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              background: 'var(--bg-subtle)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                {item.name || item.username}
              </span>
              {item.isVerified && (
                <span title="Verified" style={{ color: 'var(--accent-blue)', display: 'inline-flex' }}>
                  <ShieldCheck size={13} fill="var(--accent-blue)" color="#fff" />
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              @{item.username}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'relationship',
      header: 'Relationship',
      sortable: false,
      render: () => (
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: badgeBg,
            color: badgeColor,
          }}
        >
          {categoryLabel}
        </span>
      ),
    },
    {
      key: 'followedAt',
      header: 'Date / History',
      sortable: true,
      accessor: (item) => item.followedAt || 0,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {item.followedAt
            ? new Date(item.followedAt > 1e11 ? item.followedAt : item.followedAt * 1000).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Recent Snapshot'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      sortable: false,
      searchable: false,
      render: (item) => (
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <button
            className="icon-btn"
            style={{ width: 30, height: 30 }}
            onClick={() => copyToClipboard(item.username)}
            title="Copy username"
          >
            {copiedUser === item.username ? (
              <Check size={14} color="var(--accent-green)" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <a
            href={item.profileUrl || `https://instagram.com/${item.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            style={{ width: 30, height: 30 }}
            title="Open profile in Instagram"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Account Insights & Breakdown</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive DataTable comparison between Instagram snapshots
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Filter Pills Navigation */}
          <div className="tabs-nav" style={{ marginBottom: 16 }}>
            <button
              className={`tab-btn ${filterType === 'lost_followers' ? 'active' : ''}`}
              onClick={() => setFilterType('lost_followers')}
            >
              Lost Followers ({diff.lostFollowers.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'new_followers' ? 'active' : ''}`}
              onClick={() => setFilterType('new_followers')}
            >
              New Followers ({diff.newFollowers.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'not_following_back' ? 'active' : ''}`}
              onClick={() => setFilterType('not_following_back')}
            >
              Not Following Back ({diff.notFollowingBack.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'fans' ? 'active' : ''}`}
              onClick={() => setFilterType('fans')}
            >
              Fans ({diff.fans.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'mutuals' ? 'active' : ''}`}
              onClick={() => setFilterType('mutuals')}
            >
              Mutuals ({diff.mutuals.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'all_followers' ? 'active' : ''}`}
              onClick={() => setFilterType('all_followers')}
            >
              All Followers ({diff.newSnapshot.followers.length})
            </button>
            <button
              className={`tab-btn ${filterType === 'all_following' ? 'active' : ''}`}
              onClick={() => setFilterType('all_following')}
            >
              All Following ({diff.newSnapshot.following.length})
            </button>
          </div>

          {/* Reusable Generic DataTable */}
          <DataTable<InstagramAccount>
            data={currentList}
            columns={columns}
            keyExtractor={(item) => item.username}
            searchPlaceholder={`Search ${categoryLabel.toLowerCase()}s by name or @handle...`}
            defaultSortKey="user"
            pageSizeOptions={[5, 10, 25, 50]}
            initialPageSize={10}
            enableSelection={true}
            selectableItemKey={(item) => item.username}
            exportFileName={`${filterType}_instagram`}
            emptyMessage={`No ${categoryLabel.toLowerCase()} accounts found.`}
          />
        </div>
      </div>
    </div>
  );
};
