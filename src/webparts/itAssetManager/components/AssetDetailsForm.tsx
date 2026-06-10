import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Spinner, SpinnerSize,
  DefaultButton, PrimaryButton, IconButton,
  TextField, Dropdown,
  Dialog, DialogType, DialogFooter,
  MessageBar, MessageBarType,
  Separator,
} from '@fluentui/react';
import {
  ArrowLeftRegular, AddRegular, SaveRegular, DeleteRegular,
  AttachRegular, TagRegular, WrenchRegular, MoneyRegular,
  DocumentRegular, ArrowSwapRegular, BoxRegular, LeafThreeRegular,
} from '@fluentui/react-icons';
import {
  IAsset, AssetType, AssetStatus, AssetStatus as AS,
  ASSET_TYPE_LABELS, StockCondition, DEPT_OPTIONS, LOCATION_OPTIONS,
} from '../models/IAsset';
import { IRepairEntry, IRepairEntryDraft, emptyRepairDraft } from '../models/IRepairEntry';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { FileUploadService, IUploadResult } from '../services/FileUploadService';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetDetailsForm.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IAssetDetailsFormProps {
  asset?: IAsset;
  defaultCountry: string;
  defaultOffice: string;
  assetService: AssetService;
  repairService: AssetRepairService;
  fileService: FileUploadService;
  onSave: (asset: IAsset) => Promise<void>;
  onCancel: () => void;
}

type FormErrors = Partial<Record<keyof IAsset | 'form', string>>;

// ── Inline date field ──────────────────────────────────────────────────────────

interface IDateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const DateField: React.FC<IDateFieldProps> = ({ label, value, onChange, error, disabled }) => (
  <div>
    <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>{label}</label>
    <input
      type="date"
      value={value ? value.slice(0, 10) : ''}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? new Date(v + 'T00:00:00').toISOString() : '');
      }}
      style={{
        width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14,
        fontFamily: 'inherit', color: '#242424',
        border: `1px solid ${error ? '#d13438' : '#d1d1d1'}`,
        background: disabled ? '#f5f5f5' : '#fff',
        boxSizing: 'border-box',
      }}
    />
    {error && <span style={{ color: '#d13438', fontSize: 12, display: 'block', marginTop: 4 }}>{error}</span>}
  </div>
);

// ── File attachment field ──────────────────────────────────────────────────────

interface IFileFieldProps {
  label: string;
  existingUrl?: string;
  existingName?: string;
  onFileSelected: (file: File | null) => void;
}

const FileField: React.FC<IFileFieldProps> = ({ label, existingUrl, existingName, onFileSelected }) => (
  <div>
    <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>{label}</label>
    <div className={styles.fileField}>
      <label className={styles.fileLabel}>
        <AttachRegular />
        <span>{existingName || 'Choose file…'}</span>
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
        />
      </label>
      {existingUrl && (
        <a href={existingUrl} target="_blank" rel="noreferrer" className={styles.fileLink}>
          View existing
        </a>
      )}
    </div>
  </div>
);

// ── Section card ───────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className={styles.section}>
    <div className={styles.sectionTitle}>{icon} {title}</div>
    {children}
  </div>
);

// ── Repair entry dialog ────────────────────────────────────────────────────────

interface IRepairDialogProps {
  open: boolean;
  draft: IRepairEntryDraft;
  saving: boolean;
  onDraftChange: (d: IRepairEntryDraft) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const RepairDialog: React.FC<IRepairDialogProps> = ({ open, draft, saving, onDraftChange, onConfirm, onClose }) => {
  const set = <K extends keyof IRepairEntryDraft>(k: K, v: IRepairEntryDraft[K]) =>
    onDraftChange({ ...draft, [k]: v });

  return (
    <Dialog
      hidden={!open}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Add Repair Entry',
      }}
      modalProps={{ isBlocking: false }}
      styles={{ main: { minWidth: 560 } }}
    >
      <div className={styles.dialogGrid}>
        <DateField label="Repair Date *" value={draft.RepairDate} onChange={(v) => set('RepairDate', v)} />
        <TextField
          label="Vendor / Service Centre *"
          value={draft.RepairVendor}
          onChange={(_e, v) => set('RepairVendor', v || '')}
        />
        <TextField
          label="Issue Description *"
          className={styles.fullWidth}
          multiline
          rows={3}
          value={draft.IssueDescription}
          onChange={(_e, v) => set('IssueDescription', v || '')}
        />
        <TextField
          label="Repair Cost (INR)"
          type="number"
          prefix="₹"
          value={String(draft.RepairCost || 0)}
          onChange={(_e, v) => set('RepairCost', parseFloat(v || '0'))}
        />
        <TextField
          label="Invoice Number"
          value={draft.RepairInvoiceNumber}
          onChange={(_e, v) => set('RepairInvoiceNumber', v || '')}
        />
        <div className={styles.fullWidth}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Attachment</label>
          <div className={styles.fileField}>
            <label className={styles.fileLabel}>
              <AttachRegular />
              <span>{draft.AttachmentFile?.name || 'Choose file…'}</span>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => set('AttachmentFile', e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <PrimaryButton onClick={onConfirm} disabled={saving}>
          {saving ? 'Saving…' : 'Add Repair'}
        </PrimaryButton>
        <DefaultButton onClick={onClose}>Cancel</DefaultButton>
      </DialogFooter>
    </Dialog>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS = (['LAP', 'MAC', 'DTP', 'MON', 'DOC', 'MOB', 'NET', 'ACC'] as AssetType[])
  .map(t => ({ value: t, label: `${t} – ${ASSET_TYPE_LABELS[t]}` }));

const INITIAL_STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: 'Procured', label: 'Procured' },
  { value: 'Stock',    label: 'Stock' },
];

const CONDITION_OPTIONS: { value: StockCondition; label: string }[] = [
  { value: 'Good',        label: 'Good' },
  { value: 'Refurbished', label: 'Refurbished' },
  { value: 'Damaged',     label: 'Damaged' },
];

const empty = (): Partial<IAsset> => ({
  SerialNumber: '', Model: '', Vendor: '', PONumber: '', InvoiceNumber: '',
  Cost: 0, PurchaseDate: '', WarrantyExpiry: '', Remarks: '',
  Status: 'Procured', Country: 'IN', OfficeCode: 'CHN',
});

const AssetDetailsForm: React.FC<IAssetDetailsFormProps> = ({
  asset, defaultCountry, defaultOffice,
  assetService, repairService, fileService,
  onSave, onCancel,
}) => {
  const isEdit = !!asset;
  const [form, setForm] = useState<Partial<IAsset>>(
    asset ? { ...asset } : { ...empty(), Country: defaultCountry, OfficeCode: defaultOffice }
  );
  const [repairs, setRepairs] = useState<IRepairEntry[]>([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [previewId, setPreviewId] = useState('');
  const [loadingId, setLoadingId] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // File staging
  const [purchaseBillFile, setPurchaseBillFile] = useState<File | null>(null);
  const [giftedFile, setGiftedFile] = useState<File | null>(null);
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [scrapFile, setScrapFile] = useState<File | null>(null);

  // Repair dialog
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [repairDraft, setRepairDraft] = useState<IRepairEntryDraft>(emptyRepairDraft());
  const [savingRepair, setSavingRepair] = useState(false);

  const set = useCallback(<K extends keyof IAsset>(key: K, value: IAsset[K]) =>
    setForm(f => ({ ...f, [key]: value })), []);

  // Live ID preview
  useEffect(() => {
    if (isEdit || !form.AssetType || !form.Country || !form.OfficeCode) {
      setPreviewId(''); return;
    }
    setLoadingId(true);
    assetService.getNextSequenceNumber(form.AssetType, form.Country, form.OfficeCode)
      .then(seq => setPreviewId(AssetIdGenerator.generate(form.AssetType!, form.Country!, form.OfficeCode!, seq)))
      .catch(() => setPreviewId('—'))
      .finally(() => setLoadingId(false));
  }, [form.AssetType, form.Country, form.OfficeCode, isEdit, assetService]);

  // Load existing repairs in edit mode
  const loadRepairs = useCallback(async () => {
    if (!isEdit || !asset?.Title) return;
    setLoadingRepairs(true);
    try {
      const r = await repairService.getRepairs(asset.Title);
      setRepairs(r);
    } finally {
      setLoadingRepairs(false);
    }
  }, [isEdit, asset?.Title, repairService]);

  useEffect(() => { loadRepairs(); }, [loadRepairs]);

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.AssetType)               e.AssetType     = 'Asset type is required.';
    if (!form.SerialNumber?.trim())    e.SerialNumber  = 'Serial number is required.';
    if (!form.Model?.trim())           e.Model         = 'Model is required.';
    if (!form.Vendor?.trim())          e.Vendor        = 'Vendor is required.';
    if (!form.PurchaseDate)            e.PurchaseDate  = 'Purchase date is required.';
    if (!form.Country?.trim())         e.Country       = 'Country code is required.';
    if (!form.OfficeCode?.trim())      e.OfficeCode    = 'Office code is required.';
    if (form.WarrantyExpiry && form.PurchaseDate &&
        new Date(form.WarrantyExpiry) <= new Date(form.PurchaseDate))
      e.WarrantyExpiry = 'Warranty expiry must be after purchase date.';
    if (form.Cost !== undefined && form.Cost < 0)
      e.Cost = 'Cost cannot be negative.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── File upload helper ───────────────────────────────────────────────────────

  const maybeUpload = async (
    assetId: string, sub: string, file: File | null
  ): Promise<IUploadResult | null> => {
    if (!file) return null;
    return fileService.upload(assetId, sub, file);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const assetId = isEdit ? asset!.Title : previewId;
      if (!assetId) { setErrors({ form: 'Asset ID not ready.' }); return; }

      const [billResult, giftResult, transferResult, scrapResult] = await Promise.all([
        maybeUpload(assetId, 'purchase', purchaseBillFile),
        maybeUpload(assetId, 'gifted', giftedFile),
        maybeUpload(assetId, 'transfer', transferFile),
        maybeUpload(assetId, 'scrap', scrapFile),
      ]);

      const payload: Partial<IAsset> = { ...form };
      if (billResult)     { payload.PurchaseBillUrl = billResult.serverRelativeUrl; payload.PurchaseBillName = billResult.fileName; }
      if (giftResult)     { payload.GiftedAttachmentUrl = giftResult.serverRelativeUrl; }
      if (transferResult) { payload.TransferAttachmentUrl = transferResult.serverRelativeUrl; }
      if (scrapResult)    { payload.ScrapAttachmentUrl = scrapResult.serverRelativeUrl; }

      await onSave(payload as IAsset);
    } catch {
      setErrors({ form: 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Add repair entry ──────────────────────────────────────────────────────────

  const handleAddRepair = async () => {
    if (!repairDraft.RepairDate || !repairDraft.RepairVendor || !repairDraft.IssueDescription) return;
    if (!asset?.Id || !asset?.Title) return;
    setSavingRepair(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;
      if (repairDraft.AttachmentFile) {
        const r = await fileService.upload(asset.Title, `repairs/${Date.now()}`, repairDraft.AttachmentFile);
        attachmentUrl = r.serverRelativeUrl;
        attachmentName = r.fileName;
      }
      const entry = await repairService.addRepair({
        Title: asset.Title,
        AssetItemId: asset.Id,
        RepairDate: repairDraft.RepairDate,
        RepairVendor: repairDraft.RepairVendor,
        IssueDescription: repairDraft.IssueDescription,
        RepairCost: repairDraft.RepairCost,
        RepairInvoiceNumber: repairDraft.RepairInvoiceNumber,
        AttachmentUrl: attachmentUrl,
        AttachmentName: attachmentName,
      });
      setRepairs(prev => [entry, ...prev]);
      setRepairDraft(emptyRepairDraft());
      setRepairDialogOpen(false);
    } finally {
      setSavingRepair(false);
    }
  };

  const handleDeleteRepair = async (id: number) => {
    await repairService.deleteRepair(id);
    setRepairs(prev => prev.filter(r => r.Id !== id));
  };

  // ── Derived helpers ───────────────────────────────────────────────────────────

  const status = form.Status as AssetStatus;
  const showGifted    = status === 'Gifted';
  const showTransfer  = status === 'Transferred';
  const showScrap     = status === 'Scrapped' || status === 'Disposed';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <IconButton iconProps={{ iconName: 'Back' }} onClick={onCancel} />
        <div>
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            {isEdit ? `Edit Asset — ${asset!.Title}` : 'Add New Asset'}
          </span>
          {!isEdit && (
            <div className={styles.idPreview}>
              <TagRegular style={{ color: '#0078d4' }} />
              {loadingId
                ? <Spinner size={SpinnerSize.small} />
                : <span>Asset ID will be: <strong>{previewId || '(select type first)'}</strong></span>
              }
            </div>
          )}
        </div>
      </div>

      {errors.form && (
        <MessageBar messageBarType={MessageBarType.error}>{errors.form}</MessageBar>
      )}

      <div className={styles.form}>

        {/* ── Identity ── */}
        <Section title="Identity" icon={<TagRegular />}>
          <div className={styles.grid}>
            <Dropdown
              label="Asset Type *"
              selectedKey={form.AssetType || ''}
              disabled={isEdit}
              options={[
                { key: '', text: 'Select type…' },
                ...TYPE_OPTIONS.map(t => ({ key: t.value, text: t.label })),
              ]}
              onChange={(_e, option) => set('AssetType', option?.key as AssetType)}
              errorMessage={errors.AssetType}
            />

            {isEdit && (
              <TextField
                label="Asset ID"
                value={form.Title || ''}
                disabled
                styles={{ field: { fontFamily: 'monospace', fontWeight: 700 } }}
              />
            )}

            {!isEdit && (
              <Dropdown
                label="Initial Status"
                selectedKey={form.Status || 'Procured'}
                options={INITIAL_STATUS_OPTIONS.map(o => ({ key: o.value, text: o.label }))}
                onChange={(_e, option) => set('Status', option?.key as AS)}
              />
            )}

            <TextField
              label="Serial Number *"
              value={form.SerialNumber || ''}
              onChange={(_e, v) => set('SerialNumber', v || '')}
              maxLength={100}
              errorMessage={errors.SerialNumber}
            />

            <TextField
              label="Model *"
              value={form.Model || ''}
              onChange={(_e, v) => set('Model', v || '')}
              maxLength={200}
              errorMessage={errors.Model}
            />

            <TextField
              label="Vendor *"
              value={form.Vendor || ''}
              onChange={(_e, v) => set('Vendor', v || '')}
              maxLength={200}
              errorMessage={errors.Vendor}
            />

            <TextField
              label="Country Code *"
              value={form.Country || ''}
              disabled={isEdit}
              onChange={(_e, v) => set('Country', (v || '').toUpperCase())}
              maxLength={5}
              errorMessage={errors.Country}
            />

            <TextField
              label="Office Code *"
              value={form.OfficeCode || ''}
              disabled={isEdit}
              onChange={(_e, v) => set('OfficeCode', (v || '').toUpperCase())}
              maxLength={5}
              errorMessage={errors.OfficeCode}
            />
          </div>
        </Section>

        {/* ── Procurement ── */}
        <Section title="Procurement" icon={<MoneyRegular />}>
          <div className={styles.grid}>
            <DateField label="Purchase Date *" value={form.PurchaseDate || ''} onChange={v => set('PurchaseDate', v)} required error={errors.PurchaseDate} />
            <DateField label="Warranty Expiry" value={form.WarrantyExpiry || ''} onChange={v => set('WarrantyExpiry', v)} error={errors.WarrantyExpiry} />

            <TextField
              label="PO Number"
              value={form.PONumber || ''}
              onChange={(_e, v) => set('PONumber', v || '')}
              maxLength={100}
            />

            <TextField
              label="Invoice Number"
              value={form.InvoiceNumber || ''}
              onChange={(_e, v) => set('InvoiceNumber', v || '')}
              maxLength={100}
            />

            <TextField
              label="Cost (INR)"
              type="number"
              prefix="₹"
              value={String(form.Cost ?? 0)}
              onChange={(_e, v) => set('Cost', parseFloat(v || '0'))}
              errorMessage={errors.Cost}
            />

            <FileField
              label="Purchase Bill / Invoice"
              existingUrl={form.PurchaseBillUrl}
              existingName={form.PurchaseBillName}
              onFileSelected={setPurchaseBillFile}
            />
          </div>
        </Section>

        {/* ── Stock / In-Store Details ── */}
        <Section title="Stock / In-Store Details" icon={<BoxRegular />}>
          <div className={styles.grid}>
            <DateField label="Date Added to Stock" value={form.DateAddedToStock || ''} onChange={v => set('DateAddedToStock', v)} />
            <Dropdown
              label="Condition at Stock Entry"
              selectedKey={form.ConditionAtStockEntry || ''}
              options={[
                { key: '', text: 'Select condition…' },
                ...CONDITION_OPTIONS.map(o => ({ key: o.value, text: o.label })),
              ]}
              onChange={(_e, option) => set('ConditionAtStockEntry', option?.key as StockCondition)}
            />
            <TextField
              label="Stock Remarks"
              className={styles.fullWidth}
              multiline
              rows={2}
              value={form.StockRemarks || ''}
              onChange={(_e, v) => set('StockRemarks', v || '')}
              maxLength={1000}
            />
          </div>
        </Section>

        {/* ── Repair History ── */}
        {isEdit && (
          <Section title="Repair History" icon={<WrenchRegular />}>
            {loadingRepairs ? (
              <Spinner size={SpinnerSize.small} label="Loading repairs…" />
            ) : (
              <>
                {repairs.length === 0 && (
                  <span style={{ fontSize: 12, color: '#707070' }}>No repair records yet.</span>
                )}
                {repairs.map(r => (
                  <div key={r.Id} className={styles.repairEntry}>
                    <div className={styles.repairRow}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{AssetIdGenerator.formatDate(r.RepairDate)}</span>
                        <span style={{ fontSize: 12, marginLeft: 8, color: '#707070' }}>{r.RepairVendor}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {r.AttachmentUrl && (
                          <a href={r.AttachmentUrl} target="_blank" rel="noreferrer" className={styles.fileLink}>
                            <AttachRegular /> Invoice
                          </a>
                        )}
                        <IconButton
                          iconProps={{ iconName: 'Delete' }}
                          onClick={() => r.Id !== undefined && handleDeleteRepair(r.Id)}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 12 }}>{r.IssueDescription}</span>
                    {r.RepairCost > 0 && (
                      <span style={{ fontSize: 12, color: '#707070', display: 'block' }}>
                        Cost: ₹{r.RepairCost.toLocaleString('en-IN')}
                        {r.RepairInvoiceNumber && ` · Invoice: ${r.RepairInvoiceNumber}`}
                      </span>
                    )}
                    <Separator />
                  </div>
                ))}
                <DefaultButton
                  iconProps={{ iconName: 'Add' }}
                  onClick={() => { setRepairDraft(emptyRepairDraft()); setRepairDialogOpen(true); }}
                  style={{ marginTop: 8 }}
                >
                  Add Repair Entry
                </DefaultButton>
              </>
            )}
          </Section>
        )}

        {/* ── Gifted Details (conditional) ── */}
        {showGifted && (
          <Section title="Gifted Details" icon={<DocumentRegular />}>
            <div className={styles.grid}>
              <TextField
                label="Gifted To"
                value={form.GiftedTo || ''}
                onChange={(_e, v) => set('GiftedTo', v || '')}
              />
              <DateField label="Gifted Date" value={form.GiftedDate || ''} onChange={v => set('GiftedDate', v)} />
              <TextField
                label="Authorised By"
                value={form.GiftedAuthorisedBy || ''}
                onChange={(_e, v) => set('GiftedAuthorisedBy', v || '')}
              />
              <TextField
                label="Remarks"
                className={styles.fullWidth}
                multiline
                rows={2}
                value={form.GiftedRemarks || ''}
                onChange={(_e, v) => set('GiftedRemarks', v || '')}
              />
              <FileField
                label="Authorisation Letter"
                existingUrl={form.GiftedAttachmentUrl}
                onFileSelected={setGiftedFile}
              />
            </div>
          </Section>
        )}

        {/* ── Transfer of Ownership (conditional) ── */}
        {showTransfer && (
          <Section title="Transfer of Ownership" icon={<ArrowSwapRegular />}>
            <div className={styles.grid}>
              <TextField
                label="Transferred From"
                value={form.TransferredFrom || ''}
                onChange={(_e, v) => set('TransferredFrom', v || '')}
              />
              <TextField
                label="Transferred To"
                value={form.TransferredTo || ''}
                onChange={(_e, v) => set('TransferredTo', v || '')}
              />
              <DateField label="Transfer Date" value={form.TransferDate || ''} onChange={v => set('TransferDate', v)} />
              <TextField
                label="Reason"
                className={styles.fullWidth}
                multiline
                rows={2}
                value={form.TransferReason || ''}
                onChange={(_e, v) => set('TransferReason', v || '')}
              />
              <FileField
                label="Transfer Letter / Form"
                existingUrl={form.TransferAttachmentUrl}
                onFileSelected={setTransferFile}
              />
            </div>
          </Section>
        )}

        {/* ── Scrap / Disposal Details (conditional) ── */}
        {showScrap && (
          <Section title="Scrap / Disposal Details" icon={<LeafThreeRegular />}>
            <div className={styles.grid}>
              <DateField label="Scrap Date" value={form.ScrapDate || ''} onChange={v => set('ScrapDate', v)} />
              <TextField
                label="Scrap Vendor"
                value={form.ScrapVendor || ''}
                onChange={(_e, v) => set('ScrapVendor', v || '')}
              />
              <TextField
                label="Scrap Invoice Number"
                value={form.ScrapInvoiceNumber || ''}
                onChange={(_e, v) => set('ScrapInvoiceNumber', v || '')}
              />
              <TextField
                label="Scrap PO Number"
                value={form.ScrapPONumber || ''}
                onChange={(_e, v) => set('ScrapPONumber', v || '')}
              />
              <TextField
                label="Scrap Amount (INR)"
                type="number"
                prefix="₹"
                value={String(form.ScrapAmount ?? 0)}
                onChange={(_e, v) => set('ScrapAmount', parseFloat(v || '0'))}
              />
              <TextField
                label="E-Waste Certificate Number"
                value={form.EWasteCertNumber || ''}
                onChange={(_e, v) => set('EWasteCertNumber', v || '')}
              />
              <FileField
                label="E-Waste Certificate"
                existingUrl={form.ScrapAttachmentUrl}
                onFileSelected={setScrapFile}
              />
            </div>
          </Section>
        )}

        {/* ── Remarks ── */}
        <Section title="Remarks" icon={<DocumentRegular />}>
          <TextField
            multiline
            rows={3}
            value={form.Remarks || ''}
            onChange={(_e, v) => set('Remarks', v || '')}
            maxLength={2000}
            placeholder="Any additional notes about this asset…"
          />
        </Section>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <PrimaryButton
          iconProps={{ iconName: saving ? undefined : 'Save' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Spinner size={SpinnerSize.small} /><span>{isEdit ? 'Updating…' : 'Creating…'}</span></span>
            : (isEdit ? 'Update Asset' : 'Create Asset')
          }
        </PrimaryButton>
        <DefaultButton onClick={onCancel}>Cancel</DefaultButton>
      </div>

      {/* ── Repair dialog ── */}
      <RepairDialog
        open={repairDialogOpen}
        draft={repairDraft}
        saving={savingRepair}
        onDraftChange={setRepairDraft}
        onConfirm={handleAddRepair}
        onClose={() => setRepairDialogOpen(false)}
      />
    </div>
  );
};

export default AssetDetailsForm;
