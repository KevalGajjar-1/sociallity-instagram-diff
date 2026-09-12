import React, { useState } from 'react';
import { Heart, MoreHorizontal, ExternalLink } from 'lucide-react';
import { FilterListType, InstagramAccount, TopCreatorItem } from '../types/instagram';
import { UserAvatar } from './UserAvatar';

interface BiggestFansCardProps {
  fans: InstagramAccount[];
  lostFollowers: InstagramAccount[];
  newFollowers: InstagramAccount[];
  notFollowingBack: InstagramAccount[];
  topLikedCreators?: TopCreatorItem[];
  onViewAll: (type: FilterListType) => void;
}

export const BiggestFansCard: React.FC<BiggestFansCardProps> = ({
  fans,
  lostFollowers,
  newFollowers,
  notFollowingBack,
  topLikedCreators = [],
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<'creators' | 'fans' | 'new' | 'lost' | 'not_back'>(
    topLikedCreators.length > 0 ? 'creators' : 'fans'
  );

  let displayList: { username: string; name?: string; avatarUrl: string; countText: string; isCreator?: boolean }[] = [];
  let title = 'Top Creators You Love';
  let subtitle = 'Creators whose content you like the most';
  let targetFilter: FilterListType = 'liked_posts';

  if (activeTab === 'creators' && topLikedCreators.length > 0) {
    displayList = topLikedCreators.slice(0, 5).map((c) => ({
      username: c.username,
      avatarUrl: c.avatarUrl,
      countText: `${c.likesCount} likes`,
      isCreator: true,
    }));
    title = 'Top Creators You Love';
    subtitle = 'Accounts whose posts you like the most';
    targetFilter = 'liked_posts';
  } else if (activeTab === 'fans') {
    displayList = fans.slice(0, 5).map((a) => ({
      username: a.username,
      name: a.name,
      avatarUrl: a.avatarUrl || '',
      countText: 'Follows you',
    }));
    title = 'Fans & Followers';
    subtitle = 'Follow you, but you do not follow back';
    targetFilter = 'fans';
  } else if (activeTab === 'new') {
    displayList = newFollowers.slice(0, 5).map((a) => ({
      username: a.username,
      name: a.name,
      avatarUrl: a.avatarUrl || '',
      countText: 'New follower',
    }));
    title = 'New Followers';
    subtitle = 'Accounts that started following you';
    targetFilter = 'new_followers';
  } else if (activeTab === 'lost') {
    displayList = lostFollowers.slice(0, 5).map((a) => ({
      username: a.username,
      name: a.name,
      avatarUrl: a.avatarUrl || '',
      countText: 'Unfollowed',
    }));
    title = 'Recent Unfollowers';
    subtitle = 'Accounts that unfollowed you';
    targetFilter = 'lost_followers';
  } else {
    displayList = notFollowingBack.slice(0, 5).map((a) => ({
      username: a.username,
      name: a.name,
      avatarUrl: a.avatarUrl || '',
      countText: "Doesn't follow back",
    }));
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
      <div className="fans-category-tabs">
        {topLikedCreators.length > 0 && (
          <button
            className={`tab-btn tab-btn-mini ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            Creators ({topLikedCreators.length})
          </button>
        )}
        <button
          className={`tab-btn tab-btn-mini ${activeTab === 'fans' ? 'active' : ''}`}
          onClick={() => setActiveTab('fans')}
        >
          Fans ({fans.length})
        </button>
        <button
          className={`tab-btn tab-btn-mini ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New ({newFollowers.length})
        </button>
        <button
          className={`tab-btn tab-btn-mini ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Unfollowers ({lostFollowers.length})
        </button>
        <button
          className={`tab-btn tab-btn-mini ${activeTab === 'not_back' ? 'active' : ''}`}
          onClick={() => setActiveTab('not_back')}
        >
          Not Back ({notFollowingBack.length})
        </button>
      </div>

      {/* User list */}
      <div className="fans-list">
        {displayList.length === 0 ? (
          <div className="fans-empty-state">
            No accounts recorded in this category.
          </div>
        ) : (
          displayList.map((item) => (
            <div key={item.username} className="fan-item">
              <div className="fan-user-wrap">
                <UserAvatar
                  src={item.avatarUrl}
                  username={item.username}
                  size={44}
                  className="fan-avatar"
                />
                <div className="fan-names">
                  <span className="fan-display-name">
                    {item.name || item.username}
                  </span>
                  <a
                    href={`https://www.instagram.com/${item.username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fan-handle"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    @{item.username}
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="fan-action-right">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {item.countText}
                </span>
                <Heart
                  size={16}
                  fill="var(--accent-pink)"
                  color="var(--accent-pink)"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      <button className="btn-view-all" onClick={() => onViewAll(targetFilter)}>
        Explore All {title}
      </button>
    </div>
  );
};
