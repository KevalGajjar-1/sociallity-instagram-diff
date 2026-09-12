import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  X,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';
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
  UserMediaPostItem,
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
  const mediaPosts = diff.userMediaPosts || diff.newSnapshot.userMediaPosts || [];
  const [selectedPhoto, setSelectedPhoto] = useState<UserMediaPostItem | null>(null);

  // Filter media posts by search term if provided
  const filteredMedia = mediaPosts.filter((post) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (post.caption && post.caption.toLowerCase().includes(term)) ||
      (post.fileName && post.fileName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="secondary-view-container">
      <div className="directory-header-row">
        <div>
          <h2 className="directory-title">
            Instagram Activity & Content Engagement
          </h2>
          <p className="directory-desc">
            Explore your real uploaded Instagram post photos, posts you liked, creators you engage with, comments, and saved bookmarks.
          </p>
        </div>

        <div className="tabs-nav tabs-nav-mb-0">
          {mediaPosts.length > 0 && (
            <button
              className={`tab-btn ${activeAccountTab === 'user_media' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('user_media')}
            >
              <ImageIcon size={14} style={{ marginRight: '4px' }} />
              Exported Photos ({mediaPosts.length})
            </button>
          )}
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
                  background: 'var(--bg-surface)',
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

      {/* VIEW 1: USER EXTRACTED REAL INSTAGRAM PHOTOS GALLERY */}
      {activeAccountTab === 'user_media' ? (
        <div>
          <div className="activity-gallery-banner">
            <div className="activity-gallery-banner-badge">
              <Sparkles size={14} />
              <span>Extracted Media Binary</span>
            </div>
            <p className="activity-gallery-banner-text">
              Showing <strong>{filteredMedia.length}</strong> real Instagram post photos and images extracted directly from your account archive.
            </p>
          </div>

          <div className="activity-photo-grid">
            {filteredMedia.map((photo, idx) => {
              const dateStr = photo.creationTimestamp
                ? new Date(
                    photo.creationTimestamp > 1e11
                      ? photo.creationTimestamp
                      : photo.creationTimestamp * 1000
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : undefined;

              return (
                <div
                  key={`${photo.fileName || idx}`}
                  className="activity-photo-card"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="activity-photo-thumb-wrap">
                    {photo.dataUrl ? (
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || photo.fileName || `Instagram Photo ${idx + 1}`}
                        className="activity-photo-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="activity-photo-placeholder">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className="activity-photo-hover-overlay">
                      <Eye size={22} color="#ffffff" />
                      <span>View Full Size</span>
                    </div>
                  </div>

                  <div className="activity-photo-info">
                    {dateStr && (
                      <div className="activity-photo-date">
                        <Calendar size={12} />
                        <span>{dateStr}</span>
                      </div>
                    )}
                    <div className="activity-photo-title">
                      {photo.caption || photo.fileName || `Photo #${idx + 1}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMedia.length === 0 && (
            <div className="empty-state-box">
              <ImageIcon size={36} color="var(--text-muted)" />
              <p>No photos matched your search term.</p>
            </div>
          )}
        </div>
      ) : activeAccountTab === 'comments' ? (
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

      {/* FULL-SIZE PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div className="photo-lightbox-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div
            className="photo-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-lightbox-header">
              <div className="photo-lightbox-title-wrap">
                <span className="photo-lightbox-badge">Instagram Archive Media</span>
                <h4 className="photo-lightbox-filename">
                  {selectedPhoto.fileName || 'instagram_post.jpg'}
                </h4>
              </div>

              <div className="photo-lightbox-actions">
                {selectedPhoto.dataUrl && (
                  <a
                    href={selectedPhoto.dataUrl}
                    download={selectedPhoto.fileName || 'instagram_photo.jpg'}
                    className="photo-lightbox-btn"
                    title="Download high-resolution image"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                )}
                <button
                  className="photo-lightbox-btn-close"
                  onClick={() => setSelectedPhoto(null)}
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="photo-lightbox-content">
              {selectedPhoto.dataUrl && (
                <img
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.caption || 'Instagram Full Photo'}
                  className="photo-lightbox-image"
                />
              )}
            </div>

            {selectedPhoto.caption && (
              <div className="photo-lightbox-footer">
                <p className="photo-lightbox-caption">{selectedPhoto.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
