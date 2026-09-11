import React from 'react';
import { X, ExternalLink, HelpCircle } from 'lucide-react';

interface HowToGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToGuideModal: React.FC<HowToGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Open Meta Accounts Center',
      desc: 'Open Instagram on your phone or web browser, go to Settings & Privacy, then select Accounts Center.',
    },
    {
      title: '2. Your Information and Permissions',
      desc: 'Under Account Settings, click "Your information and permissions", then select "Download your information".',
    },
    {
      title: '3. Choose Data Type',
      desc: 'Choose "Some of your information", and check the box for "Followers and following" (this makes the download much faster and smaller).',
    },
    {
      title: '4. Format & Delivery',
      desc: 'Choose "Download to device". Select Format: JSON (recommended) or HTML, and Date range: "All time".',
    },
    {
      title: '5. Download ZIP & Compare',
      desc: 'Meta will email you when your archive is ready. Download the ZIP and drop it directly into Sociality!',
    },
  ];

  return (
    <div className="guide-drawer-card">
      <div className="guide-drawer-header">
        <div>
          <div className="directory-title-stack">
            <HelpCircle size={18} color="var(--accent-purple)" />
            <h2 className="modal-title">How to Download Instagram Data</h2>
          </div>
          <p className="guide-subtitle">
            Step-by-step guide to exporting from Meta Accounts Center
          </p>
        </div>
        <button
          className="zip-uploader-close-btn"
          onClick={onClose}
          type="button"
          title="Dismiss Guide"
        >
          <X size={16} />
          <span>Dismiss</span>
        </button>
      </div>

      <div className="guide-steps-list">
        {steps.map((step, idx) => (
          <div key={idx} className="guide-step-card">
            <div className="guide-step-number">
              {idx + 1}
            </div>
            <div>
              <h4 className="guide-step-title">
                {step.title}
              </h4>
              <p className="guide-step-desc">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="guide-footer-actions">
        <a
          href="https://accountscenter.instagram.com/info_and_permissions/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-demo guide-external-btn"
        >
          <span>Go to Accounts Center</span>
          <ExternalLink size={14} />
        </a>

        <button className="btn-upload-primary" onClick={onClose} type="button">
          Got It
        </button>
      </div>
    </div>
  );
};
