import React, { useState, useRef } from 'react';
import { X, FileArchive, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseInstagramExportZip } from '../utils/instagramParser';
import { computeDiff, computeSingleSnapshotInsights } from '../utils/diffEngine';
import { DiffResult } from '../types/instagram';

interface ZipUploaderProps {
  onDiffCalculated: (diff: DiffResult) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const ZipUploader: React.FC<ZipUploaderProps> = ({
  onDiffCalculated,
  onClose,
  canClose = false,
}) => {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'compare' | 'single'>('compare');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [dragOverOld, setDragOverOld] = useState(false);
  const [dragOverNew, setDragOverNew] = useState(false);
  const [dragOverSingle, setDragOverSingle] = useState(false);

  const oldInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

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
        if (onClose) onClose();
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
        if (onClose) onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse ZIP archive. Ensure it contains Instagram followers data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setter: (file: File) => void,
    setDrag: (d: boolean) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
        setter(file);
      } else {
        setErrorMsg('Please drop a valid .zip archive exported from Instagram.');
      }
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '28px',
        animation: 'fadeIn 0.25s ease-out',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            Upload Instagram Export ZIPs
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            100% Client-Side Processing • Your private Instagram data never leaves this browser
          </p>
        </div>

        {canClose && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <X size={16} />
            <span>Close</span>
          </button>
        )}
      </div>

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
        <ShieldCheck size={20} color="var(--accent-green)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Zero Server Uploads:</strong> ZIP files are decompressed and parsed entirely within your browser memory using JSZip.
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="tabs-nav" style={{ justifyContent: 'center', marginBottom: '22px' }}>
        <button
          className={`tab-btn ${mode === 'compare' ? 'active' : ''}`}
          onClick={() => setMode('compare')}
          type="button"
        >
          Compare Two Exports (Old vs New)
        </button>
        <button
          className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
          onClick={() => setMode('single')}
          type="button"
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
            marginBottom: '20px',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {mode === 'compare' ? (
        <div className="dropzone-container">
          {/* Dropzone 1: Old Export */}
          <div
            className={`dropzone-box ${oldFile ? 'loaded' : ''} ${dragOverOld ? 'drag-over' : ''}`}
            onClick={() => oldInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverOld(true);
            }}
            onDragLeave={() => setDragOverOld(false)}
            onDrop={(e) => handleDrop(e, setOldFile, setDragOverOld)}
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
                ? `${(oldFile.size / 1024 / 1024).toFixed(2)} MB • Click or drop to replace`
                : 'Drop or select previous export (e.g. 1 month ago)'}
            </p>
          </div>

          {/* Dropzone 2: New Export */}
          <div
            className={`dropzone-box ${newFile ? 'loaded' : ''} ${dragOverNew ? 'drag-over' : ''}`}
            onClick={() => newInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverNew(true);
            }}
            onDragLeave={() => setDragOverNew(false)}
            onDrop={(e) => handleDrop(e, setNewFile, setDragOverNew)}
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
                ? `${(newFile.size / 1024 / 1024).toFixed(2)} MB • Click or drop to replace`
                : 'Drop or select recent export (e.g. today)'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <div
            className={`dropzone-box ${singleFile ? 'loaded' : ''} ${dragOverSingle ? 'drag-over' : ''}`}
            onClick={() => singleInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverSingle(true);
            }}
            onDragLeave={() => setDragOverSingle(false)}
            onDrop={(e) => handleDrop(e, setSingleFile, setDragOverSingle)}
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
                ? `${(singleFile.size / 1024 / 1024).toFixed(2)} MB • Click or drop to replace`
                : 'Drop or select your Instagram data download ZIP'}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
        {canClose && onClose && (
          <button
            className="btn-demo"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Cancel
          </button>
        )}
        <button
          className="btn-upload-primary"
          onClick={handleProcess}
          disabled={isLoading || (mode === 'compare' ? (!oldFile || !newFile) : !singleFile)}
          style={{
            opacity: isLoading || (mode === 'compare' ? (!oldFile || !newFile) : !singleFile) ? 0.6 : 1,
            cursor: isLoading || (mode === 'compare' ? (!oldFile || !newFile) : !singleFile) ? 'not-allowed' : 'pointer',
            padding: '12px 28px',
          }}
          type="button"
        >
          <Sparkles size={16} />
          <span>{isLoading ? 'Extracting & Comparing...' : 'Compute Instagram Diff'}</span>
        </button>
      </div>
    </div>
  );
};
