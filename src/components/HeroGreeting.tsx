import React from 'react';
import { ChevronDown, Upload, Sparkles, HelpCircle } from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface HeroGreetingProps {
  userName: string;
  isDemoMode: boolean;
  onOpenUpload: () => void;
  onToggleDemo: () => void;
  onOpenHowTo: () => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const HeroGreeting: React.FC<HeroGreetingProps> = ({
  userName,
  isDemoMode,
  onOpenUpload,
  onToggleDemo,
  onOpenHowTo,
  timeRange,
  onTimeRangeChange,
}) => {
  return (
    <section className="hero-greeting">
      <div className="greeting-text-box">
        <h1>
          Hi, {userName} <span role="img" aria-label="waving hand">👋</span>
        </h1>
        <p>Let see your social media insight</p>
      </div>

      <div className="hero-controls">
        {/* Instagram Platform Badge / Dropdown */}
        <div className="dropdown-pill" title="Platform: Instagram">
          <span className="instagram-gradient-icon">
            <InstagramIcon size={12} />
          </span>
          <span>Instagram</span>
          <ChevronDown size={14} />
        </div>

        {/* Timeframe Dropdown */}
        <div className="dropdown-pill">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              paddingRight: '6px',
            }}
          >
            <option value="30 Days">30 Days</option>
            <option value="7 Days">7 Days</option>
            <option value="90 Days">90 Days</option>
            <option value="All Time Diff">All Time Diff</option>
          </select>
          <ChevronDown size={14} />
        </div>

        {/* Demo / Real toggle */}
        <button
          className="btn-demo"
          onClick={onToggleDemo}
          title={isDemoMode ? 'Click to upload your own Instagram data' : 'Click to reset to Demo data'}
        >
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#f59e0b' }} />
          {isDemoMode ? 'Demo Data' : 'Custom Upload'}
        </button>

        {/* How-to guide button */}
        <button
          className="icon-btn"
          onClick={onOpenHowTo}
          title="How to export your Instagram data from Meta"
          aria-label="How to export your Instagram data"
        >
          <HelpCircle size={18} />
        </button>

        {/* Upload ZIP Action Button */}
        <button className="btn-upload-primary" onClick={onOpenUpload}>
          <Upload size={16} />
          <span>Upload ZIPs</span>
        </button>
      </div>
    </section>
  );
};
