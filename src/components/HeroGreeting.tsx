import React from 'react';
import { ChevronDown, Upload, HelpCircle } from 'lucide-react';

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
  hasData: boolean;
  onOpenUpload: () => void;
  onOpenHowTo: () => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const HeroGreeting: React.FC<HeroGreetingProps> = ({
  userName,
  hasData,
  onOpenUpload,
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
        <p>{hasData ? 'Real-time Instagram data diff insights' : 'Upload your Instagram export ZIPs to view real insights'}</p>
      </div>

      <div className="hero-controls">
        {/* Instagram Platform Badge */}
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
            className="dropdown-pill-select"
          >
            <option value="30 Days">30 Days</option>
            <option value="7 Days">7 Days</option>
            <option value="90 Days">90 Days</option>
            <option value="All Time Diff">All Time Diff</option>
          </select>
          <ChevronDown size={14} />
        </div>

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
          <span>{hasData ? 'Upload New ZIPs' : 'Upload Instagram ZIPs'}</span>
        </button>
      </div>
    </section>
  );
};
