import React, { useState } from 'react';
import { TrendingDown, ChevronDown } from 'lucide-react';
import { DiffResult } from '../types/instagram';

interface ProfileDiscoveryChartProps {
  diff: DiffResult;
}

export const ProfileDiscoveryChart: React.FC<ProfileDiscoveryChartProps> = ({ diff }) => {
  // Default selected bar is index 4 ('Dec 4') matching the mockup screenshot
  const [selectedIdx, setSelectedIdx] = useState<number>(4);

  const maxVal = 20000;
  const yLabels = ['20k', '15k', '10k', '5k', '1k', '0'];

  return (
    <div className="discovery-card">
      {/* Header */}
      <div className="discovery-header">
        <div className="discovery-title-group">
          <h2 className="discovery-title">Profile Discovery</h2>
          <span className="pill-badge negative">
            <TrendingDown size={12} />
            <span>28.49%</span>
            <span className="pill-badge-sub">
              From last month
            </span>
          </span>
        </div>

        <div className="chart-header-actions">
          <div className="dropdown-pill dropdown-pill-sm">
            <span>30 Days</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas Area */}
      <div className="discovery-chart-container">
        {/* Y Axis */}
        <div className="chart-y-axis">
          {yLabels.map((lbl) => (
            <span key={lbl}>{lbl}</span>
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
          {diff.dailyActivity.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const heightPercent = Math.max(8, Math.min(95, (item.discovery / maxVal) * 100));
            const formattedVal = `${(item.discovery / 1000).toFixed(1).replace('.0', '')}K`;

            return (
              <div
                key={item.label}
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
                  title={`${item.label}: ${item.discovery.toLocaleString()} views`}
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
