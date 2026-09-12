import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userName: string;
  userHandle: string;
  avatarUrl: string;
  onNotificationClick: () => void;
  onProfileClick: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  userName,
  userHandle,
  avatarUrl,
  onNotificationClick,
  onProfileClick,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="top-header">
      <div className="header-left">
        {/* Mobile Hamburger Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        {/* Search Input Box */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search accounts or data..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search accounts or data"
          />
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="header-right">
        {/* Notifications */}
        <button
          className="icon-btn"
          onClick={onNotificationClick}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="icon-badge-dot"></span>
        </button>

        {/* User Profile Chip */}
        <div className="user-profile-chip" onClick={onProfileClick} role="button" tabIndex={0}>
          <UserAvatar src={avatarUrl} username={userHandle} size={36} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-handle">{userHandle.startsWith('@') ? userHandle : `@${userHandle}`}</span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
};
