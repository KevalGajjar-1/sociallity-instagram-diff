import React from 'react';
import {
  LayoutDashboard,
  LayoutGrid,
  Calendar,
  BarChart3,
  User,
  Rocket,
  Grid,
  MoreHorizontal,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  Layers,
} from 'lucide-react';
import { ViewTab } from '../types/instagram';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  isOpenMobile = false,
  onCloseMobile,
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
        {/* Brand & Toggle / Close */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Sociality</span>
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

        {/* Main Menu */}
        <div className="sidebar-section-title">Main Menu</div>
        <nav className="sidebar-nav-group">
          <button
            className={`sidebar-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            <LayoutGrid size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'schedule' ? 'active' : ''}`}
            onClick={() => handleNavClick('schedule')}
          >
            <Calendar size={18} />
            <span>Schedule</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* My Account */}
        <div className="sidebar-section-title">My Account</div>
        <div className="sidebar-nav-group">
          <button
            className="sidebar-nav-item"
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
          >
            <User size={18} />
            <span>Account</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
          >
            <Rocket size={18} />
            <span>Boosted Post</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
          >
            <Grid size={18} />
            <span>Published Post</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
          >
            <MoreHorizontal size={18} />
            <span>More</span>
          </button>
        </div>

        {/* More Options */}
        <div className="sidebar-section-title">More</div>
        <div className="sidebar-nav-group">
          <button
            className="sidebar-nav-item"
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              if (window.confirm('Reset current session and reload demo?')) {
                window.location.reload();
              }
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

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
