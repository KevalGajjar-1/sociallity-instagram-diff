import React, { useState, useRef } from 'react';
import { X, FileArchive, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseInstagramExportZip } from '../utils/instagramParser';
import { computeDiff, computeSingleSnapshotInsights } from '../utils/diffEngine';
import { DiffResult } from '../types/instagram';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiffCalculated: (diff: DiffResult) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDiffCalculated,
}) => {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'compare' | 'single'>('compare');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const oldInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcess = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'compare') {
        if (!oldFile || !newFile) {
          setErrorMsg('Please select both Old Export ZIP and New Export ZIP to compare.');
          setIsLoading(false);
          return;
        }

        const oldSnapshot = await parseInstagramExportZip(oldFile, 'Old Export');
        const newSnapshot = await parseInstagramExportZip(newFile, 'New Export');

        const diff = computeDiff(oldSnapshot, newSnapshot);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onDiffCalculated(diff);
        onClose();
      } else {
        if (!singleFile) {
          setErrorMsg('Please select an Instagram export ZIP archive.');
          setIsLoading(false);
          return;
        }

        const snapshot = await parseInstagramExportZip(singleFile, 'Instagram Snapshot');
        const diff = computeSingleSnapshotInsights(snapshot);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onDiffCalculated(diff);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse ZIP archive. Ensure it contains Instagram followers data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Upload Instagram Export ZIPs</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              100% Client-Side Processing • Your private data never leaves this browser
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {/* Privacy Callout */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ShieldCheck size={20} color="var(--accent-green)" />
            <span>
              <strong>Zero Server Uploads:</strong> Files are decompressed and parsed entirely within your browser memory using JSZip.
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="tabs-nav" style={{ justifyContent: 'center' }}>
            <button
              className={`tab-btn ${mode === 'compare' ? 'active' : ''}`}
              onClick={() => setMode('compare')}
            >
              Compare Two Exports (Old vs New)
            </button>
            <button
              className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => setMode('single')}
            >
              Analyze Single Export
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                background: 'var(--accent-red-bg)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'compare' ? (
            <div className="dropzone-container">
              {/* Dropzone 1: Old Export */}
              <div
                className={`dropzone-box ${oldFile ? 'loaded' : ''}`}
                onClick={() => oldInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={oldInputRef}
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setOldFile(e.target.files[0]);
                  }}
                />
                <div className="dropzone-icon">
                  {oldFile ? <CheckCircle2 size={24} /> : <FileArchive size={24} />}
                </div>
                <h3 className="dropzone-title">
                  {oldFile ? oldFile.name : 'Old Export ZIP'}
                </h3>
                <p className="dropzone-desc">
                  {oldFile
                    ? `${(oldFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace`
                    : 'Previous export (e.g. 1 month ago)'}
                </p>
              </div>

              {/* Dropzone 2: New Export */}
              <div
                className={`dropzone-box ${newFile ? 'loaded' : ''}`}
                onClick={() => newInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={newInputRef}
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setNewFile(e.target.files[0]);
                  }}
                />
                <div className="dropzone-icon">
                  {newFile ? <CheckCircle2 size={24} /> : <FileArchive size={24} />}
                </div>
                <h3 className="dropzone-title">
                  {newFile ? newFile.name : 'New Export ZIP'}
                </h3>
                <p className="dropzone-desc">
                  {newFile
                    ? `${(newFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace`
                    : 'Recent export (e.g. today)'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <div
                className={`dropzone-box ${singleFile ? 'loaded' : ''}`}
                onClick={() => singleInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={singleInputRef}
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSingleFile(e.target.files[0]);
                  }}
                />
                <div className="dropzone-icon">
                  {singleFile ? <CheckCircle2 size={24} /> : <FileArchive size={24} />}
                </div>
                <h3 className="dropzone-title">
                  {singleFile ? singleFile.name : 'Instagram Export ZIP'}
                </h3>
                <p className="dropzone-desc">
                  {singleFile
                    ? `${(singleFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace`
                    : 'Drop or select your Instagram data download ZIP'}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="btn-demo"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="btn-upload-primary"
              onClick={handleProcess}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              <Sparkles size={16} />
              <span>{isLoading ? 'Extracting & Comparing...' : 'Compute Instagram Diff'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
