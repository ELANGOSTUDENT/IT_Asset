import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Spinner, SpinnerSize,
  MessageBar, MessageBarType,
  DefaultButton, PrimaryButton, IconButton,
  TextField, Dropdown,
  Dialog, DialogType, DialogFooter,
  Separator,
} from '@fluentui/react';
import {
  ArrowLeftRegular, EditRegular,
  TagRegular, LaptopRegular, MoneyRegular, PersonRegular,
  NoteRegular, WrenchRegular, DocumentRegular, LeafThreeRegular,
  AddRegular, AttachRegular, CalendarRegular,
  HistoryRegular,
} from '@fluentui/react-icons';
import {
  IAsset, AssetStatus, ASSET_STATUS_TRANSITIONS, STATUS_BADGE_COLORS,
  STATUS_REQUIRES_NOTE, ASSET_TYPE_LABELS,
} from '../models/IAsset';
import { IAssetHistory } from '../models/IAssetHistory';
import { IAssetAssignment } from '../models/IAssetAssignment';
import { IRepairEntry } from '../models/IRepairEntry';
import { IGiftedAsset } from '../models/IGiftedAsset';
import { IScrapAsset } from '../models/IScrapAsset';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
import { AssetGiftedService } from '../services/AssetGiftedService';
import { AssetScrapService } from '../services/AssetScrapService';
import { FileUploadService } from '../services/FileUploadService';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import AssetAttachmentSection from './AssetAttachmentSection';
import styles from './AssetDetail.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IAssetDetailProps {
  asset: IAsset;
  assetService: AssetService;
  repairService: AssetRepairService;
  assignmentService: AssetAssignmentService;
  giftedService: AssetGiftedService;
  scrapService: AssetScrapService;
  fileService: FileUploadService;
  currentUser: string;
  onBack: () => void;
  onEdit: () => void;
  onEditAssignment: (assignment: IAssetAssignment | null) => void;
  onStatusChange: (asset: IAsset, newStatus: AssetStatus, notes: string) => Promise<void>;
}

// ── Small helpers ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const c = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '3px 12px', borderRadius: 12, fontWeight: 600, fontSize: 13,
    }}>
      {status}
    </span>
  );
};

interface IFieldProps { label: string; value?: string | number; mono?: boolean }
const F: React.FC<IFieldProps> = ({ label, value, mono }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldValue} style={mono ? { fontFamily: 'monospace', fontWeight: 700 } : {}}>
      {value || '—'}
    </span>
  </div>
);

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className={styles.card}>
    <div className={styles.cardTitle}>{icon} {title}</div>
    {children}
  </div>
);

// ── Gifted details dialog ──────────────────────────────────────────────────────

interface IGiftedDialogProps {
  open: boolean;
  draft: Partial<IGiftedAsset>;
  saving: boolean;
  onChange: (d: Partial<IGiftedAsset>) => void;
  onConfirm: (finalDraft: Partial<IGiftedAsset>) => void;
  onClose: () => void;
  fileService: FileUploadService;
  assetId: string;
}

const GiftedDialog: React.FC<IGiftedDialogProps> = ({
  open, draft, saving, onChange, onConfirm, onClose, fileService, assetId,
}) => {
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const set = <K extends keyof IGiftedAsset>(k: K, v: IGiftedAsset[K]) => onChange({ ...draft, [k]: v });

  useEffect(() => {
    if (!open) setAttachFile(null);
  }, [open]);

  const handleConfirm = async () => {
    let finalDraft = { ...draft };
    if (attachFile) {
      const r = await fileService.upload(assetId, 'gifted', attachFile);
      finalDraft = { ...finalDraft, GiftAttachmentUrl: r.serverRelativeUrl };
    }
    onConfirm(finalDraft);
  };

  return (
    <Dialog
      hidden={!open}
      onDismiss={onClose}
      dialogContentProps={{ type: DialogType.normal, title: 'Gifted Details' }}
      modalProps={{ isBlocking: false }}
      styles={{ main: { minWidth: 480 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
        <TextField
          label="Gifted To *"
          value={draft.GiftedTo || ''}
          onChange={(_e, v) => set('GiftedTo', v || '')}
        />
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Gifted Date</label>
          <input
            type="date"
            value={draft.GiftedDate ? draft.GiftedDate.slice(0, 10) : ''}
            onChange={e => set('GiftedDate', e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : '')}
            style={{ width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14, border: '1px solid #d1d1d1', boxSizing: 'border-box' }}
          />
        </div>
        <TextField
          label="Remarks"
          multiline
          rows={2}
          value={draft.GiftRemarks || ''}
          onChange={(_e, v) => set('GiftRemarks', v || '')}
        />
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Authorisation Letter</label>
          {draft.GiftAttachmentUrl && (
            <a href={draft.GiftAttachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              View existing
            </a>
          )}
          <input type="file" onChange={e => setAttachFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <DialogFooter>
        <PrimaryButton onClick={handleConfirm} disabled={saving || !draft.GiftedTo}>
          {saving ? 'Saving…' : 'Save'}
        </PrimaryButton>
        <DefaultButton onClick={onClose}>Cancel</DefaultButton>
      </DialogFooter>
    </Dialog>
  );
};

// ── Scrap details dialog ───────────────────────────────────────────────────────

interface IScrapDialogProps {
  open: boolean;
  draft: Partial<IScrapAsset>;
  saving: boolean;
  onChange: (d: Partial<IScrapAsset>) => void;
  onConfirm: (finalDraft: Partial<IScrapAsset>) => void;
  onClose: () => void;
  fileService: FileUploadService;
  assetId: string;
}

const ScrapDialog: React.FC<IScrapDialogProps> = ({
  open, draft, saving, onChange, onConfirm, onClose, fileService, assetId,
}) => {
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const set = <K extends keyof IScrapAsset>(k: K, v: IScrapAsset[K]) => onChange({ ...draft, [k]: v });

  useEffect(() => {
    if (!open) setAttachFile(null);
  }, [open]);

  const handleConfirm = async () => {
    let finalDraft = { ...draft };
    if (attachFile) {
      const r = await fileService.upload(assetId, 'scrap', attachFile);
      finalDraft = { ...finalDraft, ScrapAttachmentUrl: r.serverRelativeUrl };
    }
    onConfirm(finalDraft);
  };

  return (
    <Dialog
      hidden={!open}
      onDismiss={onClose}
      dialogContentProps={{ type: DialogType.normal, title: 'Scrap / Disposal Details' }}
      modalProps={{ isBlocking: false }}
      styles={{ main: { minWidth: 480 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Scrap Date</label>
          <input
            type="date"
            value={draft.ScrapDate ? draft.ScrapDate.slice(0, 10) : ''}
            onChange={e => set('ScrapDate', e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : '')}
            style={{ width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14, border: '1px solid #d1d1d1', boxSizing: 'border-box' }}
          />
        </div>
        <TextField
          label="Scrap Vendor"
          value={draft.ScrapVendor || ''}
          onChange={(_e, v) => set('ScrapVendor', v || '')}
        />
        <TextField
          label="Scrap Amount (INR)"
          type="number"
          prefix="₹"
          value={String(draft.ScrapAmount ?? 0)}
          onChange={(_e, v) => set('ScrapAmount', parseFloat(v || '0'))}
        />
        <TextField
          label="Remarks"
          multiline
          rows={2}
          value={draft.ScrapRemarks || ''}
          onChange={(_e, v) => set('ScrapRemarks', v || '')}
        />
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Certificate / Document</label>
          {draft.ScrapAttachmentUrl && (
            <a href={draft.ScrapAttachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              View existing
            </a>
          )}
          <input type="file" onChange={e => setAttachFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <DialogFooter>
        <PrimaryButton onClick={handleConfirm} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </PrimaryButton>
        <DefaultButton onClick={onClose}>Cancel</DefaultButton>
      </DialogFooter>
    </Dialog>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const AssetDetail: React.FC<IAssetDetailProps> = ({
  asset, assetService, repairService, assignmentService,
  giftedService, scrapService, fileService,
  currentUser, onBack, onEdit, onEditAssignment, onStatusChange,
}) => {
  const [history, setHistory]           = useState<IAssetHistory[]>([]);
  const [repairs, setRepairs]           = useState<IRepairEntry[]>([]);
  const [assignment, setAssignment]     = useState<IAssetAssignment | null>(null);
  const [gifted, setGifted]             = useState<IGiftedAsset | null>(null);
  const [scrap, setScrap]               = useState<IScrapAsset | null>(null);
  const [loadingHist, setLoadingHist]   = useState(true);
  const [loadingRepairs, setLoadingRepairs] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(true);
  const [loadingGifted, setLoadingGifted] = useState(false);
  const [loadingScrap, setLoadingScrap]   = useState(false);

  const [showStatusDlg, setShowStatusDlg] = useState(false);
  const [newStatus, setNewStatus]       = useState<AssetStatus | null>(null);
  const [statusNote, setStatusNote]     = useState('');
  const [changing, setChanging]         = useState(false);
  const [noteErr, setNoteErr]           = useState('');

  // Gifted / scrap edit dialogs
  const [showGiftedDlg, setShowGiftedDlg]   = useState(false);
  const [giftedDraft, setGiftedDraft]       = useState<Partial<IGiftedAsset>>({});
  const [savingGifted, setSavingGifted]     = useState(false);
  const [showScrapDlg, setShowScrapDlg]     = useState(false);
  const [scrapDraft, setScrapDraft]         = useState<Partial<IScrapAsset>>({});
  const [savingScrap, setSavingScrap]       = useState(false);

  const showGifted = asset.Status === 'Gifted';
  const showScrap  = asset.Status === 'Scrapped' || asset.Status === 'Disposed';

  const loadData = useCallback(async () => {
    setLoadingHist(true);
    setLoadingRepairs(true);
    setLoadingAssign(true);
    const [hist, reps, assign] = await Promise.allSettled([
      assetService.getAssetHistory(asset.Title),
      repairService.getRepairs(asset.Title),
      assignmentService.getActiveAssignment(asset.Title),
    ]);
    if (hist.status === 'fulfilled') setHistory(hist.value);
    if (reps.status === 'fulfilled') setRepairs(reps.value);
    if (assign.status === 'fulfilled') setAssignment(assign.value);
    setLoadingHist(false);
    setLoadingRepairs(false);
    setLoadingAssign(false);
  }, [asset.Title, assetService, repairService, assignmentService]);

  const loadGifted = useCallback(async () => {
    if (!showGifted) return;
    setLoadingGifted(true);
    try {
      const g = await giftedService.getGiftedByAsset(asset.Title);
      setGifted(g);
      if (g) setGiftedDraft({ ...g });
    } finally {
      setLoadingGifted(false);
    }
  }, [asset.Title, giftedService, showGifted]);

  const loadScrap = useCallback(async () => {
    if (!showScrap) return;
    setLoadingScrap(true);
    try {
      const s = await scrapService.getScrapByAsset(asset.Title);
      setScrap(s);
      if (s) setScrapDraft({ ...s });
    } finally {
      setLoadingScrap(false);
    }
  }, [asset.Title, scrapService, showScrap]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadGifted(); }, [loadGifted]);
  useEffect(() => { loadScrap(); }, [loadScrap]);

  const validTransitions = ASSET_STATUS_TRANSITIONS[asset.Status] || [];

  const confirmStatusChange = async () => {
    if (!newStatus) return;
    if (STATUS_REQUIRES_NOTE.includes(newStatus) && !statusNote.trim()) {
      setNoteErr('A note is required for this status change.'); return;
    }
    setNoteErr('');
    setChanging(true);
    try {
      await onStatusChange(
        asset, newStatus,
        statusNote.trim() || `Status changed to ${newStatus} by ${currentUser}`
      );
      setShowStatusDlg(false);
      setNewStatus(null);
      setStatusNote('');
      await loadData();
    } finally {
      setChanging(false);
    }
  };

  const handleSaveGifted = async (finalDraft: Partial<IGiftedAsset>) => {
    if (!finalDraft.GiftedTo) return;
    setSavingGifted(true);
    try {
      if (gifted?.Id) {
        await giftedService.updateGifted(gifted.Id, finalDraft);
        setGifted({ ...gifted, ...finalDraft } as IGiftedAsset);
      } else {
        const created = await giftedService.addGifted({
          Title: asset.Title,
          AssetItemId: asset.Id!,
          GiftedTo: finalDraft.GiftedTo!,
          GiftedDate: finalDraft.GiftedDate,
          GiftAttachmentUrl: finalDraft.GiftAttachmentUrl,
          GiftRemarks: finalDraft.GiftRemarks,
        });
        setGifted(created);
      }
      setShowGiftedDlg(false);
    } finally {
      setSavingGifted(false);
    }
  };

  const handleSaveScrap = async (finalDraft: Partial<IScrapAsset>) => {
    setSavingScrap(true);
    try {
      if (scrap?.Id) {
        await scrapService.updateScrap(scrap.Id, finalDraft);
        setScrap({ ...scrap, ...finalDraft } as IScrapAsset);
      } else {
        const created = await scrapService.addScrap({
          Title: asset.Title,
          AssetItemId: asset.Id!,
          ScrapDate: finalDraft.ScrapDate,
          ScrapVendor: finalDraft.ScrapVendor,
          ScrapAmount: finalDraft.ScrapAmount,
          ScrapAttachmentUrl: finalDraft.ScrapAttachmentUrl,
          ScrapRemarks: finalDraft.ScrapRemarks,
        });
        setScrap(created);
      }
      setShowScrapDlg(false);
    } finally {
      setSavingScrap(false);
    }
  };

  const daysLeft = AssetIdGenerator.daysUntilWarrantyExpiry(asset.WarrantyExpiry);

  const historyIcon = (h: IAssetHistory): string => {
    if (h.PreviousStatus && h.NewStatus) return '⇄';
    if (h.NewStatus && !h.PreviousStatus) return '＋';
    return '✎';
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <IconButton iconProps={{ iconName: 'Back' }} onClick={onBack} />
        <div className={styles.headerCenter}>
          <span className={styles.assetId}>{asset.Title}</span>
          <StatusBadge status={asset.Status} />
        </div>
        <div className={styles.headerActions}>
          <DefaultButton iconProps={{ iconName: 'Edit' }} onClick={onEdit}>Edit Asset</DefaultButton>
          {validTransitions.length > 0 && (
            <PrimaryButton iconProps={{ iconName: 'Sync' }} onClick={() => setShowStatusDlg(true)}>
              Change Status
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* ── Warranty banner ── */}
      {asset.WarrantyExpiry && daysLeft <= 90 && (
        <MessageBar messageBarType={daysLeft < 0 ? MessageBarType.error : MessageBarType.warning}>
          {daysLeft < 0
            ? `Warranty expired ${Math.abs(daysLeft)} days ago.`
            : `Warranty expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — consider renewal.`
          }
        </MessageBar>
      )}

      <div className={styles.body}>
        {/* ══ LEFT PANEL — Asset details ══ */}
        <div className={styles.details}>

          {/* Classification */}
          <Card title="Classification" icon={<TagRegular />}>
            <div className={styles.fieldGrid}>
              <F label="Asset ID"   value={asset.Title} mono />
              <F label="Asset Type" value={`${asset.AssetType} – ${ASSET_TYPE_LABELS[asset.AssetType] || ''}`} />
              <F label="Status"     value={asset.Status} />
              <F label="Country"    value={asset.Country} />
              <F label="Office"     value={asset.OfficeCode} />
            </div>
          </Card>

          {/* Hardware */}
          <Card title="Hardware" icon={<LaptopRegular />}>
            <div className={styles.fieldGrid}>
              <F label="Serial Number" value={asset.SerialNumber} mono />
              <F label="Model"         value={asset.Model} />
              <F label="Vendor"        value={asset.Vendor} />
            </div>
          </Card>

          {/* Procurement */}
          <Card title="Procurement" icon={<MoneyRegular />}>
            <div className={styles.fieldGrid}>
              <F label="PO Number"     value={asset.PONumber} />
              <F label="Invoice No."   value={asset.InvoiceNumber} />
              <F label="Cost"          value={asset.Cost ? `₹${Number(asset.Cost).toLocaleString('en-IN')}` : undefined} />
              <F label="Purchase Date" value={AssetIdGenerator.formatDate(asset.PurchaseDate)} />
              <F label="Warranty Exp." value={
                asset.WarrantyExpiry
                  ? `${AssetIdGenerator.formatDate(asset.WarrantyExpiry)} (${daysLeft >= 0 ? `${daysLeft}d left` : 'EXPIRED'})`
                  : undefined
              } />
            </div>
            {asset.PurchaseBillUrl && (
              <a href={asset.PurchaseBillUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                <AttachRegular /> View purchase bill
              </a>
            )}
          </Card>

          {/* Repair history */}
          <Card title="Repair History" icon={<WrenchRegular />}>
            {loadingRepairs
              ? <Spinner size={SpinnerSize.small} label="Loading…" />
              : repairs.length === 0
                ? <span style={{ fontSize: 12, color: '#707070' }}>No repair records.</span>
                : repairs.map(r => (
                    <div key={r.Id} className={styles.repairEntry}>
                      <div className={styles.repairHeader}>
                        <span style={{ fontWeight: 600 }}>{AssetIdGenerator.formatDate(r.RepairDate)}</span>
                        <span style={{ fontSize: 12, color: '#707070' }}>{r.RepairVendor}</span>
                      </div>
                      <span style={{ fontSize: 12 }}>{r.IssueDescription}</span>
                      {r.Resolution && (
                        <span style={{ fontSize: 12, color: '#107c10', display: 'block' }}>
                          Resolution: {r.Resolution}
                        </span>
                      )}
                      {r.RepairCost > 0 && (
                        <span style={{ fontSize: 12, color: '#707070', display: 'block' }}>
                          ₹{r.RepairCost.toLocaleString('en-IN')}
                        </span>
                      )}
                      {r.AttachmentUrl && (
                        <a href={r.AttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                          <AttachRegular /> View attachment
                        </a>
                      )}
                      <Separator />
                    </div>
                  ))
            }
          </Card>

          {/* Gifted details (conditional — loaded from Asset_Gifted) */}
          {showGifted && (
            <Card title="Gifted Details" icon={<DocumentRegular />}>
              {loadingGifted ? (
                <Spinner size={SpinnerSize.small} label="Loading…" />
              ) : gifted ? (
                <>
                  <div className={styles.fieldGrid}>
                    <F label="Gifted To"   value={gifted.GiftedTo} />
                    <F label="Gifted Date" value={AssetIdGenerator.formatDate(gifted.GiftedDate || '')} />
                    <F label="Remarks"     value={gifted.GiftRemarks} />
                  </div>
                  {gifted.GiftAttachmentUrl && (
                    <a href={gifted.GiftAttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                      <AttachRegular /> Authorisation letter
                    </a>
                  )}
                  <DefaultButton
                    iconProps={{ iconName: 'Edit' }}
                    onClick={() => { setGiftedDraft({ ...gifted }); setShowGiftedDlg(true); }}
                    style={{ marginTop: 8 }}
                  >
                    Edit Gifted Details
                  </DefaultButton>
                </>
              ) : (
                <DefaultButton
                  iconProps={{ iconName: 'Add' }}
                  onClick={() => { setGiftedDraft({ Title: asset.Title, AssetItemId: asset.Id }); setShowGiftedDlg(true); }}
                >
                  Add Gifted Details
                </DefaultButton>
              )}
            </Card>
          )}

          {/* Scrap details (conditional — loaded from Asset_Scrap) */}
          {showScrap && (
            <Card title="Scrap / Disposal Details" icon={<LeafThreeRegular />}>
              {loadingScrap ? (
                <Spinner size={SpinnerSize.small} label="Loading…" />
              ) : scrap ? (
                <>
                  <div className={styles.fieldGrid}>
                    <F label="Scrap Date"   value={AssetIdGenerator.formatDate(scrap.ScrapDate || '')} />
                    <F label="Scrap Vendor" value={scrap.ScrapVendor} />
                    <F label="Scrap Amount" value={scrap.ScrapAmount ? `₹${Number(scrap.ScrapAmount).toLocaleString('en-IN')}` : undefined} />
                    <F label="Remarks"      value={scrap.ScrapRemarks} />
                  </div>
                  {scrap.ScrapAttachmentUrl && (
                    <a href={scrap.ScrapAttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                      <AttachRegular /> Certificate / Document
                    </a>
                  )}
                  <DefaultButton
                    iconProps={{ iconName: 'Edit' }}
                    onClick={() => { setScrapDraft({ ...scrap }); setShowScrapDlg(true); }}
                    style={{ marginTop: 8 }}
                  >
                    Edit Scrap Details
                  </DefaultButton>
                </>
              ) : (
                <DefaultButton
                  iconProps={{ iconName: 'Add' }}
                  onClick={() => { setScrapDraft({ Title: asset.Title, AssetItemId: asset.Id }); setShowScrapDlg(true); }}
                >
                  Add Scrap Details
                </DefaultButton>
              )}
            </Card>
          )}

          {/* Remarks */}
          {asset.Remarks && (
            <Card title="Remarks" icon={<NoteRegular />}>
              <p className={styles.remarks}>{asset.Remarks}</p>
            </Card>
          )}
        </div>

        {/* ══ RIGHT PANEL — Assignment + History ══ */}
        <div className={styles.rightPanel}>

          {/* ── Current Assignment ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}><PersonRegular /> Current Assignment</div>
            {loadingAssign ? (
              <Spinner size={SpinnerSize.small} label="Loading…" />
            ) : assignment ? (
              <>
                <div className={styles.fieldGrid}>
                  <F label="Assigned To"  value={assignment.AssignedTo} />
                  <F label="Email"        value={assignment.AssignedToEmail} />
                  <F label="Department"   value={assignment.Department} />
                  <F label="Location"     value={assignment.AssetLocation} />
                  <F label="Assigned On"  value={AssetIdGenerator.formatDate(assignment.DateOfAssignment)} />
                </div>
                <DefaultButton
                  iconProps={{ iconName: 'Edit' }}
                  onClick={() => onEditAssignment(assignment)}
                  style={{ marginTop: 10 }}
                >
                  Edit Assignment
                </DefaultButton>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12, color: '#707070', display: 'block', marginBottom: 8 }}>
                  Not currently assigned.
                </span>
                <DefaultButton iconProps={{ iconName: 'Add' }} onClick={() => onEditAssignment(null)}>
                  Assign Now
                </DefaultButton>
              </>
            )}
          </div>

          {/* ── Maintenance Schedule ── */}
          {assignment && (
            <div className={styles.card} style={{ marginTop: 16 }}>
              <div className={styles.cardTitle}><CalendarRegular /> Maintenance Schedule</div>
              <div className={styles.fieldGrid}>
                <F label="Last Maintenance" value={AssetIdGenerator.formatDate(assignment.LastMaintenanceDate || '')} />
                <F label="Next Maintenance" value={AssetIdGenerator.formatDate(assignment.NextMaintenanceDate || '')} />
              </div>
              {assignment.Remarks && (
                <p className={styles.remarks} style={{ marginTop: 8 }}>{assignment.Remarks}</p>
              )}
            </div>
          )}

          {/* ── Attachments ── */}
          <AssetAttachmentSection
            assetId={asset.Title}
            asset={asset}
            repairs={repairs}
            fileService={fileService}
          />

          {/* ── Change History ── */}
          <div className={styles.card} style={{ marginTop: 16 }}>
            <div className={styles.cardTitle}><HistoryRegular /> Change History</div>
            {loadingHist ? (
              <Spinner size={SpinnerSize.small} label="Loading history…" />
            ) : history.length === 0 ? (
              <span style={{ fontSize: 12, color: '#707070' }}>No history recorded yet.</span>
            ) : (
              <div className={styles.timeline}>
                {history.map((h, i) => (
                  <div key={h.Id ?? i} className={styles.timelineItem}>
                    <div className={styles.timelineDot}>{historyIcon(h)}</div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineAction}>
                        {h.PreviousStatus && h.NewStatus
                          ? <><strong>{h.PreviousStatus}</strong>{' → '}<strong>{h.NewStatus}</strong></>
                          : h.NewStatus
                            ? <strong>Created ({h.NewStatus})</strong>
                            : <strong>Updated</strong>
                        }
                      </div>
                      <div className={styles.timelineMeta}>
                        {h.ChangedBy} · {AssetIdGenerator.formatDate(h.ChangeDate)}
                      </div>
                      {h.HistoryNotes && (
                        <div className={styles.timelineNote}>{h.HistoryNotes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Change Dialog ── */}
      <Dialog
        hidden={!showStatusDlg}
        onDismiss={() => { setShowStatusDlg(false); setNewStatus(null); setStatusNote(''); setNoteErr(''); }}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Change Asset Status',
        }}
        modalProps={{ isBlocking: false }}
        styles={{ main: { minWidth: 480 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <span style={{ fontSize: 12, color: '#707070' }}>Current status: <strong>{asset.Status}</strong></span>
          <Dropdown
            label="New Status *"
            selectedKey={newStatus || ''}
            options={[
              { key: '', text: 'Select next status…' },
              ...validTransitions.map(s => ({ key: s, text: s })),
            ]}
            onChange={(_e, option) => {
              const val = option?.key as string;
              setNewStatus(val ? val as AssetStatus : null);
              setNoteErr('');
            }}
          />
          <TextField
            label={`Notes${newStatus && STATUS_REQUIRES_NOTE.includes(newStatus) ? ' *' : ''}`}
            errorMessage={noteErr}
            multiline
            rows={3}
            value={statusNote}
            onChange={(_e, v) => setStatusNote(v || '')}
            placeholder="Reason for status change…"
          />
          {newStatus && (
            <MessageBar messageBarType={MessageBarType.info}>
              Status will change: <strong>{asset.Status}</strong> → <strong>{newStatus}</strong>
            </MessageBar>
          )}
        </div>
        <DialogFooter>
          <PrimaryButton
            onClick={confirmStatusChange}
            disabled={!newStatus || changing}
          >
            {changing ? 'Changing…' : 'Confirm'}
          </PrimaryButton>
          <DefaultButton onClick={() => { setShowStatusDlg(false); setNewStatus(null); setStatusNote(''); }}>
            Cancel
          </DefaultButton>
        </DialogFooter>
      </Dialog>

      {/* ── Gifted Details Dialog ── */}
      <GiftedDialog
        open={showGiftedDlg}
        draft={giftedDraft}
        saving={savingGifted}
        onChange={setGiftedDraft}
        onConfirm={handleSaveGifted}
        onClose={() => setShowGiftedDlg(false)}
        fileService={fileService}
        assetId={asset.Title}
      />

      {/* ── Scrap Details Dialog ── */}
      <ScrapDialog
        open={showScrapDlg}
        draft={scrapDraft}
        saving={savingScrap}
        onChange={setScrapDraft}
        onConfirm={handleSaveScrap}
        onClose={() => setShowScrapDlg(false)}
        fileService={fileService}
        assetId={asset.Title}
      />
    </div>
  );
};

export default AssetDetail;
