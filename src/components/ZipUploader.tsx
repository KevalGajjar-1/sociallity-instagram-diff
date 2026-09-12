import React, { useState, useRef } from 'react';
import {
  FileArchive,
  Folder,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  parseInstagramExportZip,
  parseInstagramExportFolder,
} from '../utils/instagramParser';
import { computeDiff } from '../utils/diffEngine';
import { DiffResult, InstagramSnapshot } from '../types/instagram';

interface ZipUploaderProps {
  onDiffCalculated: (diff: DiffResult) => void;
}

export const ZipUploader: React.FC<ZipUploaderProps> = ({
  onDiffCalculated,
}) => {
  const [oldFiles, setOldFiles] = useState<{ name: string; zip?: File; folderFiles?: File[] } | null>(null);
  const [newFiles, setNewFiles] = useState<{ name: string; zip?: File; folderFiles?: File[] } | null>(null);
  const [singleFiles, setSingleFiles] = useState<{ name: string; zip?: File; folderFiles?: File[] } | null>(null);
  const [mode, setMode] = useState<'compare' | 'single'>('compare');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [dragOverOld, setDragOverOld] = useState(false);
  const [dragOverNew, setDragOverNew] = useState(false);
  const [dragOverSingle, setDragOverSingle] = useState(false);

  const oldZipInputRef = useRef<HTMLInputElement>(null);
  const oldFolderInputRef = useRef<HTMLInputElement>(null);
  const newZipInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const singleZipInputRef = useRef<HTMLInputElement>(null);
  const singleFolderInputRef = useRef<HTMLInputElement>(null);

  const parseItem = async (
    item: { name: string; zip?: File; folderFiles?: File[] },
    label: string
  ): Promise<InstagramSnapshot> => {
    if (item.zip) {
      return parseInstagramExportZip(item.zip, label);
    } else if (item.folderFiles && item.folderFiles.length > 0) {
      return parseInstagramExportFolder(item.folderFiles, label);
    }
    throw new Error(`Invalid export input for ${label}`);
  };

  const handleProcess = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'compare') {
        if (!oldFiles || !newFiles) {
          setErrorMsg('Please select both an Old Export and a New Export (ZIP or folder) to compare.');
          setIsLoading(false);
          return;
        }

        const oldSnapshot = await parseItem(oldFiles, 'Old Export');
        const newSnapshot = await parseItem(newFiles, 'New Export');

        const diff = computeDiff(oldSnapshot, newSnapshot);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onDiffCalculated(diff);
      } else {
        if (!singleFiles) {
          setErrorMsg('Please select an Instagram export ZIP or extracted folder.');
          setIsLoading(false);
          return;
        }

        const snapshot = await parseItem(singleFiles, 'Instagram Snapshot');
        const emptyOld: InstagramSnapshot = {
          label: 'Baseline (Empty)',
          followers: [],
          following: [],
          blockedProfiles: [],
        };
        const diff = computeDiff(emptyOld, snapshot);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onDiffCalculated(diff);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse export archive or folder. Ensure it contains Instagram JSON/HTML files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setter: (item: { name: string; zip?: File }) => void,
    setDrag: (d: boolean) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
        setter({ name: file.name, zip: file });
      } else {
        setErrorMsg('Please drop a valid .zip archive exported from Instagram.');
      }
    }
  };

  const isSubmitDisabled =
    isLoading || (mode === 'compare' ? !oldFiles || !newFiles : !singleFiles);

  return (
    <div className="zip-uploader-card">
      {/* Header */}
      <div className="zip-uploader-header">
        <div>
          <h2 className="zip-uploader-title">
            Upload Instagram Export ZIPs
          </h2>
          <p className="zip-uploader-subtitle">
            100% Client-Side Real-Time Processing • Your private Instagram data never leaves this device
          </p>
        </div>
      </div>

      {/* Privacy Callout */}
      <div className="zip-uploader-privacy">
        <ShieldCheck size={20} className="zip-uploader-privacy-icon" />
        <span>
          <strong>Zero Server Uploads:</strong> ZIP archives and folders are decompressed and parsed entirely in client memory. Supports both Meta 2026 JSON & HTML exports.
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="tabs-nav zip-uploader-tabs">
        <button
          className={`tab-btn ${mode === 'compare' ? 'active' : ''}`}
          onClick={() => setMode('compare')}
          type="button"
        >
          Compare Two Exports (Old vs New Diff)
        </button>
        <button
          className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
          onClick={() => setMode('single')}
          type="button"
        >
          Inspect Single Export
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
            className={`dropzone ${dragOverOld ? 'active' : ''} ${oldFiles ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverOld(true);
            }}
            onDragLeave={() => setDragOverOld(false)}
            onDrop={(e) => handleDrop(e, setOldFiles, setDragOverOld)}
          >
            <input
              type="file"
              ref={oldZipInputRef}
              style={{ display: 'none' }}
              accept=".zip"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setOldFiles({ name: e.target.files[0].name, zip: e.target.files[0] });
                }
              }}
            />
            <input
              type="file"
              ref={oldFolderInputRef}
              style={{ display: 'none' }}
              {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const arr = Array.from(e.target.files);
                  const folderName = (arr[0] as any)?.webkitRelativePath?.split('/')[0] || 'Selected Folder';
                  setOldFiles({ name: folderName, folderFiles: arr });
                }
              }}
            />

            {oldFiles ? (
              <div className="dropzone-file-info">
                <CheckCircle2 size={32} className="dropzone-icon-success" />
                <span className="dropzone-file-name">{oldFiles.name}</span>
                <span className="dropzone-badge-success">Old Export Loaded</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => oldZipInputRef.current?.click()}
                    type="button"
                  >
                    Change ZIP
                  </button>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => oldFolderInputRef.current?.click()}
                    type="button"
                  >
                    Change Folder
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-placeholder">
                <FileArchive size={36} className="dropzone-icon" />
                <h3 className="dropzone-title">1. Earlier / Old Export</h3>
                <p className="dropzone-sub">
                  Drag & drop <strong>.zip</strong> or pick folder
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => oldZipInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={14} style={{ marginRight: '4px' }} />
                    Select ZIP
                  </button>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => oldFolderInputRef.current?.click()}
                    type="button"
                  >
                    <Folder size={14} style={{ marginRight: '4px' }} />
                    Select Folder
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dropzone 2: New Export */}
          <div
            className={`dropzone ${dragOverNew ? 'active' : ''} ${newFiles ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverNew(true);
            }}
            onDragLeave={() => setDragOverNew(false)}
            onDrop={(e) => handleDrop(e, setNewFiles, setDragOverNew)}
          >
            <input
              type="file"
              ref={newZipInputRef}
              style={{ display: 'none' }}
              accept=".zip"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNewFiles({ name: e.target.files[0].name, zip: e.target.files[0] });
                }
              }}
            />
            <input
              type="file"
              ref={newFolderInputRef}
              style={{ display: 'none' }}
              {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const arr = Array.from(e.target.files);
                  const folderName = (arr[0] as any)?.webkitRelativePath?.split('/')[0] || 'Selected Folder';
                  setNewFiles({ name: folderName, folderFiles: arr });
                }
              }}
            />

            {newFiles ? (
              <div className="dropzone-file-info">
                <CheckCircle2 size={32} className="dropzone-icon-success" />
                <span className="dropzone-file-name">{newFiles.name}</span>
                <span className="dropzone-badge-success">New Export Loaded</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => newZipInputRef.current?.click()}
                    type="button"
                  >
                    Change ZIP
                  </button>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => newFolderInputRef.current?.click()}
                    type="button"
                  >
                    Change Folder
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-placeholder">
                <FileArchive size={36} className="dropzone-icon" />
                <h3 className="dropzone-title">2. Latest / New Export</h3>
                <p className="dropzone-sub">
                  Drag & drop <strong>.zip</strong> or pick folder
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => newZipInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={14} style={{ marginRight: '4px' }} />
                    Select ZIP
                  </button>
                  <button
                    className="dropzone-browse-btn"
                    onClick={() => newFolderInputRef.current?.click()}
                    type="button"
                  >
                    <Folder size={14} style={{ marginRight: '4px' }} />
                    Select Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Single Export Mode */
        <div
          className={`dropzone dropzone-single ${dragOverSingle ? 'active' : ''} ${singleFiles ? 'has-file' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverSingle(true);
          }}
          onDragLeave={() => setDragOverSingle(false)}
          onDrop={(e) => handleDrop(e, setSingleFiles, setDragOverSingle)}
        >
          <input
            type="file"
            ref={singleZipInputRef}
            style={{ display: 'none' }}
            accept=".zip"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSingleFiles({ name: e.target.files[0].name, zip: e.target.files[0] });
              }
            }}
          />
          <input
            type="file"
            ref={singleFolderInputRef}
            style={{ display: 'none' }}
            {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const arr = Array.from(e.target.files);
                const folderName = (arr[0] as any)?.webkitRelativePath?.split('/')[0] || 'Selected Folder';
                setSingleFiles({ name: folderName, folderFiles: arr });
              }
            }}
          />

          {singleFiles ? (
            <div className="dropzone-file-info">
              <CheckCircle2 size={36} className="dropzone-icon-success" />
              <span className="dropzone-file-name">{singleFiles.name}</span>
              <span className="dropzone-badge-success">Ready to inspect</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  className="dropzone-browse-btn"
                  onClick={() => singleZipInputRef.current?.click()}
                  type="button"
                >
                  Change ZIP
                </button>
                <button
                  className="dropzone-browse-btn"
                  onClick={() => singleFolderInputRef.current?.click()}
                  type="button"
                >
                  Change Folder
                </button>
              </div>
            </div>
          ) : (
            <div className="dropzone-placeholder">
              <FileArchive size={40} className="dropzone-icon" />
              <h3 className="dropzone-title">Upload Single Instagram Export</h3>
              <p className="dropzone-sub">
                Drop your Instagram <strong>.zip</strong> or select extracted folder to view all followers, following, blocked, contacts, and activity
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  className="dropzone-browse-btn"
                  onClick={() => singleZipInputRef.current?.click()}
                  type="button"
                >
                  <Upload size={14} style={{ marginRight: '4px' }} />
                  Select ZIP
                </button>
                <button
                  className="dropzone-browse-btn"
                  onClick={() => singleFolderInputRef.current?.click()}
                  type="button"
                >
                  <Folder size={14} style={{ marginRight: '4px' }} />
                  Select Folder
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action CTA */}
      <div className="zip-uploader-actions">
        <button
          className="zip-uploader-submit-btn"
          disabled={isSubmitDisabled}
          onClick={handleProcess}
          type="button"
        >
          {isLoading ? (
            <span className="flex-center-gap">
              <span className="spinner"></span>
              Parsing Instagram Export Files...
            </span>
          ) : (
            <span className="flex-center-gap">
              <Sparkles size={18} />
              {mode === 'compare' ? 'Compare Exports & Generate Diff' : 'Analyze Export Data'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
