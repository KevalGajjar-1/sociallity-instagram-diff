import React from 'react';
import { Heart, MessageSquare, Bookmark } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { UserAvatar } from '../components/UserAvatar';
import {
  likedPostColumns,
  commentColumns,
  savedPostColumns,
} from '../components/tableColumns';
import {
  DiffResult,
  FilterListType,
  LikedPostItem,
  CommentItem,
  SavedPostItem,
} from '../types/instagram';

interface ActivityViewProps {
  diff: DiffResult;
  activeAccountTab: FilterListType;
  triggerAjaxSync: (targetTab?: FilterListType) => void;
  isSyncing: boolean;
  syncLatency: number;
  searchTerm: string;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  diff,
  activeAccountTab,
  triggerAjaxSync,
  isSyncing,
  syncLatency,
  searchTerm,
}) => {
  return (
    <div className="secondary-view-container">
      <div className="directory-header-row">
        <div>
          <h2 className="directory-title">
            Instagram Activity & Content Engagement
          </h2>
          <p className="directory-desc">
            Explore posts you have liked, creators you engage with most, comments left on content, and saved bookmarks.
          </p>
        </div>

        <div className="tabs-nav tabs-nav-mb-0">
          <button
            className={`tab-btn ${activeAccountTab === 'liked_posts' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('liked_posts')}
          >
            <Heart size={14} style={{ marginRight: '4px' }} />
            Liked Posts ({(diff.newSnapshot.likedPosts || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'comments' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('comments')}
          >
            <MessageSquare size={14} style={{ marginRight: '4px' }} />
            Comments Sent ({(diff.newSnapshot.comments || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'saved_posts' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('saved_posts')}
          >
            <Bookmark size={14} style={{ marginRight: '4px' }} />
            Saved Bookmarks ({(diff.newSnapshot.savedPosts || []).length})
          </button>
        </div>
      </div>

      {/* Top Creators Ranking Card if Liked Posts Tab */}
      {activeAccountTab === 'liked_posts' && diff.topLikedCreators.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Top 5 Creators You Like Most
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {diff.topLikedCreators.slice(0, 5).map((creator) => (
              <div
                key={creator.username}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <UserAvatar
                  src={creator.avatarUrl}
                  username={creator.username}
                  size={38}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{creator.username}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-pink)', fontWeight: 500 }}>
                    ❤️ {creator.likesCount} liked posts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Table */}
      {activeAccountTab === 'comments' ? (
        <DataTable<CommentItem>
          data={diff.newSnapshot.comments || []}
          columns={commentColumns}
          keyExtractor={(item, index) => `${item.mediaOwner}-${index}`}
          searchPlaceholder="Search comments by creator or comment text..."
          defaultSortKey="timestamp"
          defaultSortDirection="desc"
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
          exportFileName="instagram_comments"
          emptyMessage="No comments found in this export."
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      ) : activeAccountTab === 'saved_posts' ? (
        <DataTable<SavedPostItem>
          data={diff.newSnapshot.savedPosts || []}
          columns={savedPostColumns}
          keyExtractor={(item, index) => `${item.postUrl}-${index}`}
          searchPlaceholder="Search saved post URLs..."
          defaultSortKey="timestamp"
          defaultSortDirection="desc"
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
          exportFileName="saved_posts"
          emptyMessage="No saved posts found in this export."
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      ) : (
        <DataTable<LikedPostItem>
          data={diff.newSnapshot.likedPosts || []}
          columns={likedPostColumns}
          keyExtractor={(item, index) => `${item.postUrl}-${index}`}
          searchPlaceholder="Search liked posts by creator or caption..."
          defaultSortKey="timestamp"
          defaultSortDirection="desc"
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
          exportFileName="liked_posts"
          emptyMessage="No liked posts found in this export."
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      )}
    </div>
  );
};
