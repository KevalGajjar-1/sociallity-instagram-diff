import React, { useState, useRef } from 'react';
import { FileArchive, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseInstagramExportZip } from '../utils/instagramParser';
import { computeDiff, computeSingleSnapshotInsights } from '../utils/diffEngine';
import { DiffResult } from '../types/instagram';

interface ZipUploaderProps {
  onDiffCalculated: (diff: DiffResult) => void;
}

export const ZipUploader: React.FC<ZipUploaderProps> = ({
  onDiffCalculated,
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

  const isSubmitDisabled =
    isLoading || (mode === 'compare' ? !oldFile || !newFile : !singleFile);

  return (
    <div className="zip-uploader-card">
      {/* Header */}
      <div className="zip-uploader-header">
        <div>
          <h2 className="zip-uploader-title">
            Upload Instagram Export ZIPs
          </h2>
          <p className="zip-uploader-subtitle">
            100% Client-Side Processing • Your private Instagram data never leaves this browser
          </p>
        </div>
      </div>

      {/* Privacy Callout */}
      <div className="zip-uploader-privacy">
        <ShieldCheck size={20} className="zip-uploader-privacy-icon" />
        <span>
          <strong>Zero Server Uploads:</strong> ZIP files are decompressed and parsed entirely within your browser memory using JSZip.
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="tabs-nav zip-uploader-tabs">
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
        <div className="zip-uploader-error">
          <AlertCircle size={18} className="zip-uploader-error-icon" />
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
              className="file-input-hidden"
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
              className="file-input-hidden"
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
        <div className="zip-uploader-single-wrap">
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
              className="file-input-hidden"
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
      <div className="zip-uploader-actions">
        <button
          className="btn-upload-primary zip-uploader-btn-submit"
          onClick={handleProcess}
          disabled={isSubmitDisabled}
          type="button"
        >
          <Sparkles size={16} />
          <span>{isLoading ? 'Extracting & Comparing...' : 'Compute Instagram Diff'}</span>
        </button>
      </div>
    </div>
  );
};
