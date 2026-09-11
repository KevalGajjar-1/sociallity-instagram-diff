import React from 'react';
import { ZipUploader } from './ZipUploader';
import { DiffResult } from '../types/instagram';

export { ZipUploader };

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiffCalculated: (diff: DiffResult) => void;
}

/**
 * @deprecated Use ZipUploader for inline rendering without popup modals.
 */
export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDiffCalculated,
}) => {
  if (!isOpen) return null;
  return (
    <ZipUploader
      onDiffCalculated={onDiffCalculated}
      onClose={onClose}
      canClose={true}
    />
  );
};
