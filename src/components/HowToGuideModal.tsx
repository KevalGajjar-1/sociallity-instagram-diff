import React from 'react';
import { X, ExternalLink } from 'lucide-react';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">How to Download Instagram Data</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Step-by-step guide to exporting from Meta Accounts Center
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent-purple)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a
              href="https://accountscenter.instagram.com/info_and_permissions/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-demo"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <span>Go to Accounts Center</span>
              <ExternalLink size={14} />
            </a>

            <button className="btn-upload-primary" onClick={onClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
