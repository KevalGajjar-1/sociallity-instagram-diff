import React from 'react';
import { Zap, UserX, CheckCircle2 } from 'lucide-react';
import { MetricCards } from '../components/MetricCards';
import { ProfileDiscoveryChart } from '../components/ProfileDiscoveryChart';
import { BiggestFansCard } from '../components/BiggestFansCard';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { DiffResult, FilterListType, InstagramAccount } from '../types/instagram';

interface DashboardViewProps {
  diff: DiffResult;
  hasData: boolean;
  onCardClick: (type: 'followers' | 'following' | 'unfollowers') => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  diff,
  hasData,
  onCardClick,
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
    <>
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
              Your latest export is a date-filtered subset ({diff.newSnapshot.followers.length} recent followers).
              Meta Audience Insights confirms your true total follower count is{' '}
              <strong>{diff.followersNewCount.toLocaleString()}</strong> ({diff.followersNetChange > 0 ? '+' : ''}{diff.followersNetChange.toLocaleString()} net change since baseline).
              Unfollowers reflect <strong>{diff.lostFollowers.length}</strong> verified accounts recorded by Instagram.
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <MetricCards diff={diff} onCardClick={onCardClick} />

      {/* Split Grid: Follower Velocity Chart + Top Creators/Fans Card */}
      <div className="dashboard-split-grid">
        <ProfileDiscoveryChart diff={diff} />
        <BiggestFansCard
          fans={diff.fans}
          lostFollowers={diff.lostFollowers}
          newFollowers={diff.newFollowers}
          notFollowingBack={diff.notFollowingBack}
          topLikedCreators={diff.topLikedCreators}
          onViewAll={(type) => triggerAjaxSync(type)}
        />
      </div>

      {/* In-Page AJAX Sync DataTable Section */}
      <div ref={syncTableRef} className="sync-section-container">
        <div className="sync-section-header">
          <div>
            <div className="sync-section-title-group">
              <h2 className="sync-section-title">
                {currentAccountData.label}
              </h2>
              <span className="sync-badge-live">
                <Zap size={11} fill="var(--accent-green)" />
                Live Directory ({syncLatency}ms)
              </span>
            </div>
            <p className="sync-section-desc">
              Instant filter, search, sort, and CSV export across all Instagram relationship categories.
            </p>
          </div>

          {/* Category navigation pills */}
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('lost_followers')}
            >
              Unfollowers ({diff.lostFollowers.length})
            </button>
            <button
              className={`tab-btn tab-btn-danger ${activeAccountTab === 'suspected_blocked' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('suspected_blocked')}
            >
              <UserX size={12} className="icon-no-shrink" />
              Blocked ({(diff.newSnapshot.blockedProfiles || []).length})
            </button>
            <button
              className={`tab-btn ${activeAccountTab === 'new_followers' ? 'active' : ''}`}
              onClick={() => triggerAjaxSync('new_followers')}
            >
              New (+{diff.newFollowers.length})
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

        {/* In-place DataTable */}
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
          exportFileName={`${activeAccountTab}_directory`}
          emptyMessage={
            hasData
              ? `No records found for ${currentAccountData.label.toLowerCase()}.`
              : 'No Instagram data loaded. Please upload your export ZIP files above.'
          }
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      </div>
    </>
  );
};
