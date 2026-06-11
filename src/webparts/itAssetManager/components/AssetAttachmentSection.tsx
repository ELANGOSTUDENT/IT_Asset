import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Spinner, SpinnerSize,
  DefaultButton, PrimaryButton, IconButton,
  Dropdown,
  Dialog, DialogType, DialogFooter,
  MessageBar, MessageBarType,
} from '@fluentui/react';
import { FileUploadService } from '../services/FileUploadService';
import { IAttachment, AttachmentCategory } from '../models/IAttachment';
import styles from './AssetDetail.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IAssetAttachmentSectionProps {
  assetId: string;
  fileService: FileUploadService;
}

const ALL_CATEGORIES: AttachmentCategory[] = [
  'purchase', 'repairs', 'gifted', 'transfer', 'scrap', 'validation', 'photos', 'other',
];

const CATEGORY_OPTIONS = ALL_CATEGORIES.map(c => ({
  key: c,
  text: c.charAt(0).toUpperCase() + c.slice(1),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const AssetAttachmentSection: React.FC<IAssetAttachmentSectionProps> = ({ assetId, fileService }) => {
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload dialog state
  const [showUploadDlg, setShowUploadDlg] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<AttachmentCategory>('other');
  const [uploading, setUploading] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<IAttachment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const files = await fileService.listFiles(assetId);
      setAttachments(files);
    } catch {
      setError('Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  }, [assetId, fileService]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleOpen = (attachment: IAttachment) => {
    window.open(
      attachment.previewType === 'download' ? attachment.downloadUrl : attachment.absoluteUrl,
      '_blank',
    );
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of selectedFiles) {
        await fileService.upload(assetId, uploadCategory, file);
      }
      setShowUploadDlg(false);
      setSelectedFiles([]);
      setUploadCategory('other');
      await loadFiles();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await fileService.deleteFile(deleteTarget.serverRelativeUrl);
      setAttachments(prev => prev.filter(a => a.serverRelativeUrl !== deleteTarget.serverRelativeUrl));
      setDeleteTarget(null);
    } catch {
      setError('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.card} style={{ marginTop: 16 }}>
      <div className={styles.cardTitle}>
        Attachments
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      {loading && (
        <Spinner size={SpinnerSize.small} label="Loading attachments…" />
      )}

      {!loading && attachments.length === 0 && (
        <div className={styles.emptyState}>
          No attachments uploaded yet.
        </div>
      )}

      {!loading && attachments.length > 0 && (
        <div>
          {attachments.map(a => (
            <div key={a.serverRelativeUrl} className={styles.attachItem}>
              <div className={styles.attachInfo}>
                <span className={styles.attachName} title={a.name}>{a.name}</span>
                <div className={styles.attachMeta}>
                  <span className={styles.badge}>{a.category}</span>
                  {a.fileSize > 0 && <span>{formatSize(a.fileSize)}</span>}
                  <span>{formatDate(a.timeCreated)}</span>
                </div>
              </div>
              <div className={styles.attachActions}>
                <IconButton
                  iconProps={{ iconName: a.previewType === 'download' ? 'Download' : 'View' }}
                  title={a.previewType === 'download' ? 'Download' : 'Preview'}
                  onClick={() => handleOpen(a)}
                />
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  title="Delete"
                  onClick={() => setDeleteTarget(a)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <DefaultButton
        iconProps={{ iconName: 'Upload' }}
        onClick={() => { setSelectedFiles([]); setUploadCategory('other'); setShowUploadDlg(true); }}
        style={{ marginTop: 8 }}
      >
        Upload Files
      </DefaultButton>

      {/* ── Upload Dialog ── */}
      <Dialog
        hidden={!showUploadDlg}
        onDismiss={() => { setShowUploadDlg(false); setSelectedFiles([]); }}
        dialogContentProps={{ type: DialogType.normal, title: 'Upload Files' }}
        modalProps={{ isBlocking: false }}
        styles={{ main: { minWidth: 480 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>
              Select Files
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
          </div>
          <Dropdown
            label="Category"
            selectedKey={uploadCategory}
            options={CATEGORY_OPTIONS}
            onChange={(_e, opt) => setUploadCategory((opt?.key as AttachmentCategory) || 'other')}
          />
          {selectedFiles.length > 0 && (
            <span style={{ fontSize: 12, color: '#707070' }}>
              {selectedFiles.length} file(s) selected
            </span>
          )}
        </div>
        <DialogFooter>
          <PrimaryButton
            onClick={handleUpload}
            disabled={!selectedFiles.length || uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </PrimaryButton>
          <DefaultButton onClick={() => { setShowUploadDlg(false); setSelectedFiles([]); }}>
            Cancel
          </DefaultButton>
        </DialogFooter>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(null)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Delete Attachment?',
        }}
        modalProps={{ isBlocking: false }}
      >
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          This will move it to the SharePoint recycle bin.
        </p>
        <DialogFooter>
          <PrimaryButton onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </PrimaryButton>
          <DefaultButton onClick={() => setDeleteTarget(null)}>Cancel</DefaultButton>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AssetAttachmentSection;
