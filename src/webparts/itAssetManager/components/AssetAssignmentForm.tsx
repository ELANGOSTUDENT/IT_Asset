import * as React from 'react';
import { useState } from 'react';
import {
  Spinner, SpinnerSize,
  MessageBar, MessageBarType,
  DefaultButton, PrimaryButton, IconButton,
  TextField, Dropdown,
} from '@fluentui/react';
import {
  ArrowLeftRegular, PersonRegular, CalendarRegular, NoteRegular,
} from '@fluentui/react-icons';
import { IAsset, DEPT_OPTIONS, LOCATION_OPTIONS } from '../models/IAsset';
import { IAssetAssignment, emptyAssignment } from '../models/IAssetAssignment';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
import styles from './AssetAssignmentForm.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IAssetAssignmentFormProps {
  asset: IAsset;
  existingAssignment?: IAssetAssignment;
  assignmentService: AssetAssignmentService;
  onSave: (assignment: IAssetAssignment) => Promise<void>;
  onCancel: () => void;
}

type AssignmentErrors = Partial<Record<keyof IAssetAssignment | 'form', string>>;

// ── Inline date field ──────────────────────────────────────────────────────────

interface IDateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  error?: string;
}

const DateField: React.FC<IDateFieldProps> = ({ label, value, onChange, error }) => (
  <div>
    <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>{label}</label>
    <input
      type="date"
      value={value ? value.slice(0, 10) : ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? new Date(v + 'T00:00:00').toISOString() : '');
      }}
      style={{
        width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14,
        fontFamily: 'inherit', color: '#242424',
        border: `1px solid ${error ? '#d13438' : '#d1d1d1'}`,
        background: '#fff',
        boxSizing: 'border-box',
      }}
    />
    {error && <span style={{ color: '#d13438', fontSize: 12, display: 'block', marginTop: 4 }}>{error}</span>}
  </div>
);

// ── Section card ───────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className={styles.section}>
    <div className={styles.sectionTitle}>{icon} {title}</div>
    {children}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const AssetAssignmentForm: React.FC<IAssetAssignmentFormProps> = ({
  asset, existingAssignment, assignmentService, onSave, onCancel,
}) => {
  const isEdit = !!existingAssignment;
  const [form, setForm] = useState<IAssetAssignment>(
    existingAssignment
      ? { ...existingAssignment }
      : emptyAssignment(asset.Title, asset.Id ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<AssignmentErrors>({});

  const set = <K extends keyof IAssetAssignment>(key: K, value: IAssetAssignment[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: AssignmentErrors = {};
    if (!form.AssignedTo?.trim())      e.AssignedTo      = 'Assigned To is required.';
    else if (form.IsGuestUser && form.AssignedTo.trim().split(/\s+/).length < 2)
      e.AssignedTo = 'Guest user name must include at least first and last name.';
    if (!form.AssignedToEmail?.trim()) e.AssignedToEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.AssignedToEmail.trim()))
      e.AssignedToEmail = 'Enter a valid email address.';
    if (!form.Department?.trim())      e.Department      = 'Department is required.';
    if (!form.DateOfAssignment)        e.DateOfAssignment = 'Date of assignment is required.';
    if (form.NextMaintenanceDate && form.LastMaintenanceDate &&
        new Date(form.NextMaintenanceDate) < new Date(form.LastMaintenanceDate))
      e.NextMaintenanceDate = 'Next maintenance must be after last maintenance.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let saved: IAssetAssignment;
      if (isEdit && existingAssignment?.Id !== undefined) {
        await assignmentService.updateAssignment(existingAssignment.Id, form);
        saved = form;
      } else {
        saved = await assignmentService.addAssignment(form);
      }
      await onSave(saved);
    } catch {
      setErrors({ form: 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <IconButton iconProps={{ iconName: 'Back' }} onClick={onCancel} />
        <div>
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            {isEdit ? 'Edit Assignment' : 'Assign Asset'}
          </span>
          <div className={styles.assetMeta}>
            <span className={styles.assetIdChip}>{asset.Title}</span>
            <span>{asset.Model}</span>
            <span style={{ color: '#707070' }}>S/N: {asset.SerialNumber}</span>
          </div>
        </div>
      </div>

      {errors.form && (
        <MessageBar messageBarType={MessageBarType.error}>{errors.form}</MessageBar>
      )}

      <div className={styles.form}>

        {/* ── Read-only asset reference ── */}
        <div className={styles.assetRefCard}>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Asset ID</span>
            <span className={styles.refValue} style={{ fontFamily: 'monospace', fontWeight: 700 }}>{asset.Title}</span>
          </div>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Serial Number</span>
            <span className={styles.refValue}>{asset.SerialNumber}</span>
          </div>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Model</span>
            <span className={styles.refValue}>{asset.Model}</span>
          </div>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Current Status</span>
            <span className={styles.refValue}>{asset.Status}</span>
          </div>
        </div>

        {/* ── Assignment ── */}
        <Section title="Assignment Details" icon={<PersonRegular />}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={!!form.IsGuestUser}
                onChange={e => set('IsGuestUser', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Is External / Guest User
            </label>
            {form.IsGuestUser && (
              <span style={{ fontSize: 12, color: '#7d4900', display: 'block', marginTop: 4, marginLeft: 24 }}>
                Guest user — full name (2+ words) and valid email required.
              </span>
            )}
          </div>
          <div className={styles.grid}>
            <TextField
              label="Assigned To *"
              value={form.AssignedTo}
              onChange={(_e, v) => set('AssignedTo', v || '')}
              placeholder={form.IsGuestUser ? 'First Last (full name required)' : 'Full name'}
              errorMessage={errors.AssignedTo}
            />

            <TextField
              label="Email *"
              type="email"
              value={form.AssignedToEmail}
              onChange={(_e, v) => set('AssignedToEmail', v || '')}
              placeholder={form.IsGuestUser ? 'guest@external.com' : 'user@zoomrx.com'}
              errorMessage={errors.AssignedToEmail}
            />

            <Dropdown
              label="Department *"
              selectedKey={form.Department || ''}
              options={[
                { key: '', text: 'Select department…' },
                ...DEPT_OPTIONS.map(d => ({ key: d, text: d })),
              ]}
              onChange={(_e, option) => set('Department', option?.key as string || '')}
              errorMessage={errors.Department}
            />

            <Dropdown
              label="Location"
              selectedKey={form.AssetLocation || ''}
              options={[
                { key: '', text: 'Select location…' },
                ...LOCATION_OPTIONS.map(l => ({ key: l, text: l })),
              ]}
              onChange={(_e, option) => set('AssetLocation', option?.key as string || '')}
            />

            <DateField
              label="Date of Assignment *"
              value={form.DateOfAssignment}
              onChange={v => set('DateOfAssignment', v)}
              required
              error={errors.DateOfAssignment}
            />
          </div>
        </Section>

        {/* ── Maintenance Schedule ── */}
        <Section title="Maintenance Schedule" icon={<CalendarRegular />}>
          <div className={styles.grid}>
            <DateField
              label="Last Maintenance Date"
              value={form.LastMaintenanceDate || ''}
              onChange={v => set('LastMaintenanceDate', v)}
            />
            <DateField
              label="Next Maintenance Date"
              value={form.NextMaintenanceDate || ''}
              onChange={v => set('NextMaintenanceDate', v)}
              error={errors.NextMaintenanceDate}
            />
          </div>
        </Section>

        {/* ── Remarks ── */}
        <Section title="Remarks" icon={<NoteRegular />}>
          <TextField
            multiline
            rows={2}
            value={form.Remarks || ''}
            onChange={(_e, v) => set('Remarks', v || '')}
            placeholder="Any notes about this assignment…"
            maxLength={1000}
          />
        </Section>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <PrimaryButton
          iconProps={{ iconName: 'Save' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Spinner size={SpinnerSize.small} /><span>Saving…</span></span>
            : (isEdit ? 'Update Assignment' : 'Assign Asset')
          }
        </PrimaryButton>
        <DefaultButton onClick={onCancel}>
          {isEdit ? 'Cancel' : 'Skip for Now'}
        </DefaultButton>
        {!isEdit && (
          <span style={{ fontSize: 12, color: '#707070', marginLeft: 4 }}>
            You can assign this asset later from the Asset Detail screen.
          </span>
        )}
      </div>
    </div>
  );
};

export default AssetAssignmentForm;
