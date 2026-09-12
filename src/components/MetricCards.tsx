import { TrendingUp, TrendingDown, UserMinus } from 'lucide-react';
import { DiffResult } from '../types/instagram';

interface MetricCardsProps {
  diff: DiffResult;
  onCardClick?: (metricType: 'followers' | 'following' | 'unfollowers') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ diff, onCardClick }) => {
  const formatStat = (num: number): string => {
    return num.toLocaleString();
  };

  const isFollowerGrowth = diff.followersNetChange >= 0;
  const isFollowingGrowth = diff.followingNetChange >= 0;

  const unfollowRate =
    diff.followersOldCount > 0
      ? ((diff.lostFollowers.length / diff.followersOldCount) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="metric-cards-grid">
      {/* 1. Total Followers Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('followers')}
        title="Click to inspect all followers"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Total Followers</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value">{formatStat(diff.followersNewCount)}</span>
          <span
            className={`pill-badge ${isFollowerGrowth ? 'positive' : 'negative'}`}
          >
            {isFollowerGrowth ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>
              {isFollowerGrowth ? '+' : ''}
              {diff.followersChangePercent}%
            </span>
          </span>
        </div>

        <div className="metric-subtitle">
          {isFollowerGrowth
            ? `+${diff.followersNetChange.toLocaleString()} net followers gained`
            : `${diff.followersNetChange.toLocaleString()} net follower change`}
        </div>

        {/* SVG Sparkline: Cyan-Sky Blue Gradient Wave */}
        <div className="metric-sparkline-wrap">
          <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 55 Q 40 50, 70 42 T 130 25 T 170 12 T 200 4 L 200 60 L 0 60 Z"
              fill="url(#blueSpark)"
            />
            <path
              d="M 0 55 Q 40 50, 70 42 T 130 25 T 170 12 T 200 4"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Total Following Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('following')}
        title="Click to inspect all following"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Total Following</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value">{formatStat(diff.followingNewCount)}</span>
          <span className={`pill-badge ${isFollowingGrowth ? 'positive' : 'negative'}`}>
            {isFollowingGrowth ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>
              {isFollowingGrowth ? '+' : ''}
              {diff.followingChangePercent}%
            </span>
          </span>
        </div>

        <div className="metric-subtitle">
          {diff.followBackRate}% mutual follow-back rate
        </div>

        {/* SVG Sparkline: Violet-Purple Gradient Wave */}
        <div className="metric-sparkline-wrap">
          <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 50 Q 50 48, 90 38 T 140 18 T 180 12 T 200 14 L 200 60 L 0 60 Z"
              fill="url(#purpleSpark)"
            />
            <path
              d="M 0 50 Q 50 48, 90 38 T 140 18 T 180 12 T 200 14"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Lost Followers Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('unfollowers')}
        title="Click to inspect lost followers"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Lost Followers (Unfollowed)</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value text-red">
            {formatStat(diff.lostFollowers.length)}
          </span>
          <span className="pill-badge negative">
            <UserMinus size={12} />
            <span>{unfollowRate}%</span>
          </span>
        </div>

        <div className="metric-subtitle">
          {diff.lostFollowers.length} accounts stopped following you
        </div>

        {/* SVG Sparkline: Magenta-Hot Pink Gradient Wave */}
        <div className="metric-sparkline-wrap">
          <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pinkSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f85" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f43f85" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 52 Q 40 50, 80 44 T 130 30 T 170 12 T 200 10 L 200 60 L 0 60 Z"
              fill="url(#pinkSpark)"
            />
            <path
              d="M 0 52 Q 40 50, 80 44 T 130 30 T 170 12 T 200 10"
              fill="none"
              stroke="#f43f85"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
