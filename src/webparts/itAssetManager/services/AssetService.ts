import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/site-users/web';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAsset, AssetStatus } from '../models/IAsset';
import { IAssetHistory } from '../models/IAssetHistory';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';

const ASSETS_LIST = 'IT_Assets';
const HISTORY_LIST = 'Asset_History';

const ASSET_SELECT = [
  'Id', 'Title', 'SerialNumber', 'Model', 'Vendor', 'PONumber', 'InvoiceNumber',
  'Cost', 'PurchaseDate', 'WarrantyExpiry', 'AssignedTo', 'AssignedToEmail',
  'Department', 'AssetLocation', 'Country', 'OfficeCode', 'Status', 'AssetType',
  'Remarks', 'SequenceNumber', 'Created', 'Modified',
  // Procurement attachment
  'PurchaseBillUrl', 'PurchaseBillName',
  // Stock details
  'DateAddedToStock', 'ConditionAtStockEntry', 'StockRemarks',
  // Gifted details
  'GiftedTo', 'GiftedDate', 'GiftedAuthorisedBy', 'GiftedRemarks', 'GiftedAttachmentUrl',
  // Transfer details
  'TransferredFrom', 'TransferredTo', 'TransferDate', 'TransferReason', 'TransferAttachmentUrl',
  // Scrap / dispose details
  'ScrapDate', 'ScrapVendor', 'ScrapInvoiceNumber', 'ScrapPONumber',
  'ScrapAmount', 'EWasteCertNumber', 'ScrapAttachmentUrl',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAsset = (item: any): IAsset => ({
  ...item,
  AssignedTo: item.AssignedTo || '',
  AssignedToEmail: item.AssignedToEmail || '',
});

export class AssetService {
  private _sp: SPFI;

  constructor(context: WebPartContext) {
    this._sp = spfi().using(SPFx(context));
  }

  // ----------------------------------------------------------------
  // Asset CRUD
  // ----------------------------------------------------------------

  async getAssets(): Promise<IAsset[]> {
    const items = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.top(5000)
      .orderBy('Created', false)();
    return items.map(mapAsset);
  }

  async getAssetById(id: number): Promise<IAsset> {
    const item = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.getById(id)();
    return mapAsset(item);
  }

  async getNextSequenceNumber(type: string, country: string, office: string): Promise<number> {
    const prefix = AssetIdGenerator.getPrefix(type as any, country, office);
    const items = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.filter(`startswith(Title,'${prefix}')`)
      .select('SequenceNumber')
      .orderBy('SequenceNumber', false)
      .top(1)();

    if (!items.length) return 1;
    return (items[0].SequenceNumber || 0) + 1;
  }

  async addAsset(asset: Omit<IAsset, 'Id' | 'Title' | 'SequenceNumber'>): Promise<IAsset> {
    const seq = await this.getNextSequenceNumber(asset.AssetType, asset.Country, asset.OfficeCode);
    const assetId = AssetIdGenerator.generate(asset.AssetType, asset.Country, asset.OfficeCode, seq);

    const payload = { ...asset, Title: assetId, SequenceNumber: seq };
    const result = await this._sp.web.lists.getByTitle(ASSETS_LIST).items.add(payload);

    await this._logHistory({
      Title: assetId,
      Action: 'Created',
      NewStatus: asset.Status,
      ChangedBy: 'System',
      ChangedDate: new Date().toISOString(),
      HistoryNotes: 'Asset created and entered into the system.',
    });

    return { ...payload, Id: result.data.Id };
  }

  async updateAsset(id: number, changes: Partial<IAsset>): Promise<void> {
    await this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).update(changes);
  }

  async deleteAsset(id: number): Promise<void> {
    await this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).recycle();
  }

  // ----------------------------------------------------------------
  // Status lifecycle
  // ----------------------------------------------------------------

  async changeStatus(params: {
    assetId: string;
    itemId: number;
    previousStatus: AssetStatus;
    newStatus: AssetStatus;
    notes: string;
    changedBy: string;
    changedByEmail: string;
    /** Additional field updates (e.g. AssignedTo on Active) */
    extraFields?: Partial<IAsset>;
  }): Promise<void> {
    const { assetId, itemId, previousStatus, newStatus, notes, changedBy, changedByEmail, extraFields } = params;
    await this.updateAsset(itemId, { Status: newStatus, ...extraFields });
    await this._logHistory({
      Title: assetId,
      Action: 'StatusChanged',
      PreviousStatus: previousStatus,
      NewStatus: newStatus,
      ChangedBy: changedBy,
      ChangedByEmail: changedByEmail,
      ChangedDate: new Date().toISOString(),
      HistoryNotes: notes,
    });
  }

  // ----------------------------------------------------------------
  // History
  // ----------------------------------------------------------------

  async getAssetHistory(assetId: string): Promise<IAssetHistory[]> {
    return this._sp.web.lists
      .getByTitle(HISTORY_LIST)
      .items.filter(`Title eq '${assetId}'`)
      .select('Id', 'Title', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangedByEmail', 'ChangedDate', 'HistoryNotes')
      .orderBy('ChangedDate', false)
      .top(200)();
  }

  private async _logHistory(history: Partial<IAssetHistory>): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(HISTORY_LIST).items.add(history);
    } catch {
      console.warn('[AssetService] History list unavailable, skipping log.');
    }
  }

  // ----------------------------------------------------------------
  // Dashboard & reporting
  // ----------------------------------------------------------------

  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byDept: Record<string, number>;
    warrantyExpiringSoon: number;
  }> {
    try {
      const [all, expiring] = await Promise.all([
        this._sp.web.lists.getByTitle(ASSETS_LIST).items.top(5000)(),
        this.getWarrantyExpiring(90),
      ]);

      const byStatus: Record<string, number> = {};
      const byType:   Record<string, number> = {};
      const byDept:   Record<string, number> = {};

      all.forEach(item => {
        if (item.Status)     byStatus[item.Status]   = (byStatus[item.Status]   || 0) + 1;
        if (item.AssetType)  byType[item.AssetType]  = (byType[item.AssetType]  || 0) + 1;
        if (item.Department) byDept[item.Department] = (byDept[item.Department] || 0) + 1;
      });

      return { total: all.length, byStatus, byType, byDept, warrantyExpiringSoon: expiring.length };
    } catch {
      return { total: 0, byStatus: {}, byType: {}, byDept: {}, warrantyExpiringSoon: 0 };
    }
  }

  async getWarrantyExpiring(days: number = 90): Promise<IAsset[]> {
    try {
      const today  = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      return await this._sp.web.lists.getByTitle(ASSETS_LIST)
        .items.filter(
          `WarrantyExpiry ge '${today.toISOString()}' and WarrantyExpiry le '${future.toISOString()}' and Status eq 'Active'`
        )
        .top(500)();
    } catch {
      return [];
    }
  }

  async getRecentHistory(limit: number = 10): Promise<IAssetHistory[]> {
    return this._sp.web.lists.getByTitle(HISTORY_LIST)
      .items.select('Id', 'Title', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangedDate', 'HistoryNotes')
      .orderBy('ChangedDate', false)
      .top(limit)();
  }

  // ----------------------------------------------------------------
  // People picker helper
  // ----------------------------------------------------------------

  async searchUsers(query: string): Promise<{ displayName: string; email: string }[]> {
    if (!query || query.length < 2) return [];
    try {
      const safe = query.replace(/'/g, "''");
      const results = await this._sp.web.siteUsers
        .filter(`substringof('${safe}', Title) or substringof('${safe}', Email)`)
        .select('Title', 'Email')
        .top(10)();
      return results.map(u => ({ displayName: u.Title, email: u.Email }));
    } catch {
      return [];
    }
  }
}
