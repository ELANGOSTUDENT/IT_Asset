import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Spinner, SpinnerSize,
  DefaultButton, PrimaryButton, IconButton,
  Dropdown,
  Dialog, DialogType, DialogFooter,
  MessageBar, MessageBarType,
} from '@fluentui/react';
import { FileUploadService } from '../services/FileUploadService';
import { IAttachment, AttachmentCategory } from '../models/IAttachment';
import { IAsset } from '../models/IAsset';
import { IRepairEntry } from '../models/IRepairEntry';
import styles from './AssetDetail.module.scss';

interface IAssetAttachmentSectionProps {
  assetId: string;
  asset: IAsset;
  repairs: IRepairEntry[];
  fileService: FileUploadService;
}

// Categories available in the generic upload dialog.
// Purchase, gifted, and scrap documents must go through their dedicated forms
// (asset edit / status-change dialog) so the URL is saved to the list record field.
// Files uploaded here go to the SharePoint library; only Repair Reports are
// fetched back and displayed in this section (per-asset subfolder).
const UPLOAD_CATEGORY_OPTIONS: { key: AttachmentCategory; text: string }[] = [
  { key: 'repairs',  text: 'Repair Report' },
  { key: 'warranty', text: 'Warranty Document' },
  { key: 'other',    text: 'Other' },
];

const CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  purchase:  'Purchase Invoice',
  repairs:   'Repair Report',
  gifted:    'Gift Document',
  scrap:     'Scrap Document',
  warranty:  'Warranty Document',
  other:     'Other',
};

const formatSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const getPreviewType = (fileName: string): 'browser' | 'office' | 'download' => {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf','png','jpg','jpeg','gif','svg','webp','bmp','tiff','txt','csv'].includes(ext)) return 'browser';
  if (['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) return 'office';
  return 'download';
};

// Build an IAttachment from a stored URL field (server-relative or absolute)
const buildUrlAttachment = (
  url: string, displayName: string, category: AttachmentCategory
): IAttachment => {
  const absUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  return {
    name: displayName,
    serverRelativeUrl: url,
    absoluteUrl: absUrl,
    downloadUrl: `${absUrl}?download=1`,
    category,
    timeCreated: '',
    fileSize: 0,
    previewType: getPreviewType(displayName),
  };
};

const AssetAttachmentSection: React.FC<IAssetAttachmentSectionProps> = ({
  assetId, asset, repairs, fileService,
}) => {
  const [libraryFiles, setLibraryFiles] = useState<IAttachment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Upload dialog
  const [showUploadDlg, setShowUploadDlg]         = useState(false);
  const [selectedFiles, setSelectedFiles]         = useState<File[]>([]);
  const [uploadCategory, setUploadCategory]       = useState<AttachmentCategory>('repairs');
  const [uploading, setUploading]                 = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<IAttachment | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const loadLibraryFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const files = await fileService.listFiles(assetId);
      setLibraryFiles(files);
    } catch {
      setError('Failed to load repair attachments from library.');
    } finally {
      setLoading(false);
    }
  }, [assetId, fileService]);

  useEffect(() => { loadLibraryFiles(); }, [loadLibraryFiles]);

  // Build URL-field-based attachments from the asset record (purchase bill only)
  const urlAttachments = useMemo((): IAttachment[] => {
    const list: IAttachment[] = [];
    if (asset.PurchaseBillUrl)
      list.push(buildUrlAttachment(asset.PurchaseBillUrl, 'Purchase Invoice', 'purchase'));
    return list;
  }, [asset]);

  // Build repair attachments from the Asset_Repairs list entries
  const repairAttachments = useMemo((): IAttachment[] =>
    repairs
      .filter(r => r.AttachmentUrl)
      .map(r => buildUrlAttachment(
        r.AttachmentUrl!,
        `Repair — ${r.RepairDate?.slice(0, 10) ?? ''}`,
        'repairs'
      )),
    [repairs]
  );

  // Merge all three sources, deduplicating by serverRelativeUrl
  const allAttachments = useMemo((): IAttachment[] => {
    const seen = new Set<string>();
    return [...urlAttachments, ...repairAttachments, ...libraryFiles].filter(a => {
      if (seen.has(a.serverRelativeUrl)) return false;
      seen.add(a.serverRelativeUrl);
      return true;
    });
  }, [urlAttachments, repairAttachments, libraryFiles]);

  const handleOpen = (attachment: IAttachment): void => {
    window.open(encodeURI(attachment.absoluteUrl), '_blank', 'noopener,noreferrer');
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of selectedFiles) {
        // Prefix repair files with timestamp to avoid name collisions
        const uploadFile = uploadCategory === 'repairs'
          ? new File([file], `${Date.now()}_${file.name}`, { type: file.type })
          : file;
        await fileService.upload(assetId, uploadCategory, uploadFile);
      }
      setShowUploadDlg(false);
      setSelectedFiles([]);
      setUploadCategory('repairs');
      await loadLibraryFiles();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await fileService.deleteFile(deleteTarget.serverRelativeUrl);
      setLibraryFiles(prev => prev.filter(a => a.serverRelativeUrl !== deleteTarget.serverRelativeUrl));
      setDeleteTarget(null);
    } catch {
      setError('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Only library files can be deleted (URL-field attachments are managed via the form)
  const isLibraryFile = (a: IAttachment): boolean =>
    libraryFiles.some(f => f.serverRelativeUrl === a.serverRelativeUrl);

  return (
    <div className={styles.card} style={{ marginTop: 16 }}>
      <div className={styles.cardTitle}>Attachments</div>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      {loading && <Spinner size={SpinnerSize.small} label="Loading attachments…" />}

      {!loading && allAttachments.length === 0 && (
        <div className={styles.emptyState}>No attachments uploaded yet.</div>
      )}

      {!loading && allAttachments.length > 0 && (
        <div>
          {allAttachments.map(a => (
            <div key={a.serverRelativeUrl} className={styles.attachItem}>
              <div className={styles.attachInfo}>
                <span className={styles.attachName} title={a.name}>{a.name}</span>
                <div className={styles.attachMeta}>
                  <span className={styles.badge}>{CATEGORY_LABELS[a.category] ?? a.category}</span>
                  {a.fileSize > 0 && <span>{formatSize(a.fileSize)}</span>}
                  {a.timeCreated && <span>{formatDate(a.timeCreated)}</span>}
                </div>
              </div>
              <div className={styles.attachActions}>
                <IconButton
                  iconProps={{ iconName: a.previewType === 'download' ? 'Download' : 'View' }}
                  title={a.previewType === 'download' ? 'Download' : 'Open'}
                  onClick={() => handleOpen(a)}
                />
                {isLibraryFile(a) && (
                  <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    title="Delete"
                    onClick={() => setDeleteTarget(a)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DefaultButton
        iconProps={{ iconName: 'Upload' }}
        onClick={() => { setSelectedFiles([]); setUploadCategory('repairs'); setShowUploadDlg(true); }}
        style={{ marginTop: 8 }}
      >
        Upload Files
      </DefaultButton>

      {/* Upload Dialog */}
      <Dialog
        hidden={!showUploadDlg}
        onDismiss={() => { setShowUploadDlg(false); setSelectedFiles([]); }}
        dialogContentProps={{ type: DialogType.normal, title: 'Upload Files' }}
        modalProps={{ isBlocking: false }}
        styles={{ main: { minWidth: 480 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <MessageBar messageBarType={MessageBarType.info}>
            Files uploaded here are stored in the SharePoint library. Only Repair Reports are shown in this section.
            For Purchase Invoice, Gift, or Scrap documents — use the dedicated forms so the URL is linked to the correct list record.
          </MessageBar>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>
              Select Files
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            {selectedFiles.length > 0 && (
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#107c10' }}>
                ✓ Ready to upload: {selectedFiles.map(f => f.name).join(', ')}
              </span>
            )}
          </div>
          <Dropdown
            label="Category"
            selectedKey={uploadCategory}
            options={UPLOAD_CATEGORY_OPTIONS}
            onChange={(_e, opt) => setUploadCategory((opt?.key as AttachmentCategory) || 'repairs')}
          />
        </div>
        <DialogFooter>
          <PrimaryButton onClick={handleUpload} disabled={!selectedFiles.length || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </PrimaryButton>
          <DefaultButton onClick={() => { setShowUploadDlg(false); setSelectedFiles([]); }}>
            Cancel
          </DefaultButton>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(null)}
        dialogContentProps={{ type: DialogType.normal, title: 'Delete Attachment?' }}
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
