import React, { useState } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';
import { FilterListType, InstagramAccount } from '../types/instagram';

interface BiggestFansCardProps {
  fans: InstagramAccount[];
  lostFollowers: InstagramAccount[];
  newFollowers: InstagramAccount[];
  notFollowingBack: InstagramAccount[];
  onViewAll: (type: FilterListType) => void;
}

export const BiggestFansCard: React.FC<BiggestFansCardProps> = ({
  fans,
  lostFollowers,
  newFollowers,
  notFollowingBack,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<'fans' | 'lost' | 'new' | 'not_back'>('fans');
  const [likedAccounts, setLikedAccounts] = useState<Record<string, boolean>>({});

  const toggleHeart = (username: string) => {
    setLikedAccounts((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  let displayList: InstagramAccount[] = [];
  let title = 'Biggest Fans';
  let subtitle = 'People often like your posts';
  let targetFilter: FilterListType = 'fans';

  if (activeTab === 'fans') {
    displayList = fans.slice(0, 4);
    title = 'Biggest Fans';
    subtitle = 'People often like your posts';
    targetFilter = 'fans';
  } else if (activeTab === 'lost') {
    displayList = lostFollowers.slice(0, 4);
    title = 'Lost Followers';
    subtitle = 'Accounts that unfollowed you';
    targetFilter = 'lost_followers';
  } else if (activeTab === 'new') {
    displayList = newFollowers.slice(0, 4);
    title = 'New Followers';
    subtitle = 'Accounts that recently followed you';
    targetFilter = 'new_followers';
  } else {
    displayList = notFollowingBack.slice(0, 4);
    title = 'Not Following Back';
    subtitle = 'Accounts you follow who do not follow back';
    targetFilter = 'not_following_back';
  }

  return (
    <div className="fans-card">
      {/* Header */}
      <div className="fans-header">
        <div>
          <h2 className="fans-title">{title}</h2>
          <p className="fans-subtitle">{subtitle}</p>
        </div>
        <button
          className="fans-options-btn"
          onClick={() => onViewAll(targetFilter)}
          title="Switch category or view all"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Quick category mini pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto' }}>
        <button
          className={`tab-btn ${activeTab === 'fans' ? 'active' : ''}`}
          onClick={() => setActiveTab('fans')}
          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
        >
          Fans ({fans.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
        >
          Unfollowers ({lostFollowers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'not_back' ? 'active' : ''}`}
          onClick={() => setActiveTab('not_back')}
          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
        >
          Not Back ({notFollowingBack.length})
        </button>
      </div>

      {/* User list matching mockup */}
      <div className="fans-list">
        {displayList.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem', textAlign: 'center', padding: '24px 0' }}>
            No accounts in this category.
          </div>
        ) : (
          displayList.map((account) => {
            const isLiked = likedAccounts[account.username] ?? true; // Default liked in mockup
            const count = account.likesCount ?? 789;

            return (
              <div key={account.username} className="fan-item">
                <div className="fan-user-wrap">
                  <img
                    src={account.avatarUrl}
                    alt={account.name || account.username}
                    className="fan-avatar"
                  />
                  <div className="fan-names">
                    <span className="fan-display-name">
                      {account.name || account.username}
                    </span>
                    <span className="fan-handle">@{account.username}</span>
                  </div>
                </div>

                <div className="fan-action-right">
                  <span>{count}</span>
                  <button
                    className={`heart-icon-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => toggleHeart(account.username)}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={16} fill={isLiked ? 'var(--accent-pink)' : 'none'} color={isLiked ? 'var(--accent-pink)' : 'currentColor'} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Button */}
      <button className="btn-view-all" onClick={() => onViewAll(targetFilter)}>
        View all {activeTab === 'fans' ? 'fans' : activeTab === 'lost' ? 'unfollowers' : 'accounts'}
      </button>
    </div>
  );
};
