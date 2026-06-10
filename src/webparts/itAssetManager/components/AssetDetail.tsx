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
  ArrowLeftRegular, EditRegular, ArrowSwapRegular,
  TagRegular, LaptopRegular, MoneyRegular, PersonRegular,
  NoteRegular, WrenchRegular, DocumentRegular, LeafThreeRegular,
  BoxRegular, AddRegular, AttachRegular, CalendarRegular,
  HistoryRegular,
} from '@fluentui/react-icons';
import {
  IAsset, AssetStatus, ASSET_STATUS_TRANSITIONS, STATUS_BADGE_COLORS,
  STATUS_REQUIRES_NOTE, ASSET_TYPE_LABELS,
} from '../models/IAsset';
import { IAssetHistory } from '../models/IAssetHistory';
import { IAssetAssignment } from '../models/IAssetAssignment';
import { IRepairEntry } from '../models/IRepairEntry';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetDetail.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IAssetDetailProps {
  asset: IAsset;
  assetService: AssetService;
  repairService: AssetRepairService;
  assignmentService: AssetAssignmentService;
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

// ── Main component ─────────────────────────────────────────────────────────────

const AssetDetail: React.FC<IAssetDetailProps> = ({
  asset, assetService, repairService, assignmentService,
  currentUser, onBack, onEdit, onEditAssignment, onStatusChange,
}) => {
  const [history, setHistory]           = useState<IAssetHistory[]>([]);
  const [repairs, setRepairs]           = useState<IRepairEntry[]>([]);
  const [assignment, setAssignment]     = useState<IAssetAssignment | null>(null);
  const [loadingHist, setLoadingHist]   = useState(true);
  const [loadingRepairs, setLoadingRepairs] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(true);

  const [showStatusDlg, setShowStatusDlg] = useState(false);
  const [newStatus, setNewStatus]       = useState<AssetStatus | null>(null);
  const [statusNote, setStatusNote]     = useState('');
  const [changing, setChanging]         = useState(false);
  const [noteErr, setNoteErr]           = useState('');

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

  useEffect(() => { loadData(); }, [loadData]);

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

  const daysLeft = AssetIdGenerator.daysUntilWarrantyExpiry(asset.WarrantyExpiry);

  const historyIcon = (action: string): string => {
    switch (action) {
      case 'Created':       return '＋';
      case 'StatusChanged': return '⇄';
      case 'Assigned':      return '👤';
      case 'Unassigned':    return '↩';
      default:              return '✎';
    }
  };

  // ── Derived visibility flags ────────────────────────────────────────────────

  const showGifted   = asset.Status === 'Gifted';
  const showTransfer = asset.Status === 'Transferred';
  const showScrap    = asset.Status === 'Scrapped' || asset.Status === 'Disposed';
  const hasStockData = !!(asset.DateAddedToStock || asset.ConditionAtStockEntry || asset.StockRemarks);

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
                <AttachRegular /> {asset.PurchaseBillName || 'View purchase bill'}
              </a>
            )}
          </Card>

          {/* Stock details (conditional) */}
          {hasStockData && (
            <Card title="Stock / In-Store Details" icon={<BoxRegular />}>
              <div className={styles.fieldGrid}>
                <F label="Date Added to Stock" value={AssetIdGenerator.formatDate(asset.DateAddedToStock || '')} />
                <F label="Condition"           value={asset.ConditionAtStockEntry} />
                <F label="Remarks"             value={asset.StockRemarks} />
              </div>
            </Card>
          )}

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
                      {r.RepairCost > 0 && (
                        <span style={{ fontSize: 12, color: '#707070', display: 'block' }}>
                          ₹{r.RepairCost.toLocaleString('en-IN')}
                          {r.RepairInvoiceNumber && ` · Inv: ${r.RepairInvoiceNumber}`}
                        </span>
                      )}
                      {r.AttachmentUrl && (
                        <a href={r.AttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                          <AttachRegular /> {r.AttachmentName || 'View attachment'}
                        </a>
                      )}
                      <Separator />
                    </div>
                  ))
            }
          </Card>

          {/* Gifted details (conditional) */}
          {showGifted && (
            <Card title="Gifted Details" icon={<DocumentRegular />}>
              <div className={styles.fieldGrid}>
                <F label="Gifted To"     value={asset.GiftedTo} />
                <F label="Gifted Date"   value={AssetIdGenerator.formatDate(asset.GiftedDate || '')} />
                <F label="Authorised By" value={asset.GiftedAuthorisedBy} />
                <F label="Remarks"       value={asset.GiftedRemarks} />
              </div>
              {asset.GiftedAttachmentUrl && (
                <a href={asset.GiftedAttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                  <AttachRegular /> Authorisation letter
                </a>
              )}
            </Card>
          )}

          {/* Transfer details (conditional) */}
          {showTransfer && (
            <Card title="Transfer of Ownership" icon={<ArrowSwapRegular />}>
              <div className={styles.fieldGrid}>
                <F label="Transferred From" value={asset.TransferredFrom} />
                <F label="Transferred To"   value={asset.TransferredTo} />
                <F label="Transfer Date"    value={AssetIdGenerator.formatDate(asset.TransferDate || '')} />
                <F label="Reason"           value={asset.TransferReason} />
              </div>
              {asset.TransferAttachmentUrl && (
                <a href={asset.TransferAttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                  <AttachRegular /> Transfer letter
                </a>
              )}
            </Card>
          )}

          {/* Scrap details (conditional) */}
          {showScrap && (
            <Card title="Scrap / Disposal Details" icon={<LeafThreeRegular />}>
              <div className={styles.fieldGrid}>
                <F label="Scrap Date"         value={AssetIdGenerator.formatDate(asset.ScrapDate || '')} />
                <F label="Scrap Vendor"        value={asset.ScrapVendor} />
                <F label="Scrap Invoice"       value={asset.ScrapInvoiceNumber} />
                <F label="Scrap PO"            value={asset.ScrapPONumber} />
                <F label="Scrap Amount"        value={asset.ScrapAmount ? `₹${Number(asset.ScrapAmount).toLocaleString('en-IN')}` : undefined} />
                <F label="E-Waste Cert. No."   value={asset.EWasteCertNumber} />
              </div>
              {asset.ScrapAttachmentUrl && (
                <a href={asset.ScrapAttachmentUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                  <AttachRegular /> E-Waste certificate
                </a>
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
              {assignment.MaintenanceNotes && (
                <p className={styles.remarks} style={{ marginTop: 8 }}>{assignment.MaintenanceNotes}</p>
              )}
            </div>
          )}

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
                    <div className={styles.timelineDot}>{historyIcon(h.Action)}</div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineAction}>
                        {h.Action === 'StatusChanged'
                          ? <><strong>{h.PreviousStatus}</strong>{' → '}<strong>{h.NewStatus}</strong></>
                          : <strong>{h.Action}</strong>
                        }
                      </div>
                      <div className={styles.timelineMeta}>
                        {h.ChangedBy} · {AssetIdGenerator.formatDate(h.ChangedDate)}
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
    </div>
  );
};

export default AssetDetail;
