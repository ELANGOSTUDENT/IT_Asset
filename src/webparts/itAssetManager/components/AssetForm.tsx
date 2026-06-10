import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Stack, TextField, Dropdown, IDropdownOption,
  DatePicker, defaultDatePickerStrings,
  PrimaryButton, DefaultButton,
  MessageBar, MessageBarType,
  Spinner, SpinnerSize, Text, Icon,
  Label,
} from '@fluentui/react';
import { IAsset, AssetType, AssetStatus, ASSET_TYPE_LABELS } from '../models/IAsset';
import { AssetService } from '../services/AssetService';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetForm.module.scss';

interface IAssetFormProps {
  asset?: IAsset;
  defaultCountry: string;
  defaultOffice: string;
  assetService: AssetService;
  onSave: (asset: IAsset | Partial<IAsset>) => Promise<void>;
  onCancel: () => void;
}

const TYPE_OPTIONS: IDropdownOption[] = (['LAP','MAC','DTP','MON','DOC','MOB','NET','ACC'] as AssetType[])
  .map(t => ({ key: t, text: `${t} – ${ASSET_TYPE_LABELS[t]}` }));

const INITIAL_STATUS_OPTIONS: IDropdownOption[] = (['Procured', 'Stock'] as AssetStatus[])
  .map(s => ({ key: s, text: s }));

const DEPT_OPTIONS: IDropdownOption[] = [
  'Engineering','Product','Design','Data Science','Sales','Marketing',
  'HR','Finance','Operations','Legal','IT','Management','Customer Success',
].map(d => ({ key: d, text: d }));

const LOCATION_OPTIONS: IDropdownOption[] = [
  'Chennai - Nungambakkam',
  'Chennai - WFH',
  'Remote',
  'Warehouse',
  'Other',
].map(l => ({ key: l, text: l }));

const empty: Partial<IAsset> = {
  SerialNumber: '', Model: '', Vendor: '', PONumber: '', InvoiceNumber: '',
  Cost: 0, PurchaseDate: '', WarrantyExpiry: '',
  AssignedTo: '', AssignedToEmail: '',
  Department: '', AssetLocation: '', Remarks: '',
  Status: 'Procured', AssetType: undefined as any, Country: 'IN', OfficeCode: 'CHN',
};

const AssetForm: React.FC<IAssetFormProps> = ({ asset, defaultCountry, defaultOffice, assetService, onSave, onCancel }) => {
  const isEdit = !!asset;
  const [form, setForm]       = useState<Partial<IAsset>>(asset ? { ...asset } : { ...empty, Country: defaultCountry, OfficeCode: defaultOffice });
  const [previewId, setPreviewId] = useState<string>('');
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState(false);

  // Recompute preview ID when type/country/office changes (add mode only)
  useEffect(() => {
    if (isEdit || !form.AssetType || !form.Country || !form.OfficeCode) {
      setPreviewId('');
      return;
    }
    setLoadingId(true);
    assetService.getNextSequenceNumber(form.AssetType, form.Country!, form.OfficeCode!)
      .then(seq => {
        setPreviewId(AssetIdGenerator.generate(form.AssetType!, form.Country!, form.OfficeCode!, seq));
      })
      .catch(() => setPreviewId('—'))
      .finally(() => setLoadingId(false));
  }, [form.AssetType, form.Country, form.OfficeCode, isEdit]);

  const set = (key: keyof IAsset, value: any) => setForm(f => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.AssetType)    e.AssetType    = 'Asset type is required.';
    if (!form.SerialNumber?.trim()) e.SerialNumber = 'Serial number is required.';
    if (!form.Model?.trim())        e.Model        = 'Model is required.';
    if (!form.Vendor?.trim())       e.Vendor       = 'Vendor is required.';
    if (!form.PurchaseDate)         e.PurchaseDate = 'Purchase date is required.';
    if (!form.Country?.trim())      e.Country      = 'Country code is required.';
    if (!form.OfficeCode?.trim())   e.OfficeCode   = 'Office code is required.';
    if (form.WarrantyExpiry && form.PurchaseDate && new Date(form.WarrantyExpiry) <= new Date(form.PurchaseDate)) {
      e.WarrantyExpiry = 'Warranty expiry must be after purchase date.';
    }
    if (form.Cost && form.Cost < 0) e.Cost = 'Cost cannot be negative.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form as IAsset);
    } finally {
      setSaving(false);
    }
  };

  const parseDate = (iso: string): Date | undefined => iso ? new Date(iso) : undefined;

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <DefaultButton iconProps={{ iconName: 'Back' }} onClick={onCancel} className={styles.backBtn} />
        <div>
          <Text variant="xLarge" className={styles.title}>
            {isEdit ? `Edit Asset — ${asset!.Title}` : 'Add New Asset'}
          </Text>
          {!isEdit && (
            <div className={styles.idPreview}>
              <Icon iconName="Tag" />
              {loadingId ? <Spinner size={SpinnerSize.xSmall} /> : (
                <span>Asset ID will be: <strong>{previewId || '(select type first)'}</strong></span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.form}>
        {/* Section: Asset Classification */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Icon iconName="Tag" /> Classification</div>
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Stack.Item grow styles={{ root: { minWidth: 200 } }}>
              <Dropdown
                label="Asset Type *"
                options={TYPE_OPTIONS}
                selectedKey={form.AssetType || null}
                onChange={(_e, o) => set('AssetType', o?.key)}
                errorMessage={errors.AssetType}
                disabled={isEdit}
              />
            </Stack.Item>
            {!isEdit && (
              <Stack.Item grow styles={{ root: { minWidth: 200 } }}>
                <Dropdown
                  label="Initial Status *"
                  options={INITIAL_STATUS_OPTIONS}
                  selectedKey={form.Status}
                  onChange={(_e, o) => set('Status', o?.key)}
                />
              </Stack.Item>
            )}
            <Stack.Item grow styles={{ root: { minWidth: 120 } }}>
              <TextField
                label="Country Code *"
                value={form.Country || ''}
                onChange={(_e, v) => set('Country', v?.toUpperCase())}
                maxLength={5}
                errorMessage={errors.Country}
                disabled={isEdit}
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 120 } }}>
              <TextField
                label="Office Code *"
                value={form.OfficeCode || ''}
                onChange={(_e, v) => set('OfficeCode', v?.toUpperCase())}
                maxLength={5}
                errorMessage={errors.OfficeCode}
                disabled={isEdit}
              />
            </Stack.Item>
          </Stack>
        </div>

        {/* Section: Hardware Details */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Icon iconName="PC1" /> Hardware Details</div>
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Stack.Item grow styles={{ root: { minWidth: 200 } }}>
              <TextField
                label="Serial Number *"
                value={form.SerialNumber || ''}
                onChange={(_e, v) => set('SerialNumber', v)}
                errorMessage={errors.SerialNumber}
                maxLength={100}
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 200 } }}>
              <TextField
                label="Model *"
                value={form.Model || ''}
                onChange={(_e, v) => set('Model', v)}
                errorMessage={errors.Model}
                maxLength={200}
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 160 } }}>
              <TextField
                label="Vendor *"
                value={form.Vendor || ''}
                onChange={(_e, v) => set('Vendor', v)}
                errorMessage={errors.Vendor}
                maxLength={200}
              />
            </Stack.Item>
          </Stack>
        </div>

        {/* Section: Procurement */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Icon iconName="Money" /> Procurement</div>
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Stack.Item grow styles={{ root: { minWidth: 160 } }}>
              <TextField
                label="PO Number"
                value={form.PONumber || ''}
                onChange={(_e, v) => set('PONumber', v)}
                maxLength={100}
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 160 } }}>
              <TextField
                label="Invoice Number"
                value={form.InvoiceNumber || ''}
                onChange={(_e, v) => set('InvoiceNumber', v)}
                maxLength={100}
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 140 } }}>
              <TextField
                label="Cost (INR)"
                type="number"
                value={String(form.Cost || 0)}
                onChange={(_e, v) => set('Cost', parseFloat(v || '0'))}
                errorMessage={errors.Cost}
                prefix="₹"
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 160 } }}>
              <DatePicker
                label="Purchase Date *"
                value={parseDate(form.PurchaseDate!)}
                onSelectDate={(d) => set('PurchaseDate', d?.toISOString() || '')}
                strings={defaultDatePickerStrings}
                formatDate={(d) => d ? AssetIdGenerator.formatDate(d.toISOString()) : ''}
              />
              {errors.PurchaseDate && <Text className={styles.errText}>{errors.PurchaseDate}</Text>}
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 160 } }}>
              <DatePicker
                label="Warranty Expiry"
                value={parseDate(form.WarrantyExpiry!)}
                onSelectDate={(d) => set('WarrantyExpiry', d?.toISOString() || '')}
                strings={defaultDatePickerStrings}
                formatDate={(d) => d ? AssetIdGenerator.formatDate(d.toISOString()) : ''}
              />
              {errors.WarrantyExpiry && <Text className={styles.errText}>{errors.WarrantyExpiry}</Text>}
            </Stack.Item>
          </Stack>
        </div>

        {/* Section: Assignment */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Icon iconName="Contact" /> Assignment</div>
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Stack.Item grow styles={{ root: { minWidth: 200 } }}>
              <TextField
                label="Assigned To"
                value={form.AssignedTo || ''}
                onChange={(_e, v) => set('AssignedTo', v)}
                maxLength={255}
                placeholder="Full name"
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 220 } }}>
              <TextField
                label="Assigned To Email"
                value={form.AssignedToEmail || ''}
                onChange={(_e, v) => set('AssignedToEmail', v)}
                maxLength={255}
                type="email"
                placeholder="user@company.com"
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 180 } }}>
              <Dropdown
                label="Department"
                options={DEPT_OPTIONS}
                selectedKey={form.Department || null}
                onChange={(_e, o) => set('Department', o?.key)}
                placeholder="Select department"
              />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { minWidth: 180 } }}>
              <Dropdown
                label="Location"
                options={LOCATION_OPTIONS}
                selectedKey={form.AssetLocation || null}
                onChange={(_e, o) => set('AssetLocation', o?.key)}
                placeholder="Select location"
              />
            </Stack.Item>
          </Stack>
        </div>

        {/* Remarks */}
        <div className={styles.section}>
          <TextField
            label="Remarks"
            multiline rows={3}
            value={form.Remarks || ''}
            onChange={(_e, v) => set('Remarks', v)}
            maxLength={2000}
            placeholder="Any additional notes about this asset…"
          />
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <PrimaryButton
          text={saving ? 'Saving…' : (isEdit ? 'Update Asset' : 'Create Asset')}
          onClick={handleSave}
          disabled={saving}
          iconProps={{ iconName: isEdit ? 'Save' : 'Add' }}
        />
        {saving && <Spinner size={SpinnerSize.small} />}
        <DefaultButton text="Cancel" onClick={onCancel} />
      </div>
    </div>
  );
};

export default AssetForm;
