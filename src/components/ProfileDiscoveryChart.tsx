import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DiffResult } from '../types/instagram';

interface ProfileDiscoveryChartProps {
  diff: DiffResult;
}

export const ProfileDiscoveryChart: React.FC<ProfileDiscoveryChartProps> = ({ diff }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const activities = diff.dailyActivity.length > 0 ? diff.dailyActivity : [
    { date: 'Interval', label: 'Followers', discovery: diff.followersNewCount || 100, gained: diff.newFollowers.length, lost: diff.lostFollowers.length },
  ];

  const highestDiscovery = Math.max(...activities.map((d) => d.discovery), 10);
  const maxVal = Math.ceil(highestDiscovery * 1.2);

  const yLabels = [
    maxVal >= 1000 ? `${(maxVal / 1000).toFixed(0)}k` : `${maxVal}`,
    maxVal >= 1000 ? `${((maxVal * 0.75) / 1000).toFixed(0)}k` : `${Math.round(maxVal * 0.75)}`,
    maxVal >= 1000 ? `${((maxVal * 0.5) / 1000).toFixed(0)}k` : `${Math.round(maxVal * 0.5)}`,
    maxVal >= 1000 ? `${((maxVal * 0.25) / 1000).toFixed(0)}k` : `${Math.round(maxVal * 0.25)}`,
    '0',
  ];

  const isGrowthPositive = diff.followersNetChange >= 0;

  return (
    <div className="discovery-card">
      {/* Header */}
      <div className="discovery-header">
        <div className="discovery-title-group">
          <h2 className="discovery-title">Follower Velocity & Activity</h2>
          <span className={`pill-badge ${isGrowthPositive ? 'positive' : 'negative'}`}>
            {isGrowthPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(diff.followersChangePercent)}%</span>
            <span className="pill-badge-sub">
              {isGrowthPositive ? 'Net Growth' : 'Net Decline'}
            </span>
          </span>
        </div>

        <div className="chart-header-actions">
          <div className="dropdown-pill dropdown-pill-sm">
            <span>{activities.length} Intervals</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas Area */}
      <div className="discovery-chart-container">
        {/* Y Axis */}
        <div className="chart-y-axis">
          {yLabels.map((lbl, i) => (
            <span key={i}>{lbl}</span>
          ))}
        </div>

        {/* Horizontal dashed gridlines */}
        <div className="chart-grid-line chart-grid-top-0"></div>
        <div className="chart-grid-line chart-grid-top-25"></div>
        <div className="chart-grid-line chart-grid-top-50"></div>
        <div className="chart-grid-line chart-grid-top-75"></div>
        <div className="chart-grid-line chart-grid-top-95"></div>

        {/* Bars */}
        <div className="bars-container">
          {activities.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const heightPercent = Math.max(12, Math.min(95, (item.discovery / maxVal) * 100));
            const formattedVal =
              item.discovery >= 1000
                ? `${(item.discovery / 1000).toFixed(1)}k`
                : `${item.discovery}`;

            return (
              <div
                key={idx}
                className="bar-col"
                onClick={() => setSelectedIdx(idx)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                {/* Floating Tooltip Pill on Active Bar */}
                {isSelected && (
                  <div className="bar-tooltip-pill">
                    {formattedVal}
                  </div>
                )}

                {/* The Bar */}
                <div
                  ref={(el) => {
                    if (el) el.style.setProperty('--bar-height', `${heightPercent}%`);
                  }}
                  className={`bar-pill ${isSelected ? 'striped-active' : ''}`}
                  title={`${item.label}: ${item.discovery.toLocaleString()} points (${item.gained} gained, ${item.lost} lost)`}
                />

                {/* Label */}
                <span className="bar-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
