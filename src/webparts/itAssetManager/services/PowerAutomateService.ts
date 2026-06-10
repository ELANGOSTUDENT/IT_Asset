import { IAsset } from '../models/IAsset';

export interface IPowerAutomateConfig {
  assignmentWebhook: string;
  lostDeviceWebhook: string;
  warrantyExpiryWebhook: string;
  scrapEwasteWebhook: string;
}

export class PowerAutomateService {
  constructor(private _cfg: IPowerAutomateConfig) {}

  private async _trigger(url: string, payload: object): Promise<void> {
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, source: 'IT-Asset-Manager-SPFx', timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      console.error('[PA Webhook] Failed:', url, err);
    }
  }

  /** Fires when an asset moves to Active with an assignee. */
  async onAssetAssigned(asset: IAsset, triggeredBy: string): Promise<void> {
    await this._trigger(this._cfg.assignmentWebhook, {
      event: 'AssetAssigned',
      assetId: asset.Title,
      assetType: asset.AssetType,
      model: asset.Model,
      serialNumber: asset.SerialNumber,
      assignedTo: asset.AssignedTo,
      assignedToEmail: asset.AssignedToEmail,
      department: asset.Department,
      location: asset.AssetLocation,
      triggeredBy,
    });
  }

  /** Fires when status changes to Lost or Stolen. */
  async onDeviceLostOrStolen(asset: IAsset, status: 'Lost' | 'Stolen', reportedBy: string): Promise<void> {
    await this._trigger(this._cfg.lostDeviceWebhook, {
      event: status === 'Lost' ? 'DeviceLost' : 'DeviceStolen',
      assetId: asset.Title,
      assetType: asset.AssetType,
      model: asset.Model,
      serialNumber: asset.SerialNumber,
      lastAssignedTo: asset.AssignedTo,
      lastAssignedEmail: asset.AssignedToEmail,
      department: asset.Department,
      cost: asset.Cost,
      reportedBy,
    });
  }

  /** Fires with a batch of assets whose warranty expires within threshold. */
  async onWarrantyExpirySoon(assets: IAsset[]): Promise<void> {
    if (!assets.length) return;
    await this._trigger(this._cfg.warrantyExpiryWebhook, {
      event: 'WarrantyExpirySoon',
      count: assets.length,
      assets: assets.map(a => ({
        assetId: a.Title,
        model: a.Model,
        serialNumber: a.SerialNumber,
        assignedTo: a.AssignedTo,
        warrantyExpiry: a.WarrantyExpiry,
      })),
    });
  }

  /** Fires when an asset is moved to Scrapped or Disposed. */
  async onScrapOrDispose(asset: IAsset, newStatus: 'Scrapped' | 'Disposed', disposedBy: string): Promise<void> {
    await this._trigger(this._cfg.scrapEwasteWebhook, {
      event: newStatus === 'Scrapped' ? 'AssetScrapped' : 'AssetDisposed',
      assetId: asset.Title,
      assetType: asset.AssetType,
      model: asset.Model,
      vendor: asset.Vendor,
      serialNumber: asset.SerialNumber,
      purchaseDate: asset.PurchaseDate,
      cost: asset.Cost,
      department: asset.Department,
      disposedBy,
    });
  }
}
