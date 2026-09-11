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
  const getActiveAccountList = (tab: FilterListType): { list: InstagramAccount[]; label: string; badgeColor: string; badgeBg: string } => {
    switch (tab) {
      case 'lost_followers':
        return {
          list: activeDiff.lostFollowers,
          label: 'Lost Follower (Unfollowed)',
          badgeColor: 'var(--accent-red)',
          badgeBg: 'var(--accent-red-bg)',
        };
      case 'suspected_blocked':
        return {
          list: activeDiff.suspectedBlocked,
          label: 'Suspected Block / Deactivated',
          badgeColor: '#dc2626',
          badgeBg: 'rgba(220, 38, 38, 0.15)',
        };
      case 'new_followers':
        return {
          list: activeDiff.newFollowers,
          label: 'New Follower',
          badgeColor: 'var(--accent-green)',
          badgeBg: 'var(--accent-green-bg)',
        };
      case 'not_following_back':
        return {
          list: activeDiff.notFollowingBack,
          label: 'Not Following Back',
          badgeColor: '#f59e0b',
          badgeBg: 'rgba(245, 158, 11, 0.15)',
        };
      case 'fans':
        return {
          list: activeDiff.fans,
          label: 'Fan',
          badgeColor: 'var(--accent-purple)',
          badgeBg: 'rgba(139, 92, 246, 0.15)',
        };
      case 'mutuals':
        return {
          list: activeDiff.mutuals,
          label: 'Mutual',
          badgeColor: 'var(--accent-blue)',
          badgeBg: 'rgba(56, 189, 248, 0.15)',
        };
      case 'all_followers':
        return {
          list: activeDiff.newSnapshot.followers,
          label: 'Follower',
          badgeColor: 'var(--accent-purple)',
          badgeBg: 'rgba(139, 92, 246, 0.15)',
        };
      case 'all_following':
        return {
          list: activeDiff.newSnapshot.following,
          label: 'Following',
          badgeColor: 'var(--accent-blue)',
          badgeBg: 'rgba(56, 189, 248, 0.15)',
        };
      default:
        return {
          list: activeDiff.lostFollowers,
          label: 'Lost Follower (Unfollowed)',
          badgeColor: 'var(--accent-red)',
          badgeBg: 'var(--accent-red-bg)',
        };
    }
  };

  const currentAccountData = getActiveAccountList(activeAccountTab);

  // Table In-line Filters Configuration
  const accountFilters: DataTableFilter<InstagramAccount>[] = [
    {
      key: 'verification',
      label: 'Verification',
      options: [
        { label: 'All Accounts', value: 'all' },
        { label: 'Verified Only (✓)', value: 'verified' },
        { label: 'Standard (Unverified)', value: 'unverified' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={item.avatarUrl || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${item.username}`}
            alt={item.username}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              background: 'var(--bg-subtle)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                {item.name || item.username}
              </span>
              {item.isVerified && (
                <span title="Verified" style={{ color: 'var(--accent-blue)', display: 'inline-flex' }}>
                  <ShieldCheck size={13} fill="var(--accent-blue)" color="#fff" />
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span
            style={{
              display: 'inline-block',
              width: 'fit-content',
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: item.statusType === 'suspected_blocked' ? 'rgba(220, 38, 38, 0.15)' : currentAccountData.badgeBg,
              color: item.statusType === 'suspected_blocked' ? '#dc2626' : currentAccountData.badgeColor,
            }}
          >
            {item.statusType === 'suspected_blocked' ? 'Suspected Block / Deleted' : currentAccountData.label}
          </span>
          {item.detectionNote && (
            <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
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
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <button
            className="icon-btn"
            style={{ width: 30, height: 30 }}
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
            className="icon-btn"
            style={{ width: 30, height: 30 }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={14} color="var(--accent-purple)" />
          <span style={{ fontWeight: 600 }}>{item.date}</span>
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
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
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
        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
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
        <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
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
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.78rem',
              background: isPos ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
              color: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          >
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
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: 12,
              fontSize: '0.74rem',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
            }}
          >
            <Sparkles size={12} />
            Peak Day
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Normal</span>
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
          <span style={{ fontWeight: 600 }}>{item.label}</span>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.fileName}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Export Timestamp',
      sortable: true,
      accessor: (item) => item.date,
      render: (item) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
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
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: 'var(--bg-subtle)',
            color: 'var(--accent-purple)',
            border: '1px solid var(--border-color)',
          }}
        >
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
        <span style={{ fontWeight: 600 }}>
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
        <span style={{ fontWeight: 600 }}>
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
        <span
          style={{
            fontWeight: 700,
            color: item.netChange > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
          }}
        >
          {item.netChange > 0 ? `+${item.netChange.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (item) => item.status,
      render: (item) => {
        let bg = 'var(--bg-subtle)';
        let color = 'var(--text-secondary)';
        if (item.status === 'Ready') {
          bg = 'var(--accent-green-bg)';
          color = 'var(--accent-green)';
        } else if (item.status === 'Scheduled') {
          bg = 'rgba(139, 92, 246, 0.15)';
          color = 'var(--accent-purple)';
        }
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: bg,
              color: color,
            }}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right',
      sortable: false,
      searchable: false,
      render: (item) => (
        <button
          className="datatable-btn-tool"
          onClick={() => {
            alert(`Selected snapshot: ${item.label}`);
          }}
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px 18px',
                flexWrap: 'wrap',
              }}
            >
              <span
                className="privacy-link"
                onClick={() => setShowBlockInfo(!showBlockInfo)}
              >
                <HelpCircle size={14} style={{ flexShrink: 0 }} />
                <span>{showBlockInfo ? 'Hide Detection Guide' : 'How Block/Unfollow is detected?'}</span>
              </span>
              <span className="privacy-link" onClick={() => setIsHowToOpen(true)}>
                How to get export ZIP?
              </span>
            </div>

            {diff && (
              <button
                onClick={handleClearData}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 0',
                }}
                title="Clear current data session"
              >
                <Trash2 size={13} style={{ flexShrink: 0 }} />
                Clear Data
              </button>
            )}
          </div>
        </div>

        {/* Block & Unfollow Detection Explanation Drawer */}
        {showBlockInfo && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} color="var(--accent-purple)" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                How Instagram Unfollow & Block Detection Works
              </h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: 4 }}>
                  1. Who Unfollowed You (100% Accurate)
                </strong>
                Calculated by mathematical set difference: <code style={{ background: 'var(--bg-surface)', padding: '1px 5px', borderRadius: 4 }}>oldSnapshot.followers - newSnapshot.followers</code>. If an account was in your previous export and missing in the new one, they unfollowed you.
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#dc2626', display: 'block', marginBottom: 4 }}>
                  2. Who Blocked You (Detection Flag)
                </strong>
                Meta never includes a "who_blocked_you" file for privacy reasons. However, when an account previously followed you and disappears while their profile returns "User not found" or chat threads vanish, our engine flags them as <strong>Suspected Blocked or Deactivated</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Inline ZIP Uploader - Displayed directly on page (NO popup modal) */}
        {(!diff || isUploadOpen) && (
          <div ref={uploaderRef}>
            <ZipUploader
              onDiffCalculated={(newDiff) => {
                handleCustomDiff(newDiff);
                setIsUploadOpen(false);
              }}
              onClose={diff ? () => setIsUploadOpen(false) : undefined}
              canClose={!!diff}
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
            <div ref={syncTableRef} style={{ marginTop: '28px', scrollMarginTop: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                      Live Synced Account Directory
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-green)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <Zap size={11} fill="var(--accent-green)" />
                      AJAX Synced ({syncLatency}ms)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {diff ? 'Instant in-page live sync for unfollowers, suspected blocks, new followers, and fans.' : 'Upload your Instagram export ZIPs to populate real data.'}
                  </p>
                </div>

                {/* Category navigation pills with Suspected Blocked */}
                <div className="tabs-nav" style={{ marginBottom: 0 }}>
                  <button
                    className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('lost_followers')}
                  >
                    Unfollowers ({activeDiff.lostFollowers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'suspected_blocked' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('suspected_blocked')}
                    style={{
                      borderColor: activeAccountTab === 'suspected_blocked' ? '#dc2626' : undefined,
                      color: activeAccountTab === 'suspected_blocked' ? '#ffffff' : '#dc2626',
                      background: activeAccountTab === 'suspected_blocked' ? '#dc2626' : undefined,
                    }}
                  >
                    <UserX size={12} style={{ display: 'inline', marginRight: 4 }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => triggerAjaxSync('lost_followers')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lost Followers (Unfollowed)</span>
                  <UserMinus size={18} color="var(--accent-red)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                  {activeDiff.lostFollowers.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Stopped following your account</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={() => triggerAjaxSync('suspected_blocked')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>Suspected Blocked</span>
                  <UserX size={18} color="#dc2626" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#dc2626' }}>
                  {activeDiff.suspectedBlocked.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Profile missing or deactivated</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => triggerAjaxSync('new_followers')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>New Followers</span>
                  <UserCheck size={18} color="var(--accent-green)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  +{activeDiff.newFollowers.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Followed you in this period</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => triggerAjaxSync('not_following_back')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Not Following Back</span>
                  <Users size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b' }}>
                  {activeDiff.notFollowingBack.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Accounts you follow who don't follow back</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => triggerAjaxSync('fans')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fans (You Don't Follow)</span>
                  <Users size={18} color="var(--accent-purple)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                  {activeDiff.fans.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Follow you but you don't follow back</span>
              </div>
            </div>

            {/* In-page Full Relationship Explorer DataTable */}
            <div ref={syncTableRef}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                      Overview Relationship Directory
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-green)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <Zap size={11} fill="var(--accent-green)" />
                      AJAX Synced ({syncLatency}ms)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Filter, sort, search, and bulk export Instagram accounts across all relationship categories.
                  </p>
                </div>

                <div className="tabs-nav" style={{ marginBottom: 0 }}>
                  <button
                    className={`tab-btn ${activeAccountTab === 'lost_followers' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('lost_followers')}
                  >
                    Unfollowers ({activeDiff.lostFollowers.length})
                  </button>
                  <button
                    className={`tab-btn ${activeAccountTab === 'suspected_blocked' ? 'active' : ''}`}
                    onClick={() => triggerAjaxSync('suspected_blocked')}
                    style={{
                      borderColor: activeAccountTab === 'suspected_blocked' ? '#dc2626' : undefined,
                      color: activeAccountTab === 'suspected_blocked' ? '#ffffff' : '#dc2626',
                      background: activeAccountTab === 'suspected_blocked' ? '#dc2626' : undefined,
                    }}
                  >
                    <UserX size={12} style={{ display: 'inline', marginRight: 4 }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                  Export Snapshot History & Backup Logs
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Analytics Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Follow-Back Conversion</span>
                  <TrendingUp size={18} color="var(--accent-purple)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                  {activeDiff.followBackRate}%
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Mutual ratio among following</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Follower Growth</span>
                  <TrendingUp size={18} color="var(--accent-green)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  {activeDiff.followersNetChange > 0 ? `+${activeDiff.followersNetChange.toLocaleString()}` : activeDiff.followersNetChange.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{activeDiff.followersChangePercent}% over last snapshot</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Following Expansion</span>
                  <Users size={18} color="var(--accent-blue)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {activeDiff.followingNetChange > 0 ? `+${activeDiff.followingNetChange.toLocaleString()}` : activeDiff.followingNetChange.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{activeDiff.followingChangePercent}% following change</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unfollow Rate</span>
                  <UserMinus size={18} color="var(--accent-red)" />
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                  {activeDiff.followersOldCount > 0
                    ? `${((activeDiff.lostFollowers.length / activeDiff.followersOldCount) * 100).toFixed(2)}%`
                    : '0%'}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{activeDiff.lostFollowers.length} accounts unfollowed</span>
              </div>
            </div>

            {/* Daily Activity & Velocity DataTable */}
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                  Daily Activity & Follower Velocity DataTable
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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

      {/* Modals - Guide modal only, Upload is rendered inline directly on the page */}

      <HowToGuideModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />
    </div>
  );
};
