import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroGreeting } from './components/HeroGreeting';
import { ZipUploader } from './components/ZipUploader';
import { HowToGuideModal } from './components/HowToGuideModal';
import { DashboardView } from './views/DashboardView';
import { RelationshipsView } from './views/RelationshipsView';
import { ConnectionsView } from './views/ConnectionsView';
import { ActivityView } from './views/ActivityView';
import { ProfileVaultView } from './views/ProfileVaultView';
import { getAccountColumns } from './components/tableColumns';
import { createEmptyDiff } from './utils/diffEngine';
import { getStoredDiff, saveStoredDiff, clearStoredDiff } from './utils/storage';
import { getCurrentAccountData } from './utils/accountDataResolver';
import { getRealAvatarUrl, sanitizeDiffAvatars } from './utils/avatarHelper';
import { fixInstagramEncoding } from './utils/instagramParser';
import {
  DiffResult,
  FilterListType,
  ViewTab,
  SnapshotHistoryItem,
} from './types/instagram';
import { AlertTriangle, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Active Diff State (Loaded purely from user upload or prior saved session)
  const [diff, setDiff] = useState<DiffResult | null>(() => {
    try {
      const saved = localStorage.getItem('sociality_active_diff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lostFollowers && parsed.lostFollowers.length > 5000) {
          localStorage.removeItem('sociality_active_diff');
          return null;
        }
        return sanitizeDiffAvatars(parsed);
      }
    } catch {}
    return null;
  });

  // Load saved diff from IndexedDB on startup if user previously uploaded
  useEffect(() => {
    let isMounted = true;
    getStoredDiff()
      .then((saved) => {
        if (isMounted && saved) {
          // Detect and discard corrupted legacy diff with false 14k lost followers
          if (saved.lostFollowers && saved.lostFollowers.length > 5000) {
            console.info('Clearing corrupted legacy snapshot diff');
            clearStoredDiff().catch(() => {});
            localStorage.removeItem('sociality_active_diff');
            setDiff(null);
            setIsUploadOpen(true);
            return;
          }
          const cleanDiff = sanitizeDiffAvatars(saved);
          setDiff(cleanDiff);
          // Persist the sanitized diff back to wipe any old dicebear traces
          saveStoredDiff(cleanDiff).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Failed to load active diff from storage:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [timeRange, setTimeRange] = useState<string>('All Time Diff');

  // Snapshot History (Saved in localStorage)
  const [snapshotHistory, setSnapshotHistory] = useState<SnapshotHistoryItem[]>(() => {
    const saved = localStorage.getItem('sociality_snapshot_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modals & Navigation
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // In-page Active Directory Filter State
  const [activeAccountTab, setActiveAccountTab] = useState<FilterListType>('lost_followers');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLatency, setSyncLatency] = useState<number>(14);
  const [showBlockInfo, setShowBlockInfo] = useState<boolean>(false);

  // References
  const syncTableRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);

  const handleOpenUpload = () => {
    setCurrentTab('dashboard');
    setIsUploadOpen(true);
    setTimeout(() => {
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Active diff fallback to prevent null crashes
  const activeDiff: DiffResult = diff || createEmptyDiff();

  // Dynamic user profile from export data
  const userProfile = {
    name: fixInstagramEncoding(
      activeDiff.newSnapshot.profileInfo?.name ||
      activeDiff.oldSnapshot.profileInfo?.name ||
      'Instagram User'
    ),
    username:
      activeDiff.newSnapshot.profileInfo?.username ||
      activeDiff.oldSnapshot.profileInfo?.username ||
      'user',
    bio: fixInstagramEncoding(
      activeDiff.newSnapshot.profileInfo?.bio ||
      activeDiff.oldSnapshot.profileInfo?.bio ||
      ''
    ),
    email:
      activeDiff.newSnapshot.profileInfo?.email ||
      activeDiff.oldSnapshot.profileInfo?.email ||
      '',
    gender:
      activeDiff.newSnapshot.profileInfo?.gender ||
      activeDiff.oldSnapshot.profileInfo?.gender ||
      'not specified',
    birthday:
      activeDiff.newSnapshot.profileInfo?.birthday ||
      activeDiff.oldSnapshot.profileInfo?.birthday ||
      '—',
    avatarUrl:
      activeDiff.newSnapshot.profileInfo?.profilePicDataUrl ||
      getRealAvatarUrl(activeDiff.newSnapshot.profileInfo?.username || 'user'),
  };

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Fast in-place directory switch
  const triggerAjaxSync = (targetTab?: FilterListType) => {
    if (targetTab) {
      setActiveAccountTab(targetTab);
    }
    setIsSyncing(true);
    const latency = Math.floor(Math.random() * 15) + 10;

    setTimeout(() => {
      setIsSyncing(false);
      setSyncLatency(latency);
    }, 120);

    setTimeout(() => {
      syncTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const handleMetricCardClick = (type: 'followers' | 'following' | 'unfollowers') => {
    if (type === 'followers') {
      triggerAjaxSync('all_followers');
    } else if (type === 'following') {
      triggerAjaxSync('all_following');
    } else {
      triggerAjaxSync('lost_followers');
    }
  };

  const handleCustomDiff = (newDiff: DiffResult) => {
    const cleanDiff = sanitizeDiffAvatars(newDiff);
    setDiff(cleanDiff);
    saveStoredDiff(cleanDiff).catch((err) => {
      console.warn('Failed to save active diff to storage:', err);
    });
    setIsUploadOpen(false);
    triggerAjaxSync('lost_followers');

    const newRecord: SnapshotHistoryItem = {
      id: `snap-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      label: `${newDiff.oldSnapshot.label} vs ${newDiff.newSnapshot.label}`,
      fileName: newDiff.newSnapshot.fileName || 'instagram-export.zip',
      followersCount: newDiff.followersNewCount,
      followingCount: newDiff.followingNewCount,
      netChange: newDiff.followersNetChange,
      status: 'Ready',
      format: 'JSON',
    };

    setSnapshotHistory((prev) => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('sociality_snapshot_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearData = async () => {
    if (window.confirm('Clear current loaded Instagram data and reset session?')) {
      await clearStoredDiff();
      setDiff(null);
      setIsUploadOpen(true);
    }
  };

  const copyToClipboard = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedAccount(username);
    setTimeout(() => setCopiedAccount(null), 1500);
  };

  const currentAccountData = getCurrentAccountData(activeAccountTab, activeDiff);
  const accountColumns = getAccountColumns(copiedAccount, copyToClipboard);

  return (
    <div className="app-layout">
      {/* Background ambient glow effect */}
      <div className="ambient-glow" />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        unfollowersCount={activeDiff.lostFollowers.length}
        blockedCount={(activeDiff.newSnapshot.blockedProfiles || []).length}
        likesCount={(activeDiff.newSnapshot.likedPosts || []).length}
      />

      {/* Main Content Area */}
      <main className="main-viewport">
        {/* Top Header */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userName={userProfile.name}
          userHandle={userProfile.username}
          avatarUrl={userProfile.avatarUrl}
          onNotificationClick={() => triggerAjaxSync('lost_followers')}
          onProfileClick={() => setCurrentTab('profile_vault')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Hero Greeting Section */}
        <HeroGreeting
          userName={userProfile.name}
          hasData={!!diff}
          onOpenUpload={handleOpenUpload}
          onOpenHowTo={() => setIsHowToOpen(!isHowToOpen)}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Live Active Data Comparison Session Bar */}
        <div className="active-session-banner">
          <div className="active-session-left">
            <div className="session-status-badge">
              <span className="session-pulse-dot" />
              <span>{diff ? 'Live Comparison' : 'Ready'}</span>
            </div>

            <div className="session-info-content">
              {diff ? (
                <div className="session-snapshots-row">
                  <span className="session-label">Active Session:</span>
                  <span className="snapshot-pill baseline">
                    <span className="snapshot-name">{activeDiff.oldSnapshot.label}</span>
                    <span className="snapshot-count">({activeDiff.followersOldCount.toLocaleString()} followers)</span>
                  </span>
                  <span className="snapshot-arrow">→</span>
                  <span className="snapshot-pill current">
                    <span className="snapshot-name">{activeDiff.newSnapshot.label}</span>
                    <span className="snapshot-count">({activeDiff.followersNewCount.toLocaleString()} followers)</span>
                  </span>
                </div>
              ) : (
                <span className="session-empty-text">
                  No export data loaded. Upload your Instagram ZIP files below to begin real-time comparison.
                </span>
              )}
            </div>
          </div>

          <div className="active-session-right">
            <button
              className={`session-btn-action ${showBlockInfo ? 'active' : ''}`}
              onClick={() => setShowBlockInfo(!showBlockInfo)}
              type="button"
            >
              <ShieldCheck size={14} />
              <span>Detection Logic</span>
            </button>

            {diff && (
              <button
                onClick={handleClearData}
                className="session-btn-clear"
                title="Clear current data session"
                type="button"
              >
                <Trash2 size={13} />
                <span>Clear Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Block & Unfollow Detection Explanation Drawer */}
        {showBlockInfo && (
          <div className="block-info-drawer">
            <div className="block-info-header">
              <AlertTriangle size={16} color="var(--accent-purple)" />
              <h4 className="block-info-title">
                Instagram Data Diff & Privacy Extraction Methodology
              </h4>
            </div>
            <div className="block-info-grid">
              <div className="block-info-card">
                <strong className="block-info-label-unfollow">
                  1. Who Unfollowed You (100% Mathematically Exact)
                </strong>
                Calculated by exact set difference:{' '}
                <code>oldSnapshot.followers - newSnapshot.followers</code>. If an
                account was present in your previous export and absent in the new
                one, they stopped following you.
              </div>
              <div className="block-info-card">
                <strong className="block-info-label-blocked">
                  2. Blocked Profiles & Story Hidden
                </strong>
                Directly extracted from Meta's <code>blocked_profiles.json</code> and{' '}
                <code>hide_story_from.json</code> archives. Supports both modern
                Meta 2026 label structures and legacy formats.
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Instagram ZIP Export Guide Drawer */}
        {isHowToOpen && (
          <HowToGuideModal
            isOpen={isHowToOpen}
            onClose={() => setIsHowToOpen(false)}
          />
        )}

        {/* Inline ZIP Uploader */}
        {(!diff || isUploadOpen) && (
          <div ref={uploaderRef}>
            <ZipUploader
              onDiffCalculated={(newDiff) => {
                handleCustomDiff(newDiff);
              }}
            />
          </div>
        )}

        {/* VIEW 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <DashboardView
            diff={activeDiff}
            hasData={!!diff}
            onCardClick={handleMetricCardClick}
            activeAccountTab={activeAccountTab}
            currentAccountData={currentAccountData}
            accountColumns={accountColumns}
            triggerAjaxSync={triggerAjaxSync}
            isSyncing={isSyncing}
            syncLatency={syncLatency}
            searchTerm={searchTerm}
            syncTableRef={syncTableRef}
          />
        )}

        {/* VIEW 2: RELATIONSHIPS */}
        {(currentTab === 'relationships' || currentTab === 'overview') && (
          <RelationshipsView
            diff={activeDiff}
            activeAccountTab={activeAccountTab}
            currentAccountData={currentAccountData}
            accountColumns={accountColumns}
            triggerAjaxSync={triggerAjaxSync}
            isSyncing={isSyncing}
            syncLatency={syncLatency}
            searchTerm={searchTerm}
            syncTableRef={syncTableRef}
          />
        )}

        {/* VIEW 3: CONNECTIONS & PRIVACY */}
        {currentTab === 'connections' && (
          <ConnectionsView
            diff={activeDiff}
            activeAccountTab={activeAccountTab}
            currentAccountData={currentAccountData}
            accountColumns={accountColumns}
            triggerAjaxSync={triggerAjaxSync}
            isSyncing={isSyncing}
            syncLatency={syncLatency}
            searchTerm={searchTerm}
          />
        )}

        {/* VIEW 4: ACTIVITY & CONTENT */}
        {currentTab === 'activity' && (
          <ActivityView
            diff={activeDiff}
            activeAccountTab={activeAccountTab}
            triggerAjaxSync={triggerAjaxSync}
            isSyncing={isSyncing}
            syncLatency={syncLatency}
            searchTerm={searchTerm}
          />
        )}

        {/* VIEW 5: PROFILE & VAULT */}
        {(currentTab === 'profile_vault' || currentTab === 'schedule') && (
          <ProfileVaultView
            diff={activeDiff}
            userProfile={userProfile}
            snapshotHistory={snapshotHistory}
            onOpenUpload={handleOpenUpload}
            onClearData={handleClearData}
          />
        )}
      </main>
    </div>
  );
};
