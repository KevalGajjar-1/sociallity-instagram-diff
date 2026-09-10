import React, { useState } from 'react';
import { X, Search, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUser, setCopiedUser] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine current list
  let currentList: InstagramAccount[] = [];
  let categoryTitle = '';
  let badgeColor = '';

  switch (filterType) {
    case 'lost_followers':
      currentList = diff.lostFollowers;
      categoryTitle = 'Lost Followers (Unfollowers)';
      badgeColor = 'var(--accent-red)';
      break;
    case 'new_followers':
      currentList = diff.newFollowers;
      categoryTitle = 'New Followers';
      badgeColor = 'var(--accent-green)';
      break;
    case 'not_following_back':
      currentList = diff.notFollowingBack;
      categoryTitle = 'Not Following You Back';
      badgeColor = '#f59e0b';
      break;
    case 'fans':
      currentList = diff.fans;
      categoryTitle = 'Your Fans (You Don’t Follow Back)';
      badgeColor = 'var(--accent-purple)';
      break;
    case 'mutuals':
      currentList = diff.mutuals;
      categoryTitle = 'Mutual Connections';
      badgeColor = 'var(--accent-blue)';
      break;
    case 'all_followers':
      currentList = diff.newSnapshot.followers;
      categoryTitle = 'All Followers';
      badgeColor = 'var(--accent-purple)';
      break;
    case 'all_following':
      currentList = diff.newSnapshot.following;
      categoryTitle = 'All Following';
      badgeColor = 'var(--accent-blue)';
      break;
  }

  // Filter list by search query
  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.username.toLowerCase().includes(q) ||
      (item.name && item.name.toLowerCase().includes(q))
    );
  });

  const copyToClipboard = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUser(username);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  const exportToCsv = () => {
    const rows = [
      ['Username', 'Name', 'Profile URL', 'Followed Date'],
      ...filteredList.map((acc) => [
        acc.username,
        acc.name || '',
        acc.profileUrl || `https://instagram.com/${acc.username}`,
        acc.followedAt ? new Date(acc.followedAt * 1000).toLocaleDateString() : '',
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filterType}_instagram_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Account Insights & Breakdown</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Detailed comparison between Instagram snapshots
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs Filter Bar */}
          <div className="tabs-nav">
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
          </div>

          {/* Search and Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="search-box" style={{ width: '100%', maxWidth: 360 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder={`Search in ${categoryTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={exportToCsv}
              className="btn-demo"
              style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          <div className="modal-table-wrap">
            <table className="account-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Relationship</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((account) => (
                    <tr key={account.username}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={account.avatarUrl}
                            alt={account.username}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>
                            {account.name || account.username}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        @{account.username}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--bg-subtle)',
                            color: badgeColor,
                          }}
                        >
                          {categoryTitle.split(' ')[0]}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            className="icon-btn"
                            style={{ width: 30, height: 30 }}
                            onClick={() => copyToClipboard(account.username)}
                            title="Copy username"
                          >
                            {copiedUser === account.username ? (
                              <Check size={14} color="var(--accent-green)" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                          <a
                            href={account.profileUrl || `https://instagram.com/${account.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            style={{ width: 30, height: 30 }}
                            title="Open in Instagram"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
