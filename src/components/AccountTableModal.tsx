import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';
import { DataTable, DataTableColumn } from './DataTable';
import { UserAvatar } from './UserAvatar';

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
  let badgeClass = '';

  switch (filterType) {
    case 'lost_followers':
      currentList = diff.lostFollowers;
      categoryLabel = 'Lost Follower';
      badgeClass = 'table-status-pill-lost';
      break;
    case 'new_followers':
      currentList = diff.newFollowers;
      categoryLabel = 'New Follower';
      badgeClass = 'table-status-pill-new';
      break;
    case 'not_following_back':
      currentList = diff.notFollowingBack;
      categoryLabel = 'Not Following Back';
      badgeClass = 'table-status-pill-warning';
      break;
    case 'fans':
      currentList = diff.fans;
      categoryLabel = 'Fan (Not Followed Back)';
      badgeClass = 'table-status-pill-purple';
      break;
    case 'mutuals':
      currentList = diff.mutuals;
      categoryLabel = 'Mutual';
      badgeClass = 'table-status-pill-blue';
      break;
    case 'all_followers':
      currentList = diff.newSnapshot.followers;
      categoryLabel = 'Follower';
      badgeClass = 'table-status-pill-purple';
      break;
    case 'all_following':
      currentList = diff.newSnapshot.following;
      categoryLabel = 'Following';
      badgeClass = 'table-status-pill-blue';
      break;
    default:
      currentList = diff.lostFollowers;
      categoryLabel = 'Account';
      badgeClass = 'table-status-pill-purple';
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
        <div className="table-account-cell">
          <UserAvatar src={item.avatarUrl} username={item.username} size={34} className="table-account-avatar" />
          <div>
            <div className="table-account-name-row">
              <span className="table-account-name">
                {item.name || item.username}
              </span>
              {item.isVerified && (
                <span title="Verified" className="table-account-verified">
                  <ShieldCheck size={13} fill="var(--accent-blue)" color="#fff" />
                </span>
              )}
            </div>
            <span className="table-account-handle">
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
        <span className={`table-status-pill ${badgeClass}`}>
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
        <span className="table-text-secondary">
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
        <div className="table-actions-row">
          <button
            className="icon-btn table-action-icon-btn"
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
            className="icon-btn table-action-icon-btn"
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
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Account Insights & Breakdown</h2>
            <p className="modal-subtitle">
              Interactive DataTable comparison between Instagram snapshots
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body modal-body-padded">
          {/* Filter Pills Navigation */}
          <div className="tabs-nav tabs-nav-mb">
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
