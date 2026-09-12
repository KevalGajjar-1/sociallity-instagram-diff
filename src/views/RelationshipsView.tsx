import React from 'react';
import { UserMinus, UserCheck, Users, CheckCircle2 } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';

interface RelationshipsViewProps {
  diff: DiffResult;
  activeAccountTab: FilterListType;
  currentAccountData: {
    label: string;
    list: InstagramAccount[];
    count: number;
    badgeClass: string;
  };
  accountColumns: DataTableColumn<InstagramAccount>[];
  triggerAjaxSync: (targetTab?: FilterListType) => void;
  isSyncing: boolean;
  syncLatency: number;
  searchTerm: string;
  syncTableRef: React.RefObject<HTMLDivElement>;
}

export const RelationshipsView: React.FC<RelationshipsViewProps> = ({
  diff,
  activeAccountTab,
  currentAccountData,
  accountColumns,
  triggerAjaxSync,
  isSyncing,
  syncLatency,
  searchTerm,
  syncTableRef,
}) => {
  return (
    <div className="secondary-view-container">
      {/* Partial Export Verified Insights Banner */}
      {diff.isPartialExport && (
        <div className="partial-export-banner">
          <div className="partial-export-badge">
            <CheckCircle2 size={15} />
            <span>Meta Verified Insights</span>
          </div>
          <div className="partial-export-body">
            <div className="partial-export-title">
              Date-Filtered Archive Reconciled with Instagram Insights
            </div>
            <div className="partial-export-desc">
              Your latest archive contains a date-filtered export ({diff.newSnapshot.followers.length} recent followers).
              Meta Audience Insights verifies your true follower count is{' '}
              <strong>{diff.followersNewCount.toLocaleString()}</strong> ({diff.followersNetChange > 0 ? '+' : ''}{diff.followersNetChange.toLocaleString()} net delta since baseline).
              Unfollowers reflect <strong>{diff.lostFollowers.length}</strong> verified accounts recorded in Instagram's activity log.
            </div>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="stat-cards-grid">
        <div
          className="stat-card-item"
          onClick={() => triggerAjaxSync('lost_followers')}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Lost Followers (Unfollowed)</span>
            <UserMinus size={18} color="var(--accent-red)" />
          </div>
          <div className="stat-card-value text-red">
            {diff.lostFollowers.length}
          </div>
          <span className="stat-card-sub">Stopped following your account</span>
        </div>

        <div
          className="stat-card-item"
          onClick={() => triggerAjaxSync('new_followers')}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">New Followers</span>
            <UserCheck size={18} color="var(--accent-green)" />
          </div>
          <div className="stat-card-value text-green">
            +{diff.newFollowers.length}
          </div>
          <span className="stat-card-sub">Followed you in this period</span>
        </div>

        <div
          className="stat-card-item"
          onClick={() => triggerAjaxSync('not_following_back')}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Not Following Back</span>
            <Users size={18} color="#f59e0b" />
          </div>
          <div className="stat-card-value text-warning">
            {diff.notFollowingBack.length}
          </div>
          <span className="stat-card-sub">You follow them, they don't follow back</span>
        </div>

        <div
          className="stat-card-item"
          onClick={() => triggerAjaxSync('fans')}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Fans (You Don't Follow)</span>
            <Users size={18} color="var(--accent-purple)" />
          </div>
          <div className="stat-card-value text-purple">
            {diff.fans.length}
          </div>
          <span className="stat-card-sub">Follow you, but you don't follow back</span>
        </div>

        <div
          className="stat-card-item"
          onClick={() => triggerAjaxSync('mutuals')}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Mutual Friends</span>
            <Users size={18} color="var(--accent-blue)" />
          </div>
          <div className="stat-card-value text-blue">
            {diff.mutuals.length}
          </div>
          <span className="stat-card-sub">Follow each other</span>
        </div>
      </div>

      {/* In-page Full Relationship Explorer DataTable */}
      <div ref={syncTableRef}>
        <div className="directory-header-row">
          <div>
            <h2 className="directory-title">
              {currentAccountData.label}
            </h2>
            <p className="directory-desc">
              Filter, sort, search, and export Instagram relationships.
            </p>
          </div>

          <div className="tabs-nav tabs-nav-mb-0">
            <button
              className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('lost_followers')}
            >
              Unfollowers ({diff.lostFollowers.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'new_followers' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('new_followers')}
            >
              New ({diff.newFollowers.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'not_following_back' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('not_following_back')}
            >
              Not Back ({diff.notFollowingBack.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'fans' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('fans')}
            >
              Fans ({diff.fans.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'mutuals' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('mutuals')}
            >
              Mutuals ({diff.mutuals.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'all_followers' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('all_followers')}
            >
              All Followers ({diff.newSnapshot.followers.length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'all_following' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('all_following')}
            >
              All Following ({diff.newSnapshot.following.length})
            </button>
          </div>
        </div>

        <DataTable<InstagramAccount>
          data={currentAccountData.list}
          columns={accountColumns}
          keyExtractor={(item) => item.username}
          searchPlaceholder={`Search within ${currentAccountData.label.toLowerCase()}...`}
          defaultSortKey="user"
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
          enableSelection={true}
          selectableItemKey={(item) => item.username}
          exportFileName={`${activeAccountTab}_relationships`}
          emptyMessage={`No records found for ${currentAccountData.label.toLowerCase()}.`}
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      </div>
    </div>
  );
};
