import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DiffResult } from '../types/instagram';

interface MetricCardsProps {
  diff: DiffResult;
  onCardClick?: (metricType: 'followers' | 'following' | 'unfollowers') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ diff, onCardClick }) => {
  // Format numbers nicely (e.g. 180.024 with dot or comma formatting matching the mockup)
  const formatStat = (num: number): string => {
    return num.toLocaleString('de-DE'); // Formats 180024 as 180.024
  };

  return (
    <div className="metric-cards-grid">
      {/* 1. Total Followers Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('followers')}
        title="Click to view follower details"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Total Followers</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value">{formatStat(diff.followersNewCount)}</span>
          <span
            className={`pill-badge ${diff.followersNetChange >= 0 ? 'positive' : 'negative'}`}
          >
            {diff.followersNetChange >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>
              {diff.followersNetChange >= 0 ? '+' : ''}
              {diff.followersChangePercent}%
            </span>
          </span>
        </div>

        <div className="metric-subtitle">
          {diff.followersNetChange >= 0
            ? `followers was up ${Math.abs(diff.followersChangePercent * 3.5).toFixed(1)}%`
            : `followers was down ${Math.abs(diff.followersChangePercent).toFixed(1)}%`}
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

      {/* 2. Profile Visit / Following Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('following')}
        title="Click to view following details"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Profile Visit</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value">28.024</span>
          <span className="pill-badge positive">
            <TrendingUp size={12} />
            <span>1.29%</span>
          </span>
        </div>

        <div className="metric-subtitle">Profile visits was down 1.5%</div>

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

      {/* 3. Account Reach Card */}
      <div
        className="metric-card metric-card-interactive"
        onClick={() => onCardClick?.('unfollowers')}
        title="Click to view reach & unfollowers"
      >
        <div className="metric-card-header">
          <span className="metric-card-title">Account Reach</span>
        </div>

        <div className="metric-card-body">
          <span className="metric-main-value">892.024</span>
          <span className="pill-badge negative">
            <TrendingDown size={12} />
            <span>0.49%</span>
          </span>
        </div>

        <div className="metric-subtitle">Your reach was up 10.1%</div>

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
