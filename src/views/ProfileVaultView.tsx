import React, { useState } from 'react';
import {
  FileCheck,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  User,
  ShieldCheck,
  Lock,
  Globe,
  Mail,
  ArrowRight,
  Sparkles,
  Clock,
  Database,
  Layers,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { DiffResult, SnapshotHistoryItem } from '../types/instagram';
import { UserAvatar } from '../components/UserAvatar';
import { fixInstagramEncoding } from '../utils/instagramParser';

interface ProfileVaultViewProps {
  diff: DiffResult;
  userProfile: {
    name: string;
    username: string;
    bio: string;
    email: string;
    gender: string;
    birthday: string;
    avatarUrl: string;
  };
  snapshotHistory: SnapshotHistoryItem[];
  onOpenUpload: () => void;
  onClearData: () => void;
}

export const ProfileVaultView: React.FC<ProfileVaultViewProps> = ({
  diff,
  userProfile,
  snapshotHistory,
  onOpenUpload,
  onClearData,
}) => {
  const [copiedHandle, setCopiedHandle] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const cleanBio = fixInstagramEncoding(userProfile.bio);
  const cleanName = fixInstagramEncoding(userProfile.name);

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(`@${userProfile.username}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleCopyEmail = () => {
    if (userProfile.email) {
      navigator.clipboard.writeText(userProfile.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const isPrivate = diff.newSnapshot.profileInfo?.isPrivate ?? false;
  const netFollowers = diff.followersNetChange;
  const isPositiveGrowth = netFollowers >= 0;

  const historyColumns: DataTableColumn<SnapshotHistoryItem>[] = [
    {
      key: 'date',
      header: 'Comparison Date',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color="var(--text-muted)" />
          <span style={{ fontWeight: 600 }}>{item.date}</span>
        </div>
      ),
    },
    {
      key: 'label',
      header: 'Snapshot Comparison',
      sortable: true,
      render: (item) => (
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>
            {item.label}
          </strong>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.fileName}</span>
        </div>
      ),
    },
    {
      key: 'followers',
      header: 'Followers / Following',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {item.followersCount.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {item.followingCount.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'netChange',
      header: 'Follower Net Diff',
      sortable: true,
      render: (item) => (
        <span
          className={`badge-delta ${item.netChange >= 0 ? 'positive' : 'negative'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '3px 9px',
            borderRadius: 'var(--radius-full)',
            background: item.netChange >= 0 ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
            color: item.netChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
          }}
        >
          {item.netChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{item.netChange >= 0 ? `+${item.netChange.toLocaleString()}` : item.netChange.toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: false,
      render: (item) => (
        <span className="status-badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Check size={12} />
          <span>{item.status} ({item.format})</span>
        </span>
      ),
    },
  ];

  return (
    <div className="secondary-view-container profile-vault-container">
      {/* 1. MASTER CONNECTED USER PROFILE CARD */}
      <div className="pv-profile-card">
        <div className="pv-profile-backdrop-gradient" />

        {/* Top bar with verified badge and action buttons */}
        <div className="pv-top-actions-row">
          <div className="pv-badge-pill">
            <span className="pv-pulse-dot" />
            <span className="pv-badge-text">Connected Instagram Account</span>
          </div>

          <div className="pv-actions-group">
            <button
              className="btn-upload-primary pv-btn-upload"
              onClick={onOpenUpload}
              title="Upload new Instagram data archives"
            >
              <FileCheck size={16} />
              <span>Import New Export</span>
            </button>
            <button
              onClick={onClearData}
              className="pv-btn-clear"
              title="Clear active export session and reset cache"
            >
              <Trash2 size={15} />
              <span>Reset Session</span>
            </button>
          </div>
        </div>

        {/* Profile Main Body */}
        <div className="pv-body-layout">
          {/* Avatar with luxury gradient border ring */}
          <div className="pv-avatar-wrapper">
            <div className="pv-avatar-ring">
              <UserAvatar
                src={userProfile.avatarUrl}
                username={userProfile.username}
                size={96}
                className="pv-main-avatar"
                alt={cleanName}
              />
            </div>
            <span className="pv-verified-badge" title="Verified Instagram Export User">
              <ShieldCheck size={16} color="#ffffff" />
            </span>
          </div>

          {/* User Details */}
          <div className="pv-details-col">
            <div className="pv-name-heading-row">
              <h1 className="pv-display-name">{cleanName}</h1>
              <span className={`pv-privacy-chip ${isPrivate ? 'private' : 'public'}`}>
                {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                <span>{isPrivate ? 'Private Profile' : 'Public Profile'}</span>
              </span>
            </div>

            {/* Handle row with fast copy and direct Instagram link */}
            <div className="pv-handle-bar">
              <span className="pv-handle-text">@{userProfile.username}</span>
              <button
                className="pv-copy-btn"
                onClick={handleCopyHandle}
                title="Copy username handle"
                type="button"
              >
                {copiedHandle ? (
                  <>
                    <Check size={13} color="var(--accent-green)" />
                    <span style={{ color: 'var(--accent-green)' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`https://www.instagram.com/${userProfile.username}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="pv-insta-link"
                title="Open Instagram profile"
              >
                <span>Instagram</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Bio box */}
            {cleanBio ? (
              <div className="pv-bio-card">
                <p className="pv-bio-text">{cleanBio}</p>
              </div>
            ) : null}

            {/* Attributes Grid */}
            <div className="pv-meta-grid">
              {userProfile.email && (
                <div
                  className="pv-meta-item clickable"
                  onClick={handleCopyEmail}
                  title="Click to copy email address"
                >
                  <Mail size={15} className="pv-meta-icon" />
                  <div className="pv-meta-item-content">
                    <span className="pv-meta-label">Email</span>
                    <span className="pv-meta-value">
                      {userProfile.email}
                      {copiedEmail && (
                        <span style={{ color: 'var(--accent-green)', marginLeft: 6, fontSize: '0.72rem' }}>
                          ✓ Copied
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {userProfile.birthday && userProfile.birthday !== '—' && (
                <div className="pv-meta-item">
                  <Calendar size={15} className="pv-meta-icon" />
                  <div className="pv-meta-item-content">
                    <span className="pv-meta-label">Birthday</span>
                    <span className="pv-meta-value">{userProfile.birthday}</span>
                  </div>
                </div>
              )}

              {userProfile.gender && userProfile.gender !== 'not specified' && (
                <div className="pv-meta-item">
                  <User size={15} className="pv-meta-icon" />
                  <div className="pv-meta-item-content">
                    <span className="pv-meta-label">Gender</span>
                    <span className="pv-meta-value" style={{ textTransform: 'capitalize' }}>
                      {userProfile.gender}
                    </span>
                  </div>
                </div>
              )}

              <div className="pv-meta-item">
                <Layers size={15} className="pv-meta-icon" />
                <div className="pv-meta-item-content">
                  <span className="pv-meta-label">Audience Ratio</span>
                  <span className="pv-meta-value">
                    {diff.followingNewCount > 0
                      ? `${(diff.followersNewCount / diff.followingNewCount).toFixed(1)}:1`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SNAPSHOT COMPARISON HUB */}
      <div className="pv-section-header">
        <div className="pv-section-title-box">
          <Database size={18} className="pv-section-icon" />
          <h2 className="pv-section-title">Active Comparison Architecture</h2>
        </div>
        <p className="pv-section-desc">
          Comparing your baseline historical export against your latest export to track audience changes.
        </p>
      </div>

      <div className="pv-snapshots-grid">
        {/* Baseline Snapshot Card */}
        <div className="pv-snapshot-card baseline">
          <div className="pv-snapshot-header">
            <span className="pv-snapshot-tag baseline">
              <Clock size={12} />
              <span>Snapshot 1 • Baseline</span>
            </span>
            <span className="pv-snapshot-date">
              {diff.oldSnapshot.exportDate
                ? new Date(diff.oldSnapshot.exportDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Earlier Export'}
            </span>
          </div>

          <h3 className="pv-snapshot-name">{diff.oldSnapshot.label || 'Baseline Snapshot'}</h3>

          <div className="pv-snapshot-file-pill" title={diff.oldSnapshot.fileName}>
            <span className="pv-file-icon">📁</span>
            <span className="pv-file-text">{diff.oldSnapshot.fileName || 'Archive ZIP'}</span>
          </div>

          <div className="pv-snapshot-stats-row">
            <div className="pv-stat-box">
              <span className="pv-stat-num">{diff.followersOldCount.toLocaleString()}</span>
              <span className="pv-stat-lbl">Followers</span>
            </div>
            <div className="pv-stat-divider" />
            <div className="pv-stat-box">
              <span className="pv-stat-num">{diff.followingOldCount.toLocaleString()}</span>
              <span className="pv-stat-lbl">Following</span>
            </div>
          </div>
        </div>

        {/* Center Comparison Arrow & Differential Badge */}
        <div className="pv-snapshots-center-badge">
          <div className="pv-center-line" />
          <div
            className={`pv-center-pill ${isPositiveGrowth ? 'positive' : 'negative'}`}
            title="Follower net change between baseline and active export"
          >
            {isPositiveGrowth ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="pv-center-value">
              {isPositiveGrowth ? `+${netFollowers.toLocaleString()}` : netFollowers.toLocaleString()}
            </span>
            <span className="pv-center-sub">Net Change</span>
          </div>
          <div className="pv-center-line" />
        </div>

        {/* Target Snapshot Card */}
        <div className="pv-snapshot-card active">
          <div className="pv-snapshot-header">
            <span className="pv-snapshot-tag active">
              <Sparkles size={12} />
              <span>Snapshot 2 • Target (Live)</span>
            </span>
            <span className="pv-snapshot-date">
              {diff.newSnapshot.exportDate
                ? new Date(diff.newSnapshot.exportDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent Export'}
            </span>
          </div>

          <h3 className="pv-snapshot-name">{diff.newSnapshot.label || 'Active Snapshot'}</h3>

          <div className="pv-snapshot-file-pill" title={diff.newSnapshot.fileName}>
            <span className="pv-file-icon">📁</span>
            <span className="pv-file-text">{diff.newSnapshot.fileName || 'Archive ZIP'}</span>
          </div>

          <div className="pv-snapshot-stats-row">
            <div className="pv-stat-box">
              <span className="pv-stat-num highlighted">{diff.followersNewCount.toLocaleString()}</span>
              <span className="pv-stat-lbl">Followers</span>
            </div>
            <div className="pv-stat-divider" />
            <div className="pv-stat-box">
              <span className="pv-stat-num">{diff.followingNewCount.toLocaleString()}</span>
              <span className="pv-stat-lbl">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HISTORICAL SNAPSHOTS LOG TABLE */}
      <div className="pv-history-section">
        <div className="directory-header-row-plain" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="directory-title">Export Snapshot History & Backup Logs</h2>
              <span
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {snapshotHistory.length} Recorded
              </span>
            </div>
            <p className="directory-desc">
              Chronological log of all Instagram data exports processed and verified locally on this browser.
            </p>
          </div>
        </div>

        <DataTable<SnapshotHistoryItem>
          data={snapshotHistory}
          columns={historyColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search snapshot comparisons by label, file, or date..."
          defaultSortKey="date"
          defaultSortDirection="desc"
          pageSizeOptions={[5, 10, 20]}
          initialPageSize={10}
          exportFileName="instagram_snapshot_history"
          emptyMessage="No snapshot history recorded yet. Compare your export ZIPs to start tracking diff history."
        />
      </div>
    </div>
  );
};
