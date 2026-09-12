import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Heart,
  UserCheck,
  Moon,
  Sun,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ViewTab } from '../types/instagram';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  unfollowersCount?: number;
  blockedCount?: number;
  likesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  isOpenMobile = false,
  onCloseMobile,
  unfollowersCount = 0,
  blockedCount = 0,
  likesCount = 0,
}) => {
  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isOpenMobile ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Fixed Sidebar */}
      <aside
        className={`sidebar ${isOpenMobile ? 'open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-purple)" />
              Sociality
            </span>
          </div>

          {/* Mobile close button */}
          <button
            className="sidebar-close-mobile-btn"
            onClick={onCloseMobile}
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>

          {/* Desktop icon */}
          <div className="sidebar-desktop-icon" title="Sociality Workspace">
            <Layers size={18} />
          </div>
        </div>

        {/* Intelligence Navigation */}
        <div className="sidebar-section-title">Analytics & Diffs</div>
        <nav className="sidebar-nav-group">
          <button
            className={`sidebar-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'relationships' || currentTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('relationships')}
          >
            <Users size={18} />
            <span>Relationships</span>
            {unfollowersCount > 0 && (
              <span className="sidebar-badge text-red" style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }}>
                -{unfollowersCount}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'connections' ? 'active' : ''}`}
            onClick={() => handleNavClick('connections')}
          >
            <ShieldAlert size={18} />
            <span>Connections & Privacy</span>
            {blockedCount > 0 && (
              <span className="sidebar-badge" style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontWeight: 600 }}>
                {blockedCount}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleNavClick('activity')}
          >
            <Heart size={18} />
            <span>Activity & Content</span>
            {likesCount > 0 && (
              <span className="sidebar-badge" style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }}>
                {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Account & Data Vault */}
        <div className="sidebar-section-title">Data Management</div>
        <nav className="sidebar-nav-group">
          <button
            className={`sidebar-nav-item ${currentTab === 'profile_vault' || currentTab === 'schedule' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile_vault')}
          >
            <UserCheck size={18} />
            <span>Profile & Vault</span>
          </button>
        </nav>

        {/* Footer: Dark Mode Toggle */}
        <div className="sidebar-footer">
          <label className="dark-mode-toggle" htmlFor="dark-mode-switch">
            <span className="dark-mode-label">
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              Dark Mode
            </span>
            <span className="switch">
              <input
                id="dark-mode-switch"
                type="checkbox"
                checked={isDarkMode}
                onChange={onToggleDarkMode}
                aria-label="Toggle Dark Mode"
              />
              <span className="slider"></span>
            </span>
          </label>
        </div>
      </aside>
    </>
  );
};
