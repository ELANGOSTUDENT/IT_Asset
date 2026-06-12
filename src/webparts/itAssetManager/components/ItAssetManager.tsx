import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Pivot, PivotItem,
  Spinner, SpinnerSize,
  MessageBar, MessageBarType,
  DefaultButton, PrimaryButton,
  Dialog, DialogType, DialogFooter,
} from '@fluentui/react';
import { IItAssetManagerProps } from './IItAssetManagerProps';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
import { AssetGiftedService } from '../services/AssetGiftedService';
import { AssetScrapService } from '../services/AssetScrapService';
import { FileUploadService } from '../services/FileUploadService';
import { PowerAutomateService } from '../services/PowerAutomateService';
import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import { IAsset, AssetStatus } from '../models/IAsset';
import { IAssetAssignment } from '../models/IAssetAssignment';
import Dashboard from './Dashboard';
import AssetTable from './AssetTable';
import AssetDetailsForm from './AssetDetailsForm';
import AssetAssignmentForm from './AssetAssignmentForm';
import AssetDetail from './AssetDetail';
import styles from './ItAssetManager.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'dashboard' | 'list' | 'add' | 'edit' | 'assign' | 'edit-assign' | 'detail';

// ── Component ─────────────────────────────────────────────────────────────────

const ItAssetManager: React.FC<IItAssetManagerProps> = (props) => {
  const [view, setView]           = useState<ViewMode>('dashboard');
  const [assets, setAssets]       = useState<IAsset[]>([]);
  const [selected, setSelected]   = useState<IAsset | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [pivotKey, setPivotKey]   = useState<'dashboard' | 'list'>('dashboard');

  // "Assign now?" prompt state (shown after creating a new asset)
  const [assignPromptAsset, setAssignPromptAsset] = useState<IAsset | null>(null);

  // Build services once
  const sp: SPFI = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);
  const siteRelUrl: string = props.context.pageContext.web.serverRelativeUrl;

  const svc        = useMemo(() => new AssetService(props.context), [props.context]);
  const repairSvc  = useMemo(() => new AssetRepairService(sp), [sp]);
  const assignSvc  = useMemo(() => new AssetAssignmentService(sp), [sp]);
  const giftedSvc  = useMemo(() => new AssetGiftedService(sp), [sp]);
  const scrapSvc   = useMemo(() => new AssetScrapService(sp), [sp]);
  const fileSvc    = useMemo(() => new FileUploadService(sp, siteRelUrl), [sp, siteRelUrl]);
  const pa         = useMemo(() => new PowerAutomateService({
    assignmentWebhook:     props.assignmentWebhook,
    lostDeviceWebhook:     props.lostDeviceWebhook,
    warrantyExpiryWebhook: props.warrantyExpiryWebhook,
    scrapEwasteWebhook:    props.scrapEwasteWebhook,
  }), [props.assignmentWebhook, props.lostDeviceWebhook, props.warrantyExpiryWebhook, props.scrapEwasteWebhook]);

  // ── Data loading ─────────────────────────────────────────────────────────────

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await svc.getAssets();
      setAssets(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      setError(`Could not load assets: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [svc]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };

  // ── Asset CRUD handlers ───────────────────────────────────────────────────────

  const handleAddAsset = async (asset: IAsset) => {
    try {
      const created = await svc.addAsset(asset as Parameters<typeof svc.addAsset>[0]);
      await loadAssets();
      notify(`Asset ${created.Title} created.`);
      setSelected(created);
      setAssignPromptAsset(created);  // trigger "Assign now?" prompt
    } catch {
      setError('Failed to create asset.');
    }
  };

  const handleUpdateAsset = async (id: number, changes: Partial<IAsset>) => {
    try {
      await svc.updateAsset(id, changes);
      await loadAssets();
      const refreshed = await svc.getAssetById(id);
      setSelected(refreshed);
      notify('Asset updated.');
      setView('detail');
    } catch {
      setError('Failed to update asset.');
    }
  };

  const handleStatusChange = async (asset: IAsset, newStatus: AssetStatus, notes: string) => {
    try {
      await svc.changeStatus({
        assetId: asset.Title, itemId: asset.Id!,
        previousStatus: asset.Status, newStatus, notes,
        changedBy: props.userDisplayName,
      });

      const updatedAsset = { ...asset, Status: newStatus };
      if (newStatus === 'Active' && updatedAsset.AssignedTo)
        await pa.onAssetAssigned(updatedAsset, props.userDisplayName);
      if (newStatus === 'Lost' || newStatus === 'Stolen')
        await pa.onDeviceLostOrStolen(asset, newStatus, props.userDisplayName);
      if (newStatus === 'Scrapped' || newStatus === 'Disposed')
        await pa.onScrapOrDispose(asset, newStatus, props.userDisplayName);

      await loadAssets();
      const refreshed = await svc.getAssetById(asset.Id!);
      setSelected(refreshed);
      notify(`Status changed to "${newStatus}".`);
    } catch {
      setError('Failed to change status.');
    }
  };

  // ── Assignment handlers ───────────────────────────────────────────────────────

  const handleSaveAssignment = async (assignment: IAssetAssignment) => {
    notify(`Asset ${assignment.Title} assigned to ${assignment.AssignedTo}.`);
    setAssignPromptAsset(null);
    backToList();
  };

  // ── Navigation helpers ────────────────────────────────────────────────────────

  const openDetail = (asset: IAsset) => { setSelected(asset); setView('detail'); };
  const openEdit   = (asset: IAsset) => { setSelected(asset); setView('edit'); };
  const backToList = () => { setSelected(null); setView('list'); setPivotKey('list'); };

  const openEditAssignment = (existing: IAssetAssignment | null) => {
    if (!selected) return;
    setView(existing ? 'edit-assign' : 'assign');
  };

  // ── Initial loading spinner ───────────────────────────────────────────────────

  if (loading && assets.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spinner size={SpinnerSize.large} label="Loading IT Asset Manager…" />
      </div>
    );
  }

  const showPivot = view === 'dashboard' || view === 'list';

  return (
    <div className={styles.root}>
      {/* ── Global notifications ── */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}
      {success && (
        <MessageBar messageBarType={MessageBarType.success}>{success}</MessageBar>
      )}

      {/* ── App header ── */}
      <div className={styles.header}>
        <div>
          <span className={styles.title}>IT Asset Lifecycle Manager</span>
          <span className={styles.subtitle}> · Chennai Office · India</span>
        </div>
        <span className={styles.badge}>{assets.length} Assets</span>
      </div>

      {/* ── Tab pivot (dashboard / list only) ── */}
      {showPivot && (
        <Pivot
          selectedKey={pivotKey}
          onLinkClick={(item) => {
            const key = item?.props.itemKey as 'dashboard' | 'list';
            setPivotKey(key);
            setView(key);
          }}
          className={styles.pivot}
        >
          <PivotItem headerText="Dashboard"  itemKey="dashboard" itemIcon="ViewDashboard" />
          <PivotItem headerText="All Assets" itemKey="list"      itemIcon="List" />
        </Pivot>
      )}

      {/* ── Views ── */}
      {view === 'dashboard' && (
        <Dashboard
          assets={assets}
          assetService={svc}
          onViewAll={() => { setView('list'); setPivotKey('list'); }}
          onViewAsset={openDetail}
        />
      )}

      {view === 'list' && (
        <AssetTable
          assets={assets}
          loading={loading}
          onAddNew={() => setView('add')}
          onView={openDetail}
          onEdit={openEdit}
          onRefresh={loadAssets}
        />
      )}

      {view === 'add' && (
        <AssetDetailsForm
          defaultCountry={props.defaultCountry}
          defaultOffice={props.defaultOffice}
          assetService={svc}
          repairService={repairSvc}
          fileService={fileSvc}
          onSave={handleAddAsset}
          onCancel={backToList}
        />
      )}

      {view === 'edit' && selected && (
        <AssetDetailsForm
          asset={selected}
          defaultCountry={props.defaultCountry}
          defaultOffice={props.defaultOffice}
          assetService={svc}
          repairService={repairSvc}
          fileService={fileSvc}
          onSave={(changes) => handleUpdateAsset(selected.Id!, changes)}
          onCancel={() => setView('detail')}
        />
      )}

      {view === 'assign' && selected && (
        <AssetAssignmentForm
          asset={selected}
          assignmentService={assignSvc}
          onSave={handleSaveAssignment}
          onCancel={() => setView('detail')}
        />
      )}

      {view === 'edit-assign' && selected && (
        <AssetAssignmentForm
          asset={selected}
          assignmentService={assignSvc}
          onSave={handleSaveAssignment}
          onCancel={() => setView('detail')}
        />
      )}

      {view === 'detail' && selected && (
        <AssetDetail
          asset={selected}
          assetService={svc}
          repairService={repairSvc}
          assignmentService={assignSvc}
          giftedService={giftedSvc}
          scrapService={scrapSvc}
          fileService={fileSvc}
          currentUser={props.userDisplayName}
          onBack={backToList}
          onEdit={() => openEdit(selected)}
          onEditAssignment={openEditAssignment}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── "Assign Now?" prompt (after creating a new asset) ── */}
      <Dialog
        hidden={!assignPromptAsset}
        onDismiss={() => { setAssignPromptAsset(null); backToList(); }}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Asset Created',
        }}
        modalProps={{ isBlocking: false }}
      >
        <p>
          Asset <strong style={{ fontFamily: 'monospace' }}>{assignPromptAsset?.Title}</strong> has been created successfully.
        </p>
        <p>Would you like to assign it to an employee now?</p>
        <DialogFooter>
          <PrimaryButton
            onClick={() => {
              setView('assign');
              setAssignPromptAsset(null);
            }}
          >
            Yes, Assign Now
          </PrimaryButton>
          <DefaultButton onClick={() => { setAssignPromptAsset(null); backToList(); }}>
            No, Assign Later
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ItAssetManager;
