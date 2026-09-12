import React from 'react';
import { ShieldAlert, EyeOff, Clock, UserMinus, Phone } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { contactColumns } from '../components/tableColumns';
import {
  DiffResult,
  FilterListType,
  InstagramAccount,
  SyncedContactItem,
} from '../types/instagram';

interface ConnectionsViewProps {
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
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  diff,
  activeAccountTab,
  currentAccountData,
  accountColumns,
  triggerAjaxSync,
  isSyncing,
  syncLatency,
  searchTerm,
}) => {
  return (
    <div className="secondary-view-container">
      {/* Connections Header & Tabs */}
      <div className="directory-header-row">
        <div>
          <h2 className="directory-title">Connections & Privacy Audit</h2>
          <p className="directory-desc">
            Inspect blocked profiles, hidden story viewers, pending follow requests, recently unfollowed accounts, and synced phone contacts.
          </p>
        </div>

        <div className="tabs-nav tabs-nav-mb-0">
          <button
            className={`tab-btn ${activeAccountTab === 'blocked_profiles' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('blocked_profiles')}
          >
            <ShieldAlert size={14} style={{ marginRight: '4px' }} />
            Blocked Profiles ({(diff.newSnapshot.blockedProfiles || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'hide_story' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('hide_story')}
          >
            <EyeOff size={14} style={{ marginRight: '4px' }} />
            Story Hidden ({(diff.newSnapshot.hideStoryFrom || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'pending_requests' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('pending_requests')}
          >
            <Clock size={14} style={{ marginRight: '4px' }} />
            Pending Sent ({(diff.newSnapshot.pendingRequests || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'recently_unfollowed' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('recently_unfollowed')}
          >
            <UserMinus size={14} style={{ marginRight: '4px' }} />
            Recently Unfollowed ({(diff.newSnapshot.recentlyUnfollowed || []).length})
          </button>
          <button
            className={`tab-btn ${activeAccountTab === 'synced_contacts' ? 'active' : ''}`}
            onClick={() => triggerAjaxSync('synced_contacts')}
          >
            <Phone size={14} style={{ marginRight: '4px' }} />
            Synced Contacts (
            {(diff.newSnapshot.syncedContacts || diff.oldSnapshot.syncedContacts || []).length}
            )
          </button>
        </div>
      </div>

      {/* Render table based on active connection tab */}
      {activeAccountTab === 'synced_contacts' ? (
        <DataTable<SyncedContactItem>
          data={
            diff.newSnapshot.syncedContacts ||
            diff.oldSnapshot.syncedContacts ||
            []
          }
          columns={contactColumns}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          searchPlaceholder="Search contacts by name or phone/email..."
          defaultSortKey="name"
          pageSizeOptions={[10, 25, 50, 100]}
          initialPageSize={10}
          exportFileName="synced_contacts"
          emptyMessage="No synced contacts found in the export data."
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      ) : (
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
          exportFileName={`${activeAccountTab}_connections`}
          emptyMessage={`No records found for ${currentAccountData.label.toLowerCase()}.`}
          isSyncing={isSyncing}
          syncStatusText={`Live Synced (${syncLatency}ms)`}
          onRefreshSync={() => triggerAjaxSync()}
          externalSearchQuery={searchTerm}
        />
      )}
    </div>
  );
};
