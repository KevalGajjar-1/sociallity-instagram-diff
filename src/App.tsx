import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroGreeting } from './components/HeroGreeting';
import { MetricCards } from './components/MetricCards';
import { ProfileDiscoveryChart } from './components/ProfileDiscoveryChart';
import { BiggestFansCard } from './components/BiggestFansCard';
import { UploadModal } from './components/UploadModal';
import { AccountTableModal } from './components/AccountTableModal';
import { HowToGuideModal } from './components/HowToGuideModal';
import { mockDefaultDiff, currentUser } from './data/mockData';
import { DiffResult, FilterListType, ViewTab } from './types/instagram';
import { ShieldCheck, Users, UserMinus, UserCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data state: default is high-fidelity demo matching screenshot
  const [diff, setDiff] = useState<DiffResult>(mockDefaultDiff);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('30 Days');

  // Modal & Mobile Navigation states
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);
  const [tableFilter, setTableFilter] = useState<FilterListType>('fans');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const handleOpenTableWithFilter = (filter: FilterListType) => {
    setTableFilter(filter);
    setIsTableOpen(true);
  };

  const handleMetricCardClick = (type: 'followers' | 'following' | 'unfollowers') => {
    if (type === 'followers') {
      handleOpenTableWithFilter('all_followers');
    } else if (type === 'following') {
      handleOpenTableWithFilter('all_following');
    } else {
      handleOpenTableWithFilter('lost_followers');
    }
  };

  const handleCustomDiff = (newDiff: DiffResult) => {
    setDiff(newDiff);
    setIsDemoMode(false);
  };

  const handleResetToDemo = () => {
    setDiff(mockDefaultDiff);
    setIsDemoMode(true);
  };

  return (
    <div className="app-layout">
      {/* Background ambient light */}
      <div className="ambient-glow" />

      {/* Left Fixed & Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => alert('Settings & Account preferences')}
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
            if (q.trim().length > 1) {
              setTableFilter('all_followers');
              setIsTableOpen(true);
            }
          }}
          userName={currentUser.name}
          userHandle={currentUser.username}
          avatarUrl={currentUser.avatarUrl}
          onNotificationClick={() => {
            alert(`Notifications: You have ${diff.newFollowers.length} new followers and ${diff.lostFollowers.length} lost followers.`);
          }}
          onProfileClick={() => handleOpenTableWithFilter('fans')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Hero Greeting & Controls */}
        <HeroGreeting
          userName={currentUser.name}
          isDemoMode={isDemoMode}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleDemo={isDemoMode ? () => setIsUploadOpen(true) : handleResetToDemo}
          onOpenHowTo={() => setIsHowToOpen(true)}
          timeRange={timeRange}
          onTimeRangeChange={(val) => setTimeRange(val)}
        />

        {/* Privacy Callout Banner */}
        <div className="privacy-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="var(--accent-purple)" />
            <span>
              <strong>Private & Local:</strong> Your Instagram data export is parsed directly in your browser memory and never uploaded to any server.
            </span>
          </div>
          <div>
            <span className="privacy-link" onClick={() => setIsHowToOpen(true)}>
              How to get export ZIP?
            </span>
          </div>
        </div>

        {currentTab === 'dashboard' ? (
          <>
            {/* Top 3 Metric Cards */}
            <MetricCards diff={diff} onCardClick={handleMetricCardClick} />

            {/* Main Split Grid: Profile Discovery + Biggest Fans */}
            <div className="dashboard-split-grid">
              {/* Left Column: Profile Discovery Chart */}
              <ProfileDiscoveryChart diff={diff} />

              {/* Right Column: Biggest Fans Widget */}
              <BiggestFansCard
                fans={diff.fans}
                lostFollowers={diff.lostFollowers}
                newFollowers={diff.newFollowers}
                notFollowingBack={diff.notFollowingBack}
                onViewAll={handleOpenTableWithFilter}
              />
            </div>
          </>
        ) : (
          /* Secondary Views (Overview, Analytics, Schedule) */
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '8px' }}>
              {currentTab.toUpperCase()} & DIFF INSIGHTS
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Comprehensive relationship breakdown between your Instagram snapshots
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '18px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenTableWithFilter('lost_followers')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lost Followers (Unfollowers)</span>
                  <UserMinus size={18} color="var(--accent-red)" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                  {diff.lostFollowers.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Accounts that stopped following you</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '18px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenTableWithFilter('new_followers')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>New Followers</span>
                  <UserCheck size={18} color="var(--accent-green)" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  +{diff.newFollowers.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Recent new followers</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '18px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenTableWithFilter('not_following_back')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Not Following Back</span>
                  <Users size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
                  {diff.notFollowingBack.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>You follow them, they don’t follow back</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '18px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenTableWithFilter('mutuals')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mutual Connections</span>
                  <Users size={18} color="var(--accent-purple)" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                  {diff.mutuals.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Follow-back rate: {diff.followBackRate}%</span>
              </div>
            </div>

            <button className="btn-upload-primary" onClick={() => handleOpenTableWithFilter('lost_followers')}>
              Open Full Account Table & CSV Export
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDiffCalculated={handleCustomDiff}
      />

      <AccountTableModal
        isOpen={isTableOpen}
        onClose={() => setIsTableOpen(false)}
        diff={diff}
        initialFilter={tableFilter}
      />

      <HowToGuideModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />
    </div>
  );
};
