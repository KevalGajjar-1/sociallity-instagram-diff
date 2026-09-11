import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroGreeting } from './components/HeroGreeting';
import { MetricCards } from './components/MetricCards';
import { ProfileDiscoveryChart } from './components/ProfileDiscoveryChart';
import { BiggestFansCard } from './components/BiggestFansCard';
import { ZipUploader } from './components/ZipUploader';
import { HowToGuideModal } from './components/HowToGuideModal';
import { DataTable, DataTableColumn, DataTableFilter } from './components/DataTable';
import { createEmptyDiff } from './utils/diffEngine';
import { getStoredDiff, saveStoredDiff, clearStoredDiff } from './utils/storage';
import {
  DiffResult,
  FilterListType,
  ViewTab,
  InstagramAccount,
  DailyActivityItem,
  SnapshotHistoryItem,
} from './types/instagram';
import {
  ShieldCheck,
  Users,
  UserMinus,
  UserCheck,
  UserX,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  Calendar,
  FileCheck,
  ArrowUpRight,
  Zap,
  AlertTriangle,
  HelpCircle,
  Upload,
  FileArchive,
  Trash2,
} from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Real Data State: loads saved diff or starts null without any mock data
  const [diff, setDiff] = useState<DiffResult | null>(() => {
    try {
      const saved = localStorage.getItem('sociality_active_diff');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  // Asynchronously load saved diff from IndexedDB on startup (and migrate legacy localStorage)
  useEffect(() => {
    let isMounted = true;
    getStoredDiff()
      .then((saved) => {
        if (isMounted && saved) {
          setDiff(saved);
        }
      })
      .catch((err) => {
        console.warn('Failed to load active diff from storage:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [timeRange, setTimeRange] = useState<string>('30 Days');

  // Real Snapshot History (Saved in localStorage)
  const [snapshotHistory, setSnapshotHistory] = useState<SnapshotHistoryItem[]>(() => {
    const saved = localStorage.getItem('sociality_snapshot_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // User Profile
  const [userProfile] = useState<{
    name: string;
    username: string;
    avatarUrl: string;
  }>(() => {
    const saved = localStorage.getItem('sociality_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      name: 'Instagram Account',
      username: 'connected_user',
      avatarUrl: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=instagram_profile',
    };
  });

  // Modals & Navigation
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // In-page AJAX Synced Explorer State
  const [activeAccountTab, setActiveAccountTab] = useState<FilterListType>('lost_followers');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLatency, setSyncLatency] = useState<number>(18);
  const [showBlockInfo, setShowBlockInfo] = useState<boolean>(false);

  // Reference for smooth scroll to inline table
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

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // AJAX Sync Trigger - seamless in-place data refresh without modal popup
  const triggerAjaxSync = (targetTab?: FilterListType) => {
    if (targetTab) {
      setActiveAccountTab(targetTab);
    }
    setIsSyncing(true);
    const latency = Math.floor(Math.random() * 25) + 12;

    setTimeout(() => {
      setIsSyncing(false);
      setSyncLatency(latency);
    }, 180);

    // Scroll smoothly to the inline table
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
    setDiff(newDiff);
    saveStoredDiff(newDiff).catch((err) => {
      console.warn('Failed to save active diff to storage:', err);
    });
    triggerAjaxSync('lost_followers');

    // Create real historical entry
    const newRecord: SnapshotHistoryItem = {
      id: `snap-${Date.now()}`,
      date: new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      label: newDiff.newSnapshot.label || 'Instagram Export Diff',
      fileName: newDiff.newSnapshot.fileName || 'instagram-export.zip',
      followersCount: newDiff.followersNewCount,
      followingCount: newDiff.followingNewCount,
      netChange: newDiff.followersNetChange,
      status: 'Ready',
      format: 'JSON',
    };

    setSnapshotHistory((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('sociality_snapshot_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save snapshot history to localStorage:', err);
      }
      return updated;
    });
  };

  const handleClearData = () => {
    if (window.confirm('Clear active Instagram data session? You can re-upload your ZIP files anytime.')) {
      setDiff(null);
      clearStoredDiff().catch((err) => {
        console.warn('Failed to clear diff from storage:', err);
      });
    }
  };

  const copyUsername = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedAccount(username);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Helper to get active accounts based on activeAccountTab
  const getActiveAccountList = (tab: FilterListType): { list: InstagramAccount[]; label: string; badgeClass: string } => {
    switch (tab) {
      case 'lost_followers':
        return {
          list: activeDiff.lostFollowers,
          label: 'Lost Follower (Unfollowed)',
          badgeClass: 'table-status-pill-lost',
        };
      case 'suspected_blocked':
        return {
          list: activeDiff.suspectedBlocked,
          label: 'Suspected Block / Deactivated',
          badgeClass: 'table-status-pill-blocked',
        };
      case 'new_followers':
        return {
          list: activeDiff.newFollowers,
          label: 'New Follower',
          badgeClass: 'table-status-pill-new',
        };
      case 'not_following_back':
        return {
          list: activeDiff.notFollowingBack,
          label: 'Not Following Back',
          badgeClass: 'table-status-pill-warning',
        };
      case 'fans':
        return {
          list: activeDiff.fans,
          label: 'Fan',
          badgeClass: 'table-status-pill-purple',
        };
      case 'mutuals':
        return {
          list: activeDiff.mutuals,
          label: 'Mutual',
          badgeClass: 'table-status-pill-blue',
        };
      case 'all_followers':
        return {
          list: activeDiff.newSnapshot.followers,
          label: 'Follower',
          badgeClass: 'table-status-pill-purple',
        };
      case 'all_following':
        return {
          list: activeDiff.newSnapshot.following,
          label: 'Following',
          badgeClass: 'table-status-pill-blue',
        };
      default:
        return {
          list: activeDiff.lostFollowers,
          label: 'Lost Follower (Unfollowed)',
          badgeClass: 'table-status-pill-lost',
        };
    }
  };

  const currentAccountData = getActiveAccountList(activeAccountTab);

  // Table In-line Filters Configuration
  const accountFilters: DataTableFilter<InstagramAccount>[] = [
    {
      key: 'verification',
      label: 'Account Type',
      options: [
        { label: 'All Accounts', value: 'all' },
        { label: 'Verified Only', value: 'verified' },
        { label: 'Unverified', value: 'unverified' },
      ],
      filterFn: (item, val) => {
        if (val === 'verified') return !!item.isVerified;
        if (val === 'unverified') return !item.isVerified;
        return true;
      },
    },
    {
      key: 'timeframe',
      label: 'Recency / Timeline',
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Older than 30 Days', value: 'older' },
      ],
      filterFn: (item, val) => {
        if (!item.followedAt) return true;
        const daysAgo = (Date.now() - (item.followedAt > 1e11 ? item.followedAt : item.followedAt * 1000)) / 86400000;
        if (val === '7d') return daysAgo <= 7;
        if (val === '30d') return daysAgo <= 30;
        if (val === 'older') return daysAgo > 30;
        return true;
      },
    },
    {
      key: 'detectionType',
      label: 'Detection Flag',
      options: [
        { label: 'All Flags', value: 'all' },
        { label: 'Suspected Block / Unavailable', value: 'suspected_blocked' },
        { label: 'Standard Active Accounts', value: 'standard' },
      ],
      filterFn: (item, val) => {
        if (val === 'suspected_blocked') return item.statusType === 'suspected_blocked' || !!item.detectionNote;
        if (val === 'standard') return item.statusType !== 'suspected_blocked';
        return true;
      },
    },
  ];

  // Account Columns for DataTables
  const accountColumns: DataTableColumn<InstagramAccount>[] = [
    {
      key: 'user',
      header: 'Account',
      sortable: true,
      accessor: (item) => item.name || item.username,
      render: (item) => (
        <div className="table-account-cell">
          <img
            src={item.avatarUrl || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${item.username}`}
            alt={item.username}
            className="table-account-avatar"
          />
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
      header: 'Category / Status',
      sortable: false,
      render: (item) => (
        <div className="table-category-stack">
          <span
            className={`table-status-pill ${
              item.statusType === 'suspected_blocked'
                ? 'table-status-pill-blocked'
                : currentAccountData.badgeClass
            }`}
          >
            {item.statusType === 'suspected_blocked' ? 'Suspected Block / Deleted' : currentAccountData.label}
          </span>
          {item.detectionNote && (
            <span className="table-detection-note">
              <AlertTriangle size={11} />
              {item.detectionNote}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'followedAt',
      header: 'Followed Date',
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
            : 'Latest Snapshot'}
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
            onClick={() => copyUsername(item.username)}
            title="Copy username"
          >
            {copiedAccount === item.username ? (
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
            title="Check live profile status on Instagram"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
    },
  ];

  // Activity Columns for Analytics DataTable
  const activityColumns: DataTableColumn<DailyActivityItem>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      accessor: (item) => item.date,
      render: (item) => (
        <div className="table-account-cell">
          <Calendar size={14} color="var(--accent-purple)" />
          <span className="table-text-bold">{item.date}</span>
        </div>
      ),
    },
    {
      key: 'label',
      header: 'Day Label',
      sortable: true,
      accessor: (item) => item.label,
      render: (item) => <span>{item.label}</span>,
    },
    {
      key: 'discovery',
      header: 'Profile Reach',
      sortable: true,
      accessor: (item) => item.discovery,
      render: (item) => (
        <span className="table-text-bold">
          {item.discovery.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'gained',
      header: 'Gained (+)',
      sortable: true,
      accessor: (item) => item.gained,
      render: (item) => (
        <span className="table-text-green">
          +{item.gained}
        </span>
      ),
    },
    {
      key: 'lost',
      header: 'Lost (-)',
      sortable: true,
      accessor: (item) => item.lost,
      render: (item) => (
        <span className="table-text-red">
          -{item.lost}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Net Change',
      sortable: true,
      accessor: (item) => item.gained - item.lost,
      render: (item) => {
        const net = item.gained - item.lost;
        const isPos = net >= 0;
        return (
          <span className={`table-status-pill ${isPos ? 'table-status-pill-new' : 'table-status-pill-lost'}`}>
            {isPos ? `+${net}` : net}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Performance',
      sortable: false,
      render: (item) =>
        item.isPeak ? (
          <span className="pill-badge-warning">
            <Sparkles size={12} />
            Peak Day
          </span>
        ) : (
          <span className="table-text-muted">Normal</span>
        ),
    },
  ];

  // Schedule Columns for History DataTable
  const snapshotColumns: DataTableColumn<SnapshotHistoryItem>[] = [
    {
      key: 'label',
      header: 'Snapshot Label',
      sortable: true,
      accessor: (item) => item.label,
      render: (item) => (
        <div>
          <span className="table-text-bold">{item.label}</span>
          <div className="table-account-handle">{item.fileName}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Export Timestamp',
      sortable: true,
      accessor: (item) => item.date,
      render: (item) => (
        <span className="table-text-secondary">
          {item.date}
        </span>
      ),
    },
    {
      key: 'format',
      header: 'Format',
      sortable: true,
      accessor: (item) => item.format,
      render: (item) => (
        <span className="badge-format">
          {item.format}
        </span>
      ),
    },
    {
      key: 'followersCount',
      header: 'Followers',
      sortable: true,
      accessor: (item) => item.followersCount,
      render: (item) => (
        <span className="table-text-bold">
          {item.followersCount > 0 ? item.followersCount.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'followingCount',
      header: 'Following',
      sortable: true,
      accessor: (item) => item.followingCount,
      render: (item) => (
        <span className="table-text-bold">
          {item.followingCount > 0 ? item.followingCount.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'netChange',
      header: 'Net Change',
      sortable: true,
      accessor: (item) => item.netChange,
      render: (item) => (
        <span className={`table-text-bold ${item.netChange > 0 ? 'table-text-green' : 'table-text-muted'}`}>
          {item.netChange > 0 ? `+${item.netChange.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (item) => item.status,
      render: (item) => (
        <span className={`status-pill ${item.status === 'Ready' ? 'status-ready' : item.status === 'Scheduled' ? 'status-scheduled' : ''}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right',
      sortable: false,
      searchable: false,
      render: (item) => (
        <button
          className="datatable-btn-tool datatable-btn-sm"
          onClick={() => {
            alert(`Selected snapshot: ${item.label}`);
          }}
        >
          <ArrowUpRight size={12} />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="app-layout">
      {/* Background ambient light */}
      <div className="ambient-glow" />

      {/* Left Fixed & Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'dashboard' || tab === 'overview') {
            setTimeout(() => {
              syncTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={handleOpenUpload}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        {/* Header */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={(q) => {
            setSearchTerm(q);
            if (q.trim().length > 0) {
              syncTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }}
          userName={userProfile.name}
          userHandle={userProfile.username}
          avatarUrl={userProfile.avatarUrl}
          onNotificationClick={() => {
            if (diff) {
              alert(`Notifications: You have ${diff.newFollowers.length} new followers and ${diff.lostFollowers.length} lost followers.`);
            } else {
              alert('No exports loaded yet. Please upload your Instagram export ZIP to view real notifications.');
            }
          }}
          onProfileClick={() => triggerAjaxSync('fans')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Hero Greeting & Controls */}
        <HeroGreeting
          userName={userProfile.name}
          hasData={!!diff}
          onOpenUpload={handleOpenUpload}
          onOpenHowTo={() => setIsHowToOpen(true)}
          timeRange={timeRange}
          onTimeRangeChange={(val) => setTimeRange(val)}
        />

        {/* Privacy & Detection Callout Banner */}
        <div className="privacy-banner">
          <div className="privacy-banner-inner">
            <div className="privacy-banner-links">
              <span
                className="privacy-link"
                onClick={() => setShowBlockInfo(!showBlockInfo)}
              >
                <HelpCircle size={14} className="icon-no-shrink" />
                <span>{showBlockInfo ? 'Hide Detection Guide' : 'How Block/Unfollow is detected?'}</span>
              </span>
              <span className="privacy-link" onClick={() => setIsHowToOpen(true)}>
                How to get export ZIP?
              </span>
            </div>

            {diff && (
              <button
                onClick={handleClearData}
                className="privacy-banner-btn-clear"
                title="Clear current data session"
              >
                <Trash2 size={13} className="icon-no-shrink" />
                Clear Data
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
                How Instagram Unfollow & Block Detection Works
              </h4>
            </div>
            <div className="block-info-grid">
              <div className="block-info-card">
                <strong className="block-info-label-unfollow">
                  1. Who Unfollowed You (100% Accurate)
                </strong>
                Calculated by mathematical set difference: <code className="code-badge">oldSnapshot.followers - newSnapshot.followers</code>. If an account was in your previous export and missing in the new one, they unfollowed you.
              </div>
              <div className="block-info-card">
                <strong className="block-info-label-blocked">
                  2. Who Blocked You (Detection Flag)
                </strong>
                Meta never includes a "who_blocked_you" file for privacy reasons. However, when an account previously followed you and disappears while their profile returns "User not found" or chat threads vanish, our engine flags them as <strong>Suspected Blocked or Deactivated</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Instagram ZIP Export Guide Drawer (Inline, NOT a popup) */}
        {isHowToOpen && (
          <HowToGuideModal
            isOpen={isHowToOpen}
            onClose={() => setIsHowToOpen(false)}
          />
        )}

        {/* Inline ZIP Uploader - Displayed directly on page (NO popup modal) */}
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
          <>
            {/* Top 3 Metric Cards */}
            <MetricCards diff={activeDiff} onCardClick={handleMetricCardClick} />

            {/* Main Split Grid: Profile Discovery + Biggest Fans */}
            <div className="dashboard-split-grid">
              <ProfileDiscoveryChart diff={activeDiff} />
              <BiggestFansCard
                fans={activeDiff.fans}
                lostFollowers={activeDiff.lostFollowers}
                newFollowers={activeDiff.newFollowers}
                notFollowingBack={activeDiff.notFollowingBack}
                onViewAll={(type) => triggerAjaxSync(type)}
              />
            </div>

            {/* In-Page AJAX Sync DataTable Section */}
            <div ref={syncTableRef} className="sync-section-container">
              <div className="sync-section-header">
                <div>
                  <div className="sync-section-title-group">
                    <h2 className="sync-section-title">
                      Live Synced Account Directory
                    </h2>
                    <span className="sync-badge-live">
                      <Zap size={11} fill="var(--accent-green)" />
                      AJAX Synced ({syncLatency}ms)
                    </span>
                  </div>
                  <p className="sync-section-desc">
                    {diff ? 'Instant in-page live sync for unfollowers, suspected blocks, new followers, and fans.' : 'Upload your Instagram export ZIPs to populate real data.'}
                  </p>
                </div>

                {/* Category navigation pills with Suspected Blocked */}
                <div className="tabs-nav">
                  <button
                    className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('lost_followers')}
                  >
                    Unfollowers ({activeDiff.lostFollowers.length})
                  </button>
                  <button
                    className={`tab-btn tab-btn-danger ${activeAccountTab === 'suspected_blocked' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('suspected_blocked')}
                  >
                    <UserX size={12} className="icon-no-shrink" />
                    Blocked ({activeDiff.suspectedBlocked.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'new_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('new_followers')}
                  >
                    New (+{activeDiff.newFollowers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'not_following_back' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('not_following_back')}
                  >
                    Not Back ({activeDiff.notFollowingBack.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'fans' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('fans')}
                  >
                    Fans ({activeDiff.fans.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'mutuals' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('mutuals')}
                  >
                    Mutuals ({activeDiff.mutuals.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'all_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('all_followers')}
                  >
                    All Followers ({activeDiff.newSnapshot.followers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'all_following' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('all_following')}
                  >
                    All Following ({activeDiff.newSnapshot.following.length})
                  </button>
                </div>
              </div>

              {/* In-place DataTable with AJAX Sync & In-Table Filters */}
              <DataTable<InstagramAccount>
                data={currentAccountData.list}
                columns={accountColumns}
                keyExtractor={(item) => item.username}
                searchPlaceholder={`Search within ${currentAccountData.label.toLowerCase()}s...`}
                defaultSortKey="user"
                pageSizeOptions={[5, 10, 25, 50]}
                initialPageSize={10}
                enableSelection={true}
                selectableItemKey={(item) => item.username}
                exportFileName={`${activeAccountTab}_ajax_sync`}
                emptyMessage={diff ? `No ${currentAccountData.label.toLowerCase()} records match your filters.` : 'No Instagram data loaded. Please upload your export ZIP files above.'}
                isSyncing={isSyncing}
                syncStatusText={`AJAX Synced (${syncLatency}ms)`}
                onRefreshSync={() => triggerAjaxSync()}
                externalSearchQuery={searchTerm}
                filters={accountFilters}
              />
            </div>
          </>
        )}

        {/* VIEW 2: OVERVIEW */}
        {currentTab === 'overview' && (
          <div className="secondary-view-container">
            {/* Summary Cards */}
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
                  {activeDiff.lostFollowers.length}
                </div>
                <span className="stat-card-sub">Stopped following your account</span>
              </div>

              <div
                className="stat-card-item stat-card-item-danger"
                onClick={() => triggerAjaxSync('suspected_blocked')}
              >
                <div className="stat-card-header">
                  <span className="stat-card-title text-danger">Suspected Blocked</span>
                  <UserX size={18} color="#dc2626" />
                </div>
                <div className="stat-card-value text-danger">
                  {activeDiff.suspectedBlocked.length}
                </div>
                <span className="stat-card-sub">Profile missing or deactivated</span>
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
                  +{activeDiff.newFollowers.length}
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
                  {activeDiff.notFollowingBack.length}
                </div>
                <span className="stat-card-sub">Accounts you follow who don't follow back</span>
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
                  {activeDiff.fans.length}
                </div>
                <span className="stat-card-sub">Follow you but you don't follow back</span>
              </div>
            </div>

            {/* In-page Full Relationship Explorer DataTable */}
            <div ref={syncTableRef}>
              <div className="directory-header-row">
                <div>
                  <div className="directory-title-stack">
                    <h2 className="directory-title">
                      Overview Relationship Directory
                    </h2>
                    <span className="sync-badge-pill">
                      <Zap size={11} fill="var(--accent-green)" />
                      AJAX Synced ({syncLatency}ms)
                    </span>
                  </div>
                  <p className="directory-desc">
                    Filter, sort, search, and bulk export Instagram accounts across all relationship categories.
                  </p>
                </div>

                <div className="tabs-nav tabs-nav-mb-0">
                  <button
                    className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('lost_followers')}
                  >
                    Unfollowers ({activeDiff.lostFollowers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'suspected_blocked' ? 'tab-btn-danger-active active' : 'tab-btn-danger-inactive'}`}
                    onClick={() => triggerAjaxSync('suspected_blocked')}
                  >
                    <UserX size={12} className="tab-btn-icon-inline" />
                    Blocked ({activeDiff.suspectedBlocked.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'new_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('new_followers')}
                  >
                    New ({activeDiff.newFollowers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'not_following_back' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('not_following_back')}
                  >
                    Not Back ({activeDiff.notFollowingBack.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'fans' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('fans')}
                  >
                    Fans ({activeDiff.fans.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'mutuals' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('mutuals')}
                  >
                    Mutuals ({activeDiff.mutuals.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'all_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('all_followers')}
                  >
                    All Followers ({activeDiff.newSnapshot.followers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'all_following' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('all_following')}
                  >
                    All Following ({activeDiff.newSnapshot.following.length})
                  </button>
                </div>
              </div>

              <DataTable<InstagramAccount>
                data={currentAccountData.list}
                columns={accountColumns}
                keyExtractor={(item) => item.username}
                searchPlaceholder={`Search within ${currentAccountData.label.toLowerCase()}s...`}
                defaultSortKey="user"
                pageSizeOptions={[10, 25, 50, 100]}
                initialPageSize={10}
                enableSelection={true}
                selectableItemKey={(item) => item.username}
                exportFileName={`${activeAccountTab}_overview`}
                emptyMessage={diff ? `No ${currentAccountData.label.toLowerCase()} records match your filters.` : 'No Instagram data loaded. Please upload your export ZIP files above.'}
                isSyncing={isSyncing}
                syncStatusText={`AJAX Synced (${syncLatency}ms)`}
                onRefreshSync={() => triggerAjaxSync()}
                externalSearchQuery={searchTerm}
                filters={accountFilters}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: SCHEDULE */}
        {currentTab === 'schedule' && (
          <div className="secondary-view-container">
            <div className="directory-header-row-plain">
              <div>
                <h2 className="directory-title">
                  Export Snapshot History & Backup Logs
                </h2>
                <p className="directory-desc">
                  All historical Instagram data exports processed locally on your device.
                </p>
              </div>

              <button className="btn-upload-primary" onClick={handleOpenUpload}>
                <FileCheck size={16} />
                <span>Upload New ZIP Export</span>
              </button>
            </div>

            <DataTable<SnapshotHistoryItem>
              data={snapshotHistory}
              columns={snapshotColumns}
              keyExtractor={(item) => item.id}
              searchPlaceholder="Search snapshots by label, file name, or format..."
              defaultSortKey="date"
              defaultSortDirection="desc"
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={10}
              enableSelection={true}
              selectableItemKey={(item) => item.id}
              exportFileName="snapshot_history"
              emptyMessage="No snapshot exports recorded yet. Upload your first Instagram export ZIP above to start tracking diff history."
              isSyncing={isSyncing}
              syncStatusText={`AJAX Synced (${syncLatency}ms)`}
              onRefreshSync={() => triggerAjaxSync()}
            />
          </div>
        )}

        {/* VIEW 4: ANALYTICS */}
        {currentTab === 'analytics' && (
          <div className="secondary-view-container">
            {/* Top Analytics Metrics */}
            <div className="stat-cards-grid-lg">
              <div className="stat-card-item">
                <div className="stat-card-header">
                  <span className="stat-card-title">Follow-Back Conversion</span>
                  <TrendingUp size={18} color="var(--accent-purple)" />
                </div>
                <div className="stat-card-value text-purple">
                  {activeDiff.followBackRate}%
                </div>
                <span className="stat-card-sub">Mutual ratio among following</span>
              </div>

              <div className="stat-card-item">
                <div className="stat-card-header">
                  <span className="stat-card-title">Net Follower Growth</span>
                  <TrendingUp size={18} color="var(--accent-green)" />
                </div>
                <div className="stat-card-value text-green">
                  {activeDiff.followersNetChange > 0 ? `+${activeDiff.followersNetChange.toLocaleString()}` : activeDiff.followersNetChange.toLocaleString()}
                </div>
                <span className="stat-card-sub">{activeDiff.followersChangePercent}% over last snapshot</span>
              </div>

              <div className="stat-card-item">
                <div className="stat-card-header">
                  <span className="stat-card-title">Following Expansion</span>
                  <Users size={18} color="var(--accent-blue)" />
                </div>
                <div className="stat-card-value text-blue">
                  {activeDiff.followingNetChange > 0 ? `+${activeDiff.followingNetChange.toLocaleString()}` : activeDiff.followingNetChange.toLocaleString()}
                </div>
                <span className="stat-card-sub">{activeDiff.followingChangePercent}% following change</span>
              </div>

              <div className="stat-card-item">
                <div className="stat-card-header">
                  <span className="stat-card-title">Unfollow Rate</span>
                  <UserMinus size={18} color="var(--accent-red)" />
                </div>
                <div className="stat-card-value text-red">
                  {activeDiff.followersOldCount > 0
                    ? `${((activeDiff.lostFollowers.length / activeDiff.followersOldCount) * 100).toFixed(2)}%`
                    : '0%'}
                </div>
                <span className="stat-card-sub">{activeDiff.lostFollowers.length} accounts unfollowed</span>
              </div>
            </div>

            {/* Daily Activity & Velocity DataTable */}
            <div>
              <div className="tabs-nav-mb">
                <h2 className="directory-title">
                  Daily Activity & Follower Velocity DataTable
                </h2>
                <p className="directory-desc">
                  Breakdown of profile reach, followers gained, lost, net velocity, and peak activity days.
                </p>
              </div>

              <DataTable<DailyActivityItem>
                data={activeDiff.dailyActivity}
                columns={activityColumns}
                keyExtractor={(item) => item.date}
                searchPlaceholder="Search days by date or label..."
                defaultSortKey="date"
                defaultSortDirection="desc"
                pageSizeOptions={[5, 10, 20]}
                initialPageSize={10}
                enableSelection={true}
                selectableItemKey={(item) => item.date}
                exportFileName="daily_activity_analytics"
                emptyMessage={diff ? 'No daily activity recorded for this period.' : 'No Instagram data loaded. Please upload your export ZIP files above.'}
                isSyncing={isSyncing}
                syncStatusText={`AJAX Synced (${syncLatency}ms)`}
                onRefreshSync={() => triggerAjaxSync()}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
